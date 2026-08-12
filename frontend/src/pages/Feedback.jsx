import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast, ToastContainer } from 'react-toastify';

const Feedback = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    rating: '5',
    component: 'Dashboard',
    feedback: ''
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.role === 'admin') {
      setIsAdmin(true);
      fetchFeedbacks();
    }
  }, []);

  const fetchFeedbacks = async () => {
    const cached = sessionStorage.getItem('feedbacksCache');
    if (cached) {
      setFeedbacks(JSON.parse(cached));
    } else {
      setLoading(true);
    }
    
    try {
      const res = await api.get('/feedbacks');
      setFeedbacks(res.data);
      sessionStorage.setItem('feedbacksCache', JSON.stringify(res.data));
    } catch (err) {
      toast.error('Failed to fetch user feedback logs.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, id } = e.target;
    if (name === 'rating') {
      setFormData({ ...formData, rating: value });
    } else {
      setFormData({ ...formData, [id]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const payload = {
        ...formData,
        name: user?.name || 'Anonymous Citizen',
        date: new Date().toLocaleDateString('en-GB')
      };

      await api.post('/feedbacks', payload);
      toast.success('Feedback submitted successfully!');
      setFormData({ rating: '5', component: 'Dashboard', feedback: '' });
    } catch (err) {
      toast.error('Error: ' + (err.response?.data?.error || 'Failed to submit feedback'));
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/feedbacks/${id}`, { isRead: true });
      setFeedbacks(prev => prev.map(f => f._id === id ? { ...f, isRead: true } : f));
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  const deleteFeedback = async (id) => {
    if (!window.confirm("Delete this feedback permanently?")) return;
    try {
      await api.delete(`/feedbacks/${id}`);
      setFeedbacks(prev => prev.filter(f => f._id !== id));
      toast.success('Feedback deleted.');
    } catch (err) {
      toast.error('Failed to delete.');
    }
  };

  if (isAdmin) {
    return (
      <div className="dashboard-wrapper" style={{ background: '#e0f7fa', minHeight: '100vh' }}>
        <ToastContainer position="top-right" autoClose={3000} />
        <header style={{ padding: '30px 20px', background: '#fff', borderBottom: '1px solid #f1f3f5', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 style={{ color: '#1a1b1e', fontSize: '1.6rem', fontWeight: '800', margin: '0 0 5px 0' }}>Citizen Feedback Logs</h2>
          <p style={{ color: '#909296', fontSize: '14px', margin: 0 }}>Review and manage municipal service ratings.</p>
        </header>

        <div style={{ maxWidth: '900px', margin: '30px auto', padding: '0 20px' }}>
          {loading ? (
             <div style={{ textAlign: 'center', padding: '50px', color: '#adb5bd' }}>Searching logs...</div>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {feedbacks.length > 0 ? (
                feedbacks.map(f => (
                  <div key={f._id} style={{ 
                    background: 'white', 
                    borderRadius: '12px', 
                    border: '1px solid #e9ecef', 
                    padding: '16px 20px', 
                    borderLeft: `5px solid ${f.isRead ? '#dee2e6' : '#fd7e14'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.01)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: '700', fontSize: '13px', color: '#495057' }}>{f.name}</span>
                        <span style={{ background: '#f1f3f5', color: '#495057', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '700' }}>{f.component}</span>
                        <span style={{ fontSize: '10px', color: '#adb5bd' }}>• {f.date}</span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#fcc419', letterSpacing: '1px' }}>
                        {'★'.repeat(parseInt(f.rating))}
                        <span style={{ color: '#e9ecef' }}>{'★'.repeat(5 - parseInt(f.rating))}</span>
                      </div>
                    </div>

                    <p style={{ color: '#495057', fontSize: '13px', lineHeight: '1.5', margin: '0', background: '#f8f9fa', padding: '12px', borderRadius: '8px' }}>
                      {f.feedback}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      {!f.isRead && (
                        <button 
                          onClick={() => markAsRead(f._id)}
                          style={{ background: 'transparent', color: '#2b8a3e', border: '1px solid #b2f2bb', padding: '5px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                        >
                          Mark Viewed
                        </button>
                      )}
                      <button 
                        onClick={() => deleteFeedback(f._id)}
                        style={{ background: 'transparent', color: '#c92a2a', border: '1px solid #ffc9c9', padding: '5px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '60px', color: '#adb5bd' }}>
                  <p style={{ fontSize: '14px' }}>No user feedback recorded yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '60px 20px', background: '#e0f7fa', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
      <ToastContainer position="top-center" autoClose={3000} />
      <div style={{ width: '100%', maxWidth: '440px', background: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 10px 25px rgba(0,0,0,0.03)', border: '1px solid #e9ecef' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#212529', margin: '0 0 10px 0' }}>Share Your Experience</h2>
          <p style={{ color: '#868e96', fontSize: '14px', margin: 0 }}>Help us improve Bihar's digital infrastructure.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '800', color: '#495057', textTransform: 'uppercase', marginBottom: '10px', display: 'block' }}>Satisfaction Level</label>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '10px', background: '#f8f9fa', borderRadius: '12px' }}>
              {['1', '2', '3', '4', '5'].map(val => (
                <label key={val} style={{ textAlign: 'center', cursor: 'pointer', flex: 1 }}>
                  <input type="radio" name="rating" value={val} checked={formData.rating === val} onChange={handleInputChange} style={{ display: 'none' }} />
                  <div style={{ 
                    fontSize: '32px',
                    color: parseInt(formData.rating) >= parseInt(val) ? '#fcc419' : '#dee2e6',
                    textShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    transition: 'color 0.2s, transform 0.1s',
                    transform: formData.rating === val ? 'scale(1.1)' : 'scale(1)'
                  }}>
                    ★
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="component" style={{ fontSize: '12px', fontWeight: '800', color: '#495057', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Area of Impact</label>
            <select id="component" value={formData.component} onChange={handleInputChange} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #dee2e6', color: '#495057', fontSize: '14px', outline: 'none', background: '#fff' }}>
              <option value="Dashboard">📊 Management Dashboard</option>
              <option value="Registration">📝 Complaint Registration</option>
              <option value="Tracking">🔍 Real-time Tracking</option>
              <option value="UI Design">🎨 UI/UX Interface</option>
            </select>
          </div>

          <div>
            <label htmlFor="feedback" style={{ fontSize: '12px', fontWeight: '800', color: '#495057', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Your Observations</label>
            <textarea 
              id="feedback" 
              placeholder="What can we do better?" 
              value={formData.feedback} 
              onChange={handleInputChange} 
              required 
              style={{ width: '100%', minHeight: '120px', padding: '15px', borderRadius: '12px', border: '1px solid #dee2e6', color: '#495057', fontSize: '14px', resize: 'none', outline: 'none' }}
            />
          </div>

          <button type="submit" style={{ background: '#212529', color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s', marginTop: '10px' }}>
            Submit Performance Report
          </button>
        </form>
      </div>
    </div>
  );
};

export default Feedback;
