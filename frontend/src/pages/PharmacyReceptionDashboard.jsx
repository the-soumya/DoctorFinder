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
  AlertCircle,
  QrCode,
  LogOut,
  PlusCircle,
  Trash2,
  Building2,
  Stethoscope,
  ShieldCheck,
  UserPlus
} from 'lucide-react';
import { formatDoctorName, formatCurrency } from '../utils/formatters';

export default function PharmacyReceptionDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [pharmacy, setPharmacy] = useState(null);
  const [chamberSlots, setChamberSlots] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [activeTab, setActiveTab] = useState('appointments'); // 'appointments', 'doctors', 'pharmacy', 'billing'
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // QR / Receipt code input
  const [qrCodeInput, setQrCodeInput] = useState('');
  const [qrVerificationResult, setQrVerificationResult] = useState(null);

  // Add doctor slot state
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [addDoctorForm, setAddDoctorForm] = useState({
    doctorId: '',
    availableDays: 'Mon, Wed, Fri',
    timeSlot: '07:00 PM - 08:30 PM',
    chamberRoom: 'Chamber 1',
    consultationFee: '600',
    maxTokens: '20'
  });

  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch appointments & prescriptions
      const [apptsRes, presRes, docsRes] = await Promise.all([
        api.get('/appointments'),
        api.get('/prescriptions'),
        api.get('/doctors').catch(() => ({ data: [] }))
      ]);
      setAppointments(apptsRes.data || []);
      setPrescriptions(presRes.data || []);
      setAllDoctors(docsRes.data || []);

      // 2. Fetch logged-in pharmacy profile
      try {
        const pharmRes = await api.get('/pharmacies/my');
        if (pharmRes.data) {
          setPharmacy(pharmRes.data);
          // Fetch slots for this pharmacy
          const slotsRes = await api.get(`/pharmacies/${pharmRes.data.id}/slots`);
          setChamberSlots(slotsRes.data || []);
        }
      } catch (err) {
        // If not found, fetch all pharmacies and pick matching or first
        const allPharmsRes = await api.get('/pharmacies');
        if (allPharmsRes.data && allPharmsRes.data.length > 0) {
          const match = allPharmsRes.data[0];
          setPharmacy(match);
          const slotsRes = await api.get(`/pharmacies/${match.id}/slots`);
          setChamberSlots(slotsRes.data || []);
        }
      }
    } catch (err) {
      console.error('Failed to load pharmacy/reception data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleValidateQr = async (appointmentIdToUse) => {
    const apptId = appointmentIdToUse || extractAppointmentId(qrCodeInput);
    if (!apptId) {
      setErrorMessage('Please enter a valid Appointment ID or scan a QR Pass.');
      return;
    }

    try {
      setErrorMessage('');
      const res = await api.post(`/appointments/${apptId}/validate-qr`);
      setStatusMessage(`QR Pass Validated! ${res.data.patientName || 'Patient'} marked as arrived in chamber.`);
      setQrVerificationResult(res.data);
      setQrCodeInput('');
      fetchData();
      setTimeout(() => setStatusMessage(''), 5000);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to validate QR Pass. Check appointment ID.');
    }
  };

  const handleMarkExit = async (appointmentId) => {
    try {
      setErrorMessage('');
      await api.post(`/appointments/${appointmentId}/mark-exit`);
      setStatusMessage(`Patient exit confirmed and appointment marked completed.`);
      fetchData();
      setTimeout(() => setStatusMessage(''), 4000);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to mark patient exit.');
    }
  };

  const extractAppointmentId = (input) => {
    if (!input) return null;
    const trimmed = input.trim();
    // If integer
    if (/^\d+$/.test(trimmed)) return parseInt(trimmed, 10);
    // If format AURA-CHK-12-xxxx
    const match = trimmed.match(/AURA-CHK-(\d+)/i);
    if (match) return parseInt(match[1], 10);
    // If JSON QR code payload
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed.appointmentId) return parsed.appointmentId;
    } catch (e) {}
    return null;
  };

  const handleMarkArrival = async (appointmentId) => {
    try {
      await api.post(`/appointments/${appointmentId}/mark-arrival`);
      setStatusMessage('Patient marked as arrived in waiting area.');
      fetchData();
      setTimeout(() => setStatusMessage(''), 4000);
    } catch (err) {
      alert('Failed to mark patient arrival.');
    }
  };

  const handleMarkDispensed = async (prescriptionId) => {
    try {
      await api.post(`/prescriptions/${prescriptionId}/dispense`);
      setStatusMessage('Prescription marked as dispensed by pharmacy.');
      fetchData();
      setTimeout(() => setStatusMessage(''), 4000);
    } catch (err) {
      alert('Failed to mark prescription as dispensed.');
    }
  };

  const handleRemoveDoctorSlot = async (slotId, doctorName) => {
    if (!window.confirm(`Are you sure you want to remove Dr. ${doctorName} from this chamber?`)) return;
    try {
      await api.delete(`/pharmacies/slots/${slotId}`);
      setStatusMessage(`Doctor removed from this chamber schedule.`);
      if (pharmacy?.id) {
        const slotsRes = await api.get(`/pharmacies/${pharmacy.id}/slots`);
        setChamberSlots(slotsRes.data || []);
      }
      setTimeout(() => setStatusMessage(''), 4000);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to remove doctor.');
    }
  };

  const handleAddDoctorSlot = async (e) => {
    e.preventDefault();
    if (!pharmacy?.id || !addDoctorForm.doctorId) {
      alert('Please select a doctor to assign to this chamber.');
      return;
    }

    try {
      await api.post(`/pharmacies/${pharmacy.id}/doctors`, {
        doctorId: parseInt(addDoctorForm.doctorId, 10),
        availableDays: addDoctorForm.availableDays,
        timeSlot: addDoctorForm.timeSlot,
        chamberRoom: addDoctorForm.chamberRoom,
        consultationFee: parseFloat(addDoctorForm.consultationFee),
        maxTokens: parseInt(addDoctorForm.maxTokens, 10)
      });
      setStatusMessage('Doctor successfully assigned to this chamber with designated sitting time!');
      setShowAddDoctorModal(false);
      const slotsRes = await api.get(`/pharmacies/${pharmacy.id}/slots`);
      setChamberSlots(slotsRes.data || []);
      setTimeout(() => setStatusMessage(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign doctor. Note: Max 2 slots per doctor allowed in one chamber.');
    }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '2rem 1.5rem' }} className="animate-fade-in">
      {/* Title */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10B981', marginBottom: '4px' }}>
          <Building2 size={20} />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Visiting Chamber & Pharmacy Operations
          </span>
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>
          {pharmacy ? pharmacy.name : 'Pharmacy & Chamber Reception Desk'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          {pharmacy ? `${pharmacy.address} • Phone: ${pharmacy.phone}` : 'Validate patient QR passes on entry and exit, manage visiting doctors, and dispense prescriptions.'}
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

      {errorMessage && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 18px',
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 'var(--radius-md)',
          color: '#F87171',
          marginBottom: '1.5rem',
          fontSize: '0.9rem'
        }}>
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '2rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('appointments')}
          className={`btn ${activeTab === 'appointments' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          id="tab-chamber-appointments"
        >
          <QrCode size={16} />
          <span>Chamber Appointments & QR Check-in ({appointments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('doctors')}
          className={`btn ${activeTab === 'doctors' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          id="tab-chamber-doctors"
        >
          <Stethoscope size={16} />
          <span>Visiting Doctors & Sittings ({chamberSlots.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pharmacy')}
          className={`btn ${activeTab === 'pharmacy' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          id="tab-pharmacy-dispense"
        >
          <Pill size={16} />
          <span>Medication Dispensing ({prescriptions.filter(p => !p.dispensed).length})</span>
        </button>

        <button
          onClick={() => setActiveTab('billing')}
          className={`btn ${activeTab === 'billing' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          id="tab-billing-overview"
        >
          <CreditCard size={16} />
          <span>Billing Overview</span>
        </button>
      </div>

      {/* TAB 1: CHAMBER APPOINTMENTS & QR VALIDATION */}
      {activeTab === 'appointments' && (
        <div>
          {/* QR Pass / Digital Receipt Scanner Box */}
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1.75rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-medium)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem', color: 'var(--primary)' }}>
              <QrCode size={20} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                Instant QR Code & Digital Receipt Scanner
              </h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
              Scan or enter the patient's digital QR Pass code (e.g. <code>AURA-CHK-1-...</code>) or Appointment # upon chamber arrival or exit.
            </p>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Scan / Enter Pass Code or Appointment # (e.g. AURA-CHK-1-29402 or 1)"
                value={qrCodeInput}
                onChange={e => setQrCodeInput(e.target.value)}
                style={{ flex: 1, minWidth: '260px' }}
                id="input-qr-scanner-code"
              />
              <button
                onClick={() => handleValidateQr()}
                className="btn btn-primary"
                id="btn-validate-qr-arrival"
              >
                <UserCheck size={16} />
                <span>Validate QR & Mark Arrival</span>
              </button>
            </div>
          </div>

          {/* Appointments Table */}
          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                Patient Chamber Appointments & Physical Tracking
              </h2>
              <span className="badge badge-confirmed">
                {appointments.filter(a => a.status === 'CONFIRMED').length} Confirmed
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '12px 14px' }}>Appt #</th>
                    <th style={{ padding: '12px 14px' }}>Patient</th>
                    <th style={{ padding: '12px 14px' }}>Visiting Doctor</th>
                    <th style={{ padding: '12px 14px' }}>Chamber Room & Slot</th>
                    <th style={{ padding: '12px 14px' }}>Arrival Status</th>
                    <th style={{ padding: '12px 14px' }}>Exit Status</th>
                    <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map(appt => (
                    <tr key={appt.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '14px', fontFamily: 'monospace', fontWeight: 700 }}>
                        #{appt.id}
                      </td>
                      <td style={{ padding: '14px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{appt.patientName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{appt.patientPhone || appt.patientEmail}</div>
                      </td>
                      <td style={{ padding: '14px' }}>
                        <div style={{ fontWeight: 600 }}>{formatDoctorName(appt.doctorName)}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>{appt.departmentName}</div>
                      </td>
                      <td style={{ padding: '14px' }}>
                        <div style={{ fontWeight: 600 }}>{appt.chamberName || 'Chamber 1'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(appt.slotDatetime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </div>
                      </td>
                      <td style={{ padding: '14px' }}>
                        {appt.patientArrivalMarked ? (
                          <span style={{ color: '#10B981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle size={14} /> In-Chamber
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            Awaiting Arrival
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '14px' }}>
                        {appt.patientExitMarked ? (
                          <span style={{ color: '#06B6D4', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle size={14} /> Completed & Exited
                          </span>
                        ) : appt.patientArrivalMarked ? (
                          <span style={{ color: '#F59E0B', fontWeight: 600, fontSize: '0.85rem' }}>
                            In Consultation
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>-</span>
                        )}
                      </td>
                      <td style={{ padding: '14px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          {!appt.patientArrivalMarked && (
                            <button
                              onClick={() => handleValidateQr(appt.id)}
                              className="btn btn-secondary btn-sm"
                              title="Validate QR / Check in"
                            >
                              <UserCheck size={14} color="#10B981" />
                              <span>Check-In</span>
                            </button>
                          )}

                          {appt.patientArrivalMarked && !appt.patientExitMarked && (
                            <button
                              onClick={() => handleMarkExit(appt.id)}
                              className="btn btn-primary btn-sm"
                              title="Confirm patient exit from chamber"
                            >
                              <LogOut size={14} />
                              <span>Mark Exit</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VISITING DOCTORS & SITTINGS (ADD / REMOVE DOCTORS) */}
      {activeTab === 'doctors' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>
                Visiting Doctors at {pharmacy?.name || 'this Chamber'}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Rule: A doctor can have a maximum of 2 sitting time slots per chamber. Multiple doctors can sit across the day.
              </p>
            </div>

            <button
              onClick={() => setShowAddDoctorModal(true)}
              className="btn btn-primary btn-sm"
              id="btn-add-visiting-doctor"
            >
              <UserPlus size={16} />
              <span>Assign New Visiting Doctor</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {chamberSlots.map(slot => (
              <div key={slot.id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '1rem' }}>
                    <img
                      src={slot.doctorPhotoUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400'}
                      alt={slot.doctorName}
                      style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-subtle)' }}
                    />
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                        {formatDoctorName(slot.doctorName)}
                      </h3>
                      <div style={{ fontSize: '0.8rem', color: 'var(--secondary)', fontWeight: 600 }}>
                        {slot.doctorSpecialization}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {slot.chamberRoom || 'Chamber 1'}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    background: 'var(--bg-elevated)',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sitting Time:</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>{slot.timeSlot}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Available Days:</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{slot.availableDays}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Consultation Fee:</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>₹{slot.consultationFee}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                  <button
                    onClick={() => handleRemoveDoctorSlot(slot.id, slot.doctorName)}
                    className="btn btn-secondary btn-sm"
                    style={{ color: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                  >
                    <Trash2 size={14} />
                    <span>Remove Doctor from Chamber</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Modal to Assign Doctor */}
          {showAddDoctorModal && (
            <div className="modal-overlay">
              <div className="modal-content" style={{ maxWidth: '520px', padding: '1.75rem' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                  Assign Visiting Doctor to Chamber
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                  Select an approved physician and configure their designated sitting schedule for this chamber.
                </p>

                <form onSubmit={handleAddDoctorSlot}>
                  <div className="form-group">
                    <label className="form-label">Select Doctor</label>
                    <select
                      className="form-select"
                      value={addDoctorForm.doctorId}
                      onChange={e => {
                        const docId = e.target.value;
                        const docObj = allDoctors.find(d => d.id === parseInt(docId, 10));
                        setAddDoctorForm(prev => ({
                          ...prev,
                          doctorId: docId,
                          consultationFee: docObj ? docObj.consultationFee : prev.consultationFee
                        }));
                      }}
                      required
                    >
                      <option value="">-- Select Doctor --</option>
                      {allDoctors.map(d => (
                        <option key={d.id} value={d.id}>
                          {formatDoctorName(d.name)} ({d.specialization} - {d.city || 'Local'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div className="form-group">
                      <label className="form-label">Visiting Days</label>
                      <input
                        type="text"
                        className="form-input"
                        value={addDoctorForm.availableDays}
                        onChange={e => setAddDoctorForm({ ...addDoctorForm, availableDays: e.target.value })}
                        placeholder="e.g. Mon, Wed, Fri"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Sitting Time Slot</label>
                      <input
                        type="text"
                        className="form-input"
                        value={addDoctorForm.timeSlot}
                        onChange={e => setAddDoctorForm({ ...addDoctorForm, timeSlot: e.target.value })}
                        placeholder="e.g. 07:00 PM - 08:30 PM"
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    <div className="form-group">
                      <label className="form-label">Chamber Room</label>
                      <input
                        type="text"
                        className="form-input"
                        value={addDoctorForm.chamberRoom}
                        onChange={e => setAddDoctorForm({ ...addDoctorForm, chamberRoom: e.target.value })}
                        placeholder="Chamber 1"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Fee (₹)</label>
                      <input
                        type="number"
                        className="form-input"
                        value={addDoctorForm.consultationFee}
                        onChange={e => setAddDoctorForm({ ...addDoctorForm, consultationFee: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Max Tokens</label>
                      <input
                        type="number"
                        className="form-input"
                        value={addDoctorForm.maxTokens}
                        onChange={e => setAddDoctorForm({ ...addDoctorForm, maxTokens: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '1.25rem' }}>
                    <button
                      type="button"
                      onClick={() => setShowAddDoctorModal(false)}
                      className="btn btn-secondary"
                      style={{ flex: 1 }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{ flex: 1 }}
                    >
                      Assign Doctor
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PHARMACY DISPENSING */}
      {activeTab === 'pharmacy' && (
        <div>
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

      {/* TAB 4: BILLING OVERVIEW */}
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
