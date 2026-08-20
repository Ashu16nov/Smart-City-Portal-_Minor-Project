import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import socket from '../utils/socket';
import { toast, ToastContainer } from 'react-toastify';

const StaffDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [resolutionProof, setResolutionProof] = useState('');
  
  useEffect(() => {
    fetchData();

    socket.on('status_update', (updated) => {
      setComplaints(prev => prev.map(c => c.complaintId === updated.complaintId ? updated : c));
    });

    return () => socket.off('status_update');
  }, []);

  const fetchData = async () => {
    try {
      const resp = await api.get('/complaints');
      setComplaints(resp.data);
    } catch (err) {
      toast.error('Failed to load tasks');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/complaints/update/${id}`, { status });
      toast.success(`Task marked as ${status}`);
      fetchData();
    } catch (err) {
      toast.error('Failed to update status');
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

  const handleResolve = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    try {
      await api.put(`/complaints/update/${selectedComplaint.complaintId || selectedComplaint._id}`, { 
        status: 'Resolved',
        resolutionProof 
      });
      toast.success("Task resolved successfully!");
      setShowModal(false);
      setResolutionProof('');
      fetchData();
    } catch (err) {
      toast.error("Failed to submit resolution");
    }
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <ToastContainer position="top-right" />
      <h1 style={{ color: '#0f172a', marginBottom: '10px' }}>Staff Workspace 🛠️</h1>
      <p style={{ color: '#64748b', marginBottom: '30px' }}>View and complete tasks assigned to you.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {complaints.length === 0 ? (
          <p style={{ color: '#64748b' }}>No tasks assigned to you right now. Good job!</p>
        ) : complaints.map(c => (
          <div key={c._id} style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontWeight: 'bold', color: '#0ea5e9' }}>{c.complaintId}</span>
              <span style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', background: c.status === 'Resolved' ? '#dcfce7' : '#fef3c7', color: c.status === 'Resolved' ? '#166534' : '#92400e' }}>
                {c.status}
              </span>
            </div>
            <h3 style={{ margin: '0 0 10px 0', color: '#0f172a', fontSize: '18px' }}>{c.title}</h3>
            <p style={{ color: '#475569', fontSize: '14px', marginBottom: '15px', minHeight: '40px' }}>{c.description.substring(0, 80)}...</p>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              {c.status === 'Assigned' && (
                <button onClick={() => handleUpdateStatus(c.complaintId || c._id, 'Accepted')} style={{ flex: 1, background: '#8b5cf6', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Accept Task</button>
              )}
              {c.status === 'Accepted' && (
                <button onClick={() => handleUpdateStatus(c.complaintId || c._id, 'In Progress')} style={{ flex: 1, background: '#f59e0b', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Start Work</button>
              )}
              {c.status === 'In Progress' && (
                <button onClick={() => { setSelectedComplaint(c); setShowModal(true); }} style={{ flex: 1, background: '#10b981', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Resolve Task</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && selectedComplaint && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'white', width: '100%', maxWidth: '500px', borderRadius: '24px', padding: '30px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <h2 style={{ margin: '0 0 20px 0', color: '#0f172a' }}>Complete Task: {selectedComplaint.complaintId}</h2>
            <form onSubmit={handleResolve} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '8px' }}>Upload Resolution Proof (Optional)</label>
                <input type="file" accept="image/*" onChange={handleFileChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                {resolutionProof && <img src={resolutionProof} alt="Proof Preview" style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px', marginTop: '10px' }} />}
              </div>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={{ flex: 1, background: '#10b981', color: 'white', padding: '12px', borderRadius: '10px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Submit Resolution</button>
                <button type="button" onClick={() => { setShowModal(false); setResolutionProof(''); }} style={{ flex: 1, background: '#f1f5f9', color: '#475569', padding: '12px', borderRadius: '10px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;
