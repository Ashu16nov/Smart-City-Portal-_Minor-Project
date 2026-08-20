import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import RegisterComplaint from './pages/RegisterComplaint';
import Complaints from './pages/Complaints';
import Feedback from './pages/Feedback';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import PublicServices from './pages/PublicServices';
import AdminServices from './pages/AdminServices';
import Emergency from './pages/Emergency';
import Announcements from './pages/Announcements';
import AdminAnnouncements from './pages/AdminAnnouncements';
import Notifications from './pages/Notifications';
import AdminNotifications from './pages/AdminNotifications';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';

const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5005');
function App() {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    if (!sessionStorage.getItem('appInitialized')) {
      localStorage.clear();
      sessionStorage.setItem('appInitialized', 'true');
    }
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
      document.body.classList.remove('admin-theme');
    }
  }, []);

  React.useEffect(() => {
    // Listen for global and user-specific notifications
    const handleNotification = (notif) => {
      toast.info(`🔔 ${notif.title}: ${notif.message}`, {
        position: 'top-right',
        autoClose: 5000,
      });
    };

    socket.on('receiveNotification', handleNotification);
    if (user && user.id) {
      socket.on(`receiveNotification_${user.id}`, handleNotification);
    }

    return () => {
      socket.off('receiveNotification', handleNotification);
      if (user && user.id) {
        socket.off(`receiveNotification_${user.id}`, handleNotification);
      }
    };
  }, [user]);

  return (
    <Router>
      <div className="app-container">
        <Navbar user={user} />
        <main style={{ minHeight: '80vh' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/register" element={<RegisterComplaint />} />
            <Route path="/complaints" element={<Complaints />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/services" element={<PublicServices />} />
            <Route path="/admin/services" element={<AdminServices />} />
            <Route path="/emergency" element={<Emergency />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/admin/announcements" element={<AdminAnnouncements />} />
            <Route path="/notifications" element={user ? <Notifications /> : <Login />} />
            <Route path="/admin/notifications" element={(user && user.role === 'admin') ? <AdminNotifications /> : <Login />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
