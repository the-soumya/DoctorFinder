import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Heart, 
  MapPin, 
  Bot, 
  FileText, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Calendar,
  Stethoscope,
  Clock,
  Star,
  QrCode,
  UserCheck
} from 'lucide-react';
import { formatDoctorName, formatCurrency } from '../utils/formatters';

export default function Home() {
  const { user } = useAuth();

  const featuredDoctors = [
    {
      id: 1,
      name: 'Vikram Sharma',
      degree: 'MBBS, MD, DM (Cardiology, AIIMS)',
      specialization: 'Senior Cardiologist',
      department: 'Cardiology',
      fee: 800,
      rating: 4.9,
      experience: 14,
      photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400'
    },
    {
      id: 2,
      name: 'Priya Deshmukh',
      degree: 'MBBS, MD (Dermatology)',
      specialization: 'Consultant Dermatologist',
      department: 'Dermatology',
      fee: 600,
      rating: 4.8,
      experience: 9,
      photo: 'https://images.unsplash.com/photo-1594824813501-5264b304c45b?auto=format&fit=crop&q=80&w=400'
    },
    {
      id: 5,
      name: 'Alok Nath',
      degree: 'MBBS, MD (Internal Medicine)',
      specialization: 'Senior Family Physician',
      department: 'General Medicine',
      fee: 500,
      rating: 4.8,
      experience: 15,
      photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400'
    }
  ];

  return (
    <div className="container" style={{ padding: '3rem 1.25rem' }}>
      {/* Hero Banner */}
      <div style={{ textAlign: 'center', maxWidth: '820px', margin: '0 auto 3.5rem' }}>
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
          <span>CityHealth Hospital & Telehealth Network</span>
        </div>

        <h1 style={{
          fontSize: '3rem',
          fontWeight: 800,
          lineHeight: 1.2,
          marginBottom: '1.25rem',
          color: 'var(--text-primary)'
        }}>
          Compassionate Healthcare & Instant Doctor Appointments
        </h1>

        <p style={{
          fontSize: '1.1rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          marginBottom: '2rem'
        }}>
          Find top physicians near you in Bangalore, check symptoms for instant clinical guidance with top 3 recommended doctor matches, and receive digital <strong>QR Check-in Passes</strong> sent right to your email.
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <Link to="/doctors" className="btn btn-primary btn-lg" id="btn-hero-doctors">
            <MapPin size={20} />
            <span>Find Doctors Near Me</span>
            <ArrowRight size={18} />
          </Link>

          <Link to="/ai-screener" className="btn btn-secondary btn-lg" id="btn-hero-ai-screener">
            <Bot size={20} color="var(--primary)" />
            <span>Check Symptoms & Top 3 Doctors</span>
          </Link>
        </div>
      </div>

      {/* Featured Doctors Section */}
      <div style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 800 }}>Top Practicing Doctors</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
              Qualified medical specialists with upfront consultation fees and patient reviews.
            </p>
          </div>
          <Link to="/doctors" className="btn btn-secondary btn-sm">
            <span>View All Doctors</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {featuredDoctors.map(doc => (
            <div key={doc.id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <img
                  src={doc.photo}
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
                    {doc.degree}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {doc.specialization}
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-md)'
              }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Fee: </span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
                    {formatCurrency(doc.fee)}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#D97706', fontWeight: 700 }}>
                  <Star size={14} fill="#D97706" />
                  <span>{doc.rating}</span>
                  <span style={{ color: 'var(--text-muted)' }}>({doc.experience}y exp)</span>
                </div>
              </div>

              <Link to="/doctors" className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                <Calendar size={15} />
                <span>Book Appointment</span>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Pillars Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
        {/* Card 1: Doctors Near You */}
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
            <MapPin size={22} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Doctors Near You</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Locate clinic locations nearest to your home in Bangalore with real distance calculations and verified ratings.
          </p>
        </div>

        {/* Card 2: AI Symptom Checker */}
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
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Check Symptoms</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Describe your pain or illness in plain words to get suggested departments and the <strong>top 3 matching doctors</strong>.
          </p>
        </div>

        {/* Card 3: QR Check-in Email Pass */}
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
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Digital Check-in Pass</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Instant appointment confirmation with a verifiable QR code emailed to you for zero-wait reception arrival.
          </p>
        </div>

        {/* Card 4: Prescription & Drug Safety */}
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
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Drug Safety Shield</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Automated conflict and allergy warnings protect every prescription written by hospital physicians.
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
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Examiner & Demonstration Logins</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Test all 4 role portals (Patient, Doctor, Pharmacy/Desk, Hospital Admin):
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
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--secondary)' }}>Doctor Console & Profile</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>dr.sharma@hospital.com</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Password: doctor123</div>
          </div>

          <div style={{ background: 'var(--bg-surface)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#16A34A' }}>Pharmacy / Reception</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>staff@hospital.com</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Password: staff123</div>
          </div>

          <div style={{ background: 'var(--bg-surface)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#D97706' }}>Hospital Admin</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>admin@hospital.com</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Password: admin123</div>
          </div>
        </div>
      </div>
    </div>
  );
}
