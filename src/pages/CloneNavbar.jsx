import React from 'react';

const NAV_ICONS = {
  home: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  explore: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>,
  post: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  chat: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  profile: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
};

export default function CloneNavbar({ currentPage, setPage }) {
  const noAuthRoutes = ['landing', 'onboarding', 'login'];
  if (noAuthRoutes.includes(currentPage)) {
    return null;
  }

  const navItems = [
    { route: 'home', label: 'Home', icon: 'home' },
    { route: 'explore', label: 'Explore', icon: 'explore' },
    { route: 'post-task', label: '', icon: 'post', fab: true },
    { route: 'chat', label: 'Messages', icon: 'chat' },
    { route: 'profile', label: 'Profile', icon: 'profile' },
  ];

  const hasUnread = false; // Dummy value

  return (
    <nav id="bottom-nav" className="bottom-nav">
      {navItems.map(item => {
        if (item.fab) {
          return (
            <button key="fab" className="nav-fab" id="nav-fab" title="Post a Task" onClick={() => setPage(item.route)} aria-label="Post a Task">
              {NAV_ICONS.post}
            </button>
          );
        }

        const isActive = currentPage === item.route;
        return (
          <button key={item.route} className={`nav-item ${isActive ? 'active' : ''}`} onClick={() => setPage(item.route)} aria-label={item.label}>
            <span className="nav-icon" style={{ position: 'relative' }}>
              {NAV_ICONS[item.icon]}
              {item.icon === 'chat' && hasUnread && <span className="notif-dot"></span>}
            </span>
            <span className="nav-label">{item.label}</span>
            {isActive && <span className="nav-active-dot"></span>}
          </button>
        );
      })}
    </nav>
  );
}
