import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './Auth.css';

const Login = () => {
  const [currentPanel, setCurrentPanel] = useState('login');
  const [isSignupActive, setIsSignupActive] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [leftContent, setLeftContent] = useState({
    heading: 'Secure Access Portal',
    desc: 'Manage your municipal reports and track civic resolutions with complete transparency.'
  });

  const [formData, setFormData] = useState({
    loginUser: '',
    loginPass: '',
    signupName: '',
    signupUsername: '',
    signupPhone: '',
    signupEmail: '',
    signupPass: '',
    signupConfirm: '',
    forgotEmail: '',
    otpCode: '',
    resetNew: '',
    resetConfirm: ''
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    // Clear error for this field
    setErrors({ ...errors, [e.target.id]: '' });
  };

  const routeToPanel = (panel, heading, desc, animateSlide) => {
    setIsSignupActive(animateSlide);
    // Add a small delay for text change to match animation
    setTimeout(() => {
      setLeftContent({ heading, desc });
      setCurrentPanel(panel);
    }, 200);
    setErrors({});
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    const newErrors = {};
    if (!formData.loginUser) newErrors.loginUser = "Username required";
    if (!formData.loginPass) newErrors.loginPass = "Password required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await api.post('/auth/login', {
        username: formData.loginUser.trim(),
        password: formData.loginPass.trim()
      });
      
      // Strict Role Verification
      const targetRole = isAdminMode ? 'admin' : 'user';
      if (response.data.user.role !== targetRole) {
        setErrors({ loginUser: `Access Denied: Not an authorized ${targetRole} account.` });
        localStorage.clear(); // Clear any partial session
        return;
      }

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      window.location.href = response.data.user.role === 'admin' ? '/admin' : '/';
    } catch (err) {
      setErrors({ loginUser: err.response?.data?.error || "Login failed. Please try again." });
    }
  };

  const handleSignup = async (e) => {
    if (e) e.preventDefault();
    const newErrors = {};
    const { signupName, signupUsername, signupPhone, signupEmail, signupPass, signupConfirm } = formData;
    
    const nameRegex = /^[a-zA-Z\s]+$/;
    const userRegex = /^[a-zA-Z0-9._]+$/;
    const phoneRegex = /^\d{10}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!signupName || !signupName.trim() || !signupName.match(nameRegex)) newErrors.signupName = "Only letters and spaces allowed";
    if (!signupUsername || !signupUsername.trim() || !signupUsername.match(userRegex)) newErrors.signupUsername = "Letters, dots, and underscores only";
    if (!signupPhone || !signupPhone.match(phoneRegex)) newErrors.signupPhone = "Enter exactly 10 digits";
    if (!signupEmail || !signupEmail.match(emailRegex)) newErrors.signupEmail = "Enter a valid email address";
    if (!signupPass || signupPass.length < 6) newErrors.signupPass = "Password must be at least 6 characters";
    if (signupPass !== signupConfirm) newErrors.signupConfirm = "Passwords do not match";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const res = await api.post('/auth/signup', {
        name: signupName.trim(),
        username: signupUsername.trim().toLowerCase(),
        email: signupEmail.trim(),
        phone: signupPhone.trim(),
        password: signupPass
      });
      localStorage.setItem('user', JSON.stringify(res.data.user));
      localStorage.setItem('token', res.data.token);
      window.location.href = '/';
    } catch (err) {
      setErrors({ signupEmail: err.response?.data?.error || 'Signup failed' });
    }
  };

  const handleForgot = (e) => {
    e.preventDefault();
    if (!formData.forgotEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setErrors({ forgotEmail: "Valid email is required" });
    } else {
      routeToPanel('otp', "Two-Step Verification", "We require secondary authentication to protect your sensitive municipal data.", false);
    }
  };

  const handleOtp = (e) => {
    e.preventDefault();
    if (!formData.otpCode.match(/^\d{6}$/)) {
      setErrors({ otpCode: "Must be exactly 6 digits" });
    } else {
      routeToPanel('reset', "Establish Security", "Deploy a strong, unique password to finalize your account recovery.", false);
    }
  };

  const handleReset = (e) => {
    e.preventDefault();
    let passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/;
    if (!formData.resetNew.match(passRegex)) {
      setErrors({ resetNew: "Must contain upper, lower, digit, special char (min 8)" });
    } else if (formData.resetNew !== formData.resetConfirm) {
      setErrors({ resetConfirm: "Passwords do not match" });
    } else {
      alert("Password updated successfully!");
      routeToPanel('login', "Secure Access Portal", "Manage your municipal reports and track civic resolutions with complete transparency.", false);
    }
  };

  const toggleAdminMode = (e) => {
    e.preventDefault();
    setIsAdminMode(!isAdminMode);
  };

  return (
    <div className="login-page-wrapper">
      <div className={`split-container ${isSignupActive ? 'signup-active' : ''}`} id="mainContainer">
        
        <div className="left-panel">
          <h1>{leftContent.heading}</h1>
          <p style={{ maxWidth: '320px' }}>{leftContent.desc}</p>
        </div>

        <div className="right-panels-wrapper">
          
          {/* LOGIN PANEL */}
          <div className={`right-panel-login form-wrapper ${currentPanel === 'login' ? 'active' : ''}`}>
            <h2 style={{ color: isAdminMode ? '#ef4444' : '#0d47a1' }}>{isAdminMode ? 'Admin Login' : 'Citizen Login'}</h2>
            <div className="input-group">
              <input 
                type="text" 
                id="loginUser" 
                placeholder={isAdminMode ? "e.g. admin" : "e.g. Ashu"} 
                className={errors.loginUser ? 'error-bound' : ''}
                value={formData.loginUser}
                onChange={handleInputChange}
              />
              <span className="error-msg">{errors.loginUser}</span>
            </div>

            <div className="input-group">
              <input 
                type="password" 
                id="loginPass" 
                placeholder={isAdminMode ? "e.g. Admin@123" : "e.g. Test@123"} 
                className={errors.loginPass ? 'error-bound' : ''}
                value={formData.loginPass}
                onChange={handleInputChange}
              />
              <span className="error-msg">{errors.loginPass}</span>
            </div>

            <a href="#" className="forgot-link" onClick={() => routeToPanel('forgot', "Password Recovery", "Securely authenticate your identity to regain access to your dashboard.", false)}>Forgot Password?</a>
            <button onClick={handleLogin}>Login to Portal</button>
            <p className="bottom-text">Don't have an account? <a href="#" onClick={() => routeToPanel('signup', "Join Our Community", "Empower your voice. Register today to seamlessly report and resolve municipal issues.", true)}>Create now</a></p>
            <p className="bottom-text">
              <a href="#" onClick={toggleAdminMode} style={{ color: '#64748b', fontSize: '13px', fontWeight: 'bold' }}>
                {isAdminMode ? 'Switch to Citizen Access' : 'Switch to Admin Command'}
              </a>
            </p>
          </div>

          {/* SIGNUP PANEL */}
          <div className={`right-panel-signup form-wrapper ${currentPanel === 'signup' ? 'active' : ''}`}>
            <h2>Start Your Journey</h2>
            <div className="signup-grid">
              <div className="input-group">
                <label htmlFor="signupName">Full Name</label>
                <input type="text" id="signupName" placeholder="e.g. Ashu Kumar" className={errors.signupName ? 'error-bound' : ''} value={formData.signupName} onChange={handleInputChange} />
                <span className="error-msg">{errors.signupName}</span>
              </div>
              <div className="input-group">
                <label htmlFor="signupPhone">Phone Number</label>
                <input type="tel" id="signupPhone" placeholder="e.g. 9876543210" className={errors.signupPhone ? 'error-bound' : ''} value={formData.signupPhone} onChange={handleInputChange} />
                <span className="error-msg">{errors.signupPhone}</span>
              </div>
              <div className="input-group">
                <label htmlFor="signupUsername">Username</label>
                <input type="text" id="signupUsername" placeholder="e.g. Ashu" className={errors.signupUsername ? 'error-bound' : ''} value={formData.signupUsername} onChange={handleInputChange} />
                <span className="error-msg">{errors.signupUsername}</span>
              </div>
              <div className="input-group">
                <label htmlFor="signupEmail">Email Address</label>
                <input type="email" id="signupEmail" placeholder="e.g. ashu@example.com" className={errors.signupEmail ? 'error-bound' : ''} value={formData.signupEmail} onChange={handleInputChange} />
                <span className="error-msg">{errors.signupEmail}</span>
              </div>
              <div className="input-group">
                <label htmlFor="signupPass">Password</label>
                <input type="password" id="signupPass" placeholder="Set a strong password" className={errors.signupPass ? 'error-bound' : ''} value={formData.signupPass} onChange={handleInputChange} />
                <span className="error-msg">{errors.signupPass}</span>
              </div>
              <div className="input-group">
                <label htmlFor="signupConfirm">Confirm Password</label>
                <input type="password" id="signupConfirm" placeholder="Confirm your password" className={errors.signupConfirm ? 'error-bound' : ''} value={formData.signupConfirm} onChange={handleInputChange} />
                <span className="error-msg">{errors.signupConfirm}</span>
              </div>
            </div>
            <button onClick={handleSignup}>Create Account</button>
            <p className="bottom-text">Already have an account? <a href="#" onClick={() => routeToPanel('login', "Secure Access Portal", "Manage your municipal reports and track civic resolutions with complete transparency.", false)}>Login here</a></p>
          </div>

          {/* FORGOT PANEL */}
          <div className={`right-panel-forgot form-wrapper ${currentPanel === 'forgot' ? 'active' : ''}`}>
            <h2>Forgot Password</h2>
            <p className="desc-text" style={{ fontSize: '14px', textAlign: 'center', marginBottom: '15px' }}>Enter your registered email to receive a 6-digit OTP code.</p>
            <div className="input-group">
              <input type="email" id="forgotEmail" placeholder="Email Address" className={errors.forgotEmail ? 'error-bound' : ''} value={formData.forgotEmail} onChange={handleInputChange} />
              <span className="error-msg">{errors.forgotEmail}</span>
            </div>
            <button onClick={handleForgot}>Send OTP</button>
            <p className="bottom-text">Remember your password? <a href="#" onClick={() => routeToPanel('login', "Secure Access Portal", "Manage your municipal reports and track civic resolutions with complete transparency.", false)}>Login here</a></p>
          </div>

          {/* OTP PANEL */}
          <div className={`right-panel-otp form-wrapper ${currentPanel === 'otp' ? 'active' : ''}`}>
            <h2>Verify Identity</h2>
            <p className="desc-text" style={{ fontSize: '14px', textAlign: 'center', marginBottom: '15px' }}>A 6-digit code has been sent to your email.</p>
            <div className="input-group">
              <input type="text" id="otpCode" placeholder="Enter 6-Digit OTP" maxLength="6" className={errors.otpCode ? 'error-bound' : ''} value={formData.otpCode} onChange={handleInputChange} />
              <span className="error-msg">{errors.otpCode}</span>
            </div>
            <button onClick={handleOtp}>Verify OTP</button>
            <p className="bottom-text"><a href="#" onClick={() => routeToPanel('forgot', "Password Recovery", "Securely authenticate your identity to regain access to your dashboard.", false)}>Request another code</a></p>
          </div>

          {/* RESET PANEL */}
          <div className={`right-panel-reset form-wrapper ${currentPanel === 'reset' ? 'active' : ''}`}>
            <h2>Secure Reset</h2>
            <p className="desc-text" style={{ fontSize: '14px', textAlign: 'center', marginBottom: '15px' }}>Please set your brand new password.</p>
            <div className="input-group">
              <input type="password" id="resetNew" placeholder="New Password" className={errors.resetNew ? 'error-bound' : ''} value={formData.resetNew} onChange={handleInputChange} />
              <span className="error-msg">{errors.resetNew}</span>
            </div>
            <div className="input-group">
              <input type="password" id="resetConfirm" placeholder="Confirm New Password" className={errors.resetConfirm ? 'error-bound' : ''} value={formData.resetConfirm} onChange={handleInputChange} />
              <span className="error-msg">{errors.resetConfirm}</span>
            </div>
            <button onClick={handleReset}>Update Password</button>
            <p className="bottom-text">Cancel and return to <a href="#" onClick={() => routeToPanel('login', "Secure Access Portal", "Manage your municipal reports and track civic resolutions with complete transparency.", false)}>Login</a></p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
