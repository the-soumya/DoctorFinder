import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { DEFAULT_REAL_CHAMBERS, DEFAULT_REAL_DOCTORS, normalizeChamber } from '../data/chambersData';
import { useLanguage } from '../context/LanguageContext';
import {
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Clock,
  Building2,
  UserCheck,
  Users,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Bell,
  Stethoscope,
  ArrowRight,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { formatDoctorName } from '../utils/formatters';

export default function ChamberLiveDisplay() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { language, toggleLanguage, t } = useLanguage();

  const [chambersList, setChambersList] = useState(DEFAULT_REAL_CHAMBERS.map(normalizeChamber));
  const initialChamberId = parseInt(searchParams.get('chamberId'), 10) || DEFAULT_REAL_CHAMBERS[0].id;
  const [selectedChamberId, setSelectedChamberId] = useState(initialChamberId);

  const [currentChamber, setCurrentChamber] = useState(DEFAULT_REAL_CHAMBERS[0]);
  const [queue, setQueue] = useState([]);
  const [callingPatient, setCallingPatient] = useState(null);
  const [lastAnnouncedToken, setLastAnnouncedToken] = useState(null);

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Clock timer
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Chambers
  useEffect(() => {
    api.get('/pharmacies')
      .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          const approved = res.data.filter(p => p.isApproved !== false).map(normalizeChamber);
          if (approved.length > 0) setChambersList(approved);
        }
      })
      .catch(() => {});
  }, []);

  // Update current chamber when selectedChamberId changes
  useEffect(() => {
    const found = chambersList.find(c => c.id === selectedChamberId) || chambersList[0];
    setCurrentChamber(found);
    setSearchParams({ chamberId: found.id });
    loadChamberQueue(found);
  }, [selectedChamberId, chambersList]);

  // Load and sync queue
  const loadChamberQueue = async (chamber) => {
    const slots = chamber.slots || chamber.visitingDoctors || [];
    
    // Check localStorage attendance
    const savedDocKey = `aura_doctor_attendance_${chamber.id}`;
    let docAttendance = {};
    try {
      const saved = localStorage.getItem(savedDocKey);
      if (saved) docAttendance = JSON.parse(saved);
    } catch (e) {}

    let chamberAppts = [];
    try {
      const res = await api.get('/appointments');
      if (Array.isArray(res.data)) {
        chamberAppts = res.data.filter(a => a.pharmacyId === chamber.id);
      }
    } catch (e) {}

    // If no backend appointments, create realistic queue for this chamber
    if (chamberAppts.length === 0) {
      const activeSlot = slots[0] || {};
      chamberAppts = [
        {
          id: 101,
          tokenNumber: 7,
          patientName: 'Rohan Verma',
          phone: '+91 98111 22233',
          doctorId: activeSlot.doctorId || 2,
          doctorName: activeSlot.doctorName || 'Mousumi Dutta',
          chamberRoom: activeSlot.chamberRoom || 'Chamber 2',
          status: 'WITH_DOCTOR',
          slotDatetime: new Date().toISOString(),
          timeSlot: activeSlot.timeSlot || '10:00 AM - 12:30 PM'
        },
        {
          id: 102,
          tokenNumber: 8,
          patientName: 'Meera Nambiar',
          phone: '+91 98222 33344',
          doctorId: activeSlot.doctorId || 2,
          doctorName: activeSlot.doctorName || 'Mousumi Dutta',
          chamberRoom: activeSlot.chamberRoom || 'Chamber 2',
          status: 'ARRIVED',
          slotDatetime: new Date().toISOString(),
          timeSlot: activeSlot.timeSlot || '10:00 AM - 12:30 PM'
        },
        {
          id: 103,
          tokenNumber: 9,
          patientName: 'Debanjan Chatterjee',
          phone: '+91 98333 44556',
          doctorId: activeSlot.doctorId || 2,
          doctorName: activeSlot.doctorName || 'Mousumi Dutta',
          chamberRoom: activeSlot.chamberRoom || 'Chamber 2',
          status: 'ARRIVED',
          slotDatetime: new Date().toISOString(),
          timeSlot: activeSlot.timeSlot || '10:00 AM - 12:30 PM'
        },
        {
          id: 104,
          tokenNumber: 10,
          patientName: 'Priya Sen',
          phone: '+91 98444 55667',
          doctorId: slots[1]?.doctorId || 1,
          doctorName: slots[1]?.doctorName || 'Vikram Sharma',
          chamberRoom: slots[1]?.chamberRoom || 'Chamber 1',
          status: 'CONFIRMED',
          slotDatetime: new Date().toISOString(),
          timeSlot: slots[1]?.timeSlot || '07:00 PM - 08:30 PM'
        }
      ];
    }

    // Sort queue by token number
    chamberAppts.sort((a, b) => (a.tokenNumber || 0) - (b.tokenNumber || 0));
    setQueue(chamberAppts);

    // Determine current patient being called / in consultation
    const inDoc = chamberAppts.find(a => a.status === 'WITH_DOCTOR' || a.status === 'CALLING');
    const calling = inDoc || chamberAppts.find(a => a.status === 'ARRIVED') || chamberAppts[0];
    
    if (calling) {
      setCallingPatient(calling);
      // Play audio chime if token changed
      if (soundEnabled && calling.tokenNumber !== lastAnnouncedToken) {
        speakToken(calling);
        setLastAnnouncedToken(calling.tokenNumber);
      }
    }
  };

  // Auto-polling every 6 seconds for live desk updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentChamber) loadChamberQueue(currentChamber);
    }, 6000);
    return () => clearInterval(interval);
  }, [currentChamber, soundEnabled, lastAnnouncedToken]);

  // Audio Text-to-Speech Chime
  const speakToken = (patient) => {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel(); // Stop ongoing speech
      const text = language === 'bn'
        ? `মনোযোগ দিন। টোকেন নম্বর ${patient.tokenNumber}, অনুগ্রহ করে ${patient.chamberRoom || 'চেম্বারে'} প্রবেশ করুন।`
        : `Attention please. Token number ${patient.tokenNumber}. Please proceed to ${patient.chamberRoom || 'the Doctor Chamber'}.`;
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.lang = language === 'bn' ? 'bn-IN' : 'en-IN';
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis warning:', e);
    }
  };

  const handleTestChime = () => {
    if (callingPatient) {
      speakToken(callingPatient);
    } else {
      speakToken({ tokenNumber: 7, chamberRoom: 'Chamber 1' });
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  const nextPatients = queue.filter(
    a => a.tokenNumber !== callingPatient?.tokenNumber && (a.status === 'ARRIVED' || a.status === 'CONFIRMED')
  ).slice(0, 5);

  const completedCount = queue.filter(a => a.status === 'COMPLETED' || a.status === 'EXITED').length;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #090D16 0%, #0F172A 50%, #081225 100%)',
      color: '#F8FAFC',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Top TV Header Bar */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '1rem 1.75rem',
        marginBottom: '1.25rem',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Left: Branding & Chamber Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0EA5E9 0%, #10B981 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)'
          }}>
            <Building2 size={26} color="#FFFFFF" />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: '#10B981',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                background: 'rgba(16, 185, 129, 0.15)',
                padding: '2px 8px',
                borderRadius: '6px'
              }}>
                ● LIVE WAITING LOUNGE DISPLAY
              </span>
              <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>•</span>
              <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{currentChamber.locality}, {currentChamber.city}</span>
            </div>
            
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '2px 0 0 0', letterSpacing: '-0.02em', color: '#FFFFFF' }}>
              {currentChamber.name}
            </h1>
          </div>
        </div>

        {/* Center: Chamber Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: 600 }}>Switch Chamber:</label>
          <select
            value={selectedChamberId}
            onChange={(e) => setSelectedChamberId(parseInt(e.target.value, 10))}
            style={{
              background: '#1E293B',
              color: '#F8FAFC',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '10px',
              padding: '8px 14px',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            {chambersList.map(ch => (
              <option key={ch.id} value={ch.id}>
                {ch.shortName || ch.name} ({ch.locality})
              </option>
            ))}
          </select>
        </div>

        {/* Right: Sound, Language, Clock & Fullscreen Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            style={{
              background: soundEnabled ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              border: soundEnabled ? '1px solid #10B981' : '1px solid #EF4444',
              color: soundEnabled ? '#10B981' : '#EF4444',
              borderRadius: '10px',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.85rem'
            }}
            title={soundEnabled ? 'Chime Sound Enabled' : 'Chime Sound Muted'}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            <span>{soundEnabled ? 'Chime ON' : 'Chime OFF'}</span>
          </button>

          <button
            onClick={handleTestChime}
            style={{
              background: '#1E293B',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#38BDF8',
              borderRadius: '10px',
              padding: '8px 12px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.85rem'
            }}
            title="Test Voice Announcement Chime"
          >
            Test Chime
          </button>

          <button
            onClick={toggleLanguage}
            style={{
              background: '#1E293B',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#F8FAFC',
              borderRadius: '10px',
              padding: '8px 12px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.85rem'
            }}
          >
            {language === 'en' ? 'বাংলা' : 'English'}
          </button>

          {/* Clock */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            padding: '6px 14px',
            textAlign: 'right'
          }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '0.05em', color: '#38BDF8' }}>
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 600 }}>
              {currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>

          <button
            onClick={toggleFullscreen}
            style={{
              background: '#1E293B',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#F8FAFC',
              borderRadius: '10px',
              padding: '10px',
              cursor: 'pointer'
            }}
            title="Toggle TV Fullscreen"
          >
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        </div>
      </header>

      {/* Main Grid: Hero Now Calling + Queue Breakdown */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.25fr 1fr',
        gap: '1.5rem',
        flex: 1
      }}>
        {/* Left Column: Huge LED "NOW CALLING" Display */}
        <div style={{
          background: 'radial-gradient(circle at top, rgba(16, 185, 129, 0.15) 0%, rgba(15, 23, 42, 0.95) 75%)',
          border: '2px solid rgba(16, 185, 129, 0.4)',
          borderRadius: '24px',
          padding: '2.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), inset 0 0 30px rgba(16, 185, 129, 0.1)'
        }}>
          {/* Top Tag */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(16, 185, 129, 0.5)',
              borderRadius: '100px',
              padding: '8px 20px',
              color: '#34D399',
              fontWeight: 800,
              fontSize: '1.1rem',
              letterSpacing: '0.1em'
            }}>
              <span style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: '#10B981',
                boxShadow: '0 0 12px #10B981'
              }} />
              {t('nowCalling')}
            </div>

            <div style={{
              background: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '10px',
              padding: '6px 14px',
              color: '#38BDF8',
              fontSize: '0.85rem',
              fontWeight: 700
            }}>
              {callingPatient?.chamberRoom || 'Chamber 1'}
            </div>
          </div>

          {/* Central Giant Token Number */}
          <div style={{ textAlign: 'center', margin: '2rem 0' }}>
            <div style={{ fontSize: '1rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700 }}>
              {t('tokenNumber')}
            </div>
            
            <div style={{
              fontSize: '8.5rem',
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: '-0.04em',
              background: 'linear-gradient(180deg, #FFFFFF 0%, #34D399 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 40px rgba(16, 185, 129, 0.5)',
              margin: '0.5rem 0'
            }}>
              #{callingPatient ? String(callingPatient.tokenNumber).padStart(2, '0') : '01'}
            </div>

            <div style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: '#F8FAFC',
              letterSpacing: '-0.01em',
              marginBottom: '0.5rem'
            }}>
              {callingPatient ? callingPatient.patientName : 'Walk-in Consultation'}
            </div>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(30, 41, 59, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              padding: '8px 18px',
              fontSize: '1rem',
              fontWeight: 600,
              color: '#E2E8F0'
            }}>
              <Stethoscope size={18} color="#10B981" />
              <span>Consulting with: <strong>{formatDoctorName(callingPatient?.doctorName || 'Attending Specialist')}</strong></span>
            </div>
          </div>

          {/* Bottom Card Summary */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '1.25rem 1.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>
                Assigned Consultation Room
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38BDF8' }}>
                {callingPatient?.chamberRoom || 'Consultation Room A'}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>
                Current Status
              </div>
              <div style={{
                fontSize: '1.1rem',
                fontWeight: 800,
                color: '#34D399',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Activity size={18} className="animate-spin" />
                <span>{t('inConsultation')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Next in Line & Doctors In Chamber Today */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Box 1: Next In Line (Waiting Lounge) */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '20px',
            padding: '1.5rem',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
              paddingBottom: '0.75rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={20} color="#38BDF8" />
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
                  {t('nextInLine')} ({t('waitingInLobby')})
                </h2>
              </div>
              <span style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: 600 }}>
                {nextPatients.length} Waiting
              </span>
            </div>

            {nextPatients.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: '#94A3B8' }}>
                No more waiting patients in lobby. Next walk-in will be called immediately.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {nextPatients.map((p, idx) => (
                  <div key={p.id || idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: idx === 0 ? 'rgba(56, 189, 248, 0.12)' : 'rgba(30, 41, 59, 0.5)',
                    border: idx === 0 ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    padding: '10px 16px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        fontSize: '1.4rem',
                        fontWeight: 900,
                        color: idx === 0 ? '#38BDF8' : '#F8FAFC',
                        minWidth: '50px'
                      }}>
                        #{String(p.tokenNumber).padStart(2, '0')}
                      </div>

                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#FFFFFF' }}>
                          {p.patientName}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                          Doctor: {formatDoctorName(p.doctorName)} • {p.chamberRoom || 'Chamber 1'}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: idx === 0 ? '#38BDF8' : '#10B981',
                        background: idx === 0 ? 'rgba(56, 189, 248, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        display: 'inline-block'
                      }}>
                        {idx === 0 ? 'NEXT IN' : `~${(idx + 1) * 12} mins`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Box 2: Visiting Doctors Status in Chambers Today */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '20px',
            padding: '1.5rem',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
            flex: 1
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
              paddingBottom: '0.75rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Stethoscope size={20} color="#10B981" />
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
                  Visiting Doctors Sitting Today
                </h2>
              </div>
              <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600 }}>
                {currentChamber.operatingHours || '08:00 AM - 10:00 PM'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(currentChamber.slots || currentChamber.visitingDoctors || []).map((slot, idx) => (
                <div key={slot.id || idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(30, 41, 59, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '12px',
                  padding: '10px 14px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'rgba(16, 185, 129, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#10B981',
                      fontWeight: 700,
                      fontSize: '0.85rem'
                    }}>
                      {slot.chamberRoom ? slot.chamberRoom.replace('Chamber ', 'C') : 'C1'}
                    </div>

                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#FFFFFF' }}>
                        {formatDoctorName(slot.doctorName)}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                        {slot.specialization || slot.departmentName} • {slot.timeSlot}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: idx === 0 ? '#10B981' : '#F59E0B',
                    background: idx === 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    padding: '4px 10px',
                    borderRadius: '6px'
                  }}>
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: idx === 0 ? '#10B981' : '#F59E0B'
                    }} />
                    <span>{idx === 0 ? 'IN CHAMBER' : 'EXPECTED'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Live Footer Bar */}
      <footer style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '1.25rem',
        padding: '0.75rem 1.5rem',
        background: 'rgba(15, 23, 42, 0.6)',
        borderRadius: '12px',
        fontSize: '0.85rem',
        color: '#94A3B8'
      }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <span>Consultations Completed Today: <strong style={{ color: '#F8FAFC' }}>{completedCount} Patients</strong></span>
          <span>•</span>
          <span>Max Capacity per Sitting: <strong style={{ color: '#F8FAFC' }}>25 Tokens</strong></span>
          <span>•</span>
          <span>Desk Reception: <strong style={{ color: '#F8FAFC' }}>{currentChamber.phone || '+91 98311 55667'}</strong></span>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link to="/" style={{ color: '#38BDF8', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem' }}>
            ← Return to Portal
          </Link>
          <span>•</span>
          <Link to="/pharmacy/attendance" style={{ color: '#10B981', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem' }}>
            Receptionist In/Out Desk →
          </Link>
        </div>
      </footer>
    </div>
  );
}
