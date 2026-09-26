import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={{ background: '#0f172a', color: '#94a3b8', padding: '60px 40px 30px', marginTop: '80px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat( auto-fit, minmax(240px, 1fr) )', gap: '40px', marginBottom: '40px' }}>
        
        {/* Col 1: Portal Brand Info */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontSize: '18px' }}>🏛️</div>
            <h3 style={{ margin: 0, color: 'white', fontSize: '20px', fontWeight: '800' }}>Mohali Smart City Portal</h3>
          </div>
          <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#94a3b8' }}>
            Official digital civic governance platform for Sahibzada Ajit Singh Nagar (Mohali, Punjab). Empowering citizens with real-time issue tracking, emergency response, and smart environmental telemetry.
          </p>
        </div>

        {/* Col 2: Quick Links */}
        <div>
          <h4 style={{ color: 'white', fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Quick Navigation</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
            <Link to="/" style={{ color: '#94a3b8', textDecoration: 'none', transition: '0.2s' }} onMouseOver={e => e.target.style.color='#0ea5e9'} onMouseOut={e => e.target.style.color='#94a3b8'}>🏠 Home Portal</Link>
            <Link to="/services" style={{ color: '#94a3b8', textDecoration: 'none', transition: '0.2s' }} onMouseOver={e => e.target.style.color='#0ea5e9'} onMouseOut={e => e.target.style.color='#94a3b8'}>🏛️ Mohali Public Services</Link>
            <Link to="/announcements" style={{ color: '#94a3b8', textDecoration: 'none', transition: '0.2s' }} onMouseOver={e => e.target.style.color='#0ea5e9'} onMouseOut={e => e.target.style.color='#94a3b8'}>📢 MC Mohali Notice Board</Link>
            <Link to="/register" style={{ color: '#94a3b8', textDecoration: 'none', transition: '0.2s' }} onMouseOver={e => e.target.style.color='#0ea5e9'} onMouseOut={e => e.target.style.color='#94a3b8'}>📝 Report Civic Issue</Link>
          </div>
        </div>

        {/* Col 3: Smart Modules Links */}
        <div>
          <h4 style={{ color: 'white', fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Smart City Modules</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
            <Link to="/aqi" style={{ color: '#94a3b8', textDecoration: 'none', transition: '0.2s' }} onMouseOver={e => e.target.style.color='#0ea5e9'} onMouseOut={e => e.target.style.color='#94a3b8'}>🍃 Mohali AQI & Air Monitor</Link>
            <Link to="/waste-management" style={{ color: '#94a3b8', textDecoration: 'none', transition: '0.2s' }} onMouseOver={e => e.target.style.color='#0ea5e9'} onMouseOut={e => e.target.style.color='#94a3b8'}>♻️ Smart E-Waste & Recycling</Link>
            <Link to="/civic-budgeting" style={{ color: '#94a3b8', textDecoration: 'none', transition: '0.2s' }} onMouseOver={e => e.target.style.color='#0ea5e9'} onMouseOut={e => e.target.style.color='#94a3b8'}>🏛️ Participatory Civic Budgeting</Link>
            <Link to="/smart-parking" style={{ color: '#94a3b8', textDecoration: 'none', transition: '0.2s' }} onMouseOver={e => e.target.style.color='#0ea5e9'} onMouseOut={e => e.target.style.color='#94a3b8'}>🅿️ Live Parking & EV Spot Locator</Link>
          </div>
        </div>

        {/* Col 4: Mohali Emergency Helplines */}
        <div>
          <h4 style={{ color: 'white', fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Mohali Emergency Helplines</h4>
          <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px', color: '#cbd5e1' }}>
            <div>🚨 Central Emergency Hotline: <strong>112</strong></div>
            <div>🚓 Mohali Police Control: <strong>0172-2219222</strong></div>
            <div>🚒 Fire Station Phase 1: <strong>0172-2225902</strong></div>
            <div>🚑 Civil Hospital Phase 6: <strong>0172-2225264</strong></div>
            <div>🏛️ MC Mohali Control Room: <strong>0172-2270068</strong></div>
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px', textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
        © 2026 Municipal Corporation Mohali (MC Mohali) | SAS Nagar, Punjab Smart City Portal
      </div>
    </footer>
  );
};

export default Footer;
