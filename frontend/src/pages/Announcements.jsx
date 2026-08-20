import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CATEGORIES = ['All Categories', 'RWA Notice', 'Maintenance', 'Power/Water Interruption', 'Events', 'Security Alert', 'Other'];

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/announcements/public');
      setAnnouncements(res.data);
    } catch (err) {
      toast.error('Failed to load announcements.');
    } finally {
      setLoading(false);
    }
  };

  const filteredAnnouncements = announcements.filter(ann => {
    const matchesCategory = selectedCategory === 'All Categories' || ann.category === selectedCategory;
    const matchesSearch = ann.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          ann.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const importantAnnouncements = filteredAnnouncements.filter(ann => ann.isImportant);
  const regularAnnouncements = filteredAnnouncements.filter(ann => !ann.isImportant);

  const renderAnnouncementCard = (ann, isPinned = false) => (
    <div key={ann._id} style={{
      background: 'white',
      borderRadius: '16px',
      padding: '25px',
      marginBottom: '20px',
      boxShadow: isPinned ? '0 10px 25px rgba(239,68,68,0.15)' : '0 4px 15px rgba(0,0,0,0.05)',
      border: isPinned ? '2px solid #fca5a5' : '1px solid #e2e8f0',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {isPinned && (
        <div style={{ position: 'absolute', top: 0, right: 0, background: '#ef4444', color: 'white', padding: '5px 15px', borderBottomLeftRadius: '16px', fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px' }}>
          📌 PINNED
        </div>
      )}
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
        <span style={{ background: '#f0f9ff', color: '#0284c7', padding: '4px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: 'bold' }}>
          {ann.category}
        </span>
        <span style={{ color: '#94a3b8', fontSize: '13px' }}>
          {new Date(ann.publishDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
        </span>
      </div>
      
      <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: '0 0 10px 0' }}>{ann.title}</h3>
      <p style={{ fontSize: '15px', color: '#475569', lineHeight: '1.6', whiteSpace: 'pre-wrap', margin: 0 }}>
        {ann.description}
      </p>
    </div>
  );

  return (
    <div className="dashboard-wrapper" style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: '60px' }}>
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div style={{ padding: '60px 20px 40px 20px', textAlign: 'center', background: 'linear-gradient(135deg, #e0f2fe, #bae6fd)', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '900', color: '#0369a1', margin: '0 0 15px 0' }}>📢 Notice Board</h1>
        <p style={{ fontSize: '16px', color: '#0284c7', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
          Stay updated with the latest announcements, maintenance schedules, and events from Ambika Green Society Management.
        </p>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Filters */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="🔍 Search announcements..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1, minWidth: '250px', padding: '14px 20px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
          />
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ padding: '14px 20px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '15px', backgroundColor: 'white', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
          >
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading announcements...</div>
        ) : filteredAnnouncements.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
            <div style={{ fontSize: '40px', marginBottom: '15px' }}>📭</div>
            <h3 style={{ color: '#475569', margin: '0 0 10px 0' }}>No Announcements Found</h3>
            <p style={{ color: '#94a3b8', margin: 0 }}>There are no notices matching your criteria.</p>
          </div>
        ) : (
          <div>
            {importantAnnouncements.length > 0 && (
              <div style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '18px', color: '#ef4444', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></span>
                  Important Notices
                </h2>
                {importantAnnouncements.map(ann => renderAnnouncementCard(ann, true))}
              </div>
            )}

            {regularAnnouncements.length > 0 && (
              <div>
                <h2 style={{ fontSize: '18px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#94a3b8' }}></span>
                  Recent Updates
                </h2>
                {regularAnnouncements.map(ann => renderAnnouncementCard(ann, false))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Announcements;
