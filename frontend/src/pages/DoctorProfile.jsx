import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { UserCheck, Award, DollarSign, Clock, MapPin, Save, CheckCircle, AlertCircle, Phone, Mail, Image as ImageIcon } from 'lucide-react';
import { formatDoctorName, formatCurrency } from '../utils/formatters';

export default function DoctorProfile() {
  const { user, token } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    degree: '',
    specialization: '',
    consultationFee: '',
    experienceYears: '',
    photoUrl: '',
    phone: '',
    bio: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchDoctorProfile();
  }, []);

  const fetchDoctorProfile = async () => {
    try {
      const res = await axios.get('/api/doctors/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDoctor(res.data);
      setFormData({
        name: res.data.name || '',
        degree: res.data.degree || 'MBBS, MD',
        specialization: res.data.specialization || '',
        consultationFee: res.data.consultationFee || '500.00',
        experienceYears: res.data.experienceYears || '5',
        photoUrl: res.data.photoUrl || '',
        phone: res.data.phone || '',
        bio: res.data.bio || ''
      });
    } catch (err) {
      console.error('Failed to load doctor profile', err);
      setErrorMsg('Could not load doctor profile. Make sure you are logged in as a Doctor.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!doctor) return;
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await axios.put(`/api/doctors/${doctor.id}`, {
        name: formData.name,
        degree: formData.degree,
        specialization: formData.specialization,
        consultationFee: parseFloat(formData.consultationFee),
        experienceYears: parseInt(formData.experienceYears, 10),
        photoUrl: formData.photoUrl,
        phone: formData.phone,
        bio: formData.bio
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDoctor(res.data);
      setSuccessMsg('Your doctor personal profile has been updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to update doctor profile', err);
      setErrorMsg('Failed to update profile. Please check your inputs.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '3rem 1.25rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading doctor personal profile...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem', maxWidth: '1000px' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div style={{
            background: 'var(--secondary-subtle)',
            color: 'var(--secondary)',
            padding: '0.6rem',
            borderRadius: 'var(--radius-md)'
          }}>
            <UserCheck size={26} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Doctor Personal Profile</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Manage your professional credentials, medical degrees, consultation fees, and patient-facing bio.
            </p>
          </div>
        </div>
      </div>

      {successMsg && (
        <div style={{
          background: '#F0FDF4',
          border: '1px solid #BBF7D0',
          color: '#16A34A',
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: 600
        }}>
          <CheckCircle size={20} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div style={{
          background: '#FEF2F2',
          border: '1px solid #FECACA',
          color: '#DC2626',
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <AlertCircle size={20} />
          <span>{errorMsg}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Left Column: Profile Card Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.75rem', textAlign: 'center' }}>
            <div style={{ position: 'relative', width: '130px', height: '130px', margin: '0 auto 1.25rem auto' }}>
              <img
                src={formData.photoUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400'}
                alt={doctor?.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '50%',
                  border: '3px solid var(--primary-subtle)',
                  boxShadow: 'var(--shadow-md)'
                }}
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400';
                }}
              />
              <div style={{
                position: 'absolute',
                bottom: '2px',
                right: '4px',
                background: '#16A34A',
                border: '2px solid #FFFFFF',
                width: '18px',
                height: '18px',
                borderRadius: '50%'
              }} title="Verified Practicing Physician" />
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.25rem' }}>
              {formatDoctorName(formData.name)}
            </h2>
            <div style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.35rem' }}>
              {formData.degree}
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              {formData.specialization} &bull; {doctor?.departmentName}
            </p>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '1.5rem',
              padding: '1rem 0',
              borderTop: '1px solid var(--border-subtle)',
              borderBottom: '1px solid var(--border-subtle)',
              marginBottom: '1.25rem'
            }}>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {formatCurrency(formData.consultationFee)}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Consultation Fee
                </div>
              </div>
              <div style={{ borderLeft: '1px solid var(--border-subtle)' }} />
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--secondary)' }}>
                  {formData.experienceYears}+ Yrs
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Clinical Exp
                </div>
              </div>
              <div style={{ borderLeft: '1px solid var(--border-subtle)' }} />
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#D97706' }}>
                  ★ {doctor?.rating || 4.9}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Patient Rating
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'left', background: 'var(--bg-elevated)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                Clinic Location
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                <MapPin size={16} color="var(--primary)" />
                <span>Bangalore Hospital Campus (Lat: {doctor?.latitude}, Lon: {doctor?.longitude})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Profile Form */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={20} color="var(--secondary)" />
            Update Credentials & Fees
          </h2>

          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Doctor Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Doctor Name (e.g. Vikram Sharma)"
                required
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Prefix "Dr." will be added automatically to patients.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Medical Degree & Qualifications</label>
              <input
                type="text"
                className="form-input"
                value={formData.degree}
                onChange={e => setFormData({ ...formData, degree: e.target.value })}
                placeholder="e.g. MBBS, MD (Medicine), DM (Cardiology, AIIMS)"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Clinical Specialization</label>
              <input
                type="text"
                className="form-input"
                value={formData.specialization}
                onChange={e => setFormData({ ...formData, specialization: e.target.value })}
                placeholder="e.g. Senior Interventional Cardiologist"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Consultation Fee (₹)</label>
                <input
                  type="number"
                  step="50"
                  className="form-input"
                  value={formData.consultationFee}
                  onChange={e => setFormData({ ...formData, consultationFee: e.target.value })}
                  placeholder="800"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Experience (Years)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.experienceYears}
                  onChange={e => setFormData({ ...formData, experienceYears: e.target.value })}
                  placeholder="14"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Contact Phone Number</label>
              <input
                type="text"
                className="form-input"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98333 44455"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Profile Photo URL</label>
              <input
                type="url"
                className="form-input"
                value={formData.photoUrl}
                onChange={e => setFormData({ ...formData, photoUrl: e.target.value })}
                placeholder="https://images.unsplash.com/..."
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Provide a clean, professional doctor headshot image URL.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Doctor Bio & Patient Information</label>
              <textarea
                className="form-textarea"
                rows="4"
                value={formData.bio}
                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Detail your clinical sub-specialties, surgical interests, and patient approach..."
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              <Save size={18} />
              {saving ? 'Updating Profile...' : 'Save Doctor Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
