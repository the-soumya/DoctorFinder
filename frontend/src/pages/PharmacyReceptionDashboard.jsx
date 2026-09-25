import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Pill, 
  CheckCircle, 
  Clock, 
  UserCheck, 
  CreditCard, 
  Lock, 
  Search, 
  Eye, 
  Calendar, 
  AlertCircle 
} from 'lucide-react';
import { formatDoctorName } from '../utils/formatters';

export default function PharmacyReceptionDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [activeTab, setActiveTab] = useState('pharmacy'); // 'pharmacy', 'reception', 'billing'
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [apptsRes, presRes] = await Promise.all([
        api.get('/appointments'),
        api.get('/prescriptions')
      ]);
      setAppointments(apptsRes.data);
      setPrescriptions(presRes.data);
    } catch (err) {
      console.error('Failed to load pharmacy/reception data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkDispensed = async (prescriptionId) => {
    try {
      await api.post(`/prescriptions/${prescriptionId}/dispense`);
      setStatusMessage('Prescription marked as dispensed by pharmacy.');
      fetchData();
    } catch (err) {
      alert('Failed to mark prescription as dispensed.');
    }
  };

  const handleMarkArrival = async (appointmentId) => {
    try {
      await api.post(`/appointments/${appointmentId}/mark-arrival`);
      setStatusMessage('Patient marked as arrived in waiting area.');
      fetchData();
    } catch (err) {
      alert('Failed to mark patient arrival.');
    }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '2rem 1.5rem' }} className="animate-fade-in">
      {/* Title */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#F59E0B', marginBottom: '4px' }}>
          <Pill size={20} />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Hospital Staff Portal
          </span>
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Pharmacy & Reception Desk</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Dispense medication orders, check in patient physical arrivals, and verify billing status.
        </p>
      </div>

      {statusMessage && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 18px',
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: 'var(--radius-md)',
          color: '#34D399',
          marginBottom: '1.5rem',
          fontSize: '0.9rem'
        }}>
          <CheckCircle size={18} />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '2rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
        <button
          onClick={() => setActiveTab('pharmacy')}
          className={`btn ${activeTab === 'pharmacy' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          id="tab-pharmacy-dispense"
        >
          <Pill size={16} />
          <span>Pharmacy Dispensing Queue ({prescriptions.filter(p => !p.dispensed).length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reception')}
          className={`btn ${activeTab === 'reception' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          id="tab-reception-arrivals"
        >
          <UserCheck size={16} />
          <span>Patient Arrivals & Check-in ({appointments.filter(a => !a.patientArrivalMarked && a.status === 'CONFIRMED').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('billing')}
          className={`btn ${activeTab === 'billing' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          id="tab-billing-overview"
        >
          <CreditCard size={16} />
          <span>Billing Verification</span>
        </button>
      </div>

      {/* TAB 1: PHARMACY DISPENSING */}
      {activeTab === 'pharmacy' && (
        <div>
          {/* Medical Privacy Banner */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            borderRadius: 'var(--radius-md)',
            color: '#C7D2FE',
            marginBottom: '1.5rem',
            fontSize: '0.85rem'
          }}>
            <Lock size={16} />
            <span>
              <strong>RBAC Clinical Privacy Rule Enforced:</strong> Diagnostic medical notes are automatically redacted for Pharmacy/Reception role. Only dispensing instructions and medicine names are visible.
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {prescriptions.map(pres => (
              <div
                key={pres.id}
                className="card"
                style={{ padding: '1.75rem', borderRadius: 'var(--radius-xl)' }}
                id={`pharmacy-pres-row-${pres.id}`}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                      Patient: {pres.patientName}
                    </h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>
                      Prescribed by {formatDoctorName(pres.doctorName)} ({pres.doctorSpecialization}) &bull; Date: {new Date(pres.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className={`badge ${pres.dispensed ? 'badge-confirmed' : 'badge-pending'}`}>
                      {pres.dispensed ? 'DISPENSED' : 'PENDING DISPENSING'}
                    </span>

                    {!pres.dispensed && (
                      <button
                        onClick={() => handleMarkDispensed(pres.id)}
                        className="btn btn-primary btn-sm"
                        id={`btn-dispense-${pres.id}`}
                      >
                        <CheckCircle size={14} />
                        <span>Mark Dispensed</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Medication Items */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    Medication Items to Dispense
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
                    {pres.medicines?.map((med, i) => (
                      <div key={i} style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
                        <div style={{ fontWeight: 800, fontSize: '1rem', color: '#FFF' }}>{med.name}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>{med.dosage} • {med.frequency}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          Duration: {med.duration} | Instructions: {med.instructions}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Masked Diagnosis Notes Display */}
                <div style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px dashed rgba(255, 255, 255, 0.1)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--text-muted)'
                }}>
                  <Lock size={14} color="#FBBF24" />
                  <span>Clinical Medical Notes: {pres.diagnosisNotes}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: RECEPTION & ARRIVALS */}
      {activeTab === 'reception' && (
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-xl)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            Today's Patient Arrival Desk
          </h2>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 16px' }}>Patient</th>
                  <th style={{ padding: '12px 16px' }}>Doctor</th>
                  <th style={{ padding: '12px 16px' }}>Slot Time</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px' }}>Arrival Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Check-In Action</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(appt => (
                  <tr key={appt.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{appt.patientName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{appt.patientPhone}</div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600 }}>{formatDoctorName(appt.doctorName)}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{appt.departmentName}</div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {new Date(appt.slotDatetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className={`badge badge-${appt.status.toLowerCase()}`}>{appt.status}</span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {appt.patientArrivalMarked ? (
                        <span style={{ color: '#34D399', fontWeight: 600 }}>✓ Checked In</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>Awaiting Arrival</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      {!appt.patientArrivalMarked && (
                        <button
                          onClick={() => handleMarkArrival(appt.id)}
                          className="btn btn-secondary btn-sm"
                          id={`btn-mark-arrival-${appt.id}`}
                        >
                          <UserCheck size={14} color="#10B981" />
                          <span>Mark Arrived</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: BILLING STATUS */}
      {activeTab === 'billing' && (
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-xl)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            Hospital Billing & Payment Status Overview
          </h2>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 16px' }}>Appt #</th>
                  <th style={{ padding: '12px 16px' }}>Patient</th>
                  <th style={{ padding: '12px 16px' }}>Doctor</th>
                  <th style={{ padding: '12px 16px' }}>Fee Amount</th>
                  <th style={{ padding: '12px 16px' }}>Razorpay Status</th>
                  <th style={{ padding: '12px 16px' }}>Refund Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(appt => (
                  <tr key={appt.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '14px 16px', fontFamily: 'monospace' }}>#{appt.id}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 600 }}>{appt.patientName}</td>
                    <td style={{ padding: '14px 16px' }}>{formatDoctorName(appt.doctorName)}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 700 }}>₹{appt.consultationFee}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className={`badge badge-${appt.paymentStatus === 'SUCCESS' ? 'confirmed' : 'pending'}`}>
                        {appt.paymentStatus || 'PENDING'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                      {appt.refundStatus || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
