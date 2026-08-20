import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import socket from '../utils/socket';
import './Auth.css';
import { toast, ToastContainer } from 'react-toastify';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('grievances');
  
  // Grievance State
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, progress: 0, resolved: 0, closed: 0, rejected: 0, users: 0, feedbacks: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [adminNoteInput, setAdminNoteInput] = useState('');
  
  // User Management State
  const [users, setUsers] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  
  // Staff Management State
  const [staffForm, setStaffForm] = useState({ name: '', username: '', email: '', password: '', department: 'General' });
  const [staffSearchTerm, setStaffSearchTerm] = useState('');

  // Emergency Management State
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [emergencyReports, setEmergencyReports] = useState([]);
  const [newContact, setNewContact] = useState({ title: '', contactNumber: '', category: 'Police', location: '', instructions: '' });

  const [serverOnline, setServerOnline] = useState(false);

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
      
      const userResp = await api.get('/users');
      if (Array.isArray(userResp.data)) {
        setUsers(userResp.data);
      }

      const contactsResp = await api.get('/emergency/admin/contacts');
      if (Array.isArray(contactsResp.data)) {
        setEmergencyContacts(contactsResp.data);
      }

      const reportsResp = await api.get('/emergency/admin/reports');
      if (Array.isArray(reportsResp.data)) {
        setEmergencyReports(reportsResp.data);
      }

      fetchStats();
      setServerOnline(true);
    } catch (err) {
      setServerOnline(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/stats');
      setStats(res.data);
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
      fetchData(); 
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

  const handleToggleUser = async (userId) => {
    try {
      const res = await api.patch(`/users/${userId}/status`);
      setUsers(users.map(u => u.id === userId ? { ...u, isActive: res.data.isActive } : u));
      toast.success(res.data.message);
    } catch(err) {
      toast.error('Failed to toggle user status');
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/users/staff', staffForm);
      setUsers([...users, res.data.user]);
      toast.success("Staff credential generated successfully!");
      setStaffForm({ name: '', username: '', email: '', password: '', department: 'General' });
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create staff credential");
    }
  };

  const handleCreateContact = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/emergency/contacts', newContact);
      setEmergencyContacts([...emergencyContacts, res.data]);
      toast.success('Emergency contact added successfully!');
      setNewContact({ title: '', contactNumber: '', category: 'Police', location: '', instructions: '' });
    } catch(err) {
      toast.error('Failed to add contact');
    }
  };

  const handleDeleteContact = async (id) => {
    if (!window.confirm("Delete this emergency contact?")) return;
    try {
      await api.delete(`/emergency/contacts/${id}`);
      setEmergencyContacts(emergencyContacts.filter(c => c._id !== id));
      toast.success('Contact deleted');
    } catch(err) {
      toast.error('Failed to delete contact');
    }
  };

  const handleUpdateReportStatus = async (id, status) => {
    try {
      await api.put(`/emergency/reports/${id}/status`, { status });
      setEmergencyReports(emergencyReports.map(r => r._id === id ? { ...r, status } : r));
      toast.success('Report status updated');
    } catch(err) {
      toast.error('Failed to update report status');
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

  const filteredUsers = users.filter(u => u.role !== 'staff' && (
    u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearchTerm.toLowerCase()) || 
    u.username.toLowerCase().includes(userSearchTerm.toLowerCase())
  ));

  const filteredStaff = users.filter(u => u.role === 'staff' && (
    u.name.toLowerCase().includes(staffSearchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(staffSearchTerm.toLowerCase()) || 
    u.username.toLowerCase().includes(staffSearchTerm.toLowerCase()) ||
    u.department?.toLowerCase().includes(staffSearchTerm.toLowerCase())
  ));

  return (
    <div className="dashboard-wrapper admin-theme" style={{ paddingTop: '20px', background: '#f0f4f8', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <ToastContainer />
      <header className="admin-hero" style={{ textAlign: 'center', marginBottom: '20px' }}>
        <div style={{
          background: serverOnline ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.1)',
          color: serverOnline ? '#065f46' : '#991b1b',
          border: `1px solid ${serverOnline ? '#6ee7b7' : '#fca5a5'}`,
          borderRadius: '20px', padding: '6px 18px', display: 'inline-block', fontSize: '13px', fontWeight: '700', marginBottom: '15px'
        }}>
          {serverOnline ? `✅ Real-time Active | ${stats.total} Grievances | ${users.length} Citizens` : '⚠️ Connection Offline'}
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#92400e' }}>Operational Monitoring Center</h1>
        <p style={{ color: '#64748b' }}>Oversee city-wide grievances and citizen identities with real-time tracking.</p>
      </header>

      {/* Tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '40px' }}>
        <button 
          onClick={() => setActiveTab('grievances')} 
          style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: activeTab === 'grievances' ? '#0f172a' : '#cbd5e1', color: activeTab === 'grievances' ? '#fff' : '#475569', cursor: 'pointer', fontWeight: 'bold' }}>
          Grievance Management
        </button>
        <button 
          onClick={() => setActiveTab('users')} 
          style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: activeTab === 'users' ? '#0f172a' : '#cbd5e1', color: activeTab === 'users' ? '#fff' : '#475569', cursor: 'pointer', fontWeight: 'bold' }}>
          Citizen Registry
        </button>
        <button 
          onClick={() => setActiveTab('staff')} 
          style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: activeTab === 'staff' ? '#0f172a' : '#cbd5e1', color: activeTab === 'staff' ? '#fff' : '#475569', cursor: 'pointer', fontWeight: 'bold' }}>
          Staff Management
        </button>
        <button 
          onClick={() => setActiveTab('emergency')} 
          style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: activeTab === 'emergency' ? '#991b1b' : '#fecaca', color: activeTab === 'emergency' ? '#fff' : '#991b1b', cursor: 'pointer', fontWeight: 'bold' }}>
          🚨 Emergency Mgmt
        </button>
      </div>

      {activeTab === 'grievances' && (
        <>
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

          <div style={{ padding: '0 40px 40px 40px' }}>
            <h3 style={{ color: '#1e293b', fontSize: '18px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              Incoming Grievances (Newest First)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {safeComplaints.filter(c => ['Submitted', 'Under Review'].includes(c.status)).slice(0, 4).map(c => (
                <div key={c._id} style={{ background: '#ffffff', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.04)' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
                     <span style={{ fontSize: '13px', fontWeight: '800', color: '#f59e0b', background: '#fffbeb', padding: '4px 10px', borderRadius: '8px' }}>#{c.complaintId || 'N/A'}</span>
                   </div>
                   <h4 style={{ color: '#0f172a', fontSize: '18px', fontWeight: '700', margin: '0 0 8px 0' }}>{c.title}</h4>
                   <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 20px 0' }}>{c.category}</p>
                   <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => handleUpdateStatus(c.complaintId || c._id, 'Resolved')} style={{ flex: 1, background: '#10b981', color: 'white', border: 'none', padding: '12px', borderRadius: '12px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>RESOLVE</button>
                      <button onClick={() => handleViewDetails(c)} style={{ width: '45px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '12px', fontSize: '18px', cursor: 'pointer' }}>👁️</button>
                   </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: '0 40px', marginBottom: '100px' }}>
            <div style={{ background: 'rgba(0,0,0,0.15)', backdropFilter: 'blur(8px)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
              <div style={{ padding: '20px 30px', background: 'rgba(0,0,0,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '20px' }}>
                   <input type="text" placeholder="Search CID or Citizen..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ padding: '10px 20px', borderRadius: '12px', border: 'none', outline: 'none', width: '250px' }} />
                  <select onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: '10px', borderRadius: '10px', border: 'none' }}>
                    <option value="all">All Statuses</option>
                    <option value="Submitted">Submitted</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Assigned">Assigned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                    <option value="Rejected">Rejected</option>
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
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{c.category}</div>
                      </td>
                      <td style={{ padding: '18px 20px' }}><span style={{ background: '#fff3c7', color: '#92400e', padding: '6px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: '800' }}>{c.status}</span></td>
                      <td style={{ padding: '18px 30px', textAlign: 'right' }}>
                        <button onClick={() => handleViewDetails(c)} style={{ background: '#e0f2fe', color: '#0369a1', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '800' }}>📋 Details</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'users' && (
        <div style={{ padding: '0 40px', marginBottom: '100px' }}>
          <div style={{ background: 'rgba(0,0,0,0.15)', backdropFilter: 'blur(8px)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 30px', background: 'rgba(0,0,0,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <input type="text" placeholder="Search Citizen by Name or Email..." value={userSearchTerm} onChange={(e) => setUserSearchTerm(e.target.value)} style={{ padding: '10px 20px', borderRadius: '12px', border: 'none', outline: 'none', width: '350px' }} />
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: 'rgba(0,0,0,0.2)', color: 'rgba(255,255,255,0.6)', fontSize: '13px', textTransform: 'uppercase' }}>
                <tr>
                  <th style={{ padding: '18px 30px' }}>Citizen Name</th>
                  <th style={{ padding: '18px 20px' }}>Email / Phone</th>
                  <th style={{ padding: '18px 20px' }}>Role</th>
                  <th style={{ padding: '18px 20px' }}>Status</th>
                  <th style={{ padding: '18px 30px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    <td style={{ padding: '18px 30px', fontWeight: '700', color: 'white' }}>{u.name} <br/><span style={{fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: 'normal'}}>@{u.username}</span></td>
                    <td style={{ padding: '18px 20px', color: 'rgba(255,255,255,0.8)', fontSize: '13px' }}>{u.email}<br/>{u.phone}</td>
                    <td style={{ padding: '18px 20px', textTransform: 'capitalize', color: 'white' }}>{u.role}</td>
                    <td style={{ padding: '18px 20px' }}>
                      <span style={{ background: u.isActive ? '#dcfce7' : '#fee2e2', color: u.isActive ? '#166534' : '#991b1b', padding: '6px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: '800' }}>
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td style={{ padding: '18px 30px', textAlign: 'right' }}>
                      {u.role !== 'admin' && (
                        <button 
                          onClick={() => handleToggleUser(u.id)} 
                          style={{ background: u.isActive ? '#ef4444' : '#10b981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '800' }}>
                          {u.isActive ? 'Deactivate' : 'Activate'}
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

      {activeTab === 'staff' && (
        <div style={{ padding: '0 40px', marginBottom: '100px', display: 'flex', gap: '30px' }}>
          {/* Staff Creation Form */}
          <div style={{ flex: '1', background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', height: 'fit-content' }}>
            <h3 style={{ color: '#0f172a', marginBottom: '20px', fontSize: '20px', fontWeight: '800' }}>Issue Staff Credential</h3>
            <form onSubmit={handleCreateStaff}>
              <div style={{ display: 'grid', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Department</label>
                  <select required value={staffForm.department} onChange={e => setStaffForm({...staffForm, department: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <option value="General">General</option>
                    <option value="Water Supply">Water Supply</option>
                    <option value="Electricity">Electricity</option>
                    <option value="Sanitation">Sanitation</option>
                    <option value="Roads & Transport">Roads & Transport</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Full Name</label>
                  <input type="text" required placeholder="e.g. John Doe" value={staffForm.name} onChange={e => setStaffForm({...staffForm, name: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Username</label>
                  <input type="text" required placeholder="e.g. johndoe_water" value={staffForm.username} onChange={e => setStaffForm({...staffForm, username: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Email (Optional)</label>
                  <input type="email" placeholder="john@city.gov" value={staffForm.email} onChange={e => setStaffForm({...staffForm, email: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Initial Password</label>
                  <input type="password" required placeholder="Secure password" value={staffForm.password} onChange={e => setStaffForm({...staffForm, password: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <button type="submit" style={{ background: '#10b981', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>Generate Credential</button>
              </div>
            </form>
          </div>

          {/* Staff List Table */}
          <div style={{ flex: '2', background: 'rgba(0,0,0,0.15)', backdropFilter: 'blur(8px)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 30px', background: 'rgba(0,0,0,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <input type="text" placeholder="Search Staff..." value={staffSearchTerm} onChange={(e) => setStaffSearchTerm(e.target.value)} style={{ padding: '10px 20px', borderRadius: '12px', border: 'none', outline: 'none', width: '250px' }} />
              <div style={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>Active Staff: {filteredStaff.filter(s => s.isActive).length}</div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: 'rgba(0,0,0,0.2)', color: 'rgba(255,255,255,0.6)', fontSize: '13px', textTransform: 'uppercase' }}>
                <tr>
                  <th style={{ padding: '18px 30px' }}>Staff Member</th>
                  <th style={{ padding: '18px 20px' }}>Department</th>
                  <th style={{ padding: '18px 20px' }}>Status</th>
                  <th style={{ padding: '18px 30px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    <td style={{ padding: '18px 30px', fontWeight: '700', color: 'white' }}>{u.name} <br/><span style={{fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: 'normal'}}>@{u.username}</span></td>
                    <td style={{ padding: '18px 20px', color: '#6ee7b7', fontWeight: 'bold', fontSize: '13px' }}>{u.department}</td>
                    <td style={{ padding: '18px 20px' }}>
                      <span style={{ background: u.isActive ? '#dcfce7' : '#fee2e2', color: u.isActive ? '#166534' : '#991b1b', padding: '6px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: '800' }}>
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td style={{ padding: '18px 30px', textAlign: 'right' }}>
                      <button 
                        onClick={() => handleToggleUser(u.id)} 
                        style={{ background: u.isActive ? '#ef4444' : '#10b981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '800' }}>
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'emergency' && (
        <div style={{ padding: '0 40px', marginBottom: '100px' }}>
          <div style={{ display: 'flex', gap: '30px' }}>
            
            {/* Left: Add Contact Form */}
            <div style={{ flex: '1', background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', height: 'fit-content' }}>
              <h3 style={{ color: '#0f172a', marginBottom: '20px', fontSize: '20px', fontWeight: '800' }}>Add Emergency Contact</h3>
              <form onSubmit={handleCreateContact}>
                <div style={{ display: 'grid', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Title</label>
                    <input type="text" required placeholder="e.g. Traffic Police" value={newContact.title} onChange={e => setNewContact({...newContact, title: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Contact Number</label>
                    <input type="text" required placeholder="e.g. 103" value={newContact.contactNumber} onChange={e => setNewContact({...newContact, contactNumber: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Category</label>
                    <select value={newContact.category} onChange={e => setNewContact({...newContact, category: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                      <option value="Police">Police</option>
                      <option value="Fire Brigade">Fire Brigade</option>
                      <option value="Ambulance">Ambulance</option>
                      <option value="Disaster Management">Disaster Management</option>
                      <option value="Women/Child Helpline">Women/Child Helpline</option>
                      <option value="Hospital Emergency">Hospital Emergency</option>
                      <option value="Electricity Emergency">Electricity Emergency</option>
                      <option value="Water Emergency">Water Emergency</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Location</label>
                    <input type="text" placeholder="e.g. City Wide" value={newContact.location} onChange={e => setNewContact({...newContact, location: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Instructions</label>
                    <textarea placeholder="e.g. Call for immediate assistance." value={newContact.instructions} onChange={e => setNewContact({...newContact, instructions: e.target.value})} rows="2" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <button type="submit" style={{ background: '#ef4444', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>Add Contact</button>
                </div>
              </form>
            </div>

            {/* Right: Emergency Reports & Contacts List */}
            <div style={{ flex: '2', display: 'flex', flexDirection: 'column', gap: '30px' }}>
              
              {/* Emergency Reports */}
              <div style={{ background: 'rgba(0,0,0,0.15)', backdropFilter: 'blur(8px)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                <div style={{ padding: '20px 30px', background: 'rgba(239, 68, 68, 0.2)', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ color: 'white', margin: 0, fontSize: '18px' }}>🚨 Urgent Emergency Reports</h3>
                  <div style={{ color: '#fca5a5', fontWeight: 'bold', fontSize: '14px' }}>Active Reports: {emergencyReports.filter(r => r.status !== 'Resolved').length}</div>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ background: 'rgba(0,0,0,0.2)', color: 'rgba(255,255,255,0.6)', fontSize: '13px', textTransform: 'uppercase' }}>
                    <tr>
                      <th style={{ padding: '15px 20px' }}>Type / Location</th>
                      <th style={{ padding: '15px 20px' }}>Description</th>
                      <th style={{ padding: '15px 20px' }}>Status</th>
                      <th style={{ padding: '15px 20px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emergencyReports.map(r => (
                      <tr key={r._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                        <td style={{ padding: '15px 20px' }}>
                          <strong style={{ color: '#fca5a5' }}>{r.emergencyType}</strong>
                          <div style={{ color: 'white', fontSize: '13px' }}>{r.location}</div>
                        </td>
                        <td style={{ padding: '15px 20px', color: 'rgba(255,255,255,0.8)', fontSize: '13px', maxWidth: '200px' }}>{r.description}</td>
                        <td style={{ padding: '15px 20px' }}>
                          <select 
                            value={r.status} 
                            onChange={(e) => handleUpdateReportStatus(r._id, e.target.value)}
                            style={{ 
                              padding: '5px 10px', 
                              borderRadius: '6px', 
                              border: 'none',
                              background: r.status === 'Resolved' ? '#dcfce7' : '#fef08a',
                              color: r.status === 'Resolved' ? '#166534' : '#854d0e',
                              fontWeight: 'bold',
                              fontSize: '12px'
                            }}
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                          </select>
                        </td>
                        <td style={{ padding: '15px 20px', textAlign: 'right' }}>
                          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{new Date(r.createdAt).toLocaleString()}</span>
                        </td>
                      </tr>
                    ))}
                    {emergencyReports.length === 0 && (
                      <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>No emergency reports.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Contacts List */}
              <div style={{ background: 'rgba(0,0,0,0.15)', backdropFilter: 'blur(8px)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                <div style={{ padding: '20px 30px', background: 'rgba(0,0,0,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <h3 style={{ color: 'white', margin: 0, fontSize: '18px' }}>Manage Emergency Contacts</h3>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ background: 'rgba(0,0,0,0.2)', color: 'rgba(255,255,255,0.6)', fontSize: '13px', textTransform: 'uppercase' }}>
                    <tr>
                      <th style={{ padding: '15px 20px' }}>Service</th>
                      <th style={{ padding: '15px 20px' }}>Number</th>
                      <th style={{ padding: '15px 20px', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emergencyContacts.map(c => (
                      <tr key={c._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                        <td style={{ padding: '15px 20px' }}>
                          <strong style={{ color: 'white' }}>{c.title}</strong>
                          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>{c.category}</div>
                        </td>
                        <td style={{ padding: '15px 20px', color: '#6ee7b7', fontWeight: 'bold' }}>{c.contactNumber}</td>
                        <td style={{ padding: '15px 20px', textAlign: 'right' }}>
                          <button onClick={() => handleDeleteContact(c._id)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && selectedComplaint && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '900px', borderRadius: '24px', overflow: 'hidden', display: 'flex', maxHeight: '90vh' }}>
            <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <span style={{ background: '#f3f4f6', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', color: '#374151' }}>#{selectedComplaint.complaintId}</span>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#111827', marginBottom: '10px' }}>{selectedComplaint.title}</h2>
              <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>{selectedComplaint.description}</p>
              
              <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#6b7280', marginBottom: '5px' }}>Current Status</label>
                  <select 
                    value={selectedComplaint.status} 
                    onChange={(e) => handleUpdateStatus(selectedComplaint.complaintId, e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                  >
                    <option value="Submitted">Submitted</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Assigned">Assigned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#6b7280', marginBottom: '5px' }}>Assign Department</label>
                  <select 
                    value={selectedComplaint.department || 'General'} 
                    onChange={(e) => {
                      api.put(`/complaints/update/${selectedComplaint.complaintId}`, { department: e.target.value });
                      setSelectedComplaint({...selectedComplaint, department: e.target.value});
                      toast.success('Department updated');
                    }}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                  >
                    <option value="General">General</option>
                    <option value="Water Supply">Water Supply</option>
                    <option value="Electricity">Electricity</option>
                    <option value="Sanitation">Sanitation</option>
                    <option value="Roads & Transport">Roads & Transport</option>
                  </select>
                </div>
              </div>

              <div style={{ marginTop: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#6b7280', marginBottom: '5px' }}>Admin Notes</label>
                <textarea 
                  value={adminNoteInput}
                  onChange={(e) => setAdminNoteInput(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', height: '80px', resize: 'none' }}
                />
                <button onClick={handleSaveAdminNote} style={{ marginTop: '10px', background: '#3b82f6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>Save Note</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
