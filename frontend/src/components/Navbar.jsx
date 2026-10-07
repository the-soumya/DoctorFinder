import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Heart, 
  MapPin, 
  Bot, 
  FileText, 
  Calendar, 
  LogOut, 
  User, 
  Pill, 
  BarChart3,
  Stethoscope,
  Sun,
  Moon,
  UserCheck,
  Building2,
  Users,
  ShieldCheck,
  Tv
} from 'lucide-react';
import { formatDoctorName } from '../utils/formatters';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const roleLabel = {
    ROLE_PATIENT: 'Patient',
    ROLE_DOCTOR: 'Doctor',
    ROLE_PHARMACIST_RECEPTIONIST: 'Pharmacy Desk',
    ROLE_ADMIN: 'Hospital Admin'
  }[user?.role] || 'User';

  const displayName = user?.role === 'ROLE_DOCTOR' ? formatDoctorName(user?.name) : user?.name;

  return (
    <nav style={{
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      padding: '0 1.5rem',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{
        maxWidth: '1350px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '68px'
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }} id="nav-brand-logo">
          <div style={{
            background: 'var(--primary)',
            color: '#FFFFFF',
            padding: '8px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Heart size={22} fill="#FFFFFF" />
          </div>
          <div>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.35rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em'
            }}>AuraHealth</span>
            <span style={{ fontSize: '0.65rem', display: 'block', color: 'var(--text-muted)', letterSpacing: '0.04em', fontWeight: 700 }}>
              HOSPITAL & TELEHEALTH PORTAL
            </span>
          </div>
        </Link>

        {/* Navigation Links - Simple everyday healthcare wording */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {(!user || user.role === 'ROLE_PATIENT') && (
            <>
              <Link
                to="/doctors"
                id="nav-link-doctors"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  fontSize: '0.885rem',
                  fontWeight: 600,
                  color: isActive('/doctors') ? 'var(--primary)' : 'var(--text-secondary)',
                  background: isActive('/doctors') ? 'var(--primary-subtle)' : 'transparent',
                  transition: 'all 0.15s ease'
                }}
              >
                <MapPin size={16} />
                <span>Find Doctors</span>
              </Link>

              <Link
                to="/ai-screener"
                id="nav-link-screener"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  fontSize: '0.885rem',
                  fontWeight: 600,
                  color: isActive('/ai-screener') ? 'var(--primary)' : 'var(--text-secondary)',
                  background: isActive('/ai-screener') ? 'var(--primary-subtle)' : 'transparent',
                  transition: 'all 0.15s ease'
                }}
              >
                <Bot size={16} />
                <span>{t('checkSymptoms') || 'Check Symptoms'}</span>
              </Link>

              <Link
                to="/chamber/live-display"
                id="nav-link-live-display"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  fontSize: '0.885rem',
                  fontWeight: 600,
                  color: isActive('/chamber/live-display') ? '#10B981' : 'var(--text-secondary)',
                  background: isActive('/chamber/live-display') ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                  transition: 'all 0.15s ease'
                }}
                title="Fullscreen Chamber Waiting Room TV Display with Voice Calling"
              >
                <Tv size={16} color="#10B981" />
                <span>{t('liveWaitingScreen') || 'Live TV Display'}</span>
              </Link>
            </>
          )}

          {user && (user.role === 'ROLE_PATIENT' || user.role === 'ROLE_ADMIN') && (
            <Link
              to="/lab-reports"
              id="nav-link-reports"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 12px',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                fontSize: '0.885rem',
                fontWeight: 600,
                color: isActive('/lab-reports') ? 'var(--primary)' : 'var(--text-secondary)',
                background: isActive('/lab-reports') ? 'var(--primary-subtle)' : 'transparent',
                transition: 'all 0.15s ease'
              }}
            >
              <FileText size={16} />
              <span>Lab Reports</span>
            </Link>
          )}

          {/* Patient Links: Appointments + Health Profile */}
          {user?.role === 'ROLE_PATIENT' && (
            <>
              <Link
                to="/patient/appointments"
                id="nav-link-patient-dashboard"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  fontSize: '0.885rem',
                  fontWeight: 600,
                  color: isActive('/patient/appointments') ? 'var(--primary)' : 'var(--text-secondary)',
                  background: isActive('/patient/appointments') ? 'var(--primary-subtle)' : 'transparent'
                }}
              >
                <Calendar size={16} />
                <span>My Appointments</span>
              </Link>

              <Link
                to="/patient/profile"
                id="nav-link-patient-profile"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  fontSize: '0.885rem',
                  fontWeight: 600,
                  color: isActive('/patient/profile') ? 'var(--primary)' : 'var(--text-secondary)',
                  background: isActive('/patient/profile') ? 'var(--primary-subtle)' : 'transparent'
                }}
              >
                <User size={16} />
                <span>My Health Profile</span>
              </Link>
            </>
          )}

          {/* Doctor Links: Console + Patient Clinical Directory + Personal Profile */}
          {user?.role === 'ROLE_DOCTOR' && (
            <>
              <Link
                to="/doctor/dashboard"
                id="nav-link-doctor-dashboard"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  fontSize: '0.885rem',
                  fontWeight: 600,
                  color: isActive('/doctor/dashboard') ? 'var(--primary)' : 'var(--text-secondary)',
                  background: isActive('/doctor/dashboard') ? 'var(--primary-subtle)' : 'transparent'
                }}
              >
                <Stethoscope size={16} />
                <span>Doctor Console</span>
              </Link>

              <Link
                to="/doctor/patients"
                id="nav-link-doctor-patients"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  fontSize: '0.885rem',
                  fontWeight: 600,
                  color: isActive('/doctor/patients') ? 'var(--primary)' : 'var(--text-secondary)',
                  background: isActive('/doctor/patients') ? 'var(--primary-subtle)' : 'transparent'
                }}
              >
                <Users size={16} />
                <span>Patient Directory</span>
              </Link>

              <Link
                to="/doctor/profile"
                id="nav-link-doctor-profile"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  fontSize: '0.885rem',
                  fontWeight: 600,
                  color: isActive('/doctor/profile') ? 'var(--primary)' : 'var(--text-secondary)',
                  background: isActive('/doctor/profile') ? 'var(--primary-subtle)' : 'transparent'
                }}
              >
                <UserCheck size={16} />
                <span>Personal Profile</span>
              </Link>
            </>
          )}

          {/* Pharmacy / Reception Links: Dispensing Queue + Visiting Chambers */}
          {user?.role === 'ROLE_PHARMACIST_RECEPTIONIST' && (
            <>
              <Link
                to="/pharmacy/dashboard"
                id="nav-link-pharmacy-dashboard"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  fontSize: '0.885rem',
                  fontWeight: 600,
                  color: isActive('/pharmacy/dashboard') ? 'var(--primary)' : 'var(--text-secondary)',
                  background: isActive('/pharmacy/dashboard') ? 'var(--primary-subtle)' : 'transparent'
                }}
              >
                <Pill size={16} />
                <span>Pharmacy & Desk</span>
              </Link>

              <Link
                to="/pharmacy/chambers"
                id="nav-link-pharmacy-chambers"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  fontSize: '0.885rem',
                  fontWeight: 600,
                  color: isActive('/pharmacy/chambers') ? 'var(--primary)' : 'var(--text-secondary)',
                  background: isActive('/pharmacy/chambers') ? 'var(--primary-subtle)' : 'transparent'
                }}
              >
                <Building2 size={16} />
                <span>Doctor Chambers</span>
              </Link>

              <Link
                to="/pharmacy/attendance"
                id="nav-link-pharmacy-attendance"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  fontSize: '0.885rem',
                  fontWeight: 600,
                  color: isActive('/pharmacy/attendance') ? 'var(--primary)' : 'var(--text-secondary)',
                  background: isActive('/pharmacy/attendance') ? 'var(--primary-subtle)' : 'transparent'
                }}
              >
                <UserCheck size={16} />
                <span>Attendance (In/Out)</span>
              </Link>

              <Link
                to="/pharmacy/doctors"
                id="nav-link-pharmacy-doctors"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  fontSize: '0.885rem',
                  fontWeight: 600,
                  color: isActive('/pharmacy/doctors') ? 'var(--primary)' : 'var(--text-secondary)',
                  background: isActive('/pharmacy/doctors') ? 'var(--primary-subtle)' : 'transparent'
                }}
              >
                <Users size={16} />
                <span>Doctors & Contacts</span>
              </Link>
            </>
          )}

          {/* Admin Links: Analytics + Immutable Audit Logs */}
          {user?.role === 'ROLE_ADMIN' && (
            <>
              <Link
                to="/admin/analytics"
                id="nav-link-admin-analytics"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  fontSize: '0.885rem',
                  fontWeight: 600,
                  color: isActive('/admin/analytics') ? 'var(--primary)' : 'var(--text-secondary)',
                  background: isActive('/admin/analytics') ? 'var(--primary-subtle)' : 'transparent'
                }}
              >
                <BarChart3 size={16} />
                <span>Admin Analytics</span>
              </Link>

              <Link
                to="/admin/audit-logs"
                id="nav-link-admin-audit"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  fontSize: '0.885rem',
                  fontWeight: 600,
                  color: isActive('/admin/audit-logs') ? 'var(--primary)' : 'var(--text-secondary)',
                  background: isActive('/admin/audit-logs') ? 'var(--primary-subtle)' : 'transparent'
                }}
              >
                <ShieldCheck size={16} />
                <span>Security Audit Trail</span>
              </Link>
            </>
          )}
        </div>

        {/* Right side: Theme Toggle & Auth controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Language Toggle Button (English / বাংলা) */}
          <button
            onClick={toggleLanguage}
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: 'var(--radius-md)', padding: '5px 10px', fontWeight: 800, fontSize: '0.785rem' }}
            title={language === 'en' ? 'বাংলা ভাষায় দেখুন (Switch to Bengali)' : 'Switch to English'}
            id="language-toggle-btn"
          >
            {language === 'en' ? 'বাংলা' : 'EN'}
          </button>

          {/* Medical Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: 'var(--radius-full)', padding: '6px 10px' }}
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Medical Mode'}
            id="theme-toggle-btn"
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} color="#FBBF24" />}
          </button>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {displayName}
                </div>
                <div style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: 'var(--primary)',
                  letterSpacing: '0.03em',
                  textTransform: 'uppercase'
                }}>
                  {roleLabel}
                </div>
              </div>

              <button
                id="btn-logout"
                onClick={logout}
                className="btn btn-secondary btn-sm"
                title="Logout"
                style={{ borderRadius: 'var(--radius-md)' }}
              >
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link to="/login" id="btn-nav-login" className="btn btn-secondary btn-sm">
                Sign In
              </Link>
              <Link to="/register" id="btn-nav-register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
