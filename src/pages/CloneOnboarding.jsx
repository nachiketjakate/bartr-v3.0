import React from 'react';
import { motion } from 'framer-motion';

export default function CloneOnboarding({ setPage, setBartrMode }) {
  const selectRole = (role) => {
    setBartrMode(role);
    setPage('login');
  };

  return (
    <div className="onboarding-page no-nav animate-fade" style={{ padding: '24px' }}>
      {/* Back button */}
      <div style={{ marginBottom: 'var(--sp-6)' }}>
        <button className="btn-icon" onClick={() => setPage('landing')} aria-label="Back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
      </div>

      <div style={{ marginBottom: 'var(--sp-8)' }}>
        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 900, marginBottom: 'var(--sp-2)' }}>
          How would you<br />like to use <span style={{ color: 'var(--text-on-lime)', background: 'var(--lime)', padding: '0 6px', borderRadius: '6px' }}>Bartr?</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>You can switch modes anytime from settings.</p>
      </div>

      <div className="role-cards">
        {/* Hire Mode */}
        <motion.div 
          className="role-card hire" 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => selectRole('hire')} 
          role="button" 
          tabIndex="0"
        >
          <div className="role-card-icon">🙋</div>
          <div className="role-card-title">I Need Help</div>
          <div className="role-card-desc">Post tasks and find trusted people nearby to get everyday things done quickly.</div>
          <div className="role-card-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0D1F12" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
          <div style={{ position: 'absolute', bottom: '20px', right: '20px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ background: 'rgba(248,113,113,0.2)', color: 'var(--lime)', borderRadius: '20px', padding: '3px 10px', fontSize: '10px', fontWeight: 600 }}>✓ Post Tasks</span>
            <span style={{ background: 'rgba(248,113,113,0.2)', color: 'var(--lime)', borderRadius: '20px', padding: '3px 10px', fontSize: '10px', fontWeight: 600 }}>✓ Chat Helpers</span>
          </div>
        </motion.div>

        {/* Earn Mode */}
        <motion.div 
          className="role-card earn" 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => selectRole('earn')} 
          role="button" 
          tabIndex="0"
        >
          <div className="role-card-icon">💰</div>
          <div className="role-card-title">I Want to Earn</div>
          <div className="role-card-desc">Browse tasks near you, help neighbors, and earn money by doing simple local tasks.</div>
          <div className="role-card-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
          <div style={{ position: 'absolute', bottom: '20px', right: '20px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ background: 'rgba(13,31,18,0.15)', color: 'var(--dark)', borderRadius: '20px', padding: '3px 10px', fontSize: '10px', fontWeight: 600 }}>✓ No Skills Needed</span>
            <span style={{ background: 'rgba(13,31,18,0.15)', color: 'var(--dark)', borderRadius: '20px', padding: '3px 10px', fontSize: '10px', fontWeight: 600 }}>✓ Instant Pay</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
