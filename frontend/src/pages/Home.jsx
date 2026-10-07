import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Home = () => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    setIsAdmin(user && user.role === 'admin');
  }, []);

  return (
    <div style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
      {/* Premium Hero Section */}
      <section style={{ 
        position: 'relative',
        background: 'linear-gradient(135deg, #020617 0%, #0f172a 40%, #0369a1 100%)',
        overflow: 'hidden',
        padding: '120px 20px',
        textAlign: 'center',
        borderBottom: '1px solid #1e293b'
      }}>
        {/* Subtle background glow effect */}
        <div style={{ position: 'absolute', top: '-20%', left: '20%', width: '600px', height: '600px', background: 'rgba(14, 165, 233, 0.15)', filter: 'blur(100px)', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', bottom: '-10%', right: '10%', width: '400px', height: '400px', background: 'rgba(99, 102, 241, 0.15)', filter: 'blur(100px)', borderRadius: '50%' }}></div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1000px', margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span style={{ display: 'inline-block', padding: '8px 16px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '100px', color: '#bae6fd', fontSize: '14px', fontWeight: '600', marginBottom: '20px', letterSpacing: '1px' }}>
              ✨ THE FUTURE OF CIVIC GOVERNANCE
            </span>
            <h1 style={{ 
              fontSize: 'clamp(46px, 6vw, 72px)', 
              fontWeight: '900', 
              letterSpacing: '-2px', 
              marginBottom: '24px', 
              lineHeight: '1.1',
              fontFamily: "'Outfit', sans-serif",
              background: 'linear-gradient(to right, #ffffff, #7dd3fc, #818cf8)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent',
              textShadow: '0 10px 30px rgba(125, 211, 252, 0.2)'
            }}>
              Mohali Smart City <br/> 
              <span style={{ fontSize: 'clamp(32px, 4vw, 48px)', background: 'linear-gradient(to right, #94a3b8, #cbd5e1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                (SAS Nagar, Punjab)
              </span>
            </h1>
            <p style={{ fontSize: '22px', color: '#94a3b8', maxWidth: '700px', margin: '0 auto 45px', lineHeight: '1.6', fontWeight: '400' }}>
              The official centralized digital civic management platform. Empowering citizens to report issues, track resolutions, and actively participate in building a smarter, greener city.
            </p>
            {!isAdmin && (
              <Link to="/register" style={{ 
                display: 'inline-block',
                fontSize: '18px', 
                fontWeight: '700',
                padding: '18px 45px', 
                borderRadius: '100px', 
                background: 'linear-gradient(135deg, #0ea5e9, #4f46e5)', 
                color: 'white',
                textDecoration: 'none',
                boxShadow: '0 15px 35px rgba(14, 165, 233, 0.4)',
                transition: 'transform 0.3s, boxShadow 0.3s'
              }}
              onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(14, 165, 233, 0.5)'; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 15px 35px rgba(14, 165, 233, 0.4)'; }}
              >
                Report an Issue 🚀
              </Link>
            )}
          </motion.div>
        </div>
      </section>

      {/* Quick Info & Stats Banner */}
      <section style={{ background: '#ffffff', padding: '40px 20px', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '30px' }}>
          {[
            { value: '24/7', label: 'Civic Support & Services', icon: '⏰' },
            { value: '15+', label: 'Integrated Departments', icon: '🏛️' },
            { value: '< 48h', label: 'Average Resolution SLA', icon: '⚡' },
            { value: '100%', label: 'Digital Transparency', icon: '🔍' }
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '10px 20px' }}>
              <div style={{ fontSize: '36px', marginBottom: '10px' }}>{stat.icon}</div>
              <div style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>{stat.value}</div>
              <div style={{ fontSize: '15px', color: '#64748b', fontWeight: '600' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section (Basic Info) */}
      <section style={{ padding: '80px 20px', background: '#f8fafc' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span style={{ color: '#0ea5e9', fontWeight: '800', fontSize: '14px', letterSpacing: '1px', textTransform: 'uppercase' }}>Basic Information</span>
            <h2 style={{ fontSize: '42px', color: '#0f172a', fontWeight: '800', margin: '10px 0', fontFamily: "'Outfit', sans-serif" }}>How the Smart City Platform Works</h2>
            <p style={{ color: '#64748b', fontSize: '18px', maxWidth: '700px', margin: '0 auto' }}>A seamless 3-step process connecting citizens directly to municipal field staff for rapid, accountable resolution of city issues.</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
            {[
              { step: '01', title: 'Citizen Reports', desc: 'Log an issue or E-Gov application with GPS tagging and evidence photos directly from your phone or PC.', color: '#0ea5e9' },
              { step: '02', title: 'AI & Dept Routing', desc: 'Our smart system routes the ticket to the exact department head (e.g., Water, Roads) who assigns a field worker.', color: '#8b5cf6' },
              { step: '03', title: 'Live Tracking & Resolution', desc: 'Track progress in real-time. Field staff upload proof of resolution, and you rate the service closing the loop.', color: '#10b981' }
            ].map((item, i) => (
              <div key={i} style={{ background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '120px', fontWeight: '900', color: item.color, opacity: '0.05', fontFamily: "'Outfit', sans-serif" }}>{item.step}</div>
                <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: `${item.color}15`, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '800', marginBottom: '20px' }}>{item.step}</div>
                <h3 style={{ fontSize: '24px', color: '#0f172a', marginBottom: '12px', fontFamily: "'Outfit', sans-serif" }}>{item.title}</h3>
                <p style={{ color: '#64748b', fontSize: '16px', lineHeight: '1.6' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Next-Gen Smart City Modules Section */}
      <section className="section" style={{ background: '#ffffff', padding: '80px 20px', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: '42px', color: '#0f172a', fontWeight: '800', margin: '0 0 15px 0', fontFamily: "'Outfit', sans-serif" }}>⚡ Next-Gen Smart City Modules</h2>
          <p style={{ color: '#64748b', fontSize: '18px', maxWidth: '700px', margin: '0 auto' }}>Advanced IoT telemetry, environmental monitoring, and citizen participatory governance.</p>
        </div>
        <div className="services" style={{ display: 'grid', gridTemplateColumns: 'repeat( auto-fit, minmax(280px, 1fr) )', gap: '25px', maxWidth: '1200px', margin: '0 auto' }}>
          <Link to="/aqi" className="service-box" style={{ background: '#f8fafc', borderRadius: '24px', padding: '30px', border: '1px solid #e2e8f0', textDecoration: 'none', transition: 'all 0.3s' }}>
            <span style={{ fontSize: '48px', display: 'block', marginBottom: '15px' }}>🍃</span>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '22px', color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>AQI & Traffic Telemetry</h3>
            <p style={{ margin: 0, fontSize: '15px', color: '#64748b', lineHeight: '1.5' }}>Real-time ward air quality index, PM2.5 monitoring, AI traffic congestion, and health advisories.</p>
          </Link>

          <Link to="/announcements" className="service-box" style={{ background: '#f8fafc', borderRadius: '24px', padding: '30px', border: '1px solid #e2e8f0', textDecoration: 'none', transition: 'all 0.3s' }}>
            <span style={{ fontSize: '48px', display: 'block', marginBottom: '15px' }}>📢</span>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '22px', color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>Civic Events & RSVPs</h3>
            <p style={{ margin: 0, fontSize: '15px', color: '#64748b', lineHeight: '1.5' }}>Stay updated on community announcements and RSVP to volunteer for municipal initiatives.</p>
          </Link>

          <Link to="/cab-booking" className="service-box" style={{ background: '#f8fafc', borderRadius: '24px', padding: '30px', border: '1px solid #e2e8f0', textDecoration: 'none', transition: 'all 0.3s' }}>
            <span style={{ fontSize: '48px', display: 'block', marginBottom: '15px' }}>🚌</span>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '22px', color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>Multi-Modal Transit</h3>
            <p style={{ margin: 0, fontSize: '15px', color: '#64748b', lineHeight: '1.5' }}>Book passes and tickets for Smart Buses, Metro networks, and local city cabs seamlessly.</p>
          </Link>

          <Link to="/services" className="service-box" style={{ background: '#f8fafc', borderRadius: '24px', padding: '30px', border: '1px solid #e2e8f0', textDecoration: 'none', transition: 'all 0.3s' }}>
            <span style={{ fontSize: '48px', display: 'block', marginBottom: '15px' }}>🏥</span>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '22px', color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>Live Hospital Stats</h3>
            <p style={{ margin: 0, fontSize: '15px', color: '#64748b', lineHeight: '1.5' }}>Access the centralized public directory with real-time bed availability and blood bank stats.</p>
          </Link>
        </div>
      </section>

      {/* Call to Action Footer */}
      <section style={{ padding: '80px 20px', background: 'linear-gradient(135deg, #0ea5e9, #4f46e5)', textAlign: 'center', color: 'white' }}>
        <h2 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '20px', fontFamily: "'Outfit', sans-serif" }}>Ready to improve your city?</h2>
        <p style={{ fontSize: '18px', opacity: 0.9, maxWidth: '600px', margin: '0 auto 40px' }}>Join thousands of citizens already participating in the Smart City governance platform.</p>
        {!isAdmin && <Link to="/register" style={{ fontSize: '18px', fontWeight: '700', padding: '18px 45px', borderRadius: '100px', background: 'white', color: '#0ea5e9', textDecoration: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}>Get Started Now</Link>}
      </section>
    </div>
  );
};

export default Home;
