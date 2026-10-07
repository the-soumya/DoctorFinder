import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_REAL_DOCTORS } from '../data/chambersData';
import {
  Building2,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Stethoscope,
  Ticket,
  X,
  CheckCircle,
  AlertTriangle,
  User,
  Phone,
  IndianRupee,
  Users,
  Search,
  ArrowRight,
  Pill,
  UserCheck,
  Tv
} from 'lucide-react';
import { formatDoctorName } from '../utils/formatters';

export default function PharmacyChambers() {
  const [pharmacy, setPharmacy] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');

  // Add Chamber Slot Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [chamberRoom, setChamberRoom] = useState('Chamber 1');
  const [availableDays, setAvailableDays] = useState('Mon, Wed, Fri');
  const [timeSlot, setTimeSlot] = useState('05:00 PM - 07:30 PM');
  const [consultationFee, setConsultationFee] = useState('600');
  const [maxTokens, setMaxTokens] = useState('20');
  const [submittingSlot, setSubmittingSlot] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    fetchPharmacyData();
  }, []);

  const fetchPharmacyData = async () => {
    setLoading(true);
    try {
      const [pharmRes, docsRes] = await Promise.all([
        api.get('/pharmacies/me'),
        api.get('/doctors')
      ]);
      setPharmacy(pharmRes.data);
      setDoctors(docsRes.data || []);
      if (docsRes.data?.length > 0) {
        setSelectedDoctorId(docsRes.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load pharmacy chamber data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    if (!pharmacy?.id || !selectedDoctorId) return;

    setSubmittingSlot(true);
    try {
      await api.post(`/pharmacies/${pharmacy.id}/slots`, {
        doctorId: selectedDoctorId,
        availableDays,
        timeSlot,
        chamberRoom,
        consultationFee: parseFloat(consultationFee) || 500,
        maxTokens: parseInt(maxTokens, 10) || 20
      });

      setStatusMessage(`Successfully allocated ${chamberRoom} for visiting doctor!`);
      setIsAddModalOpen(false);
      fetchPharmacyData();
    } catch (err) {
      alert('Failed to allocate doctor slot: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingSlot(false);
    }
  };

  const handleRemoveSlot = async (slotId, doctorName) => {
    if (!window.confirm(`Are you sure you want to remove the chamber slot for Dr. ${doctorName}?`)) return;

    try {
      await api.delete(`/pharmacies/slots/${slotId}`);
      setStatusMessage(`Visiting chamber slot removed.`);
      fetchPharmacyData();
    } catch (err) {
      alert('Failed to remove slot: ' + (err.response?.data?.message || err.message));
    }
  };

  const visitingDoctors = pharmacy?.visitingDoctors || [];

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '2rem 1.5rem' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#F59E0B', marginBottom: '4px' }}>
            <Building2 size={20} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Outpatient Department & Reception
            </span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Visiting Doctor Chambers & Schedule</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Configure chamber room allocations, visiting specialist timetables, consultation fees, and monitor active consulting rooms.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link to="/pharmacy/attendance" className="btn btn-primary" id="btn-to-attendance">
            <UserCheck size={16} />
            <span>Chamber In/Out Attendance</span>
          </Link>

          <Link to="/pharmacy/doctors" className="btn btn-secondary" id="btn-to-doctors-dir">
            <Users size={16} />
            <span>Doctors & Contacts</span>
          </Link>

          <Link to="/chamber/live-display" className="btn btn-secondary" target="_blank" id="btn-to-live-tv" style={{ borderColor: 'rgba(16, 185, 129, 0.4)', color: '#10B981' }}>
            <Tv size={16} color="#10B981" />
            <span>Launch Live TV Screen</span>
          </Link>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn btn-secondary"
            id="btn-add-chamber-slot"
          >
            <Plus size={16} />
            <span>Allocate Doctor Chamber</span>
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

      {/* KPI Stats Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #F59E0B' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Active Visiting Doctors</span>
            <Stethoscope size={20} color="#F59E0B" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800 }}>{visitingDoctors.length}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Specialists consulting at this desk</span>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #3B82F6' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Allocated Chambers</span>
            <Building2 size={20} color="#3B82F6" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800 }}>
            {new Set(visitingDoctors.map(v => v.chamberRoom)).size}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rooms actively assigned</span>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #10B981' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Daily Token Capacity</span>
            <Ticket size={20} color="#10B981" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800 }}>
            {visitingDoctors.reduce((acc, curr) => acc + (curr.maxTokens || 20), 0)}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total walk-in & online capacity</span>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #8B5CF6' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Facility Operating Hours</span>
            <Clock size={20} color="#8B5CF6" />
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '6px' }}>
            {pharmacy?.operatingHours || '08:00 AM - 10:00 PM'}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Reception open daily</span>
        </div>
      </div>

      {/* Visiting Chambers Grid */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Active Doctor Chambers</h2>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {visitingDoctors.length} {visitingDoctors.length === 1 ? 'Chamber Slot' : 'Chamber Slots'} Configured
        </span>
      </div>

      {loading ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading visiting doctor chambers...</p>
        </div>
      ) : visitingDoctors.length === 0 ? (
        <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
          <Building2 size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.6 }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No doctor chambers allocated</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>
            Add visiting medical specialists to your pharmacy or outpatient reception to publish visiting hours and issue walk-in queue tokens.
          </p>
          <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary btn-sm">
            <Plus size={16} />
            <span>Allocate First Visiting Doctor</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {visitingDoctors.map(slot => (
            <div
              key={slot.slotId}
              className="card"
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: '1px solid var(--border-subtle)',
                position: 'relative'
              }}
            >
              <div>
                {/* Chamber Room Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(245, 158, 11, 0.12)',
                    color: '#F59E0B',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}>
                    <Building2 size={13} />
                    <span>{slot.chamberRoom || 'Chamber 1'}</span>
                  </div>

                  <button
                    onClick={() => handleRemoveSlot(slot.slotId, slot.doctorName)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                    title="Remove Chamber Allocation"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Doctor Info */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '1rem' }}>
                  <img
                    src={slot.photoUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200'}
                    alt={slot.doctorName}
                    style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid var(--border-subtle)'
                    }}
                  />
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                      {formatDoctorName(slot.doctorName)}
                    </h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
                      {slot.specialization || slot.departmentName}
                    </div>
                    {slot.degree && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {slot.degree}
                      </div>
                    )}
                  </div>
                </div>

                {/* Schedule Details */}
                <div style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  fontSize: '0.85rem',
                  marginBottom: '1.25rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                    <Calendar size={15} color="var(--primary)" />
                    <span><strong>Days:</strong> {slot.availableDays || 'Mon, Wed, Fri'}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                    <Clock size={15} color="var(--primary)" />
                    <span><strong>Time:</strong> {slot.timeSlot || '05:00 PM - 07:30 PM'}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10B981', fontWeight: 700 }}>
                      <IndianRupee size={14} />
                      <span>₹{slot.consultationFee || 500}</span>
                    </div>

                    {(() => {
                      const dObj = DEFAULT_REAL_DOCTORS.find(d => d.id === slot.doctorId || d.name === slot.doctorName);
                      const phone = dObj?.phone || '+91 98311 55667';
                      return (
                        <a href={`tel:${phone}`} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none' }} title="Call visiting doctor directly">
                          <Phone size={12} />
                          <span>{phone}</span>
                        </a>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Actions: Track Attendance & Doctor Profile */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <Link
                  to="/pharmacy/attendance"
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1, justifyContent: 'center' }}
                  id={`btn-track-doc-${slot.slotId}`}
                >
                  <UserCheck size={14} />
                  <span>Chamber Attendance</span>
                </Link>

                <Link
                  to="/pharmacy/doctors"
                  className="btn btn-secondary btn-sm"
                  title="View Doctor Profile & Contacts"
                >
                  <Users size={14} />
                  <span>Contacts</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Allocate Chamber Slot Modal */}
      {isAddModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '1.5rem'
        }}>
          <div className="card" style={{ maxWidth: '540px', width: '100%', padding: '1.75rem', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={20} color="#F59E0B" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                  Allocate Visiting Doctor Chamber
                </h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSlot} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Select Visiting Doctor *
                </label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => {
                    setSelectedDoctorId(e.target.value);
                    const doc = doctors.find(d => String(d.id) === e.target.value);
                    if (doc?.consultationFee) setConsultationFee(String(doc.consultationFee));
                  }}
                  className="input-field"
                  required
                >
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>
                      {formatDoctorName(d.name)} — {d.specialization} ({d.departmentName || 'Medical'})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                    Chamber / Room *
                  </label>
                  <input
                    type="text"
                    value={chamberRoom}
                    onChange={(e) => setChamberRoom(e.target.value)}
                    placeholder="e.g. Chamber 1, Suite 2"
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                    Max Tokens Limit *
                  </label>
                  <input
                    type="number"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(e.target.value)}
                    placeholder="20"
                    min="1"
                    max="100"
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Visiting Days *
                </label>
                <input
                  type="text"
                  value={availableDays}
                  onChange={(e) => setAvailableDays(e.target.value)}
                  placeholder="e.g. Mon, Wed, Fri or Daily"
                  className="input-field"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                    Visiting Time Slot *
                  </label>
                  <input
                    type="text"
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    placeholder="05:00 PM - 07:30 PM"
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                    Consultation Fee (₹) *
                  </label>
                  <input
                    type="number"
                    value={consultationFee}
                    onChange={(e) => setConsultationFee(e.target.value)}
                    placeholder="600"
                    min="0"
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={submittingSlot}
                >
                  {submittingSlot ? 'Saving Chamber...' : 'Assign Chamber'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
