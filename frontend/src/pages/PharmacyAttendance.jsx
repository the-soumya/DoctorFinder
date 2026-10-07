import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_REAL_CHAMBERS, DEFAULT_REAL_DOCTORS, normalizeChamber } from '../data/chambersData';
import {
  UserCheck,
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Users,
  Search,
  Phone,
  Calendar,
  LogOut,
  LogIn,
  ArrowRight,
  RefreshCw,
  QrCode,
  CheckCircle,
  AlertTriangle,
  Stethoscope,
  Pill,
  Timer,
  Tv
} from 'lucide-react';
import { formatDoctorName, formatCurrency } from '../utils/formatters';

export default function PharmacyAttendance() {
  const { user } = useAuth();
  const [pharmacy, setPharmacy] = useState(null);
  const [visitingDoctors, setVisitingDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Quick check-in search
  const [quickCheckInInput, setQuickCheckInInput] = useState('');
  const [patientFilter, setPatientFilter] = useState('ALL'); // 'ALL', 'WAITING', 'WITH_DOCTOR', 'EXITED'

  // Doctor attendance state (doctor attendance map: { doctorId: { status: 'IN' | 'OUT' | 'EXPECTED', time: '10:02 AM', note: '' } })
  const [doctorAttendance, setDoctorAttendance] = useState({});

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      // 1. Fetch pharmacy info
      let currentPharm = null;
      try {
        const pharmRes = await api.get('/pharmacies/my');
        if (pharmRes.data) currentPharm = normalizeChamber(pharmRes.data);
      } catch (e) {
        // Fallback to first chamber in Uttarpara (Makhla Medicare)
        currentPharm = normalizeChamber(DEFAULT_REAL_CHAMBERS[0]);
      }
      if (!currentPharm) currentPharm = normalizeChamber(DEFAULT_REAL_CHAMBERS[0]);
      setPharmacy(currentPharm);

      // 2. Load slots / visiting doctors
      const slots = currentPharm.slots || currentPharm.visitingDoctors || [];
      setVisitingDoctors(slots);

      // 3. Load saved doctor attendance from localStorage or initialize
      const savedDocKey = `aura_doctor_attendance_${currentPharm.id}`;
      const savedDocData = localStorage.getItem(savedDocKey);
      if (savedDocData) {
        try {
          setDoctorAttendance(JSON.parse(savedDocData));
        } catch (e) {}
      } else {
        // Initialize default realistic attendance
        const initial = {};
        slots.forEach((s, idx) => {
          if (idx === 0) {
            initial[s.doctorId] = { status: 'IN', time: '09:55 AM', room: s.chamberRoom, note: 'On Time' };
          } else if (idx === 1) {
            initial[s.doctorId] = { status: 'IN', time: '11:45 AM', room: s.chamberRoom, note: 'On Time' };
          } else {
            initial[s.doctorId] = { status: 'EXPECTED', time: '', room: s.chamberRoom, note: 'Expected at ' + (s.timeSlot?.split('-')[0]?.trim() || 'Scheduled Time') };
          }
        });
        setDoctorAttendance(initial);
      }

      // 4. Fetch appointments for this pharmacy
      try {
        const apptsRes = await api.get('/appointments');
        if (Array.isArray(apptsRes.data)) {
          // Filter or augment appointments with chamber metadata
          const chamberAppts = apptsRes.data.map(a => {
            const docObj = DEFAULT_REAL_DOCTORS.find(d => d.id === a.doctorId) || {};
            const slotObj = slots.find(s => s.doctorId === a.doctorId) || {};
            return {
              ...a,
              doctorName: a.doctorName || docObj.name || 'Specialist',
              doctorSpecialization: a.doctorSpecialization || docObj.specialization || 'Consultant',
              chamberRoom: a.chamberRoom || slotObj.chamberRoom || 'Chamber 1',
              patientPhone: a.patientPhone || a.userPhone || '+91 98111 22233',
              inConsultation: a.inConsultation || false
            };
          });

          if (chamberAppts.length > 0) {
            setAppointments(chamberAppts);
          } else {
            setAppointments(getInitialChamberAppointments(slots));
          }
        } else {
          setAppointments(getInitialChamberAppointments(slots));
        }
      } catch (err) {
        setAppointments(getInitialChamberAppointments(slots));
      }
    } catch (err) {
      console.error('Failed to load attendance data', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper for mock appointments if server list is empty
  const getInitialChamberAppointments = (slots) => {
    const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    return [
      {
        id: 101,
        patientName: 'Rohan Verma',
        patientAge: 32,
        patientGender: 'Male',
        patientPhone: '+91 98111 22233',
        doctorId: slots[0]?.doctorId || 2,
        doctorName: slots[0]?.doctorName || 'Mousumi Dutta',
        doctorSpecialization: slots[0]?.specialization || 'General Physician',
        chamberRoom: slots[0]?.chamberRoom || 'Chamber 2',
        slotDatetime: `${today}, 10:15 AM`,
        status: 'CONFIRMED',
        arrivedAt: '10:05 AM',
        inConsultation: false,
        exitedAt: null
      },
      {
        id: 102,
        patientName: 'Meera Nambiar',
        patientAge: 28,
        patientGender: 'Female',
        patientPhone: '+91 98222 33344',
        doctorId: slots[0]?.doctorId || 2,
        doctorName: slots[0]?.doctorName || 'Mousumi Dutta',
        doctorSpecialization: slots[0]?.specialization || 'General Physician',
        chamberRoom: slots[0]?.chamberRoom || 'Chamber 2',
        slotDatetime: `${today}, 10:45 AM`,
        status: 'CONFIRMED',
        arrivedAt: '10:35 AM',
        inConsultation: true,
        exitedAt: null
      },
      {
        id: 103,
        patientName: 'Debabrata Mukherjee',
        patientAge: 54,
        patientGender: 'Male',
        patientPhone: '+91 98333 44556',
        doctorId: slots[1]?.doctorId || 3,
        doctorName: slots[1]?.doctorName || 'Rupa Sen',
        doctorSpecialization: slots[1]?.specialization || 'Pediatrician',
        chamberRoom: slots[1]?.chamberRoom || 'Chamber 1',
        slotDatetime: `${today}, 12:15 PM`,
        status: 'CONFIRMED',
        arrivedAt: null,
        inConsultation: false,
        exitedAt: null
      },
      {
        id: 104,
        patientName: 'Priya Banerjee',
        patientAge: 41,
        patientGender: 'Female',
        patientPhone: '+91 98444 55667',
        doctorId: slots[0]?.doctorId || 2,
        doctorName: slots[0]?.doctorName || 'Mousumi Dutta',
        doctorSpecialization: slots[0]?.specialization || 'General Physician',
        chamberRoom: slots[0]?.chamberRoom || 'Chamber 2',
        slotDatetime: `${today}, 09:30 AM`,
        status: 'COMPLETED',
        arrivedAt: '09:25 AM',
        inConsultation: false,
        exitedAt: '09:55 AM'
      }
    ];
  };

  // DOCTOR ATTENDANCE ACTIONS
  const updateDoctorStatus = (doctorId, newStatus, note = '') => {
    const timeNow = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    setDoctorAttendance(prev => {
      const updated = {
        ...prev,
        [doctorId]: {
          status: newStatus,
          time: newStatus === 'EXPECTED' ? '' : timeNow,
          note: note || (newStatus === 'IN' ? `Checked in at ${timeNow}` : `Checked out at ${timeNow}`)
        }
      };
      if (pharmacy?.id) {
        localStorage.setItem(`aura_doctor_attendance_${pharmacy.id}`, JSON.stringify(updated));
      }
      return updated;
    });

    const docName = visitingDoctors.find(d => d.doctorId === doctorId)?.doctorName || 'Doctor';
    setStatusMessage(`Dr. ${docName} marked as ${newStatus === 'IN' ? 'IN CHAMBER (Present)' : newStatus === 'OUT' ? 'CHECKED OUT (Departed)' : 'EXPECTED'}.`);
    setTimeout(() => setStatusMessage(''), 4000);
  };

  // PATIENT ATTENDANCE ACTIONS
  const handleMarkPatientArrival = async (apptId) => {
    const timeNow = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    try {
      await api.post(`/appointments/${apptId}/mark-arrival`).catch(() => {});
    } catch (e) {}

    setAppointments(prev => prev.map(a => {
      if (a.id === apptId) {
        return { ...a, arrivedAt: timeNow, status: 'CONFIRMED' };
      }
      return a;
    }));

    setStatusMessage(`Patient #${apptId} marked as ARRIVED (IN Waiting Area).`);
    setTimeout(() => setStatusMessage(''), 4000);
  };

  const handleSendToDoctor = (apptId) => {
    setAppointments(prev => prev.map(a => {
      if (a.id === apptId) {
        return { ...a, inConsultation: true };
      }
      return a;
    }));
    setStatusMessage(`Patient #${apptId} sent into doctor consultation room.`);
    setTimeout(() => setStatusMessage(''), 4000);
  };

  const handleMarkPatientExit = async (apptId) => {
    const timeNow = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    try {
      await api.post(`/appointments/${apptId}/mark-exit`).catch(() => {});
    } catch (e) {}

    setAppointments(prev => prev.map(a => {
      if (a.id === apptId) {
        return {
          ...a,
          inConsultation: false,
          exitedAt: timeNow,
          status: 'COMPLETED'
        };
      }
      return a;
    }));

    setStatusMessage(`Patient #${apptId} marked as EXITED (OUT / Completed).`);
    setTimeout(() => setStatusMessage(''), 4000);
  };

  // Quick check-in search
  const handleQuickCheckIn = (e) => {
    e.preventDefault();
    if (!quickCheckInInput.trim()) return;

    const query = quickCheckInInput.trim().toLowerCase();
    const match = appointments.find(a => 
      String(a.id) === query || 
      (a.patientName && a.patientName.toLowerCase().includes(query)) ||
      (a.patientPhone && a.patientPhone.includes(query))
    );

    if (match) {
      handleMarkPatientArrival(match.id);
      setQuickCheckInInput('');
    } else {
      setErrorMessage(`No appointment found for "${quickCheckInInput}".`);
      setTimeout(() => setErrorMessage(''), 4000);
    }
  };

  // Metrics computation
  const doctorsInCount = visitingDoctors.filter(d => doctorAttendance[d.doctorId]?.status === 'IN').length;
  const patientsWaitingCount = appointments.filter(a => a.arrivedAt && !a.inConsultation && !a.exitedAt).length;
  const patientsInConsultationCount = appointments.filter(a => a.inConsultation && !a.exitedAt).length;
  const patientsExitedCount = appointments.filter(a => a.exitedAt || a.status === 'COMPLETED').length;

  // Filtered patients
  const displayedAppointments = appointments.filter(a => {
    if (patientFilter === 'WAITING') return a.arrivedAt && !a.inConsultation && !a.exitedAt;
    if (patientFilter === 'WITH_DOCTOR') return a.inConsultation && !a.exitedAt;
    if (patientFilter === 'EXITED') return a.exitedAt || a.status === 'COMPLETED';
    return true;
  });

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '2rem 1.5rem' }} className="animate-fade-in">
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '1.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', marginBottom: '4px' }}>
            <UserCheck size={20} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Reception Desk & Queue Control
            </span>
          </div>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 800 }}>Doctor & Patient Attendance Desk</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Real-time tracking of doctor arrival/departure at chambers and live in/out queue flow for visiting patients.
          </p>
        </div>

        {/* Quick Nav Links */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link to="/pharmacy/doctors" className="btn btn-secondary" id="btn-nav-doctors-dir">
            <Users size={16} />
            <span>Doctors Directory & Contacts</span>
          </Link>

          <Link to="/pharmacy/chambers" className="btn btn-secondary" id="btn-nav-chambers">
            <Building2 size={16} />
            <span>Chamber Schedules</span>
          </Link>

          <Link
            to="/chamber/live-display"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            id="btn-nav-live-tv-display"
            style={{
              borderColor: 'rgba(16, 185, 129, 0.4)',
              color: '#10B981',
              background: 'rgba(16, 185, 129, 0.08)'
            }}
          >
            <Tv size={16} color="#10B981" />
            <span>Launch Waiting Lounge TV</span>
          </Link>

          <button
            onClick={fetchAttendanceData}
            className="btn btn-secondary"
            title="Refresh Attendance"
          >
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>
        </div>
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
          <AlertTriangle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Real-time KPI Counters */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        {/* Doctors In */}
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #10B981' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Doctors IN Chamber</span>
            <Stethoscope size={20} color="#10B981" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#10B981' }}>
            {doctorsInCount} / {visitingDoctors.length}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Actively consulting in room</span>
        </div>

        {/* Patients Waiting */}
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #F59E0B' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Patients IN Waiting Lounge</span>
            <Clock size={20} color="#F59E0B" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#F59E0B' }}>
            {patientsWaitingCount}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Arrived & waiting for turn</span>
        </div>

        {/* In Consultation Room */}
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #3B82F6' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>IN with Doctor</span>
            <UserCheck size={20} color="#3B82F6" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#3B82F6' }}>
            {patientsInConsultationCount}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Inside consultation room</span>
        </div>

        {/* Exited / Completed */}
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #6B7280' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Patients Exited (OUT)</span>
            <LogOut size={20} color="#6B7280" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
            {patientsExitedCount}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Completed prescription & departed</span>
        </div>
      </div>

      {/* SECTION 1: VISITING DOCTOR ATTENDANCE (IN / OUT) */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '2.5rem', border: '1px solid var(--border-medium)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase' }}>
              <Stethoscope size={16} />
              <span>Visiting Medical Staff</span>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '2px 0 0 0' }}>
              Doctor Chamber Attendance (In / Out)
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
              Track doctor presence in chamber rooms for patient queue updates and call handling.
            </p>
          </div>

          <div style={{ fontSize: '0.85rem', background: 'var(--bg-elevated)', padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontWeight: 600 }}>
            📍 Chamber: <strong>{pharmacy?.name || 'Makhla Medicare'}</strong>
          </div>
        </div>

        {/* Doctors Attendance Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {visitingDoctors.map(doc => {
            const att = doctorAttendance[doc.doctorId] || { status: 'EXPECTED', time: '', note: '' };
            const isDoctorIn = att.status === 'IN';
            const isDoctorOut = att.status === 'OUT';

            // Find full doctor contact
            const docObj = DEFAULT_REAL_DOCTORS.find(d => d.id === doc.doctorId) || {};
            const contactPhone = docObj.phone || '+91 98311 00000';

            return (
              <div
                key={doc.doctorId || doc.slotId}
                style={{
                  background: 'var(--bg-elevated)',
                  border: isDoctorIn ? '2px solid #10B981' : isDoctorOut ? '1px solid var(--border-subtle)' : '1px dashed var(--border-medium)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
                id={`doc-attendance-${doc.doctorId}`}
              >
                <div>
                  {/* Room & Status Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      background: 'rgba(245, 158, 11, 0.15)',
                      color: '#F59E0B',
                      padding: '3px 10px',
                      borderRadius: '12px',
                      textTransform: 'uppercase'
                    }}>
                      🏢 {doc.chamberRoom || 'Chamber 1'}
                    </span>

                    {/* Attendance Pill */}
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      padding: '3px 12px',
                      borderRadius: '12px',
                      background: isDoctorIn ? 'rgba(16, 185, 129, 0.15)' : isDoctorOut ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: isDoctorIn ? '#10B981' : isDoctorOut ? '#EF4444' : '#F59E0B',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}>
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: isDoctorIn ? '#10B981' : isDoctorOut ? '#EF4444' : '#F59E0B'
                      }}></span>
                      {isDoctorIn ? 'IN CHAMBER' : isDoctorOut ? 'CHECKED OUT' : 'NOT ARRIVED'}
                    </span>
                  </div>

                  {/* Doctor Info */}
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
                    <img
                      src={doc.photoUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400'}
                      alt={doc.doctorName}
                      style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-subtle)' }}
                    />
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>
                        {formatDoctorName(doc.doctorName)}
                      </h3>
                      <div style={{ fontSize: '0.78rem', color: 'var(--secondary)', fontWeight: 600 }}>
                        {doc.specialization}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {doc.degree}
                      </div>
                    </div>
                  </div>

                  {/* Sitting Hours & Contact */}
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'var(--bg-surface)', padding: '8px 10px', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span><strong>⏰ Sitting Hours:</strong></span>
                      <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{doc.timeSlot}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span><strong>📞 Contact:</strong></span>
                      <a href={`tel:${contactPhone}`} style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                        {contactPhone}
                      </a>
                    </div>
                    {att.time && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px dashed var(--border-subtle)', paddingTop: '4px', marginTop: '2px' }}>
                        ⏱ {att.note}
                      </div>
                    )}
                  </div>
                </div>

                {/* Doctor In / Out Buttons */}
                <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => updateDoctorStatus(doc.doctorId, 'IN')}
                    className={`btn btn-sm ${isDoctorIn ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1, justifyContent: 'center', background: isDoctorIn ? '#10B981' : undefined, color: isDoctorIn ? '#FFF' : undefined, borderColor: isDoctorIn ? '#10B981' : undefined }}
                    id={`btn-doctor-in-${doc.doctorId}`}
                  >
                    <LogIn size={14} />
                    <span>Mark Doctor IN</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateDoctorStatus(doc.doctorId, 'OUT')}
                    className={`btn btn-sm ${isDoctorOut ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1, justifyContent: 'center', background: isDoctorOut ? '#6B7280' : undefined, color: isDoctorOut ? '#FFF' : undefined }}
                    id={`btn-doctor-out-${doc.doctorId}`}
                  >
                    <LogOut size={14} />
                    <span>Mark Doctor OUT</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: PATIENT ATTENDANCE (IN / OUT QUEUE) */}
      <div className="card" style={{ padding: '1.5rem', border: '1px solid var(--border-medium)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--secondary)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase' }}>
              <Users size={16} />
              <span>Live Patient Queue</span>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '2px 0 0 0' }}>
              Patient Attendance & Queue Tracker (In / Out)
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
              Mark patient physical check-in arrival (IN), send patient inside consultation room, and record chamber completion exit (OUT).
            </p>
          </div>

          {/* Quick Check-in Input */}
          <form onSubmit={handleQuickCheckIn} style={{ display: 'flex', gap: '8px', minWidth: '320px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Enter Appt ID # or Patient Name..."
              value={quickCheckInInput}
              onChange={(e) => setQuickCheckInInput(e.target.value)}
              style={{ fontSize: '0.85rem' }}
            />
            <button type="submit" className="btn btn-primary btn-sm" style={{ whiteSpace: 'nowrap' }}>
              <UserCheck size={14} />
              <span>Quick Check-In</span>
            </button>
          </form>
        </div>

        {/* Patient Status Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setPatientFilter('ALL')}
            className={`btn btn-xs ${patientFilter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '14px', padding: '4px 12px' }}
          >
            All Appointments ({appointments.length})
          </button>

          <button
            type="button"
            onClick={() => setPatientFilter('WAITING')}
            className={`btn btn-xs ${patientFilter === 'WAITING' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '14px', padding: '4px 12px' }}
          >
            🟡 IN Waiting Lounge ({patientsWaitingCount})
          </button>

          <button
            type="button"
            onClick={() => setPatientFilter('WITH_DOCTOR')}
            className={`btn btn-xs ${patientFilter === 'WITH_DOCTOR' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '14px', padding: '4px 12px' }}
          >
            🔵 Inside with Doctor ({patientsInConsultationCount})
          </button>

          <button
            type="button"
            onClick={() => setPatientFilter('EXITED')}
            className={`btn btn-xs ${patientFilter === 'EXITED' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '14px', padding: '4px 12px' }}
          >
            🟢 Exited / Completed (OUT) ({patientsExitedCount})
          </button>
        </div>

        {/* Patient Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '10px 12px' }}>Token / ID</th>
                <th style={{ padding: '10px 12px' }}>Patient Details</th>
                <th style={{ padding: '10px 12px' }}>Consulting Doctor & Room</th>
                <th style={{ padding: '10px 12px' }}>Scheduled Slot</th>
                <th style={{ padding: '10px 12px' }}>Attendance Status</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Actions (In / Out)</th>
              </tr>
            </thead>
            <tbody>
              {displayedAppointments.map(appt => {
                const isArrived = !!appt.arrivedAt;
                const isInRoom = appt.inConsultation;
                const isExited = !!appt.exitedAt || appt.status === 'COMPLETED';

                return (
                  <tr key={appt.id} style={{ borderBottom: '1px solid var(--border-subtle)' }} id={`patient-row-${appt.id}`}>
                    {/* Token ID */}
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        fontWeight: 800,
                        background: 'var(--primary-subtle)',
                        color: 'var(--primary)',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.8rem'
                      }}>
                        #{appt.id}
                      </span>
                    </td>

                    {/* Patient Details */}
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        {appt.patientName || 'Patient'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {appt.patientAge ? `${appt.patientAge}y &bull; ` : ''}{appt.patientGender || ''} &bull; {appt.patientPhone}
                      </div>
                    </td>

                    {/* Consulting Doctor & Room */}
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {formatDoctorName(appt.doctorName)}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#F59E0B', fontWeight: 700 }}>
                        🏢 {appt.chamberRoom || 'Chamber 1'}
                      </div>
                    </td>

                    {/* Scheduled Slot */}
                    <td style={{ padding: '12px', color: 'var(--text-secondary)', fontSize: '0.825rem' }}>
                      {appt.slotDatetime}
                    </td>

                    {/* Attendance Status */}
                    <td style={{ padding: '12px' }}>
                      {isExited ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(107, 114, 128, 0.15)', color: '#6B7280', padding: '3px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700 }}>
                          <CheckCircle2 size={12} /> OUT (Departed {appt.exitedAt || ''})
                        </span>
                      ) : isInRoom ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6', padding: '3px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700 }}>
                          <Stethoscope size={12} /> IN with Doctor
                        </span>
                      ) : isArrived ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', padding: '3px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700 }}>
                          <Clock size={12} /> IN Waiting Lounge ({appt.arrivedAt})
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'var(--bg-subtle)', color: 'var(--text-muted)', padding: '3px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 600 }}>
                          ⚪ Upcoming (Not Arrived)
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        {!isArrived && !isExited && (
                          <button
                            type="button"
                            onClick={() => handleMarkPatientArrival(appt.id)}
                            className="btn btn-primary btn-xs"
                            title="Mark patient arrival at waiting desk"
                            id={`btn-patient-arrive-${appt.id}`}
                          >
                            <LogIn size={12} />
                            <span>Mark IN (Arrival)</span>
                          </button>
                        )}

                        {isArrived && !isInRoom && !isExited && (
                          <button
                            type="button"
                            onClick={() => handleSendToDoctor(appt.id)}
                            className="btn btn-secondary btn-xs"
                            style={{ borderColor: '#3B82F6', color: '#3B82F6' }}
                            title="Call patient into doctor chamber room"
                            id={`btn-patient-send-in-${appt.id}`}
                          >
                            <ArrowRight size={12} />
                            <span>Call Inside Doctor</span>
                          </button>
                        )}

                        {(isInRoom || isArrived) && !isExited && (
                          <button
                            type="button"
                            onClick={() => handleMarkPatientExit(appt.id)}
                            className="btn btn-secondary btn-xs"
                            style={{ borderColor: '#10B981', color: '#10B981' }}
                            title="Mark consultation completed and patient departed"
                            id={`btn-patient-exit-${appt.id}`}
                          >
                            <LogOut size={12} />
                            <span>Mark OUT (Exit)</span>
                          </button>
                        )}

                        {isExited && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            Completed
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {displayedAppointments.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
            No patient appointments found under this filter.
          </div>
        )}
      </div>
    </div>
  );
}
