import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../utils/api';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      toast.error("Please login to view your bookings.");
      navigate('/login');
      return;
    }
    fetchBookings();
  }, [navigate]);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/cabs/my-bookings');
      setBookings(res.data);
    } catch (err) {
      toast.error('Failed to fetch bookings.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    try {
      await api.put(`/cabs/cancel/${id}`);
      toast.success('Booking cancelled successfully.');
      setSelectedBooking(null);
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to cancel booking.');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'BOOKED': return { bg: '#e0f2fe', color: '#0369a1' };
      case 'DRIVER_ASSIGNED': return { bg: '#fef3c7', color: '#92400e' };
      case 'COMPLETED': return { bg: '#dcfce7', color: '#166534' };
      case 'CANCELLED': return { bg: '#fee2e2', color: '#991b1b' };
      default: return { bg: '#f1f5f9', color: '#475569' };
    }
  };

  return (
    <div className="dashboard-wrapper" style={{ minHeight: '100vh', padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '900', color: 'var(--text-primary)', margin: 0 }}>🚕 My Bookings</h1>
        <button onClick={() => navigate('/cab-booking')} style={{ background: '#0f172a', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '100px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
          + New Booking
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading your bookings...</div>
      ) : bookings.length === 0 ? (
        <div style={{ background: 'var(--bg-surface)', padding: '60px 20px', textAlign: 'center', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>🚖</div>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '10px', fontSize: '20px', fontWeight: '800' }}>No Bookings Yet</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>You haven't made any cab bookings yet.</p>
          <button onClick={() => navigate('/cab-booking')} style={{ background: '#0ea5e9', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '100px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }}>
            Book a Cab Now
          </button>
        </div>
      ) : (
        <div style={{ background: 'var(--bg-surface)', borderRadius: '20px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '15px 20px', fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>Booking ID</th>
                  <th style={{ padding: '15px 20px', fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>Route</th>
                  <th style={{ padding: '15px 20px', fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>Fare</th>
                  <th style={{ padding: '15px 20px', fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>Status</th>
                  <th style={{ padding: '15px 20px', fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => {
                  const sColor = getStatusColor(b.status);
                  return (
                    <tr key={b._id} style={{ borderBottom: '1px solid var(--border-color)', transition: '0.2s', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.background = 'var(--bg-main)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'} onClick={() => setSelectedBooking(b)}>
                      <td style={{ padding: '15px 20px', fontWeight: '700', color: 'var(--text-primary)', fontSize: '14px' }}>
                        {b.bookingId}
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '500', marginTop: '4px' }}>
                          {new Date(b.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td style={{ padding: '15px 20px' }}>
                        <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: '600' }}>{b.pickup}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          ↓ {b.destination}
                        </div>
                      </td>
                      <td style={{ padding: '15px 20px', fontWeight: '800', color: '#16a34a', fontSize: '15px' }}>
                        ₹{b.totalFare}
                      </td>
                      <td style={{ padding: '15px 20px' }}>
                        <span style={{ background: sColor.bg, color: sColor.color, padding: '6px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: '800' }}>
                          {b.status}
                        </span>
                      </td>
                      <td style={{ padding: '15px 20px', textAlign: 'right' }}>
                        <button onClick={(e) => { e.stopPropagation(); setSelectedBooking(b); }} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
                          View
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedBooking && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }} onClick={() => setSelectedBooking(null)}>
          <div style={{ background: 'var(--bg-surface)', width: '100%', maxWidth: '500px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '25px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text-primary)', margin: '0 0 5px 0' }}>Booking Details</h2>
                <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>{selectedBooking.bookingId}</span>
              </div>
              <button onClick={() => setSelectedBooking(null)} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-secondary)' }}>✕</button>
            </div>
            
            <div style={{ padding: '25px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ background: getStatusColor(selectedBooking.status).bg, color: getStatusColor(selectedBooking.status).color, padding: '6px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: '800' }}>
                  {selectedBooking.status}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                  {new Date(selectedBooking.createdAt).toLocaleString()}
                </span>
              </div>

              <div style={{ background: 'var(--bg-main)', padding: '20px', borderRadius: '16px', marginBottom: '20px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px', marginBottom: '15px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', marginTop: '5px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#0ea5e9' }}></div>
                    <div style={{ width: '2px', height: '20px', background: '#e2e8f0' }}></div>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '3px solid #ef4444' }}></div>
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>Pickup</div>
                      <div style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: '700' }}>{selectedBooking.pickup}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>Destination</div>
                      <div style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: '700' }}>{selectedBooking.destination}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div style={{ background: 'var(--bg-main)', padding: '15px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '5px' }}>Distance</div>
                  <div style={{ fontSize: '16px', color: 'var(--text-primary)', fontWeight: '800' }}>{selectedBooking.distance.toFixed(1)} km</div>
                </div>
                <div style={{ background: 'var(--bg-main)', padding: '15px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '5px' }}>Cab Type</div>
                  <div style={{ fontSize: '16px', color: 'var(--text-primary)', fontWeight: '800' }}>{selectedBooking.cabType}</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', marginBottom: '20px' }}>
                <span style={{ fontSize: '16px', color: '#166534', fontWeight: '800' }}>Total Fare</span>
                <span style={{ fontSize: '20px', color: '#16a34a', fontWeight: '900' }}>₹{selectedBooking.totalFare}</span>
              </div>

              {(selectedBooking.status === 'BOOKED' || selectedBooking.status === 'DRIVER_ASSIGNED') && (
                <div style={{ background: '#fef3c7', padding: '15px', borderRadius: '12px', marginBottom: '20px' }}>
                  <h4 style={{ margin: '0 0 5px 0', color: '#b45309', fontSize: '13px', textTransform: 'uppercase' }}>Driver Details</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ color: '#0f172a', fontWeight: '700', fontSize: '15px' }}>{selectedBooking.driver.name}</div>
                      <div style={{ color: '#b45309', fontWeight: '600', fontSize: '12px' }}>{selectedBooking.driver.vehicle}</div>
                    </div>
                    <div style={{ background: '#f59e0b', color: 'white', padding: '4px 10px', borderRadius: '6px', fontWeight: '800', fontSize: '12px' }}>
                      {selectedBooking.driver.vehicleNumber}
                    </div>
                  </div>
                </div>
              )}

              {(selectedBooking.status === 'BOOKED' || selectedBooking.status === 'DRIVER_ASSIGNED') && (
                <button 
                  onClick={() => handleCancel(selectedBooking._id)}
                  style={{ width: '100%', background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', padding: '14px', borderRadius: '12px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', transition: '0.2s' }}
                >
                  Cancel Booking
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
