import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabase';
const API_URL = import.meta.env.VITE_API_URL || '';

export default function CloneLogin({ setPage, bartrMode }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              full_name: fullName,
              bartr_mode: bartrMode || 'hire',
              role: 'freelancer'
            }
          }
        });
        if (error) throw error;
        
        fetch(`${API_URL}/welcome-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, fullName })
        }).catch(err => console.error("Welcome email failed:", err));
        
        // Show success logic or redirect
        alert("Check your email for the confirmation link!");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    if (error) setError(error.message);
  };

  return (
    <div className="login-page no-nav animate-fade" style={{ padding: '24px' }}>
      <div className="login-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-8)' }}>
        <button className="btn-icon" onClick={() => setPage('onboarding')} aria-label="Back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div style={{ fontSize: '22px', fontWeight: 900 }}>Bar<span style={{ color: 'var(--lime-dark)' }}>tr</span>.</div>
        <div style={{ width: 40 }}></div>
      </div>

      <div className="animate-fade">
        <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 900, marginBottom: 'var(--sp-2)' }}>
          {isLogin ? 'Welcome Back!' : 'Create Account'}
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--sp-8)', fontSize: 'var(--text-sm)' }}>
          {isLogin ? 'Sign in to continue to Bartr.' : 'Join your local community today.'}
        </p>

        {error && (
          <div style={{ background: '#fef2f2', border: '1.5px solid #fecaca', color: '#dc2626', padding: '12px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 600, marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <AnimatePresence>
            {!isLogin && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                <div className="input-group" style={{ marginBottom: 'var(--sp-4)' }}>
                  <input className="input" type="text" placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} required style={{ width: '100%', boxSizing: 'border-box' }} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="input-group" style={{ marginBottom: 'var(--sp-4)' }}>
            <input className="input" type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', boxSizing: 'border-box' }} />
          </div>

          <div className="input-group" style={{ marginBottom: 'var(--sp-6)' }}>
            <input className="input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', boxSizing: 'border-box' }} />
          </div>

          <button className="btn btn-dark btn-full btn-lg" type="submit" disabled={loading}>
            {loading ? 'Please wait...' : (isLogin ? 'Sign In →' : 'Sign Up →')}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0', color: '#9CA3AF', fontSize: '12px', fontWeight: 600 }}>
          <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }}></div>
          OR
          <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }}></div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          style={{ width: '100%', padding: '13px', borderRadius: '100px', border: '1.5px solid #E5E7EB', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', color: '#111827' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#EA4335" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/></svg>
          Continue with Google
        </button>

        <p style={{ textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: 'var(--sp-6)' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setIsLogin(!isLogin)} style={{ background: 'none', border: 'none', color: 'var(--dark)', fontWeight: 700, cursor: 'pointer', fontSize: 'var(--text-sm)' }}>
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
