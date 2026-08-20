import React from 'react';

const ComplaintCard = ({ complaint, onDetails, isAdmin }) => {
  const { complaintId, title, location, createdAt, status, category } = complaint;

  const getStatusColor = () => {
    switch (status) {
      case 'Resolved': return '#10b981';
      case 'Pending': return '#f59e0b';
      case 'In Progress': return '#3b82f6';
      case 'Closed': return '#6366f1';
      case 'Rejected': return '#ef4444';
      default: return '#94a3b8';
    }
  };

  return (
    <div className={`complaint-card`} style={{ 
      background: 'white', 
      borderRadius: '16px', 
      overflow: 'hidden', 
      boxShadow: '0 4px 15px rgba(0,0,0,0.03)', 
      border: '1px solid #f1f5f9', 
      transition: 'all 0.3s', 
      cursor: 'default' 
    }}>
      <div className="card-p-header" style={{ padding: '16px 16px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="status-badge" 
              style={{
                background: getStatusColor() + '15',
                color: getStatusColor(),
                padding: '4px 10px',
                borderRadius: '100px',
                fontSize: '9px',
                fontWeight: '900',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
           {status}
        </span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {complaint.priority && (
            <span style={{ 
              fontSize: '9px', fontWeight: '800', textTransform: 'uppercase', padding: '3px 6px', borderRadius: '4px',
              background: complaint.priority === 'High' ? '#fee2e2' : complaint.priority === 'Medium' ? '#fef3c7' : '#e0f2fe',
              color: complaint.priority === 'High' ? '#991b1b' : complaint.priority === 'Medium' ? '#92400e' : '#0369a1' 
            }}>
              {complaint.priority}
            </span>
          )}
          <span className="date-pill" style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '600' }}>
            {new Date(createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
      
      <div style={{ padding: '0 16px 16px' }}>
        <div className="card-id-num" style={{ fontSize: '9px', fontWeight: '800', color: '#64748b', marginBottom: '8px', letterSpacing: '1px' }}>
          #{complaintId}
        </div>
        <h4 className="card-title" style={{ fontSize: '15px', fontWeight: '800', color: '#1e293b', marginBottom: '6px', lineHeight: '1.3' }}>
          {title}
        </h4>
        <div style={{ color: '#ea580c', fontSize: '11px', fontWeight: '700', marginBottom: '14px', letterSpacing: '0.5px' }}>
          {category}
        </div>
        
        <div className="card-meta" style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
          <span style={{ fontSize: '11px', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
            📍 {location}
          </span>
        </div>
        
        <div className="card-footer" style={{ borderTop: '1px solid #f8fafc', paddingTop: '12px' }}>
          <div className="action-spread" style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="details-btn" 
              onClick={() => onDetails(complaint)}
              style={{ 
                flexGrow: 1, 
                background: '#f8fafc', 
                color: '#475569', 
                border: '1px solid #e2e8f0', 
                borderRadius: '10px', 
                padding: '8px', 
                fontSize: '11px', 
                fontWeight: '800', 
                cursor: 'pointer', 
                transition: 'all 0.2s',
                letterSpacing: '0.5px'
              }}
            >
              Inquiry Report
            </button>
            {isAdmin && (
              <button 
                onClick={(e) => { e.stopPropagation(); if (complaint.onDelete) complaint.onDelete(complaintId); }} 
                title="CRUD: Delete Record"
                style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '8px 12px', borderRadius: '10px', cursor: 'pointer', fontSize: '12px', fontWeight: '800' }}
              >
                🗑️
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintCard;
