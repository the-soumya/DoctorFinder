import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Search,
  Calendar,
  Clock,
  ShieldAlert,
  FileText,
  Activity,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  User,
  Phone,
  Mail,
  Stethoscope,
  Filter,
  HeartPulse,
  Eye,
  PlusCircle,
  X,
  Pill
} from 'lucide-react';

export default function DoctorPatients() {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL'); // 'ALL', 'ALLERGIES', 'RECENT'
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientAllergies, setPatientAllergies] = useState([]);
  const [loadingAllergies, setLoadingAllergies] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [loadingPrescription, setLoadingPrescription] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let docId = user?.doctorId;
      if (!docId) {
        // Resolve doctor ID from /api/doctors/me or /api/doctors
        try {
          const meRes = await api.get('/doctors/me');
          docId = meRes.data?.id;
        } catch {
          const allDocsRes = await api.get('/doctors');
          const matched = allDocsRes.data.find(d => d.userId === user?.id);
          if (matched) docId = matched.id;
        }
      }

      if (docId) {
        const apptsRes = await api.get(`/appointments/doctor/${docId}`);
        const apptsList = apptsRes.data || [];
        setAppointments(apptsList);
        processUniquePatients(apptsList);
      }
    } catch (err) {
      console.error('Failed to load doctor clinical records', err);
    } finally {
      setLoading(false);
    }
  };

  const processUniquePatients = (appts) => {
    const map = new Map();

    appts.forEach(a => {
      const pId = a.patientId;
      if (!pId) return;

      if (!map.has(pId)) {
        map.set(pId, {
          patientId: pId,
          patientName: a.patientName || 'Anonymous Patient',
          patientEmail: a.patientEmail || 'N/A',
          patientPhone: a.patientPhone || 'N/A',
          consultations: [],
          totalVisits: 0,
          lastVisit: null,
          hasUpcoming: false,
          hasPrescriptionCount: 0
        });
      }

      const pData = map.get(pId);
      pData.consultations.push(a);
      pData.totalVisits += 1;
      if (a.hasPrescription) pData.hasPrescriptionCount += 1;

      const apptDate = new Date(a.slotDatetime);
      if (!pData.lastVisit || apptDate > new Date(pData.lastVisit)) {
        pData.lastVisit = a.slotDatetime;
      }

      if (a.status === 'CONFIRMED' && apptDate >= new Date()) {
        pData.hasUpcoming = true;
      }
    });

    // Convert map to sorted array (most recent visit first)
    const patientList = Array.from(map.values()).sort((a, b) => {
      return new Date(b.lastVisit || 0) - new Date(a.lastVisit || 0);
    });

    setPatients(patientList);
  };

  const handleOpenPatientDetail = async (patient) => {
    setSelectedPatient(patient);
    setSelectedPrescription(null);
    setLoadingAllergies(true);

    try {
      const res = await api.get(`/allergies/patient/${patient.patientId}`);
      setPatientAllergies(res.data || []);
    } catch (err) {
      console.error('Failed to fetch patient allergies', err);
      setPatientAllergies([]);
    } finally {
      setLoadingAllergies(false);
    }
  };

  const handleViewPrescription = async (appointmentId) => {
    setLoadingPrescription(true);
    try {
      const res = await api.get(`/prescriptions/appointment/${appointmentId}`);
      setSelectedPrescription(res.data);
    } catch (err) {
      alert('Prescription details could not be retrieved.');
    } finally {
      setLoadingPrescription(false);
    }
  };

  // Filter patients
  const filteredPatients = patients.filter(p => {
    const matchesSearch =
      p.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.patientEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.patientPhone.includes(searchQuery);

    if (!matchesSearch) return false;

    if (selectedFilter === 'RECENT') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return new Date(p.lastVisit) >= thirtyDaysAgo;
    }

    return true;
  });

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '2rem 1.5rem' }} className="animate-fade-in">
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', marginBottom: '4px' }}>
            <Stethoscope size={20} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Doctor Clinical Practice
            </span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Patient Clinical Directory</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Review your patient roster, clinical history, allergy contraindications, and previous diagnosis notes.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/doctor/dashboard" className="btn btn-primary" id="btn-back-to-console">
            <Calendar size={18} />
            <span>Open Today's Console</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Total Patients Treated</span>
            <Users size={20} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800 }}>{patients.length}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Unique individuals in your registry</span>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #3B82F6' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Total Consultations</span>
            <Activity size={20} color="#3B82F6" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800 }}>{appointments.length}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Outpatient & tele-health visits</span>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #10B981' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Completed Visits</span>
            <CheckCircle size={20} color="#10B981" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800 }}>
            {appointments.filter(a => a.status === 'COMPLETED').length}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Successfully attended</span>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #8B5CF6' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Prescriptions Issued</span>
            <Pill size={20} color="#8B5CF6" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800 }}>
            {appointments.filter(a => a.hasPrescription).length}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Clinical e-prescriptions</span>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '280px', maxWidth: '480px' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search patient by name, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '40px' }}
            id="input-patient-search"
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Filter size={16} color="var(--text-muted)" />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Filter:</span>

          <button
            onClick={() => setSelectedFilter('ALL')}
            className={`btn btn-sm ${selectedFilter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
          >
            All Patients ({patients.length})
          </button>

          <button
            onClick={() => setSelectedFilter('RECENT')}
            className={`btn btn-sm ${selectedFilter === 'RECENT' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Last 30 Days
          </button>
        </div>
      </div>

      {/* Patient List Table / Grid */}
      {loading ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading patient clinical records...</p>
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
          <Users size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.6 }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No patients found</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>
            {searchQuery
              ? `No patients match "${searchQuery}". Try searching with a different name or phone.`
              : 'Patients who book appointments with your chamber will automatically appear here with their medical records.'}
          </p>
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="btn btn-secondary btn-sm">
              Clear Search Filter
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {filteredPatients.map(p => (
            <div
              key={p.patientId}
              className="card"
              style={{
                padding: '1.35rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                cursor: 'pointer',
                border: selectedPatient?.patientId === p.patientId ? '2px solid var(--primary)' : '1px solid var(--border-subtle)'
              }}
              onClick={() => handleOpenPatientDetail(p)}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: 'var(--primary-subtle)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '1.1rem'
                    }}>
                      {p.patientName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{p.patientName}</h3>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Patient ID: #{p.patientId}
                      </span>
                    </div>
                  </div>

                  {p.hasUpcoming && (
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-full)',
                      background: 'rgba(59, 130, 246, 0.12)',
                      color: '#3B82F6'
                    }}>
                      Upcoming
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  {p.patientPhone && p.patientPhone !== 'N/A' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Phone size={14} color="var(--text-muted)" />
                      <span>{p.patientPhone}</span>
                    </div>
                  )}
                  {p.patientEmail && p.patientEmail !== 'N/A' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Mail size={14} color="var(--text-muted)" />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.patientEmail}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={14} color="var(--text-muted)" />
                    <span>Last Visit: {p.lastVisit ? new Date(p.lastVisit).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div style={{
                paddingTop: '12px',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.85rem'
              }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {p.totalVisits} {p.totalVisits === 1 ? 'Visit' : 'Visits'}
                  </span>
                  {p.hasPrescriptionCount > 0 && (
                    <span style={{ color: '#8B5CF6', fontWeight: 600 }}>
                      • {p.hasPrescriptionCount} Rx
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', fontWeight: 600 }}>
                  <span>View Records</span>
                  <ChevronRight size={16} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Patient Detail Modal / Drawer */}
      {selectedPatient && (
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
          <div className="card" style={{
            maxWidth: '750px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            padding: 0,
            border: '1px solid var(--border-subtle)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg-card)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: 'var(--primary-subtle)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.2rem'
                }}>
                  {selectedPatient.patientName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                    {selectedPatient.patientName}
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Patient ID #{selectedPatient.patientId} • {selectedPatient.patientPhone}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedPatient(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
              {/* Allergy / Clinical Safety Alerts */}
              <div style={{ marginBottom: '1.75rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldAlert size={18} color="#EF4444" />
                  <span>Clinical Allergies & Contraindications</span>
                </h4>

                {loadingAllergies ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Loading allergy profile...</p>
                ) : patientAllergies.length === 0 ? (
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    color: '#10B981',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <CheckCircle size={16} />
                    <span>No active drug allergies or medical contraindications recorded.</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {patientAllergies.map(alg => (
                      <div
                        key={alg.id}
                        style={{
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-md)',
                          background: alg.severity === 'SEVERE' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                          border: `1px solid ${alg.severity === 'SEVERE' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <strong style={{ fontSize: '0.9rem', color: alg.severity === 'SEVERE' ? '#EF4444' : '#F59E0B' }}>
                            {alg.allergen}
                          </strong>
                          {alg.reaction && (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '8px' }}>
                              — {alg.reaction}
                            </span>
                          )}
                        </div>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          background: alg.severity === 'SEVERE' ? '#EF4444' : '#F59E0B',
                          color: '#fff'
                        }}>
                          {alg.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Consultation History */}
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={18} color="var(--primary)" />
                  <span>Consultation History ({selectedPatient.consultations.length})</span>
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {selectedPatient.consultations.map(appt => (
                    <div
                      key={appt.id}
                      style={{
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-subtle)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '10px'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                            {new Date(appt.slotDatetime).toLocaleDateString('en-IN', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {new Date(appt.slotDatetime).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          Status:{' '}
                          <span style={{
                            fontWeight: 700,
                            color: appt.status === 'COMPLETED' ? '#10B981' : appt.status === 'CONFIRMED' ? '#3B82F6' : '#EF4444'
                          }}>
                            {appt.status}
                          </span>
                          {appt.patientArrivalMarked && (
                            <span style={{ color: '#10B981', marginLeft: '8px' }}>• Arrival Checked</span>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        {appt.hasPrescription && (
                          <button
                            onClick={() => handleViewPrescription(appt.id)}
                            className="btn btn-secondary btn-sm"
                            disabled={loadingPrescription}
                          >
                            <FileText size={14} />
                            <span>View Rx</span>
                          </button>
                        )}
                        <Link
                          to={`/doctor/dashboard?apptId=${appt.id}`}
                          className="btn btn-primary btn-sm"
                        >
                          <span>Consult Pad</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prescription Viewer Submodal */}
              {selectedPrescription && (
                <div style={{
                  marginTop: '1.5rem',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(139, 92, 246, 0.08)',
                  border: '1px solid rgba(139, 92, 246, 0.3)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8B5CF6', fontWeight: 700 }}>
                      <Pill size={18} />
                      <span>Electronic Prescription Details</span>
                    </div>
                    <button
                      onClick={() => setSelectedPrescription(null)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {selectedPrescription.diagnosisNotes && (
                    <div style={{ marginBottom: '10px', fontSize: '0.85rem' }}>
                      <strong>Diagnosis:</strong> {selectedPrescription.diagnosisNotes}
                    </div>
                  )}

                  <div style={{ fontSize: '0.85rem' }}>
                    <strong>Prescribed Medicines:</strong>
                    <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {selectedPrescription.medicines?.map((m, idx) => (
                        <div key={idx} style={{
                          padding: '6px 10px',
                          background: 'var(--bg-card)',
                          borderRadius: 'var(--radius-sm)',
                          display: 'flex',
                          justifyContent: 'space-between'
                        }}>
                          <span><strong>{m.name}</strong> ({m.dosage})</span>
                          <span style={{ color: 'var(--text-muted)' }}>{m.frequency} • {m.duration}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              background: 'var(--bg-subtle)'
            }}>
              <button
                onClick={() => setSelectedPatient(null)}
                className="btn btn-secondary btn-sm"
              >
                Close
              </button>
              <Link
                to="/doctor/dashboard"
                className="btn btn-primary btn-sm"
              >
                <Stethoscope size={16} />
                <span>Go to Console</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
