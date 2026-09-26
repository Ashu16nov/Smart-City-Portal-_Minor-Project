import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';

const CivicPolls = () => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      setLoading(true);
      const res = await api.get('/polls');
      if (res.data.success) {
        setPolls(res.data.polls);
      }
    } catch (err) {
      toast.error('Failed to load civic budgeting polls');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (pollId, optionId) => {
    if (!user) {
      toast.warning('Please log in to participate in civic voting');
      return;
    }
    try {
      const res = await api.post('/polls/vote', {
        pollId,
        optionId,
        userId: user.id || user._id
      });
      if (res.data.success) {
        toast.success('🗳️ Vote recorded! Thank you for participating in city governance.');
        fetchPolls();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error casting vote');
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '30px 20px' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
        borderRadius: '24px',
        padding: '35px 40px',
        color: 'white',
        boxShadow: '0 10px 30px rgba(124, 58, 237, 0.25)',
        marginBottom: '35px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '42px' }}>🏛️</span>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800' }}>Civic Budgeting & Community Voting Portal</h1>
            <p style={{ margin: '6px 0 0 0', opacity: 0.9, fontSize: '15px' }}>
              Direct democracy in smart city planning. Vote on municipal capital budget allocations & urban projects.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>
          <h2>🗳️ Loading active civic polls...</h2>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {polls.map((poll) => {
            const totalVotes = poll.options.reduce((acc, o) => acc + o.votesCount, 0);
            const userHasVoted = user && poll.votedUsers?.some(v => v.userId === (user.id || user._id));
            const userVotedOptionId = userHasVoted ? poll.votedUsers.find(v => v.userId === (user.id || user._id))?.optionId : null;

            return (
              <div key={poll.pollId} style={{ background: 'white', borderRadius: '24px', padding: '30px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px', marginBottom: '15px' }}>
                  <div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ background: '#f3e8ff', color: '#7c3aed', padding: '3px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '800' }}>{poll.category}</span>
                      <span style={{ color: '#64748b', fontSize: '13px' }}>📍 Ward: {poll.ward}</span>
                    </div>
                    <h2 style={{ margin: '4px 0 6px 0', fontSize: '22px', color: '#0f172a' }}>{poll.title}</h2>
                    <p style={{ margin: 0, color: '#475569', fontSize: '14px', maxWidth: '750px' }}>{poll.description}</p>
                  </div>

                  <div style={{ background: '#faf5ff', border: '1px solid #d8b4fe', padding: '12px 20px', borderRadius: '16px', textAlign: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#6b21a8', fontWeight: '700' }}>Allocated Budget</span>
                    <div style={{ fontSize: '20px', fontWeight: '900', color: '#7c3aed' }}>{poll.allocatedBudget}</div>
                  </div>
                </div>

                {/* Options List */}
                <div style={{ marginTop: '25px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {poll.options.map((opt) => {
                    const percentage = totalVotes > 0 ? Math.round((opt.votesCount / totalVotes) * 100) : 0;
                    const isVotedThis = userVotedOptionId === opt.optionId;

                    return (
                      <div key={opt.optionId} style={{
                        position: 'relative',
                        background: isVotedThis ? '#f3e8ff' : '#f8fafc',
                        border: isVotedThis ? '2px solid #7c3aed' : '1px solid #e2e8f0',
                        borderRadius: '16px',
                        padding: '16px 20px',
                        overflow: 'hidden'
                      }}>
                        {/* Progress Bar Background */}
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          bottom: 0,
                          width: `${percentage}%`,
                          background: isVotedThis ? 'rgba(124, 58, 237, 0.15)' : 'rgba(203, 213, 225, 0.3)',
                          transition: 'width 0.5s ease-in-out'
                        }} />

                        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {isVotedThis && <span style={{ fontSize: '18px' }}>✅</span>}
                            <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '15px' }}>{opt.text}</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <span style={{ fontSize: '14px', fontWeight: '800', color: '#64748b' }}>
                              {opt.votesCount} votes ({percentage}%)
                            </span>

                            {!userHasVoted && (
                              <button
                                onClick={() => handleVote(poll.pollId, opt.optionId)}
                                style={{
                                  background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                                  color: 'white',
                                  padding: '8px 18px',
                                  borderRadius: '100px',
                                  fontWeight: '700',
                                  border: 'none',
                                  cursor: 'pointer',
                                  fontSize: '13px',
                                  boxShadow: '0 4px 10px rgba(124, 58, 237, 0.2)'
                                }}
                              >
                                Vote
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748b' }}>
                  <span>📊 Total Participation: <strong>{totalVotes} Citizen Votes</strong></span>
                  <span>{userHasVoted ? '🔒 You have voted in this poll' : '🔓 Voting Open to Verified Citizens'}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CivicPolls;
