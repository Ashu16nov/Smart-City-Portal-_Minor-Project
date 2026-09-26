import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';

const AqiDashboard = () => {
  const [aqiList, setAqiList] = useState([]);
  const [selectedWard, setSelectedWard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAqiData();
  }, []);

  const fetchAqiData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/aqi');
      if (res.data.success) {
        setAqiList(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedWard(res.data.data[0]);
        }
      }
    } catch (err) {
      toast.error('Failed to load air quality telemetry data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Good': return { bg: '#dcfce7', text: '#15803d', border: '#86efac' };
      case 'Moderate': return { bg: '#fef9c3', text: '#a16207', border: '#fde047' };
      case 'Unhealthy for Sensitive Groups': return { bg: '#ffedd5', text: '#c2410c', border: '#fdba74' };
      case 'Unhealthy': return { bg: '#fee2e2', text: '#b91c1c', border: '#fca5a5' };
      default: return { bg: '#f1f5f9', text: '#334155', border: '#cbd5e1' };
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
        <h2>🍃 Syncing City AQI Telemetry...</h2>
      </div>
    );
  }

  return (
    <div className="aqi-dashboard-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 20px' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0284c7, #0d9488)',
        borderRadius: '24px',
        padding: '35px 40px',
        color: 'white',
        boxShadow: '0 10px 30px rgba(13, 148, 136, 0.25)',
        marginBottom: '35px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '42px' }}>🍃</span>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800' }}>Smart City AQI & Environmental Monitor</h1>
            <p style={{ margin: '6px 0 0 0', opacity: 0.9, fontSize: '15px' }}>
              Real-time atmospheric telemetry, PM2.5 monitoring, and public health advisories across city wards.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '30px' }}>
        {/* Left Column: Selected Ward Details */}
        <div>
          {selectedWard && (
            <div style={{ background: 'white', borderRadius: '24px', padding: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                  <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 12px', borderRadius: '100px', fontSize: '13px', fontWeight: '700' }}>
                    Ward: {selectedWard.ward}
                  </span>
                  <h2 style={{ margin: '10px 0 4px 0', fontSize: '24px', color: '#0f172a' }}>{selectedWard.locationName}</h2>
                  <span style={{ color: '#64748b', fontSize: '13px' }}>
                    Updated: {new Date(selectedWard.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                {/* AQI Badge */}
                <div style={{
                  background: getStatusColor(selectedWard.status).bg,
                  color: getStatusColor(selectedWard.status).text,
                  border: `2px solid ${getStatusColor(selectedWard.status).border}`,
                  borderRadius: '20px',
                  padding: '15px 25px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '36px', fontWeight: '900', lineHeight: 1 }}>{selectedWard.aqi}</div>
                  <div style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', marginTop: '4px' }}>AQI Index</div>
                </div>
              </div>

              {/* Status Banner */}
              <div style={{
                background: getStatusColor(selectedWard.status).bg,
                color: getStatusColor(selectedWard.status).text,
                padding: '14px 20px',
                borderRadius: '16px',
                fontWeight: '700',
                fontSize: '15px',
                marginBottom: '25px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span>ℹ️ Status: <strong>{selectedWard.status}</strong></span>
              </div>

              {/* Health Advisory */}
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', borderLeft: '4px solid #0284c7', marginBottom: '30px' }}>
                <h4 style={{ margin: '0 0 6px 0', color: '#0f172a' }}>🩺 Health Advisory</h4>
                <p style={{ margin: 0, color: '#334155', fontSize: '14px' }}>{selectedWard.healthAdvisory}</p>
              </div>

              {/* Pollutants & Telemetry Grid */}
              <h3 style={{ fontSize: '18px', color: '#0f172a', marginBottom: '15px' }}>Atmospheric Telemetry Metrics</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat( auto-fit, minmax(130px, 1fr) )', gap: '15px' }}>
                <div style={{ background: '#f1f5f9', padding: '16px', borderRadius: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>PM 2.5</div>
                  <div style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>{selectedWard.pm25} <span style={{ fontSize: '12px', color: '#64748b' }}>µg/m³</span></div>
                </div>
                <div style={{ background: '#f1f5f9', padding: '16px', borderRadius: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>PM 10</div>
                  <div style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>{selectedWard.pm10} <span style={{ fontSize: '12px', color: '#64748b' }}>µg/m³</span></div>
                </div>
                <div style={{ background: '#f1f5f9', padding: '16px', borderRadius: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>NO₂</div>
                  <div style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>{selectedWard.no2} <span style={{ fontSize: '12px', color: '#64748b' }}>ppb</span></div>
                </div>
                <div style={{ background: '#f1f5f9', padding: '16px', borderRadius: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>O₃</div>
                  <div style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>{selectedWard.o3} <span style={{ fontSize: '12px', color: '#64748b' }}>ppb</span></div>
                </div>
                <div style={{ background: '#f1f5f9', padding: '16px', borderRadius: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Temperature</div>
                  <div style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>{selectedWard.temp}°C</div>
                </div>
                <div style={{ background: '#f1f5f9', padding: '16px', borderRadius: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Humidity</div>
                  <div style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>{selectedWard.humidity}%</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Ward Selector List */}
        <div>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#0f172a' }}>City Wards Leaderboard</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {aqiList.map((item) => {
              const colors = getStatusColor(item.status);
              const isSelected = selectedWard && selectedWard._id === item._id;
              return (
                <div
                  key={item._id}
                  onClick={() => setSelectedWard(item)}
                  style={{
                    background: isSelected ? '#f0f9ff' : 'white',
                    border: isSelected ? '2px solid #0284c7' : '1px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '16px 20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                  }}
                >
                  <div>
                    <h4 style={{ margin: 0, fontSize: '15px', color: '#0f172a' }}>{item.ward}</h4>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>{item.locationName}</span>
                  </div>

                  <div style={{
                    background: colors.bg,
                    color: colors.text,
                    padding: '6px 14px',
                    borderRadius: '12px',
                    fontWeight: '800',
                    fontSize: '15px'
                  }}>
                    {item.aqi}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AqiDashboard;
