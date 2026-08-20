import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  
  // Modal State
  const [selectedService, setSelectedService] = useState(null);

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
    
    if (!searchTerm) return matchesCategory;
    
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (service.name && service.name.toLowerCase().includes(searchLower)) ||
      (service.location && service.location.toLowerCase().includes(searchLower)) ||
      (service.area && service.area.toLowerCase().includes(searchLower)) ||
      (service.landmark && service.landmark.toLowerCase().includes(searchLower)) ||
      (service.description && service.description.toLowerCase().includes(searchLower)) ||
      (service.facilities && service.facilities.some(f => f.toLowerCase().includes(searchLower))) ||
      (service.servicesOffered && service.servicesOffered.some(s => s.toLowerCase().includes(searchLower)));
      
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="dashboard-wrapper" style={{ minHeight: '100vh', background: '#e0f7fa', position: 'relative' }}>
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* HEADER SECTION */}
      <div style={{ padding: '60px 60px 40px 60px', textAlign: 'center', background: '#b2ebf2', borderBottom: '1px solid #80deea', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#006064', margin: '0 0 15px 0' }}>Public Services Directory</h1>
        <p style={{ fontSize: '16px', color: '#00838f', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
          Discover essential society services, emergency contacts, public facilities, and infrastructure points across Ambika Green Phase 1.
        </p>
        <div style={{ marginTop: '25px' }}>
          <Link to="/register" style={{ display: 'inline-block', padding: '14px 28px', background: '#0ea5e9', color: 'white', textDecoration: 'none', borderRadius: '100px', fontWeight: '800', fontSize: '16px', boxShadow: '0 4px 15px rgba(14,165,233,0.3)', transition: 'transform 0.2s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
            Raise Complaint 📝
          </Link>
        </div>
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {filteredServices.map(service => (
                  <div key={service._id} style={{ background: 'white', borderRadius: '16px', padding: '30px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
                      <div style={{ flex: 1, minWidth: '300px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                          <span style={{ background: '#f0f9ff', color: '#0284c7', padding: '6px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {service.category}
                          </span>
                          {service.status && (
                            <span style={{ background: service.status === 'Available' || service.status === 'Open' ? '#dcfce7' : '#fee2e2', color: service.status === 'Available' || service.status === 'Open' ? '#166534' : '#991b1b', padding: '6px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>
                              {service.status}
                            </span>
                          )}
                        </div>
                        <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 10px 0' }}>{service.name}</h3>
                        {service.description && (
                          <p style={{ fontSize: '15px', color: '#475569', margin: 0, lineHeight: '1.6' }}>
                            {service.description}
                          </p>
                        )}
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '200px' }}>
                        <button 
                          onClick={() => setSelectedService(service)}
                          style={{ width: '100%', background: '#0ea5e9', border: 'none', color: 'white', padding: '12px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', transition: '0.2s', boxShadow: '0 4px 6px rgba(14, 165, 233, 0.2)' }}
                          onMouseOver={(e) => { e.currentTarget.style.background = '#0284c7' }}
                          onMouseOut={(e) => { e.currentTarget.style.background = '#0ea5e9' }}
                        >
                          View Full Details
                        </button>
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(service.location)}`} 
                          target="_blank" 
                          rel="noreferrer"
                          style={{ display: 'block', textAlign: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#334155', textDecoration: 'none', padding: '12px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: '700', transition: '0.2s' }}
                          onMouseOver={(e) => { e.currentTarget.style.background = '#e2e8f0' }}
                          onMouseOut={(e) => { e.currentTarget.style.background = '#f8fafc' }}
                        >
                          Get Directions ↗
                        </a>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', paddingTop: '20px', borderTop: '1px dashed #e2e8f0' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <span style={{ fontSize: '18px' }}>📍</span>
                        <div>
                          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Location</div>
                          <div style={{ fontSize: '14px', color: '#1e293b', fontWeight: '600' }}>{service.location}</div>
                        </div>
                      </div>
                      
                      {service.contactNumber && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                          <span style={{ fontSize: '18px' }}>📞</span>
                          <div>
                            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Contact</div>
                            <div style={{ fontSize: '14px', color: '#1e293b', fontWeight: '600' }}>{service.contactNumber}</div>
                          </div>
                        </div>
                      )}
                      
                      {service.workingHours && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                          <span style={{ fontSize: '18px' }}>🕒</span>
                          <div>
                            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Hours</div>
                            <div style={{ fontSize: '14px', color: '#1e293b', fontWeight: '600' }}>{service.workingHours}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* SERVICE DETAILS MODAL */}
      {selectedService && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }} onClick={() => setSelectedService(null)}>
          <div style={{ background: 'white', width: '100%', maxWidth: '700px', maxHeight: '90vh', borderRadius: '24px', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div style={{ padding: '30px', borderBottom: '1px solid #e2e8f0', background: CATEGORY_STYLES[selectedService.category]?.bg || CATEGORY_STYLES['default'].bg, borderRadius: '24px 24px 0 0', position: 'relative' }}>
              <button 
                onClick={() => setSelectedService(null)}
                style={{ position: 'absolute', top: '20px', right: '20px', background: 'white', border: 'none', width: '36px', height: '36px', borderRadius: '50%', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
              >
                ✕
              </button>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ fontSize: '32px', background: 'white', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                  {CATEGORY_STYLES[selectedService.category]?.icon || CATEGORY_STYLES['default'].icon}
                </div>
                <div>
                  <span style={{ display: 'inline-block', background: 'white', color: CATEGORY_STYLES[selectedService.category]?.color || '#0ea5e9', padding: '4px 10px', borderRadius: '100px', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '5px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    {selectedService.category}
                  </span>
                  <h2 style={{ margin: 0, color: '#0f172a', fontSize: '24px', fontWeight: '900' }}>{selectedService.name}</h2>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '30px' }}>
              
              {/* Status & Highlights */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '25px' }}>
                {selectedService.status && (
                  <div style={{ background: selectedService.status === 'Available' || selectedService.status === 'Open' ? '#dcfce7' : '#fee2e2', color: selectedService.status === 'Available' || selectedService.status === 'Open' ? '#166534' : '#991b1b', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: selectedService.status === 'Available' || selectedService.status === 'Open' ? '#22c55e' : '#ef4444' }}></span>
                    {selectedService.status}
                  </div>
                )}
                {selectedService.workingHours && (
                  <div style={{ background: '#f1f5f9', color: '#475569', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: '600' }}>
                    🕒 {selectedService.workingHours}
                  </div>
                )}
              </div>

              {/* Descriptions */}
              <div style={{ marginBottom: '30px' }}>
                <p style={{ color: '#334155', fontSize: '16px', lineHeight: '1.6', fontWeight: '500', marginBottom: '10px' }}>{selectedService.description}</p>
                {selectedService.detailedDescription && (
                  <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.6' }}>{selectedService.detailedDescription}</p>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '30px' }}>
                {/* Location Info */}
                <div>
                  <h4 style={{ fontSize: '14px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>📍 Location Details</h4>
                  <p style={{ margin: '0 0 10px 0', color: '#1e293b', fontSize: '14px', lineHeight: '1.5' }}><strong>Address:</strong><br/>{selectedService.address || selectedService.location}</p>
                  {selectedService.area && <p style={{ margin: '0 0 10px 0', color: '#1e293b', fontSize: '14px' }}><strong>Area:</strong> {selectedService.area}</p>}
                  {selectedService.landmark && <p style={{ margin: '0 0 10px 0', color: '#1e293b', fontSize: '14px' }}><strong>Landmark:</strong> {selectedService.landmark}</p>}
                </div>

                {/* Contact Info */}
                <div>
                  <h4 style={{ fontSize: '14px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>📞 Contact Info</h4>
                  {selectedService.contactNumber && <p style={{ margin: '0 0 10px 0', color: '#1e293b', fontSize: '14px' }}><strong>Phone:</strong> <a href={`tel:${selectedService.contactNumber}`} style={{ color: '#0ea5e9', textDecoration: 'none' }}>{selectedService.contactNumber}</a></p>}
                  {selectedService.emergencyPhone && <p style={{ margin: '0 0 10px 0', color: '#1e293b', fontSize: '14px' }}><strong>Emergency:</strong> <a href={`tel:${selectedService.emergencyPhone}`} style={{ color: '#ef4444', textDecoration: 'none', fontWeight: 'bold' }}>{selectedService.emergencyPhone}</a></p>}
                  {selectedService.email && <p style={{ margin: '0 0 10px 0', color: '#1e293b', fontSize: '14px' }}><strong>Email:</strong> <a href={`mailto:${selectedService.email}`} style={{ color: '#0ea5e9', textDecoration: 'none' }}>{selectedService.email}</a></p>}
                  {selectedService.website && <p style={{ margin: '0 0 10px 0', color: '#1e293b', fontSize: '14px' }}><strong>Website:</strong> <a href={selectedService.website} target="_blank" rel="noreferrer" style={{ color: '#0ea5e9', textDecoration: 'none' }}>Visit Portal ↗</a></p>}
                </div>
              </div>

              {/* Arrays Info */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                {selectedService.servicesOffered && selectedService.servicesOffered.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '14px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>⚙️ Services Offered</h4>
                    <ul style={{ paddingLeft: '20px', margin: 0, color: '#334155', fontSize: '14px' }}>
                      {selectedService.servicesOffered.map((srv, idx) => <li key={idx} style={{ marginBottom: '5px' }}>{srv}</li>)}
                    </ul>
                  </div>
                )}
                
                {selectedService.facilities && selectedService.facilities.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '14px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>🏢 Facilities</h4>
                    <ul style={{ paddingLeft: '20px', margin: 0, color: '#334155', fontSize: '14px' }}>
                      {selectedService.facilities.map((fac, idx) => <li key={idx} style={{ marginBottom: '5px' }}>{fac}</li>)}
                    </ul>
                  </div>
                )}

                {selectedService.requirements && selectedService.requirements.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '14px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>📋 Requirements</h4>
                    <ul style={{ paddingLeft: '20px', margin: 0, color: '#334155', fontSize: '14px' }}>
                      {selectedService.requirements.map((req, idx) => <li key={idx} style={{ marginBottom: '5px' }}>{req}</li>)}
                    </ul>
                  </div>
                )}
              </div>

              {selectedService.fees && (
                <div style={{ marginBottom: '30px', background: '#f8fafc', padding: '15px', borderRadius: '12px', borderLeft: '4px solid #94a3b8' }}>
                  <span style={{ fontWeight: 'bold', color: '#475569', fontSize: '14px' }}>💰 Applicable Fees:</span> 
                  <span style={{ color: '#1e293b', fontSize: '14px', marginLeft: '10px' }}>{selectedService.fees}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', borderTop: '1px solid #e2e8f0', paddingTop: '25px' }}>
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedService.address || selectedService.location)}`}
                  target="_blank" 
                  rel="noreferrer"
                  style={{ flex: 1, minWidth: '150px', textAlign: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#334155', textDecoration: 'none', padding: '14px', borderRadius: '12px', fontSize: '14px', fontWeight: '700', transition: '0.2s' }}
                >
                  Get Directions ↗
                </a>
                
                {selectedService.contactNumber && (
                  <a 
                    href={`tel:${selectedService.contactNumber}`}
                    style={{ flex: 1, minWidth: '150px', textAlign: 'center', background: '#e0f2fe', border: '1px solid #bae6fd', color: '#0369a1', textDecoration: 'none', padding: '14px', borderRadius: '12px', fontSize: '14px', fontWeight: '700', transition: '0.2s' }}
                  >
                    📞 Call Service
                  </a>
                )}

                {selectedService.emergencyPhone && (
                  <a 
                    href={`tel:${selectedService.emergencyPhone}`}
                    style={{ flex: 1, minWidth: '150px', textAlign: 'center', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', textDecoration: 'none', padding: '14px', borderRadius: '12px', fontSize: '14px', fontWeight: '700', transition: '0.2s' }}
                  >
                    🚨 Emergency
                  </a>
                )}

                {selectedService.complaintType && (
                  <a 
                    href={`/register?category=${encodeURIComponent(selectedService.complaintType)}`}
                    style={{ flex: 1, minWidth: '150px', textAlign: 'center', background: '#0ea5e9', border: 'none', color: 'white', textDecoration: 'none', padding: '14px', borderRadius: '12px', fontSize: '14px', fontWeight: '700', transition: '0.2s' }}
                  >
                    ⚠️ Report Issue
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicServices;
