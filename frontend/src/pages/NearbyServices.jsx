import React, { useState } from 'react';
import './Auth.css';

const NearbyServices = () => {
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Hospital', 'Police', 'Fire', 'Utilities'];

  const mockLocations = [
    { id: 1, name: 'Fortis Hospital Mohali', category: 'Hospital', distance: '1.2 km', contact: '0172-469-2222', address: 'Sector 62, Phase 8, Mohali' },
    { id: 2, name: 'Max Super Speciality Hospital', category: 'Hospital', distance: '2.5 km', contact: '0172-521-2000', address: 'Phase 6, Mohali' },
    { id: 3, name: 'Sohana Hospital', category: 'Hospital', distance: '3.0 km', contact: '0172-229-5000', address: 'Sector 77, S.A.S. Nagar' },
    { id: 4, name: 'Police Station Phase 1', category: 'Police', distance: '0.8 km', contact: '112', address: 'Phase 1, Mohali' },
    { id: 5, name: 'Women Police Station', category: 'Police', distance: '1.5 km', contact: '1091', address: 'Phase 4, Mohali' },
    { id: 6, name: 'Fire Station Phase 1', category: 'Fire', distance: '1.0 km', contact: '101', address: 'Phase 1 Industrial Area, Mohali' },
    { id: 7, name: 'PSPCL Electricity Office', category: 'Utilities', distance: '1.4 km', contact: '1912', address: 'Phase 1, Mohali' },
    { id: 8, name: 'Municipal Corporation Office', category: 'Utilities', distance: '2.2 km', contact: '1800-137-0007', address: 'Sector 68, Mohali' }
  ];

  const filtered = activeCategory === 'All' ? mockLocations : mockLocations.filter(loc => loc.category === activeCategory);

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1100px', margin: '0 auto', fontFamily: "'Inter', sans-serif", minHeight: '80vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', color: '#0f172a', marginBottom: '10px', fontWeight: '800' }}>Nearby Essential Services 📍</h1>
        <p style={{ color: '#64748b', fontSize: '16px' }}>Find hospitals, police stations, and utilities near Ambika Green Phase 1, Mohali.</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '40px', flexWrap: 'wrap' }}>
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '10px 25px', borderRadius: '30px', fontWeight: 'bold', fontSize: '14px', border: 'none', cursor: 'pointer', transition: '0.2s',
              background: activeCategory === cat ? '#0ea5e9' : '#f1f5f9',
              color: activeCategory === cat ? 'white' : '#475569',
              boxShadow: activeCategory === cat ? '0 4px 15px rgba(14, 165, 233, 0.3)' : 'none'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' }}>
        {filtered.map(loc => (
          <div key={loc.id} style={{ background: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
              <div style={{ background: '#f0f9ff', color: '#0ea5e9', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                {loc.category}
              </div>
              <div style={{ background: '#f8fafc', color: '#64748b', padding: '5px 10px', borderRadius: '10px', fontSize: '13px', fontWeight: 'bold' }}>
                📍 {loc.distance}
              </div>
            </div>
            <h3 style={{ margin: '0 0 10px 0', color: '#0f172a', fontSize: '20px' }}>{loc.name}</h3>
            <p style={{ margin: '0 0 15px 0', color: '#64748b', fontSize: '14px', lineHeight: '1.5' }}>{loc.address}</p>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: '#f8fafc', borderRadius: '12px' }}>
              <span style={{ fontSize: '18px' }}>📞</span>
              <a href={`tel:${loc.contact}`} style={{ fontWeight: 'bold', color: '#0ea5e9', textDecoration: 'none', fontSize: '15px' }}>{loc.contact}</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NearbyServices;
