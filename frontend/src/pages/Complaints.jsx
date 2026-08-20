import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import ComplaintCard from '../components/ComplaintCard';
import { toast, ToastContainer } from 'react-toastify';
import socket from '../utils/socket';

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [adminSearch, setAdminSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0, rejected: 0, recentlyAdded: 0 });
  const [adminReason, setAdminReason] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    const userObj = JSON.parse(storedUser);
    setCurrentUser(userObj);
    fetchMyComplaints();

    // Real-time integration
    socket.on('status_update', (updatedComplaint) => {
      setComplaints(prev => prev.map(c => c.complaintId === updatedComplaint.complaintId ? updatedComplaint : c));
      toast.info(`Update: Complaint ${updatedComplaint.complaintId} status changed to ${updatedComplaint.status}`);
    });

    socket.on('new_complaint', (newComplaint) => {
      const currentUser = JSON.parse(localStorage.getItem('user'));
      if (currentUser.role === 'admin' || newComplaint.userId === currentUser.id || newComplaint.userId === currentUser._id) {
        setComplaints(prev => [newComplaint, ...prev]);
        toast.success("New grievance synchronized successfully!");
      }
    });

    return () => {
      socket.off('status_update');
      socket.off('new_complaint');
    };
  }, [navigate]);

  useEffect(() => {
    calculateStats(complaints);
  }, [complaints]);

  const displayedComplaints = complaints.filter(c => {
    let matchStatus = true;
    if (currentFilter === 'active') matchStatus = ['Submitted', 'Under Review', 'Assigned', 'In Progress'].includes(c.status);
    else if (currentFilter === 'resolved') matchStatus = (c.status === 'Resolved' || c.status === 'Closed');
    else if (currentFilter !== 'all') matchStatus = (c.status && c.status.toLowerCase() === currentFilter);

    let matchSearch = true;
    if (currentUser?.role === 'admin' && adminSearch) {
      matchSearch = (c.complaintId || '').toLowerCase().includes(adminSearch.toLowerCase());
    }

    return matchStatus && matchSearch;
  });

  const fetchMyComplaints = async () => {
    const cached = sessionStorage.getItem('complaintsCache');
    if (cached) {
      setComplaints(JSON.parse(cached));
    } else {
      setLoading(true);
    }

    try {
      const res = await api.get('/complaints');
      setComplaints(res.data);
      sessionStorage.setItem('complaintsCache', JSON.stringify(res.data));
    } catch (err) {
      toast.error("Failed to sync complaint history.");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (list) => {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    const newStats = {
      total: list.length,
      pending: list.filter(c => ['Submitted', 'Under Review', 'Assigned', 'In Progress'].includes(c.status)).length,
      resolved: list.filter(c => c.status === 'Resolved' || c.status === 'Closed').length,
      rejected: list.filter(c => c.status === 'Rejected').length,
      recentlyAdded: list.filter(c => new Date(c.createdAt) > twentyFourHoursAgo).length
    };
    setStats(newStats);
  };

  // Manual filtering function removed in favor of dynamic derived state

  const handleDetails = async (complaint) => {
    try {
      const res = await api.get(`/complaints/${complaint.complaintId}`);
      setSelectedComplaint(res.data);
      setAdminReason(res.data.adminNote || '');
    } catch (err) {
      toast.error("Failed to load full complaint details.");
      setSelectedComplaint(complaint);
      setAdminReason(complaint.adminNote || '');
    }
    setShowModal(true);
  };

  const handleUpdateStatus = async (param1, param2, param3 = '') => {
    // Overload handling: (status) from modal OR (idToUse, status, adminNote) from table
    let idToUse, status, adminNote;
    
    if (typeof param1 === 'string' && (param1.startsWith('CMP') || param1.length === 24) && typeof param2 === 'string') {
      // Table context: handleUpdateStatus(id, status, note)
      idToUse = param1;
      status = param2;
      adminNote = param3;
    } else {
      // Modal context: handleUpdateStatus(status)
      if (!selectedComplaint) return;
      idToUse = selectedComplaint.complaintId;
      status = param1;
      adminNote = adminReason;
    }

    let finalNote = adminNote;
    if (status === 'Rejected' && !finalNote) {
      finalNote = window.prompt("REJECTION PROTOCOL: Please enter the specific reason for rejecting this grievance:");
      if (!finalNote) {
        toast.warning("Rejection cancelled: Reason is mandatory.");
        return;
      }
    }
    
    setUpdatingStatus(true);
    try {
      await api.put(`/complaints/update/${idToUse}`, { status, adminNote: finalNote });
      toast.success(`Complaint status set to ${status}`);
      setShowModal(false);
      fetchMyComplaints(); 
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const submitFeedback = async (complaintId) => {
    try {
      await api.put(`/complaints/update/${complaintId}`, { 
        status: 'Closed',
        feedback: { rating: feedbackRating, comment: feedbackComment }
      });
      toast.success('Feedback submitted and complaint closed successfully!');
      fetchMyComplaints();
      setShowModal(false);
    } catch (err) {
      toast.error('Failed to submit feedback.');
    }
  };

  const handleDelete = async (complaintId) => {
    if (!window.confirm("Are you sure you want to permanently delete this complaint?")) return;
    try {
      await api.delete(`/complaints/${complaintId}`);
      setComplaints(prev => prev.filter(c => c.complaintId !== complaintId));
      toast.success("Complaint permanently removed.");
    } catch (err) {
      toast.error("Failed to delete complaint from server.");
    }
  };

  return (
    <div className="dashboard-wrapper" style={{ minHeight: '100vh', background: '#e0f7fa', position: 'relative' }}>
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* HEADER SECTION */}
      <div style={{ padding: '60px 60px 40px 60px', textAlign: 'center', background: '#b2ebf2', borderBottom: '1px solid #80deea', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#006064', margin: '0 0 15px 0' }}>My Grievance History</h1>
        <p style={{ fontSize: '16px', color: '#00838f', maxWidth: '600px', margin: '0 auto 30px auto', lineHeight: '1.6' }}>
          Review the complaints you have previously filed. Track their current progress seamlessly across statuses and monitor administrative resolutions.
        </p>

        {/* HERO STATS PANEL */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ background: '#fff', padding: '15px 25px', borderRadius: '16px', border: '1px solid #80deea', boxShadow: '0 4px 10px rgba(0,188,212,0.1)' }}>
             <p style={{ margin: '0 0 5px', fontSize: '12px', fontWeight: '800', color: '#00838f', textTransform: 'uppercase' }}>Total Formed</p>
             <h3 style={{ margin: '0', fontSize: '24px', fontWeight: '900', color: '#006064' }}>{stats.total}</h3>
          </div>
          <div style={{ background: '#fff', padding: '15px 25px', borderRadius: '16px', border: '1px solid #80deea', boxShadow: '0 4px 10px rgba(0,188,212,0.1)' }}>
             <p style={{ margin: '0 0 5px', fontSize: '12px', fontWeight: '800', color: '#ea580c', textTransform: 'uppercase' }}>Active / Pending</p>
             <h3 style={{ margin: '0', fontSize: '24px', fontWeight: '900', color: '#c2410c' }}>{stats.pending}</h3>
          </div>
          <div style={{ background: '#fff', padding: '15px 25px', borderRadius: '16px', border: '1px solid #80deea', boxShadow: '0 4px 10px rgba(0,188,212,0.1)' }}>
             <p style={{ margin: '0 0 5px', fontSize: '12px', fontWeight: '800', color: '#10b981', textTransform: 'uppercase' }}>Configured Resolved</p>
             <h3 style={{ margin: '0', fontSize: '24px', fontWeight: '900', color: '#047857' }}>{stats.resolved}</h3>
          </div>
          <div style={{ background: '#fff', padding: '15px 25px', borderRadius: '16px', border: '1px solid #80deea', boxShadow: '0 4px 10px rgba(0,188,212,0.1)' }}>
             <p style={{ margin: '0 0 5px', fontSize: '12px', fontWeight: '800', color: '#ef4444', textTransform: 'uppercase' }}>Refused/Rejected</p>
             <h3 style={{ margin: '0', fontSize: '24px', fontWeight: '900', color: '#b91c1c' }}>{stats.rejected}</h3>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH SECTION */}
      <div style={{ padding: '0 60px 40px 60px', display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        
        {/* Admin Explicit Search By ID */}
        {currentUser?.role === 'admin' && (
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', opacity: '0.4' }}>🔍</span>
            <input 
              type="text" 
              placeholder="Admin search by Complaint ID..."
              value={adminSearch}
              onChange={(e) => setAdminSearch(e.target.value)}
              style={{ padding: '12px 15px 12px 40px', borderRadius: '12px', border: '1px solid #b2ebf2', outline: 'none', width: '280px', fontSize: '13px', fontWeight: '600', boxShadow: '0 4px 6px rgba(0,188,212,0.1)' }}
            />
          </div>
        )}

        {/* Global Filters */}
        <div style={{ background: '#ffffff', padding: '6px', borderRadius: '12px', border: '1px solid #b2ebf2', display: 'inline-flex', gap: '5px', boxShadow: '0 4px 6px rgba(0,188,212,0.15)' }}>
          {['All', 'Active', 'Resolved', 'Rejected'].map(btn => {
             const lowerBtn = btn.toLowerCase();
             const isActive = currentFilter === lowerBtn;
             return (
               <button 
                 key={btn} 
                 onClick={() => setCurrentFilter(lowerBtn)} 
                 className="cyan-btn" 
                 style={{ 
                   background: isActive ? '#e0f7fa' : 'transparent', 
                   border: 'none', padding: '8px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '700', 
                   color: isActive ? '#006064' : '#00838f', cursor: 'pointer', transition: 'all 0.3s' 
                 }}>
                 {btn}
               </button>
             );
          })}
        </div>
      </div>

      {/* MAIN COMPLAINTS CONTAINER */}
      <div style={{ padding: '0 60px 80px 60px', maxWidth: '1400px', margin: '0 auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px' }}>
             <div className="spinner" style={{ width: '50px', height: '50px', border: '5px solid #e2e8f0', borderTop: '5px solid #ea580c', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
             <p style={{ marginTop: '25px', color: '#64748b', fontWeight: '700', letterSpacing: '1px' }}>LOADING YOUR DATA...</p>
          </div>
        ) : displayedComplaints.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {displayedComplaints.map((complaint) => (
              <div key={complaint._id} style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', top: '-12px', right: '20px', zIndex: '10',
                  background: ['Submitted', 'Under Review', 'Assigned', 'In Progress'].includes(complaint.status) ? '#ea580c' : complaint.status === 'Resolved' || complaint.status === 'Closed' ? '#10b981' : '#ef4444',
                  color: 'white', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '800', border: '3px solid white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                  {complaint.status.toUpperCase()}
                </span>
                <ComplaintCard complaint={{ ...complaint, onDelete: handleDelete }} onDetails={handleDetails} isAdmin={currentUser?.role === 'admin'} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '100px 40px', 
            background: 'white', 
            borderRadius: '24px', 
            border: '2px dashed #cbd5e1'
          }}>
            <div style={{ fontSize: '60px', marginBottom: '20px', opacity: '0.2' }}>📭</div>
            <h3 style={{ color: '#1e293b', fontSize: '24px', fontWeight: '800', margin: '0' }}>No Complaints Found</h3>
            <p style={{ color: '#94a3b8', maxWidth: '400px', margin: '15px auto 0', lineHeight: '1.6', fontSize: '15px' }}>
              You haven't filed any complaints matching this filter yet. Your voice helps improve our city.
            </p>
          </div>
        )}
      </div>

      {/* --- ADMIN CRUD LEDGER (ONLY FOR ADMINS) --- */}
      {currentUser?.role === 'admin' && (
        <div style={{ padding: '0 60px 100px 60px', maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ background: '#fff', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
            <div style={{ padding: '25px 35px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#1e293b' }}>Master Database Ledger (CRUD Operations)</h3>
              <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#64748b' }}>Administrative override console for direct database record manipulation.</p>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: '#f1f5f9' }}>
                <tr>
                  <th style={{ padding: '15px 35px', fontSize: '11px', color: '#475569', fontWeight: '900', textTransform: 'uppercase' }}>Ticket ID</th>
                  <th style={{ padding: '15px 20px', fontSize: '11px', color: '#475569', fontWeight: '900', textTransform: 'uppercase' }}>Issue Title</th>
                  <th style={{ padding: '15px 20px', fontSize: '11px', color: '#475569', fontWeight: '900', textTransform: 'uppercase' }}>Current Status</th>
                  <th style={{ padding: '15px 35px', fontSize: '11px', color: '#475569', fontWeight: '900', textTransform: 'uppercase', textAlign: 'right' }}>Admin Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedComplaints.map(c => (
                  <tr key={c._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '18px 35px', fontSize: '13px', fontWeight: '800', color: '#ea580c' }}>#{c.complaintId}</td>
                    <td style={{ padding: '18px 20px' }}>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{c.title}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>{c.category}</div>
                    </td>
                    <td style={{ padding: '18px 20px' }}>
                       <span style={{ 
                         background: c.status === 'Pending' ? '#fff7ed' : c.status === 'Resolved' ? '#f0fdf4' : '#fef2f2',
                         color: c.status === 'Pending' ? '#c2410c' : c.status === 'Resolved' ? '#15803d' : '#dc2626',
                         padding: '4px 10px', borderRadius: '100px', fontSize: '10px', fontWeight: '900'
                       }}>{c.status.toUpperCase()}</span>
                    </td>
                    <td style={{ padding: '18px 35px', textAlign: 'right' }}>
                       <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <select 
                            value={c.status}
                            onChange={(e) => handleUpdateStatus(c.complaintId, e.target.value)}
                            style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                          >
                             <option value="Submitted">Submitted</option>
                             <option value="Under Verification">Under Verification</option>
                             <option value="Assigned">Assigned</option>
                             <option value="Accepted">Accepted</option>
                             <option value="In Progress">In Progress</option>
                             <option value="Resolved">Resolved</option>
                             <option value="Citizen Verification">Citizen Verification</option>
                             <option value="Closed">Closed</option>
                             <option value="Rejected">Rejected</option>
                             <option value="Reopened">Reopened</option>
                             <option value="Escalated">Escalated</option>
                          </select>
                          <button 
                            onClick={() => handleDelete(c.complaintId)}
                            style={{ background: '#fef2f2', color: '#ef4444', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}
                          >🗑️</button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- DETAILED INSPECTION MODAL --- */}
      {showModal && selectedComplaint && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', zIndex: '1000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', width: '100%', maxWidth: '1000px', maxHeight: '90vh', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '30px 40px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ background: '#ea580c', color: 'white', padding: '4px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>#{selectedComplaint.complaintId}</span>
                <h3 style={{ margin: '8px 0 0 0', color: '#1e293b', fontSize: '20px', fontWeight: '800' }}>Technical Incident Details</h3>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: '#fff', border: '1px solid #e2e8f0', width: '40px', height: '40px', borderRadius: '12px', cursor: 'pointer', fontSize: '20px' }}>×</button>
            </div>
            
            <div style={{ padding: '30px', flex: 1, display: 'flex', gap: '30px', overflow: 'hidden', height: 'calc(90vh - 100px)' }}>
                {/* LEFT: ALL CONTENT & ACTIONS */}
                <div style={{ flex: '1.2', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', paddingRight: '15px' }}>
                  <div>
                    <h2 style={{ color: '#1e293b', marginBottom: '10px', fontSize: '22px', fontWeight: '900', lineHeight: '1.3' }}>{selectedComplaint.title}</h2>
                    <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '16px', color: '#475569', lineHeight: '1.6', fontSize: '14px', border: '1px solid #e2e8f0' }}>
                      {selectedComplaint.description}
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div style={{ background: '#fff', padding: '15px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                      <label style={{ color: '#94a3b8', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Geographic Pulse</label>
                      <p style={{ margin: '5px 0 0', fontWeight: '700', color: '#1e293b', fontSize: '14px' }}>📍 {selectedComplaint.location}</p>
                    </div>
                    <div style={{ background: '#fff', padding: '15px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                      <label style={{ color: '#94a3b8', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Administrative Zone</label>
                      <p style={{ margin: '5px 0 0', fontWeight: '700', color: '#1e293b', fontSize: '14px' }}>Ward {selectedComplaint.ward}, {selectedComplaint.district}</p>
                    </div>
                  </div>

                  {selectedComplaint.adminNote && (
                    <div style={{ 
                      padding: '15px', 
                      background: selectedComplaint.status === 'Rejected' ? '#fef2f2' : '#fffbeb', 
                      border: `1px solid ${selectedComplaint.status === 'Rejected' ? '#fecaca' : '#fde68a'}`, 
                      borderRadius: '16px' 
                    }}>
                      <label style={{ 
                        color: selectedComplaint.status === 'Rejected' ? '#dc2626' : '#d97706', 
                        fontSize: '10px', 
                        fontWeight: '800', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.5px' 
                      }}>
                        {selectedComplaint.status === 'Rejected' ? '🚨 REJECTION REASON' : 'Resolution Log & Remarks'}
                      </label>
                      <p style={{ 
                        margin: '5px 0 0', 
                        color: selectedComplaint.status === 'Rejected' ? '#991b1b' : '#92400e', 
                        fontSize: '13px', 
                        lineHeight: '1.5', 
                        fontWeight: '600' 
                      }}>
                        {selectedComplaint.adminNote}
                      </p>
                    </div>
                  )}

                  {/* TIMELINE HISTORY */}
                  {selectedComplaint.history && selectedComplaint.history.length > 0 && (
                    <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '16px', border: '1px solid #e2e8f0', marginTop: '20px' }}>
                      <h4 style={{ margin: '0 0 10px', fontSize: '12px', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Status Timeline</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {selectedComplaint.history.map((h, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                            <span style={{ fontWeight: '700', color: '#1e293b' }}>{h.status} <span style={{ fontWeight: 'normal', color: '#94a3b8', fontSize: '11px' }}>({h.changedBy})</span></span>
                            <span style={{ color: '#64748b' }}>{new Date(h.timestamp).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CITIZEN ACTIONS: FEEDBACK & REOPEN */}
                  {currentUser && currentUser.role !== 'admin' && selectedComplaint.status === 'Resolved' && (
                    <div style={{ background: '#f0fdf4', padding: '20px', borderRadius: '16px', border: '1px solid #bbf7d0', marginTop: '20px' }}>
                      <h4 style={{ margin: '0 0 10px', fontSize: '14px', fontWeight: '800', color: '#166534' }}>Resolution Feedback</h4>
                      {!selectedComplaint.feedback?.rating ? (
                        <>
                          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                            {[1,2,3,4,5].map(star => (
                              <button key={star} onClick={() => setFeedbackRating(star)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', filter: star <= feedbackRating ? 'none' : 'grayscale(100%) opacity(30%)' }}>⭐</button>
                            ))}
                          </div>
                          <textarea 
                            value={feedbackComment}
                            onChange={(e) => setFeedbackComment(e.target.value)}
                            placeholder="Share your thoughts on the resolution..."
                            style={{ width: '100%', height: '60px', padding: '10px', borderRadius: '10px', border: '1px solid #bbf7d0', fontSize: '13px', outline: 'none', resize: 'none', marginBottom: '10px' }}
                          />
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => submitFeedback(selectedComplaint.complaintId)} style={{ background: '#16a34a', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '8px', fontWeight: '800', fontSize: '12px', cursor: 'pointer', flex: 1 }}>Verify & Close</button>
                            <button onClick={() => handleUpdateStatus('Reopened')} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '8px', fontWeight: '800', fontSize: '12px', cursor: 'pointer' }}>Not Satisfied (Reopen)</button>
                          </div>
                        </>
                      ) : (
                        <div>
                          <p style={{ margin: '0 0 5px', fontSize: '14px', color: '#166534', fontWeight: '700' }}>Rating: {'⭐'.repeat(selectedComplaint.feedback.rating)}</p>
                          <p style={{ margin: 0, fontSize: '13px', color: '#15803d' }}>{selectedComplaint.feedback.comment}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ADMIN ACTION PANEL MOVED TO LEFT */}
                  {currentUser && currentUser.role === 'admin' && (
                    <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', marginTop: '20px' }}>
                      <h4 style={{ margin: '0 0 10px', fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>⚙️ Administrative Oversight</h4>
                      
                      <div style={{ marginBottom: '15px' }}>
                        <textarea 
                          value={adminReason}
                          onChange={(e) => setAdminReason(e.target.value)}
                          placeholder="Log official internal evaluation notes here..."
                          style={{ width: '100%', height: '80px', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', resize: 'none' }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <button 
                          onClick={() => handleUpdateStatus('Resolved')} 
                          disabled={updatingStatus}
                          style={{ background: '#10b981', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: '800', fontSize: '12px', cursor: 'pointer', transition: '0.2s', opacity: updatingStatus ? 0.7 : 1 }}
                        >
                          ✅ Mark Resolved
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus('Rejected')} 
                          disabled={updatingStatus}
                          style={{ background: '#ef4444', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: '800', fontSize: '12px', cursor: 'pointer', transition: '0.2s', opacity: updatingStatus ? 0.7 : 1 }}
                        >
                          🚫 Reject Case
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus('In Progress')} 
                          disabled={updatingStatus}
                          style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: '800', fontSize: '12px', cursor: 'pointer', gridColumn: 'span 2', transition: '0.2s', opacity: updatingStatus ? 0.7 : 1 }}
                        >
                          ⚖️ Flag for Investigation
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* RIGHT: EVIDENCE (Before / After) */}
                <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <label style={{ color: '#94a3b8', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>Before (Citizen Evidence)</label>
                    <div style={{ background: '#f1f5f9', borderRadius: '20px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid #e2e8f0', minHeight: '150px' }}>
                      {selectedComplaint.image ? (
                        <img src={selectedComplaint.image} alt="Before" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ textAlign: 'center' }}>
                           <div style={{ fontSize: '30px', opacity: '0.1' }}>🖼️</div>
                           <p style={{ color: '#94a3b8', fontSize: '10px', fontStyle: 'italic', marginTop: '5px' }}>None provided</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <label style={{ color: '#94a3b8', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>After (Resolution Proof)</label>
                    <div style={{ background: '#f1f5f9', borderRadius: '20px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid #e2e8f0', minHeight: '150px' }}>
                      {selectedComplaint.resolutionProof ? (
                        <img src={selectedComplaint.resolutionProof} alt="After" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ textAlign: 'center' }}>
                           <div style={{ fontSize: '30px', opacity: '0.1' }}>📸</div>
                           <p style={{ color: '#94a3b8', fontSize: '10px', fontStyle: 'italic', marginTop: '5px' }}>Pending resolution</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .cyan-btn:hover { background: #e0f7fa !important; transform: translateY(-2px); color: #006064 !important; }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        .radar-pulse { animation: pulse 2s infinite; }
        .stat-card-hover:hover { 
          transform: translateY(-10px); 
          box-shadow: 0 30px 60px rgba(0,0,0,0.08) !important;
        }
      `}</style>
    </div>
  );
};

export default Complaints;
