import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Lock,
  Search,
  Filter,
  Download,
  CheckCircle,
  AlertTriangle,
  Clock,
  User,
  Activity,
  FileText,
  Key,
  Database,
  Eye,
  X,
  RefreshCw,
  Bell,
  ArrowRight,
  BarChart3
} from 'lucide-react';

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState(null);
  const [selectedPendingUser, setSelectedPendingUser] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    fetchAuditData();
  }, []);

  const fetchAuditData = async () => {
    setRefreshing(true);
    try {
      const [logsRes, pendingRes] = await Promise.all([
        api.get('/admin/audit-logs'),
        api.get('/admin/pending-approvals')
      ]);
      setLogs(logsRes.data || []);
      setPendingUsers(pendingRes.data || []);
    } catch (err) {
      console.error('Failed to load audit logs', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/approve`);
      setStatusMessage('Staff account approved! The user has been granted access.');
      setSelectedPendingUser(null);
      fetchAuditData();
    } catch (err) {
      alert('Failed to approve account: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleReject = async (userId, name) => {
    if (!window.confirm(`Are you sure you want to reject and revoke access for "${name}"?`)) return;
    try {
      await api.put(`/admin/users/${userId}/reject`);
      setStatusMessage(`Account for "${name}" has been rejected.`);
      setSelectedPendingUser(null);
      fetchAuditData();
    } catch (err) {
      alert('Failed to reject account: ' + (err.response?.data?.message || err.message));
    }
  };

  // Categorize log action
  const getCategory = (action = '') => {
    const act = action.toUpperCase();
    if (act.includes('LOGIN') || act.includes('AUTH') || act.includes('REGISTER') || act.includes('LOGOUT')) {
      return 'SECURITY';
    }
    if (act.includes('PRESCRIPTION') || act.includes('ALLERGY') || act.includes('LAB') || act.includes('REPORT')) {
      return 'CLINICAL';
    }
    if (act.includes('APPOINTMENT') || act.includes('SLOT') || act.includes('PAYMENT') || act.includes('REFUND')) {
      return 'APPOINTMENTS';
    }
    if (act.includes('ADMIN') || act.includes('ROLE') || act.includes('APPROV') || act.includes('REJECT')) {
      return 'GOVERNANCE';
    }
    return 'SYSTEM';
  };

  const getActionBadgeColor = (action = '') => {
    const cat = getCategory(action);
    switch (cat) {
      case 'SECURITY':
        return { bg: 'rgba(59, 130, 246, 0.12)', border: 'rgba(59, 130, 246, 0.3)', text: '#3B82F6' };
      case 'CLINICAL':
        return { bg: 'rgba(139, 92, 246, 0.12)', border: 'rgba(139, 92, 246, 0.3)', text: '#8B5CF6' };
      case 'APPOINTMENTS':
        return { bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.3)', text: '#10B981' };
      case 'GOVERNANCE':
        return { bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)', text: '#F59E0B' };
      default:
        return { bg: 'rgba(107, 114, 128, 0.12)', border: 'rgba(107, 114, 128, 0.3)', text: 'var(--text-secondary)' };
    }
  };

  // Filter logs
  const filteredLogs = logs.filter(log => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      (log.action || '').toLowerCase().includes(query) ||
      (log.details || '').toLowerCase().includes(query) ||
      (log.tableAffected || '').toLowerCase().includes(query) ||
      String(log.userId || '').includes(query) ||
      String(log.recordId || '').includes(query);

    if (!matchesSearch) return false;

    if (selectedCategory !== 'ALL') {
      return getCategory(log.action) === selectedCategory;
    }

    return true;
  });

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Log ID', 'Timestamp (UTC)', 'User ID', 'Action', 'Table Affected', 'Record ID', 'Details'];
    const rows = filteredLogs.map(l => [
      l.id,
      l.timestamp,
      l.userId || 'System',
      `"${(l.action || '').replace(/"/g, '""')}"`,
      l.tableAffected || '',
      l.recordId || '',
      `"${(l.details || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AuraHealth_Audit_Trail_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '2rem 1.5rem' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#A855F7', marginBottom: '4px' }}>
            <Lock size={20} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Hospital Security & Compliance
            </span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Immutable Audit Trail</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Append-only, cryptographically verified audit records for HIPAA, NABH, and security compliance.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={fetchAuditData}
            className="btn btn-secondary"
            disabled={refreshing}
            id="btn-refresh-audit"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            <span>Refresh Stream</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="btn btn-primary"
            disabled={filteredLogs.length === 0}
            id="btn-export-csv"
          >
            <Download size={16} />
            <span>Export CSV</span>
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

      {/* Pending Approvals Alert Banner */}
      {pendingUsers.length > 0 && (
        <div style={{
          marginBottom: '1.75rem',
          padding: '1.25rem 1.5rem',
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: '#F59E0B',
              color: '#000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bell size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                {pendingUsers.length} Staff {pendingUsers.length === 1 ? 'Account' : 'Accounts'} Awaiting Credential Verification
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                New doctors or pharmacists registered requiring administrator medical council and license validation.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {pendingUsers.map(pu => (
              <button
                key={pu.id}
                onClick={() => setSelectedPendingUser(pu)}
                className="btn btn-secondary btn-sm"
                style={{ background: 'var(--bg-card)' }}
              >
                <span>Verify {pu.name}</span>
                <ArrowRight size={14} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* KPI Stats Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #A855F7' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Total Immutable Records</span>
            <Database size={20} color="#A855F7" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800 }}>{logs.length}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Append-only ledger entries</span>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #3B82F6' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Security & Auth Events</span>
            <Key size={20} color="#3B82F6" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800 }}>
            {logs.filter(l => getCategory(l.action) === 'SECURITY').length}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Logins, auth & registration</span>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #8B5CF6' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Clinical & Rx Modifications</span>
            <Activity size={20} color="#8B5CF6" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800 }}>
            {logs.filter(l => getCategory(l.action) === 'CLINICAL').length}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Prescriptions & lab access</span>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #10B981' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Appointments & Visits</span>
            <CheckCircle size={20} color="#10B981" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800 }}>
            {logs.filter(l => getCategory(l.action) === 'APPOINTMENTS').length}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Slot holds & check-ins</span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '280px', maxWidth: '480px' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by action, details, user ID, or target table..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '40px' }}
            id="input-audit-search"
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Filter size={16} color="var(--text-muted)" />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Category:</span>

          {['ALL', 'SECURITY', 'CLINICAL', 'APPOINTMENTS', 'GOVERNANCE'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
            >
              {cat === 'ALL' ? 'All Events' : cat.charAt(0) + cat.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      {loading ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading security audit logs...</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
          <Lock size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.6 }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No audit records found</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>
            {searchQuery
              ? `No audit logs match "${searchQuery}". Try a different keyword.`
              : 'Audit events will appear here as users authenticate and interact with medical records.'}
          </p>
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="btn btn-secondary btn-sm">
              Clear Search Filter
            </button>
          )}
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)' }}>Log ID</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)' }}>Timestamp</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)' }}>Action</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)' }}>Actor</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)' }}>Target</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)' }}>Event Details</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)', textAlign: 'right' }}>Inspect</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(log => {
                  const badge = getActionBadgeColor(log.action);
                  return (
                    <tr
                      key={log.id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        transition: 'background 0.15s ease'
                      }}
                      className="hover-row"
                    >
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-muted)' }}>
                        #{log.id}
                      </td>

                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Clock size={13} color="var(--text-muted)" />
                          <span>
                            {new Date(log.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            {' '}
                            {new Date(log.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: badge.bg,
                          border: `1px solid ${badge.border}`,
                          color: badge.text,
                          whiteSpace: 'nowrap'
                        }}>
                          {log.action}
                        </span>
                      </td>

                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                        {log.userId ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <User size={13} color="var(--text-muted)" />
                            <span>User #{log.userId}</span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>System Engine</span>
                        )}
                      </td>

                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                        {log.tableAffected ? (
                          <span>{log.tableAffected} {log.recordId ? `#${log.recordId}` : ''}</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>

                      <td style={{ padding: '12px 16px', maxWidth: '380px' }}>
                        <span style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          color: 'var(--text-primary)'
                        }}>
                          {log.details || '—'}
                        </span>
                      </td>

                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px' }}
                          title="Inspect full audit record"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Log Inspection Modal */}
      {selectedLog && (
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
          <div className="card" style={{ maxWidth: '600px', width: '100%', padding: '1.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock size={18} color="#A855F7" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                  Audit Record #{selectedLog.id}
                </h3>
              </div>
              <button onClick={() => setSelectedLog(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
              <div>
                <strong style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>Action:</strong>
                <span style={{ fontWeight: 700 }}>{selectedLog.action}</span>
              </div>

              <div>
                <strong style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>Timestamp:</strong>
                <span>{new Date(selectedLog.timestamp).toISOString()}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <strong style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>User ID:</strong>
                  <span>{selectedLog.userId || 'System (Automated Service)'}</span>
                </div>
                <div>
                  <strong style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>Table / Target:</strong>
                  <span>{selectedLog.tableAffected || 'N/A'} {selectedLog.recordId ? `(ID: ${selectedLog.recordId})` : ''}</span>
                </div>
              </div>

              <div>
                <strong style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>Event Details:</strong>
                <div style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-subtle)',
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  lineHeight: 1.5,
                  wordBreak: 'break-all'
                }}>
                  {selectedLog.details || 'No details payload recorded.'}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedLog(null)} className="btn btn-secondary btn-sm">
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Staff Verification Modal */}
      {selectedPendingUser && (
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
          <div className="card" style={{ maxWidth: '600px', width: '100%', padding: '1.75rem', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={20} color="#F59E0B" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                  Staff Credential Verification
                </h3>
              </div>
              <button onClick={() => setSelectedPendingUser(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              <div><strong>Name:</strong> {selectedPendingUser.name}</div>
              <div><strong>Email:</strong> {selectedPendingUser.email}</div>
              <div><strong>Role Applied:</strong> <span style={{ fontWeight: 700, color: '#F59E0B' }}>{selectedPendingUser.role}</span></div>
              {selectedPendingUser.phone && <div><strong>Phone:</strong> {selectedPendingUser.phone}</div>}
              {selectedPendingUser.degree && <div><strong>Medical Degree / Qualification:</strong> {selectedPendingUser.degree}</div>}
              {selectedPendingUser.specialization && <div><strong>Specialization:</strong> {selectedPendingUser.specialization}</div>}
              {selectedPendingUser.licenseNumber && <div><strong>Pharmacy License No.:</strong> {selectedPendingUser.licenseNumber}</div>}
              {selectedPendingUser.clinicAddress && <div><strong>Clinic Address:</strong> {selectedPendingUser.clinicAddress}</div>}
              {selectedPendingUser.pharmacyAddress && <div><strong>Pharmacy Address:</strong> {selectedPendingUser.pharmacyAddress}</div>}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
              <button
                onClick={() => handleReject(selectedPendingUser.id, selectedPendingUser.name)}
                className="btn btn-secondary btn-sm"
                style={{ color: '#EF4444' }}
              >
                Reject & Revoke
              </button>
              <button
                onClick={() => handleApprove(selectedPendingUser.id)}
                className="btn btn-primary btn-sm"
              >
                <CheckCircle size={16} />
                <span>Approve Account</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
