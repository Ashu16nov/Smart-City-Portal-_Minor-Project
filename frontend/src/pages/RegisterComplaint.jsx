import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const RegisterComplaint = () => {
  const [formData, setFormData] = useState({
    district: '',
    ward: '',
    location: '',
    title: '',
    description: '',
    category: ''
  });
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      toast.error("Authentication required to access the reporting module.");
      navigate('/login');
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        district: formData.district,
        ward: formData.ward,
        location: formData.location,
        image: image
      };

      const response = await api.post('/complaints/create', payload);
      const newId = response.data.complaintId;

      toast.success(`Request logged successfully! Reference ID: ${newId}`, {
        position: "top-center",
        autoClose: 2000,
        onClose: () => navigate('/complaints')
      });

      // Clear form
      setFormData({ district: '', ward: '', location: '', title: '', description: '', category: '' });
      setImage('');
    } catch (err) {
      toast.error('Error: ' + (err.response?.data?.error || 'Failed to submit request'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-wrapper" style={{ minHeight: '100vh', background: '#e0f7fa', position: 'relative' }}>
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* HEADER SECTION */}
      <div style={{ padding: '60px 60px 40px 60px', textAlign: 'center', background: '#b2ebf2', borderBottom: '1px solid #80deea', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#006064', margin: '0 0 15px 0' }}>Log an Issue</h1>
        <p style={{ fontSize: '16px', color: '#00838f', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
          Submit your infrastructure or service requests directly to the Smart City Authority.
        </p>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', paddingBottom: '60px' }}>

        <form onSubmit={handleSubmit}>
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '16px', margin: '25px 0 15px', padding: '20px 25px' }}>
            <h3 style={{ color: '#166534', borderBottom: '2px dashed #bbf7d0', paddingBottom: '10px', marginBottom: '15px', fontSize: '18px', fontWeight: '800' }}>📍 Geographical Metrics</h3>
            <div className="form-grid" style={{ gap: '15px' }}>
              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label htmlFor="district">Administrative Zone <span style={{ color: 'red' }}>*</span></label>
                <select id="district" value={formData.district} onChange={handleInputChange} required>
                  <option value="" disabled>Select Zone</option>
                  <option value="North Zone">North Zone</option>
                  <option value="South Zone">South Zone</option>
                  <option value="East Zone">East Zone</option>
                  <option value="West Zone">West Zone</option>
                  <option value="Central District">Central District</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label htmlFor="ward">Sector / Ward <span style={{ color: 'red' }}>*</span></label>
                <select id="ward" value={formData.ward} onChange={handleInputChange} required>
                  <option value="" disabled>Select Sector</option>
                  {[...Array(15)].map((_, i) => (
                    <option key={i + 1} value={`Sector ${i + 1}`}>Sector {i + 1}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: '5px' }}>
              <label htmlFor="location">Precise Location <span style={{ color: 'red' }}>*</span></label>
              <input 
                type="text" 
                id="location" 
                placeholder="e.g. Near Tech Park, Avenue 4" 
                value={formData.location} 
                onChange={handleInputChange} 
                required 
              />
            </div>
          </div>

          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '16px', margin: '0 0 15px', padding: '20px 25px' }}>
            <h3 style={{ color: '#b45309', borderBottom: '2px dashed #fde68a', paddingBottom: '10px', marginBottom: '15px', fontSize: '18px', fontWeight: '800' }}>⚠️ Incident Details</h3>
            <div className="form-grid" style={{ gap: '15px' }}>
              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label htmlFor="category">Service Category <span style={{ color: 'red' }}>*</span></label>
                <select id="category" value={formData.category} onChange={handleInputChange} required>
                  <option value="" disabled>Select Category</option>
                  <option value="Road & Potholes">🛣️ Road & Potholes</option>
                  <option value="Street Lights">💡 Street Lights</option>
                  <option value="Garbage/Waste">🗑️ Garbage/Waste</option>
                  <option value="Water Supply">🚰 Water Supply</option>
                  <option value="Drainage">💧 Drainage</option>
                  <option value="Electricity">⚡ Electricity</option>
                  <option value="Traffic">🚦 Traffic</option>
                  <option value="Public Safety">🛡️ Public Safety</option>
                  <option value="Parks">🏞️ Parks</option>
                  <option value="Sewage">🚾 Sewage</option>
                  <option value="Other">❓ Other</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label htmlFor="title">Incident Title <span style={{ color: 'red' }}>*</span></label>
                <input 
                  type="text" 
                  id="title" 
                  placeholder="Brief summary of the issue..." 
                  value={formData.title} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: '5px' }}>
              <label htmlFor="description">Comprehensive Description <span style={{ color: 'red' }}>*</span></label>
              <textarea 
                id="description" 
                placeholder="Provide detailed information regarding the incident..." 
                value={formData.description} 
                onChange={handleInputChange} 
                rows="5"
                required 
              />
            </div>
          </div>

          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '16px', margin: '0 0 15px', padding: '20px 25px' }}>
            <h3 style={{ color: '#1e3a8a', borderBottom: '2px dashed #bfdbfe', paddingBottom: '10px', marginBottom: '15px', fontSize: '18px', fontWeight: '800' }}>📸 Supporting Media</h3>
            <div className="form-group" style={{ marginBottom: '5px' }}>
              <div className="upload-container" style={{ background: 'var(--bg-main)', border: '2px dashed var(--border-color)', borderRadius: '12px', padding: '15px' }}>
                <label htmlFor="images" className="custom-file-upload" style={{ background: 'var(--primary)', border: 'none' }}>
                  <span>Upload Image</span>
                </label>
                <input type="file" id="images" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                <div id="file-chosen" style={{ color: 'var(--text-secondary)', marginLeft: '10px', fontSize: '14px' }}>
                  {image ? "Media successfully attached." : "No file chosen"}
                </div>
              </div>
            </div>
          </div>

          <div style={{ padding: '0 40px 40px' }}>
            <button type="submit" className="submit-btn" disabled={loading} style={{ width: '100%', maxWidth: '300px', margin: '40px auto 0', display: 'block' }}>
              {loading ? "Processing Request..." : "Submit Incident Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterComplaint;
