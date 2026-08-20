import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import socket from '../utils/socket';
import { toast, ToastContainer } from 'react-toastify';

const DepartmentDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [staff, setStaff] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(user);
    if (user) {
      fetchData(user.departmentName);
    }

    socket.on('status_update', (updated) => {
      setComplaints(prev => prev.map(c => c.complaintId === updated.complaintId ? updated : c));
    });

    return () => socket.off('status_update');
  }, []);

  const fetchData = async (deptName) => {
    try {
      const [compRes, userRes] = await Promise.all([
        api.get('/complaints'),
        api.get('/users')
      ]);
      setComplaints(compRes.data);
      // Filter staff that belong to this department
      setStaff(userRes.data.filter(u => u.role === 'staff' && u.departmentName === deptName));
    } catch (err) {
      toast.error('Failed to load data');
    }
  };

  const handleAssignStaff = async (id, staffId) => {
    try {
      await api.put(`/complaints/update/${id}`, { assignedStaffId: staffId, status: 'Assigned' });
      toast.success('Complaint assigned to staff successfully');
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

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <ToastContainer position="top-right" />
      <h1 style={{ color: '#0f172a', marginBottom: '10px' }}>{currentUser?.departmentName} Dashboard</h1>
      <p style={{ color: '#64748b', marginBottom: '30px' }}>Assign and manage complaints routed to your department.</p>

      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', color: '#475569', fontSize: '14px' }}>
              <th style={{ padding: '15px' }}>ID</th>
              <th style={{ padding: '15px' }}>Category</th>
              <th style={{ padding: '15px' }}>Status</th>
              <th style={{ padding: '15px' }}>Assign Staff</th>
            </tr>
          </thead>
          <tbody>
            {complaints.length === 0 ? (
              <tr><td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>No complaints assigned to your department yet.</td></tr>
            ) : complaints.map(c => (
              <tr key={c._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '15px', fontWeight: 'bold' }}>{c.complaintId}</td>
                <td style={{ padding: '15px' }}>{c.category}</td>
                <td style={{ padding: '15px' }}>
                  <span style={{ padding: '5px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', background: c.status === 'Resolved' ? '#dcfce7' : '#fef3c7', color: c.status === 'Resolved' ? '#166534' : '#92400e' }}>
                    {c.status}
                  </span>
                </td>
                <td style={{ padding: '15px' }}>
                  <select 
                    value={c.assignedStaffId || ''} 
                    onChange={(e) => handleAssignStaff(c.complaintId || c._id, e.target.value)}
                    style={{ padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="">-- Assign Staff --</option>
                    {staff.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DepartmentDashboard;
