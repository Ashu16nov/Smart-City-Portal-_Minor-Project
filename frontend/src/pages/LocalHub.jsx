import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const LocalHub = () => {
  const [businesses, setBusinesses] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Organic Farmers & Kisan Mandi',
    ownerName: '',
    sector: '',
    address: '',
    contactNumber: '',
    description: '',
    productsOffered: ''
  });
  const [message, setMessage] = useState('');

  const categories = [
    'All',
    'Organic Farmers & Kisan Mandi',
    'Handicrafts & Artisans',
    'Mohali Food & Bakeries',
    'Local Services & Tutors',
    'IT Startups & Tech Services'
  ];

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const res = await api.get('/local-hub');
      setBusinesses(res.data);
    } catch (err) {
      console.error('Failed to fetch local listings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/local-hub', formData);
      setMessage('🎉 Business / Farm listing successfully registered in Mohali Smart City Directory!');
      setFormData({
        title: '',
        category: 'Organic Farmers & Kisan Mandi',
        ownerName: '',
        sector: '',
        address: '',
        contactNumber: '',
        description: '',
        productsOffered: ''
      });
      fetchListings();
      setTimeout(() => {
        setMessage('');
        setShowModal(false);
      }, 2500);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to submit listing. Please try again.');
    }
  };

  const filtered = businesses.filter(item => {
    const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.sector.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div style={{ background: '#f8fafc', minHeight: '90vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header Hero Section */}
        <div style={{
          background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
          color: 'white',
          borderRadius: '20px',
          padding: '40px 30px',
          marginBottom: '40px',
          boxShadow: '0 10px 25px rgba(16, 185, 129, 0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div>
            <span style={{
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              🌿 Vocal for Local SAS Nagar
            </span>
            <h1 style={{ fontSize: '32px', margin: '15px 0 10px 0', fontWeight: '800' }}>
              Mohali Local Business & Farmers Hub
            </h1>
            <p style={{ fontSize: '15px', color: '#ecfdf5', maxWidth: '650px', margin: 0, lineHeight: '1.6' }}>
              Supporting organic Kisan Mandis, Punjabi artisans, local home services, and tech startups across Mohali sectors. Connect directly with verified local entrepreneurs.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            style={{
              background: '#ffffff',
              color: '#047857',
              border: 'none',
              borderRadius: '10px',
              padding: '14px 24px',
              fontSize: '15px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            ➕ Register Your Local Business / Farm
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div style={{ marginBottom: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <input
            type="text"
            placeholder="🔍 Search by business name, product, or sector (e.g., Phase 3B2, Phulkari, Organic)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 20px',
              borderRadius: '12px',
              border: '1px solid #cbd5e1',
              fontSize: '15px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
              outline: 'none'
            }}
          />

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: '1px solid',
                  borderColor: selectedCategory === cat ? '#059669' : '#e2e8f0',
                  background: selectedCategory === cat ? '#059669' : '#ffffff',
                  color: selectedCategory === cat ? '#ffffff' : '#475569',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Business Grid */}
        {loading ? (
          <p style={{ textAlign: 'center', color: '#64748b' }}>Loading local Mohali directory...</p>
        ) : filtered.length === 0 ? (
          <div style={{ background: '#fff', padding: '40px', borderRadius: '12px', textAlign: 'center', color: '#64748b' }}>
            No listings found matching your search. Be the first to register a business in this category!
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '25px' }}>
            {filtered.map(item => (
              <div key={item._id} style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '25px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                border: '1px solid #f1f5f9',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <span style={{
                      background: '#ecfdf5',
                      color: '#047857',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '700'
                    }}>
                      {item.badge || 'Mohali Verified'}
                    </span>
                    <span style={{ fontSize: '13px', color: '#f59e0b', fontWeight: 'bold' }}>
                      ⭐ {item.rating || 4.8} / 5.0
                    </span>
                  </div>

                  <h3 style={{ fontSize: '20px', margin: '0 0 8px 0', color: '#0f172a' }}>{item.title}</h3>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 12px 0', fontWeight: '500' }}>
                    👤 <strong>Owner:</strong> {item.ownerName} | 📍 <strong>Sector:</strong> {item.sector}
                  </p>

                  <p style={{ fontSize: '14px', color: '#334155', lineHeight: '1.5', marginBottom: '15px' }}>
                    {item.description}
                  </p>

                  {item.productsOffered && item.productsOffered.length > 0 && (
                    <div style={{ marginBottom: '20px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '6px' }}>PRODUCTS & SERVICES:</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {item.productsOffered.map((prod, idx) => (
                          <span key={idx} style={{
                            background: '#f1f5f9',
                            color: '#334155',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}>
                            • {prod}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '13px', color: '#475569' }}>
                    📍 {item.address}
                  </div>
                  <a
                    href={`tel:${item.contactNumber}`}
                    style={{
                      background: '#059669',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontWeight: 'bold',
                      fontSize: '13px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    📞 Call Vendor
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal for Registration */}
        {showModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '20px'
          }}>
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '30px',
              maxWidth: '550px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, fontSize: '22px', color: '#047857' }}>Register Local Business / Farm</h2>
                <button
                  onClick={() => setShowModal(false)}
                  style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}
                >
                  ✖
                </button>
              </div>

              {message && (
                <div style={{ padding: '12px', background: message.includes('🎉') ? '#dcfce7' : '#fee2e2', color: message.includes('🎉') ? '#15803d' : '#b91c1c', borderRadius: '8px', marginBottom: '15px', fontSize: '14px' }}>
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>Business / Farm Title</label>
                  <input type="text" name="title" required value={formData.title} onChange={handleInputChange} placeholder="e.g. Mohali Organic Greens" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>Category</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                    <option value="Organic Farmers & Kisan Mandi">Organic Farmers & Kisan Mandi</option>
                    <option value="Handicrafts & Artisans">Handicrafts & Artisans</option>
                    <option value="Mohali Food & Bakeries">Mohali Food & Bakeries</option>
                    <option value="Local Services & Tutors">Local Services & Tutors</option>
                    <option value="IT Startups & Tech Services">IT Startups & Tech Services</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>Owner Name</label>
                    <input type="text" name="ownerName" required value={formData.ownerName} onChange={handleInputChange} placeholder="e.g. Balwinder Singh" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>Sector / Zone</label>
                    <input type="text" name="sector" required value={formData.sector} onChange={handleInputChange} placeholder="e.g. Phase 7 / Sector 70" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>Full Address</label>
                  <input type="text" name="address" required value={formData.address} onChange={handleInputChange} placeholder="Shop / Booth / Farm Address..." style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>Contact Phone Number</label>
                  <input type="text" name="contactNumber" required value={formData.contactNumber} onChange={handleInputChange} placeholder="+91 98765 43210" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>Products / Offerings (comma separated)</label>
                  <input type="text" name="productsOffered" value={formData.productsOffered} onChange={handleInputChange} placeholder="e.g. Pure Honey, Organic Wheat, Fresh Milk" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>Description</label>
                  <textarea name="description" rows="3" required value={formData.description} onChange={handleInputChange} placeholder="Describe your products, farm, or services..." style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', resize: 'none' }}></textarea>
                </div>

                <button
                  type="submit"
                  style={{
                    background: '#059669',
                    color: 'white',
                    padding: '12px',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    fontSize: '15px',
                    cursor: 'pointer',
                    marginTop: '10px'
                  }}
                >
                  Submit Listing Registration
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default LocalHub;
