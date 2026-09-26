import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';

const WasteManagement = () => {
  const [pickups, setPickups] = useState([]);
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  const [formData, setFormData] = useState({
    wasteType: 'E-Waste',
    address: '',
    ward: 'Shivaji Nagar',
    preferredDate: new Date().toISOString().split('T')[0],
    preferredSlot: 'Morning (8 AM - 12 PM)',
    notes: ''
  });

  useEffect(() => {
    fetchPickupsAndCenters();
  }, []);

  const fetchPickupsAndCenters = async () => {
    try {
      setLoading(true);
      const reqUrl = user ? `/waste?userId=${user.id || user._id}&role=${user.role}` : '/waste';
      const [resP, resC] = await Promise.all([
        api.get(reqUrl),
        api.get('/waste/centers')
      ]);
      if (resP.data.success) setPickups(resP.data.pickups);
      if (resC.data.success) setCenters(resC.data.centers);
    } catch (err) {
      toast.error('Failed to load waste management data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.warning('Please log in to schedule a pickup');
      return;
    }
    try {
      const res = await api.post('/waste', {
        userId: user.id || user._id,
        userName: user.name,
        userPhone: user.phone || '9876543210',
        ...formData
      });
      if (res.data.success) {
        toast.success(`🎉 Pickup scheduled! Eco-Points: +${res.data.pickup.ecoPointsEarned}`);
        setShowModal(false);
        fetchPickupsAndCenters();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error requesting pickup');
    }
  };

  const totalEcoPoints = pickups.reduce((acc, curr) => acc + (curr.ecoPointsEarned || 0), 0);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 20px' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #15803d, #059669)',
        borderRadius: '24px',
        padding: '35px 40px',
        color: 'white',
        boxShadow: '0 10px 30px rgba(21, 128, 61, 0.25)',
        marginBottom: '35px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '42px' }}>♻️</span>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800' }}>Smart Waste & E-Waste Pickup Portal</h1>
            <p style={{ margin: '6px 0 0 0', opacity: 0.9, fontSize: '15px' }}>
              Schedule door-to-door e-waste/bulk recycling pickups & earn Citizen Eco-Points!
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          style={{
            background: 'white',
            color: '#15803d',
            padding: '12px 24px',
            borderRadius: '100px',
            fontWeight: '800',
            border: 'none',
            cursor: 'pointer',
            fontSize: '15px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          ➕ Schedule Pickup
        </button>
      </div>

      {/* Eco-Points Summary Card */}
      {user && (
        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
          border: '1px solid #86efac',
          borderRadius: '20px',
          padding: '20px 30px',
          marginBottom: '30px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <span style={{ color: '#166534', fontWeight: '700', fontSize: '14px', textTransform: 'uppercase' }}>Citizen Rewards</span>
            <h3 style={{ margin: '4px 0 0 0', color: '#14532d', fontSize: '22px' }}>🌱 Total Eco-Points Balance</h3>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '36px', fontWeight: '900', color: '#15803d' }}>{totalEcoPoints} PTS</span>
            <div style={{ fontSize: '13px', color: '#166534', fontWeight: '600' }}>Badge: Green Eco-Hero 🏅</div>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '30px' }}>
        {/* Left Column: Scheduled Pickups */}
        <div>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '20px', color: '#0f172a' }}>My Pickup Requests</h3>
          {pickups.length === 0 ? (
            <div style={{ background: 'white', padding: '40px', borderRadius: '20px', textAlign: 'center', color: '#64748b', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '36px' }}>📦</span>
              <p style={{ marginTop: '10px' }}>No waste pickup requests scheduled yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {pickups.map((item) => (
                <div key={item._id} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <span style={{ background: '#f1f5f9', color: '#475569', padding: '3px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '700' }}>{item.requestId}</span>
                      <h4 style={{ margin: '6px 0 2px 0', fontSize: '17px', color: '#0f172a' }}>{item.wasteType}</h4>
                      <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>📍 {item.address} ({item.ward})</p>
                    </div>

                    <span style={{
                      padding: '6px 14px',
                      borderRadius: '100px',
                      fontSize: '12px',
                      fontWeight: '800',
                      background: item.status === 'Completed' ? '#dcfce7' : '#fef3c7',
                      color: item.status === 'Completed' ? '#15803d' : '#b45309'
                    }}>
                      {item.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: '#475569', borderTop: '1px solid #f1f5f9', paddingTop: '10px', marginTop: '10px' }}>
                    <span>📅 Date: <strong>{item.preferredDate}</strong></span>
                    <span>⏰ Slot: <strong>{item.preferredSlot}</strong></span>
                    <span>🌱 Eco Points: <strong>+{item.ecoPointsEarned}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Recycling Centers */}
        <div>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '20px', color: '#0f172a' }}>Recycling & Drop-off Centers</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {centers.map((c) => (
              <div key={c.id} style={{ background: 'white', borderRadius: '18px', padding: '18px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>{c.area}</span>
                <h4 style={{ margin: '6px 0 4px 0', fontSize: '15px', color: '#0f172a' }}>{c.name}</h4>
                <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#64748b' }}>📍 {c.address}</p>
                <div style={{ fontSize: '12px', color: '#334155', display: 'flex', justifyContent: 'space-between' }}>
                  <span>📞 {c.contact}</span>
                  <span>🕒 {c.openHours}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '30px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '20px' }}>📅 Schedule Waste Pickup</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>Waste Type</label>
                <select
                  value={formData.wasteType}
                  onChange={(e) => setFormData({ ...formData, wasteType: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                >
                  <option>E-Waste</option>
                  <option>Solid Household Waste</option>
                  <option>Hazardous Chemical Waste</option>
                  <option>Bulk Furniture & Appliances</option>
                  <option>Recyclable Plastic & Paper</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>Pickup Address</label>
                <input
                  type="text"
                  required
                  placeholder="Street / Apartment Number"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>Ward / Locality</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shivaji Nagar"
                  value={formData.ward}
                  onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>Date</label>
                  <input
                    type="date"
                    required
                    value={formData.preferredDate}
                    onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>Time Slot</label>
                  <select
                    value={formData.preferredSlot}
                    onChange={(e) => setFormData({ ...formData, preferredSlot: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                  >
                    <option>Morning (8 AM - 12 PM)</option>
                    <option>Afternoon (12 PM - 4 PM)</option>
                    <option>Evening (4 PM - 7 PM)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #15803d, #059669)',
                  color: 'white',
                  padding: '12px',
                  borderRadius: '12px',
                  fontWeight: '700',
                  border: 'none',
                  cursor: 'pointer',
                  marginTop: '10px'
                }}
              >
                Confirm Request
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WasteManagement;
