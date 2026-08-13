import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './Auth.css';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('info');
  const [user, setUser] = useState(null);
  
  // Forms state
  const [profileData, setProfileData] = useState({
    name: '', email: '', phone: '', address: '', city: '', profilePhoto: ''
  });
  const [securityData, setSecurityData] = useState({ oldPassword: '', newPassword: '' });
  const [preferences, setPreferences] = useState({ email: true, sms: true });
  
  // Data fetching
  const [complaints, setComplaints] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser) {
      navigate('/login');
    } else {
      setUser(storedUser);
      fetchProfile();
      fetchComplaints(storedUser.id);
    }
  }, [navigate]);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/me');
      setProfileData({
        name: res.data.name || '',
        email: res.data.email || '',
        phone: res.data.phone || '',
        address: res.data.address || '',
        city: res.data.city || '',
        profilePhoto: res.data.profilePhoto || ''
      });
      setPreferences({
        email: res.data.notifications?.email ?? true,
        sms: res.data.notifications?.sms ?? true
      });
    } catch (err) {
      console.error("Failed to fetch profile", err);
    }
  };

  const fetchComplaints = async (userId) => {
    try {
      const res = await api.get(`/complaints/user/${userId}`);
      setComplaints(res.data);
    } catch (err) {
      console.error("Failed to fetch complaints");
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.patch(`/users/${user.id}/profile`, {
        ...profileData,
        notifications: preferences
      });
      localStorage.setItem('user', JSON.stringify(res.data));
      alert('Profile updated successfully!');
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || 'Failed to update profile'));
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/users/${user.id}/password`, securityData);
      alert('Password changed successfully!');
      setSecurityData({ oldPassword: '', newPassword: '' });
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || 'Failed to change password'));
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({ ...profileData, profilePhoto: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div style={{ background: 'var(--bg-main)', minHeight: 'calc(100vh - 80px)', display: 'flex', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ width: '100%', maxWidth: '1000px', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        
        {/* SIDEBAR MENU */}
        <div style={{ background: 'var(--bg-secondary)', width: '250px', borderRadius: '12px', padding: '20px', border: '1px solid var(--border-color)' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary)', margin: '0 auto 10px', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
              {profileData.profilePhoto ? (
                <img src={profileData.profilePhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '30px', color: '#fff' }}>👤</span>
              )}
            </div>
            <h3 style={{ margin: '0', color: 'var(--text-primary)', fontSize: '18px' }}>{profileData.name}</h3>
            <p style={{ margin: '5px 0 0', color: 'var(--text-secondary)', fontSize: '13px' }}>Citizen Account</p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {['info', 'security', 'preferences', 'activity'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: activeTab === tab ? 'var(--primary)' : 'transparent',
                  color: activeTab === tab ? '#fff' : 'var(--text-primary)',
                  border: 'none',
                  padding: '12px 15px',
                  borderRadius: '8px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontWeight: '500',
                  textTransform: 'capitalize'
                }}
              >
                {tab.replace('info', 'Profile Info').replace('security', 'Security').replace('preferences', 'Preferences').replace('activity', 'Activity History')}
              </button>
            ))}
            <button 
              onClick={logout}
              style={{ background: 'transparent', color: '#ef4444', border: 'none', padding: '12px 15px', borderRadius: '8px', textAlign: 'left', cursor: 'pointer', fontWeight: '500', marginTop: '20px' }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div style={{ flex: 1, background: 'var(--bg-secondary)', borderRadius: '12px', padding: '30px', border: '1px solid var(--border-color)', minHeight: '500px' }}>
          
          {activeTab === 'info' && (
            <div>
              <h2 style={{ marginBottom: '20px', color: 'var(--text-primary)' }}>Profile Information</h2>
              <form onSubmit={handleProfileUpdate} className="profile-form">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div className="input-group">
                    <label>Full Name</label>
                    <input type="text" value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} style={{ background: 'var(--bg-main)' }}/>
                  </div>
                  <div className="input-group">
                    <label>Email Address</label>
                    <input type="email" value={profileData.email} onChange={(e) => setProfileData({...profileData, email: e.target.value})} style={{ background: 'var(--bg-main)' }}/>
                  </div>
                  <div className="input-group">
                    <label>Phone Number</label>
                    <input type="tel" value={profileData.phone} onChange={(e) => setProfileData({...profileData, phone: e.target.value})} style={{ background: 'var(--bg-main)' }}/>
                  </div>
                  <div className="input-group">
                    <label>City / Zone</label>
                    <input type="text" value={profileData.city} onChange={(e) => setProfileData({...profileData, city: e.target.value})} style={{ background: 'var(--bg-main)' }} placeholder="e.g. North Zone"/>
                  </div>
                  <div className="input-group" style={{ gridColumn: 'span 2' }}>
                    <label>Residential Address</label>
                    <input type="text" value={profileData.address} onChange={(e) => setProfileData({...profileData, address: e.target.value})} style={{ background: 'var(--bg-main)' }} placeholder="Full street address"/>
                  </div>
                  <div className="input-group" style={{ gridColumn: 'span 2' }}>
                    <label>Update Profile Photo</label>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="profile-file-upload" />
                  </div>
                </div>
                <button type="submit" style={{ background: 'var(--primary)', color: '#fff', padding: '12px 24px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Save Changes</button>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              <h2 style={{ marginBottom: '20px', color: 'var(--text-primary)' }}>Account Security</h2>
              <form onSubmit={handlePasswordChange} className="profile-form" style={{ maxWidth: '400px' }}>
                <div className="input-group" style={{ marginBottom: '15px' }}>
                  <label>Current Password</label>
                  <input type="password" required value={securityData.oldPassword} onChange={(e) => setSecurityData({...securityData, oldPassword: e.target.value})} style={{ background: 'var(--bg-main)' }}/>
                </div>
                <div className="input-group" style={{ marginBottom: '20px' }}>
                  <label>New Password</label>
                  <input type="password" required value={securityData.newPassword} onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})} style={{ background: 'var(--bg-main)' }}/>
                </div>
                <button type="submit" style={{ background: 'var(--primary)', color: '#fff', padding: '12px 24px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Change Password</button>
              </form>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div>
              <h2 style={{ marginBottom: '20px', color: 'var(--text-primary)' }}>Notification Preferences</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={preferences.email} onChange={(e) => setPreferences({...preferences, email: e.target.checked})} style={{ width: '20px', height: '20px' }} />
                  Receive Email Notifications for complaint updates
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={preferences.sms} onChange={(e) => setPreferences({...preferences, sms: e.target.checked})} style={{ width: '20px', height: '20px' }} />
                  Receive SMS Alerts for emergencies
                </label>
                <button onClick={handleProfileUpdate} style={{ marginTop: '20px', alignSelf: 'flex-start', background: 'var(--primary)', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Save Preferences</button>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div>
              <h2 style={{ marginBottom: '20px', color: 'var(--text-primary)' }}>Activity History</h2>
              {complaints.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>You have not registered any complaints yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {complaints.map(comp => (
                    <div key={comp._id} style={{ background: 'var(--bg-main)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>{comp.title}</h4>
                        <span style={{ 
                          background: comp.status === 'Resolved' ? '#10b981' : comp.status === 'In Progress' ? '#f59e0b' : '#ef4444', 
                          color: '#fff', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' 
                        }}>
                          {comp.status}
                        </span>
                      </div>
                      <p style={{ margin: '0 0 10px', color: 'var(--text-secondary)', fontSize: '14px' }}>{comp.category} • {comp.district}</p>
                      <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>Submitted: {new Date(comp.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Profile;
