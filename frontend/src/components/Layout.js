import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { path: '/daily-challenge', icon: '⚡', label: 'Daily Challenge' },
];
const practiceItems = [
  { path: '/aptitude', icon: '🧠', label: 'Aptitude Tests' },
  { path: '/coding', icon: '💻', label: 'Coding Questions' },
];
const communityItems = [
  { path: '/leaderboard', icon: '🏆', label: 'Leaderboard' },
  { path: '/interviews', icon: '🎯', label: 'Interview Exp.' },
];
const toolsItems = [
  { path: '/progress', icon: '📊', label: 'My Progress' },
  { path: '/notes', icon: '📝', label: 'My Notes' },
  { path: '/profile', icon: '👤', label: 'Profile' },
  { path: '/admin', icon: '👑', label: 'Admin Panel' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const NavSection = ({ title, items }) => (
    <div className="nav-section">
      <div className="nav-section-title">{title}</div>
      {items.map(item => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          onClick={() => setSidebarOpen(false)}
        >
          <span className="icon">{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </div>
  );

  return (
    <div className="app-layout">
      {/* Mobile toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          display: 'none', position: 'fixed', top: 16, left: 16, zIndex: 200,
          background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8,
          padding: '8px 12px', color: 'var(--text-primary)', cursor: 'pointer', fontSize: 18
        }}
        className="mobile-toggle"
      >
        ☰
      </button>

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <h1>PlacePro</h1>
          <span>Placement Portal</span>
        </div>

        <nav className="sidebar-nav">
          <NavSection title="Overview" items={navItems} />
          <NavSection title="Practice" items={practiceItems} />
          <NavSection title="Community" items={communityItems} />
          <NavSection title="Tools" items={toolsItems} />
        </nav>

        <div className="sidebar-footer">
          <div className="user-mini">
            <div className="avatar">{user?.name?.charAt(0)?.toUpperCase()}</div>
            <div className="user-mini-info">
              <div className="name">{user?.name}</div>
              <div className="role">{user?.totalPoints || 0} pts • 🔥 {user?.streak || 0}</div>
            </div>
          </div>
          <button
            className="nav-item"
            onClick={handleLogout}
            style={{ marginTop: 4, color: 'var(--accent-red)' }}
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
