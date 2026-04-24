import  { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, FolderOpen,
  Settings, LogOut, Menu, X, ExternalLink, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/blogs', icon: FileText, label: 'Blog Posts' },
  { to: '/admin/projects', icon: FolderOpen, label: 'Projects' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/admin/login');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <span className="sidebar-logo">
            <span style={{ color: 'var(--accent)' }}>&lt;</span>dev
            <span style={{ color: 'var(--accent)' }}>/&gt;</span>
          </span>
          <span className="sidebar-label">Admin</span>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={16} />
              <span>{label}</span>
              <ChevronRight size={14} className="nav-chevron" />
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <a href="/" target="_blank" rel="noreferrer" className="sidebar-site-link">
            <ExternalLink size={13} /> View Site
          </a>

          <div className="sidebar-user">
            <div className="user-avatar-sm">
              {user?.avatar
                ? <img src={user.avatar} alt={user?.name} />
                : <span>{user?.name?.[0] || 'A'}</span>
              }
            </div>
            <div className="user-info">
              <span className="user-name">{user?.name}</span>
              <span className="user-role">Admin</span>
            </div>
            <button onClick={handleLogout} className="logout-btn" title="Logout">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <main className="admin-main">
        <div className="admin-topbar">
          <button className="topbar-menu" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <div className="topbar-right">
            <a href="/" target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
              <ExternalLink size={13} /> View Site
            </a>
          </div>
        </div>

        <div className="admin-content">
          <Outlet />
        </div>
      </main>

      <style>{`
        .admin-layout {
          display: flex;
          min-height: 100vh;
          background: var(--bg);
        }
        .sidebar {
          width: 240px;
          flex-shrink: 0;
          background: var(--bg-2);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
          height: 100vh;
          z-index: 50;
        }
        .sidebar-header {
          padding: 20px 20px 16px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .sidebar-logo {
          font-family: var(--font-mono);
          font-size: 16px;
          color: var(--text);
          flex: 1;
        }
        .sidebar-label {
          font-family: var(--font-mono);
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-3);
          background: var(--bg-4);
          padding: 2px 7px;
          border-radius: 4px;
        }
        .sidebar-close {
          display: none;
          background: none;
          border: none;
          color: var(--text-3);
          cursor: pointer;
          padding: 2px;
        }
        .sidebar-nav {
          flex: 1;
          padding: 16px 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          overflow-y: auto;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          border-radius: var(--radius);
          color: var(--text-3);
          font-size: 14px;
          transition: all 0.15s;
          position: relative;
        }
        .nav-item:hover { background: var(--bg-3); color: var(--text-2); }
        .nav-item.active { background: var(--accent-glow); color: var(--accent); border: 1px solid rgba(212,168,83,0.2); }
        .nav-chevron { margin-left: auto; opacity: 0; transition: opacity 0.15s; }
        .nav-item:hover .nav-chevron, .nav-item.active .nav-chevron { opacity: 1; }
        .sidebar-footer {
          padding: 16px 12px;
          border-top: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .sidebar-site-link {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--text-3);
          padding: 6px 8px;
          border-radius: var(--radius);
          transition: color 0.15s;
        }
        .sidebar-site-link:hover { color: var(--accent); }
        .sidebar-user {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px;
          background: var(--bg-3);
          border-radius: var(--radius);
        }
        .user-avatar-sm {
          width: 32px; height: 32px;
          border-radius: 50%;
          background: var(--bg-4);
          border: 1px solid var(--border);
          overflow: hidden;
          flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-mono);
          font-size: 13px;
          color: var(--text-2);
        }
        .user-avatar-sm img { width: 100%; height: 100%; object-fit: cover; }
        .user-info { flex: 1; min-width: 0; }
        .user-name {
          display: block;
          font-size: 13px;
          color: var(--text);
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .user-role {
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--text-3);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .logout-btn {
          background: none;
          border: none;
          color: var(--text-3);
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: color 0.15s;
          display: flex;
          flex-shrink: 0;
        }
        .logout-btn:hover { color: var(--red); }
        .admin-main {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
        }
        .admin-topbar {
          display: none;
          align-items: center;
          justify-content: space-between;
          padding: 12px 20px;
          border-bottom: 1px solid var(--border);
          background: var(--bg-2);
          position: sticky;
          top: 0;
          z-index: 40;
        }
        .topbar-menu {
          background: none;
          border: none;
          color: var(--text);
          cursor: pointer;
          padding: 4px;
        }
        .admin-content { padding: 32px; flex: 1; }
        .sidebar-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          z-index: 49;
        }
        @media (max-width: 900px) {
          .sidebar {
            position: fixed;
            left: -240px;
            top: 0; bottom: 0;
            transition: left 0.25s var(--ease);
          }
          .sidebar.open { left: 0; }
          .sidebar-close { display: block; }
          .sidebar-overlay { display: block; }
          .admin-topbar { display: flex; }
          .admin-content { padding: 20px; }
        }
      `}</style>
    </div>
  );
}