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
    <div style={{ minHeight: '100vh', padding: '60px 20px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
      <div className="form-container" style={{ margin: 0, width: '100%', maxWidth: '850px' }}>
        <ToastContainer />
        <div className="form-header">
          <h2>Log an Issue</h2>
          <p>Submit your infrastructure or service requests directly to the Smart City Authority.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3 className="section-title">📍 Geographical Metrics</h3>
            <div className="form-grid">
              <div className="form-group">
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
              <div className="form-group">
                <label htmlFor="ward">Sector / Ward <span style={{ color: 'red' }}>*</span></label>
                <select id="ward" value={formData.ward} onChange={handleInputChange} required>
                  <option value="" disabled>Select Sector</option>
                  {[...Array(15)].map((_, i) => (
                    <option key={i + 1} value={`Sector ${i + 1}`}>Sector {i + 1}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
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

          <div className="form-section">
            <h3 className="section-title">⚠️ Incident Details</h3>
            <div className="form-group">
              <label htmlFor="category">Service Category <span style={{ color: 'red' }}>*</span></label>
              <select id="category" value={formData.category} onChange={handleInputChange} required>
                <option value="" disabled>Select Category</option>
                <option value="Waste Management">♻️ Waste Management</option>
                <option value="Sanitation & Drainage">💧 Sanitation & Drainage</option>
                <option value="Infrastructure Maintenance">🛣️ Infrastructure Maintenance</option>
                <option value="Water Supply">🚰 Water Supply Operations</option>
                <option value="Lighting & Energy">💡 Lighting & Energy Systems</option>
                <option value="Public Safety">🛡️ Public Safety</option>
                <option value="Others">❓ Other</option>
              </select>
            </div>
            <div className="form-group">
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
            <div className="form-group">
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

          <div className="form-section">
            <h3 className="section-title">📸 Supporting Media</h3>
            <div className="form-group">
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
            <button type="submit" className="submit-btn" disabled={loading} style={{ width: '100%', maxWidth: 'none', marginTop: '20px' }}>
              {loading ? "Processing Request..." : "Submit Incident Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterComplaint;
