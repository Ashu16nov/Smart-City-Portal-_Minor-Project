import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './Auth.css';

const Profile = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    username: ''
  });
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
      fetchProfile();
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/me');
      setFormData({
        name: res.data.name || '',
        email: res.data.email || '',
        phone: res.data.phone || '',
        username: res.data.username || ''
      });
    } catch (err) {
      console.error("Failed to fetch profile", err);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.patch(`/users/${user.id}`, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      });
      localStorage.setItem('user', JSON.stringify(res.data));
      alert('Profile updated successfully!');
      window.location.reload();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || 'Failed to update profile'));
    }
  };

  return (
    <div className="login-page-wrapper" style={{ minHeight: 'calc(100vh - 80px)' }}>
      <div className="split-container" style={{ width: '750px', maxWidth: '100%', display: 'flex', flexDirection: 'column', minHeight: 'auto' }}>
        
        {/* Profile Header */}
        <div className="left-panel" style={{ position: 'relative', width: '100%', height: '150px', padding: '25px', flex: 'none' }}>
          <h1 style={{ fontSize: '30px', marginBottom: '5px' }}>My Account Profile</h1>
          <p style={{ fontSize: '15px' }}>Manage your civic details and contact information</p>
        </div>

        {/* Profile Form */}
        <div className="right-panels-wrapper" style={{ position: 'relative', width: '100%', height: 'auto', flex: 'none', display: 'flex', justifyContent: 'center', padding: '50px 40px' }}>
          <div className="form-wrapper active" style={{ position: 'relative', padding: '0', boxShadow: 'none' }}>
            <form onSubmit={handleUpdate} style={{ width: '100%', maxWidth: '550px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                
                <div className="input-group" style={{ maxWidth: '100%' }}>
                  <label style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', marginBottom: '6px', textAlign: 'left' }}>Full Name</label>
                  <input type="text" id="name" placeholder="Full Name" value={formData.name} onChange={handleInputChange} />
                </div>

                <div className="input-group" style={{ maxWidth: '100%' }}>
                  <label style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', marginBottom: '6px', textAlign: 'left' }}>Email Address</label>
                  <input type="email" id="email" placeholder="Email Address" value={formData.email} onChange={handleInputChange} />
                </div>

                <div className="input-group" style={{ maxWidth: '100%' }}>
                  <label style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', marginBottom: '6px', textAlign: 'left' }}>Phone Number</label>
                  <input type="tel" id="phone" placeholder="Phone Number" value={formData.phone} onChange={handleInputChange} />
                </div>

                <div className="input-group" style={{ maxWidth: '100%' }}>
                  <label style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', marginBottom: '6px', textAlign: 'left' }}>Username</label>
                  <input type="text" id="username" value={formData.username} disabled style={{ background: '#f1f5f9', cursor: 'not-allowed' }} />
                </div>

              </div>

              <button type="submit" style={{ marginTop: '35px', maxWidth: '550px' }}>Update Profile Identity</button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
