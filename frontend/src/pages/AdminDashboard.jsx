import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart3, 
  ShieldCheck, 
  Users, 
  Calendar, 
  IndianRupee, 
  TrendingUp, 
  Layers, 
  FileText, 
  Lock,
  Stethoscope,
  Edit,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  Bell,
  Building2,
  Trash2,
  PlusCircle,
  UserPlus,
  QrCode,
  MapPin,
  Code2
} from 'lucide-react';
import { formatDoctorName, formatCurrency } from '../utils/formatters';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics', 'approvals', 'doctors', 'pharmacies', 'appointments', 'audit'
  const [selectedDoctorEdit, setSelectedDoctorEdit] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals for Add Doctor & Add Pharmacy
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [newDoctorForm, setNewDoctorForm] = useState({
    name: '',
    email: '',
    password: 'doctor123',
    phone: '+91 98311 00000',
    specialization: 'General Physician',
    degree: 'MBBS, MD',
    departmentId: 1,
    consultationFee: '500',
    experienceYears: '8',
    city: 'Uttarpara',
    district: 'Hooghly',
    state: 'West Bengal',
    locality: 'Makhla',
    clinicAddress: 'Station Road West, Uttarpara',
    photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
    bio: 'Senior consultant visiting doctor available for outpatient chamber consultation.'
  });

  const [showAddPharmacyModal, setShowAddPharmacyModal] = useState(false);
  const [newPharmacyForm, setNewPharmacyForm] = useState({
    name: '',
    licenseNumber: 'WB-PHA-2024-' + Math.floor(1000 + Math.random() * 9000),
    email: '',
    password: 'pharmacy123',
    phone: '+91 98311 00000',
    address: '',
    city: 'Uttarpara',
    district: 'Hooghly',
    state: 'West Bengal',
    locality: 'Makhla',
    operatingHours: '08:00 AM - 10:00 PM',
    latitude: 22.6735,
    longitude: 88.3345
  });

  const { user } = useAuth();

  useEffect(() => {
    fetchAdminData();
    fetchPendingApprovals();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, auditRes, docsRes, deptsRes, pharmsRes, apptsRes] = await Promise.all([
        api.get('/admin/stats').catch(() => ({ data: null })),
        api.get('/admin/audit-logs').catch(() => ({ data: [] })),
        api.get('/doctors').catch(() => ({ data: [] })),
        api.get('/departments').catch(() => ({ data: [] })),
        api.get('/pharmacies').catch(() => ({ data: [] })),
        api.get('/admin/appointments').catch(() => ({ data: [] }))
      ]);
      setStats(statsRes.data);
      setAuditLogs(auditRes.data || []);
      setDoctors(docsRes.data || []);
      setDepartments(deptsRes.data || []);
      setPharmacies(pharmsRes.data || []);
      setAllAppointments(apptsRes.data || []);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingApprovals = async () => {
    try {
      const res = await api.get('/admin/pending-approvals');
      setPendingUsers(res.data || []);
    } catch (err) {
      console.error('Failed to load pending approvals', err);
    }
  };

  const handleApprove = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/approve`);
      setStatusMessage('Account approved successfully! User can now log in.');
      fetchPendingApprovals();
      fetchAdminData();
      setTimeout(() => setStatusMessage(''), 4000);
    } catch (err) {
      alert('Failed to approve user: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleReject = async (userId, name) => {
    if (!window.confirm(`Reject and revoke account for "${name}"?`)) return;
    try {
      await api.put(`/admin/users/${userId}/reject`);
      setStatusMessage(`Account for "${name}" has been rejected.`);
      fetchPendingApprovals();
      setTimeout(() => setStatusMessage(''), 4000);
    } catch (err) {
      alert('Failed to reject user: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteDoctor = async (id, name) => {
    if (!window.confirm(`Delete Dr. ${name}? This will remove the doctor and their chamber slots.`)) return;
    try {
      await api.delete(`/admin/doctors/${id}`);
      setStatusMessage(`Doctor ${name} removed from system.`);
      fetchAdminData();
      setTimeout(() => setStatusMessage(''), 4000);
    } catch (err) {
      alert('Failed to delete doctor: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/doctors', {
        ...newDoctorForm,
        departmentId: parseInt(newDoctorForm.departmentId, 10),
        consultationFee: parseFloat(newDoctorForm.consultationFee),
        experienceYears: parseInt(newDoctorForm.experienceYears, 10),
        latitude: 22.6730,
        longitude: 88.3340
      });
      setStatusMessage(`Dr. ${newDoctorForm.name} successfully created & approved!`);
      setShowAddDoctorModal(false);
      fetchAdminData();
      setTimeout(() => setStatusMessage(''), 4000);
    } catch (err) {
      alert('Failed to add doctor: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeletePharmacy = async (id, name) => {
    if (!window.confirm(`Delete Pharmacy "${name}"? This will remove the pharmacy and its visiting chamber slots.`)) return;
    try {
      await api.delete(`/admin/pharmacies/${id}`);
      setStatusMessage(`Pharmacy "${name}" deleted.`);
      fetchAdminData();
      setTimeout(() => setStatusMessage(''), 4000);
    } catch (err) {
      alert('Failed to delete pharmacy: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCreatePharmacy = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/pharmacies', newPharmacyForm);
      setStatusMessage(`Pharmacy "${newPharmacyForm.name}" created & approved!`);
      setShowAddPharmacyModal(false);
      fetchAdminData();
      setTimeout(() => setStatusMessage(''), 4000);
    } catch (err) {
      alert('Failed to add pharmacy: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteAppointment = async (id) => {
    if (!window.confirm(`Cancel/Delete Appointment #${id}?`)) return;
    try {
      await api.delete(`/admin/appointments/${id}`);
      setStatusMessage(`Appointment #${id} cancelled & removed.`);
      fetchAdminData();
      setTimeout(() => setStatusMessage(''), 4000);
    } catch (err) {
      alert('Failed to delete appointment: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleOpenEditDoctor = (doc) => {
    setSelectedDoctorEdit(doc);
    setEditFormData({
      specialization: doc.specialization,
      departmentId: doc.departmentId || (departments[0]?.id || 1),
      consultationFee: doc.consultationFee,
      experienceYears: doc.experienceYears,
      rating: doc.rating,
      bio: doc.bio
    });
  };

  const handleSaveDoctorProfile = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/doctors/${selectedDoctorEdit.id}`, editFormData);
      setStatusMessage(`Updated profile and allocation for Dr. ${selectedDoctorEdit.name}!`);
      setSelectedDoctorEdit(null);
      fetchAdminData();
      setTimeout(() => setStatusMessage(''), 4000);
    } catch (err) {
      alert('Failed to update doctor profile');
    }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '2rem 1.5rem' }} className="animate-fade-in">
      {/* Title */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#A855F7', marginBottom: '4px' }}>
          <Code2 size={20} />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Developer & Platform Administrator Console
          </span>
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Master Healthcare & Chamber Operations</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          As the platform creators, oversee smooth operations across all doctor schedules, pharmacy chambers, and patient appointments.
        </p>
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
          <ShieldCheck size={18} />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '2rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          id="tab-admin-analytics"
        >
          <BarChart3 size={16} />
          <span>Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('approvals')}
          className={`btn ${activeTab === 'approvals' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          id="tab-admin-approvals"
          style={{ position: 'relative' }}
        >
          <Bell size={16} />
          <span>Pending Approvals</span>
          {pendingUsers.length > 0 && (
            <span style={{
              position: 'absolute', top: '-6px', right: '-6px',
              background: '#EF4444', color: '#fff',
              fontSize: '0.65rem', fontWeight: 800,
              borderRadius: '50%', width: '18px', height: '18px',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>{pendingUsers.length}</span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('doctors')}
          className={`btn ${activeTab === 'doctors' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          id="tab-admin-doctors"
        >
          <Stethoscope size={16} />
          <span>Manage Doctors ({doctors.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pharmacies')}
          className={`btn ${activeTab === 'pharmacies' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          id="tab-admin-pharmacies"
        >
          <Building2 size={16} />
          <span>Manage Pharmacies ({pharmacies.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('appointments')}
          className={`btn ${activeTab === 'appointments' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          id="tab-admin-appointments"
        >
          <Calendar size={16} />
          <span>Manage Appointments ({allAppointments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`btn ${activeTab === 'audit' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          id="tab-admin-audit"
        >
          <Lock size={16} />
          <span>Immutable Audit Logs ({auditLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: ANALYTICS */}
      {activeTab === 'analytics' && stats && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Total Consultations</span>
                <Calendar size={18} color="var(--primary)" />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats.totalAppointments}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {stats.confirmedAppointments} Confirmed • {stats.pendingAppointments} In-Hold
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Total Revenue</span>
                <IndianRupee size={18} color="#10B981" />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#34D399' }}>₹{stats.totalRevenue}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Collected via Razorpay Gateway
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Clinical Staff</span>
                <Stethoscope size={18} color="#6366F1" />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats.totalDoctors}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Across {departments.length} Medical Departments
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Cancellation Rate</span>
                <TrendingUp size={18} color="#FB7185" />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: stats.cancellationRate > 15 ? '#FB7185' : '#38BDF8' }}>
                {stats.cancellationRate}%
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {stats.cancelledAppointments} Cancelled Consultations
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PENDING APPROVALS */}
      {activeTab === 'approvals' && (
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-xl)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            Board Review Queue: Pending Registrations
          </h2>

          {pendingUsers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              <CheckCircle size={40} color="#10B981" style={{ margin: '0 auto 12px' }} />
              <p>No accounts awaiting review. All doctors and pharmacy chambers are verified!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {pendingUsers.map(u => (
                <div key={u.id} className="card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>{u.name}</h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>{u.email} • {u.role}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>📍 {u.address || 'Location specified during registration'}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleApprove(u.id)} className="btn btn-primary btn-sm">
                      <CheckCircle size={14} /> Approve & Grant Access
                    </button>
                    <button onClick={() => handleReject(u.id, u.name)} className="btn btn-secondary btn-sm" style={{ color: '#EF4444' }}>
                      <XCircle size={14} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MANAGE DOCTORS */}
      {activeTab === 'doctors' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>Registered Doctors Management</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Add new specialist doctors or remove doctors from the system.</p>
            </div>
            <button onClick={() => setShowAddDoctorModal(true)} className="btn btn-primary btn-sm">
              <UserPlus size={16} />
              <span>Add New Doctor</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {doctors.map(doc => (
              <div key={doc.id} className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <img src={doc.photoUrl} alt={doc.name} style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} />
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>{formatDoctorName(doc.name)}</h3>
                      <div style={{ fontSize: '0.8rem', color: 'var(--secondary)', fontWeight: 600 }}>{doc.specialization}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{doc.city || 'Uttarpara'}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    Fee: ₹{doc.consultationFee} • Experience: {doc.experienceYears} yrs • Rating: ★{doc.rating}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                  <button onClick={() => handleOpenEditDoctor(doc)} className="btn btn-secondary btn-sm">
                    <Edit size={14} /> Edit
                  </button>
                  <button onClick={() => handleDeleteDoctor(doc.id, doc.name)} className="btn btn-secondary btn-sm" style={{ color: '#EF4444' }}>
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Doctor Modal */}
          {showAddDoctorModal && (
            <div className="modal-overlay">
              <div className="modal-content" style={{ maxWidth: '540px', padding: '1.75rem' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1rem' }}>Add New Doctor</h2>
                <form onSubmit={handleCreateDoctor}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div className="form-group">
                      <label className="form-label">Doctor Name</label>
                      <input type="text" className="form-input" value={newDoctorForm.name} onChange={e => setNewDoctorForm({ ...newDoctorForm, name: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input type="email" className="form-input" value={newDoctorForm.email} onChange={e => setNewDoctorForm({ ...newDoctorForm, email: e.target.value })} required />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div className="form-group">
                      <label className="form-label">Specialization</label>
                      <input type="text" className="form-input" value={newDoctorForm.specialization} onChange={e => setNewDoctorForm({ ...newDoctorForm, specialization: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Department</label>
                      <select className="form-select" value={newDoctorForm.departmentId} onChange={e => setNewDoctorForm({ ...newDoctorForm, departmentId: e.target.value })}>
                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    <div className="form-group">
                      <label className="form-label">Fee (₹)</label>
                      <input type="number" className="form-input" value={newDoctorForm.consultationFee} onChange={e => setNewDoctorForm({ ...newDoctorForm, consultationFee: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">City</label>
                      <input type="text" className="form-input" value={newDoctorForm.city} onChange={e => setNewDoctorForm({ ...newDoctorForm, city: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Locality</label>
                      <input type="text" className="form-input" value={newDoctorForm.locality} onChange={e => setNewDoctorForm({ ...newDoctorForm, locality: e.target.value })} required />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                    <button type="button" onClick={() => setShowAddDoctorModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create Doctor</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: MANAGE PHARMACIES */}
      {activeTab === 'pharmacies' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>Visiting Pharmacy Chambers Management</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Add new polyclinics/pharmacies or remove chambers.</p>
            </div>
            <button onClick={() => setShowAddPharmacyModal(true)} className="btn btn-primary btn-sm">
              <PlusCircle size={16} />
              <span>Add New Pharmacy</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {pharmacies.map(pharm => (
              <div key={pharm.id} className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>{pharm.name}</h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, marginTop: '2px' }}>
                    📍 {pharm.locality}, {pharm.city}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {pharm.address} • Phone: {pharm.phone}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginTop: '6px', fontWeight: 600 }}>
                    Hours: {pharm.operatingHours}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                  <button onClick={() => handleDeletePharmacy(pharm.id, pharm.name)} className="btn btn-secondary btn-sm" style={{ color: '#EF4444' }}>
                    <Trash2 size={14} /> Delete Pharmacy
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Pharmacy Modal */}
          {showAddPharmacyModal && (
            <div className="modal-overlay">
              <div className="modal-content" style={{ maxWidth: '520px', padding: '1.75rem' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1rem' }}>Add New Pharmacy Chamber</h2>
                <form onSubmit={handleCreatePharmacy}>
                  <div className="form-group">
                    <label className="form-label">Pharmacy Chamber Name</label>
                    <input type="text" className="form-input" value={newPharmacyForm.name} onChange={e => setNewPharmacyForm({ ...newPharmacyForm, name: e.target.value })} placeholder="e.g. Bhadrakali Polyclinic & Medicine House" required />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div className="form-group">
                      <label className="form-label">Login Email</label>
                      <input type="email" className="form-input" value={newPharmacyForm.email} onChange={e => setNewPharmacyForm({ ...newPharmacyForm, email: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone</label>
                      <input type="text" className="form-input" value={newPharmacyForm.phone} onChange={e => setNewPharmacyForm({ ...newPharmacyForm, phone: e.target.value })} required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Address</label>
                    <input type="text" className="form-input" value={newPharmacyForm.address} onChange={e => setNewPharmacyForm({ ...newPharmacyForm, address: e.target.value })} placeholder="GT Road, Uttarpara" required />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div className="form-group">
                      <label className="form-label">City</label>
                      <input type="text" className="form-input" value={newPharmacyForm.city} onChange={e => setNewPharmacyForm({ ...newPharmacyForm, city: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Locality</label>
                      <input type="text" className="form-input" value={newPharmacyForm.locality} onChange={e => setNewPharmacyForm({ ...newPharmacyForm, locality: e.target.value })} required />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                    <button type="button" onClick={() => setShowAddPharmacyModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create Pharmacy</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: MANAGE APPOINTMENTS */}
      {activeTab === 'appointments' && (
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-xl)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            All Patient Appointments ({allAppointments.length})
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '10px 12px' }}>#ID</th>
                  <th style={{ padding: '10px 12px' }}>Patient</th>
                  <th style={{ padding: '10px 12px' }}>Doctor</th>
                  <th style={{ padding: '10px 12px' }}>Chamber</th>
                  <th style={{ padding: '10px 12px' }}>Slot Time</th>
                  <th style={{ padding: '10px 12px' }}>Status</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allAppointments.map(appt => (
                  <tr key={appt.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '12px' }}>#{appt.id}</td>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{appt.patientName}</td>
                    <td style={{ padding: '12px' }}>{formatDoctorName(appt.doctorName)}</td>
                    <td style={{ padding: '12px' }}>{appt.chamberName || appt.pharmacyName || 'OPD'}</td>
                    <td style={{ padding: '12px' }}>{new Date(appt.slotDatetime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
                    <td style={{ padding: '12px' }}>
                      <span className={`badge badge-${appt.status.toLowerCase()}`}>{appt.status}</span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <button onClick={() => handleDeleteAppointment(appt.id)} className="btn btn-secondary btn-sm" style={{ color: '#EF4444' }}>
                        <Trash2 size={13} /> Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-xl)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            System Audit Trail Logs
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '10px 12px' }}>Timestamp</th>
                  <th style={{ padding: '10px 12px' }}>Action</th>
                  <th style={{ padding: '10px 12px' }}>User</th>
                  <th style={{ padding: '10px 12px' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map(log => (
                  <tr key={log.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '10px 12px' }}>{new Date(log.timestamp).toLocaleString()}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--primary)' }}>{log.action}</td>
                    <td style={{ padding: '10px 12px' }}>{log.performedByEmail || 'System'}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Doctor Allocation Modal */}
      {selectedDoctorEdit && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '540px', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1.25rem' }}>
              Edit Allocation for {formatDoctorName(selectedDoctorEdit.name)}
            </h3>

            <form onSubmit={handleSaveDoctorProfile}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">Clinical Department</label>
                <select
                  className="form-select"
                  value={editFormData.departmentId}
                  onChange={(e) => setEditFormData({ ...editFormData, departmentId: Number(e.target.value) })}
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">Specialization</label>
                <input
                  type="text"
                  className="form-input"
                  value={editFormData.specialization}
                  onChange={(e) => setEditFormData({ ...editFormData, specialization: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label className="form-label">Fee (INR)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={editFormData.consultationFee}
                    onChange={(e) => setEditFormData({ ...editFormData, consultationFee: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Experience (Years)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={editFormData.experienceYears}
                    onChange={(e) => setEditFormData({ ...editFormData, experienceYears: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Doctor Bio</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  value={editFormData.bio}
                  onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setSelectedDoctorEdit(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" id="btn-save-doctor-edit">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
