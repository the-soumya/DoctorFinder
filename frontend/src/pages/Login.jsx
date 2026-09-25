import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Key, Mail, Shield, AlertCircle, ArrowRight, UserCheck, Stethoscope, Pill, ShieldCheck, Eye, EyeOff, Clock } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(email, password);
    if (res.success) {
      redirectByRole(res.user.role);
    } else {
      setError(res.message);
    }
  };

  const redirectByRole = (role) => {
    switch (role) {
      case 'ROLE_DOCTOR':
        navigate('/doctor/dashboard');
        break;
      case 'ROLE_PHARMACIST_RECEPTIONIST':
        navigate('/pharmacy/dashboard');
        break;
      case 'ROLE_ADMIN':
        navigate('/admin/analytics');
        break;
      case 'ROLE_PATIENT':
      default:
        navigate('/patient/appointments');
        break;
    }
  };

  const handleQuickLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    const res = await login(demoEmail, demoPassword);
    if (res.success) {
      redirectByRole(res.user.role);
    } else {
      setError(res.message);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 70px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem'
    }}>
      <div style={{ width: '100%', maxWidth: '480px' }} className="animate-fade-in">
        <div className="card" style={{ padding: '2.25rem', borderRadius: 'var(--radius-xl)' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '52px',
              height: '52px',
              margin: '0 auto 1rem',
              background: 'var(--primary)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF'
            }}>
              <Shield size={26} />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.35rem' }}>
              Sign In to Patient Portal
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Access your appointments, prescriptions, and health records
            </p>
          </div>

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '12px 16px',
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: '#FB7185',
              marginBottom: '1.5rem',
              fontSize: '0.875rem'
            }} id="login-error-alert">
              {error.toLowerCase().includes('pending') || error.toLowerCase().includes('approval')
                ? <Clock size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                : <AlertCircle size={18} style={{ flexShrink: 0 }} />}
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" htmlFor="input-email">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '13px' }} />
                <input
                  id="input-email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="form-input"
                  style={{ paddingLeft: '42px' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.75rem' }}>
              <label className="form-label" htmlFor="input-password">Password</label>
              <div style={{ position: 'relative' }}>
                <Key size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '13px' }} />
                <input
                  id="input-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  className="form-input"
                  style={{ paddingLeft: '42px', paddingRight: '42px' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  style={{ position: 'absolute', right: '12px', top: '11px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="btn-login-submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '1rem' }}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins for Examiner / Viva Evaluation */}
          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
            <p style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              letterSpacing: '0.05em',
              textAlign: 'center',
              marginBottom: '1rem'
            }}>
              Quick Demo 1-Click Evaluation Logins
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                id="btn-demo-patient"
                onClick={() => handleQuickLogin('patient@health.com', 'patient123')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.8rem', justifyContent: 'flex-start', padding: '8px 12px' }}
              >
                <UserCheck size={14} color="#06B6D4" />
                <span>Patient</span>
              </button>

              <button
                type="button"
                id="btn-demo-doctor"
                onClick={() => handleQuickLogin('dr.sharma@hospital.com', 'doctor123')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.8rem', justifyContent: 'flex-start', padding: '8px 12px' }}
              >
                <Stethoscope size={14} color="#10B981" />
                <span>Doctor</span>
              </button>

              <button
                type="button"
                id="btn-demo-pharmacy"
                onClick={() => handleQuickLogin('pharmacy@health.com', 'pharmacy123')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.8rem', justifyContent: 'flex-start', padding: '8px 12px' }}
              >
                <Pill size={14} color="#F59E0B" />
                <span>Pharmacy</span>
              </button>

              <button
                type="button"
                id="btn-demo-admin"
                onClick={() => handleQuickLogin('admin@health.com', 'admin123')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.8rem', justifyContent: 'flex-start', padding: '8px 12px' }}
              >
                <ShieldCheck size={14} color="#A855F7" />
                <span>Admin</span>
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
