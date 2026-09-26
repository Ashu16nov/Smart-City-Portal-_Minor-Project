import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showServicesDropdown, setShowServicesDropdown] = useState(false);
  const [showCitizenDropdown, setShowCitizenDropdown] = useState(false);
  const [showSmartDropdown, setShowSmartDropdown] = useState(false);
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);
  const [showStaffDropdown, setShowStaffDropdown] = useState(false);
  
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

  const logoTarget = isAdmin ? '/admin' : (isDepartment ? '/department' : (isStaff ? '/staff' : '/'));

  return (
    <nav 
      className={`navbar ${isAdmin || isDepartment ? 'admin-nav' : ''}`} 
      style={{ 
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)', 
        padding: '12px 30px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        gap: '20px',
        width: '100%',
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}
    >
      
      {/* 1. Brand Logo & Title (Fixed Left) */}
      <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center' }}>
        <Link to={logoTarget} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: isAdmin ? 'linear-gradient(135deg, #0f172a, #0369a1)' : isStaff ? 'linear-gradient(135deg, #0ea5e9, #10b981)' : 'linear-gradient(135deg, #0ea5e9, #6366f1)',
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            fontSize: '18px',
            boxShadow: '0 4px 10px rgba(14,165,233,0.3)'
          }}>
            {isAdmin ? '🎛️' : isStaff ? '🛠️' : '🏛️'}
          </div>
          <div>
            <h2 className="logo" style={{ margin: 0, fontSize: '19px', fontWeight: '800', letterSpacing: '-0.5px', whiteSpace: 'nowrap' }}>
              {isAdmin ? 'SmartCity Admin' : (isDepartment ? 'SmartCity Dept' : (isStaff ? 'SmartCity Staff' : 'SmartCity Portal'))}
            </h2>
            {(isAdmin || isStaff || isDepartment) && (
              <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', display: 'block', whiteSpace: 'nowrap' }}>
                {isAdmin ? 'Admin Control' : isStaff ? `Staff (${user.departmentName || 'Field Ops'})` : `Dept (${user.departmentName})`}
              </span>
            )}
          </div>
        </Link>
      </div>

      {/* 2. Global Search Bar (Flexible Middle with min/max constraints) */}
      <div style={{ position: 'relative', flex: '0 1 260px', minWidth: '150px' }}>
        <input 
          type="text" 
          placeholder={isAdmin ? "Search complaints, users..." : isStaff ? "Search task ID, title..." : "Search complaints, services..."} 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '100%', padding: '9px 15px', borderRadius: '20px', border: '1px solid #cbd5e1', background: '#f8fafc', outline: 'none', fontSize: '13px' }}
        />
        {searchResults && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', borderRadius: '14px', boxShadow: '0 10px 30px rgba(0,0,0,0.12)', marginTop: '8px', zIndex: 1000, padding: '12px', maxHeight: '400px', overflowY: 'auto' }}>
            {isSearching ? <div style={{ textAlign: 'center', padding: '10px', color: '#64748b' }}>Searching...</div> : (
              <>
                {searchResults.complaints?.length > 0 && (
                  <div style={{ marginBottom: '10px' }}>
                    <strong style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Grievances</strong>
                    {searchResults.complaints.map(c => (
                      <Link key={c.complaintId} to={isStaff ? '/staff' : isAdmin ? '/admin' : '/complaints'} style={{ display: 'block', padding: '8px', textDecoration: 'none', color: '#0f172a', fontSize: '13px', borderRadius: '6px' }} onMouseOver={e => e.currentTarget.style.background='#f1f5f9'} onMouseOut={e => e.currentTarget.style.background='transparent'}>
                        <strong>{c.complaintId}</strong> - {c.title}
                      </Link>
                    ))}
                  </div>
                )}
                {searchResults.services?.length > 0 && (
                  <div style={{ marginBottom: '10px' }}>
                    <strong style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Services</strong>
                    {searchResults.services.map(s => (
                      <Link key={s._id} to="/services" style={{ display: 'block', padding: '8px', textDecoration: 'none', color: '#0f172a', fontSize: '13px', borderRadius: '6px' }} onMouseOver={e => e.currentTarget.style.background='#f1f5f9'} onMouseOut={e => e.currentTarget.style.background='transparent'}>
                        {s.name} ({s.category})
                      </Link>
                    ))}
                  </div>
                )}
                {searchResults.announcements?.length > 0 && (
                  <div>
                    <strong style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Announcements</strong>
                    {searchResults.announcements.map(a => (
                      <Link key={a._id} to="/announcements" style={{ display: 'block', padding: '8px', textDecoration: 'none', color: '#0f172a', fontSize: '13px', borderRadius: '6px' }} onMouseOver={e => e.currentTarget.style.background='#f1f5f9'} onMouseOut={e => e.currentTarget.style.background='transparent'}>
                        📢 {a.title}
                      </Link>
                    ))}
                  </div>
                )}
                {!searchResults.complaints?.length && !searchResults.services?.length && !searchResults.announcements?.length && (
                  <div style={{ textAlign: 'center', padding: '10px', color: '#64748b' }}>No matching results</div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* 3. Right Navigation Actions (Fixed Right, No Wrap Collisions) */}
      <ul id="global-nav" style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, padding: 0, listStyle: 'none', whiteSpace: 'nowrap' }}>
        
        {/* ==================== ADMIN ROLE ==================== */}
        {isAdmin && (
          <>
            <li>
              <Link to="/admin" style={{ padding: '7px 14px', borderRadius: '100px', fontWeight: '700', fontSize: '13px', color: location.pathname === '/admin' ? 'white' : '#0369a1', background: location.pathname === '/admin' ? 'linear-gradient(135deg, #0f172a, #0369a1)' : '#e0f2fe', textDecoration: 'none', transition: '0.2s', display: 'inline-block', whiteSpace: 'nowrap' }}>
                🎛️ Control Center
              </Link>
            </li>

            <li style={{ position: 'relative' }} onMouseLeave={() => setShowAdminDropdown(false)}>
              <div 
                onClick={() => setShowAdminDropdown(!showAdminDropdown)}
                onMouseEnter={() => setShowAdminDropdown(true)}
                style={{ padding: '7px 14px', borderRadius: '100px', fontWeight: '700', fontSize: '13px', color: (location.pathname.startsWith('/admin')) ? '#0ea5e9' : '#475569', background: (location.pathname.startsWith('/admin')) ? '#f0f9ff' : 'transparent', cursor: 'pointer', transition: '0.2s', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}
              >
                Admin Tools ⚡ ▾
              </div>
              {showAdminDropdown && (
                <div style={{ position: 'absolute', top: '100%', right: 0, paddingTop: '10px', minWidth: '230px', zIndex: 1000 }}>
                  <div style={{ background: 'white', borderRadius: '16px', padding: '8px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
                    <Link to="/admin" onClick={() => setShowAdminDropdown(false)} style={{ borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#1e293b', fontWeight: '600', fontSize: '13px' }} onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>🎛️ Executive Dashboard</Link>
                    <Link to="/admin/announcements" onClick={() => setShowAdminDropdown(false)} style={{ borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#1e293b', fontWeight: '600', fontSize: '13px' }} onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>📢 Broadcast Announcement</Link>
                    <Link to="/admin/services" onClick={() => setShowAdminDropdown(false)} style={{ borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#1e293b', fontWeight: '600', fontSize: '13px' }} onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>🏛️ Services Manager</Link>
                    <Link to="/admin/notifications" onClick={() => setShowAdminDropdown(false)} style={{ borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#1e293b', fontWeight: '600', fontSize: '13px' }} onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>🔔 Push Notifications</Link>
                  </div>
                </div>
              )}
            </li>
          </>
        )}

        {/* ==================== STAFF ROLE ==================== */}
        {isStaff && (
          <>
            <li>
              <Link to="/staff" style={{ padding: '7px 14px', borderRadius: '100px', fontWeight: '700', fontSize: '13px', color: location.pathname === '/staff' ? 'white' : '#15803d', background: location.pathname === '/staff' ? 'linear-gradient(135deg, #15803d, #059669)' : '#dcfce7', textDecoration: 'none', transition: '0.2s', display: 'inline-block', whiteSpace: 'nowrap' }}>
                🛠️ Field Workspace
              </Link>
            </li>

            <li style={{ position: 'relative' }} onMouseLeave={() => setShowStaffDropdown(false)}>
              <div 
                onClick={() => setShowStaffDropdown(!showStaffDropdown)}
                onMouseEnter={() => setShowStaffDropdown(true)}
                style={{ padding: '7px 14px', borderRadius: '100px', fontWeight: '700', fontSize: '13px', color: (location.pathname === '/waste-management' || location.pathname === '/nearby' || location.pathname === '/emergency') ? '#15803d' : '#475569', background: (location.pathname === '/waste-management' || location.pathname === '/nearby' || location.pathname === '/emergency') ? '#f0fdf4' : 'transparent', cursor: 'pointer', transition: '0.2s', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}
              >
                Field Ops ▾
              </div>
              {showStaffDropdown && (
                <div style={{ position: 'absolute', top: '100%', right: 0, paddingTop: '10px', minWidth: '220px', zIndex: 1000 }}>
                  <div style={{ background: 'white', borderRadius: '16px', padding: '8px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
                    <Link to="/staff" onClick={() => setShowStaffDropdown(false)} style={{ borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#1e293b', fontWeight: '600', fontSize: '13px' }} onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>📋 Task Work Queue</Link>
                    <Link to="/waste-management" onClick={() => setShowStaffDropdown(false)} style={{ borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#1e293b', fontWeight: '600', fontSize: '13px' }} onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>♻️ Waste Pickups Queue</Link>
                    <Link to="/nearby" onClick={() => setShowStaffDropdown(false)} style={{ borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#1e293b', fontWeight: '600', fontSize: '13px' }} onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>📍 Nearby Map & Locations</Link>
                    <Link to="/emergency" onClick={() => setShowStaffDropdown(false)} style={{ borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#1e293b', fontWeight: '600', fontSize: '13px' }} onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>🚨 Emergency SOS Contacts</Link>
                  </div>
                </div>
              )}
            </li>
          </>
        )}

        {/* ==================== DEPARTMENT HEAD ROLE ==================== */}
        {isDepartment && (
          <li>
            <Link to="/department" style={{ padding: '7px 14px', borderRadius: '100px', fontWeight: '700', fontSize: '13px', color: location.pathname === '/department' ? 'white' : '#0369a1', background: location.pathname === '/department' ? 'linear-gradient(135deg, #0284c7, #6366f1)' : '#e0f2fe', textDecoration: 'none', transition: '0.2s', whiteSpace: 'nowrap' }}>
              🏛️ Dept Dashboard
            </Link>
          </li>
        )}

        {/* Shared Services Dropdown */}
        <li style={{ position: 'relative' }} onMouseLeave={() => setShowServicesDropdown(false)}>
          <div 
            onClick={() => setShowServicesDropdown(!showServicesDropdown)}
            onMouseEnter={() => setShowServicesDropdown(true)}
            style={{ padding: '7px 14px', borderRadius: '100px', fontWeight: '600', fontSize: '13px', color: (location.pathname === '/services' || location.pathname === '/nearby' || location.pathname === '/emergency') ? '#0ea5e9' : '#475569', background: (location.pathname === '/services' || location.pathname === '/nearby' || location.pathname === '/emergency') ? '#f0f9ff' : 'transparent', cursor: 'pointer', transition: '0.2s', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}
          >
            Services ▾
          </div>
          {showServicesDropdown && (
            <div style={{ position: 'absolute', top: '100%', right: 0, paddingTop: '10px', minWidth: '200px', zIndex: 1000 }}>
              <div style={{ background: 'white', borderRadius: '16px', padding: '8px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
                <Link to="/services" onClick={() => setShowServicesDropdown(false)} style={{ borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#1e293b', fontWeight: '600', fontSize: '13px' }} onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>🏛️ Public Services</Link>
                <Link to="/nearby" onClick={() => setShowServicesDropdown(false)} style={{ borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#1e293b', fontWeight: '600', fontSize: '13px' }} onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>📍 Nearby Locations</Link>
                <Link to="/emergency" onClick={() => setShowServicesDropdown(false)} style={{ borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#1e293b', fontWeight: '600', fontSize: '13px' }} onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>🚨 Emergency Directory</Link>
              </div>
            </div>
          )}
        </li>

        {/* Smart Modules Dropdown */}
        <li style={{ position: 'relative' }} onMouseLeave={() => setShowSmartDropdown(false)}>
          <div 
            onClick={() => setShowSmartDropdown(!showSmartDropdown)}
            onMouseEnter={() => setShowSmartDropdown(true)}
            style={{ padding: '7px 14px', borderRadius: '100px', fontWeight: '600', fontSize: '13px', color: (location.pathname === '/aqi' || location.pathname === '/waste-management' || location.pathname === '/civic-budgeting' || location.pathname === '/smart-parking') ? '#0ea5e9' : '#475569', background: (location.pathname === '/aqi' || location.pathname === '/waste-management' || location.pathname === '/civic-budgeting' || location.pathname === '/smart-parking') ? '#f0f9ff' : 'transparent', cursor: 'pointer', transition: '0.2s', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}
          >
            Smart Modules ⚡ ▾
          </div>
          {showSmartDropdown && (
            <div style={{ position: 'absolute', top: '100%', right: 0, paddingTop: '10px', minWidth: '220px', zIndex: 1000 }}>
              <div style={{ background: 'white', borderRadius: '16px', padding: '8px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
                <Link to="/aqi" onClick={() => setShowSmartDropdown(false)} style={{ borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#1e293b', fontWeight: '600', fontSize: '13px' }} onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>🍃 AQI & Air Monitor</Link>
                <Link to="/waste-management" onClick={() => setShowSmartDropdown(false)} style={{ borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#1e293b', fontWeight: '600', fontSize: '13px' }} onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>♻️ Smart Waste & E-Waste</Link>
                <Link to="/civic-budgeting" onClick={() => setShowSmartDropdown(false)} style={{ borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#1e293b', fontWeight: '600', fontSize: '13px' }} onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>🏛️ Civic Budgeting Polls</Link>
                <Link to="/smart-parking" onClick={() => setShowSmartDropdown(false)} style={{ borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#1e293b', fontWeight: '600', fontSize: '13px' }} onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>🅿️ Smart Parking Locator</Link>
                <Link to="/local-hub" onClick={() => setShowSmartDropdown(false)} style={{ borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#1e293b', fontWeight: '600', fontSize: '13px' }} onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>🌾 Vocal for Local Hub</Link>
              </div>
            </div>
          )}
        </li>

        {/* Citizen Desk Dropdown (For Citizens & Guests) */}
        {(!isAdmin && !isStaff) && (
          <li style={{ position: 'relative' }} onMouseLeave={() => setShowCitizenDropdown(false)}>
            <div 
              onClick={() => setShowCitizenDropdown(!showCitizenDropdown)}
              onMouseEnter={() => setShowCitizenDropdown(true)}
              style={{ padding: '7px 14px', borderRadius: '100px', fontWeight: '600', fontSize: '13px', color: (location.pathname === '/announcements' || location.pathname === '/register' || location.pathname === '/complaints' || location.pathname === '/feedback') ? '#0ea5e9' : '#475569', background: (location.pathname === '/announcements' || location.pathname === '/register' || location.pathname === '/complaints' || location.pathname === '/feedback') ? '#f0f9ff' : 'transparent', cursor: 'pointer', transition: '0.2s', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}
            >
              Citizen Desk ▾
            </div>
            {showCitizenDropdown && (
              <div style={{ position: 'absolute', top: '100%', right: 0, paddingTop: '10px', minWidth: '220px', zIndex: 1000 }}>
                <div style={{ background: 'white', borderRadius: '16px', padding: '8px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
                  <Link to="/announcements" onClick={() => setShowCitizenDropdown(false)} style={{ borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#1e293b', fontWeight: '600', fontSize: '13px' }} onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>📢 Notice Board</Link>
                  <Link to="/register" onClick={() => setShowCitizenDropdown(false)} style={{ borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#1e293b', fontWeight: '600', fontSize: '13px' }} onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>📝 Register Complaint</Link>
                  {user && (
                    <>
                      <Link to="/complaints" onClick={() => setShowCitizenDropdown(false)} style={{ borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#1e293b', fontWeight: '600', fontSize: '13px' }} onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>📋 My Complaints</Link>
                      <Link to="/feedback" onClick={() => setShowCitizenDropdown(false)} style={{ borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#1e293b', fontWeight: '600', fontSize: '13px' }} onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>⭐ Feedback</Link>
                      <Link to="/my-bookings" onClick={() => setShowCitizenDropdown(false)} style={{ borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#1e293b', fontWeight: '600', fontSize: '13px' }} onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>🚕 My Bookings</Link>
                    </>
                  )}
                </div>
              </div>
            )}
          </li>
        )}

        {/* Notice Board Link for Staff/Admin */}
        {(isAdmin || isStaff) && (
          <li>
            <Link to="/announcements" style={{ padding: '7px 14px', borderRadius: '100px', fontWeight: '600', fontSize: '13px', color: location.pathname === '/announcements' ? '#0ea5e9' : '#475569', background: location.pathname === '/announcements' ? '#f0f9ff' : 'transparent', textDecoration: 'none', transition: '0.2s', whiteSpace: 'nowrap' }}>📢 Announcements</Link>
          </li>
        )}

        {/* Dark Mode Toggle */}
        <li>
          <button 
            onClick={toggleDarkMode} 
            style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', 
              background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', 
              fontSize: '16px', cursor: 'pointer', transition: '0.2s' 
            }}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </li>

        {/* Profile / Account Dropdown */}
        {user ? (
          <>
            <li>
              <Link to="/notifications" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', background: location.pathname === '/notifications' ? '#e0f2fe' : '#f1f5f9', color: '#0ea5e9', textDecoration: 'none', fontSize: '18px', transition: '0.2s', position: 'relative' }}>
                🔔
              </Link>
            </li>

            <li className="profile-container" style={{ position: 'relative' }}>
              <div className="circle-avatar" onClick={() => setShowProfileDropdown(!showProfileDropdown)} style={{ width: '36px', height: '36px', border: '2px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                {user.name.charAt(0).toUpperCase()}
              </div>

              <div className={`custom-dropdown ${showProfileDropdown ? 'show-dropdown' : ''}`} style={{ position: 'absolute', top: '100%', right: 0, borderRadius: '16px', padding: '8px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                <div className="drop-head" style={{ background: '#f8fafc', borderRadius: '10px', padding: '12px 15px', marginBottom: '8px', textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
                  <strong style={{ color: '#0f172a', fontSize: '14px' }}>{user.name}</strong>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>
                    {isAdmin ? '🎛️ Administrator' : isDepartment ? '🏛️ Dept Head' : isStaff ? `🛠️ Staff (${user.departmentName || 'Field'})` : '👤 Citizen'}
                  </span>
                </div>

                <Link to="/profile" className="drop-link" onClick={() => setShowProfileDropdown(false)} style={{ borderRadius: '8px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>👤 My Profile</Link>
                
                {isAdmin && (
                  <Link to="/admin" className="drop-link" onClick={() => setShowProfileDropdown(false)} style={{ borderRadius: '8px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>🎛️ Admin Control</Link>
                )}
                {isDepartment && (
                  <Link to="/department" className="drop-link" onClick={() => setShowProfileDropdown(false)} style={{ borderRadius: '8px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>🏛️ Dept Dashboard</Link>
                )}
                {isStaff && (
                  <Link to="/staff" className="drop-link" onClick={() => setShowProfileDropdown(false)} style={{ borderRadius: '8px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>🛠️ Staff Workspace</Link>
                )}
                
                <button className="drop-logout" onClick={handleLogout} style={{ borderRadius: '8px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', margin: '4px', justifyContent: 'center', fontSize: '13px' }}>🚪 Logout</button>
              </div>
            </li>
          </>
        ) : (
          <li>
            <Link to="/login" style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', color: 'white', padding: '8px 20px', borderRadius: '100px', fontWeight: '700', fontSize: '13px', textDecoration: 'none', boxShadow: '0 4px 15px rgba(14,165,233,0.3)' }}>Login</Link>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
