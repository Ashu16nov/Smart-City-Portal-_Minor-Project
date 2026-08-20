import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import './Auth.css'; // Reuse some basic form styling if needed, but we'll use inline/custom classes

const Emergency = () => {
  const [contacts, setContacts] = useState([]);
  const [reportData, setReportData] = useState({ emergencyType: '', location: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const res = await api.get('/emergency/contacts');
      setContacts(res.data);
    } catch (err) {
      console.error('Failed to fetch emergency contacts', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReportChange = (e) => {
    setReportData({ ...reportData, [e.target.name]: e.target.value });
  };

  const submitReport = async (e) => {
    e.preventDefault();
    try {
      await api.post('/emergency/reports', reportData);
      setMessage('Emergency report submitted successfully. Help is on the way.');
      setReportData({ emergencyType: '', location: '', description: '' });
      setTimeout(() => setMessage(''), 5000);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to submit report. Please try again or call directly.');
    }
  };

  return (
    <div className="page-layout">
      
      <div className="main-content" style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ color: '#ef4444', textAlign: 'center', marginBottom: '10px' }}>Emergency Services</h1>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '40px' }}>
          Quick access to emergency contacts and reporting tools.
        </p>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '20px', 
          marginBottom: '60px',
          alignItems: 'stretch'
        }}>
          {/* Report Emergency Form (Placed at Top Right) */}
          <div style={{ 
            gridColumn: '3 / 5', 
            gridRow: '1 / 3', 
            background: '#fff', 
            padding: '30px', 
            borderRadius: '12px', 
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', 
            borderTop: '4px solid #ef4444',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <h2 style={{ marginBottom: '20px', color: '#1e293b' }}>Report an Emergency</h2>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>If you cannot call, submit an urgent report here. Our dispatchers will receive it immediately.</p>
            
            {message && (
              <div style={{ padding: '12px', background: message.includes('success') ? '#dcfce7' : '#fee2e2', color: message.includes('success') ? '#166534' : '#991b1b', borderRadius: '6px', marginBottom: '20px', fontSize: '14px' }}>
                {message}
              </div>
            )}

            <form onSubmit={submitReport} style={{ display: 'flex', flexDirection: 'column', gap: '15px', flexGrow: 1 }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#334155' }}>Emergency Type</label>
                <select 
                  name="emergencyType" 
                  value={reportData.emergencyType} 
                  onChange={handleReportChange}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                >
                  <option value="">-- Select Type --</option>
                  <option value="Police">Police</option>
                  <option value="Fire Brigade">Fire Brigade</option>
                  <option value="Ambulance">Ambulance</option>
                  <option value="Disaster Management">Disaster Management</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#334155' }}>Location (Address or Landmark)</label>
                <input 
                  type="text" 
                  name="location" 
                  placeholder="Where is the emergency?"
                  value={reportData.location} 
                  onChange={handleReportChange}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#334155' }}>Description</label>
                <textarea 
                  name="description" 
                  placeholder="Describe the situation briefly..."
                  value={reportData.description} 
                  onChange={handleReportChange}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', resize: 'none', flexGrow: 1 }}
                />
              </div>

              <button 
                type="submit" 
                style={{ 
                  background: '#ef4444', 
                  color: 'white', 
                  padding: '12px', 
                  border: 'none', 
                  borderRadius: '6px', 
                  fontWeight: 'bold', 
                  fontSize: '16px',
                  cursor: 'pointer',
                  marginTop: 'auto'
                }}
              >
                Submit Urgent Report
              </button>
            </form>
          </div>

          {/* Emergency Contacts Flowing Around */}
          {loading ? (
            <div style={{ gridColumn: '1 / -1' }}><p>Loading emergency contacts...</p></div>
          ) : contacts.length === 0 ? (
            <div style={{ gridColumn: '1 / -1' }}><p>No active emergency contacts available at this time.</p></div>
          ) : (
            contacts.map(contact => (
              <div key={contact._id} style={{ 
                background: '#fff', 
                border: '1px solid #fee2e2', 
                borderRadius: '12px', 
                padding: '20px', 
                boxShadow: '0 4px 6px rgba(239, 68, 68, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <h3 style={{ color: '#b91c1c', margin: '0 0 5px 0', fontSize: '18px' }}>{contact.title}</h3>
                  <span style={{ display: 'inline-block', background: '#fef2f2', color: '#dc2626', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', marginBottom: '10px' }}>{contact.category}</span>
                  <p style={{ fontSize: '13px', color: '#475569', marginBottom: '5px' }}><strong>Location:</strong> {contact.location || 'N/A'}</p>
                  <p style={{ fontSize: '13px', color: '#475569', marginBottom: '15px' }}>{contact.instructions}</p>
                </div>
                <a 
                  href={`tel:${contact.contactNumber}`} 
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    background: '#ef4444',
                    color: 'white',
                    textDecoration: 'none',
                    padding: '10px',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    transition: 'background 0.3s'
                  }}
                  onMouseOver={e => e.target.style.background = '#dc2626'}
                  onMouseOut={e => e.target.style.background = '#ef4444'}
                >
                  📞 Call {contact.contactNumber}
                </a>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Emergency;
