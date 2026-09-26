import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';

const SmartParkingPage = () => {
  const [hubs, setHubs] = useState([]);
  const [myReservations, setMyReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHub, setSelectedHub] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  const [bookingForm, setBookingForm] = useState({
    vehicleNumber: '',
    durationHours: 2
  });

  useEffect(() => {
    fetchParkingData();
  }, []);

  const fetchParkingData = async () => {
    try {
      setLoading(true);
      const resH = await api.get('/parking');
      if (resH.data.success) setHubs(resH.data.hubs);

      if (user) {
        const resR = await api.get(`/parking/my-reservations/${user.id || user._id}`);
        if (resR.data.success) setMyReservations(resR.data.reservations);
      }
    } catch (err) {
      toast.error('Failed to fetch parking data');
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.warning('Please log in to reserve a parking spot');
      return;
    }
    if (!selectedHub) return;

    try {
      const res = await api.post('/parking/reserve', {
        spotId: selectedHub.spotId,
        userId: user.id || user._id,
        userName: user.name,
        vehicleNumber: bookingForm.vehicleNumber,
        durationHours: Number(bookingForm.durationHours)
      });

      if (res.data.success) {
        toast.success(`🅿️ Reserved ${res.data.reservation.slotNumber} at ${selectedHub.locationName}!`);
        setShowModal(false);
        setBookingForm({ vehicleNumber: '', durationHours: 2 });
        fetchParkingData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error reserving parking spot');
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 20px' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
        borderRadius: '24px',
        padding: '35px 40px',
        color: 'white',
        boxShadow: '0 10px 30px rgba(37, 99, 235, 0.25)',
        marginBottom: '35px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '42px' }}>🅿️</span>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800' }}>Smart Parking & EV Spot Locator</h1>
            <p style={{ margin: '6px 0 0 0', opacity: 0.9, fontSize: '15px' }}>
              Real-time slot availability, EV charging station locator & instant spot reservation.
            </p>
          </div>
        </div>
      </div>

      {/* Active Reservations Banner if any */}
      {myReservations.length > 0 && (
        <div style={{ marginBottom: '35px' }}>
          <h3 style={{ fontSize: '18px', color: '#0f172a', marginBottom: '15px' }}>🎟️ My Parking Reservations</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat( auto-fit, minmax(300px, 1fr) )', gap: '15px' }}>
            {myReservations.map((r) => (
              <div key={r.bookingId} style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '18px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ background: '#2563eb', color: 'white', padding: '3px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '800' }}>{r.slotNumber}</span>
                  <span style={{ fontSize: '13px', color: '#1e40af', fontWeight: '700' }}>{r.status}</span>
                </div>
                <h4 style={{ margin: '4px 0 2px 0', fontSize: '16px', color: '#1e3a8a' }}>{r.locationName}</h4>
                <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#3b82f6' }}>🚗 Vehicle: <strong>{r.vehicleNumber}</strong></p>
                <div style={{ fontSize: '12px', color: '#1e40af', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #dbeafe', paddingTop: '8px' }}>
                  <span>Duration: {r.durationHours} hrs</span>
                  <span>Amount: ₹{r.totalAmount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Hubs Grid */}
      <h3 style={{ fontSize: '20px', color: '#0f172a', marginBottom: '20px' }}>Live Parking Hubs & Availability</h3>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          <h2>🅿️ Fetching real-time parking slot sensors...</h2>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat( auto-fit, minmax(280px, 1fr) )', gap: '25px' }}>
          {hubs.map((hub) => {
            const isAvailable = hub.availableSlots > 0;
            return (
              <div key={hub.spotId} style={{ background: 'white', borderRadius: '24px', padding: '25px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ background: '#f1f5f9', color: '#475569', padding: '3px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '700' }}>{hub.ward}</span>
                    {hub.isEVChargingAvailable && (
                      <span style={{ background: '#dcfce7', color: '#15803d', padding: '3px 10px', borderRadius: '100px', fontSize: '12px', fontWeight: '800' }}>⚡ EV Charging</span>
                    )}
                  </div>

                  <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', color: '#0f172a' }}>{hub.locationName}</h3>
                  <p style={{ margin: '0 0 15px 0', fontSize: '13px', color: '#64748b' }}>📍 {hub.address}</p>

                  <div style={{ background: isAvailable ? '#f0fdf4' : '#fef2f2', border: `1px solid ${isAvailable ? '#86efac' : '#fca5a5'}`, borderRadius: '16px', padding: '15px', textAlign: 'center', marginBottom: '20px' }}>
                    <div style={{ fontSize: '28px', fontWeight: '900', color: isAvailable ? '#15803d' : '#b91c1c' }}>
                      {hub.availableSlots} / {hub.totalSlots}
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: isAvailable ? '#166534' : '#991b1b', textTransform: 'uppercase', marginTop: '2px' }}>
                      {isAvailable ? 'Slots Available' : 'Full / No Slots'}
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', fontSize: '14px', color: '#334155' }}>
                    <span>Hourly Tariff:</span>
                    <strong style={{ fontSize: '16px', color: '#2563eb' }}>₹{hub.hourlyRate} / hr</strong>
                  </div>

                  <button
                    disabled={!isAvailable}
                    onClick={() => {
                      setSelectedHub(hub);
                      setShowModal(true);
                    }}
                    style={{
                      width: '100%',
                      background: isAvailable ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : '#cbd5e1',
                      color: 'white',
                      padding: '12px',
                      borderRadius: '14px',
                      fontWeight: '700',
                      border: 'none',
                      cursor: isAvailable ? 'pointer' : 'not-allowed',
                      fontSize: '14px',
                      boxShadow: isAvailable ? '0 4px 15px rgba(37, 99, 235, 0.25)' : 'none'
                    }}
                  >
                    {isAvailable ? 'Reserve Parking Spot' : 'Hub Full'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reservation Modal */}
      {showModal && selectedHub && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '30px', width: '100%', maxWidth: '450px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '20px' }}>🅿️ Reserve Parking Slot</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '14px', marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 4px 0', color: '#0f172a' }}>{selectedHub.locationName}</h4>
              <span style={{ fontSize: '13px', color: '#2563eb', fontWeight: '700' }}>Tariff: ₹{selectedHub.hourlyRate} / hour</span>
            </div>

            <form onSubmit={handleReserve} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>Vehicle Registration Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MH 12 AB 1234"
                  value={bookingForm.vehicleNumber}
                  onChange={(e) => setBookingForm({ ...bookingForm, vehicleNumber: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '4px', textTransform: 'uppercase' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>Duration (Hours)</label>
                <select
                  value={bookingForm.durationHours}
                  onChange={(e) => setBookingForm({ ...bookingForm, durationHours: Number(e.target.value) })}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                >
                  <option value={1}>1 Hour (₹{selectedHub.hourlyRate * 1})</option>
                  <option value={2}>2 Hours (₹{selectedHub.hourlyRate * 2})</option>
                  <option value={4}>4 Hours (₹{selectedHub.hourlyRate * 4})</option>
                  <option value={8}>8 Hours (₹{selectedHub.hourlyRate * 8})</option>
                </select>
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '15px', marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '700', color: '#0f172a' }}>Total Amount:</span>
                <span style={{ fontSize: '22px', fontWeight: '900', color: '#2563eb' }}>
                  ₹{selectedHub.hourlyRate * bookingForm.durationHours}
                </span>
              </div>

              <button
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  color: 'white',
                  padding: '12px',
                  borderRadius: '12px',
                  fontWeight: '700',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '15px'
                }}
              >
                Confirm Reservation
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartParkingPage;
