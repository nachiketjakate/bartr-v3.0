import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export default function CloneHome({ user, setPage }) {
  const [filter, setFilter] = useState('all');
  
  const [tasks, setTasks] = useState([]);
  
  useEffect(() => {
    const fetchMyTasks = async () => {
      if (!user) return;
      const { data } = await supabase.from('gigs').select('*').eq('client_id', user.id).order('created_at', { ascending: false });
      if (data) setTasks(data);
    };
    fetchMyTasks();
  }, [user]);

  const updateTaskStatus = async (taskId, newStatus) => {
    const { error } = await supabase.from('gigs').update({ status: newStatus }).eq('id', taskId);
    if (!error) setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  };

  const deleteTask = async (taskId, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this task?")) return;
    const { error } = await supabase.from('gigs').delete().eq('id', taskId);
    if (!error) setTasks(tasks.filter(t => t.id !== taskId));
  };

  const activeTasks = tasks.filter(t => t.status === 'Active');
  const doneTasks = tasks.filter(t => t.status === 'Completed');
  const displayTasks = filter === 'all' ? tasks : filter === 'active' ? activeTasks : doneTasks;

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    return 'evening';
  };

  return (
    <div className="page">
      {/* Dark Header */}
      <div className="home-header">
        <div className="home-location-row">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <span><strong>Shahpura, Bhopal</strong> · 3km radius</span>
        </div>
        <div className="home-greeting">
          Good {getGreeting()}, <span>{user?.user_metadata?.full_name?.split(' ')[0] || 'there'}!</span> 👋
        </div>
        {/* Post Task CTA */}
        <div className="home-post-cta" onClick={() => setPage('post-task')}>
          <div>
            <div className="home-post-cta-text">Need help? Post a task</div>
            <div className="home-post-cta-sub">Describe it in 3 simple steps · takes 30 secs</div>
          </div>
          <div className="home-post-cta-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 'var(--sp-3)', padding: 'var(--sp-4) var(--sp-5)' }}>
        {[
          { val: tasks.length, label: 'Total Tasks', icon: '📋' },
          { val: activeTasks.length, label: 'Active', icon: '⚡' },
          { val: doneTasks.length, label: 'Completed', icon: '✓' },
        ].map((s, i) => (
          <div key={i} style={{ flex: 1, background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: 'var(--sp-4)', textAlign: 'center', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>{s.icon}</div>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 900, color: 'var(--text-primary)' }}>{s.val}</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="tags-scroll">
        {[
          { key: 'all', label: 'All Tasks' },
          { key: 'active', label: '⚡ Active' },
          { key: 'done', label: '✓ Completed' },
        ].map(f => (
          <span key={f.key} className={`chip ${filter === f.key ? 'active' : ''}`} onClick={() => setFilter(f.key)}>{f.label}</span>
        ))}
      </div>

      {/* Tasks List */}
      <div className="page-content" style={{ paddingTop: 0 }}>
        {displayTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-title">No tasks found</div>
            <div className="empty-state-desc">You have no tasks matching this filter.</div>
            <button className="btn btn-primary" onClick={() => setPage('post-task')}>Post a Task →</button>
          </div>
        ) : (
          displayTasks.map(task => (
            <div key={task.id} className="card" style={{ marginBottom: '16px', padding: '16px' }}> 
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '10px', background: 'var(--surface-2)', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>{task.category}</span>
                  <div style={{ fontWeight: 800, fontSize: '16px', marginTop: '4px' }}>{task.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', whiteSpace: 'pre-wrap' }}>{task.description}</div>
                </div>
                <div style={{ fontWeight: 800, color: 'var(--lime-dark)' }}>₹{task.price}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'var(--text-muted)' }}>
                  <span>📍 {task.location}</span>
                  <span style={{ margin: '0 4px' }}>•</span>
                  <span>{task.status}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {task.status === 'Active' && (
                    <button className="btn btn-sm" style={{ background: 'var(--lime-dark)', color: 'white', padding: '4px 12px' }} onClick={() => updateTaskStatus(task.id, 'Completed')}>Mark Done ✓</button>
                  )}
                  <button className="btn btn-sm" style={{ background: 'var(--red)', color: 'white', padding: '4px 12px' }} onClick={(e) => deleteTask(task.id, e)}>Delete</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
