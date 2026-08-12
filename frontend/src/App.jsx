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
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
