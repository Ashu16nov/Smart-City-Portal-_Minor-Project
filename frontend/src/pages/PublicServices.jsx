import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../utils/api';

const CATEGORIES = [
  'All Categories',
  'Water Supply', 'Electricity', 'Waste Management', 'Public Transport',
  'Hospitals', 'Schools/Colleges', 'Government Offices', 'Banks/ATMs',
  'Police Stations', 'Fire Stations', 'Parks', 'Libraries',
  'Public Toilets', 'Parking', 'Community Centers'
];

const CATEGORY_STYLES = {
  'Water Supply': { icon: '💧', color: '#0284c7', bg: 'linear-gradient(135deg, #e0f2fe, #bae6fd)' },
  'Electricity': { icon: '⚡', color: '#d97706', bg: 'linear-gradient(135deg, #fef3c7, #fde68a)' },
  'Waste Management': { icon: '♻️', color: '#16a34a', bg: 'linear-gradient(135deg, #dcfce7, #bbf7d0)' },
  'Public Transport': { icon: '🚌', color: '#6366f1', bg: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)' },
  'Hospitals': { icon: '🏥', color: '#e11d48', bg: 'linear-gradient(135deg, #ffe4e6, #fecdd3)' },
  'Schools/Colleges': { icon: '🎓', color: '#0d9488', bg: 'linear-gradient(135deg, #ccfbf1, #99f6e4)' },
  'Government Offices': { icon: '🏛️', color: '#475569', bg: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)' },
  'Banks/ATMs': { icon: '💳', color: '#059669', bg: 'linear-gradient(135deg, #d1fae5, #a7f3d0)' },
  'Police Stations': { icon: '🚓', color: '#1d4ed8', bg: 'linear-gradient(135deg, #dbeafe, #bfdbfe)' },
  'Fire Stations': { icon: '🚒', color: '#ea580c', bg: 'linear-gradient(135deg, #ffedd5, #fed7aa)' },
  'Parks': { icon: '🌳', color: '#65a30d', bg: 'linear-gradient(135deg, #ecfccb, #d9f99d)' },
  'Libraries': { icon: '📚', color: '#b45309', bg: 'linear-gradient(135deg, #fef3c7, #fde68a)' },
  'Public Toilets': { icon: '🚻', color: '#0891b2', bg: 'linear-gradient(135deg, #cffafe, #a5f3fc)' },
  'Parking': { icon: '🅿️', color: '#2563eb', bg: 'linear-gradient(135deg, #dbeafe, #bfdbfe)' },
  'Community Centers': { icon: '🤝', color: '#c026d3', bg: 'linear-gradient(135deg, #fae8ff, #f5d0fe)' },
  'default': { icon: '🏢', color: '#0ea5e9', bg: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)' }
};

const PublicServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await api.get('/services');
      setServices(res.data);
    } catch (err) {
      toast.error('Failed to load public services.');
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter(service => {
    const matchesCategory = selectedCategory === 'All Categories' || service.category === selectedCategory;
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (service.location && service.location.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="dashboard-wrapper" style={{ minHeight: '100vh', background: '#e0f7fa', position: 'relative' }}>
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* HEADER SECTION */}
      <div style={{ padding: '60px 60px 40px 60px', textAlign: 'center', background: '#b2ebf2', borderBottom: '1px solid #80deea', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#006064', margin: '0 0 15px 0' }}>Public Services Directory</h1>
        <p style={{ fontSize: '16px', color: '#00838f', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
          Discover essential municipal services, emergency contacts, public facilities, and infrastructure points across the smart city.
        </p>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', paddingBottom: '60px' }}>
        
        {/* CONTROLS */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <input 
              type="text" 
              placeholder="🔍 Search services by name or location..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '14px 20px', borderRadius: '12px', border: '1px solid #80deea', outline: 'none', fontSize: '15px', boxShadow: '0 4px 6px rgba(0,188,212,0.1)' }}
            />
          </div>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ padding: '14px 20px', borderRadius: '12px', border: '1px solid #80deea', outline: 'none', fontSize: '15px', backgroundColor: 'white', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,188,212,0.1)' }}
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* SERVICES OR CATEGORIES GRID */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#00838f', fontWeight: '600' }}>Loading directory...</div>
        ) : (selectedCategory === 'All Categories' && searchTerm === '') ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '24px' }}>
            {CATEGORIES.filter(cat => cat !== 'All Categories').map(category => {
              const style = CATEGORY_STYLES[category] || CATEGORY_STYLES['default'];
              return (
                <div 
                  key={category} 
                  onClick={() => setSelectedCategory(category)}
                  style={{ background: style.bg, borderRadius: '24px', padding: '30px 20px', textAlign: 'center', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.6)', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', transition: 'all 0.3s', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                  onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = `0 15px 30px ${style.color}40`; }}
                  onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)'; }}
                >
                  <div style={{ fontSize: '42px', marginBottom: '15px', background: 'white', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                    {style.icon}
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>{category}</h3>
                  <p style={{ fontSize: '12px', color: style.color, fontWeight: '800', marginTop: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Explore →</p>
                </div>
              );
            })}
          </div>
        ) : (
          <div>
            {selectedCategory !== 'All Categories' && searchTerm === '' && (
              <button 
                onClick={() => setSelectedCategory('All Categories')} 
                style={{ background: 'none', border: 'none', color: '#0ea5e9', fontWeight: '800', fontSize: '15px', cursor: 'pointer', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', padding: 0 }}
              >
                ← Back to Categories
              </button>
            )}

            {filteredServices.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '20px', border: '2px dashed #b2ebf2' }}>
                <div style={{ fontSize: '48px', marginBottom: '15px' }}>📭</div>
                <h3 style={{ color: '#006064', marginBottom: '10px' }}>No Services Found</h3>
                <p style={{ color: '#00838f' }}>We couldn't find any public services matching your criteria.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                {filteredServices.map(service => (
                  <div key={service._id} style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 10px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                      <span style={{ background: '#f0f9ff', color: '#0284c7', padding: '6px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {service.category}
                      </span>
                    </div>
                    
                    <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginBottom: '10px' }}>{service.name}</h3>
                    
                    {service.description && (
                      <p style={{ fontSize: '14px', color: '#475569', marginBottom: '20px', lineHeight: '1.5', flexGrow: 1 }}>
                        {service.description}
                      </p>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: 'auto', paddingTop: '20px', borderTop: '1px dashed #e2e8f0' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <span style={{ fontSize: '16px' }}>📍</span>
                        <div>
                          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Location</div>
                          <div style={{ fontSize: '13px', color: '#1e293b', fontWeight: '500' }}>{service.location}</div>
                        </div>
                      </div>
                      
                      {(service.contactNumber || service.workingHours) && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          {service.contactNumber && (
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                              <span style={{ fontSize: '14px' }}>📞</span>
                              <div>
                                <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Contact</div>
                                <div style={{ fontSize: '12px', color: '#1e293b', fontWeight: '600' }}>{service.contactNumber}</div>
                              </div>
                            </div>
                          )}
                          {service.workingHours && (
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                              <span style={{ fontSize: '14px' }}>🕒</span>
                              <div>
                                <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Hours</div>
                                <div style={{ fontSize: '12px', color: '#1e293b', fontWeight: '600' }}>{service.workingHours}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(service.location)}`} 
                      target="_blank" 
                      rel="noreferrer"
                      style={{ display: 'block', textAlign: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#334155', textDecoration: 'none', padding: '10px', borderRadius: '10px', marginTop: '20px', fontSize: '13px', fontWeight: '700', transition: '0.2s' }}
                      onMouseOver={(e) => { e.currentTarget.style.background = '#e2e8f0' }}
                      onMouseOut={(e) => { e.currentTarget.style.background = '#f8fafc' }}
                    >
                      Get Directions ↗
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicServices;
