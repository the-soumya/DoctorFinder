import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Stethoscope, 
  Calendar, 
  Clock, 
  Pill, 
  AlertTriangle, 
  CheckCircle, 
  ShieldAlert, 
  Lock, 
  Plus, 
  Trash2, 
  FileText, 
  User, 
  Activity, 
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { formatDoctorName } from '../utils/formatters';

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [selectedApptForPrescription, setSelectedApptForPrescription] = useState(null);
  const [patientAllergies, setPatientAllergies] = useState([]);
  
  // Prescription Form State
  const [medicines, setMedicines] = useState([
    { name: '', dosage: '500mg', frequency: 'Twice daily', duration: '5 days', instructions: 'After meals' }
  ]);
  const [dosageNotes, setDosageNotes] = useState('');
  const [diagnosisNotes, setDiagnosisNotes] = useState('');
  const [conflictResults, setConflictResults] = useState([]);
  const [overrideConflict, setOverrideConflict] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [checkingConflict, setCheckingConflict] = useState(false);
  const [savingPrescription, setSavingPrescription] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const { user } = useAuth();

  useEffect(() => {
    if (user?.doctorId) {
      fetchDoctorAppointments(user.doctorId);
    } else {
      // If doctorId not set directly on login, lookup doctor by user ID
      api.get(`/doctors`)
        .then(res => {
          const matched = res.data.find(d => d.userId === user?.id);
          if (matched) {
            fetchDoctorAppointments(matched.id);
          }
        })
        .catch(err => console.error(err));
    }
  }, [user]);

  const fetchDoctorAppointments = async (docId) => {
    try {
      const res = await api.get(`/appointments/doctor/${docId}`);
      setAppointments(res.data);
    } catch (err) {
      console.error('Failed to load doctor appointments', err);
    }
  };

  const handleOpenPrescriptionModal = async (appt) => {
    setSelectedApptForPrescription(appt);
    setMedicines([{ name: '', dosage: '500mg', frequency: 'Twice daily', duration: '5 days', instructions: 'After meals' }]);
    setDosageNotes('');
    setDiagnosisNotes('');
    setConflictResults([]);
    setOverrideConflict(false);
    setOverrideReason('');

    // Load patient's stored allergy and medication history
    try {
      const res = await api.get(`/allergies/patient/${appt.patientId}`);
      setPatientAllergies(res.data);
    } catch (err) {
      console.error('Failed to load patient allergies', err);
    }
  };

  const handleAddMedicineRow = () => {
    setMedicines(prev => [
      ...prev,
      { name: '', dosage: '500mg', frequency: 'Twice daily', duration: '5 days', instructions: 'After meals' }
    ]);
  };

  const handleRemoveMedicineRow = (index) => {
    setMedicines(prev => prev.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index, field, value) => {
    setMedicines(prev => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  // Quick Conflict Testing Presets for Viva Demonstration
  const handleQuickAddConflictMed = (drugName) => {
    setMedicines(prev => {
      const updated = [...prev];
      if (updated[0].name === '') {
        updated[0].name = drugName;
      } else {
        updated.push({ name: drugName, dosage: '500mg', frequency: 'Twice daily', duration: '5 days', instructions: 'After meals' });
      }
      return updated;
    });
  };

  // Rule-Based Drug Conflict Check
  const handleCheckConflicts = async () => {
    const validMeds = medicines.filter(m => m.name.trim() !== '');
    if (validMeds.length === 0) return;

    setCheckingConflict(true);
    try {
      const res = await api.post(`/prescriptions/check-conflicts?patientId=${selectedApptForPrescription.patientId}`, validMeds);
      setConflictResults(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingConflict(false);
    }
  };

  // Save Prescription
  const handleSavePrescription = async (e) => {
    e.preventDefault();
    const validMeds = medicines.filter(m => m.name.trim() !== '');
    if (validMeds.length === 0) {
      alert('Please add at least one medicine');
      return;
    }

    setSavingPrescription(true);
    try {
      await api.post('/prescriptions', {
        appointmentId: selectedApptForPrescription.id,
        medicines: validMeds,
        dosageNotes,
        diagnosisNotes,
        overrideConflict,
        overrideReason
      });

      setStatusMessage(`Prescription successfully saved and encrypted for ${selectedApptForPrescription.patientName}!`);
      setSelectedApptForPrescription(null);
      if (user?.doctorId) fetchDoctorAppointments(user.doctorId);
    } catch (err) {
      if (err.response?.status === 409) {
        // Conflict was triggered by backend service
        setConflictResults(err.response.data?.details || []);
      } else {
        alert(err.response?.data?.message || 'Failed to save prescription');
      }
    } finally {
      setSavingPrescription(false);
    }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '2rem 1.5rem' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--secondary)', marginBottom: '4px' }}>
            <Stethoscope size={20} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Physician Consultation Console
            </span>
          </div>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 800 }}>Doctor Console</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Assigned patient appointments, medical records, and conflict-checked electronic prescriptions.
          </p>
        </div>

        <Link to="/doctor/profile" className="btn btn-secondary btn-sm" id="btn-goto-doctor-profile">
          <UserCheck size={16} color="var(--secondary)" />
          <span>Doctor Personal Profile</span>
        </Link>
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

      {/* Appointment List Table */}
      <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-xl)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={18} color="var(--primary)" />
          <span>Patient Appointment Schedule ({appointments.length})</span>
        </h2>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 16px' }}>Patient</th>
                <th style={{ padding: '12px 16px' }}>Slot Datetime</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px' }}>Arrival Status</th>
                <th style={{ padding: '12px 16px' }}>Payment</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(appt => (
                <tr key={appt.id} style={{ borderBottom: '1px solid var(--border-subtle)' }} id={`doctor-appt-row-${appt.id}`}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{appt.patientName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{appt.patientEmail} • {appt.patientPhone}</div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 600 }}>{new Date(appt.slotDatetime).toLocaleDateString()}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(appt.slotDatetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span className={`badge badge-${appt.status.toLowerCase()}`}>
                      {appt.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {appt.patientArrivalMarked ? (
                      <span style={{ color: '#34D399', fontSize: '0.8rem', fontWeight: 600 }}>✓ In Waiting Room</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Not Arrived</span>
                    )}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontWeight: 600, color: appt.paymentStatus === 'SUCCESS' ? '#34D399' : '#FBBF24' }}>
                      {appt.paymentStatus || 'PENDING'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleOpenPrescriptionModal(appt)}
                      className="btn btn-primary btn-sm"
                      id={`btn-prescribe-${appt.id}`}
                    >
                      <Pill size={14} />
                      <span>{appt.hasPrescription ? 'Update Prescription' : 'Prescribe Medicine'}</span>
                    </button>
                  </td>
                </tr>
              ))}

              {appointments.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No patient appointments assigned yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRESCRIPTION MODAL WITH DRUG CONFLICT CHECKER */}
      {selectedApptForPrescription && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3000,
          padding: '1rem'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '780px',
            maxHeight: '92vh',
            overflowY: 'auto',
            background: 'var(--bg-surface)',
            padding: '2rem',
            borderRadius: 'var(--radius-xl)'
          }} id="doctor-prescription-modal">
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Electronic Prescription System (e-Rx)
                </span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
                  Patient: {selectedApptForPrescription.patientName}
                </h2>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Appointment ID: #{selectedApptForPrescription.id}
                </div>
              </div>

              <button
                onClick={() => setSelectedApptForPrescription(null)}
                className="btn btn-secondary btn-sm"
                style={{ borderRadius: '50%', width: '36px', height: '36px', padding: 0 }}
              >
                ✕
              </button>
            </div>

            {/* Patient Clinical History & Allergies Card */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              marginBottom: '1.5rem'
            }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Known Allergies & Active Medications on Record:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {patientAllergies.map(allg => (
                  <span
                    key={allg.id}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: allg.allergyName && allg.allergyName !== 'None' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: allg.allergyName && allg.allergyName !== 'None' ? '#FB7185' : '#FBBF24',
                      border: allg.allergyName && allg.allergyName !== 'None' ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)'
                    }}
                  >
                    <ShieldAlert size={13} />
                    <span>
                      {allg.allergyName && allg.allergyName !== 'None' ? `Allergy: ${allg.allergyName}` : `Active Med: ${allg.medicationName}`}
                    </span>
                  </span>
                ))}
                {patientAllergies.length === 0 && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No documented allergies</span>
                )}
              </div>
            </div>

            {/* Quick Demo Test Buttons */}
            <div style={{ marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginRight: '8px' }}>
                Test Conflict Engines:
              </span>
              <div style={{ display: 'inline-flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => handleQuickAddConflictMed('Amoxicillin')}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', borderColor: '#F43F5E', color: '#FB7185' }}
                  title="Triggers Penicillin Allergy conflict"
                >
                  + Add Amoxicillin (Allergy Test)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAddConflictMed('Aspirin')}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', borderColor: '#F59E0B', color: '#FBBF24' }}
                  title="Triggers Warfarin drug interaction"
                >
                  + Add Aspirin (Drug Interaction Test)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAddConflictMed('Paracetamol')}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', color: '#34D399' }}
                >
                  + Add Paracetamol (Safe)
                </button>
              </div>
            </div>

            {/* Prescription Form */}
            <form onSubmit={handleSavePrescription}>
              {/* Medicine Rows */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Prescribed Medicines</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {medicines.map((med, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1fr auto', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Drug name (e.g. Amoxicillin, Paracetamol)"
                        value={med.name}
                        onChange={(e) => handleMedicineChange(idx, 'name', e.target.value)}
                        onBlur={handleCheckConflicts}
                      />
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Dosage (500mg)"
                        value={med.dosage}
                        onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                      />
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Frequency (TDS / BD)"
                        value={med.frequency}
                        onChange={(e) => handleMedicineChange(idx, 'frequency', e.target.value)}
                      />
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Duration (5 days)"
                        value={med.duration}
                        onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                      />
                      {medicines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMedicineRow(idx)}
                          className="btn btn-secondary btn-sm"
                          style={{ color: '#FB7185', padding: '10px' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleAddMedicineRow}
                  className="btn btn-secondary btn-sm"
                  style={{ marginTop: '8px' }}
                >
                  <Plus size={14} />
                  <span>Add Another Medication</span>
                </button>
              </div>

              {/* CONFLICT WARNING BANNER IF DETECTED */}
              {conflictResults.length > 0 && (
                <div style={{
                  background: 'rgba(244, 63, 94, 0.15)',
                  border: '2px solid rgba(244, 63, 94, 0.6)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem',
                  marginBottom: '1.5rem',
                  color: '#FECDD3'
                }} id="drug-conflict-alert-box">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#FB7185', fontWeight: 800, fontSize: '1.1rem', marginBottom: '8px' }}>
                    <ShieldAlert size={24} />
                    <span>CRITICAL CLINICAL CONFLICT DETECTED!</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1rem' }}>
                    {conflictResults.map((c, i) => (
                      <div key={i} style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#FFF' }}>
                          <span>{c.conflictingMedicine} ⚡ {c.matchedEntity}</span>
                          <span className="badge badge-critical">{c.severity}</span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#FDA4AF', marginTop: '4px' }}>
                          {c.warningMessage}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Doctor Confirmation & Override Checkbox */}
                  <div style={{
                    paddingTop: '10px',
                    borderTop: '1px solid rgba(244, 63, 94, 0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', cursor: 'pointer', fontWeight: 600 }}>
                      <input
                        type="checkbox"
                        checked={overrideConflict}
                        onChange={(e) => setOverrideConflict(e.target.checked)}
                        id="checkbox-conflict-override"
                        style={{ width: '18px', height: '18px', accentColor: '#F43F5E' }}
                      />
                      <span>I confirm clinical justification overrides the detected conflict alert</span>
                    </label>

                    {overrideConflict && (
                      <div>
                        <label className="form-label" style={{ color: '#FECDD3' }}>Clinical Rationale / Justification (Logged for Audit)</label>
                        <input
                          type="text"
                          className="form-input"
                          required
                          placeholder="e.g. Monitored in-clinic administration with desensitization protocol..."
                          value={overrideReason}
                          onChange={(e) => setOverrideReason(e.target.value)}
                          id="input-override-reason"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Dosage Notes */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Dosage & Administration Instructions</label>
                <textarea
                  className="form-textarea"
                  rows="2"
                  placeholder="e.g. Drink 2L water daily, complete entire 5-day course..."
                  value={dosageNotes}
                  onChange={(e) => setDosageNotes(e.target.value)}
                />
              </div>

              {/* Diagnosis Notes (AES-256 Encrypted) */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label className="form-label" style={{ margin: 0 }}>
                    Confidential Clinical Diagnosis Notes
                  </label>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#10B981', fontWeight: 600 }}>
                    <Lock size={12} />
                    <span>AES-256 Field-Level Encrypted in DB</span>
                  </span>
                </div>
                <textarea
                  className="form-textarea"
                  rows="3"
                  required
                  placeholder="Confidential diagnostic findings (Encrypted at column level via Java Cipher/AES-256)..."
                  value={diagnosisNotes}
                  onChange={(e) => setDiagnosisNotes(e.target.value)}
                  id="textarea-diagnosis-notes"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedApptForPrescription(null)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={savingPrescription || (conflictResults.length > 0 && !overrideConflict)}
                  id="btn-save-prescription-submit"
                >
                  <Lock size={16} />
                  <span>{savingPrescription ? 'Encrypting & Saving...' : 'Save & Issue Prescription'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
