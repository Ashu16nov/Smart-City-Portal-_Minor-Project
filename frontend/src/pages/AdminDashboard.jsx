import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import socket from '../utils/socket';
import './Auth.css';
import { toast, ToastContainer } from 'react-toastify';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [stats, setStats] = useState({ 
    total: 0, pending: 0, progress: 0, resolved: 0, closed: 0, rejected: 0, 
    users: 0, feedbacks: 0, services: 0, announcements: 0,
    analytics: { category: {}, department: {}, monthly: {} }
  });
  const [complaints, setComplaints] = useState([]);
  const [users, setUsers] = useState([]);
  
  // Forms and Modals
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [adminNoteInput, setAdminNoteInput] = useState('');
  
  const [userForm, setUserForm] = useState({ name: '', username: '', email: '', password: '', role: 'department', departmentName: '' });
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    fetchData();

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
      const [compRes, userRes] = await Promise.all([
        api.get('/complaints'),
        api.get('/users')
      ]);
      setComplaints(compRes.data);
      setUsers(userRes.data);
      fetchStats();
    } catch (err) {
      toast.error('Failed to load dashboard data');
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/stats');
      setStats(res.data);
    } catch (err) {}
  };

  // --- Complaint Management ---
  const handleUpdateStatus = async (id, status, adminNote = '') => {
    try {
      await api.put(`/complaints/update/${id}`, { status, adminNote });
      toast.success(`Complaint status set to ${status}`);
      fetchData(); 
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleAssignDepartment = async (id, assignedDepartmentId) => {
    try {
      await api.put(`/complaints/update/${id}`, { assignedDepartmentId, status: 'Assigned' });
      toast.success(`Complaint assigned to department`);
      fetchData();
    } catch (err) {
      toast.error('Failed to assign department');
    }
  };

  const handleViewComplaint = (c) => {
    setSelectedComplaint(c);
    setAdminNoteInput(c.adminNote || '');
    setShowComplaintModal(true);
  };

  const handleSaveAdminNote = async () => {
    if (!selectedComplaint) return;
    try {
      await api.put(`/complaints/update/${selectedComplaint.complaintId || selectedComplaint._id}`, { adminNote: adminNoteInput });
      toast.success("Remark updated!");
      fetchData();
    } catch (err) {
      toast.error("Failed to save remark");
    }
  };

  // --- User & Department Management ---
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users/create', userForm);
      toast.success(`${userForm.role} account created successfully!`);
      setUserForm({ name: '', username: '', email: '', password: '', role: 'department', departmentName: '' });
      setShowUserModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create account');
    }
  };

  const handleToggleUserStatus = async (id) => {
    try {
      await api.patch(`/users/${id}/status`);
      toast.success("User status updated");
      fetchData();
    } catch (err) {
      toast.error('Failed to update user status');
    }
  };

  const departments = users.filter(u => u.role === 'department');
  const staffMembers = users.filter(u => u.role === 'staff');
  const citizens = users.filter(u => u.role === 'user');

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '40px 20px', fontFamily: "'Inter', sans-serif" }}>
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', color: '#0f172a', marginBottom: '20px', fontWeight: '800' }}>Admin Control Center 🎛️</h1>
        
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', background: 'white', padding: '10px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
          {['dashboard', 'analytics', 'complaints', 'departments', 'users'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, padding: '12px', borderRadius: '12px', border: 'none', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', transition: '0.3s',
                background: activeTab === tab ? '#0ea5e9' : 'transparent',
                color: activeTab === tab ? 'white' : '#64748b'
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab 1: Dashboard Overview */}
        {activeTab === 'dashboard' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
              <StatCard title="Total Users" value={stats.users} color="#8b5cf6" icon="👥" />
              <StatCard title="Total Complaints" value={stats.total} color="#f59e0b" icon="📝" />
              <StatCard title="Pending" value={stats.pending} color="#ef4444" icon="⏳" />
              <StatCard title="Resolved" value={stats.resolved} color="#10b981" icon="✅" />
              <StatCard title="Services" value={stats.services} color="#3b82f6" icon="🏛️" />
              <StatCard title="Announcements" value={stats.announcements} color="#06b6d4" icon="📢" />
              <StatCard title="Feedback" value={stats.feedbacks} color="#ec4899" icon="⭐" />
            </div>

            <h2 style={{ color: '#0f172a', marginBottom: '15px' }}>Quick Actions</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              <ActionCard to="/admin/services" title="Manage Services" desc="Add, update, or delete public services directory" icon="🏥" />
              <ActionCard to="/admin/announcements" title="Manage Announcements" desc="Create and publish society-wide notices" icon="📢" />
              <ActionCard to="/admin/notifications" title="Broadcast Alert" desc="Send instant push notifications and SMS" icon="🚀" />
              <ActionCard to="/feedback" title="View Feedback" desc="Read citizen feedback and suggest improvements" icon="⭐" />
            </div>
          </div>
        )}

        {/* Tab 1.5: Analytics */}
        {activeTab === 'analytics' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>
            <div style={{ background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin: '0 0 20px 0', color: '#0f172a' }}>Complaints by Category 📊</h3>
              {Object.entries(stats.analytics?.category || {}).map(([key, val]) => (
                <div key={key} style={{ marginBottom: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>
                    <span>{key}</span>
                    <span>{val}</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min((val / stats.total) * 100, 100)}%`, height: '100%', background: '#3b82f6', borderRadius: '4px' }}></div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin: '0 0 20px 0', color: '#0f172a' }}>Department Workload 🏢</h3>
              {Object.entries(stats.analytics?.department || {}).map(([key, val]) => (
                <div key={key} style={{ marginBottom: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>
                    <span>{key}</span>
                    <span>{val}</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min((val / stats.total) * 100, 100)}%`, height: '100%', background: '#8b5cf6', borderRadius: '4px' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Manage Complaints */}
        {activeTab === 'complaints' && (
          <div style={{ background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
            <h2 style={{ margin: '0 0 20px 0', color: '#0f172a' }}>Manage Complaints</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', color: '#475569', fontSize: '14px' }}>
                    <th style={{ padding: '15px' }}>ID</th>
                    <th style={{ padding: '15px' }}>Citizen</th>
                    <th style={{ padding: '15px' }}>Category</th>
                    <th style={{ padding: '15px' }}>Priority</th>
                    <th style={{ padding: '15px' }}>SLA</th>
                    <th style={{ padding: '15px' }}>Status</th>
                    <th style={{ padding: '15px' }}>Assigned Dept</th>
                    <th style={{ padding: '15px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map(c => (
                    <tr key={c._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '15px', fontWeight: 'bold' }}>{c.complaintId}</td>
                      <td style={{ padding: '15px' }}>{c.userName}</td>
                      <td style={{ padding: '15px' }}>{c.category}</td>
                      <td style={{ padding: '15px' }}>
                        <span style={{ padding: '5px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', background: c.priority === 'High' ? '#fee2e2' : c.priority === 'Medium' ? '#fef3c7' : '#e0f2fe', color: c.priority === 'High' ? '#991b1b' : c.priority === 'Medium' ? '#92400e' : '#0369a1' }}>
                          {c.priority || 'Medium'}
                        </span>
                      </td>
                      <td style={{ padding: '15px' }}>
                        {c.slaDeadline ? (
                          <span style={{ fontSize: '12px', color: new Date() > new Date(c.slaDeadline) && c.status !== 'Resolved' && c.status !== 'Closed' ? '#ef4444' : '#64748b', fontWeight: new Date() > new Date(c.slaDeadline) && c.status !== 'Resolved' && c.status !== 'Closed' ? 'bold' : 'normal' }}>
                            {new Date(c.slaDeadline).toLocaleDateString()}
                          </span>
                        ) : '-'}
                      </td>
                      <td style={{ padding: '15px' }}>
                        <span style={{ padding: '5px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', background: c.status === 'Resolved' || c.status === 'Closed' ? '#dcfce7' : '#fef3c7', color: c.status === 'Resolved' || c.status === 'Closed' ? '#166534' : '#92400e' }}>
                          {c.status}
                        </span>
                      </td>
                      <td style={{ padding: '15px' }}>
                        <select 
                          value={c.assignedDepartmentId || ''} 
                          onChange={(e) => handleAssignDepartment(c.complaintId || c._id, e.target.value)}
                          style={{ padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                        >
                          <option value="">-- Assign Dept --</option>
                          {departments.map(d => (
                            <option key={d.id} value={d.id}>{d.departmentName} ({d.name})</option>
                          ))}
                        </select>
                      </td>
                      <td style={{ padding: '15px' }}>
                        <button onClick={() => handleViewComplaint(c)} style={{ background: '#0ea5e9', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Manage Departments */}
        {activeTab === 'departments' && (
          <div style={{ background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#0f172a' }}>Departments & Staff</h2>
              <button onClick={() => setShowUserModal(true)} style={{ background: '#10b981', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>+ Create Dept/Staff</button>
            </div>
            
            <h3 style={{ color: '#475569', marginTop: '30px' }}>Department Heads</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginBottom: '30px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', color: '#475569', fontSize: '14px' }}>
                    <th style={{ padding: '15px' }}>Dept Name</th>
                    <th style={{ padding: '15px' }}>Head Name</th>
                    <th style={{ padding: '15px' }}>Username</th>
                    <th style={{ padding: '15px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map(d => (
                    <tr key={d.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '15px', fontWeight: 'bold' }}>{d.departmentName}</td>
                      <td style={{ padding: '15px' }}>{d.name}</td>
                      <td style={{ padding: '15px' }}>{d.username}</td>
                      <td style={{ padding: '15px' }}>
                        <button onClick={() => handleToggleUserStatus(d.id)} style={{ padding: '5px 10px', borderRadius: '20px', border: 'none', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', background: d.isActive ? '#dcfce7' : '#fee2e2', color: d.isActive ? '#166534' : '#991b1b' }}>
                          {d.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 style={{ color: '#475569' }}>Staff Members</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', color: '#475569', fontSize: '14px' }}>
                    <th style={{ padding: '15px' }}>Name</th>
                    <th style={{ padding: '15px' }}>Username</th>
                    <th style={{ padding: '15px' }}>Belongs To Dept</th>
                    <th style={{ padding: '15px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {staffMembers.map(s => (
                    <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '15px', fontWeight: 'bold' }}>{s.name}</td>
                      <td style={{ padding: '15px' }}>{s.username}</td>
                      <td style={{ padding: '15px' }}>{s.departmentName}</td>
                      <td style={{ padding: '15px' }}>
                        <button onClick={() => handleToggleUserStatus(s.id)} style={{ padding: '5px 10px', borderRadius: '20px', border: 'none', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', background: s.isActive ? '#dcfce7' : '#fee2e2', color: s.isActive ? '#166534' : '#991b1b' }}>
                          {s.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Manage Users */}
        {activeTab === 'users' && (
          <div style={{ background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
            <h2 style={{ margin: '0 0 20px 0', color: '#0f172a' }}>Citizen Directory</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', color: '#475569', fontSize: '14px' }}>
                    <th style={{ padding: '15px' }}>Name</th>
                    <th style={{ padding: '15px' }}>Username</th>
                    <th style={{ padding: '15px' }}>Email</th>
                    <th style={{ padding: '15px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {citizens.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '15px', fontWeight: 'bold' }}>{c.name}</td>
                      <td style={{ padding: '15px' }}>{c.username}</td>
                      <td style={{ padding: '15px' }}>{c.email}</td>
                      <td style={{ padding: '15px' }}>
                        <button onClick={() => handleToggleUserStatus(c.id)} style={{ padding: '5px 10px', borderRadius: '20px', border: 'none', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', background: c.isActive ? '#dcfce7' : '#fee2e2', color: c.isActive ? '#166534' : '#991b1b' }}>
                          {c.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* User Creation Modal */}
      {showUserModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'white', width: '100%', maxWidth: '500px', borderRadius: '24px', padding: '30px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <h2 style={{ margin: '0 0 20px 0', color: '#0f172a' }}>Create Department/Staff</h2>
            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Role</label>
                <select value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <option value="department">Department Head</option>
                  <option value="staff">Staff Member</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Department Name</label>
                <input type="text" value={userForm.departmentName} onChange={e => setUserForm({...userForm, departmentName: e.target.value})} required placeholder="e.g. Water Department" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Full Name</label>
                <input type="text" value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Username</label>
                <input type="text" value={userForm.username} onChange={e => setUserForm({...userForm, username: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Password</label>
                <input type="password" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={{ flex: 1, background: '#0ea5e9', color: 'white', padding: '12px', borderRadius: '10px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Create Account</button>
                <button type="button" onClick={() => setShowUserModal(false)} style={{ flex: 1, background: '#f1f5f9', color: '#475569', padding: '12px', borderRadius: '10px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complaint View Modal */}
      {showComplaintModal && selectedComplaint && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'white', width: '100%', maxWidth: '600px', borderRadius: '24px', padding: '30px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ margin: '0 0 10px 0', color: '#0f172a' }}>{selectedComplaint.title}</h2>
            <span style={{ padding: '5px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', background: '#e0f2fe', color: '#0369a1' }}>{selectedComplaint.complaintId}</span>
            
            <p style={{ color: '#475569', marginTop: '20px', lineHeight: '1.6' }}>{selectedComplaint.description}</p>
            
            <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', marginTop: '20px' }}>
              <strong>Admin Internal Note:</strong>
              <textarea 
                value={adminNoteInput}
                onChange={(e) => setAdminNoteInput(e.target.value)}
                placeholder="Add a private note regarding this grievance..."
                style={{ width: '100%', minHeight: '80px', marginTop: '10px', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
              <button onClick={handleSaveAdminNote} style={{ background: '#0f172a', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '8px', marginTop: '10px', cursor: 'pointer', fontWeight: 'bold' }}>Save Note</button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button onClick={() => setShowComplaintModal(false)} style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, color, icon }) => (
  <div style={{ background: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '20px' }}>
    <div style={{ fontSize: '30px', background: `${color}20`, width: '60px', height: '60px', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '15px' }}>{icon}</div>
    <div>
      <h3 style={{ margin: 0, fontSize: '28px', color: '#0f172a' }}>{value}</h3>
      <p style={{ margin: 0, color: '#64748b', fontSize: '14px', fontWeight: 'bold' }}>{title}</p>
    </div>
  </div>
);

const ActionCard = ({ to, title, desc, icon }) => (
  <Link to={to} style={{ textDecoration: 'none', background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '15px', border: '1px solid #f1f5f9', transition: '0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
    <div style={{ fontSize: '24px' }}>{icon}</div>
    <div>
      <h4 style={{ margin: '0 0 5px 0', color: '#0f172a' }}>{title}</h4>
      <p style={{ margin: 0, color: '#64748b', fontSize: '12px' }}>{desc}</p>
    </div>
  </Link>
);

export default AdminDashboard;
