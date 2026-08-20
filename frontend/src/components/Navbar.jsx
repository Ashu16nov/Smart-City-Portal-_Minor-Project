import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showServicesDropdown, setShowServicesDropdown] = useState(false);
  const [showCitizenDropdown, setShowCitizenDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  };

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
    setSearchQuery('');
    setSearchResults(null);
  }, [location]);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults(null);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.get(`/search?q=${searchQuery}`);
        setSearchResults(res.data);
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setIsSearching(false);
      }
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    document.body.classList.remove('admin-theme');
    navigate('/login');
  };

  const isAdmin = user && user.role === 'admin';
  const isDepartment = user && user.role === 'department';
  const isStaff = user && user.role === 'staff';

  return (
    <nav className={`navbar ${isAdmin || isDepartment ? 'admin-nav' : ''}`} style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)', padding: '15px 50px', display: 'flex', alignItems: 'center' }}>
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontSize: '18px', boxShadow: '0 4px 10px rgba(14,165,233,0.3)' }}>🏛️</div>
        <h2 className="logo" style={{ margin: 0, fontSize: '22px', fontWeight: '800', letterSpacing: '-0.5px' }}>
          {isAdmin ? 'SmartCity Admin' : (isDepartment ? 'SmartCity Dept' : (isStaff ? 'SmartCity Staff' : 'SmartCity Portal'))}
        </h2>
      </Link>

      {/* Global Search Bar */}
      <div style={{ position: 'relative', margin: '0 auto', width: '300px' }}>
        <input 
          type="text" 
          placeholder="Search complaints, services..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '100%', padding: '10px 15px', borderRadius: '20px', border: '1px solid #cbd5e1', background: '#f8fafc', outline: 'none' }}
        />
        {searchResults && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', marginTop: '8px', zIndex: 1000, padding: '10px', maxHeight: '400px', overflowY: 'auto' }}>
            {isSearching ? <div style={{ textAlign: 'center', padding: '10px', color: '#64748b' }}>Searching...</div> : (
              <>
                {searchResults.complaints?.length > 0 && (
                  <div style={{ marginBottom: '10px' }}>
                    <strong style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>Complaints</strong>
                    {searchResults.complaints.map(c => (
                      <Link key={c.complaintId} to="/complaints" style={{ display: 'block', padding: '8px', textDecoration: 'none', color: '#0f172a', fontSize: '14px', borderRadius: '6px' }} onMouseOver={e => e.currentTarget.style.background='#f1f5f9'} onMouseOut={e => e.currentTarget.style.background='transparent'}>
                        {c.complaintId} - {c.title}
                      </Link>
                    ))}
                  </div>
                )}
                {searchResults.services?.length > 0 && (
                  <div style={{ marginBottom: '10px' }}>
                    <strong style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>Services</strong>
                    {searchResults.services.map(s => (
                      <Link key={s._id} to="/services" style={{ display: 'block', padding: '8px', textDecoration: 'none', color: '#0f172a', fontSize: '14px', borderRadius: '6px' }} onMouseOver={e => e.currentTarget.style.background='#f1f5f9'} onMouseOut={e => e.currentTarget.style.background='transparent'}>
                        {s.name} ({s.category})
                      </Link>
                    ))}
                  </div>
                )}
                {searchResults.announcements?.length > 0 && (
                  <div>
                    <strong style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>Announcements</strong>
                    {searchResults.announcements.map(a => (
                      <Link key={a._id} to="/announcements" style={{ display: 'block', padding: '8px', textDecoration: 'none', color: '#0f172a', fontSize: '14px', borderRadius: '6px' }} onMouseOver={e => e.currentTarget.style.background='#f1f5f9'} onMouseOut={e => e.currentTarget.style.background='transparent'}>
                        📢 {a.title}
                      </Link>
                    ))}
                  </div>
                )}
                {!searchResults.complaints?.length && !searchResults.services?.length && !searchResults.announcements?.length && (
                  <div style={{ textAlign: 'center', padding: '10px', color: '#64748b' }}>No results found</div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <ul id="global-nav" style={{ display: 'flex', alignItems: 'center', gap: '15px', margin: 0, padding: 0 }}>
        <li>
          <Link to="/" style={{ padding: '8px 16px', borderRadius: '100px', fontWeight: '600', color: location.pathname === '/' ? '#0ea5e9' : '#475569', background: location.pathname === '/' ? '#f0f9ff' : 'transparent', textDecoration: 'none', transition: '0.2s' }}>Home</Link>
        </li>
        
        {/* Services Dropdown */}
        <li style={{ position: 'relative' }} onMouseLeave={() => setShowServicesDropdown(false)}>
          <div 
            onClick={() => setShowServicesDropdown(!showServicesDropdown)}
            onMouseEnter={() => setShowServicesDropdown(true)}
            style={{ padding: '8px 16px', borderRadius: '100px', fontWeight: '600', color: (location.pathname === '/services' || location.pathname === '/nearby' || location.pathname === '/emergency') ? '#0ea5e9' : '#475569', background: (location.pathname === '/services' || location.pathname === '/nearby' || location.pathname === '/emergency') ? '#f0f9ff' : 'transparent', cursor: 'pointer', transition: '0.2s', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            Services ▾
          </div>
          {showServicesDropdown && (
            <div style={{ position: 'absolute', top: '100%', left: 0, paddingTop: '10px', minWidth: '220px', zIndex: 1000 }}>
              <div style={{ background: 'white', borderRadius: '16px', padding: '8px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
                <Link to="/services" onClick={() => setShowServicesDropdown(false)} style={{ borderRadius: '8px', padding: '10px 15px', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#1e293b', fontWeight: '600', transition: '0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>🏛️ Services Directory</Link>
                <Link to="/nearby" onClick={() => setShowServicesDropdown(false)} style={{ borderRadius: '8px', padding: '10px 15px', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#1e293b', fontWeight: '600', transition: '0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>📍 Nearby Locations</Link>
                <Link to="/emergency" onClick={() => setShowServicesDropdown(false)} style={{ borderRadius: '8px', padding: '10px 15px', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#1e293b', fontWeight: '600', transition: '0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>🚨 Emergency Contacts</Link>
              </div>
            </div>
          )}
        </li>

        {/* Citizen Desk Dropdown */}
        <li style={{ position: 'relative' }} onMouseLeave={() => setShowCitizenDropdown(false)}>
          <div 
            onClick={() => setShowCitizenDropdown(!showCitizenDropdown)}
            onMouseEnter={() => setShowCitizenDropdown(true)}
            style={{ padding: '8px 16px', borderRadius: '100px', fontWeight: '600', color: (location.pathname === '/announcements' || location.pathname === '/register' || location.pathname === '/complaints' || location.pathname === '/feedback') ? '#0ea5e9' : '#475569', background: (location.pathname === '/announcements' || location.pathname === '/register' || location.pathname === '/complaints' || location.pathname === '/feedback') ? '#f0f9ff' : 'transparent', cursor: 'pointer', transition: '0.2s', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            Citizen Desk ▾
          </div>
          {showCitizenDropdown && (
            <div style={{ position: 'absolute', top: '100%', left: 0, paddingTop: '10px', minWidth: '230px', zIndex: 1000 }}>
              <div style={{ background: 'white', borderRadius: '16px', padding: '8px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
                <Link to="/announcements" onClick={() => setShowCitizenDropdown(false)} style={{ borderRadius: '8px', padding: '10px 15px', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#1e293b', fontWeight: '600', transition: '0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>📢 Notice Board</Link>
                
                {(!user || !isAdmin) && (
                  <Link to="/register" onClick={() => setShowCitizenDropdown(false)} style={{ borderRadius: '8px', padding: '10px 15px', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#1e293b', fontWeight: '600', transition: '0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>📝 Register Complaint</Link>
                )}
                
                {user && (
                  <>
                    <Link to="/complaints" onClick={() => setShowCitizenDropdown(false)} style={{ borderRadius: '8px', padding: '10px 15px', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#1e293b', fontWeight: '600', transition: '0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>📋 My Complaints</Link>
                    <Link to="/feedback" onClick={() => setShowCitizenDropdown(false)} style={{ borderRadius: '8px', padding: '10px 15px', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#1e293b', fontWeight: '600', transition: '0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>⭐ Feedback</Link>
                  </>
                )}
              </div>
            </div>
          )}
        </li>
        
        <li style={{ marginLeft: '10px' }}>
          <button 
            onClick={toggleDarkMode} 
            style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', 
              background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', 
              fontSize: '18px', cursor: 'pointer', transition: '0.2s' 
            }}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </li>

        {user ? (
          <>
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
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    {isAdmin ? 'Administrator' : isDepartment ? 'Department Head' : isStaff ? 'Staff Member' : 'Citizen'}
                  </span>
                </div>
                <Link to="/profile" className="drop-link" onClick={() => setShowDropdown(false)} style={{ borderRadius: '8px', padding: '10px 15px', display: 'flex', alignItems: 'center', gap: '10px' }}>👤 My Profile</Link>
                {isAdmin && (
                  <>
                    <Link to="/admin" className="drop-link" onClick={() => setShowDropdown(false)} style={{ borderRadius: '8px', padding: '10px 15px', display: 'flex', alignItems: 'center', gap: '10px' }}>⚙️ Admin Control Center</Link>
                  </>
                )}
                {isDepartment && (
                  <Link to="/department" className="drop-link" onClick={() => setShowDropdown(false)} style={{ borderRadius: '8px', padding: '10px 15px', display: 'flex', alignItems: 'center', gap: '10px' }}>🏛️ Dept Dashboard</Link>
                )}
                {isStaff && (
                  <Link to="/staff" className="drop-link" onClick={() => setShowDropdown(false)} style={{ borderRadius: '8px', padding: '10px 15px', display: 'flex', alignItems: 'center', gap: '10px' }}>🛠️ Staff Workspace</Link>
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
