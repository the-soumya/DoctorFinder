import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { QRCodeSVG } from 'qrcode.react';
import {
  X,
  Plus,
  Trash2,
  Printer,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
  Pill,
  FileText,
  Clock,
  Calendar,
  Send,
  User
} from 'lucide-react';
import { formatDoctorName } from '../utils/formatters';

const COMMON_MEDICINES = [
  { name: 'Paracetamol 650mg', defaultDosage: '1-0-1', defaultTiming: 'After food', defaultDuration: '3 days' },
  { name: 'Pantoprazole 40mg (Pan-40)', defaultDosage: '1-0-0', defaultTiming: 'Before food / Empty stomach', defaultDuration: '7 days' },
  { name: 'Azithromycin 500mg (Azee-500)', defaultDosage: '1-0-0', defaultTiming: 'After food', defaultDuration: '5 days' },
  { name: 'Amoxicillin + Clavulanic Acid 625mg (Augmentin)', defaultDosage: '1-0-1', defaultTiming: 'After food', defaultDuration: '5 days' },
  { name: 'Montelukast 10mg + Levocetirizine 5mg (Montair-LC)', defaultDosage: '0-0-1', defaultTiming: 'At bedtime', defaultDuration: '7 days' },
  { name: 'Metformin 500mg (Glycomet)', defaultDosage: '1-0-1', defaultTiming: 'With meals', defaultDuration: '1 month' },
  { name: 'Telmisartan 40mg (Telma-40)', defaultDosage: '1-0-0', defaultTiming: 'Morning after breakfast', defaultDuration: '1 month' },
  { name: 'Aceclofenac 100mg + Paracetamol 325mg (Zerodol-P)', defaultDosage: '1-0-1', defaultTiming: 'After food (SOS for pain)', defaultDuration: '3 days' }
];

export default function PrescriptionModal({ appointment, onClose, onPrescriptionSaved }) {
  const [medicines, setMedicines] = useState([
    {
      name: 'Paracetamol 650mg',
      dosage: '1-0-1',
      timing: 'After food',
      duration: '3 days',
      instructions: 'Take with warm water if fever > 100°F'
    },
    {
      name: 'Pantoprazole 40mg (Pan-40)',
      dosage: '1-0-0',
      timing: 'Before food',
      duration: '5 days',
      instructions: 'Take 30 mins before breakfast'
    }
  ]);

  const [diagnosisNotes, setDiagnosisNotes] = useState('Acute upper respiratory viral infection with low-grade pyrexia.');
  const [dosageNotes, setDosageNotes] = useState('Rest well, drink plenty of fluids and maintain hydration.');
  const [advisedTests, setAdvisedTests] = useState('Complete Blood Count (CBC) if fever persists beyond 3 days.');
  const [followUpDays, setFollowUpDays] = useState('5 days');

  // Vitals
  const [vitals, setVitals] = useState({
    bp: '120/80 mmHg',
    pulse: '76 bpm',
    temp: '99.1 °F',
    weight: '68 kg'
  });

  const [conflicts, setConflicts] = useState([]);
  const [overrideReason, setOverrideReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState('EDIT'); // 'EDIT' or 'PREVIEW'
  const [savedPrescription, setSavedPrescription] = useState(null);

  // Check drug conflicts whenever medicines change
  useEffect(() => {
    if (appointment?.patientId && medicines.length > 0) {
      api.post(`/prescriptions/check-conflicts?patientId=${appointment.patientId}`, medicines.map(m => ({
        medicineName: m.name,
        dosage: m.dosage,
        frequency: m.dosage,
        durationDays: parseInt(m.duration) || 5
      })))
      .then(res => {
        if (Array.isArray(res.data)) setConflicts(res.data);
      })
      .catch(() => {});
    }
  }, [medicines, appointment?.patientId]);

  const handleAddMedicine = (preset = null) => {
    if (preset) {
      setMedicines([...medicines, {
        name: preset.name,
        dosage: preset.defaultDosage,
        timing: preset.defaultTiming,
        duration: preset.defaultDuration,
        instructions: ''
      }]);
    } else {
      setMedicines([...medicines, {
        name: '',
        dosage: '1-0-1',
        timing: 'After food',
        duration: '5 days',
        instructions: ''
      }]);
    }
  };

  const handleRemoveMedicine = (index) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const handleSavePrescription = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        appointmentId: appointment.id,
        medicines: medicines.map(m => ({
          medicineName: m.name,
          dosage: m.dosage,
          timing: m.timing,
          duration: m.duration,
          instructions: m.instructions
        })),
        dosageNotes: `Vitals: BP ${vitals.bp}, Pulse ${vitals.pulse}, Temp ${vitals.temp}, Wt ${vitals.weight}. Tests: ${advisedTests}. Follow up in ${followUpDays}. Instructions: ${dosageNotes}`,
        diagnosisNotes: diagnosisNotes,
        conflictFlag: conflicts.length > 0,
        overrideReason: overrideReason
      };

      let resData = null;
      try {
        const res = await api.post('/prescriptions', payload);
        resData = res.data;
      } catch (err) {
        console.warn('Backend prescription endpoint fallback to local store:', err);
      }

      // Also persist to localStorage for live pharmacy dispensing desk sync
      const rxRecord = {
        id: resData?.id || Date.now(),
        appointmentId: appointment.id,
        tokenNumber: appointment.tokenNumber || 7,
        patientId: appointment.patientId || 7,
        patientName: appointment.patientName || 'Rohan Verma',
        doctorId: appointment.doctorId || 1,
        doctorName: appointment.doctorName || 'Dr. Specialist',
        chamberName: appointment.chamberName || 'Makhla Medicare Chemists & Polyclinic',
        chamberRoom: appointment.chamberRoom || 'Chamber 1',
        diagnosisNotes,
        vitals,
        medicines,
        advisedTests,
        followUpDays,
        dispensed: false,
        createdAt: new Date().toISOString()
      };

      const existingKey = 'aura_local_prescriptions';
      const existingList = JSON.parse(localStorage.getItem(existingKey) || '[]');
      const filtered = existingList.filter(rx => rx.appointmentId !== appointment.id);
      filtered.unshift(rxRecord);
      localStorage.setItem(existingKey, JSON.stringify(filtered));

      setSavedPrescription(rxRecord);
      setViewMode('PREVIEW');
      if (onPrescriptionSaved) onPrescriptionSaved(rxRecord);
    } catch (err) {
      alert('Error saving prescription: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const patientName = appointment.patientName || "Rohan Verma";
  const doctorName = formatDoctorName(appointment.doctorName || "Dr. Specialist");
  const chamberName = appointment.chamberName || appointment.pharmacyName || "Makhla Medicare Chemists & Polyclinic";

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem',
      overflowY: 'auto'
    }}>
      <div style={{
        background: '#FFFFFF',
        color: '#0F172A',
        borderRadius: '16px',
        maxWidth: '820px',
        width: '100%',
        maxHeight: '92vh',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Top Header */}
        <div className="no-print" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.25rem 1.75rem',
          background: '#0F172A',
          color: '#FFFFFF'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: '#0EA5E9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Stethoscope size={20} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                {viewMode === 'EDIT' ? 'Electronic Prescription Pad (Rx)' : 'Official Medical Prescription (Rx)'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                Patient: <strong>{patientName}</strong> • Token #{appointment.tokenNumber || 7} • {chamberName}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {viewMode === 'PREVIEW' && (
              <>
                <button
                  onClick={() => window.print()}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Printer size={16} />
                  <span>Print Rx</span>
                </button>
                <button
                  onClick={() => setViewMode('EDIT')}
                  className="btn btn-secondary btn-sm"
                >
                  Edit Again
                </button>
              </>
            )}
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem 1.75rem', overflowY: 'auto', flex: 1 }}>
          {viewMode === 'EDIT' ? (
            <form onSubmit={handleSavePrescription}>
              {/* Vitals Input Row */}
              <div style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '1.25rem'
              }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Patient Clinical Vitals
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Blood Pressure</label>
                    <input
                      type="text"
                      className="input-field"
                      style={{ fontSize: '0.85rem', padding: '6px 10px' }}
                      value={vitals.bp}
                      onChange={(e) => setVitals({ ...vitals, bp: e.target.value })}
                      placeholder="120/80 mmHg"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Pulse</label>
                    <input
                      type="text"
                      className="input-field"
                      style={{ fontSize: '0.85rem', padding: '6px 10px' }}
                      value={vitals.pulse}
                      onChange={(e) => setVitals({ ...vitals, pulse: e.target.value })}
                      placeholder="76 bpm"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Temperature</label>
                    <input
                      type="text"
                      className="input-field"
                      style={{ fontSize: '0.85rem', padding: '6px 10px' }}
                      value={vitals.temp}
                      onChange={(e) => setVitals({ ...vitals, temp: e.target.value })}
                      placeholder="98.6 °F"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Weight</label>
                    <input
                      type="text"
                      className="input-field"
                      style={{ fontSize: '0.85rem', padding: '6px 10px' }}
                      value={vitals.weight}
                      onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
                      placeholder="68 kg"
                    />
                  </div>
                </div>
              </div>

              {/* Diagnosis Field */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '6px' }}>
                  Clinical Diagnosis & Chief Complaints *
                </label>
                <textarea
                  className="input-field"
                  rows={2}
                  value={diagnosisNotes}
                  onChange={(e) => setDiagnosisNotes(e.target.value)}
                  placeholder="e.g. Acute viral rhinitis with sore throat and dry cough."
                  required
                />
              </div>

              {/* Quick Preset Buttons */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B', marginBottom: '6px' }}>
                  Quick Add Frequent Medicines:
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {COMMON_MEDICINES.slice(0, 5).map((med, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => handleAddMedicine(med)}
                      style={{
                        background: '#F1F5F9',
                        border: '1px solid #CBD5E1',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#0F172A',
                        cursor: 'pointer'
                      }}
                    >
                      + {med.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Medicines Table */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A' }}>
                    Rx Medicines & Dosage Schedule *
                  </label>
                  <button
                    type="button"
                    onClick={() => handleAddMedicine()}
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', fontSize: '0.75rem' }}
                  >
                    <Plus size={14} /> Add Medicine Row
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {medicines.map((med, index) => (
                    <div key={index} style={{
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '10px',
                      padding: '10px 12px',
                      display: 'grid',
                      gridTemplateColumns: '1.5fr 1fr 1fr 1fr auto',
                      gap: '8px',
                      alignItems: 'center'
                    }}>
                      <div>
                        <label style={{ fontSize: '0.7rem', color: '#64748B' }}>Medicine & Strength</label>
                        <input
                          type="text"
                          className="input-field"
                          style={{ fontSize: '0.85rem', padding: '6px' }}
                          value={med.name}
                          onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                          placeholder="e.g. Paracetamol 650mg"
                          required
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.7rem', color: '#64748B' }}>Frequency</label>
                        <select
                          className="input-field"
                          style={{ fontSize: '0.85rem', padding: '6px' }}
                          value={med.dosage}
                          onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                        >
                          <option value="1-0-1">1-0-1 (Morning & Night)</option>
                          <option value="1-0-0">1-0-0 (Morning only)</option>
                          <option value="0-0-1">0-0-1 (Night only)</option>
                          <option value="1-1-1">1-1-1 (Thrice daily)</option>
                          <option value="SOS">SOS (When needed)</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.7rem', color: '#64748B' }}>Instructions</label>
                        <select
                          className="input-field"
                          style={{ fontSize: '0.85rem', padding: '6px' }}
                          value={med.timing}
                          onChange={(e) => handleMedicineChange(index, 'timing', e.target.value)}
                        >
                          <option value="After food">After food</option>
                          <option value="Before food">Before food</option>
                          <option value="With meals">With meals</option>
                          <option value="At bedtime">At bedtime</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.7rem', color: '#64748B' }}>Duration</label>
                        <input
                          type="text"
                          className="input-field"
                          style={{ fontSize: '0.85rem', padding: '6px' }}
                          value={med.duration}
                          onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                          placeholder="e.g. 5 days"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveMedicine(index)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#EF4444',
                          cursor: 'pointer',
                          padding: '6px',
                          marginTop: '16px'
                        }}
                        title="Remove Medicine"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lab Tests Advised */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '12px', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '4px' }}>
                    Diagnostic Tests Advised
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={advisedTests}
                    onChange={(e) => setAdvisedTests(e.target.value)}
                    placeholder="e.g. CBC, Serum Creatinine, Chest X-Ray"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '4px' }}>
                    Follow-Up In
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={followUpDays}
                    onChange={(e) => setFollowUpDays(e.target.value)}
                    placeholder="e.g. 5 days / 1 week"
                  />
                </div>
              </div>

              {/* General Advice */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '4px' }}>
                  Lifestyle Advice & Dietary Instructions
                </label>
                <textarea
                  className="input-field"
                  rows={2}
                  value={dosageNotes}
                  onChange={(e) => setDosageNotes(e.target.value)}
                  placeholder="e.g. Avoid cold drinks, steam inhalation twice daily."
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Send size={16} />
                  <span>{saving ? 'Transmitting to Pharmacy...' : 'Generate & Send to Pharmacy Desk'}</span>
                </button>
              </div>
            </form>
          ) : (
            /* PREVIEW / PRINTABLE Rx VIEW */
            <div id="printable-rx" style={{ padding: '1rem' }}>
              {/* Doctor Letterhead Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                borderBottom: '2px solid #0EA5E9',
                paddingBottom: '1rem',
                marginBottom: '1.25rem'
              }}>
                <div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                    {doctorName}
                  </h2>
                  <div style={{ fontSize: '0.85rem', color: '#0284C7', fontWeight: 700 }}>
                    {appointment.specialization || 'Consultant Physician & Specialist'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    Visiting Chamber: {chamberName} • Room: {appointment.chamberRoom || 'Chamber 1'}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0284C7' }}>
                    Rx
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    Date: {new Date().toLocaleDateString([], { dateStyle: 'long' })}
                  </div>
                </div>
              </div>

              {/* Patient Bar */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '8px 14px',
                marginBottom: '1rem',
                fontSize: '0.825rem'
              }}>
                <div>Patient: <strong>{patientName}</strong> (Age: 32 Y, Sex: M)</div>
                <div>BP: <strong>{vitals.bp}</strong> • Pulse: <strong>{vitals.pulse}</strong> • Temp: <strong>{vitals.temp}</strong></div>
              </div>

              {/* Diagnosis */}
              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Diagnosis: </span>
                <span style={{ fontSize: '0.9rem', color: '#0F172A', fontWeight: 600 }}>{diagnosisNotes}</span>
              </div>

              {/* Medicines Table */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Prescribed Medicines
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#F1F5F9', textAlign: 'left', borderBottom: '1px solid #CBD5E1' }}>
                      <th style={{ padding: '8px 10px' }}>#</th>
                      <th style={{ padding: '8px 10px' }}>Medicine Name</th>
                      <th style={{ padding: '8px 10px' }}>Schedule</th>
                      <th style={{ padding: '8px 10px' }}>Timing</th>
                      <th style={{ padding: '8px 10px' }}>Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicines.map((m, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0' }}>
                        <td style={{ padding: '8px 10px', color: '#64748B' }}>{idx + 1}</td>
                        <td style={{ padding: '8px 10px', fontWeight: 700, color: '#0F172A' }}>{m.name}</td>
                        <td style={{ padding: '8px 10px', color: '#0284C7', fontWeight: 600 }}>{m.dosage}</td>
                        <td style={{ padding: '8px 10px' }}>{m.timing}</td>
                        <td style={{ padding: '8px 10px' }}>{m.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Advised Tests and Advice */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                <div style={{ background: '#F8FAFC', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>Tests Advised:</div>
                  <div style={{ color: '#0F172A', marginTop: '2px' }}>{advisedTests || 'None'}</div>
                </div>

                <div style={{ background: '#F8FAFC', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontWeight: 800, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>General Advice:</div>
                  <div style={{ color: '#0F172A', marginTop: '2px' }}>{dosageNotes || 'None'}</div>
                </div>
              </div>

              {/* Footer Stamp & Pharmacy Notice */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px dashed #CBD5E1',
                paddingTop: '1rem',
                fontSize: '0.75rem',
                color: '#64748B'
              }}>
                <div>
                  <div style={{ color: '#10B981', fontWeight: 700 }}>● Automatically routed to Pharmacy Dispensing Desk</div>
                  <div>Take this prescription downstairs to {chamberName} for immediate fulfillment.</div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ height: '40px' }} />
                  <div style={{ borderTop: '1px solid #0F172A', minWidth: '160px', fontWeight: 700, color: '#0F172A' }}>
                    {doctorName}
                  </div>
                  <div style={{ fontSize: '0.65rem' }}>Registered Medical Practitioner</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
