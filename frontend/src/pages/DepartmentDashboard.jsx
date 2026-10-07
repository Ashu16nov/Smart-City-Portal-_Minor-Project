import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import socket from '../utils/socket';
import { toast, ToastContainer } from 'react-toastify';

const DepartmentDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [staff, setStaff] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(user);
    if (user) {
      fetchData(user.departmentName);
    }

    socket.on('status_update', (updated) => {
      setComplaints(prev => prev.map(c => c.complaintId === updated.complaintId ? updated : c));
    });

    socket.on('new_complaint', () => {
      if (user) fetchData(user.departmentName);
    });

    return () => {
      socket.off('status_update');
      socket.off('new_complaint');
    };
  }, []);

  const fetchData = async (deptName) => {
    try {
      const [compRes, userRes] = await Promise.all([
        api.get('/complaints'),
        api.get('/users')
      ]);
      setComplaints(compRes.data || []);
      // Filter staff that belong to this department
      setStaff((userRes.data || []).filter(u => u.role === 'staff'));
    } catch (err) {
      toast.error('Failed to load department dashboard');
    }
  };

  const handleAssignStaff = async (id, staffId) => {
    try {
      await api.put(`/complaints/update/${id}`, { assignedStaffId: staffId, status: 'Assigned' });
      toast.success('Complaint assigned to field staff successfully!');
      if (currentUser) fetchData(currentUser.departmentName);
    } catch (err) {
      toast.error('Failed to assign staff');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/complaints/update/${id}`, { status });
      toast.success(`Status updated to ${status}`);
      if (currentUser) fetchData(currentUser.departmentName);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const filteredComplaints = complaints.filter(c => {
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesSearch = searchQuery === '' ||
      c.complaintId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingCount = complaints.filter(c => ['Submitted', 'Assigned'].includes(c.status)).length;
  const inProgressCount = complaints.filter(c => ['Accepted', 'In Progress'].includes(c.status)).length;
  const resolvedCount = complaints.filter(c => ['Resolved', 'Closed'].includes(c.status)).length;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 20px', fontFamily: "'Inter', sans-serif" }}>
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0284c7, #6366f1)',
        borderRadius: '24px',
        padding: '35px 40px',
        color: 'white',
        boxShadow: '0 10px 30px rgba(99, 102, 241, 0.25)',
        marginBottom: '35px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', width: '60px', height: '60px', borderRadius: '18px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '32px' }}>🏛️</div>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800' }}>{currentUser?.departmentName || 'Department Head'} Workspace</h1>
            <p style={{ margin: '6px 0 0 0', opacity: 0.9, fontSize: '15px' }}>
              Assign field workers, track SLA deadlines, and verify ticket resolutions.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat( auto-fit, minmax(220px, 1fr) )', gap: '20px', marginBottom: '35px' }}>
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <span style={{ color: '#64748b', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>Department Tickets</span>
          <div style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>{complaints.length}</div>
        </div>

        <div style={{ background: 'white', border: '1px solid #fde047', borderRadius: '20px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <span style={{ color: '#a16207', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>Unassigned / Pending</span>
          <div style={{ fontSize: '32px', fontWeight: '900', color: '#ca8a04', marginTop: '4px' }}>{pendingCount}</div>
        </div>

        <div style={{ background: 'white', border: '1px solid #93c5fd', borderRadius: '20px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <span style={{ color: '#1d4ed8', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>Active In-Progress</span>
          <div style={{ fontSize: '32px', fontWeight: '900', color: '#2563eb', marginTop: '4px' }}>{inProgressCount}</div>
        </div>

        <div style={{ background: 'white', border: '1px solid #86efac', borderRadius: '20px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <span style={{ color: '#15803d', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>Resolved Tickets</span>
          <div style={{ fontSize: '32px', fontWeight: '900', color: '#16a34a', marginTop: '4px' }}>{resolvedCount}</div>
        </div>
      </div>

      {/* Main Table Container */}
      <div style={{ background: 'white', borderRadius: '24px', padding: '25px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '20px', color: '#0f172a' }}>Department Complaints & Staff Assignments</h3>

          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="🔍 Search ticket ID or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: '8px 14px', borderRadius: '100px', border: '1px solid #cbd5e1', outline: 'none' }}
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '8px 14px', borderRadius: '100px', border: '1px solid #cbd5e1', fontWeight: '600' }}
            >
              <option>All</option>
              <option>Submitted</option>
              <option>Assigned</option>
              <option>Accepted</option>
              <option>In Progress</option>
              <option>Resolved</option>
            </select>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', color: '#475569', fontSize: '13px', textTransform: 'uppercase' }}>
                <th style={{ padding: '14px' }}>ID</th>
                <th style={{ padding: '14px' }}>Category & Title</th>
                <th style={{ padding: '14px' }}>Priority</th>
                <th style={{ padding: '14px' }}>Status</th>
                <th style={{ padding: '14px' }}>Assign Staff Member</th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.length === 0 ? (
                <tr><td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>No complaints assigned to your department.</td></tr>
              ) : filteredComplaints.map(c => (
                <tr key={c._id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '14px' }}>
                  <td style={{ padding: '14px', fontWeight: '800', color: '#0ea5e9' }}>{c.complaintId}</td>
                  <td style={{ padding: '14px' }}>
                    <strong style={{ color: '#0f172a' }}>{c.title}</strong>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>🏷️ {c.requestType} • {c.category} ({c.location || c.ward || 'Main Zone'})</div>
                  </td>
                  <td style={{ padding: '14px' }}>
                    <span style={{
                      padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800',
                      background: c.priority === 'High' ? '#fee2e2' : '#f1f5f9',
                      color: c.priority === 'High' ? '#b91c1c' : '#475569'
                    }}>
                      {c.priority}
                    </span>
                  </td>
                  <td style={{ padding: '14px' }}>
                    <span style={{
                      padding: '4px 10px', borderRadius: '100px', fontSize: '12px', fontWeight: '800',
                      background: c.status === 'Resolved' ? '#dcfce7' : '#fef3c7',
                      color: c.status === 'Resolved' ? '#15803d' : '#b45309'
                    }}>
                      {c.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px' }}>
                    <select 
                      value={c.assignedStaffId || ''} 
                      onChange={(e) => handleAssignStaff(c.complaintId || c._id, e.target.value)}
                      style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    >
                      <option value="">-- Select Field Staff --</option>
                      {staff.map(s => (
                        <option key={s.id || s._id} value={s.id || s._id}>{s.name} (@{s.username})</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DepartmentDashboard;
