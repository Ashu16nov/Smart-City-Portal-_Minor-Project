import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CATEGORIES = ['RWA Notice', 'Maintenance', 'Power/Water Interruption', 'Events', 'Security Alert', 'Other'];

const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'RWA Notice',
    isImportant: false,
    status: 'Published'
  });
  
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/announcements');
      setAnnouncements(res.data);
    } catch (err) {
      toast.error('Failed to load announcements.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/announcements/${editingId}`, formData);
        toast.success('Announcement updated successfully!');
      } else {
        await api.post('/announcements', formData);
        toast.success('Announcement created successfully!');
      }
      setFormData({ title: '', description: '', category: 'RWA Notice', isImportant: false, status: 'Published' });
      setEditingId(null);
      fetchAnnouncements();
    } catch (error) {
      toast.error('Operation failed.');
    }
  };

  const handleEdit = (ann) => {
    setEditingId(ann._id);
    setFormData({
      title: ann.title,
      description: ann.description,
      category: ann.category,
      isImportant: ann.isImportant,
      status: ann.status
    });
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await api.delete(`/announcements/${id}`);
        toast.success('Announcement deleted.');
        fetchAnnouncements();
      } catch (error) {
        toast.error('Failed to delete.');
      }
    }
  };

  const togglePin = async (id) => {
    try {
      await api.patch(`/announcements/${id}/toggle-importance`);
      toast.success('Importance toggled.');
      fetchAnnouncements();
    } catch (error) {
      toast.error('Failed to toggle.');
    }
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#0f172a', margin: 0 }}>Manage Announcements</h1>
      </div>

      {/* Form */}
      <div style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '40px', border: '1px solid #e2e8f0' }}>
        <h2 style={{ marginTop: 0, color: '#334155', fontSize: '20px', marginBottom: '20px' }}>
          {editingId ? 'Edit Announcement' : 'Create New Announcement'}
        </h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>Title *</label>
            <input 
              type="text" 
              name="title" 
              value={formData.title} 
              onChange={handleInputChange} 
              required 
              placeholder="e.g. Scheduled Power Outage"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>Description *</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleInputChange} 
              required 
              rows="4"
              placeholder="Provide full details..."
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>Category</label>
              <select 
                name="category" 
                value={formData.category} 
                onChange={handleInputChange} 
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
              >
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>Status</label>
              <select 
                name="status" 
                value={formData.status} 
                onChange={handleInputChange} 
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
              >
                <option value="Published">Published (Visible to all)</option>
                <option value="Unpublished">Unpublished (Hidden)</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
            <input 
              type="checkbox" 
              id="isImportant" 
              name="isImportant" 
              checked={formData.isImportant} 
              onChange={handleInputChange} 
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="isImportant" style={{ fontWeight: '600', color: '#ef4444', cursor: 'pointer' }}>
              📌 Mark as Important (Pins to top)
            </label>
          </div>

          <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
            <button type="submit" style={{ background: '#0ea5e9', color: 'white', padding: '12px 24px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}>
              {editingId ? 'Update Announcement' : 'Publish Announcement'}
            </button>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setFormData({ title: '', description: '', category: 'RWA Notice', isImportant: false, status: 'Published' }); }} style={{ background: '#f1f5f9', color: '#475569', padding: '12px 24px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      {/* List */}
      <div>
        <h2 style={{ color: '#334155', fontSize: '20px', marginBottom: '20px' }}>Existing Announcements</h2>
        {loading ? <p>Loading...</p> : announcements.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>No announcements found.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {announcements.map(ann => (
              <div key={ann._id} style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{ann.category}</span>
                    <span style={{ fontSize: '12px', color: ann.status === 'Published' ? '#16a34a' : '#ea580c', fontWeight: 'bold' }}>• {ann.status}</span>
                    {ann.isImportant && <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: 'bold' }}>📌 Pinned</span>}
                  </div>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#0f172a' }}>{ann.title}</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>{new Date(ann.publishDate).toLocaleString()}</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => togglePin(ann._id)} style={{ padding: '8px 12px', background: ann.isImportant ? '#fef2f2' : '#f8fafc', color: ann.isImportant ? '#ef4444' : '#64748b', border: '1px solid', borderColor: ann.isImportant ? '#fecaca' : '#cbd5e1', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
                    {ann.isImportant ? 'Unpin' : 'Pin'}
                  </button>
                  <button onClick={() => handleEdit(ann)} style={{ padding: '8px 12px', background: '#e0f2fe', color: '#0284c7', border: '1px solid #bae6fd', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(ann._id)} style={{ padding: '8px 12px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAnnouncements;
