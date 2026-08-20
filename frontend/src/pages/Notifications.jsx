import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast, ToastContainer } from 'react-toastify';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      toast.error('Error updating notification');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All marked as read');
    } catch (err) {
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'Complaint': return '📝';
      case 'Announcement': return '📢';
      case 'Account': return '👤';
      default: return '🔔';
    }
  };

  return (
    <div style={{ padding: '60px 20px', background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div style={{ width: '100%', maxWidth: '700px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ color: '#0f172a', margin: 0 }}>My Notifications</h1>
          <button onClick={markAllAsRead} style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
            ✓ Mark all as read
          </button>
        </div>

        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          {loading ? (
            <p style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading...</p>
          ) : notifications.length > 0 ? (
            notifications.map(n => (
              <div key={n._id} style={{ 
                padding: '20px', 
                borderBottom: '1px solid #f1f5f9', 
                background: n.isRead ? 'white' : '#f0f9ff',
                display: 'flex',
                gap: '15px'
              }}>
                <div style={{ fontSize: '24px', background: '#e0f2fe', width: '50px', height: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '50%' }}>
                  {getIcon(n.type)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <strong style={{ color: n.isRead ? '#334155' : '#0ea5e9' }}>{n.title}</strong>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>{new Date(n.createdAt).toLocaleString()}</span>
                  </div>
                  <p style={{ margin: '0 0 10px 0', color: '#475569', fontSize: '14px', lineHeight: '1.4' }}>{n.message}</p>
                  
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {!n.isRead && (
                      <button onClick={() => markAsRead(n._id)} style={{ background: 'transparent', border: 'none', color: '#0ea5e9', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}>Mark as Read</button>
                    )}
                    <button onClick={() => deleteNotification(n._id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}>Delete</button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>📭</div>
              <p>You have no notifications.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
