import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import socket from '../utils/socket';
import { toast } from 'react-toastify';

const AqiDashboard = () => {
  const [aqiList, setAqiList] = useState([]);
  const [selectedWard, setSelectedWard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    fetchAqiData();

    // Listen for live AI telemetry broadcasts via Socket.IO
    socket.on('aqi_update', (updatedList) => {
      setAqiList(updatedList);
      if (selectedWard) {
        const found = updatedList.find(w => w.ward === selectedWard.ward);
        if (found) setSelectedWard(found);
      }
      toast.info('🍃 Live AI Atmospheric Telemetry Updated!');
    });

    return () => {
      socket.off('aqi_update');
    };
  }, [selectedWard]);

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

  const handleLiveAiSync = async () => {
    try {
      setIsSyncing(true);
      const res = await api.post('/aqi/sync');
      if (res.data.success) {
        setAqiList(res.data.data);
        if (selectedWard) {
          const found = res.data.data.find(w => w.ward === selectedWard.ward);
          if (found) setSelectedWard(found);
        } else if (res.data.data.length > 0) {
          setSelectedWard(res.data.data[0]);
        }
        toast.success('🤖 Live AI Atmospheric Telemetry Synced with Open-Meteo Satellites!');
      }
    } catch (err) {
      toast.error('Failed to sync live AI air quality API');
    } finally {
      setIsSyncing(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Good': return { bg: '#dcfce7', text: '#15803d', border: '#86efac' };
      case 'Moderate': return { bg: '#fef9c3', text: '#a16207', border: '#fde047' };
      case 'Unhealthy for Sensitive Groups': return { bg: '#ffedd5', text: '#c2410c', border: '#fdba74' };
      case 'Unhealthy': return { bg: '#fee2e2', text: '#b91c1c', border: '#fca5a5' };
      case 'Very Unhealthy': return { bg: '#f3e8ff', text: '#7e22ce', border: '#c084fc' };
      case 'Hazardous': return { bg: '#fce7f3', text: '#be185d', border: '#f472b6' };
      default: return { bg: '#f1f5f9', text: '#334155', border: '#cbd5e1' };
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
        <h2>🍃 Syncing City Open-Meteo AI Telemetry...</h2>
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
        marginBottom: '35px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '42px' }}>🤖</span>
          <div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '4px' }}>
              <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800' }}>Smart City AI Air Quality Monitor</h1>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: '800' }}>
                LIVE AI API ENABLED
              </span>
            </div>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>
              Real-time atmospheric telemetry powered by Open-Meteo free AI satellite API across city wards.
            </p>
          </div>
        </div>

        <button
          onClick={handleLiveAiSync}
          disabled={isSyncing}
          style={{
            background: 'white',
            color: '#0284c7',
            padding: '12px 24px',
            borderRadius: '100px',
            fontWeight: '800',
            border: 'none',
            cursor: isSyncing ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'transform 0.2s'
          }}
          onMouseOver={(e) => !isSyncing && (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseOut={(e) => !isSyncing && (e.currentTarget.style.transform = 'scale(1)')}
        >
          {isSyncing ? '🔄 Syncing AI Telemetry...' : '⚡ Sync Live AI Air Quality'}
        </button>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '30px' }}>
        {/* Left Column: Selected Ward Details */}
        <div>
          {selectedWard && (
            <div style={{ background: 'white', borderRadius: '24px', padding: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 12px', borderRadius: '100px', fontSize: '13px', fontWeight: '700' }}>
                      Ward: {selectedWard.ward}
                    </span>
                    <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: '800' }}>
                      🟢 Live Open-Meteo Satellite Sync
                    </span>
                  </div>

                  <h2 style={{ margin: '10px 0 4px 0', fontSize: '24px', color: '#0f172a' }}>{selectedWard.locationName}</h2>
                  <span style={{ color: '#64748b', fontSize: '13px' }}>
                    Last Satellite Reading: {new Date(selectedWard.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
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
                  <div style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', marginTop: '4px' }}>US AQI INDEX</div>
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
                <span>ℹ️ Atmospheric Status: <strong>{selectedWard.status}</strong></span>
              </div>

              {/* AI Health Advisory */}
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', borderLeft: '4px solid #0284c7', marginBottom: '30px' }}>
                <h4 style={{ margin: '0 0 6px 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🩺 AI Health & Atmospheric Advisory</span>
                </h4>
                <p style={{ margin: 0, color: '#334155', fontSize: '14px', lineHeight: '1.6' }}>{selectedWard.healthAdvisory}</p>
              </div>

              {/* Pollutants & Telemetry Grid */}
              <h3 style={{ fontSize: '18px', color: '#0f172a', marginBottom: '15px' }}>Live Satellite Pollutant Concentrations</h3>
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
                  <div style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>{selectedWard.no2} <span style={{ fontSize: '12px', color: '#64748b' }}>µg/m³</span></div>
                </div>
                <div style={{ background: '#f1f5f9', padding: '16px', borderRadius: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>O₃</div>
                  <div style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>{selectedWard.o3} <span style={{ fontSize: '12px', color: '#64748b' }}>µg/m³</span></div>
                </div>
                <div style={{ background: '#f1f5f9', padding: '16px', borderRadius: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>CO</div>
                  <div style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>{selectedWard.co} <span style={{ fontSize: '12px', color: '#64748b' }}>mg/m³</span></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Ward Selector List */}
        <div>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#0f172a' }}>City Wards Live Leaderboard</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {aqiList.map((item) => {
              const colors = getStatusColor(item.status);
              const isSelected = selectedWard && selectedWard.ward === item.ward;
              return (
                <div
                  key={item._id || item.ward}
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
