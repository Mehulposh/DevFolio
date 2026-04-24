import  { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [location]);

  const links = [
    { to: '/', label: 'Home' },
    { to: '/portfolio', label: 'Work' },
    { to: '/blog', label: 'Blog' },
  ];

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="logo-bracket">&lt;</span>
          <span className="logo-name">dev</span>
          <span className="logo-bracket">/&gt;</span>
        </Link>

        <div className="navbar-links">
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`navbar-link ${location.pathname === l.to ? 'active' : ''}`}
            >
              {l.label}
            </Link>
          ))}
          <Link to="/admin" className="btn btn-ghost btn-sm">Admin</Link>
        </div>

        <button className="navbar-toggle" onClick={() => setOpen(o => !o)}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="navbar-mobile">
          {links.map(l => (
            <Link key={l.to} to={l.to} className="navbar-mobile-link">{l.label}</Link>
          ))}
          <Link to="/admin" className="navbar-mobile-link">Admin Panel</Link>
        </div>
      )}

      <style>{`
        .navbar {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          transition: background 0.3s, border-color 0.3s, backdrop-filter 0.3s;
          border-bottom: 1px solid transparent;
        }
        .navbar.scrolled {
          background: rgba(8,8,8,0.9);
          border-color: var(--border);
          backdrop-filter: blur(12px);
        }
        .navbar-inner {
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .navbar-logo {
          font-family: var(--font-mono);
          font-size: 16px;
          color: var(--text);
          font-weight: 500;
        }
        .logo-bracket { color: var(--accent); }
        .logo-name { color: var(--text); margin: 0 1px; }
        .navbar-links {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .navbar-link {
          font-family: var(--font-mono);
          font-size: 13px;
          color: var(--text-3);
          padding: 6px 12px;
          border-radius: var(--radius);
          transition: color 0.2s;
        }
        .navbar-link:hover { color: var(--text); }
        .navbar-link.active { color: var(--text); }
        .navbar-toggle {
          display: none;
          background: none;
          border: none;
          color: var(--text);
          cursor: pointer;
          padding: 4px;
        }
        .navbar-mobile {
          background: var(--bg-2);
          border-top: 1px solid var(--border);
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .navbar-mobile-link {
          font-family: var(--font-mono);
          font-size: 14px;
          color: var(--text-2);
          padding: 10px 12px;
          border-radius: var(--radius);
        }
        .navbar-mobile-link:hover { background: var(--bg-3); color: var(--text); }
        @media (max-width: 768px) {
          .navbar-links { display: none; }
          .navbar-toggle { display: block; }
        }
      `}</style>
    </nav>
  );
}