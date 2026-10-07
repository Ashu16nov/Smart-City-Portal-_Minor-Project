import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../utils/api';

const CAB_OPTIONS = [
  { type: 'Mini', capacity: 3, baseFare: 40, perKmRate: 12, icon: '🚗', transportMode: 'Cab' },
  { type: 'Sedan', capacity: 4, baseFare: 50, perKmRate: 15, icon: '🚘', transportMode: 'Cab' },
  { type: 'SUV', capacity: 6, baseFare: 70, perKmRate: 18, icon: '🚙', transportMode: 'Cab' },
  { type: 'Metro Ticket', capacity: 200, baseFare: 20, perKmRate: 2, icon: '🚇', transportMode: 'Metro' },
  { type: 'Bus Pass', capacity: 1, baseFare: 500, perKmRate: 0, icon: '🚌', transportMode: 'Bus', isPass: true }
];

const CabBooking = () => {
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [distance, setDistance] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [selectedCab, setSelectedCab] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      toast.error("Please login to book a cab.");
      navigate('/login');
    }
  }, [navigate]);

  const geocode = async (address) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
      }
      return null;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleCalculate = async () => {
    if (!pickup || !destination) {
      toast.error('Both pickup and destination are required.');
      return;
    }
    if (pickup.toLowerCase() === destination.toLowerCase()) {
      toast.error('Pickup and destination cannot be the same.');
      return;
    }

    setCalculating(true);
    setDistance(null);
    setSelectedCab(null);

    try {
      // 1. Geocode locations
      const pCoords = await geocode(pickup);
      const dCoords = await geocode(destination);

      if (!pCoords || !dCoords) {
        toast.error("Unable to find exact locations. Please enter a more specific area or landmark.");
        setCalculating(false);
        return;
      }

      // 2. Fetch driving distance using OSRM API
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${pCoords.lon},${pCoords.lat};${dCoords.lon},${dCoords.lat}?overview=false`;
      const routeRes = await fetch(osrmUrl);
      const routeData = await routeRes.json();

      if (routeData.code === 'Ok' && routeData.routes && routeData.routes.length > 0) {
        // OSRM returns distance in meters
        let distInKm = routeData.routes[0].distance / 1000;
        distInKm = Math.max(1, distInKm); // Minimum 1 km charge
        setDistance(distInKm);
      } else {
        // Fallback to Haversine straight line if OSRM driving route fails
        const dist = getDistance(pCoords.lat, pCoords.lon, dCoords.lat, dCoords.lon);
        setDistance(Math.max(1, dist));
        toast.info("Using straight-line distance as driving route could not be calculated.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error calculating route. Please try again.");
    }

    setCalculating(false);
  };

  const calculateFare = (baseFare, perKmRate) => {
    if (!distance) return 0;
    return Math.round(baseFare + (distance * perKmRate));
  };

  const handleConfirmBooking = async () => {
    if (!selectedCab || !distance) return;

    try {
      const res = await api.post('/cabs/book', {
        pickup,
        destination,
        distance: selectedCab.isPass ? 0 : distance,
        cabType: selectedCab.type,
        transportMode: selectedCab.transportMode,
        isPass: selectedCab.isPass || false
      });
      
      setBookingSuccess(res.data.booking);
      setShowConfirm(false);
      toast.success('Booking Successful!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Booking failed.');
    }
  };

  return (
    <div className="dashboard-wrapper" style={{ minHeight: '100vh', background: '#e0f7fa', position: 'relative' }}>
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div style={{ padding: '60px 60px 40px 60px', textAlign: 'center', background: '#b2ebf2', borderBottom: '1px solid #80deea', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#006064', margin: '0 0 15px 0' }}>Cab Booking 🚕</h1>
        <p style={{ fontSize: '16px', color: '#00838f', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
          Quick, safe, and reliable transportation across the city. Enter your locations to see estimated fares.
        </p>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px', paddingBottom: '60px' }}>
        
        {/* Step 1: Locations */}
        <div style={{ background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginBottom: '20px' }}>1. Pickup & Destination</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#475569' }}>Pickup Location</label>
              <input 
                type="text" 
                placeholder="e.g. College" 
                value={pickup}
                onChange={(e) => { setPickup(e.target.value); setDistance(null); }}
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '15px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#475569' }}>Destination</label>
              <input 
                type="text" 
                placeholder="e.g. Railway Station" 
                value={destination}
                onChange={(e) => { setDestination(e.target.value); setDistance(null); }}
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '15px' }}
              />
            </div>
          </div>
          <button 
            onClick={handleCalculate}
            disabled={calculating || !pickup || !destination}
            style={{ marginTop: '20px', width: '100%', padding: '14px', background: calculating ? '#94a3b8' : '#0f172a', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '700', cursor: calculating || !pickup || !destination ? 'not-allowed' : 'pointer', transition: '0.2s' }}
          >
            {calculating ? 'Calculating Distance...' : 'Calculate Distance & View Cabs'}
          </button>
        </div>

        {/* Step 2: Distance & Cabs */}
        {distance !== null && (
          <div style={{ background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', animation: 'fadeInUp 0.5s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', paddingBottom: '20px', borderBottom: '1px solid #e2e8f0' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: 0 }}>2. Select Cab</h2>
              <div style={{ background: '#f0f9ff', color: '#0ea5e9', padding: '8px 16px', borderRadius: '100px', fontWeight: '800', fontSize: '14px' }}>
                Distance: {distance.toFixed(1)} km
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              {CAB_OPTIONS.map(cab => {
                const estFare = calculateFare(cab.baseFare, cab.perKmRate);
                const isSelected = selectedCab?.type === cab.type;
                
                return (
                  <div 
                    key={cab.type}
                    onClick={() => setSelectedCab(cab)}
                    style={{ 
                      border: isSelected ? '2px solid #0ea5e9' : '1px solid #e2e8f0', 
                      borderRadius: '16px', padding: '20px', textAlign: 'center', cursor: 'pointer', 
                      background: isSelected ? '#f0f9ff' : 'white',
                      transition: 'all 0.2s',
                      boxShadow: isSelected ? '0 10px 20px rgba(14,165,233,0.1)' : 'none'
                    }}
                  >
                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>{cab.icon}</div>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '0 0 5px 0' }}>{cab.type}</h3>
                    <p style={{ color: '#64748b', fontSize: '12px', fontWeight: '600', margin: '0 0 15px 0' }}>{cab.capacity} Passengers</p>
                    <div style={{ color: '#0ea5e9', fontSize: '12px', fontWeight: '700', marginBottom: '15px' }}>
                      {cab.isPass ? `Flat Pass Fare` : `Base: ₹${cab.baseFare} | ₹${cab.perKmRate}/km`}
                    </div>
                    <div style={{ fontSize: '22px', fontWeight: '900', color: '#16a34a' }}>
                      ₹{cab.isPass ? cab.baseFare : estFare}
                    </div>
                    {isSelected && (
                      <button 
                        onClick={() => setShowConfirm(true)}
                        style={{ marginTop: '15px', width: '100%', background: '#0ea5e9', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}
                      >
                        Book Now
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirm && selectedCab && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }} onClick={() => setShowConfirm(false)}>
          <div style={{ background: 'white', width: '100%', maxWidth: '400px', borderRadius: '24px', padding: '30px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a', marginBottom: '20px', textAlign: 'center' }}>Confirm Booking</h2>
            
            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', marginBottom: '25px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontSize: '14px', fontWeight: '600' }}>Pickup</span>
                <span style={{ color: '#0f172a', fontSize: '14px', fontWeight: '700' }}>{pickup}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontSize: '14px', fontWeight: '600' }}>Destination</span>
                <span style={{ color: '#0f172a', fontSize: '14px', fontWeight: '700' }}>{destination}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontSize: '14px', fontWeight: '600' }}>Distance</span>
                <span style={{ color: '#0f172a', fontSize: '14px', fontWeight: '700' }}>{distance.toFixed(1)} km</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontSize: '14px', fontWeight: '600' }}>Cab Type</span>
                <span style={{ color: '#0f172a', fontSize: '14px', fontWeight: '700' }}>{selectedCab.type}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '12px', marginTop: '5px' }}>
                <span style={{ color: '#0f172a', fontSize: '16px', fontWeight: '800' }}>Estimated Fare</span>
                <span style={{ color: '#16a34a', fontSize: '18px', fontWeight: '900' }}>₹{selectedCab.isPass ? selectedCab.baseFare : calculateFare(selectedCab.baseFare, selectedCab.perKmRate)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowConfirm(false)} style={{ flex: 1, background: 'transparent', color: '#475569', border: '1px solid #cbd5e1', padding: '12px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleConfirmBooking} style={{ flex: 2, background: '#0ea5e9', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>Confirm Booking</button>
            </div>
          </div>
        </div>
      )}

      {/* Success Receipt Modal */}
      {bookingSuccess && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: '20px' }} onClick={() => navigate('/my-bookings')}>
          <div style={{ background: 'white', width: '100%', maxWidth: '450px', borderRadius: '24px', padding: '40px 30px', boxShadow: '0 25px 50px rgba(0,0,0,0.3)', position: 'relative', textAlign: 'center', animation: 'fadeInUp 0.4s ease' }} onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => navigate('/my-bookings')}
              style={{ position: 'absolute', top: '20px', right: '20px', background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', color: '#64748b', fontWeight: 'bold' }}
            >
              ✕
            </button>
            <div style={{ fontSize: '60px', marginBottom: '15px' }}>🎉</div>
            <h2 style={{ color: '#0f172a', fontSize: '26px', fontWeight: '900', margin: '0 0 10px 0' }}>Booking Confirmed!</h2>
            <div style={{ background: '#f0f9ff', color: '#0ea5e9', padding: '8px 20px', borderRadius: '100px', fontSize: '16px', fontWeight: '800', display: 'inline-block', marginBottom: '30px' }}>
              {bookingSuccess.bookingId}
            </div>
            
            <div style={{ textAlign: 'left', background: '#f8fafc', padding: '20px', borderRadius: '16px', marginBottom: '25px', display: 'flex', flexDirection: 'column', gap: '15px', border: '1px dashed #cbd5e1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontWeight: '600', fontSize: '14px' }}>Pickup</span>
                <span style={{ color: '#0f172a', fontWeight: '700', fontSize: '14px' }}>{bookingSuccess.pickup}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontWeight: '600', fontSize: '14px' }}>Destination</span>
                <span style={{ color: '#0f172a', fontWeight: '700', fontSize: '14px' }}>{bookingSuccess.destination}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontWeight: '600', fontSize: '14px' }}>Distance</span>
                <span style={{ color: '#0f172a', fontWeight: '700', fontSize: '14px' }}>{bookingSuccess.distance.toFixed(1)} km</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontWeight: '600', fontSize: '14px' }}>Cab Type</span>
                <span style={{ color: '#0f172a', fontWeight: '700', fontSize: '14px' }}>{bookingSuccess.cabType}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '15px', marginTop: '5px' }}>
                <span style={{ color: '#0f172a', fontWeight: '800', fontSize: '16px' }}>Total Fare</span>
                <span style={{ color: '#16a34a', fontWeight: '900', fontSize: '20px' }}>₹{bookingSuccess.totalFare}</span>
              </div>
            </div>

            {bookingSuccess.driver && (
              <div style={{ textAlign: 'left', background: '#fef3c7', padding: '20px', borderRadius: '16px', marginBottom: '30px' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#b45309', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Driver Assigned</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ color: '#0f172a', fontWeight: '800', fontSize: '16px' }}>{bookingSuccess.driver.name}</div>
                    <div style={{ color: '#b45309', fontWeight: '600', fontSize: '13px' }}>{bookingSuccess.driver.vehicle}</div>
                  </div>
                  <div style={{ background: '#f59e0b', color: 'white', padding: '6px 12px', borderRadius: '8px', fontWeight: '800', letterSpacing: '1px' }}>
                    {bookingSuccess.driver.vehicleNumber}
                  </div>
                </div>
              </div>
            )}

            <button onClick={() => navigate('/my-bookings')} style={{ background: '#0ea5e9', color: 'white', border: 'none', padding: '16px 30px', borderRadius: '12px', fontSize: '16px', fontWeight: '800', cursor: 'pointer', width: '100%', boxShadow: '0 10px 20px rgba(14,165,233,0.3)' }}>
              View My Bookings
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CabBooking;
