import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast, ToastContainer } from 'react-toastify';

const CATEGORIES = [
  'Society Cleanliness', 
  'Maintenance & Services', 
  'Security', 
  'Parking', 
  'Amenities/Clubhouse', 
  'Portal Experience',
  'Other'
];

const Feedback = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  
  // State for Citizens
  const [activeTab, setActiveTab] = useState('Feedback'); // 'Feedback', 'Suggestion', 'MyFeedback'
  const [formData, setFormData] = useState({
    type: 'Feedback',
    rating: '5',
    component: CATEGORIES[0],
    feedback: ''
  });
  const [myFeedbacks, setMyFeedbacks] = useState([]);

  // State for Admins
  const [allFeedbacks, setAllFeedbacks] = useState([]);
  const [report, setReport] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null); // id of feedback being replied to
  const [adminResponseText, setAdminResponseText] = useState('');
  const [adminStatus, setAdminStatus] = useState('Reviewed');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setUser(storedUser);
    if (storedUser?.role === 'admin') {
      setIsAdmin(true);
      fetchFeedbacks();
    } else if (storedUser) {
      fetchMyFeedbacks(storedUser.name); // basic simulation for "My Feedback"
    }
  }, []);

  // --- CITIZEN FUNCTIONS ---

  const handleInputChange = (e) => {
    const { name, value, id } = e.target;
    if (name === 'rating') {
      setFormData({ ...formData, rating: value });
    } else {
      setFormData({ ...formData, [id || name]: value });
    }
  };

  const submitFeedback = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        type: activeTab === 'Suggestion' ? 'Suggestion' : 'Feedback',
        name: user?.name || 'Anonymous Resident',
        date: new Date().toLocaleDateString('en-GB')
      };

      await api.post('/feedbacks', payload);
      toast.success(`${payload.type} submitted successfully!`);
      setFormData({ type: 'Feedback', rating: '5', component: CATEGORIES[0], feedback: '' });
      if (user) fetchMyFeedbacks(user.name);
    } catch (err) {
      toast.error('Error submitting.');
    }
  };

  const fetchMyFeedbacks = async (userName) => {
    try {
      const res = await api.get('/feedbacks');
      // filter on frontend for simplicity
      const mine = res.data.filter(f => f.name === userName);
      setMyFeedbacks(mine);
    } catch (err) {}
  };

  // --- ADMIN FUNCTIONS ---

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/feedbacks');
      setAllFeedbacks(res.data);
    } catch (err) {
      toast.error('Failed to fetch logs.');
    } finally {
      setLoading(false);
    }
  };

  const fetchReport = async () => {
    try {
      const res = await api.get('/feedbacks/report/stats');
      setReport(res.data);
      toast.success('Report generated.');
    } catch (err) {
      toast.error('Failed to generate report.');
    }
  };

  const submitAdminResponse = async (id) => {
    try {
      await api.patch(`/feedbacks/${id}`, { 
        adminResponse: adminResponseText,
        status: adminStatus,
        isRead: true
      });
      toast.success('Response sent.');
      setReplyingTo(null);
      setAdminResponseText('');
      fetchFeedbacks();
    } catch (err) {
      toast.error('Failed to send response.');
    }
  };

  // --- RENDERING ADMIN ---
  if (isAdmin) {
    return (
      <div style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
        <ToastContainer position="top-right" autoClose={3000} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: '#0f172a', margin: 0 }}>Feedback & Suggestions Dashboard</h1>
          <button onClick={fetchReport} style={{ background: '#0ea5e9', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
            📊 Generate Report
          </button>
        </div>

        {report && (
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '30px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '150px', background: '#f8fafc', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#0ea5e9' }}>{report.total}</div>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>TOTAL ENTRIES</div>
            </div>
            <div style={{ flex: 1, minWidth: '150px', background: '#f8fafc', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#eab308' }}>{report.avgRating} ★</div>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>AVG RATING</div>
            </div>
            <div style={{ flex: 1, minWidth: '150px', background: '#f8fafc', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#10b981' }}>{report.feedbackCount}</div>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>FEEDBACKS</div>
            </div>
            <div style={{ flex: 1, minWidth: '150px', background: '#f8fafc', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#a855f7' }}>{report.suggestionsCount}</div>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>SUGGESTIONS</div>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gap: '15px' }}>
          {loading ? <p>Loading...</p> : allFeedbacks.length > 0 ? allFeedbacks.map(f => (
            <div key={f._id} style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', borderLeft: `5px solid ${f.type === 'Suggestion' ? '#a855f7' : '#0ea5e9'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                    <span style={{ fontWeight: '800', color: '#0f172a' }}>{f.name}</span>
                    <span style={{ background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>{f.component}</span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>{f.date}</span>
                    <span style={{ background: f.status === 'Resolved' ? '#dcfce7' : f.status === 'Reviewed' ? '#fef9c3' : '#fee2e2', color: f.status === 'Resolved' ? '#166534' : f.status === 'Reviewed' ? '#854d0e' : '#991b1b', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>{f.status}</span>
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: f.type === 'Suggestion' ? '#a855f7' : '#0ea5e9', marginBottom: '5px' }}>
                    {f.type.toUpperCase()}
                  </div>
                </div>
                {f.type === 'Feedback' && (
                  <div style={{ color: '#eab308', letterSpacing: '2px', fontSize: '14px' }}>
                    {'★'.repeat(parseInt(f.rating))}
                    <span style={{ color: '#e2e8f0' }}>{'★'.repeat(5 - parseInt(f.rating))}</span>
                  </div>
                )}
              </div>
              
              <p style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', margin: '0 0 15px 0', color: '#334155', fontSize: '14px', lineHeight: '1.5' }}>
                {f.feedback}
              </p>

              {f.adminResponse ? (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '15px', borderRadius: '8px', marginTop: '10px' }}>
                  <strong style={{ display: 'block', fontSize: '12px', color: '#166534', marginBottom: '5px' }}>Management Response:</strong>
                  <span style={{ fontSize: '14px', color: '#15803d' }}>{f.adminResponse}</span>
                </div>
              ) : replyingTo === f._id ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                  <textarea 
                    placeholder="Write response..." 
                    value={adminResponseText} 
                    onChange={(e) => setAdminResponseText(e.target.value)} 
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical' }}
                  />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <select value={adminStatus} onChange={(e) => setAdminStatus(e.target.value)} style={{ padding: '8px', borderRadius: '6px' }}>
                      <option value="Reviewed">Mark as Reviewed</option>
                      <option value="Resolved">Mark as Resolved</option>
                    </select>
                    <button onClick={() => submitAdminResponse(f._id)} style={{ background: '#10b981', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Send</button>
                    <button onClick={() => setReplyingTo(null)} style={{ background: '#f1f5f9', color: '#475569', padding: '8px 15px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => { setReplyingTo(f._id); setAdminStatus('Reviewed'); setAdminResponseText(''); }} style={{ background: 'transparent', color: '#0ea5e9', border: '1px solid #bae6fd', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Respond / Update Status
                </button>
              )}
            </div>
          )) : (
            <p style={{ textAlign: 'center', color: '#64748b' }}>No items found.</p>
          )}
        </div>
      </div>
    );
  }

  // --- RENDERING CITIZEN ---
  return (
    <div style={{ padding: '60px 20px', background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div style={{ width: '100%', maxWidth: '600px', marginBottom: '30px' }}>
        <h1 style={{ color: '#0f172a', textAlign: 'center', marginBottom: '10px' }}>Community Feedback & Suggestions</h1>
        <p style={{ color: '#64748b', textAlign: 'center', marginBottom: '30px' }}>Help us improve Ambika Green Phase 1 by sharing your experiences and ideas.</p>
        
        <div style={{ display: 'flex', background: 'white', borderRadius: '12px', padding: '5px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
          <button onClick={() => setActiveTab('Feedback')} style={{ flex: 1, padding: '12px', border: 'none', background: activeTab === 'Feedback' ? '#0ea5e9' : 'transparent', color: activeTab === 'Feedback' ? 'white' : '#64748b', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}>Feedback</button>
          <button onClick={() => setActiveTab('Suggestion')} style={{ flex: 1, padding: '12px', border: 'none', background: activeTab === 'Suggestion' ? '#a855f7' : 'transparent', color: activeTab === 'Suggestion' ? 'white' : '#64748b', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}>Suggestion</button>
          {user && (
            <button onClick={() => setActiveTab('MyFeedback')} style={{ flex: 1, padding: '12px', border: 'none', background: activeTab === 'MyFeedback' ? '#10b981' : 'transparent', color: activeTab === 'MyFeedback' ? 'white' : '#64748b', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}>My Submissions</button>
          )}
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: '600px', background: 'white', borderRadius: '20px', padding: '30px', boxShadow: '0 10px 25px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
        
        {activeTab === 'MyFeedback' ? (
          <div>
            <h2 style={{ fontSize: '20px', color: '#0f172a', margin: '0 0 20px 0' }}>Your Submissions</h2>
            {myFeedbacks.length > 0 ? myFeedbacks.map(f => (
              <div key={f._id} style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', marginBottom: '15px', border: '1px solid #e2e8f0', borderLeft: `4px solid ${f.type === 'Suggestion' ? '#a855f7' : '#0ea5e9'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: f.type === 'Suggestion' ? '#a855f7' : '#0ea5e9' }}>{f.type.toUpperCase()}</span>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>{f.date}</span>
                </div>
                <div style={{ fontSize: '14px', color: '#334155', marginBottom: '10px' }}>{f.feedback}</div>
                {f.adminResponse && (
                  <div style={{ background: '#f0fdf4', padding: '10px', borderRadius: '8px', fontSize: '13px', color: '#166534', border: '1px solid #bbf7d0' }}>
                    <strong>Admin Reply:</strong> {f.adminResponse}
                  </div>
                )}
                <div style={{ marginTop: '10px', fontSize: '11px', fontWeight: 'bold', color: '#64748b' }}>Status: {f.status}</div>
              </div>
            )) : (
              <p style={{ color: '#64748b', textAlign: 'center' }}>You haven't submitted anything yet.</p>
            )}
          </div>
        ) : (
          <form onSubmit={submitFeedback} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {activeTab === 'Feedback' && (
              <div>
                <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '10px' }}>Satisfaction Rating</label>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  {['1', '2', '3', '4', '5'].map(val => (
                    <label key={val} style={{ cursor: 'pointer' }}>
                      <input type="radio" name="rating" value={val} checked={formData.rating === val} onChange={handleInputChange} style={{ display: 'none' }} />
                      <div style={{ fontSize: '32px', color: parseInt(formData.rating) >= parseInt(val) ? '#eab308' : '#cbd5e1', transition: '0.2s' }}>★</div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label htmlFor="component" style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '8px' }}>Category</label>
              <select id="component" value={formData.component} onChange={handleInputChange} style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #cbd5e1', color: '#334155', fontSize: '15px', outline: 'none' }}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label htmlFor="feedback" style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '8px' }}>
                {activeTab === 'Feedback' ? 'Your Feedback' : 'Your Suggestion'}
              </label>
              <textarea 
                id="feedback" 
                placeholder={activeTab === 'Feedback' ? "What did you like or dislike?" : "e.g., Install more street lights near Tower A"} 
                value={formData.feedback} 
                onChange={handleInputChange} 
                required 
                style={{ width: '100%', minHeight: '120px', padding: '14px', borderRadius: '10px', border: '1px solid #cbd5e1', color: '#334155', fontSize: '15px', resize: 'vertical', outline: 'none' }}
              />
            </div>

            <button type="submit" style={{ background: activeTab === 'Feedback' ? '#0ea5e9' : '#a855f7', color: 'white', border: 'none', padding: '16px', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s', marginTop: '10px' }}>
              Submit {activeTab}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Feedback;
