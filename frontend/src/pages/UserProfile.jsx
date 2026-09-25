import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { User, Phone, Mail, Heart, AlertCircle, Save, CheckCircle, Shield, FileText, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function UserProfile() {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: 'Not specified',
    bloodGroup: 'O+',
    emergencyContact: '',
    address: ''
  });
  const [allergies, setAllergies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchProfile();
    fetchAllergies();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile({
        name: res.data.name || '',
        email: res.data.email || '',
        phone: res.data.phone || '',
        age: res.data.age || '',
        gender: res.data.gender || 'Not specified',
        bloodGroup: res.data.bloodGroup || 'O+',
        emergencyContact: res.data.emergencyContact || '',
        address: res.data.address || ''
      });
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllergies = async () => {
    try {
      const res = await axios.get('/api/allergies/my-history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllergies(res.data || []);
    } catch (err) {
      console.error('Failed to load allergy records', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await axios.put('/api/auth/me', profile, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMsg('Your health profile has been successfully updated.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '3rem 1.25rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading your health profile...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem', maxWidth: '1000px' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div style={{
            background: 'var(--primary-subtle)',
            color: 'var(--primary)',
            padding: '0.6rem',
            borderRadius: 'var(--radius-md)'
          }}>
            <User size={26} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>My Health Profile & Portal</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Manage your personal information, emergency contacts, and vital medical history.
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
        {/* Form Column */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={20} color="var(--primary)" />
            Personal Details
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={profile.name}
                onChange={e => setProfile({ ...profile, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address (Login ID)</label>
              <input
                type="email"
                className="form-input"
                value={profile.email}
                disabled
                style={{ background: 'var(--bg-elevated)', cursor: 'not-allowed' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={profile.phone}
                  onChange={e => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Age</label>
                <input
                  type="number"
                  className="form-input"
                  value={profile.age}
                  onChange={e => setProfile({ ...profile, age: e.target.value })}
                  placeholder="30"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select
                  className="form-select"
                  value={profile.gender}
                  onChange={e => setProfile({ ...profile, gender: e.target.value })}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Not specified">Not specified</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Blood Group</label>
                <select
                  className="form-select"
                  value={profile.bloodGroup}
                  onChange={e => setProfile({ ...profile, bloodGroup: e.target.value })}
                >
                  <option value="O+">O Positive (O+)</option>
                  <option value="O-">O Negative (O-)</option>
                  <option value="A+">A Positive (A+)</option>
                  <option value="A-">A Negative (A-)</option>
                  <option value="B+">B Positive (B+)</option>
                  <option value="B-">B Negative (B-)</option>
                  <option value="AB+">AB Positive (AB+)</option>
                  <option value="AB-">AB Negative (AB-)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Emergency Contact (Name & Phone)</label>
              <input
                type="text"
                className="form-input"
                value={profile.emergencyContact}
                onChange={e => setProfile({ ...profile, emergencyContact: e.target.value })}
                placeholder="e.g. Ramesh Verma (+91 98111 00000)"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Residential Address</label>
              <textarea
                className="form-textarea"
                rows="3"
                value={profile.address}
                onChange={e => setProfile({ ...profile, address: e.target.value })}
                placeholder="Street address, City, State, PIN code"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              <Save size={18} />
              {saving ? 'Saving Changes...' : 'Save Profile Details'}
            </button>
          </form>
        </div>

        {/* Side Column: Medical Summary & Quick Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Medical Snapshot Card */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Heart size={20} color="var(--accent-rose)" />
              Clinical History & Drug Safety
            </h2>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
              This data is automatically cross-referenced by our Drug Conflict Safety Engine whenever doctors prescribe medications.
            </p>

            {allergies.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                No active drug allergies or high-risk medications on record.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {allergies.map((item, idx) => (
                  <div key={idx} style={{
                    padding: '0.85rem',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.925rem' }}>
                        {item.allergyName && item.allergyName !== 'None' ? `Allergy: ${item.allergyName}` : `Ongoing Med: ${item.medicationName}`}
                      </span>
                      <span className={`badge ${item.severity === 'SEVERE' ? 'badge-danger' : 'badge-warning'}`}>
                        {item.severity} RISK
                      </span>
                    </div>
                    {item.notes && (
                      <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: 0 }}>
                        {item.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Shortcuts */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
              Portal Shortcuts
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link to="/patient/appointments" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                <Calendar size={18} color="var(--primary)" />
                <span>My Appointments & Check-in Passes</span>
              </Link>
              <Link to="/lab-reports" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                <FileText size={18} color="var(--secondary)" />
                <span>My Medical Lab Reports</span>
              </Link>
              <Link to="/doctors" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                <User size={18} color="var(--primary)" />
                <span>Find Doctors & Book New Consultation</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
