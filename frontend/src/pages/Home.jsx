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
      <section className="hero">
        <div className="overlay">
          <h1>Smart City Civic Portal</h1>
          <p>Next-generation urban management. Report issues, track resolutions, and build a better city.</p>
          {!isAdmin && <Link to="/register" className="btn">Report an Issue</Link>}
        </div>
      </section>

      {/* About Section */}
      <section className="section">
        <h2>About The Platform</h2>
        <p>
          The Smart City Civic Portal is an integrated system designed to bridge the gap between citizens and municipal authorities. 
          Through this unified dashboard, residents can seamlessly report infrastructure issues, track maintenance in real-time, 
          and contribute to the sustainable development of our urban spaces.
        </p>
      </section>

      {/* Smart Domains Section */}
      <section className="section dark">
        <h2>Smart City Domains</h2>
        <div className="card-container">
          <div className="card">
            <div className="icon-placeholder">🏗️</div>
            <h3>Smart Infrastructure</h3>
            <p>Maintenance and rapid response for roads, bridges, and public facilities.</p>
          </div>
          <div className="card">
            <div className="icon-placeholder">💧</div>
            <h3>Water & Sanitation</h3>
            <p>Real-time tracking of water supply systems and automated waste management.</p>
          </div>
          <div className="card">
            <div className="icon-placeholder">⚡</div>
            <h3>Energy & Lighting</h3>
            <p>Smart grid monitoring and automated street lighting resolution.</p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="section">
        <h2>Digital Services</h2>
        <div className="services">
          <Link to="/register" className="service-box">
            <span>📝</span>
            <h3>Issue Reporting</h3>
            <p>Instantly log civic issues with geo-tagging and multimedia attachments.</p>
          </Link>
          <Link to="/complaints" className="service-box">
            <span>📡</span>
            <h3>Live Tracking</h3>
            <p>Monitor the status of your tickets with real-time updates from authorities.</p>
          </Link>
          <Link to="/feedback" className="service-box">
            <span>💡</span>
            <h3>Citizen Feedback</h3>
            <p>Provide valuable feedback to help optimize municipal operations.</p>
          </Link>
          <div className="service-box">
            <span>🔐</span>
            <h3>Data Transparency</h3>
            <p>Access open data regarding resolution times and neighborhood metrics.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
