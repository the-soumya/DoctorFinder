import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import SlotBookingModal from '../components/SlotBookingModal';
import { DEFAULT_REAL_CHAMBERS, DEFAULT_REAL_DOCTORS, normalizeChamber } from '../data/chambersData';
import { 
  Heart, 
  MapPin, 
  Bot, 
  FileText, 
  ShieldCheck, 
  ArrowRight, 
  Calendar,
  Stethoscope,
  Clock,
  Star,
  QrCode,
  UserCheck,
  Building2,
  Search,
  Filter,
  CheckCircle2,
  Phone,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { formatDoctorName, formatCurrency } from '../utils/formatters';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [allDoctors, setAllDoctors] = useState(DEFAULT_REAL_DOCTORS);
  const [pharmacies, setPharmacies] = useState(DEFAULT_REAL_CHAMBERS.map(normalizeChamber));
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedChamberName, setSelectedChamberName] = useState('All');
  const [chamberSearch, setChamberSearch] = useState('');
  const [doctorSearch, setDoctorSearch] = useState('');
  const [bookingDoctor, setBookingDoctor] = useState(null);

  const handleBookDoctor = (doc) => {
    if (!user) {
      navigate('/login', {
        state: {
          returnUrl: '/',
          message: `Please sign in or create an account to book an appointment with ${formatDoctorName(doc?.name)}.`
        }
      });
      return;
    }
    setBookingDoctor(doc);
  };

  const handleBookSlotForDoctor = (pharmacy, slot) => {
    let docObj = allDoctors.find(d => d.id === slot.doctorId);
    if (!docObj) {
      docObj = {
        id: slot.doctorId,
        name: slot.doctorName,
        specialization: slot.specialization || slot.doctorSpecialization || 'Specialist',
        degree: slot.degree || 'MBBS, MD',
        photoUrl: slot.photoUrl || slot.doctorPhotoUrl,
        consultationFee: slot.consultationFee,
        city: pharmacy.city,
        locality: pharmacy.locality,
        clinicAddress: `${pharmacy.name}, ${pharmacy.address}`
      };
    }
    handleBookDoctor(docObj);
  };

  const handleBookChamber = (pharmacy) => {
    const slots = pharmacy.slots || pharmacy.visitingDoctors || [];
    if (slots.length > 0) {
      handleBookSlotForDoctor(pharmacy, slots[0]);
    } else {
      if (!user) {
        navigate('/login', {
          state: {
            returnUrl: '/',
            message: `Please sign in or create an account to book an appointment at ${pharmacy?.name || 'this chamber'}.`
          }
        });
        return;
      }
    }
  };

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      api.get('/doctors').catch(() => ({ data: [] })),
      api.get('/pharmacies').catch(() => ({ data: [] }))
    ]).then(([docRes, pharmRes]) => {
      if (isMounted) {
        if (Array.isArray(docRes.data) && docRes.data.length > 0) {
          setAllDoctors(docRes.data);
        }
        if (Array.isArray(pharmRes.data) && pharmRes.data.length > 0) {
          const approved = pharmRes.data.filter(p => p.isApproved !== false).map(normalizeChamber);
          if (approved.length > 0) {
            setPharmacies(approved);
          }
        }
      }
    }).finally(() => {
      if (isMounted) setLoading(false);
    });

    return () => { isMounted = false; };
  }, []);

  // Filtered pharmacies by city, chamber name, and search
  const filteredPharmacies = pharmacies.filter(p => {
    const matchesCity = selectedCity === 'All' || (p.city && p.city.toLowerCase() === selectedCity.toLowerCase());
    const matchesChamber = selectedChamberName === 'All' || 
      p.name === selectedChamberName || 
      p.shortName === selectedChamberName ||
      (selectedChamberName && p.name.toLowerCase().includes(selectedChamberName.toLowerCase()));
    const matchesSearch = !chamberSearch || 
      p.name.toLowerCase().includes(chamberSearch.toLowerCase()) ||
      (p.locality && p.locality.toLowerCase().includes(chamberSearch.toLowerCase())) ||
      (p.address && p.address.toLowerCase().includes(chamberSearch.toLowerCase())) ||
      (p.shortName && p.shortName.toLowerCase().includes(chamberSearch.toLowerCase()));
    return matchesCity && matchesChamber && matchesSearch;
  });

  // Filtered doctors by search, city, and selected chamber
  const filteredDoctors = allDoctors.filter(d => {
    const matchesCity = selectedCity === 'All' || (d.city && d.city.toLowerCase() === selectedCity.toLowerCase());
    const matchesSearch = !doctorSearch || 
      (d.name && d.name.toLowerCase().includes(doctorSearch.toLowerCase())) ||
      (d.specialization && d.specialization.toLowerCase().includes(doctorSearch.toLowerCase())) ||
      (d.locality && d.locality.toLowerCase().includes(doctorSearch.toLowerCase())) ||
      (d.departmentName && d.departmentName.toLowerCase().includes(doctorSearch.toLowerCase()));
    
    // If a chamber is selected, filter doctors who sit at this chamber
    let matchesChamber = true;
    if (selectedChamberName !== 'All') {
      const activePharm = pharmacies.find(p => p.name === selectedChamberName || p.shortName === selectedChamberName);
      if (activePharm && activePharm.slots && activePharm.slots.length > 0) {
        matchesChamber = activePharm.slots.some(s => s.doctorId === d.id);
      }
    }

    return matchesCity && matchesSearch && matchesChamber;
  });

  const cities = ['All', 'Uttarpara', 'Konnagar', 'Howrah', 'Kolkata'];

  return (
    <div className="container" style={{ padding: '3rem 1.25rem' }}>
      {/* Hero Banner */}
      <div style={{ textAlign: 'center', maxWidth: '880px', margin: '0 auto 3.5rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          background: 'var(--primary-subtle)',
          borderRadius: 'var(--radius-full)',
          color: 'var(--primary)',
          fontSize: '0.85rem',
          fontWeight: 700,
          marginBottom: '1.25rem'
        }}>
          <Heart size={16} fill="var(--primary)" />
          <span>Doctor Consultation & Outpatient Pharmacy Chambers</span>
        </div>

        <h1 style={{
          fontSize: '3rem',
          fontWeight: 800,
          lineHeight: 1.2,
          marginBottom: '1.25rem',
          color: 'var(--text-primary)'
        }}>
          Book Visiting Doctors Across City Pharmacy Chambers
        </h1>

        <p style={{
          fontSize: '1.1rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          marginBottom: '2rem'
        }}>
          In Uttarpara and neighboring cities, doctors sit at local pharmacies like <strong>Makhla Medicare</strong>, <strong>Bhadrakali Polyclinic</strong>, and <strong>Kotrung Health Point</strong> at designated hours. Choose your doctor according to their sitting schedule, get instant QR check-in, and bypass waiting queues.
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
          {user?.role === 'ROLE_DOCTOR' ? (
            <>
              <Link to="/doctor/dashboard" className="btn btn-primary btn-lg" id="btn-hero-doctor-console">
                <Stethoscope size={20} />
                <span>Open Doctor Console</span>
                <ArrowRight size={18} />
              </Link>
              <Link to="/doctor/patients" className="btn btn-secondary btn-lg" id="btn-hero-doctor-patients">
                <UserCheck size={20} color="var(--primary)" />
                <span>Patient Clinical Directory</span>
              </Link>
            </>
          ) : user?.role === 'ROLE_ADMIN' ? (
            <>
              <Link to="/admin/analytics" className="btn btn-primary btn-lg" id="btn-hero-admin-analytics">
                <ShieldCheck size={20} />
                <span>Admin Analytics & KPI</span>
                <ArrowRight size={18} />
              </Link>
              <Link to="/admin/audit-logs" className="btn btn-secondary btn-lg" id="btn-hero-admin-audit">
                <FileText size={20} color="var(--primary)" />
                <span>Platform Overseer & Audit</span>
              </Link>
            </>
          ) : user?.role === 'ROLE_PHARMACIST_RECEPTIONIST' ? (
            <>
              <Link to="/pharmacy/dashboard" className="btn btn-primary btn-lg" id="btn-hero-pharmacy-desk">
                <Clock size={20} />
                <span>Chamber Reception & QR Desk</span>
                <ArrowRight size={18} />
              </Link>
              <Link to="/pharmacy/chambers" className="btn btn-secondary btn-lg" id="btn-hero-pharmacy-chambers">
                <Calendar size={20} color="var(--primary)" />
                <span>Visiting Doctor Chambers</span>
              </Link>
            </>
          ) : (
            <>
              <a href="#chambers-section" className="btn btn-primary btn-lg" id="btn-hero-chambers">
                <Building2 size={20} />
                <span>Browse by Chamber Names</span>
                <ArrowRight size={18} />
              </a>

              <a href="#doctors-near-me" className="btn btn-secondary btn-lg" id="btn-hero-doctors-near">
                <MapPin size={20} color="var(--primary)" />
                <span>Doctors Near Me</span>
              </a>

              <Link to="/ai-screener" className="btn btn-secondary btn-lg" id="btn-hero-ai-screener">
                <Bot size={20} color="var(--secondary)" />
                <span>AI Clinical Screener (90%+)</span>
              </Link>
            </>
          )}
        </div>

        {/* HERO QUICK SELECTION BY CHAMBER NAME */}
        <div style={{
          marginTop: '2.25rem',
          padding: '1.25rem',
          background: 'var(--bg-elevated)',
          border: '2px solid var(--border-medium)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-md)',
          textAlign: 'left'
        }} id="hero-chamber-selector-box">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 800, fontSize: '0.95rem' }}>
              <Building2 size={20} />
              <span>Select Visiting Doctor Chamber:</span>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Fixed sitting times: 10 AM, 12 PM, 7 PM
            </span>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 320px', position: 'relative' }}>
              <select
                id="hero-chamber-select"
                className="form-select"
                value={selectedChamberName}
                onChange={(e) => {
                  setSelectedChamberName(e.target.value);
                  const el = document.getElementById('chambers-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{ fontWeight: 700, padding: '10px 14px' }}
              >
                <option value="All">🏢 All Chambers Across Cities ({pharmacies.length} Available)</option>
                {pharmacies.map(ch => (
                  <option key={ch.id} value={ch.name}>
                    {ch.shortName || ch.name} &bull; {ch.locality || ch.city} ({ch.city})
                  </option>
                ))}
              </select>
            </div>

            <a
              href="#chambers-section"
              className="btn btn-primary"
              style={{ padding: '10px 20px', whiteSpace: 'nowrap' }}
              onClick={() => {
                const el = document.getElementById('chambers-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <span>View Chamber Sittings</span>
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </div>

      {/* CITY SELECTION FILTER BAR */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        flexWrap: 'wrap',
        marginBottom: '3rem',
        padding: '12px',
        background: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)'
      }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginRight: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <MapPin size={16} color="var(--primary)" /> Select Location:
        </span>
        {cities.map(city => (
          <button
            key={city}
            onClick={() => {
              setSelectedCity(city);
              setSelectedChamberName('All');
            }}
            style={{
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              border: selectedCity === city ? '2px solid var(--primary)' : '1px solid var(--border-medium)',
              background: selectedCity === city ? 'var(--primary)' : 'var(--bg-surface)',
              color: selectedCity === city ? '#FFF' : 'var(--text-primary)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {city}
          </button>
        ))}
      </div>

      {/* SECTION 1: BROWSE DOCTORS THROUGH CHAMBER NAMES */}
      <section id="chambers-section" style={{ marginBottom: '4.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>
              <Building2 size={18} />
              <span>Visiting Chamber Network</span>
            </div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, margin: '4px 0' }}>
              Doctors by Chamber Names & Sittings
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              In Uttarpara and surrounding cities, specialist doctors sit at local pharmacies (e.g. <strong>Makhla Medicare</strong>, <strong>Bhadrakali Polyclinic</strong>, <strong>Kotrung Health Point</strong>) at designated hours (e.g. 10 AM, 12 PM, 7 PM). Choose your doctor according to their sitting schedule.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="badge badge-confirmed" style={{ fontSize: '0.85rem' }}>
              {filteredPharmacies.length} Active Chambers Found
            </span>
            {(selectedChamberName !== 'All' || chamberSearch) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedChamberName('All');
                  setChamberSearch('');
                }}
                className="btn btn-secondary btn-xs"
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                title="Reset Chamber Filters"
              >
                <RotateCcw size={12} />
                <span>Show All</span>
              </button>
            )}
          </div>
        </div>

        {/* SELECTION BY CHAMBER NAME CONTROLS CARD */}
        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.75rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-medium)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', alignItems: 'flex-end', marginBottom: '1rem' }}>
            
            {/* Chamber Name Dropdown Selector */}
            <div>
              <label htmlFor="chamber-name-select" className="form-label" style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Building2 size={14} color="var(--primary)" />
                <strong>Selection by Chamber Name:</strong>
              </label>
              <select
                id="chamber-name-select"
                className="form-select"
                value={selectedChamberName}
                onChange={(e) => setSelectedChamberName(e.target.value)}
                style={{ fontWeight: 700 }}
              >
                <option value="All">🏢 All Chambers ({pharmacies.length} Chambers)</option>
                {pharmacies.map(ch => (
                  <option key={ch.id} value={ch.name}>
                    {ch.shortName || ch.name} &bull; {ch.locality || ch.city} ({ch.city})
                  </option>
                ))}
              </select>
            </div>

            {/* Chamber Text Search */}
            <div>
              <label htmlFor="chamber-search-input" className="form-label" style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Search size={14} color="var(--primary)" />
                <strong>Search Chamber Name or Street:</strong>
              </label>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  id="chamber-search-input"
                  className="form-input"
                  value={chamberSearch}
                  onChange={(e) => setChamberSearch(e.target.value)}
                  placeholder="e.g. Makhla, Bhadrakali, Kotrung, Hindmotor, Jaykrishna..."
                  style={{ paddingLeft: '36px' }}
                />
              </div>
            </div>
          </div>

          {/* Quick Select Chamber Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', paddingTop: '10px', borderTop: '1px dashed var(--border-subtle)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginRight: '4px' }}>
              Quick Select Chamber:
            </span>
            <button
              type="button"
              onClick={() => setSelectedChamberName('All')}
              className={`btn btn-xs ${selectedChamberName === 'All' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: '14px', fontSize: '0.76rem', padding: '3px 10px' }}
              id="pill-chamber-all"
            >
              All Chambers ({pharmacies.length})
            </button>
            {pharmacies.map(ch => {
              const label = ch.shortName || ch.name;
              const isSelected = selectedChamberName === ch.name || selectedChamberName === ch.shortName;
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => setSelectedChamberName(ch.name)}
                  className={`btn btn-xs ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ borderRadius: '14px', fontSize: '0.76rem', padding: '3px 10px' }}
                  id={`pill-chamber-${ch.id}`}
                >
                  🏥 {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Chambers Grid */}
        {filteredPharmacies.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
            {filteredPharmacies.map(pharmacy => {
              const slots = pharmacy.slots || pharmacy.visitingDoctors || [];
              return (
                <div key={pharmacy.id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: selectedChamberName === pharmacy.name ? '2px solid var(--primary)' : '1px solid var(--border-subtle)' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                          {pharmacy.name}
                        </h3>
                        <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, marginTop: '2px' }}>
                          📍 {pharmacy.locality || pharmacy.city} &bull; {pharmacy.city}
                        </div>
                      </div>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--secondary-subtle)',
                        color: 'var(--secondary)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        whiteSpace: 'nowrap'
                      }}>
                        {pharmacy.operatingHours || '08:00 AM - 10:00 PM'}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.4 }}>
                      {pharmacy.address}
                    </p>

                    {/* Visiting Doctors Schedule List */}
                    <div style={{
                      background: 'var(--bg-elevated)',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px',
                      border: '1px solid var(--border-subtle)',
                      marginBottom: '1rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                          Visiting Doctors & Sittings ({slots.length}):
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700 }}>
                          Max 2 Slots / Doctor
                        </span>
                      </div>

                      {slots.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {slots.map((slot, sIdx) => {
                            const dName = slot.doctorName || slot.name || 'Consultant Specialist';
                            const dSpec = slot.specialization || slot.doctorSpecialization || 'Specialist';
                            const dDegree = slot.degree || 'MBBS, MD';
                            const dPhoto = slot.photoUrl || slot.doctorPhotoUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400';
                            const dRoom = slot.chamberRoom || `Chamber ${sIdx + 1}`;
                            const dFee = formatCurrency(slot.consultationFee);

                            return (
                              <div key={slot.id || slot.slotId || sIdx} style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '10px 12px',
                                background: 'var(--bg-surface)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border-subtle)',
                                gap: '8px',
                                flexWrap: 'wrap'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '180px', flex: 1 }}>
                                  <img
                                    src={dPhoto}
                                    alt={dName}
                                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--primary-subtle)' }}
                                    onError={(e) => {
                                      e.target.src = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400';
                                    }}
                                  />
                                  <div>
                                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                                      {formatDoctorName(dName)}
                                    </div>
                                    <div style={{ fontSize: '0.725rem', color: 'var(--secondary)', fontWeight: 600 }}>
                                      {dSpec}
                                    </div>
                                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                                      {dDegree} &bull; {dRoom}
                                    </div>
                                  </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.825rem', fontWeight: 800, color: 'var(--primary)' }}>
                                      ⏰ {slot.timeSlot}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                      {slot.availableDays} &bull; {dFee}
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => handleBookSlotForDoctor(pharmacy, slot)}
                                    className="btn btn-primary btn-xs"
                                    style={{ padding: '6px 10px', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                                    id={`btn-book-slot-${pharmacy.id}-${slot.doctorId || sIdx}`}
                                  >
                                    <Calendar size={13} />
                                    <span>Book Slot</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '8px 0' }}>
                          Consultation slots open daily. Walk-in and advance booking accepted at desk.
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Phone size={14} />
                      <span>{pharmacy.phone}</span>
                    </div>

                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleBookChamber(pharmacy)}
                    >
                      <Calendar size={14} />
                      <span>Book at this Chamber</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card" style={{ padding: '2.5rem', textAlign: 'center', background: 'var(--bg-elevated)' }}>
            <Building2 size={36} color="var(--text-muted)" style={{ margin: '0 auto 10px' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '6px' }}>
              No chambers match "{chamberSearch || selectedChamberName}"
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Try selecting a different city or clearing your search term to see all available chambers.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCity('All');
                setSelectedChamberName('All');
                setChamberSearch('');
              }}
              className="btn btn-primary btn-sm"
            >
              Reset Filters & Show All Chambers
            </button>
          </div>
        )}
      </section>

      {/* SECTION 2: DOCTORS NEAR YOU BY LOCATION */}
      <section id="doctors-near-me" style={{ marginBottom: '4.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--secondary)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>
              <MapPin size={18} />
              <span>Proximity & Distance Ranking</span>
            </div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, margin: '4px 0' }}>
              Doctors Near You by Location
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Verified medical practitioners located in your local neighborhood with verified ratings and transparent fees.
            </p>
          </div>
          <Link to="/doctors" className="btn btn-secondary btn-sm">
            <span>Explore All on Map</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.5rem' }}>
          {filteredDoctors.slice(0, 6).map(doc => (
            <div key={doc.id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '1rem' }}>
                  <img
                    src={doc.photoUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400'}
                    alt={doc.name}
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid var(--primary-subtle)',
                      flexShrink: 0
                    }}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400';
                    }}
                  />
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                      {formatDoctorName(doc.name)}
                    </h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--secondary)', fontWeight: 700 }}>
                      {doc.degree || 'MBBS, MD'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {doc.specialization} &bull; {doc.departmentName}
                    </div>
                  </div>
                </div>

                {/* Location Badge */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 10px',
                  background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '0.75rem'
                }}>
                  <MapPin size={14} color="var(--primary)" />
                  <span>{doc.locality ? `${doc.locality}, ${doc.city}` : (doc.city || 'Central Clinic')}</span>
                </div>

                {/* Visiting Chamber & Sitting Badge */}
                {(() => {
                  const docChambers = pharmacies.filter(p => {
                    const slots = p.slots || p.visitingDoctors || [];
                    return slots.some(s => s.doctorId === doc.id) ||
                      (doc.clinicAddress && doc.clinicAddress.toLowerCase().includes((p.shortName || p.name).toLowerCase()));
                  });
                  if (docChambers.length === 0) return null;
                  return (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      marginBottom: '1rem',
                      background: 'var(--primary-subtle)',
                      padding: '6px 10px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)'
                    }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Building2 size={12} /> Visiting Chambers & Sitting:
                      </span>
                      {docChambers.map(ch => {
                        const slots = ch.slots || ch.visitingDoctors || [];
                        const s = slots.find(slot => slot.doctorId === doc.id);
                        return (
                          <div key={ch.id || ch.name} style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>🏥 {ch.shortName || ch.name}</span>
                            {s?.timeSlot && <span style={{ color: 'var(--primary)', fontWeight: 700 }}>⏰ {s.timeSlot}</span>}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1rem'
                }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Fee: </span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
                      {formatCurrency(doc.consultationFee)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#D97706', fontWeight: 700 }}>
                    <Star size={14} fill="#D97706" />
                    <span>{doc.rating || 4.8}</span>
                    <span style={{ color: 'var(--text-muted)' }}>({doc.experienceYears || 10}y exp)</span>
                  </div>
                </div>

                <button
                  onClick={() => handleBookDoctor(doc)}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%' }}
                >
                  <Calendar size={15} />
                  <span>Book Appointment / Chamber</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3: ALL DOCTORS DIRECTORY WITH SEARCH */}
      <section id="all-doctors" style={{ marginBottom: '4.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10B981', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>
              <Stethoscope size={18} />
              <span>Full Medical Directory</span>
            </div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, margin: '4px 0' }}>
              All Specialist Doctors
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Search across all specialties, departments, and visiting locations.
            </p>
          </div>

          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              value={doctorSearch}
              onChange={e => setDoctorSearch(e.target.value)}
              placeholder="Search doctor, specialty, chamber..."
              style={{ paddingLeft: '36px' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {filteredDoctors.map(doc => (
            <div key={doc.id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <img
                    src={doc.photoUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400'}
                    alt={doc.name}
                    style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-subtle)' }}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400';
                    }}
                  />
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
                      {formatDoctorName(doc.name)}
                    </h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 600 }}>
                      {doc.degree || 'MBBS, MD'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {doc.specialization}
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '0.75rem' }}>
                  {doc.bio ? (doc.bio.length > 85 ? doc.bio.substring(0, 85) + '...' : doc.bio) : 'Consultant specialist available for chamber and clinic consultation.'}
                </p>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  📍 {doc.locality || doc.city || 'Central Clinic'}
                </div>

                {/* Visiting Chamber Badge */}
                {(() => {
                  const docChambers = pharmacies.filter(p => {
                    const slots = p.slots || p.visitingDoctors || [];
                    return slots.some(s => s.doctorId === doc.id) ||
                      (doc.clinicAddress && doc.clinicAddress.toLowerCase().includes((p.shortName || p.name).toLowerCase()));
                  });
                  if (docChambers.length === 0) return null;
                  return (
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '4px',
                      marginBottom: '0.75rem'
                    }}>
                      {docChambers.map(ch => (
                        <span
                          key={ch.id || ch.name}
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            background: 'var(--primary-subtle)',
                            color: 'var(--primary)',
                            padding: '2px 6px',
                            borderRadius: '4px'
                          }}
                        >
                          🏥 {ch.shortName || ch.name}
                        </span>
                      ))}
                    </div>
                  );
                })()}
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
                    {formatCurrency(doc.consultationFee)}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#D97706', fontWeight: 700 }}>
                    ★ {doc.rating || 4.8} ({doc.experienceYears || 8} yrs)
                  </span>
                </div>

                <button
                  onClick={() => handleBookDoctor(doc)}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%' }}
                >
                  <Calendar size={14} />
                  <span>Select Chamber & Slot</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Pillars Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--primary-subtle)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem'
          }}>
            <Building2 size={22} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Pharmacy Chambers</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Outpatient visiting chambers across Uttarpara, Konnagar, Howrah, and Kolkata with verified doctor sitting schedules.
          </p>
        </div>

        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--secondary-subtle)',
            color: 'var(--secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem'
          }}>
            <Bot size={22} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>AI Screener (90%+)</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Interactive clinical outcome predictor with 90%+ match probability and direct connection to local visiting doctors.
          </p>
        </div>

        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: 'var(--radius-md)',
            background: '#F0FDF4',
            color: '#16A34A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem'
          }}>
            <QrCode size={22} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Digital QR Check-in</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Instant digital passes validated by the pharmacy desk upon arrival and exit for seamless entry into the chamber.
          </p>
        </div>

        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: 'var(--radius-md)',
            background: '#FFFBEB',
            color: '#D97706',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem'
          }}>
            <ShieldCheck size={22} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Admin Operations</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Platform developers and administrators ensure smooth verification, chamber appointments, and security integrity.
          </p>
        </div>
      </div>

      {/* Demo Credentials Box */}
      <div className="card" style={{
        padding: '1.75rem',
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-medium)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Platform Role Demonstrations</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Test all 4 portals (Patient, Doctor with File Upload, Pharmacy Chamber with QR Validator, Platform Admin):
            </p>
          </div>
          <Link to="/login" className="btn btn-primary btn-sm">
            Go to Login
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          <div style={{ background: 'var(--bg-surface)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)' }}>Patient Portal</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>patient@health.com</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Password: patient123</div>
          </div>

          <div style={{ background: 'var(--bg-surface)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--secondary)' }}>Doctor Console</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>dr.sharma@hospital.com</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Password: doctor123</div>
          </div>

          <div style={{ background: 'var(--bg-surface)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#16A34A' }}>Pharmacy Chamber Desk</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>pharmacy@health.com</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Password: pharmacy123</div>
          </div>

          <div style={{ background: 'var(--bg-surface)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#D97706' }}>Platform Developer Admin</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>admin@health.com</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Password: admin123</div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {bookingDoctor && (
        <SlotBookingModal
          doctor={bookingDoctor}
          onClose={() => setBookingDoctor(null)}
          onBookingSuccess={() => setBookingDoctor(null)}
        />
      )}
    </div>
  );
}
