import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    setIsAdmin(user && user.role === 'admin');
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="hero" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #0369a1 100%)' }}>
        <div className="overlay">
          <h1 style={{ fontSize: '64px', fontWeight: '900', letterSpacing: '-2px', marginBottom: '20px', background: 'linear-gradient(to right, #ffffff, #7dd3fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Ambika Green <br/> Smart City Portal
          </h1>
          <p style={{ fontSize: '22px', color: '#e0f2fe', maxWidth: '600px', margin: '0 auto 40px', lineHeight: '1.5' }}>
            Next-generation civic management. Report issues, track resolutions, and participate in building a smarter, safer community.
          </p>
          {!isAdmin && <Link to="/register" className="btn" style={{ fontSize: '18px', padding: '16px 40px', borderRadius: '100px', background: '#0ea5e9', boxShadow: '0 10px 25px rgba(14,165,233,0.4)' }}>Report an Issue 🚀</Link>}
        </div>
      </section>

      {/* About Section */}
      <section className="section">
        <h2 style={{ fontSize: '36px', color: 'var(--text-primary)', marginBottom: '20px' }}>Empowering Citizens</h2>
        <p style={{ fontSize: '18px', color: 'var(--text-secondary)', maxWidth: '800px', margin: '0 auto', lineHeight: '1.8' }}>
          The Smart City Portal is an integrated system designed to bridge the gap between residents and city administration. 
          Through this unified dashboard, residents can seamlessly report infrastructure issues, track maintenance in real-time, 
          receive critical announcements, and contribute to the sustainable development of our urban spaces.
        </p>
      </section>

      {/* Smart Domains Section */}
      <section className="section dark">
        <h2 style={{ fontSize: '36px', color: 'var(--text-primary)', marginBottom: '10px' }}>City Domains</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '40px' }}>Comprehensive management across critical infrastructure</p>
        <div className="card-container">
          <div className="card">
            <div className="icon-placeholder">🏗️</div>
            <h3>Smart Infrastructure</h3>
            <p>Maintenance and rapid response for roads, bridges, public parks, and civic facilities.</p>
          </div>
          <div className="card">
            <div className="icon-placeholder">💧</div>
            <h3>Water & Sanitation</h3>
            <p>Real-time tracking of water supply systems, drainage, and automated waste management.</p>
          </div>
          <div className="card">
            <div className="icon-placeholder">⚡</div>
            <h3>Energy & Lighting</h3>
            <p>Smart grid monitoring, electrical hazard reporting, and automated street lighting resolution.</p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="section">
        <h2 style={{ fontSize: '36px', color: 'var(--text-primary)', marginBottom: '10px' }}>Digital Services</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '40px' }}>Everything you need at your fingertips</p>
        <div className="services">
          <Link to="/register" className="service-box">
            <span>📝</span>
            <h3>Issue Reporting</h3>
            <p>Instantly log civic issues with precise GPS geo-tagging and multimedia evidence.</p>
          </Link>
          <Link to="/complaints" className="service-box">
            <span>📡</span>
            <h3>Live Tracking</h3>
            <p>Monitor the status of your tickets with real-time updates and resolution SLAs.</p>
          </Link>
          <Link to="/feedback" className="service-box">
            <span>💡</span>
            <h3>Citizen Feedback</h3>
            <p>Provide valuable feedback, rate resolutions, and suggest improvements.</p>
          </Link>
          <Link to="/services" className="service-box">
            <span>🏛️</span>
            <h3>Public Directory</h3>
            <p>Access the centralized directory for all essential public and emergency services.</p>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
