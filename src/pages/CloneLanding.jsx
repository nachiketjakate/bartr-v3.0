import React from 'react';

export default function CloneLanding({ setPage }) {
  return (
    <div className="landing-page no-nav">
      {/* Background decorations */}
      <div className="landing-bg-map"></div>
      <div className="landing-map-lines"></div>

      {/* Floating pins */}
      <div className="landing-pins" aria-hidden="true">
        <div className="pin"><div className="pin-marker"><div className="pin-avatar">👩</div></div></div>
        <div className="pin"><div className="pin-marker"><div className="pin-avatar">👨</div></div></div>
        <div className="pin"><div className="pin-marker"><div className="pin-avatar">🧑</div></div></div>
        <div className="pin"><div className="pin-marker"><div className="pin-avatar">👩‍🦱</div></div></div>
        <div className="pin"><div className="pin-marker"><div className="pin-avatar">🧔</div></div></div>
      </div>

      {/* Hero content */}
      <div className="landing-hero">
        <div className="landing-logo" style={{ marginBottom: 'var(--sp-8)' }}>
          Bar<span>tr</span><span style={{ color: 'var(--lime)', fontSize: '36px' }}>.</span>
        </div>
        <h1 className="landing-tagline">
          People <span>Near You</span><br />Are Ready
        </h1>
        <p className="landing-sub">
          Get everyday tasks done by trusted locals.<br />
          Or earn by helping your neighbors.
        </p>

        {/* Scrolling task pills */}
        <div className="tags-scroll" style={{ margin: 0, padding: 0, justifyContent: 'center', flexWrap: 'wrap', gap: '8px', maxWidth: '340px' }}>
          {['📚 Tutoring','🌿 Garden Clean','🍳 Home Cooking','🔧 Vehicle Tow','❤️ Senior Care','📦 Moving Help','🛒 Errands'].map(t => (
            <span key={t} style={{ background: 'rgba(248,113,113,0.15)', color: 'var(--lime)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 'var(--radius-full)', padding: '6px 14px', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
              ✓ {t}
            </span>
          ))}
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="landing-cta-area">
        <button className="btn btn-primary btn-full btn-lg" id="landing-hire-btn" onClick={() => setPage('onboarding')}>
          Get Started →
        </button>
        <button className="btn btn-outline btn-full" style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.8)' }} onClick={() => setPage('login')}>
          I already have an account
        </button>
        <div className="landing-made">Made with ❤️ in India</div>
      </div>
    </div>
  );
}
