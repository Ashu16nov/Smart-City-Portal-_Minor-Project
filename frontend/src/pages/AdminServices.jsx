import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../utils/api';

const CATEGORIES = [
  'Water Supply', 'Electricity', 'Waste Management', 'Public Transport',
  'Hospitals', 'Schools/Colleges', 'Government Offices', 'Banks/ATMs',
  'Police Stations', 'Fire Stations', 'Parks', 'Libraries',
  'Public Toilets', 'Parking', 'Community Centers'
];

const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    category: CATEGORIES[0],
    description: '',
    location: '',
    contactNumber: '',
    workingHours: ''
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await api.get('/services');
      setServices(res.data);
    } catch (err) {
      toast.error('Failed to load services.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setIsEditing(false);
    setFormData({ name: '', category: CATEGORIES[0], description: '', location: '', contactNumber: '', workingHours: '' });
    setShowModal(true);
  };

  const openEditModal = (service) => {
    setIsEditing(true);
    setCurrentId(service._id);
    setFormData({
      name: service.name,
      category: service.category,
      description: service.description || '',
      location: service.location,
      contactNumber: service.contactNumber || '',
      workingHours: service.workingHours || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/services/${currentId}`, formData);
        toast.success('Service updated successfully');
      } else {
        await api.post('/services', formData);
        toast.success('Service created successfully');
      }
      setShowModal(false);
      fetchServices();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      await api.delete(`/services/${id}`);
      toast.success('Service deleted');
      fetchServices();
    } catch (err) {
      toast.error('Failed to delete service');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '40px' }}>
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', margin: 0 }}>Public Services Management</h1>
            <p style={{ color: '#64748b', marginTop: '5px' }}>Add, update, or remove city services from the directory.</p>
          </div>
          <button 
            onClick={openAddModal}
            style={{ background: '#0ea5e9', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 10px rgba(14,165,233,0.3)' }}
          >
            + Add New Service
          </button>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <tr>
                  <th style={{ padding: '15px 20px', color: '#64748b', fontSize: '13px', textTransform: 'uppercase' }}>Service Name</th>
                  <th style={{ padding: '15px 20px', color: '#64748b', fontSize: '13px', textTransform: 'uppercase' }}>Category</th>
                  <th style={{ padding: '15px 20px', color: '#64748b', fontSize: '13px', textTransform: 'uppercase' }}>Location</th>
                  <th style={{ padding: '15px 20px', color: '#64748b', fontSize: '13px', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map(srv => (
                  <tr key={srv._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '15px 20px', fontWeight: '700', color: '#1e293b' }}>
                      {srv.name}
                      <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 'normal', marginTop: '4px' }}>{srv.contactNumber || 'No contact'}</div>
                    </td>
                    <td style={{ padding: '15px 20px' }}>
                      <span style={{ background: '#f0f9ff', color: '#0284c7', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>{srv.category}</span>
                    </td>
                    <td style={{ padding: '15px 20px', color: '#475569', fontSize: '13px' }}>{srv.location}</td>
                    <td style={{ padding: '15px 20px', textAlign: 'right' }}>
                      <button onClick={() => openEditModal(srv)} style={{ background: '#fef3c7', color: '#d97706', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '12px', marginRight: '10px' }}>Edit</button>
                      <button onClick={() => handleDelete(srv._id)} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}>Delete</button>
                    </td>
                  </tr>
                ))}
                {services.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No services available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'white', width: '100%', maxWidth: '600px', borderRadius: '20px', padding: '30px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>{isEditing ? 'Edit Service' : 'Add New Service'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '5px' }}>Service Name *</label>
                  <input name="name" value={formData.name} onChange={handleInputChange} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '5px' }}>Category *</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '5px' }}>Precise Location / Address *</label>
                <input name="location" value={formData.location} onChange={handleInputChange} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '5px' }}>Contact Number</label>
                  <input name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '5px' }}>Working Hours</label>
                  <input name="workingHours" value={formData.workingHours} onChange={handleInputChange} placeholder="e.g. 9 AM - 5 PM" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '5px' }}>Description</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'none' }} />
              </div>

              <button type="submit" style={{ background: '#0ea5e9', color: 'white', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', marginTop: '10px' }}>
                {isEditing ? 'Update Service' : 'Save Service'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServices;
