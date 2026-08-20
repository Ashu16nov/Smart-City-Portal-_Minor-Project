import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showServicesDropdown, setShowServicesDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      if (parsedUser.role === 'admin') {
        document.body.classList.add('admin-theme');
      } else {
        document.body.classList.remove('admin-theme');
      }
    } else {
      setUser(null);
      document.body.classList.remove('admin-theme');
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    document.body.classList.remove('admin-theme');
    navigate('/login');
  };

  const isAdmin = user && user.role === 'admin';

  return (
    <nav className={`navbar ${isAdmin ? 'admin-nav' : ''}`} style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)', padding: '15px 50px', display: 'flex', alignItems: 'center' }}>
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontSize: '18px', boxShadow: '0 4px 10px rgba(14,165,233,0.3)' }}>🏙️</div>
        <h2 className="logo" style={{ margin: 0, fontSize: '22px', fontWeight: '800', letterSpacing: '-0.5px' }}>
          {isAdmin ? 'Ambika Green Admin' : 'Ambika Green Phase 1'}
        </h2>
      </Link>
      <ul id="global-nav" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, padding: 0 }}>
        <li>
          <Link to="/" style={{ padding: '8px 16px', borderRadius: '100px', fontWeight: '600', color: location.pathname === '/' ? '#0ea5e9' : '#475569', background: location.pathname === '/' ? '#f0f9ff' : 'transparent', textDecoration: 'none', transition: '0.2s' }}>Home</Link>
        </li>
        <li>
          <Link to="/emergency" style={{ padding: '8px 16px', borderRadius: '100px', fontWeight: '600', color: location.pathname === '/emergency' ? '#0ea5e9' : '#475569', background: location.pathname === '/emergency' ? '#f0f9ff' : 'transparent', textDecoration: 'none', transition: '0.2s' }}>Emergency</Link>
        </li>
        <li>
          <Link to="/announcements" style={{ padding: '8px 16px', borderRadius: '100px', fontWeight: '600', color: location.pathname === '/announcements' ? '#0ea5e9' : '#475569', background: location.pathname === '/announcements' ? '#f0f9ff' : 'transparent', textDecoration: 'none', transition: '0.2s' }}>📢 Notice Board</Link>
        </li>
        <li style={{ position: 'relative' }} onMouseLeave={() => setShowServicesDropdown(false)}>
          <div 
            onClick={() => setShowServicesDropdown(!showServicesDropdown)}
            onMouseEnter={() => setShowServicesDropdown(true)}
            style={{ padding: '8px 16px', borderRadius: '100px', fontWeight: '600', color: (location.pathname === '/services' || location.pathname === '/register') ? '#0ea5e9' : '#475569', background: (location.pathname === '/services' || location.pathname === '/register') ? '#f0f9ff' : 'transparent', cursor: 'pointer', transition: '0.2s', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            Public Services ▾
          </div>
          {showServicesDropdown && (
            <div style={{ position: 'absolute', top: '100%', left: 0, paddingTop: '10px', minWidth: '220px', zIndex: 1000 }}>
              <div style={{ background: 'white', borderRadius: '16px', padding: '8px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
                <Link to="/services" onClick={() => setShowServicesDropdown(false)} style={{ borderRadius: '8px', padding: '10px 15px', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#1e293b', fontWeight: '600', transition: '0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>🏛️ Services Directory</Link>
                
                {(!user || !isAdmin) && (
                  <Link to="/register" onClick={() => setShowServicesDropdown(false)} style={{ borderRadius: '8px', padding: '10px 15px', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#1e293b', fontWeight: '600', transition: '0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>📝 Register Complaint</Link>
                )}
              </div>
            </div>
          )}
        </li>
        
        {user ? (
          <>
            <li>
              <Link to="/complaints" style={{ padding: '8px 16px', borderRadius: '100px', fontWeight: '600', color: location.pathname === '/complaints' ? '#0ea5e9' : '#475569', background: location.pathname === '/complaints' ? '#f0f9ff' : 'transparent', textDecoration: 'none', transition: '0.2s' }}>Complaints</Link>
            </li>
            <li>
              <Link to="/feedback" style={{ padding: '8px 16px', borderRadius: '100px', fontWeight: '600', color: location.pathname === '/feedback' ? '#0ea5e9' : '#475569', background: location.pathname === '/feedback' ? '#f0f9ff' : 'transparent', textDecoration: 'none', transition: '0.2s' }}>Feedback</Link>
            </li>
            <li style={{ marginLeft: '10px' }}>
              <Link to="/notifications" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', background: location.pathname === '/notifications' ? '#e0f2fe' : '#f1f5f9', color: '#0ea5e9', textDecoration: 'none', fontSize: '20px', transition: '0.2s', position: 'relative' }}>
                🔔
              </Link>
            </li>
            <li className="profile-container" style={{ marginLeft: '15px' }}>
              <div className="circle-avatar" onClick={() => setShowDropdown(!showDropdown)} style={{ border: '2px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className={`custom-dropdown ${showDropdown ? 'show-dropdown' : ''}`} style={{ borderRadius: '16px', padding: '8px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                <div className="drop-head" style={{ background: '#f8fafc', borderRadius: '10px', padding: '15px', marginBottom: '8px', textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
                  <strong style={{ color: '#0f172a', fontSize: '15px' }}>{user.name}</strong>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>{isAdmin ? 'Administrator' : 'Citizen'}</span>
                </div>
                <Link to="/profile" className="drop-link" onClick={() => setShowDropdown(false)} style={{ borderRadius: '8px', padding: '10px 15px', display: 'flex', alignItems: 'center', gap: '10px' }}>👤 My Profile</Link>
                {isAdmin && (
                  <>
                    <Link to="/admin" className="drop-link" onClick={() => setShowDropdown(false)} style={{ borderRadius: '8px', padding: '10px 15px', display: 'flex', alignItems: 'center', gap: '10px' }}>⚙️ Complaints Panel</Link>
                    <Link to="/admin/services" className="drop-link" onClick={() => setShowDropdown(false)} style={{ borderRadius: '8px', padding: '10px 15px', display: 'flex', alignItems: 'center', gap: '10px' }}>🏥 Manage Services</Link>
                    <Link to="/admin/announcements" className="drop-link" onClick={() => setShowDropdown(false)} style={{ borderRadius: '8px', padding: '10px 15px', display: 'flex', alignItems: 'center', gap: '10px' }}>📢 Manage Notices</Link>
                    <Link to="/admin/notifications" className="drop-link" onClick={() => setShowDropdown(false)} style={{ borderRadius: '8px', padding: '10px 15px', display: 'flex', alignItems: 'center', gap: '10px' }}>🚀 Broadcast Alert</Link>
                  </>
                )}
                <button className="drop-logout" onClick={handleLogout} style={{ borderRadius: '8px', padding: '10px 15px', display: 'flex', alignItems: 'center', gap: '10px', margin: '4px', justifyContent: 'center' }}>🚪 Logout</button>
              </div>
            </li>
          </>
        ) : (
          <li style={{ marginLeft: '15px' }}>
            <Link to="/login" style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', color: 'white', padding: '10px 24px', borderRadius: '100px', fontWeight: '700', textDecoration: 'none', boxShadow: '0 4px 15px rgba(14,165,233,0.3)', transition: 'all 0.3s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>Login</Link>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
