import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { UserPlus, User, Mail, Key, Phone, Stethoscope, AlertCircle, ArrowRight, Eye, EyeOff, CheckCircle, XCircle, Clock } from 'lucide-react';

// Password strength checker
function getPasswordStrength(password) {
  if (!password) return { level: 0, label: '', color: '#374151' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 2) return { level: 1, label: 'Weak', color: '#EF4444' };
  if (score <= 4) return { level: 2, label: 'Fair', color: '#F59E0B' };
  if (score <= 5) return { level: 3, label: 'Strong', color: '#10B981' };
  return { level: 4, label: 'Very Strong', color: '#06B6D4' };
}

function PasswordRule({ met, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: met ? '#10B981' : 'var(--text-muted)' }}>
      {met ? <CheckCircle size={13} /> : <XCircle size={13} />}
      <span>{label}</span>
    </div>
  );
}

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'ROLE_PATIENT',
    phone: '',
    specialization: 'General Physician',
    departmentId: 1,
    consultationFee: 500,
    latitude: 22.6730,
    longitude: 88.3340,
    bio: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const { signup, loading } = useAuth();
  const navigate = useNavigate();

  const strength = getPasswordStrength(formData.password);
  const passwordRules = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[^A-Za-z0-9]/.test(formData.password),
  };
  const passwordIsStrong = strength.level >= 2;
  const passwordsMatch = formData.password === confirmPassword;
  const requiresApproval = formData.role === 'ROLE_DOCTOR' || formData.role === 'ROLE_PHARMACIST_RECEPTIONIST';

  useEffect(() => {
    api.get('/departments')
      .then(res => setDepartments(res.data))
      .catch(err => console.error('Failed to load departments', err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!passwordIsStrong) {
      setError('Password is too weak. Please use uppercase, lowercase, a number, and a special character.');
      return;
    }
    if (!passwordsMatch) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }
    const res = await signup(formData);
    if (res.success) {
      if (res.user.role === 'ROLE_DOCTOR') navigate('/doctor/dashboard');
      else if (res.user.role === 'ROLE_PHARMACIST_RECEPTIONIST') navigate('/pharmacy/dashboard');
      else navigate('/patient/appointments');
    } else {
      if (res.message && res.message.toLowerCase().includes('pending')) {
        setSuccessMsg(res.message);
      } else {
        setError(res.message);
      }
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 70px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2.5rem 1rem'
    }}>
      <div style={{ width: '100%', maxWidth: '580px' }} className="animate-fade-in">
        <div className="card" style={{ padding: '2.25rem', borderRadius: 'var(--radius-xl)' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '52px',
              height: '52px',
              margin: '0 auto 1rem',
              background: 'var(--secondary)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF'
            }}>
              <UserPlus size={26} />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.35rem' }}>
              Create an Account
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Join CityHealth as a Patient, Doctor, or Clinic Staff
            </p>
          </div>

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: '#FB7185',
              marginBottom: '1.5rem',
              fontSize: '0.875rem'
            }} id="register-error-alert">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '14px 16px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              borderRadius: 'var(--radius-md)',
              color: '#10B981',
              marginBottom: '1.5rem',
              fontSize: '0.875rem'
            }} id="register-success-alert">
              <Clock size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontWeight: 700, marginBottom: '4px' }}>Registration Submitted!</div>
                <div>{successMsg}</div>
              </div>
            </div>
          )}

          {requiresApproval && !successMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '12px 16px',
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: '#F59E0B',
              marginBottom: '1.25rem',
              fontSize: '0.8rem'
            }}>
              <Clock size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>
                <strong>Approval Required:</strong> {formData.role === 'ROLE_DOCTOR' ? 'Doctor' : 'Pharmacy/Receptionist'} accounts require hospital administrator approval before login is permitted.
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label className="form-label" htmlFor="reg-name">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '13px' }} />
                  <input
                    id="reg-name"
                    name="name"
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    className="form-input"
                    style={{ paddingLeft: '42px' }}
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="form-label" htmlFor="reg-role">Role</label>
                <select
                  id="reg-role"
                  name="role"
                  className="form-select"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="ROLE_PATIENT">Patient</option>
                  <option value="ROLE_DOCTOR">Doctor (Physician)</option>
                  <option value="ROLE_PHARMACIST_RECEPTIONIST">Pharmacist / Receptionist</option>
                  {/* ROLE_ADMIN hidden from public registration */}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label className="form-label" htmlFor="reg-email">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '13px' }} />
                  <input
                    id="reg-email"
                    name="email"
                    type="email"
                    required
                    placeholder="name@example.com"
                    className="form-input"
                    style={{ paddingLeft: '42px' }}
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="form-label" htmlFor="reg-phone">Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '13px' }} />
                  <input
                    id="reg-phone"
                    name="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    className="form-input"
                    style={{ paddingLeft: '42px' }}
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Password with strength meter */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" htmlFor="reg-password">Password</label>
              <div style={{ position: 'relative' }}>
                <Key size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '13px' }} />
                <input
                  id="reg-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Min 8 chars, uppercase, number, symbol"
                  className="form-input"
                  style={{ paddingLeft: '42px', paddingRight: '42px' }}
                  value={formData.password}
                  onChange={handleChange}
                />
                <button type="button" onClick={() => setShowPassword(p => !p)}
                  style={{ position: 'absolute', right: '12px', top: '11px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {formData.password && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} style={{
                        flex: 1, height: '4px', borderRadius: '2px',
                        background: i <= strength.level ? strength.color : 'var(--border-subtle)',
                        transition: 'background 0.3s'
                      }} />
                    ))}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: strength.color, fontWeight: 600, marginBottom: '6px' }}>
                    Strength: {strength.label}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 12px' }}>
                    <PasswordRule met={passwordRules.length} label="At least 8 characters" />
                    <PasswordRule met={passwordRules.uppercase} label="Uppercase (A-Z)" />
                    <PasswordRule met={passwordRules.lowercase} label="Lowercase (a-z)" />
                    <PasswordRule met={passwordRules.number} label="Number (0-9)" />
                    <PasswordRule met={passwordRules.special} label="Special character (!@#$)" />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" htmlFor="reg-confirm-password">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Key size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '13px' }} />
                <input
                  id="reg-confirm-password"
                  type={showConfirm ? 'text' : 'password'}
                  required
                  placeholder="Re-enter your password"
                  className="form-input"
                  style={{
                    paddingLeft: '42px', paddingRight: '42px',
                    borderColor: confirmPassword ? (passwordsMatch ? 'rgba(16,185,129,0.5)' : 'rgba(239,68,68,0.5)') : undefined
                  }}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                />
                <button type="button" onClick={() => setShowConfirm(p => !p)}
                  style={{ position: 'absolute', right: '12px', top: '11px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}>
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {confirmPassword && !passwordsMatch && (
                <div style={{ fontSize: '0.78rem', color: '#EF4444', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <XCircle size={13} /> Passwords do not match
                </div>
              )}
              {confirmPassword && passwordsMatch && (
                <div style={{ fontSize: '0.78rem', color: '#10B981', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle size={13} /> Passwords match
                </div>
              )}
            </div>

            {/* Doctor-specific fields */}
            {formData.role === 'ROLE_DOCTOR' && (
              <div style={{
                background: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', color: '#A5B4FC', fontWeight: 700 }}>
                  <Stethoscope size={18} />
                  <span>Doctor Professional Credentials</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label className="form-label">Clinical Specialty</label>
                    <input
                      name="specialization"
                      type="text"
                      className="form-input"
                      placeholder="e.g. Cardiologist"
                      value={formData.specialization}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="form-label">Department</label>
                    <select
                      name="departmentId"
                      className="form-select"
                      value={formData.departmentId}
                      onChange={handleChange}
                    >
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="form-label">Consultation Fee (INR)</label>
                    <input
                      name="consultationFee"
                      type="number"
                      className="form-input"
                      value={formData.consultationFee}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="form-label">Clinic Latitude / Longitude</label>
                    <input
                      name="latitude"
                      type="number"
                      step="any"
                      className="form-input"
                      placeholder="12.9716"
                      value={formData.latitude}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              id="btn-register-submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '1rem' }}
              disabled={loading || !passwordsMatch || !passwordIsStrong}
            >
              {loading ? 'Creating Account...' : (
                <>
                  <span>{requiresApproval ? 'Submit for Approval' : 'Complete Registration'}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
