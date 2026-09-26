import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import socket from '../utils/socket';
import { toast, ToastContainer } from 'react-toastify';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'complaints', 'users', 'smart-modules', 'analytics'
  
  const [stats, setStats] = useState({ 
    total: 0, pending: 0, progress: 0, resolved: 0, closed: 0, rejected: 0, 
    users: 0, feedbacks: 0, services: 0, announcements: 0,
    analytics: { category: {}, department: {}, monthly: {} }
  });
  
  const [complaints, setComplaints] = useState([]);
  const [users, setUsers] = useState([]);
  const [wastePickups, setWastePickups] = useState([]);
  const [parkingHubs, setParkingHubs] = useState([]);
  const [polls, setPolls] = useState([]);

  // Search & Filters
  const [complaintSearch, setComplaintSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');

  // Modals & Forms
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [adminNoteInput, setAdminNoteInput] = useState('');
  
  const [userForm, setUserForm] = useState({ name: '', username: '', email: '', password: '', role: 'department', departmentName: '' });
  const [showUserModal, setShowUserModal] = useState(false);

  // Poll Creation Form
  const [pollForm, setPollForm] = useState({
    title: '',
    description: '',
    category: 'Infrastructure',
    allocatedBudget: '₹ 50 Lakhs',
    ward: 'City-wide',
    option1: '',
    option2: '',
    option3: ''
  });
  const [showPollModal, setShowPollModal] = useState(false);

  useEffect(() => {
    fetchData();

    socket.on('new_complaint', (complaint) => {
      setComplaints(prev => [complaint, ...prev]);
      fetchStats();
      toast.info(`🔔 New Grievance Filed: ${complaint.complaintId}`);
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
      const [compRes, userRes, wasteRes, parkRes, pollRes] = await Promise.all([
        api.get('/complaints'),
        api.get('/users'),
        api.get('/waste'),
        api.get('/parking'),
        api.get('/polls')
      ]);
      setComplaints(compRes.data || []);
      setUsers(userRes.data || []);
      setWastePickups(wasteRes.data?.pickups || []);
      setParkingHubs(parkRes.data?.hubs || []);
      setPolls(pollRes.data?.polls || []);
      fetchStats();
    } catch (err) {
      toast.error('Failed to load admin control center data');
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/stats');
      setStats(res.data);
    } catch (err) {}
  };

  // Complaint Actions
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

  const handleSaveAdminNote = async () => {
    if (!selectedComplaint) return;
    try {
      await api.put(`/complaints/update/${selectedComplaint.complaintId || selectedComplaint._id}`, { adminNote: adminNoteInput });
      toast.success("Admin remark updated!");
      fetchData();
    } catch (err) {
      toast.error("Failed to save remark");
    }
  };

  // User Actions
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
      toast.success("User account status toggled");
      fetchData();
    } catch (err) {
      toast.error('Failed to update user status');
    }
  };

  // Poll Action
  const handleCreatePoll = async (e) => {
    e.preventDefault();
    const options = [pollForm.option1, pollForm.option2, pollForm.option3].filter(o => o.trim() !== '');
    if (options.length < 2) {
      toast.warning('Please provide at least 2 voting options');
      return;
    }
    try {
      const res = await api.post('/polls', {
        title: pollForm.title,
        description: pollForm.description,
        category: pollForm.category,
        allocatedBudget: pollForm.allocatedBudget,
        ward: pollForm.ward,
        options
      });
      if (res.data.success) {
        toast.success('🗳️ Civic proposal poll published successfully!');
        setShowPollModal(false);
        setPollForm({ title: '', description: '', category: 'Infrastructure', allocatedBudget: '₹ 50 Lakhs', ward: 'City-wide', option1: '', option2: '', option3: '' });
        fetchData();
      }
    } catch (err) {
      toast.error('Failed to publish poll');
    }
  };

  const departments = users.filter(u => u.role === 'department');
  const staffMembers = users.filter(u => u.role === 'staff');
  const citizens = users.filter(u => u.role === 'user');

  const filteredComplaints = complaints.filter(c => {
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesSearch = complaintSearch === '' ||
      c.complaintId.toLowerCase().includes(complaintSearch.toLowerCase()) ||
      c.title.toLowerCase().includes(complaintSearch.toLowerCase()) ||
      (c.userName && c.userName.toLowerCase().includes(complaintSearch.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const filteredUsers = users.filter(u => roleFilter === 'All' || u.role === roleFilter);

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '30px 20px', fontFamily: "'Inter', sans-serif" }}>
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #0369a1 100%)',
        borderRadius: '24px',
        padding: '35px 40px',
        color: 'white',
        boxShadow: '0 10px 30px rgba(3, 105, 161, 0.25)',
        marginBottom: '35px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ background: 'rgba(255,255,255,0.15)', width: '60px', height: '60px', borderRadius: '18px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '32px' }}>🎛️</div>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800' }}>Admin Command & Control Center</h1>
            <p style={{ margin: '6px 0 0 0', opacity: 0.9, fontSize: '15px' }}>
              Municipal Governance Overview, Grievance Routing, Personnel Accounts & Smart Modules
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowUserModal(true)}
          style={{
            background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '100px',
            fontWeight: '700',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            boxShadow: '0 4px 15px rgba(14, 165, 233, 0.3)'
          }}
        >
          ➕ Add Staff / Dept Account
        </button>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', background: 'white', padding: '10px', borderRadius: '18px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', flexWrap: 'wrap' }}>
        {[
          { id: 'overview', label: '📊 Executive Overview', icon: '📈' },
          { id: 'complaints', label: `📋 Grievances (${complaints.length})`, icon: '🎫' },
          { id: 'users', label: `👥 User Accounts (${users.length})`, icon: '👤' },
          { id: 'smart-modules', label: '⚡ Smart Modules Hub', icon: '🚀' },
          { id: 'analytics', label: '📊 System Analytics', icon: '📈' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              minWidth: '160px',
              padding: '12px 18px',
              borderRadius: '12px',
              border: 'none',
              fontWeight: '700',
              fontSize: '14px',
              cursor: 'pointer',
              transition: '0.2s',
              background: activeTab === tab.id ? '#0ea5e9' : 'transparent',
              color: activeTab === tab.id ? 'white' : '#475569'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Executive Overview */}
      {activeTab === 'overview' && (
        <div>
          {/* Top KPI Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat( auto-fit, minmax(220px, 1fr) )', gap: '20px', marginBottom: '35px' }}>
            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '22px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
              <span style={{ color: '#64748b', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>Total Grievances</span>
              <div style={{ fontSize: '34px', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>{stats.total || complaints.length}</div>
              <span style={{ fontSize: '12px', color: '#0ea5e9', fontWeight: '600' }}>🏛️ System Tickets</span>
            </div>

            <div style={{ background: 'white', border: '1px solid #86efac', borderRadius: '20px', padding: '22px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
              <span style={{ color: '#15803d', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>Resolved Grievances</span>
              <div style={{ fontSize: '34px', fontWeight: '900', color: '#16a34a', marginTop: '4px' }}>{stats.resolved}</div>
              <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: '600' }}>✅ Resolution Rate {stats.total ? Math.round((stats.resolved/stats.total)*100) : 0}%</span>
            </div>

            <div style={{ background: 'white', border: '1px solid #fde047', borderRadius: '20px', padding: '22px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
              <span style={{ color: '#a16207', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>Active In-Progress</span>
              <div style={{ fontSize: '34px', fontWeight: '900', color: '#ca8a04', marginTop: '4px' }}>{stats.progress + stats.pending}</div>
              <span style={{ fontSize: '12px', color: '#ca8a04', fontWeight: '600' }}>🔨 Field Operations</span>
            </div>

            <div style={{ background: 'white', border: '1px solid #cbd5e1', borderRadius: '20px', padding: '22px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
              <span style={{ color: '#475569', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>Registered Citizens</span>
              <div style={{ fontSize: '34px', fontWeight: '900', color: '#334155', marginTop: '4px' }}>{citizens.length}</div>
              <span style={{ fontSize: '12px', color: '#475569', fontWeight: '600' }}>👤 Active Users</span>
            </div>

            <div style={{ background: 'white', border: '1px solid #c084fc', borderRadius: '20px', padding: '22px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
              <span style={{ color: '#7e22ce', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>Depts & Staff</span>
              <div style={{ fontSize: '34px', fontWeight: '900', color: '#9333ea', marginTop: '4px' }}>{departments.length + staffMembers.length}</div>
              <span style={{ fontSize: '12px', color: '#9333ea', fontWeight: '600' }}>🛠️ Municipal Workforce</span>
            </div>
          </div>

          {/* Quick Action Shortcuts */}
          <h3 style={{ fontSize: '20px', color: '#0f172a', marginBottom: '15px' }}>⚡ Smart Super Portal Control Panels</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat( auto-fit, minmax(240px, 1fr) )', gap: '20px' }}>
            <div onClick={() => setActiveTab('complaints')} style={{ background: 'white', padding: '22px', borderRadius: '20px', border: '1px solid #e2e8f0', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '32px' }}>📋</div>
              <h4 style={{ margin: '10px 0 4px 0', fontSize: '18px', color: '#0f172a' }}>Grievance Command</h4>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Assign departments, monitor SLA deadlines, & set status.</p>
            </div>

            <div onClick={() => setActiveTab('users')} style={{ background: 'white', padding: '22px', borderRadius: '20px', border: '1px solid #e2e8f0', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '32px' }}>👥</div>
              <h4 style={{ margin: '10px 0 4px 0', fontSize: '18px', color: '#0f172a' }}>Personnel Accounts</h4>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Create department logins, staff IDs, & manage permissions.</p>
            </div>

            <div onClick={() => setActiveTab('smart-modules')} style={{ background: 'white', padding: '22px', borderRadius: '20px', border: '1px solid #e2e8f0', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '32px' }}>🏛️</div>
              <h4 style={{ margin: '10px 0 4px 0', fontSize: '18px', color: '#0f172a' }}>Publish Civic Polls</h4>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Create community budget voting initiatives & citizen polls.</p>
            </div>

            <div onClick={() => setActiveTab('smart-modules')} style={{ background: 'white', padding: '22px', borderRadius: '20px', border: '1px solid #e2e8f0', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '32px' }}>♻️</div>
              <h4 style={{ margin: '10px 0 4px 0', fontSize: '18px', color: '#0f172a' }}>E-Waste & Recycling</h4>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Inspect pickup requests & citizen Eco-Points rewards.</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Grievances Command Center */}
      {activeTab === 'complaints' && (
        <div style={{ background: 'white', borderRadius: '24px', padding: '25px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '20px', color: '#0f172a' }}>Centralized Grievance Command Center</h3>

            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder="🔍 Search ticket ID, citizen, title..."
                value={complaintSearch}
                onChange={(e) => setComplaintSearch(e.target.value)}
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
                <option>In Progress</option>
                <option>Resolved</option>
                <option>Closed</option>
              </select>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', color: '#475569', fontSize: '13px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '14px' }}>Ticket ID</th>
                  <th style={{ padding: '14px' }}>Category & Title</th>
                  <th style={{ padding: '14px' }}>Citizen</th>
                  <th style={{ padding: '14px' }}>Priority</th>
                  <th style={{ padding: '14px' }}>Status</th>
                  <th style={{ padding: '14px' }}>Assign Department</th>
                  <th style={{ padding: '14px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.length === 0 ? (
                  <tr><td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>No complaints match the filter.</td></tr>
                ) : filteredComplaints.map(c => (
                  <tr key={c._id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '14px' }}>
                    <td style={{ padding: '14px', fontWeight: '800', color: '#0ea5e9' }}>{c.complaintId}</td>
                    <td style={{ padding: '14px' }}>
                      <strong style={{ color: '#0f172a' }}>{c.title}</strong>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>🏷️ {c.category} ({c.ward || 'Main Zone'})</div>
                    </td>
                    <td style={{ padding: '14px', color: '#334155' }}>{c.userName}</td>
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
                        value={c.assignedDepartmentId || ''}
                        onChange={(e) => handleAssignDepartment(c.complaintId || c._id, e.target.value)}
                        style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      >
                        <option value="">-- Route to Dept --</option>
                        {departments.map(d => (
                          <option key={d._id} value={d._id}>{d.name} ({d.departmentName})</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: '14px' }}>
                      <button
                        onClick={() => {
                          setSelectedComplaint(c);
                          setAdminNoteInput(c.adminNote || '');
                          setShowComplaintModal(true);
                        }}
                        style={{ background: '#0ea5e9', color: 'white', padding: '6px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}
                      >
                        Inspect & Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Personnel Accounts & Department Management */}
      {activeTab === 'users' && (
        <div style={{ background: 'white', borderRadius: '24px', padding: '25px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '20px', color: '#0f172a' }}>User & Municipal Workforce Accounts</h3>

            <div style={{ display: 'flex', gap: '10px' }}>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                style={{ padding: '8px 14px', borderRadius: '100px', border: '1px solid #cbd5e1', fontWeight: '600' }}
              >
                <option value="All">All Roles</option>
                <option value="user">Citizens</option>
                <option value="department">Department Heads</option>
                <option value="staff">Field Staff</option>
                <option value="admin">Administrators</option>
              </select>

              <button
                onClick={() => setShowUserModal(true)}
                style={{ background: '#0ea5e9', color: 'white', padding: '8px 18px', borderRadius: '100px', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}
              >
                ➕ Create Personnel Account
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', color: '#475569', fontSize: '13px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '14px' }}>Name</th>
                  <th style={{ padding: '14px' }}>Username</th>
                  <th style={{ padding: '14px' }}>Role</th>
                  <th style={{ padding: '14px' }}>Department</th>
                  <th style={{ padding: '14px' }}>Status</th>
                  <th style={{ padding: '14px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u._id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '14px' }}>
                    <td style={{ padding: '14px', fontWeight: '700', color: '#0f172a' }}>{u.name}</td>
                    <td style={{ padding: '14px', color: '#64748b' }}>@{u.username}</td>
                    <td style={{ padding: '14px' }}>
                      <span style={{
                        padding: '4px 10px', borderRadius: '100px', fontSize: '12px', fontWeight: '800',
                        background: u.role === 'admin' ? '#f3e8ff' : u.role === 'department' ? '#e0f2fe' : u.role === 'staff' ? '#dcfce7' : '#f1f5f9',
                        color: u.role === 'admin' ? '#7e22ce' : u.role === 'department' ? '#0369a1' : u.role === 'staff' ? '#15803d' : '#475569'
                      }}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '14px', color: '#334155' }}>{u.departmentName || '—'}</td>
                    <td style={{ padding: '14px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '100px', fontSize: '12px', fontWeight: '800', background: u.isActive !== false ? '#dcfce7' : '#fee2e2', color: u.isActive !== false ? '#15803d' : '#b91c1c' }}>
                        {u.isActive !== false ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td style={{ padding: '14px' }}>
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleUserStatus(u._id)}
                          style={{ background: u.isActive !== false ? '#ef4444' : '#10b981', color: 'white', padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}
                        >
                          {u.isActive !== false ? 'Suspend' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Smart Super Modules Hub */}
      {activeTab === 'smart-modules' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {/* Civic Budgeting Polls Panel */}
          <div style={{ background: 'white', borderRadius: '24px', padding: '25px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '20px', color: '#0f172a' }}>🏛️ Participatory Civic Budgeting Polls</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>Create & manage citizen voting initiatives for municipal capital projects.</p>
              </div>

              <button
                onClick={() => setShowPollModal(true)}
                style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: 'white', padding: '10px 20px', borderRadius: '100px', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}
              >
                ➕ Publish New Proposal Poll
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat( auto-fit, minmax(280px, 1fr) )', gap: '20px' }}>
              {polls.map((poll) => (
                <div key={poll.pollId} style={{ border: '1px solid #e2e8f0', borderRadius: '18px', padding: '20px', background: '#faf5ff' }}>
                  <span style={{ background: '#7c3aed', color: 'white', padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>{poll.category}</span>
                  <h4 style={{ margin: '8px 0 4px 0', fontSize: '16px', color: '#0f172a' }}>{poll.title}</h4>
                  <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#64748b' }}>💰 Budget: <strong>{poll.allocatedBudget}</strong> | Ward: {poll.ward}</p>
                  <div style={{ fontSize: '12px', color: '#7c3aed', fontWeight: '700' }}>
                    🗳️ Total Votes Cast: {poll.options.reduce((acc, o) => acc + o.votesCount, 0)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Smart Waste Requests Inspector */}
          <div style={{ background: 'white', borderRadius: '24px', padding: '25px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '20px', color: '#0f172a' }}>♻️ Smart E-Waste & Recycling Requests Inspector</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat( auto-fit, minmax(280px, 1fr) )', gap: '15px' }}>
              {wastePickups.map((w) => (
                <div key={w._id} style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px', background: '#f0fdf4' }}>
                  <span style={{ background: '#15803d', color: 'white', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>{w.requestId}</span>
                  <h4 style={{ margin: '6px 0 2px 0', fontSize: '15px', color: '#14532d' }}>{w.wasteType}</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#166534' }}>📍 {w.address} | 👤 {w.userName}</p>
                  <span style={{ fontSize: '12px', color: '#15803d', fontWeight: '700', marginTop: '6px', display: 'block' }}>Status: {w.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: System Analytics */}
      {activeTab === 'analytics' && (
        <div style={{ background: 'white', borderRadius: '24px', padding: '30px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '22px', color: '#0f172a' }}>📊 Municipal Analytics & Resolution Speed</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat( auto-fit, minmax(280px, 1fr) )', gap: '25px' }}>
            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '18px', border: '1px solid #cbd5e1' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#0f172a' }}>Grievance Categories Distribution</h4>
              <div style={{ fontSize: '14px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>🏗️ Smart Infrastructure:</span> <strong>35%</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>💧 Water & Sanitation:</span> <strong>28%</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>⚡ Energy & Lighting:</span> <strong>22%</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>🚌 Transport & Cabs:</span> <strong>15%</strong></div>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '18px', border: '1px solid #cbd5e1' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#0f172a' }}>Department SLA Resolution Benchmark</h4>
              <div style={{ fontSize: '14px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Road Department:</span> <strong style={{ color: '#16a34a' }}>92% Met SLA</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Electrical Dept:</span> <strong style={{ color: '#16a34a' }}>88% Met SLA</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Sanitation Dept:</span> <strong style={{ color: '#16a34a' }}>95% Met SLA</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Complaint Inspection Modal */}
      {showComplaintModal && selectedComplaint && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'white', width: '100%', maxWidth: '540px', borderRadius: '24px', padding: '30px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#0f172a', fontSize: '20px' }}>Inspect Ticket: {selectedComplaint.complaintId}</h2>
              <button onClick={() => setShowComplaintModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <span style={{ fontSize: '12px', color: '#0ea5e9', fontWeight: '800' }}>{selectedComplaint.category}</span>
                <h3 style={{ margin: '4px 0', color: '#0f172a' }}>{selectedComplaint.title}</h3>
                <p style={{ margin: 0, color: '#475569', fontSize: '14px' }}>{selectedComplaint.description}</p>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', fontSize: '13px' }}>
                <div>👤 Citizen: <strong>{selectedComplaint.userName}</strong></div>
                <div>📍 Location: <strong>{selectedComplaint.location || selectedComplaint.ward || 'Main Ward'}</strong></div>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>Official Admin Remark / Directive</label>
                <textarea
                  rows={3}
                  value={adminNoteInput}
                  onChange={(e) => setAdminNoteInput(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                />
                <button onClick={handleSaveAdminNote} style={{ marginTop: '8px', background: '#0ea5e9', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', fontWeight: '700', cursor: 'pointer' }}>
                  Save Official Remark
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showUserModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'white', width: '100%', maxWidth: '480px', borderRadius: '24px', padding: '30px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#0f172a', fontSize: '20px' }}>➕ Create Municipal Account</h2>
              <button onClick={() => setShowUserModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>Role Type</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                >
                  <option value="department">Department Head Account</option>
                  <option value="staff">Field Staff Member Account</option>
                  <option value="admin">Administrator Account</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Electrical Dept Head"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>Username</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. electrical_dept"
                  value={userForm.username}
                  onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>Department Name</label>
                <input
                  type="text"
                  placeholder="e.g. Electrical Department"
                  value={userForm.departmentName}
                  onChange={(e) => setUserForm({ ...userForm, departmentName: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                />
              </div>

              <button
                type="submit"
                style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', color: 'white', padding: '12px', borderRadius: '12px', fontWeight: '700', border: 'none', cursor: 'pointer', marginTop: '10px' }}
              >
                Create Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Publish Poll Modal */}
      {showPollModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'white', width: '100%', maxWidth: '500px', borderRadius: '24px', padding: '30px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#0f172a', fontSize: '20px' }}>🏛️ Publish Civic Proposal Poll</h2>
              <button onClick={() => setShowPollModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleCreatePoll} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>Proposal Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solar Bus Shelter Energy Grid"
                  value={pollForm.title}
                  onChange={(e) => setPollForm({ ...pollForm, title: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>Description</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Describe the proposal details for citizen voting..."
                  value={pollForm.description}
                  onChange={(e) => setPollForm({ ...pollForm, description: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>Allocated Budget</label>
                  <input
                    type="text"
                    placeholder="₹ 50 Lakhs"
                    value={pollForm.allocatedBudget}
                    onChange={(e) => setPollForm({ ...pollForm, allocatedBudget: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>Ward / Sector</label>
                  <input
                    type="text"
                    placeholder="City-wide"
                    value={pollForm.ward}
                    onChange={(e) => setPollForm({ ...pollForm, ward: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>Voting Option 1</label>
                <input
                  type="text"
                  required
                  placeholder="Option 1"
                  value={pollForm.option1}
                  onChange={(e) => setPollForm({ ...pollForm, option1: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '2px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>Voting Option 2</label>
                <input
                  type="text"
                  required
                  placeholder="Option 2"
                  value={pollForm.option2}
                  onChange={(e) => setPollForm({ ...pollForm, option2: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '2px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>Voting Option 3 (Optional)</label>
                <input
                  type="text"
                  placeholder="Option 3"
                  value={pollForm.option3}
                  onChange={(e) => setPollForm({ ...pollForm, option3: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '2px' }}
                />
              </div>

              <button
                type="submit"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: 'white', padding: '12px', borderRadius: '12px', fontWeight: '700', border: 'none', cursor: 'pointer', marginTop: '10px' }}
              >
                Publish Proposal Poll
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
