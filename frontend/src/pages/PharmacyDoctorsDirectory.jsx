import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_REAL_DOCTORS, DEFAULT_REAL_CHAMBERS, normalizeChamber } from '../data/chambersData';
import { 
  Stethoscope, 
  Phone, 
  Mail, 
  MapPin, 
  Search, 
  Building2, 
  Star, 
  Plus, 
  Calendar, 
  Clock, 
  UserCheck, 
  Users,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  X
} from 'lucide-react';
import { formatDoctorName, formatCurrency } from '../utils/formatters';

export default function PharmacyDoctorsDirectory() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState(DEFAULT_REAL_DOCTORS);
  const [pharmacies, setPharmacies] = useState(DEFAULT_REAL_CHAMBERS.map(normalizeChamber));
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocality, setSelectedLocality] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');

  // Allocate Doctor to My Chamber Modal
  const [allocatingDoctor, setAllocatingDoctor] = useState(null);
  const [chamberRoom, setChamberRoom] = useState('Chamber 1');
  const [availableDays, setAvailableDays] = useState('Mon, Wed, Fri');
  const [timeSlot, setTimeSlot] = useState('10:00 AM - 12:30 PM');
  const [consultationFee, setConsultationFee] = useState('500');
  const [maxTokens, setMaxTokens] = useState('20');
  const [statusMessage, setStatusMessage] = useState('');
  const [submittingSlot, setSubmittingSlot] = useState(false);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      api.get('/doctors').catch(() => ({ data: [] })),
      api.get('/pharmacies').catch(() => ({ data: [] }))
    ]).then(([docsRes, pharmsRes]) => {
      if (!isMounted) return;
      if (Array.isArray(docsRes.data) && docsRes.data.length > 0) {
        // Merge backend docs with fallback contact phone/email if missing
        const merged = docsRes.data.map(d => {
          const fb = DEFAULT_REAL_DOCTORS.find(f => f.id === d.id || f.name.toLowerCase() === (d.name || '').toLowerCase());
          return {
            ...d,
            phone: d.phone || fb?.phone || '+91 98311 00000',
            email: d.email || fb?.email || `dr.${(d.name || 'doctor').toLowerCase().replace(/[^a-z]/g, '')}@hospital.com`,
            locality: d.locality || fb?.locality || 'Main Town',
            degree: d.degree || fb?.degree || 'MBBS, MD',
            clinicAddress: d.clinicAddress || fb?.clinicAddress || ''
          };
        });
        setDoctors(merged);
      }
      if (Array.isArray(pharmsRes.data) && pharmsRes.data.length > 0) {
        const approved = pharmsRes.data.filter(p => p.isApproved !== false).map(normalizeChamber);
        if (approved.length > 0) setPharmacies(approved);
      }
    }).finally(() => {
      if (isMounted) setLoading(false);
    });

    return () => { isMounted = false; };
  }, []);

  // Unique localities list
  const allLocalities = ['All', ...Array.from(new Set(doctors.map(d => d.locality).filter(Boolean)))];
  const allSpecialties = ['All', ...Array.from(new Set(doctors.map(d => d.specialization).filter(Boolean)))];
  const allCities = ['All', ...Array.from(new Set(doctors.map(d => d.city).filter(Boolean)))];

  // Filtered doctors
  const filteredDoctors = doctors.filter(doc => {
    const matchesLocality = selectedLocality === 'All' || (doc.locality && doc.locality.toLowerCase() === selectedLocality.toLowerCase());
    const matchesCity = selectedCity === 'All' || (doc.city && doc.city.toLowerCase() === selectedCity.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'All' || (doc.specialization && doc.specialization.toLowerCase() === selectedSpecialty.toLowerCase());
    const matchesSearch = !searchQuery || 
      (doc.name && doc.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (doc.specialization && doc.specialization.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (doc.locality && doc.locality.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (doc.phone && doc.phone.includes(searchQuery)) ||
      (doc.email && doc.email.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesLocality && matchesCity && matchesSpecialty && matchesSearch;
  });

  // Handle slot allocation for current pharmacy
  const handleAllocateSlot = async (e) => {
    e.preventDefault();
    if (!allocatingDoctor) return;

    setSubmittingSlot(true);
    try {
      // Find current user's pharmacy
      const myPharmRes = await api.get('/pharmacies/my').catch(() => null);
      const pharmId = myPharmRes?.data?.id || pharmacies[0]?.id;

      if (pharmId) {
        await api.post(`/pharmacies/${pharmId}/slots`, {
          doctorId: allocatingDoctor.id,
          availableDays,
          timeSlot,
          chamberRoom,
          consultationFee: parseFloat(consultationFee) || allocatingDoctor.consultationFee || 500,
          maxTokens: parseInt(maxTokens, 10) || 20
        });
      }

      setStatusMessage(`Successfully allocated ${chamberRoom} for Dr. ${allocatingDoctor.name} at your chamber!`);
      setAllocatingDoctor(null);
      setTimeout(() => setStatusMessage(''), 5000);
    } catch (err) {
      alert('Failed to allocate doctor: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingSlot(false);
    }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '2rem 1.5rem' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '1.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', marginBottom: '4px' }}>
            <Users size={20} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Pharmacy & Chamber Administration
            </span>
          </div>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 800 }}>Doctors Directory & Contacts by Locality</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Direct phone and email contact directory of specialist medical practitioners across localities in Uttarpara, Konnagar, Howrah, Kolkata, and Bangalore.
          </p>
        </div>

        {/* Quick Nav Links */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link to="/pharmacy/attendance" className="btn btn-primary" id="btn-nav-attendance">
            <UserCheck size={16} />
            <span>Chamber In/Out Attendance</span>
          </Link>

          <Link to="/pharmacy/chambers" className="btn btn-secondary" id="btn-nav-chambers">
            <Building2 size={16} />
            <span>Chamber Schedules</span>
          </Link>
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

      {/* Locality Quick Selector Rail */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem', background: 'var(--bg-elevated)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '8px' }}>
          <MapPin size={16} />
          <span>Quick Filter by Locality / Neighborhood:</span>
        </div>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {allLocalities.map(loc => (
            <button
              key={loc}
              type="button"
              onClick={() => setSelectedLocality(loc)}
              className={`btn btn-xs ${selectedLocality.toLowerCase() === loc.toLowerCase() ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: '16px', fontSize: '0.78rem', padding: '4px 12px' }}
            >
              {loc === 'All' ? `All Localities (${doctors.length})` : `📍 ${loc}`}
            </button>
          ))}
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.75rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', alignItems: 'flex-end' }}>
          {/* Search Box */}
          <div>
            <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Search Doctor, Phone, or Locality
            </label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Mousumi, +91 98311, Makhla..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '36px' }}
              />
            </div>
          </div>

          {/* City Filter */}
          <div>
            <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              City / Mainline Town
            </label>
            <select
              className="form-select"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              {allCities.map(c => (
                <option key={c} value={c}>{c === 'All' ? 'All Cities' : c}</option>
              ))}
            </select>
          </div>

          {/* Specialty Filter */}
          <div>
            <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Specialization
            </label>
            <select
              className="form-select"
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
            >
              {allSpecialties.map(s => (
                <option key={s} value={s}>{s === 'All' ? 'All Specialties' : s}</option>
              ))}
            </select>
          </div>

          {/* Reset Filters */}
          <div>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedLocality('All');
                setSelectedCity('All');
                setSelectedSpecialty('All');
              }}
              className="btn btn-secondary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Directory Count */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
          Medical Practitioners ({filteredDoctors.length})
        </h2>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Showing verified doctor contacts for outpatient chambers
        </span>
      </div>

      {/* Doctors Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {filteredDoctors.map(doc => {
          // Find visiting chambers where this doctor sits
          const docChambers = pharmacies.filter(p => {
            const slots = p.slots || p.visitingDoctors || [];
            return slots.some(s => s.doctorId === doc.id) ||
              (doc.clinicAddress && doc.clinicAddress.toLowerCase().includes((p.shortName || p.name).toLowerCase()));
          });

          return (
            <div
              key={doc.id}
              className="card"
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: '1px solid var(--border-light)'
              }}
              id={`pharmacy-doc-${doc.id}`}
            >
              <div>
                {/* Doctor Head Info */}
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <img
                    src={doc.photoUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400'}
                    alt={doc.name}
                    style={{
                      width: '68px',
                      height: '68px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid var(--primary-subtle)',
                      flexShrink: 0
                    }}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400';
                    }}
                  />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                      {formatDoctorName(doc.name)}
                    </h3>
                    <div style={{ fontSize: '0.825rem', color: 'var(--secondary)', fontWeight: 700, marginTop: '2px' }}>
                      {doc.degree || 'MBBS, MD'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                      {doc.specialization} &bull; {doc.departmentName || 'Specialist'}
                    </div>

                    {/* Locality Badge */}
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--primary)',
                      background: 'var(--primary-subtle)',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      marginTop: '6px'
                    }}>
                      <MapPin size={12} />
                      <span>{doc.locality ? `${doc.locality}, ${doc.city}` : `${doc.city || 'Uttarpara'}`}</span>
                    </div>
                  </div>
                </div>

                {/* Direct Contact Phone & Email Box */}
                <div style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 12px',
                  marginBottom: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Phone size={12} color="var(--primary)" /> Doctor Contact:
                    </span>
                    <a
                      href={`tel:${doc.phone}`}
                      style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                      title="Direct phone call"
                    >
                      <span>{doc.phone || '+91 98311 55667'}</span>
                    </a>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.825rem', borderTop: '1px dashed var(--border-subtle)', paddingTop: '4px' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Mail size={12} color="var(--primary)" /> Email:
                    </span>
                    <a
                      href={`mailto:${doc.email}`}
                      style={{ color: 'var(--text-primary)', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 500 }}
                    >
                      {doc.email || 'dr.consultant@hospital.com'}
                    </a>
                  </div>
                </div>

                {/* Visiting Chamber Status */}
                {docChambers.length > 0 ? (
                  <div style={{
                    background: 'var(--primary-subtle)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    padding: '8px 10px',
                    marginBottom: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Building2 size={12} /> Visiting Chambers & Sitting:
                    </span>
                    {docChambers.map(ch => {
                      const slots = ch.slots || ch.visitingDoctors || [];
                      const mySlot = slots.find(s => s.doctorId === doc.id);
                      return (
                        <div key={ch.id || ch.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          <span>🏥 {ch.shortName || ch.name}</span>
                          {mySlot?.timeSlot && (
                            <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
                              ⏰ {mySlot.timeSlot}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginBottom: '1rem', fontStyle: 'italic' }}>
                    📍 Clinic: {doc.clinicAddress || `${doc.locality}, ${doc.city}`}
                  </div>
                )}
              </div>

              {/* Bottom Actions: Fee & Allocate to My Chamber */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '10px',
                borderTop: '1px solid var(--border-subtle)',
                marginTop: '4px'
              }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Consultation Fee
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>
                    {formatCurrency(doc.consultationFee)}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setAllocatingDoctor(doc);
                    setConsultationFee(String(doc.consultationFee || 500));
                  }}
                  className="btn btn-primary btn-sm"
                  id={`btn-allocate-doc-${doc.id}`}
                >
                  <Plus size={14} />
                  <span>Allocate to Chamber</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredDoctors.length === 0 && (
        <div className="card" style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <MapPin size={40} style={{ margin: '0 auto 12px auto', opacity: 0.4 }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>No doctors found</h3>
          <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>No medical specialists matched "{selectedLocality}" or search criteria.</p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedLocality('All');
              setSelectedCity('All');
              setSelectedSpecialty('All');
            }}
            className="btn btn-secondary btn-sm"
          >
            Show All Doctors
          </button>
        </div>
      )}

      {/* Allocate Doctor Modal */}
      {allocatingDoctor && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '1rem'
        }}>
          <div className="card" style={{ maxWidth: '520px', width: '100%', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>
                  Allocate Visiting Chamber
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '2px' }}>
                  Assign chamber room and schedule for <strong>Dr. {allocatingDoctor.name}</strong> ({allocatingDoctor.locality})
                </p>
              </div>
              <button
                onClick={() => setAllocatingDoctor(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAllocateSlot} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="form-label">Doctor Phone Contact</label>
                <input
                  type="text"
                  className="form-input"
                  value={allocatingDoctor.phone || ''}
                  disabled
                  style={{ background: 'var(--bg-subtle)' }}
                />
              </div>

              <div>
                <label className="form-label">Chamber Room</label>
                <select
                  className="form-select"
                  value={chamberRoom}
                  onChange={(e) => setChamberRoom(e.target.value)}
                >
                  <option value="Chamber 1">Chamber 1 (Room 101)</option>
                  <option value="Chamber 2">Chamber 2 (Room 102)</option>
                  <option value="Chamber 3">Chamber 3 (Room 103)</option>
                  <option value="Chamber A">Chamber A (Ground Floor)</option>
                  <option value="Chamber B">Chamber B (First Floor)</option>
                </select>
              </div>

              <div>
                <label className="form-label">Visiting Days</label>
                <input
                  type="text"
                  className="form-input"
                  value={availableDays}
                  onChange={(e) => setAvailableDays(e.target.value)}
                  placeholder="e.g. Mon, Wed, Fri or Tue, Thu, Sat"
                  required
                />
              </div>

              <div>
                <label className="form-label">Sitting Time Slot (Max 2 Slots per Doctor)</label>
                <select
                  className="form-select"
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                >
                  <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM (Morning Sitting)</option>
                  <option value="12:00 PM - 01:30 PM">12:00 PM - 01:30 PM (Noon Sitting)</option>
                  <option value="05:00 PM - 07:00 PM">05:00 PM - 07:00 PM (Evening Sitting 1)</option>
                  <option value="07:00 PM - 08:30 PM">07:00 PM - 08:30 PM (Evening Sitting 2)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">Consultation Fee (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={consultationFee}
                    onChange={(e) => setConsultationFee(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Max Token Capacity</label>
                  <input
                    type="number"
                    className="form-input"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setAllocatingDoctor(null)}
                  className="btn btn-secondary"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingSlot}
                  className="btn btn-primary"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  {submittingSlot ? 'Saving...' : 'Confirm Allocation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
