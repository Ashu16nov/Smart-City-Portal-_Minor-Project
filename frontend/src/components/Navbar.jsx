import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
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
    <nav className={`navbar ${isAdmin ? 'admin-nav' : ''}`}>
      <h2 className="logo">{isAdmin ? 'SmartCity Admin' : 'SmartCity Portal'}</h2>
      <ul id="global-nav">
        <li><Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link></li>
        
        {user ? (
          <>
            {!isAdmin && <li><Link to="/register" className={location.pathname === '/register' ? 'active' : ''}>Register</Link></li>}
            <li><Link to="/complaints" className={location.pathname === '/complaints' ? 'active' : ''}>Complaints</Link></li>
            <li><Link to="/feedback" className={location.pathname === '/feedback' ? 'active' : ''}>Feedback</Link></li>
            <li className="profile-container">
              <div className="circle-avatar" onClick={() => setShowDropdown(!showDropdown)}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className={`custom-dropdown ${showDropdown ? 'show-dropdown' : ''}`}>
                <div className="drop-head"><strong>{user.name}</strong></div>
                <Link to="/profile" className="drop-link" onClick={() => setShowDropdown(false)}>My Profile</Link>
                {isAdmin && <Link to="/admin" className="drop-link" onClick={() => setShowDropdown(false)}>Admin Panel</Link>}
                <button className="drop-logout" onClick={handleLogout}>Logout</button>
              </div>
            </li>
          </>
        ) : (
          <li><Link to="/login" className={location.pathname === '/login' ? 'active' : ''}>Login</Link></li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
