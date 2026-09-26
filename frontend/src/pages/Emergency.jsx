import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import './Auth.css';

const Emergency = () => {
  const [contacts, setContacts] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [reportData, setReportData] = useState({ emergencyType: '', location: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sosStatus, setSosStatus] = useState({ loading: false, success: false, error: '' });

  useEffect(() => {
    fetchContacts();
    fetchLiveAlerts();
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

  const fetchLiveAlerts = async () => {
    try {
      const res = await api.get('/emergency/alerts');
      setAlerts(res.data);
    } catch (err) {
      console.error('Failed to fetch live alerts', err);
    }
  };

  const handleTriggerSOS = () => {
    setSosStatus({ loading: true, success: false, error: '' });
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await api.post('/emergency/sos', {
              latitude,
              longitude,
              sector: 'Mohali Geo-Location Triggered',
              details: '🚨 CRITICAL 1-CLICK SOS: Citizen transmitted high-precision GPS coordinates from mobile browser to Mohali PCR Command Center.'
            });
            setSosStatus({ loading: false, success: true, error: '' });
            setMessage(res.data.message || '🚨 Emergency SOS dispatched! Mohali PCR 112 notified.');
            setTimeout(() => setSosStatus({ loading: false, success: false, error: '' }), 8000);
          } catch (err) {
            setSosStatus({ loading: false, success: false, error: 'Failed to send SOS request.' });
          }
        },
        async (err) => {
          // Fallback if geolocation permission is denied
          try {
            const res = await api.post('/emergency/sos', {
              sector: 'Mohali Emergency SOS Area',
              details: '🚨 CRITICAL 1-CLICK SOS: Rapid distress alert triggered without GPS access.'
            });
            setSosStatus({ loading: false, success: true, error: '' });
            setMessage(res.data.message || '🚨 Emergency SOS dispatched! Mohali PCR 112 notified.');
          } catch (e) {
            setSosStatus({ loading: false, success: false, error: 'Could not connect to emergency dispatch.' });
          }
        },
        { enableHighAccuracy: true, timeout: 7000 }
      );
    } else {
      setSosStatus({ loading: false, success: false, error: 'Geolocation not supported by browser.' });
    }
  };

  const handleReportChange = (e) => {
    setReportData({ ...reportData, [e.target.name]: e.target.value });
  };

  const submitReport = async (e) => {
    e.preventDefault();
    try {
      await api.post('/emergency/reports', reportData);
      setMessage('Emergency report submitted successfully. Dispatchers notified.');
      setReportData({ emergencyType: '', location: '', description: '' });
      setTimeout(() => setMessage(''), 5000);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to submit report. Please try again or call directly.');
    }
  };

  return (
    <div className="page-layout">
      <div className="main-content" style={{ padding: '30px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Live Municipal Disaster Broadcast Ticker */}
        {alerts.length > 0 && (
          <div style={{
            background: 'linear-gradient(90deg, #991b1b, #dc2626)',
            color: 'white',
            borderRadius: '12px',
            padding: '14px 20px',
            marginBottom: '30px',
            boxShadow: '0 8px 16px rgba(220, 38, 38, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '15px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
              <span style={{
                background: '#fff',
                color: '#dc2626',
                padding: '4px 10px',
                borderRadius: '20px',
                fontWeight: '900',
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                whiteSpace: 'nowrap'
              }}>
                LIVE MUNICIPAL TICKER
              </span>
              <marquee scrollamount="6" style={{ fontSize: '14px', fontWeight: '500' }}>
                {alerts.map(alt => `${alt.title} — ${alt.message}`).join(' | ')}
              </marquee>
            </div>
            <a href="tel:01722270068" style={{ color: 'white', background: 'rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', textDecoration: 'none', whiteSpace: 'nowrap', fontWeight: 'bold' }}>
              📞 Control Room: 0172-2270068
            </a>
          </div>
        )}

        {/* 1-Click SOS Hero Broadcast Card */}
        <div style={{
          background: 'linear-gradient(135deg, #1e1b4b, #311b92)',
          color: 'white',
          borderRadius: '16px',
          padding: '30px',
          marginBottom: '40px',
          boxShadow: '0 12px 24px rgba(49, 27, 146, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div style={{ maxWidth: '650px' }}>
            <div style={{ display: 'inline-block', background: '#ef4444', color: 'white', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', marginBottom: '10px' }}>
              SAS NAGAR MOHALI POLICE & MUNICIPAL SOS
            </div>
            <h2 style={{ fontSize: '26px', margin: '0 0 10px 0' }}>🚨 1-Click Emergency SOS Broadcast</h2>
            <p style={{ fontSize: '14px', color: '#c7d2fe', margin: 0, lineHeight: '1.5' }}>
              In an extreme emergency, tap the button to automatically send your live GPS coordinates to the <strong>Mohali PCR Control Room (112)</strong> and active duty municipal emergency officers.
            </p>
          </div>

          <button
            onClick={handleTriggerSOS}
            disabled={sosStatus.loading}
            style={{
              background: sosStatus.loading ? '#94a3b8' : 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: 'white',
              border: '4px solid rgba(255,255,255,0.3)',
              borderRadius: '50px',
              padding: '16px 32px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: sosStatus.loading ? 'wait' : 'pointer',
              boxShadow: '0 10px 20px rgba(239, 68, 68, 0.5)',
              transition: 'transform 0.2s, background 0.3s',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
            onMouseOver={e => !sosStatus.loading && (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseOut={e => !sosStatus.loading && (e.currentTarget.style.transform = 'scale(1)')}
          >
            {sosStatus.loading ? '📡 Locating & Transmitting...' : '🔴 DISPATCH 1-CLICK SOS'}
          </button>
        </div>

        {sosStatus.success && (
          <div style={{ padding: '16px', background: '#dcfce7', color: '#14532d', borderRadius: '8px', marginBottom: '30px', fontWeight: 'bold', fontSize: '15px', borderLeft: '5px solid #22c55e' }}>
            {message || '🚨 SOS Alert Successfully Sent to Mohali PCR Dispatchers (112)! Response team deployed.'}
          </div>
        )}

        <h1 style={{ color: '#ef4444', textAlign: 'center', marginBottom: '10px' }}>Emergency Contacts & Reporting</h1>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '40px' }}>
          Official emergency hotlines and rapid incident reporting for SAS Nagar, Mohali.
        </p>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '20px', 
          marginBottom: '60px',
          alignItems: 'stretch'
        }}>
          {/* Report Emergency Form */}
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
            <h2 style={{ marginBottom: '15px', color: '#1e293b' }}>Report an Emergency</h2>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>If you cannot call, submit an urgent report here. Our dispatchers will receive it immediately.</p>
            
            {message && !sosStatus.success && (
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
                  <option value="Police">Mohali Police (PCR 112)</option>
                  <option value="Fire Brigade">Fire Station (Phase 1)</option>
                  <option value="Ambulance">Civil / Fortis Hospital Ambulance</option>
                  <option value="Disaster Management">Water-Logging & Disaster Team</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#334155' }}>Location / Sector</label>
                <input 
                  type="text" 
                  name="location" 
                  placeholder="e.g. Phase 3B2 Market / Sector 70..."
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
                Submit Incident Report
              </button>
            </form>
          </div>

          {/* Emergency Contacts */}
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

