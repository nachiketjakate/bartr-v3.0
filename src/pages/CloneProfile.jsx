import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export default function CloneProfile({ setPage, user, bartrMode, setBartrMode, logout }) {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({ phone: '', location: 'Bhopal', languages: 'Hindi, English' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data } = await supabase.from('user_profiles').select('*').eq('id', user.id).single();
      if (data) {
        setProfile({
          phone: data.phone || user.user_metadata?.phone || '',
          location: data.location || 'Bhopal',
          languages: data.skills || 'Hindi, English' // repurposing skills for languages here if needed
        });
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const switchMode = (m) => {
    setBartrMode(m);
    // Real app would save this to Supabase user_metadata
  };

  const handleSave = async () => {
    if (!user) return;
    setIsEditing(false);
    
    // Save to user_profiles table
    await supabase.from('user_profiles').upsert({
      id: user.id,
      phone: profile.phone,
      location: profile.location,
      skills: profile.languages // Saving languages into skills column
    });
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      logout();
    }
  };

  return (
    <div className="page animate-fade">
      <div className="profile-hero">
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <div className="avatar avatar-xl" style={{ margin: '0 auto' }}>🧑</div>
          <div style={{ position: 'absolute', bottom: 0, right: 0, width: '24px', height: '24px', background: 'var(--lime)', borderRadius: '50%', border: '2px solid var(--dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0D1F12" strokeWidth="3"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </div>
        </div>
        <div className="profile-name">{user?.user_metadata?.full_name || 'User Name'}</div>
        <div className="profile-role">{bartrMode === 'earn' ? '🔧 Helper' : '🙋 Hirer'} · Bhopal</div>
        
        <div className="profile-stats">
          <div className="profile-stat">
            <div className="profile-stat-val">0</div>
            <div className="profile-stat-label">{bartrMode === 'earn' ? 'Jobs' : 'Tasks'}</div>
          </div>
          <div className="profile-stat-divider"></div>
          <div className="profile-stat">
            <div className="profile-stat-val">0</div>
            <div className="profile-stat-label">Completed</div>
          </div>
          <div className="profile-stat-divider"></div>
          <div className="profile-stat">
            <div className="profile-stat-val">0</div>
            <div className="profile-stat-label">Chats</div>
          </div>
          <div className="profile-stat-divider"></div>
          <div className="profile-stat">
            <div className="profile-stat-val">4.9</div>
            <div className="profile-stat-label">Rating</div>
          </div>
        </div>
      </div>

      <div className="page-content">
        <div style={{ background: 'var(--lime-pale)', borderRadius: 'var(--radius-lg)', padding: 'var(--sp-4)', display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', border: '1.5px solid var(--lime)' }}>
          <span style={{ fontSize: '28px' }}>🛡️</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>KYC Verification</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Complete KYC to get the verified badge</div>
          </div>
          <button className="btn btn-dark btn-sm">Verify</button>
        </div>

        <div className="card card-padded" style={{ marginTop: 'var(--sp-4)' }}>
          <div style={{ fontWeight: 700, marginBottom: 'var(--sp-3)' }}>Current Mode</div>
          <div className="toggle-wrap">
            <button className={`toggle-btn ${bartrMode === 'hire' ? 'active' : ''}`} onClick={() => switchMode('hire')}>🙋 I Need Help</button>
            <button className={`toggle-btn ${bartrMode === 'earn' ? 'active' : ''}`} onClick={() => switchMode('earn')}>💰 I Want to Earn</button>
          </div>
        </div>

        <div className="card card-padded" style={{ marginTop: 'var(--sp-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-4)' }}>
            <div style={{ fontWeight: 700 }}>Profile Info</div>
            {isEditing ? (
              <button className="btn btn-sm" style={{ background: 'var(--lime-dark)', color: 'white' }} onClick={handleSave}>Save</button>
            ) : (
              <button className="btn btn-sm btn-outline" onClick={() => setIsEditing(true)}>Edit</button>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
            {[
              { id: 'phone', icon: '📱', label: 'Phone', value: profile.phone },
              { id: 'location', icon: '📍', label: 'Location', value: profile.location },
              { id: 'languages', icon: '🗣️', label: 'Languages', value: profile.languages }
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                <div style={{ width: '36px', height: '36px', background: 'var(--surface-2)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>{item.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>{item.label}</div>
                  {isEditing ? (
                    <input 
                      type="text" 
                      className="pt-input" 
                      style={{ padding: '4px 8px', minHeight: '30px', marginTop: '4px', background: 'var(--surface)' }} 
                      value={item.value} 
                      onChange={e => setProfile({ ...profile, [item.id]: e.target.value })} 
                    />
                  ) : (
                    <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{item.value || '-'}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ overflow: 'hidden', marginTop: 'var(--sp-4)' }}>
          {[
            { icon: '🔔', label: 'Notifications', sub: 'Push & SMS alerts' },
            { icon: '🔒', label: 'Privacy', sub: 'Control who sees your profile' },
            { icon: '❓', label: 'Help & Support', sub: 'FAQs and contact us' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', padding: 'var(--sp-4) var(--sp-5)', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}>
              <div style={{ fontSize: '20px' }}>{item.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{item.label}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.sub}</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-muted)' }}><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          ))}
        </div>

        <button className="btn btn-danger btn-full" onClick={handleLogout} style={{ marginTop: 'var(--sp-4)' }}>
          Sign Out
        </button>

        <div style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)', padding: 'var(--sp-4)' }}>
          Bartr v1.0 · Made with ❤️ in India
        </div>
      </div>
    </div>
  );
}
