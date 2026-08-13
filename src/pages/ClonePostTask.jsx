import React, { useState } from 'react';
import { supabase } from '../supabase';

const POST_STEPS = [
  { label: 'What do you need?', icon: '✏️' },
  { label: 'Choose a category', icon: '📂' },
  { label: 'Set your budget', icon: '💰' },
  { label: 'When & where?', icon: '📅' },
  { label: 'Review & Post', icon: '🚀' },
];

const CATEGORIES = [
  { emoji: '🔧', label: 'Repairs' },
  { emoji: '🌿', label: 'Yard Work' },
  { emoji: '📚', label: 'Tutoring' },
  { emoji: '🍳', label: 'Cooking' },
  { emoji: '📦', label: 'Moving' },
  { emoji: '🧹', label: 'Cleaning' },
];

export default function ClonePostTask({ setPage, user }) {
  const [step, setStep] = useState(0);
  const [draftTask, setDraftTask] = useState({
    title: '', desc: '', category: '', categoryName: '', budget: '', unit: 'fixed', date: '', time: '', location: 'Shahpura, Bhopal'
  });
  const [error, setError] = useState('');

  const handleNext = () => {
    setError('');
    if (step === 0) {
      if (!draftTask.title.trim()) return setError('Please enter a task title');
    } else if (step === 1) {
      if (!draftTask.category) return setError('Please select a category');
    } else if (step === 2) {
      if (!draftTask.budget || parseInt(draftTask.budget) <= 0) return setError('Please enter a valid budget');
    } else if (step === 3) {
      if (!draftTask.date) return setError('Please pick a date');
    }
    setStep(s => s + 1);
  };

  const handleBack = () => {
    if (step === 0) setPage('home');
    else setStep(s => s - 1);
  };

  const submitTask = async () => {
    // Map clone UI fields to the existing database schema
    const gigData = {
      client_id: user.id,
      title: draftTask.title,
      category: draftTask.categoryName,
      price: draftTask.budget,
      description: `${draftTask.desc}\n\nDate: ${draftTask.date} | Time: ${draftTask.time || 'Flexible'} | Rate: ${draftTask.unit}`,
      location: draftTask.location,
      status: 'Active'
    };

    const { error } = await supabase.from('gigs').insert(gigData);
    
    if (error) {
      setError('Failed to post task. Please try again.');
      console.error(error);
    } else {
      alert('Task posted! Helpers nearby are notified 🎉');
      setPage('home');
    }
  };

  const renderStepContent = () => {
    if (step === 0) {
      return (
        <div className="pt-body animate-slide">
          <div className="pt-section-header">
            <h2 className="pt-title">What do you need help with?</h2>
            <p className="pt-subtitle">Be specific so helpers understand exactly what's needed.</p>
          </div>
          <div className="pt-suggestions">
            {['🌿 Clean my garden', '🍳 Cook dinner', '📚 Teach maths', '🔧 Tow my bike'].map(s => (
              <button key={s} className="pt-chip" onClick={() => setDraftTask({ ...draftTask, title: s.slice(2).trim() })}>{s}</button>
            ))}
          </div>
          <div className="pt-field-group">
            <label className="pt-label">Task title <span style={{ color: 'var(--red)' }}>*</span></label>
            <input className="pt-input" type="text" placeholder="e.g. Teach my kid maths" value={draftTask.title} onChange={e => setDraftTask({ ...draftTask, title: e.target.value })} maxLength={80} />
            <div className="pt-char-count">{draftTask.title.length}/80</div>
          </div>
          <div className="pt-field-group">
            <label className="pt-label">More details <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
            <textarea className="pt-input pt-textarea" placeholder="Timing, experience required..." value={draftTask.desc} onChange={e => setDraftTask({ ...draftTask, desc: e.target.value })} />
          </div>
        </div>
      );
    } else if (step === 1) {
      return (
        <div className="pt-body animate-slide">
          <div className="pt-section-header">
            <h2 className="pt-title">What type of task is this?</h2>
            <p className="pt-subtitle">Pick the category that best fits.</p>
          </div>
          <div className="pt-cat-grid">
            {CATEGORIES.map(cat => (
              <button key={cat.label} className={`pt-cat-item ${draftTask.category === cat.emoji ? 'selected' : ''}`} onClick={() => setDraftTask({ ...draftTask, category: cat.emoji, categoryName: cat.label })}>
                <span className="pt-cat-emoji">{cat.emoji}</span>
                <span className="pt-cat-label">{cat.label}</span>
                <span className="pt-cat-check">✓</span>
              </button>
            ))}
          </div>
        </div>
      );
    } else if (step === 2) {
      return (
        <div className="pt-body animate-slide">
          <div className="pt-section-header">
            <h2 className="pt-title">Set your budget</h2>
            <p className="pt-subtitle">Helpers will see this. You can always negotiate in chat.</p>
          </div>
          <div className="pt-budget-box">
            <span className="pt-budget-symbol">₹</span>
            <input className="pt-budget-input" type="number" min="0" placeholder="0" value={draftTask.budget} onChange={e => setDraftTask({ ...draftTask, budget: e.target.value })} />
          </div>
          <div className="pt-presets">
            {[100, 200, 350, 500, 750, 1000].map(v => (
              <button key={v} className={`pt-preset-chip ${parseInt(draftTask.budget) === v ? 'active' : ''}`} onClick={() => setDraftTask({ ...draftTask, budget: v })}>₹{v}</button>
            ))}
          </div>
          <div className="pt-field-group" style={{ marginTop: 'var(--sp-5)' }}>
            <label className="pt-label">Pricing type</label>
            <div className="pt-unit-grid">
              {['fixed', 'per hour', 'per session', 'per day'].map(u => (
                <button key={u} className={`pt-unit-btn ${draftTask.unit === u ? 'active' : ''}`} onClick={() => setDraftTask({ ...draftTask, unit: u })}>{u}</button>
              ))}
            </div>
          </div>
        </div>
      );
    } else if (step === 3) {
      return (
        <div className="pt-body animate-slide">
          <div className="pt-section-header">
            <h2 className="pt-title">When & where?</h2>
            <p className="pt-subtitle">Let helpers know when you need this done.</p>
          </div>
          <div className="pt-two-col">
            <div className="pt-field-group">
              <label className="pt-label">Date <span style={{ color: 'var(--red)' }}>*</span></label>
              <input className="pt-input" type="date" value={draftTask.date} onChange={e => setDraftTask({ ...draftTask, date: e.target.value })} />
            </div>
            <div className="pt-field-group">
              <label className="pt-label">Time</label>
              <input className="pt-input" type="time" value={draftTask.time} onChange={e => setDraftTask({ ...draftTask, time: e.target.value })} />
            </div>
          </div>
          <div className="pt-field-group">
            <label className="pt-label">Location</label>
            <div className="pt-input-icon-wrap">
              <input className="pt-input" type="text" style={{ paddingLeft: '40px' }} value={draftTask.location} onChange={e => setDraftTask({ ...draftTask, location: e.target.value })} />
            </div>
          </div>
        </div>
      );
    } else if (step === 4) {
      return (
        <div className="pt-body animate-slide">
          <div className="pt-section-header">
            <h2 className="pt-title">Looks good?</h2>
            <p className="pt-subtitle">Review your task before going live.</p>
          </div>
          <div className="pt-preview-card">
            <div className="pt-preview-top">
              <span className="pt-preview-emoji">{draftTask.category}</span>
              <div className="pt-preview-top-info">
                <div className="pt-preview-title">{draftTask.title}</div>
                <span className="pt-preview-badge">{draftTask.categoryName}</span>
              </div>
            </div>
            {draftTask.desc && <p className="pt-preview-desc">{draftTask.desc}</p>}
            <div className="pt-preview-meta-grid">
              <div className="pt-meta-item">
                <span className="pt-meta-icon">💰</span>
                <div>
                  <div className="pt-meta-val">₹{draftTask.budget}</div>
                  <div className="pt-meta-sub">{draftTask.unit}</div>
                </div>
              </div>
              <div className="pt-meta-item">
                <span className="pt-meta-icon">📅</span>
                <div>
                  <div className="pt-meta-val">{draftTask.date}</div>
                  <div className="pt-meta-sub">{draftTask.time || 'Flexible'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="pt-page">
      {/* Sticky header */}
      <div className="pt-header">
        <div className="pt-header-row">
          <button className="btn-icon" onClick={handleBack} aria-label="Back">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div className="pt-step-info">
            <span className="pt-step-label">{POST_STEPS[step].icon} Step {step + 1} of {POST_STEPS.length}</span>
            <span className="pt-step-title">{POST_STEPS[step].label}</span>
          </div>
          <button className="pt-cancel-btn" onClick={() => setPage('home')}>Cancel</button>
        </div>
        <div className="pt-progress-track">
          {POST_STEPS.map((_, i) => (
            <div key={i} className={`pt-progress-seg ${i < step ? 'done' : i === step ? 'active' : ''}`}></div>
          ))}
        </div>
      </div>

      {renderStepContent()}

      <div className="pt-footer">
        {error && <div style={{ color: 'var(--red)', fontSize: '12px', marginBottom: '8px', textAlign: 'center', fontWeight: '600' }}>{error}</div>}
        {step < 4 ? (
          <button className="pt-cta-btn" onClick={handleNext}>Continue <span className="pt-cta-arrow">→</span></button>
        ) : (
          <button className="pt-cta-btn pt-post-btn" onClick={submitTask}>🚀 Post Task Now</button>
        )}
      </div>
    </div>
  );
}
