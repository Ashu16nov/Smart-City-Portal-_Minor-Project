import React, { useState } from 'react';
import api from '../utils/api';
import { toast, ToastContainer } from 'react-toastify';

const AdminNotifications = () => {
  const [formData, setFormData] = useState({
    target: 'global', // 'global' or a specific user ID
    type: 'System',
    title: '',
    message: ''
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    try {
      await api.post('/notifications/broadcast', formData);
      toast.success('Notification broadcasted successfully!');
      setFormData({ ...formData, title: '', message: '' });
    } catch (err) {
      toast.error('Failed to send notification');
    }
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto', minHeight: '100vh' }}>
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#0f172a', margin: '0 0 10px 0' }}>Broadcast Notification</h1>
        <p style={{ color: '#64748b', margin: 0 }}>Send instant alerts to all residents or a specific user via WebSockets, Email, and SMS.</p>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '30px' }}>
        <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1 }}>
              <label htmlFor="target" style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '8px' }}>Target Audience</label>
              <select id="target" value={formData.target} onChange={handleInputChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <option value="global">All Users (Broadcast)</option>
                {/* In a real app, you would fetch a list of users or departments here */}
                <option value="user-001">Ashu (user-001)</option>
                <option value="staff-001">Staff (staff-001)</option>
              </select>
            </div>

            <div style={{ flex: 1 }}>
              <label htmlFor="type" style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '8px' }}>Notification Type</label>
              <select id="type" value={formData.type} onChange={handleInputChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <option value="System">System Alert</option>
                <option value="Announcement">Announcement</option>
                <option value="Account">Account Note</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="title" style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '8px' }}>Title</label>
            <input 
              id="title" 
              type="text" 
              placeholder="e.g. Water Supply Interruption" 
              value={formData.title} 
              onChange={handleInputChange} 
              required 
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            />
          </div>

          <div>
            <label htmlFor="message" style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '8px' }}>Message Body</label>
            <textarea 
              id="message" 
              placeholder="Enter the details of the notification..." 
              value={formData.message} 
              onChange={handleInputChange} 
              required 
              style={{ width: '100%', minHeight: '120px', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical' }}
            />
          </div>

          <button type="submit" style={{ background: '#0ea5e9', color: 'white', padding: '15px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginTop: '10px' }}>
            🚀 Send Notification Now
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminNotifications;
