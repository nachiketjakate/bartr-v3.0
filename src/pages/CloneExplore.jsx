import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export default function CloneExplore({ setPage, onApply, user }) {
  const [view, setView] = useState('list');
  const [filter, setFilter] = useState('all');

  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [appliedTaskIds, setAppliedTaskIds] = useState([]);
  
  useEffect(() => {
    const fetchTasks = async () => {
      // In explore, we want tasks posted by others. If user is null (guest), show all.
      let query = supabase.from('gigs').select('*').eq('status', 'Active').order('created_at', { ascending: false });
      
      const { data } = await query;
      if (data) {
        setTasks(data);
        const cats = Array.from(new Set(data.map(t => t.category).filter(Boolean)));
        setCategories(cats);
      }
      
      // If user is logged in, fetch their applications
      if (user) {
        const { data: apps } = await supabase.from('gig_applications').select('gig_id').eq('applicant_id', user.id);
        if (apps) {
          setAppliedTaskIds(apps.map(a => a.gig_id));
        }
      }
    };
    fetchTasks();
  }, []);

  const displayTasks = filter === 'all' ? tasks : tasks.filter(t => t.category === filter);

  return (
    <div className="page" style={{ paddingBottom: 0 }}>
      {/* Header */}
      <div className="page-header" style={{ background: 'var(--dark)', borderBottomColor: 'rgba(255,255,255,0.1)' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>
            📍 Shahpura, Bhopal · 3km
          </div>
          <div className="page-header-title" style={{ color: 'var(--white)', fontSize: 'var(--text-lg)' }}>Nearby Opportunities</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--lime)', fontWeight: 700 }}>{tasks.length} tasks</span>
          <div className="map-list-toggle">
            <button className={`map-list-btn ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              List
            </button>
            <button className={`map-list-btn ${view === 'map' ? 'active' : ''}`} onClick={() => setView('map')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>
              Map
            </button>
          </div>
        </div>
      </div>

      {/* Category filters */}
      <div className="tags-scroll" style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)', padding: 'var(--sp-3) var(--sp-5)' }}>
        <span className={`chip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</span>
        {categories.map(cat => (
          <span key={cat} className={`chip ${filter === cat ? 'active' : ''}`} onClick={() => setFilter(cat)}>{cat}</span>
        ))}
      </div>

      {/* List Panel */}
      {view === 'list' && (
        <div id="explore-list-panel" style={{ overflowY: 'auto', flex: 1, paddingBottom: 'calc(var(--nav-height) + 8px)' }}>
          <div id="explore-list" className="page-content" style={{ gap: 'var(--sp-3)' }}>
            {displayTasks.length === 0 ? (
              <div className="empty-state"><div className="empty-state-icon">🔍</div><div className="empty-state-title">No tasks found</div><div className="empty-state-desc">Try a different category filter.</div></div>
            ) : (
              displayTasks.map(task => {
                const isApplied = appliedTaskIds.includes(task.id);
                return (
                  <div key={task.id} className="card" style={{ marginBottom: '16px', padding: '16px', cursor: isApplied ? 'default' : 'pointer', opacity: isApplied ? 0.7 : 1 }} onClick={() => !isApplied && onApply && onApply(task)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <span style={{ fontSize: '10px', background: 'var(--lime-pale)', color: 'var(--lime-dark)', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>{task.category}</span>
                        <div style={{ fontWeight: 800, fontSize: '16px', marginTop: '4px' }}>{task.title}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', whiteSpace: 'pre-wrap' }}>{task.description}</div>
                      </div>
                      <div style={{ fontWeight: 800, color: 'var(--lime-dark)' }}>₹{task.price}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'var(--text-muted)' }}>
                        <span>📍 {task.location}</span>
                      </div>
                      <button 
                        className="btn btn-sm" 
                        style={{ 
                          background: isApplied ? 'var(--surface-2)' : 'var(--dark)', 
                          color: isApplied ? 'var(--text-secondary)' : 'white',
                          border: isApplied ? '1px solid var(--border)' : 'none',
                          cursor: isApplied ? 'default' : 'pointer'
                        }}
                      >
                        {isApplied ? 'Applied ✓' : 'Apply'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Map Panel */}
      {view === 'map' && (
        <div id="explore-map-panel" style={{ height: 'calc(100dvh - 170px)', position: 'relative' }}>
          <div id="explore-map" style={{ width: '100%', height: '100%', background: '#e5e5e5' }}></div>
          {/* Floating task count */}
          <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 999 }}>
            <div className="nearby-count-badge">
              <span style={{ color: 'var(--lime)' }}>●</span> {tasks.length} tasks nearby
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
