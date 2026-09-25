import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Calendar, 
  Clock, 
  Pill, 
  ShieldAlert, 
  AlertCircle, 
  CheckCircle, 
  FileText, 
  Plus, 
  Trash2,
  XCircle,
  QrCode,
  User,
  Download,
  Mail,
  X
} from 'lucide-react';
import { formatDoctorName } from '../utils/formatters';

export default function PatientDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [activeTab, setActiveTab] = useState('appointments'); // 'appointments', 'prescriptions', 'allergies'
  const [cancelModalAppt, setCancelModalAppt] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [viewQrAppt, setViewQrAppt] = useState(null);
  const [newAllergy, setNewAllergy] = useState({ allergyName: '', medicationName: '', severity: 'MODERATE', notes: '' });
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  const { user } = useAuth();

  useEffect(() => {
    fetchPatientData();
  }, []);

  const fetchPatientData = async () => {
    setLoading(true);
    try {
      const [apptsRes, presRes, allgRes] = await Promise.all([
        api.get('/appointments/my'),
        api.get('/prescriptions/my'),
        api.get('/allergies/my')
      ]);
      setAppointments(apptsRes.data);
      setPrescriptions(presRes.data);
      setAllergies(allgRes.data);
    } catch (err) {
      console.error('Failed to load patient portal data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!cancelModalAppt || !cancelReason.trim()) return;
    try {
      const res = await api.post(`/appointments/${cancelModalAppt.id}/cancel`, { reason: cancelReason });
      setActionMessage(`Appointment cancelled. Refund status: ${res.data.refundStatus}`);
      setCancelModalAppt(null);
      setCancelReason('');
      fetchPatientData();
    } catch (err) {
      alert(err.response?.data?.message || 'Cancellation failed.');
    }
  };

  const handleAddAllergy = async (e) => {
    e.preventDefault();
    if (!newAllergy.allergyName && !newAllergy.medicationName) return;
    try {
      await api.post('/allergies', newAllergy);
      setNewAllergy({ allergyName: '', medicationName: '', severity: 'MODERATE', notes: '' });
      fetchPatientData();
    } catch (err) {
      alert('Failed to add allergy record');
    }
  };

  const handleDeleteAllergy = async (id) => {
    try {
      await api.delete(`/allergies/${id}`);
      fetchPatientData();
    } catch (err) {
      alert('Failed to remove allergy record');
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.25rem' }}>
            Patient Portal & Appointments
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Welcome back, <strong>{user?.name}</strong>. View your scheduled visits, digital QR passes, and prescriptions.
          </p>
        </div>

        <Link to="/patient/profile" className="btn btn-secondary btn-sm">
          <User size={16} color="var(--primary)" />
          <span>My Health Profile</span>
        </Link>
      </div>

      {actionMessage && (
        <div style={{
          background: '#F0FDF4',
          border: '1px solid #BBF7D0',
          color: '#16A34A',
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle size={18} />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('appointments')}
          className={`btn ${activeTab === 'appointments' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          id="tab-patient-appointments"
        >
          <Calendar size={16} />
          <span>My Appointments ({appointments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('prescriptions')}
          className={`btn ${activeTab === 'prescriptions' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          id="tab-patient-prescriptions"
        >
          <Pill size={16} />
          <span>Prescriptions ({prescriptions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('allergies')}
          className={`btn ${activeTab === 'allergies' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          id="tab-patient-allergies"
        >
          <ShieldAlert size={16} />
          <span>Allergies & Med History ({allergies.length})</span>
        </button>
      </div>

      {/* TAB 1: APPOINTMENTS */}
      {activeTab === 'appointments' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
            {appointments.map(appt => {
              const docName = formatDoctorName(appt.doctorName);
              return (
                <div key={appt.id} className="card" style={{ padding: '1.5rem' }} id={`appt-card-${appt.id}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                        {docName}
                      </h3>
                      <div style={{ fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: 600 }}>
                        {appt.doctorSpecialization}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {appt.departmentName}
                      </div>
                    </div>

                    <span className={`badge ${appt.status === 'CONFIRMED' ? 'badge-success' : appt.status === 'CANCELLED' ? 'badge-danger' : 'badge-warning'}`}>
                      {appt.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={15} color="var(--primary)" />
                      <span>{new Date(appt.slotDatetime).toLocaleDateString()}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={15} color="var(--primary)" />
                      <span>{new Date(appt.slotDatetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div>
                      <strong>Payment:</strong>{' '}
                      <span style={{ color: appt.paymentStatus === 'SUCCESS' ? '#16A34A' : '#D97706', fontWeight: 700 }}>
                        {appt.paymentStatus || 'COMPLETED'}
                      </span>
                    </div>
                    {appt.patientArrivalMarked && (
                      <div style={{ color: '#16A34A', fontSize: '0.8rem', fontWeight: 700 }}>
                        ✓ Checked in at hospital reception
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {appt.status === 'CONFIRMED' && (
                      <>
                        <button
                          onClick={() => setViewQrAppt(appt)}
                          className="btn btn-secondary btn-sm"
                          style={{ flex: 1 }}
                        >
                          <QrCode size={15} color="var(--primary)" />
                          <span>View QR Pass</span>
                        </button>

                        <button
                          onClick={() => setCancelModalAppt(appt)}
                          className="btn btn-secondary btn-sm"
                          style={{ color: '#DC2626', borderColor: '#FECACA' }}
                          id={`btn-cancel-appt-${appt.id}`}
                        >
                          <XCircle size={15} />
                          <span>Cancel</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}

            {appointments.length === 0 && (
              <div className="card" style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)', gridColumn: '1 / -1' }}>
                <p style={{ marginBottom: '1rem' }}>No consultations found.</p>
                <Link to="/doctors" className="btn btn-primary btn-sm">
                  Find Doctors & Book Appointment
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PRESCRIPTIONS */}
      {activeTab === 'prescriptions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {prescriptions.map(pres => (
            <div key={pres.id} className="card" style={{ padding: '1.75rem' }} id={`pres-card-${pres.id}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                    Prescription by {formatDoctorName(pres.doctorName)}
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>
                    {pres.doctorSpecialization} &bull; Issued: {new Date(pres.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <span className={`badge ${pres.dispensed ? 'badge-success' : 'badge-warning'}`}>
                  {pres.dispensed ? 'Dispensed at Pharmacy' : 'Ready for Pickup'}
                </span>
              </div>

              {/* Medicines List */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Prescribed Medicines
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
                  {pres.medicines?.map((med, i) => (
                    <div key={i} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{med.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>{med.dosage} &bull; {med.frequency}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Duration: {med.duration}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Diagnosis notes (Decrypted) */}
              {pres.diagnosisNotes && (
                <div style={{ background: 'var(--bg-elevated)', padding: '12px', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <strong>Doctor's Clinical Notes:</strong> {pres.diagnosisNotes}
                </div>
              )}
            </div>
          ))}

          {prescriptions.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              No prescriptions on file yet.
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ALLERGIES & MEDICATION HISTORY */}
      {activeTab === 'allergies' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* Add New Allergy Form */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem' }}>
              Add Drug Allergy or Ongoing Medication
            </h3>
            <form onSubmit={handleAddAllergy}>
              <div className="form-group">
                <label className="form-label">Drug / Substance Allergy</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Penicillin, Sulfa drugs..."
                  value={newAllergy.allergyName}
                  onChange={e => setNewAllergy({ ...newAllergy, allergyName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Ongoing Regular Medication</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Warfarin, Metformin..."
                  value={newAllergy.medicationName}
                  onChange={e => setNewAllergy({ ...newAllergy, medicationName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Severity Level</label>
                <select
                  className="form-select"
                  value={newAllergy.severity}
                  onChange={e => setNewAllergy({ ...newAllergy, severity: e.target.value })}
                >
                  <option value="MILD">Mild</option>
                  <option value="MODERATE">Moderate</option>
                  <option value="SEVERE">Severe (Anaphylaxis Risk)</option>
                  <option value="HIGH">High Interaction Risk</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Clinical Notes</label>
                <textarea
                  className="form-textarea"
                  rows="2"
                  placeholder="Describe previous reactions or dosage..."
                  value={newAllergy.notes}
                  onChange={e => setNewAllergy({ ...newAllergy, notes: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                <Plus size={16} />
                <span>Save to Medical Profile</span>
              </button>
            </form>
          </div>

          {/* List Allergies */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {allergies.map(item => (
              <div key={item.id} className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <div style={{ fontWeight: 800, fontSize: '1rem' }}>
                    {item.allergyName && item.allergyName !== 'None' ? `Allergy: ${item.allergyName}` : `Ongoing Med: ${item.medicationName}`}
                  </div>
                  <span className={`badge ${item.severity === 'SEVERE' ? 'badge-danger' : 'badge-warning'}`}>
                    {item.severity}
                  </span>
                </div>
                {item.notes && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                    {item.notes}
                  </p>
                )}
                <div style={{ textAlign: 'right' }}>
                  <button
                    onClick={() => handleDeleteAllergy(item.id)}
                    className="btn btn-secondary btn-sm"
                    style={{ color: '#DC2626' }}
                  >
                    <Trash2 size={14} />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ))}

            {allergies.length === 0 && (
              <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                No allergy records recorded.
              </div>
            )}
          </div>
        </div>
      )}

      {/* QR Code Pass Modal */}
      {viewQrAppt && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px', padding: '1.75rem', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ fontWeight: 800, fontSize: '1.15rem' }}>
                Hospital Arrival Check-in Pass
              </div>
              <button
                onClick={() => setViewQrAppt(null)}
                className="btn btn-secondary btn-sm"
                style={{ borderRadius: '50%', width: '32px', height: '32px', padding: 0 }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{
              background: '#FFFFFF',
              padding: '16px',
              borderRadius: 'var(--radius-lg)',
              display: 'inline-block',
              margin: '0 auto 1.25rem',
              boxShadow: 'var(--shadow-md)'
            }}>
              <QRCodeSVG
                value={JSON.stringify({
                  hospital: 'CityHealth Medical Center',
                  appointmentId: viewQrAppt.id,
                  doctor: formatDoctorName(viewQrAppt.doctorName),
                  patientEmail: user?.email,
                  date: viewQrAppt.slotDatetime,
                  status: 'VERIFIED'
                })}
                size={180}
                level="H"
                includeMargin={true}
              />
            </div>

            <div style={{ marginBottom: '1.25rem', textAlign: 'left', background: 'var(--bg-elevated)', padding: '12px 14px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.85rem', marginBottom: '4px' }}>
                <strong>Doctor:</strong> {formatDoctorName(viewQrAppt.doctorName)} ({viewQrAppt.departmentName})
              </div>
              <div style={{ fontSize: '0.85rem', marginBottom: '4px' }}>
                <strong>Appointment Date:</strong> {new Date(viewQrAppt.slotDatetime).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#16A34A', fontWeight: 700 }}>
                ✉️ Emailed to {user?.email || 'patient@health.com'}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                onClick={() => window.print()}
                className="btn btn-secondary btn-sm"
              >
                <Download size={15} />
                <span>Print Pass</span>
              </button>
              <button
                onClick={() => setViewQrAppt(null)}
                className="btn btn-primary btn-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelModalAppt && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Cancel Appointment
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Are you sure you want to cancel your visit with {formatDoctorName(cancelModalAppt.doctorName)}? Full refund will be credited back via Razorpay.
            </p>
            <div className="form-group">
              <label className="form-label">Reason for Cancellation</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Schedule clash, feeling better..."
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                required
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setCancelModalAppt(null)} className="btn btn-secondary btn-sm">
                Keep Appointment
              </button>
              <button onClick={handleCancelAppointment} className="btn btn-danger btn-sm">
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
