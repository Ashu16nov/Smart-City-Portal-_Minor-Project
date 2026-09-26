import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import socket from '../utils/socket';
import { toast, ToastContainer } from 'react-toastify';

const StaffDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [wastePickups, setWastePickups] = useState([]);
  const [activeTab, setActiveTab] = useState('grievances'); // 'grievances' or 'waste'
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Resolution Modal State
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [resolutionProof, setResolutionProof] = useState('');
  const [staffNote, setStaffNote] = useState('');
  const [loading, setLoading] = useState(true);

  const currentUser = JSON.parse(localStorage.getItem('user')) || { name: 'Staff Member', departmentName: 'Field Services' };

  useEffect(() => {
    fetchData();

    socket.on('status_update', (updated) => {
      setComplaints(prev => prev.map(c => c.complaintId === updated.complaintId ? updated : c));
    });

    socket.on('new_complaint', (complaint) => {
      fetchData();
    });

    return () => {
      socket.off('status_update');
      socket.off('new_complaint');
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [compRes, wasteRes] = await Promise.all([
        api.get('/complaints'),
        api.get('/waste')
      ]);
      setComplaints(compRes.data || []);
      setWastePickups(wasteRes.data?.pickups || []);
    } catch (err) {
      toast.error('Failed to sync staff task dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status, extraData = {}) => {
    try {
      await api.put(`/complaints/update/${id}`, { status, ...extraData });
      toast.success(`Task status updated to: ${status}`);
      fetchData();
    } catch (err) {
      toast.error('Failed to update task status');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setResolutionProof(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTask) return;
    try {
      await api.put(`/complaints/update/${selectedTask.complaintId || selectedTask._id}`, { 
        status: 'Resolved',
        resolutionProof,
        adminNote: staffNote ? `[Staff Note]: ${staffNote}` : selectedTask.adminNote
      });
      toast.success("🎉 Resolution submitted successfully!");
      setShowModal(false);
      setResolutionProof('');
      setStaffNote('');
      fetchData();
    } catch (err) {
      toast.error("Failed to submit resolution");
    }
  };

  const handleUpdateWasteStatus = async (pickupId, status) => {
    try {
      await api.patch(`/waste/${pickupId}/status`, { status });
      toast.success(`Waste pickup marked as ${status}`);
      fetchData();
    } catch (err) {
      toast.error('Failed to update pickup status');
    }
  };

  // Filter Logic
  const filteredComplaints = complaints.filter(c => {
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || c.priority === priorityFilter;
    const matchesSearch = searchQuery === '' || 
      c.complaintId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.location && c.location.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesPriority && matchesSearch;
  });

  // KPI Calculations
  const pendingCount = complaints.filter(c => ['Submitted', 'Assigned', 'Under Verification'].includes(c.status)).length;
  const inProgressCount = complaints.filter(c => ['Accepted', 'In Progress', 'Reopened'].includes(c.status)).length;
  const resolvedCount = complaints.filter(c => ['Resolved', 'Closed'].includes(c.status)).length;
  const highPriorityCount = complaints.filter(c => c.priority === 'High' && c.status !== 'Resolved' && c.status !== 'Closed').length;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 20px', fontFamily: "'Inter', sans-serif" }}>
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0369a1, #0ea5e9)',
        borderRadius: '24px',
        padding: '35px 40px',
        color: 'white',
        boxShadow: '0 10px 30px rgba(14, 165, 233, 0.25)',
        marginBottom: '35px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', width: '60px', height: '60px', borderRadius: '18px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '32px' }}>🛠️</div>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800' }}>Staff Workspace & Field Operations</h1>
            <p style={{ margin: '6px 0 0 0', opacity: 0.9, fontSize: '15px' }}>
              Welcome back, <strong>{currentUser.name}</strong> ({currentUser.departmentName || 'Field Operations'})
            </p>
          </div>
        </div>

        <button 
          onClick={fetchData} 
          style={{
            background: 'white',
            color: '#0369a1',
            padding: '10px 20px',
            borderRadius: '100px',
            fontWeight: '700',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
          }}
        >
          🔄 Sync Work Queue
        </button>
      </div>

      {/* KPI Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat( auto-fit, minmax(220px, 1fr) )', gap: '20px', marginBottom: '35px' }}>
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <div style={{ color: '#64748b', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>Total Assigned Tasks</div>
          <div style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', marginTop: '6px' }}>{complaints.length}</div>
          <div style={{ fontSize: '12px', color: '#0ea5e9', marginTop: '4px', fontWeight: '600' }}>📋 Field Queue</div>
        </div>

        <div style={{ background: 'white', border: '1px solid #fde047', borderRadius: '20px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <div style={{ color: '#a16207', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>Pending / To Do</div>
          <div style={{ fontSize: '32px', fontWeight: '900', color: '#ca8a04', marginTop: '6px' }}>{pendingCount}</div>
          <div style={{ fontSize: '12px', color: '#ca8a04', marginTop: '4px', fontWeight: '600' }}>⏳ Awaiting Action</div>
        </div>

        <div style={{ background: 'white', border: '1px solid #93c5fd', borderRadius: '20px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <div style={{ color: '#1d4ed8', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>In Progress</div>
          <div style={{ fontSize: '32px', fontWeight: '900', color: '#2563eb', marginTop: '6px' }}>{inProgressCount}</div>
          <div style={{ fontSize: '12px', color: '#2563eb', marginTop: '4px', fontWeight: '600' }}>🔨 Active On-Site</div>
        </div>

        <div style={{ background: 'white', border: '1px solid #86efac', borderRadius: '20px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <div style={{ color: '#15803d', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>Completed Tasks</div>
          <div style={{ fontSize: '32px', fontWeight: '900', color: '#16a34a', marginTop: '6px' }}>{resolvedCount}</div>
          <div style={{ fontSize: '12px', color: '#16a34a', marginTop: '4px', fontWeight: '600' }}>✅ Resolved</div>
        </div>

        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '20px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <div style={{ color: '#991b1b', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>High Priority Urgent</div>
          <div style={{ fontSize: '32px', fontWeight: '900', color: '#dc2626', marginTop: '6px' }}>{highPriorityCount}</div>
          <div style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px', fontWeight: '600' }}>🚨 Urgent SLA</div>
        </div>
      </div>

      {/* Tabs Header */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', background: 'white', padding: '8px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        <button
          onClick={() => setActiveTab('grievances')}
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: '12px',
            border: 'none',
            fontWeight: '700',
            fontSize: '15px',
            cursor: 'pointer',
            background: activeTab === 'grievances' ? '#0ea5e9' : 'transparent',
            color: activeTab === 'grievances' ? 'white' : '#64748b',
            transition: '0.2s'
          }}
        >
          📋 Assigned Civic Grievances ({complaints.length})
        </button>
        
        <button
          onClick={() => setActiveTab('waste')}
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: '12px',
            border: 'none',
            fontWeight: '700',
            fontSize: '15px',
            cursor: 'pointer',
            background: activeTab === 'waste' ? '#15803d' : 'transparent',
            color: activeTab === 'waste' ? 'white' : '#64748b',
            transition: '0.2s'
          }}
        >
          ♻️ Smart Waste Pickups Queue ({wastePickups.length})
        </button>
      </div>

      {/* Tab Content 1: Grievances Queue */}
      {activeTab === 'grievances' && (
        <div>
          {/* Controls & Search Bar */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '20px', border: '1px solid #e2e8f0', marginBottom: '25px', display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', justifyContent: 'space-between' }}>
            <input
              type="text"
              placeholder="🔍 Search task by ID, title, or ward location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1, minWidth: '250px', padding: '10px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none' }}
            />

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ padding: '9px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontWeight: '600' }}
              >
                <option>All</option>
                <option>Submitted</option>
                <option>Assigned</option>
                <option>Accepted</option>
                <option>In Progress</option>
                <option>Resolved</option>
                <option>Closed</option>
              </select>

              <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b', marginLeft: '10px' }}>Priority:</span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                style={{ padding: '9px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontWeight: '600' }}
              >
                <option>All</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>
              <h2>🛠️ Syncing staff tasks...</h2>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div style={{ background: 'white', padding: '50px', borderRadius: '20px', textAlign: 'center', color: '#64748b', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '48px' }}>🎉</span>
              <h3 style={{ marginTop: '10px', color: '#0f172a' }}>No matching tasks in your queue!</h3>
              <p>Great job! All assigned field issues are up to date.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat( auto-fit, minmax(340px, 1fr) )', gap: '25px' }}>
              {filteredComplaints.map(c => {
                const isResolved = ['Resolved', 'Closed'].includes(c.status);
                const isHighPriority = c.priority === 'High';

                return (
                  <div 
                    key={c._id} 
                    style={{ 
                      background: 'white', 
                      borderRadius: '24px', 
                      padding: '25px', 
                      border: isHighPriority && !isResolved ? '2px solid #fca5a5' : '1px solid #e2e8f0', 
                      boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                      display: 'flex',
                      flexDirection: 'column',
                      justify: 'space-between'
                    }}
                  >
                    <div>
                      {/* Card Header Badges */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ background: '#f0f9ff', color: '#0369a1', padding: '4px 10px', borderRadius: '8px', fontSize: '13px', fontWeight: '800' }}>
                          {c.complaintId}
                        </span>

                        <div style={{ display: 'flex', gap: '6px' }}>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '100px',
                            fontSize: '11px',
                            fontWeight: '800',
                            background: isHighPriority ? '#fee2e2' : '#f1f5f9',
                            color: isHighPriority ? '#b91c1c' : '#475569'
                          }}>
                            {c.priority} Priority
                          </span>

                          <span style={{
                            padding: '4px 12px',
                            borderRadius: '100px',
                            fontSize: '11px',
                            fontWeight: '800',
                            background: isResolved ? '#dcfce7' : '#fef3c7',
                            color: isResolved ? '#15803d' : '#b45309'
                          }}>
                            {c.status}
                          </span>
                        </div>
                      </div>

                      {/* Title & Category */}
                      <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', color: '#0f172a' }}>{c.title}</h3>
                      <div style={{ fontSize: '13px', color: '#0ea5e9', fontWeight: '700', marginBottom: '10px' }}>
                        🏷️ Category: {c.category}
                      </div>

                      <p style={{ margin: '0 0 15px 0', color: '#475569', fontSize: '14px', lineHeight: '1.5' }}>
                        {c.description}
                      </p>

                      {/* Citizen & Location Metadata */}
                      <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '12px 16px', marginBottom: '15px', fontSize: '13px', color: '#334155' }}>
                        <div style={{ marginBottom: '4px' }}>👤 Citizen: <strong>{c.userName}</strong></div>
                        <div>📍 Location: <strong>{c.location || c.ward || 'Main Zone'}</strong></div>
                        {c.slaDeadline && (
                          <div style={{ marginTop: '4px', color: '#64748b' }}>
                            ⏰ SLA Target: <strong>{new Date(c.slaDeadline).toLocaleDateString()}</strong>
                          </div>
                        )}
                      </div>

                      {/* Admin/Staff remarks if existing */}
                      {c.adminNote && (
                        <div style={{ background: '#eff6ff', padding: '10px 14px', borderRadius: '12px', fontSize: '12px', color: '#1e40af', marginBottom: '15px' }}>
                          💬 {c.adminNote}
                        </div>
                      )}
                    </div>

                    {/* Task Actions */}
                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '15px', marginTop: '10px' }}>
                      {['Assigned', 'Submitted', 'Under Verification'].includes(c.status) && (
                        <button
                          onClick={() => handleUpdateStatus(c.complaintId || c._id, 'Accepted')}
                          style={{
                            width: '100%',
                            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                            color: 'white',
                            padding: '10px',
                            borderRadius: '12px',
                            fontWeight: '700',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '14px',
                            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.25)'
                          }}
                        >
                          ⚡ Accept Task
                        </button>
                      )}

                      {c.status === 'Accepted' && (
                        <button
                          onClick={() => handleUpdateStatus(c.complaintId || c._id, 'In Progress')}
                          style={{
                            width: '100%',
                            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                            color: 'white',
                            padding: '10px',
                            borderRadius: '12px',
                            fontWeight: '700',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '14px',
                            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)'
                          }}
                        >
                          🔨 Start On-Site Work
                        </button>
                      )}

                      {['In Progress', 'Reopened'].includes(c.status) && (
                        <button
                          onClick={() => {
                            setSelectedTask(c);
                            setShowModal(true);
                          }}
                          style={{
                            width: '100%',
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            color: 'white',
                            padding: '10px',
                            borderRadius: '12px',
                            fontWeight: '700',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '14px',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
                          }}
                        >
                          ✅ Resolve & Attach Proof
                        </button>
                      )}

                      {isResolved && (
                        <div style={{ textAlign: 'center', color: '#15803d', fontWeight: '700', fontSize: '13px' }}>
                          🎉 Resolved & Marked Complete
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab Content 2: Waste Pickups Queue */}
      {activeTab === 'waste' && (
        <div style={{ background: 'white', borderRadius: '24px', padding: '25px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '20px', color: '#0f172a' }}>City E-Waste & Recycling Pickup Requests</h3>
          
          {wastePickups.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              <p>No waste pickup tasks scheduled.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {wastePickups.map((w) => (
                <div key={w._id} style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                  <div>
                    <span style={{ background: '#dcfce7', color: '#15803d', padding: '3px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '800' }}>{w.requestId}</span>
                    <h4 style={{ margin: '4px 0 2px 0', fontSize: '16px', color: '#0f172a' }}>{w.wasteType}</h4>
                    <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>📍 {w.address} ({w.ward}) | 👤 Citizen: {w.userName} ({w.userPhone})</p>
                    <div style={{ fontSize: '12px', color: '#334155', marginTop: '4px' }}>📅 Date: {w.preferredDate} | Slot: {w.preferredSlot}</div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ padding: '6px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: '800', background: w.status === 'Completed' ? '#dcfce7' : '#fef3c7', color: w.status === 'Completed' ? '#15803d' : '#b45309' }}>
                      {w.status}
                    </span>

                    {w.status !== 'Completed' && (
                      <button
                        onClick={() => handleUpdateWasteStatus(w._id, 'Completed')}
                        style={{ background: '#15803d', color: 'white', padding: '8px 16px', borderRadius: '10px', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}
                      >
                        Mark Collected
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Resolution Proof Submission Modal */}
      {showModal && selectedTask && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'white', width: '100%', maxWidth: '520px', borderRadius: '24px', padding: '30px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#0f172a', fontSize: '20px' }}>Complete Task: {selectedTask.complaintId}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleResolveSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>Resolution Remarks & Field Log</label>
                <textarea
                  placeholder="Describe work completed on-site (e.g. Fixed main water pipeline leak near MG Road)..."
                  rows={3}
                  value={staffNote}
                  onChange={(e) => setStaffNote(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>Upload Resolution Proof Photo (Optional)</label>
                <input type="file" accept="image/*" onChange={handleFileChange} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1' }} />
                {resolutionProof && <img src={resolutionProof} alt="Proof Preview" style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '12px', marginTop: '10px' }} />}
              </div>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={{ flex: 1, background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', padding: '12px', borderRadius: '12px', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '15px' }}>Submit Resolution</button>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, background: '#f1f5f9', color: '#475569', padding: '12px', borderRadius: '12px', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '15px' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;
