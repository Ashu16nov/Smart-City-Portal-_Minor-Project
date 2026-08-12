import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import socket from '../utils/socket';
import './Auth.css';
import { toast, ToastContainer } from 'react-toastify';

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, progress: 0, resolved: 0, closed: 0, rejected: 0, users: 0, feedbacks: 0 });
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [serverOnline, setServerOnline] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [adminNoteInput, setAdminNoteInput] = useState('');

  useEffect(() => {
    fetchData();

    // Socket listeners for real-time admin view
    socket.on('new_complaint', (complaint) => {
      setComplaints(prev => [complaint, ...prev]);
      fetchStats();
      toast.info(`🔔 New Grievance: ${complaint.complaintId}`);
    });

    socket.on('status_update', (updated) => {
      setComplaints(prev => prev.map(c => c.complaintId === updated.complaintId ? updated : c));
      fetchStats();
    });

    return () => {
      socket.off('new_complaint');
      socket.off('status_update');
    };
  }, []);

  const fetchData = async () => {
    try {
      const cached = sessionStorage.getItem('adminDashCache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) setComplaints(parsed);
      }
    } catch (e) {}

    try {
      const resp = await api.get('/complaints');
      if (Array.isArray(resp.data)) {
        setComplaints(resp.data);
        sessionStorage.setItem('adminDashCache', JSON.stringify(resp.data));
      }
      fetchStats();
      setServerOnline(true);
    } catch (err) {
      setServerOnline(false);
    }
  };

  const fetchStats = async () => {
    try {
      const cached = sessionStorage.getItem('adminStatsCache');
      if (cached) setStats(JSON.parse(cached));
    } catch (e) {}

    try {
      const res = await api.get('/stats');
      setStats(res.data);
      sessionStorage.setItem('adminStatsCache', JSON.stringify(res.data));
    } catch (err) {}
  };

  const handleUpdateStatus = async (idToUse, status, adminNote = '') => {
    let finalNote = adminNote;
    if (status === 'Rejected' && !finalNote) {
      finalNote = window.prompt("REJECTION PROTOCOL: Please enter the specific reason for rejecting this grievance:");
      if (!finalNote) {
        toast.warning("Rejection cancelled: Reason is mandatory for citizens.");
        return;
      }
    }
    
    try {
      await api.put(`/complaints/update/${idToUse}`, { status, adminNote: finalNote });
      toast.success(`Complaint status set to ${status}`);
      fetchData(); // Fetch latest updates immediately to re-render UI
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (complaintId) => {
    if (!window.confirm("Permanently wipe this grievance record from the database? This cannot be undone.")) return;
    try {
      await api.delete(`/complaints/${complaintId}`);
      setComplaints(prev => prev.filter(c => c.complaintId !== complaintId));
      toast.success("Record successfully deleted.");
    } catch (err) {
      toast.error('Failed to delete complaint from database');
    }
  };

  const handleEditContent = async (complaintId) => {
    const newTitle = window.prompt("Admin CRUD Update: Enter new complaint title:");
    if (!newTitle) return;
    try {
       await api.put(`/complaints/update/${complaintId}`, { title: newTitle });
       toast.success("Complaint content updated successfully!");
       fetchData();
    } catch (err) {
       toast.error("Failed to update complaint content");
    }
  };

  const handleViewDetails = async (c) => {
    try {
      const res = await api.get(`/complaints/${c.complaintId || c._id}`);
      setSelectedComplaint(res.data);
      setAdminNoteInput(res.data.adminNote || '');
      setShowModal(true);
    } catch (err) {
      setSelectedComplaint(c);
      setShowModal(true);
    }
  };

  const handleSaveAdminNote = async () => {
    if (!selectedComplaint) return;
    try {
      await api.put(`/complaints/update/${selectedComplaint.complaintId || selectedComplaint._id}`, { adminNote: adminNoteInput });
      toast.success("Remark updated successfully!");
      fetchData();
    } catch (err) {
      toast.error("Failed to save remark");
    }
  };

  const safeComplaints = Array.isArray(complaints) ? complaints : [];
  const filteredList = safeComplaints.filter(c => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = (c.complaintId || '').toLowerCase().includes(term) || 
                          (c.userName || '').toLowerCase().includes(term) || 
                          (c.title || '').toLowerCase().includes(term);
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="dashboard-wrapper admin-theme" style={{ paddingTop: '20px', background: '#f0f4f8', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <ToastContainer />
      <header className="admin-hero" style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{
          background: serverOnline ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.1)',
          color: serverOnline ? '#065f46' : '#991b1b',
          border: `1px solid ${serverOnline ? '#6ee7b7' : '#fca5a5'}`,
          borderRadius: '20px', padding: '6px 18px', display: 'inline-block', fontSize: '13px', fontWeight: '700', marginBottom: '15px'
        }}>
          {serverOnline ? `✅ Real-time Active | ${stats.total} Total Grievances` : '⚠️ Connection Offline'}
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#92400e' }}>Operational Monitoring Center</h1>
        <p style={{ color: '#64748b' }}>Oversee city-wide grievances with real-time performance tracking.</p>
      </header>

      {/* Grid for Active Statuses */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px', padding: '0 40px', marginBottom: '40px' }}>
        {[
          { label: 'Pending', count: stats.pending, color: '#f59e0b' },
          { label: 'In Progress', count: stats.progress, color: '#3b82f6' },
          { label: 'Resolved', count: stats.resolved, color: '#10b981' },
          { label: 'Rejected', count: stats.rejected, color: '#ef4444' },
          { label: 'Closed', count: stats.closed, color: '#6366f1' }
        ].map(s => (
          <div key={s.label} style={{ background: 'rgba(0,0,0,0.15)', backdropFilter: 'blur(8px)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>{s.label}</div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: s.color, marginTop: '5px' }}>{s.count}</div>
          </div>
        ))}
      </div>

      {/* Redesigned Incoming Grievances Section */}
      <div style={{ padding: '0 40px 40px 40px' }}>
        <h3 style={{ 
          color: '#1e293b', 
          fontSize: '18px', 
          fontWeight: '800', 
          marginBottom: '20px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          letterSpacing: '-0.025em'
        }}>
          <span style={{ 
            display: 'inline-block', 
            width: '12px', 
            height: '12px', 
            borderRadius: '50%', 
            background: '#f59e0b', 
            boxShadow: '0 0 0 4px rgba(245, 158, 11, 0.2)',
            animation: 'pulse 2s infinite' 
          }}></span>
          Incoming Grievances (Newest First)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {safeComplaints.filter(c => c.status === 'Pending').slice(0, 4).map(c => (
            <div key={c._id} style={{ 
              background: '#ffffff', 
              padding: '24px', 
              borderRadius: '20px', 
              border: '1px solid #e2e8f0', 
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.04), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              cursor: 'default'
            }} className="grievance-item-card">
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
                 <span style={{ 
                   fontSize: '13px', 
                   fontWeight: '800', 
                   color: '#f59e0b',
                   background: '#fffbeb',
                   padding: '4px 10px',
                   borderRadius: '8px'
                 }}>#{c.complaintId || 'N/A'}</span>
                 <span style={{ fontSize: '11px', fontWeight: '600', color: '#94a3b8' }}>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
               </div>
               <h4 style={{ color: '#0f172a', fontSize: '18px', fontWeight: '700', margin: '0 0 8px 0', lineHeight: '1.4' }}>{c.title}</h4>
               <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 20px 0', fontWeight: '500' }}>{c.category}</p>
               
               <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                  <button 
                    onClick={() => handleUpdateStatus(c.complaintId || c._id, 'Resolved')} 
                    style={{ 
                      flex: 1, 
                      background: '#10b981', 
                      color: 'white', 
                      border: 'none', 
                      padding: '12px', 
                      borderRadius: '12px', 
                      fontSize: '12px', 
                      fontWeight: '700', 
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.background = '#059669'}
                    onMouseOut={(e) => e.target.style.background = '#10b981'}
                  >RESOLVE</button>
                  <button 
                    onClick={() => handleUpdateStatus(c.complaintId || c._id, 'Rejected')} 
                    style={{ 
                      flex: 1, 
                      background: '#ef4444', 
                      color: 'white', 
                      border: 'none', 
                      padding: '12px', 
                      borderRadius: '12px', 
                      fontSize: '12px', 
                      fontWeight: '700', 
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.background = '#dc2626'}
                    onMouseOut={(e) => e.target.style.background = '#ef4444'}
                  >REJECT</button>
                  <button 
                    onClick={() => handleViewDetails(c)} 
                    style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '45px', 
                      background: '#f1f5f9', 
                      color: '#64748b', 
                      border: 'none', 
                      borderRadius: '12px', 
                      fontSize: '18px', 
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => { e.target.style.background = '#e2e8f0'; e.target.style.color = '#1e293b'; }}
                    onMouseOut={(e) => { e.target.style.background = '#f1f5f9'; e.target.style.color = '#64748b'; }}
                  >👁️</button>
               </div>
            </div>
          ))}
        </div>
      </div>

      {/* Master Table */}
      <div style={{ padding: '0 40px', marginBottom: '100px' }}>
        <div style={{ background: 'rgba(0,0,0,0.15)', backdropFilter: 'blur(8px)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
          <div style={{ padding: '20px 30px', background: 'rgba(0,0,0,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
               <input 
                type="text" 
                placeholder="Search CID or Citizen..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: '10px 20px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', width: '250px' }}
              />
              <select onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                <option value="all">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Rejected">Rejected</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: 'rgba(0,0,0,0.2)', color: 'rgba(255,255,255,0.6)', fontSize: '13px', textTransform: 'uppercase' }}>
              <tr>
                <th style={{ padding: '18px 30px' }}>Ticket ID</th>
                <th style={{ padding: '18px 20px' }}>Citizen</th>
                <th style={{ padding: '18px 20px' }}>Category / Title</th>
                <th style={{ padding: '18px 20px' }}>Status</th>
                <th style={{ padding: '18px 30px', textAlign: 'right' }}>Management</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map(c => (
                <tr key={c._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <td style={{ padding: '18px 30px', fontWeight: '700', color: '#fbbf24' }}>#{c.complaintId}</td>
                  <td style={{ padding: '18px 20px', fontWeight: '600', color: 'white' }}>{c.userName}</td>
                  <td style={{ padding: '18px 20px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: 'white' }}>{c.title}</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: c.adminNote ? '8px' : '0' }}>{c.category}</div>
                    {c.adminNote && (
                      <div style={{ 
                        fontSize: '11px', 
                        background: c.status === 'Rejected' ? 'rgba(239,68,68,0.1)' : 'rgba(251,191,36,0.1)', 
                        color: c.status === 'Rejected' ? '#fca5a5' : '#fde68a', 
                        padding: '6px 12px', 
                        borderRadius: '8px', 
                        border: `1px solid ${c.status === 'Rejected' ? 'rgba(239,68,68,0.2)' : 'rgba(251,191,36,0.2)'}`,
                        display: 'inline-block'
                      }}>
                        <strong>REASON:</strong> {c.adminNote}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '18px 20px' }}>
                    <span style={{
                      background: c.status === 'Pending' ? '#fff3c7' : c.status === 'Resolved' ? '#dcfce7' : '#e0e7ff',
                      color: c.status === 'Pending' ? '#92400e' : c.status === 'Resolved' ? '#166534' : '#3730a3',
                      padding: '6px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: '800'
                    }}>{c.status}</span>
                  </td>
                  <td style={{ padding: '18px 30px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '5px', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => handleViewDetails(c)}
                        title="Check Full Details & Remarks"
                        style={{ background: '#e0f2fe', color: '#0369a1', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '800' }}
                      >
                        📋 Check Details
                      </button>
                      <select 
                        value={c.status}
                        onChange={(e) => handleUpdateStatus(c.complaintId || c._id, e.target.value)}
                        style={{ padding: '6px', borderRadius: '6px', fontSize: '12px', border: '1px solid #cbd5e1', outline: 'none' }}
                      >
                        <option value="Pending">Set Pending</option>
                        <option value="In Progress">Set In Progress</option>
                        <option value="Resolved">Set Resolved</option>
                        <option value="Rejected">Set Rejected</option>
                        <option value="Closed">Archive/Close</option>
                      </select>
                      <button 
                        onClick={() => handleDelete(c.complaintId || c._id)} 
                        title="Delete record from database (CRUD)"
                        style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '800' }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Detail Modal */}
      {showModal && selectedComplaint && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '900px', borderRadius: '24px', overflow: 'hidden', display: 'flex', maxHeight: '90vh', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
            
            {/* Left Side: Info */}
            <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <span style={{ background: '#f3f4f6', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', color: '#374151' }}>#{selectedComplaint.complaintId}</span>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#9ca3af' }}>&times;</button>
              </div>
              
              <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#111827', marginBottom: '10px' }}>{selectedComplaint.title}</h2>
              <p style={{ color: '#ea580c', fontWeight: '700', fontSize: '14px', marginBottom: '20px' }}>{selectedComplaint.category}</p>
              
              <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '16px', marginBottom: '20px' }}>
                <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#6b7280', marginBottom: '8px' }}>Description</h4>
                <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>{selectedComplaint.description}</p>
              </div>
              
              <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                <div>
                   <h4 style={{ fontSize: '11px', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '4px' }}>Citizen</h4>
                   <p style={{ fontSize: '14px', fontWeight: '700' }}>{selectedComplaint.userName}</p>
                </div>
                <div>
                   <h4 style={{ fontSize: '11px', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '4px' }}>Location</h4>
                   <p style={{ fontSize: '14px', fontWeight: '700' }}>{selectedComplaint.location || 'Patna, Bihar'}</p>
                </div>
              </div>

              {/* Admin Remark Section */}
              <div style={{ borderTop: '2px dashed #e5e7eb', paddingTop: '20px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#111827', marginBottom: '10px' }}>Admin Response / Rejection Reason</h4>
                <textarea 
                  value={adminNoteInput}
                  onChange={(e) => setAdminNoteInput(e.target.value)}
                  placeholder="Enter administrative remarks or reason for rejection..."
                  style={{ width: '100%', height: '100px', padding: '15px', borderRadius: '12px', border: '1px solid #d1d5db', outline: 'none', fontSize: '14px', marginBottom: '15px' }}
                />
                <button 
                  onClick={handleSaveAdminNote}
                  style={{ background: '#147b59', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Save Remark
                </button>
              </div>
            </div>

            {/* Right Side: Image */}
            <div style={{ width: '40%', background: '#f3f4f6', position: 'relative' }}>
              {selectedComplaint.image ? (
                <img src={selectedComplaint.image} alt="Complaint Evidence" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af' }}>
                  <span style={{ fontSize: '48px' }}>🖼️</span>
                  <p style={{ fontSize: '12px', fontWeight: '700' }}>No Evidence Image</p>
                </div>
              )}
              <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px', background: 'rgba(255,255,255,0.9)', padding: '12px', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
                <span style={{ fontSize: '11px', color: '#6b7280' }}>Current Status</span>
                <div style={{ fontSize: '16px', fontWeight: '900', color: selectedComplaint.status === 'Rejected' ? '#ef4444' : '#147b59' }}>{selectedComplaint.status.toUpperCase()}</div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
