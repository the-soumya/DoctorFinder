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
  Bell
} from 'lucide-react';
import { formatDoctorName } from '../utils/formatters';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('analytics');
  const [selectedDoctorEdit, setSelectedDoctorEdit] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  useEffect(() => {
    fetchAdminData();
    fetchPendingApprovals();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, auditRes, docsRes, deptsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/audit-logs'),
        api.get('/doctors'),
        api.get('/departments')
      ]);
      setStats(statsRes.data);
      setAuditLogs(auditRes.data);
      setDoctors(docsRes.data);
      setDepartments(deptsRes.data);
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
    } catch (err) {
      alert('Failed to approve user: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleReject = async (userId, name) => {
    if (!window.confirm(`Reject and revoke account for "${name}"? They will not be able to log in.`)) return;
    try {
      await api.put(`/admin/users/${userId}/reject`);
      setStatusMessage(`Account for "${name}" has been rejected.`);
      fetchPendingApprovals();
    } catch (err) {
      alert('Failed to reject user: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleOpenEditDoctor = (doc) => {
    setSelectedDoctorEdit(doc);
    setEditFormData({
      specialization: doc.specialization,
      departmentId: doc.departmentId,
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
      setStatusMessage(`Updated profile and department allocation for Dr. ${selectedDoctorEdit.name}!`);
      setSelectedDoctorEdit(null);
      fetchAdminData();
    } catch (err) {
      alert('Failed to update doctor profile');
    }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '2rem 1.5rem' }} className="animate-fade-in">
      {/* Title */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#A855F7', marginBottom: '4px' }}>
          <ShieldCheck size={20} />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Hospital Enterprise Administration
          </span>
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Executive Analytics & Audit Console</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Hospital-wide performance metrics, immutable audit trail monitoring, and clinical department management.
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
          <span>Analytics Dashboard</span>
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
          onClick={() => setActiveTab('audit')}
          className={`btn ${activeTab === 'audit' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          id="tab-admin-audit"
        >
          <Lock size={16} />
          <span>Immutable Audit Logs ({auditLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('doctors')}
          className={`btn ${activeTab === 'doctors' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          id="tab-admin-doctors"
        >
          <Stethoscope size={16} />
          <span>Doctor & Department Allocation ({doctors.length})</span>
        </button>
      </div>

      {/* TAB 1: ANALYTICS DASHBOARD */}
      {activeTab === 'analytics' && stats && (
        <div>
          {/* Key KPI Metric Cards */}
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

          {/* Breakdown Charts Section */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* Department Breakdown */}
            <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: 'var(--radius-xl)' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={18} color="var(--primary)" />
                <span>Appointments by Department</span>
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stats.departmentDistribution?.map((dept, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600 }}>{dept.department}</span>
                      <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{dept.count} Consultations</span>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${Math.min(100, (dept.count / Math.max(1, stats.totalAppointments)) * 100)}%`,
                        background: 'var(--grad-primary)',
                        borderRadius: '4px'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Doctor Load Breakdown */}
            <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: 'var(--radius-xl)' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} color="#6366F1" />
                <span>Doctor Workload Distribution</span>
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stats.doctorLoad?.map((doc, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600 }}>{doc.doctorName}</span>
                      <span style={{ color: '#A5B4FC', fontWeight: 700 }}>{doc.appointmentCount} Patients</span>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${Math.min(100, (doc.appointmentCount / Math.max(1, stats.totalAppointments)) * 100)}%`,
                        background: 'var(--grad-accent)',
                        borderRadius: '4px'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: PENDING APPROVALS */}
      {activeTab === 'approvals' && (
        <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: 'var(--radius-xl)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} color="#F59E0B" />
            <span>Pending Account Approvals</span>
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Doctor and Pharmacy accounts require manual verification before they can log in.
          </p>

          {pendingUsers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <CheckCircle size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
              <p>No pending approvals — all accounts are up to date.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {pendingUsers.map(u => (
                <div key={u.id} className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }} id={`pending-user-${u.id}`}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '50%',
                    background: u.role === 'ROLE_DOCTOR' ? 'rgba(99,102,241,0.2)' : 'rgba(245,158,11,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    {u.role === 'ROLE_DOCTOR' ? <Stethoscope size={22} color="#A5B4FC" /> : <Users size={22} color="#FCD34D" />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>{u.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{u.email} • {u.phone}</div>
                    <div style={{ marginTop: '4px' }}>
                      <span style={{
                        fontSize: '0.72rem', fontWeight: 700, padding: '2px 10px',
                        background: u.role === 'ROLE_DOCTOR' ? 'rgba(99,102,241,0.15)' : 'rgba(245,158,11,0.15)',
                        color: u.role === 'ROLE_DOCTOR' ? '#A5B4FC' : '#FCD34D',
                        borderRadius: 'var(--radius-full)'
                      }}>
                        {u.role === 'ROLE_DOCTOR' ? '🩺 Doctor' : '💊 Pharmacy / Receptionist'}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <button
                      className="btn btn-primary btn-sm"
                      id={`btn-approve-${u.id}`}
                      onClick={() => handleApprove(u.id)}
                      style={{ gap: '6px' }}
                    >
                      <CheckCircle size={14} />
                      <span>Approve</span>
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      id={`btn-reject-${u.id}`}
                      onClick={() => handleReject(u.id, u.name)}
                      style={{ gap: '6px', color: '#FB7185', borderColor: 'rgba(244,63,94,0.3)' }}
                    >
                      <XCircle size={14} />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: IMMUTABLE AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: 'var(--radius-xl)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock size={18} color="#10B981" />
                <span>Immutable Append-Only Audit Trail</span>
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Protected at the PostgreSQL role level against UPDATE and DELETE operations.
              </p>
            </div>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              color: '#34D399',
              fontWeight: 700
            }}>
              <span>🛡️ Tamper-Proof Trigger Enforced</span>
            </div>
          </div>

          <div style={{ overflowX: 'auto', maxHeight: '600px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '10px 14px' }}>Timestamp</th>
                  <th style={{ padding: '10px 14px' }}>Action</th>
                  <th style={{ padding: '10px 14px' }}>Table</th>
                  <th style={{ padding: '10px 14px' }}>User ID</th>
                  <th style={{ padding: '10px 14px' }}>Record ID</th>
                  <th style={{ padding: '10px 14px' }}>Event Details</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map(log => (
                  <tr key={log.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }} id={`audit-log-row-${log.id}`}>
                    <td style={{ padding: '12px 14px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span className="badge badge-completed" style={{ fontSize: '0.7rem' }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', fontFamily: 'monospace', color: 'var(--primary)' }}>
                      {log.tableAffected}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      {log.userId ? `#${log.userId}` : 'SYSTEM'}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      {log.recordId ? `#${log.recordId}` : '-'}
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-primary)' }}>
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: DOCTOR ALLOCATION & PROFILES */}
      {activeTab === 'doctors' && (
        <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: 'var(--radius-xl)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            Doctor Profiles & Clinical Department Allocations
          </h2>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 16px' }}>Doctor Name</th>
                  <th style={{ padding: '12px 16px' }}>Specialization</th>
                  <th style={{ padding: '12px 16px' }}>Department</th>
                  <th style={{ padding: '12px 16px' }}>Fee (INR)</th>
                  <th style={{ padding: '12px 16px' }}>Rating</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map(doc => (
                  <tr key={doc.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700 }}>{formatDoctorName(doc.name)}</td>
                    <td style={{ padding: '14px 16px', color: 'var(--primary)' }}>{doc.specialization}</td>
                    <td style={{ padding: '14px 16px' }}>{doc.departmentName}</td>
                    <td style={{ padding: '14px 16px' }}>₹{doc.consultationFee}</td>
                    <td style={{ padding: '14px 16px' }}>★ {doc.rating}</td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleOpenEditDoctor(doc)}
                        className="btn btn-secondary btn-sm"
                        id={`btn-edit-doctor-${doc.id}`}
                      >
                        <Edit size={14} />
                        <span>Edit Allocation</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EDIT DOCTOR MODAL */}
      {selectedDoctorEdit && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3000,
          padding: '1rem'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '540px', padding: '2rem', background: 'var(--bg-surface)' }}>
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
