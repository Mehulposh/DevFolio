
import { Link } from 'react-router-dom';
import {   Heart } from 'lucide-react';
import { FaGithub ,FaLinkedin  , FaTwitter  } from 'react-icons/fa';
export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <div>
            <div className="footer-logo">
              <span style={{ color: 'var(--accent)' }}>&lt;</span>dev
              <span style={{ color: 'var(--accent)' }}>/&gt;</span>
            </div>
            <p className="footer-tagline">
              Building thoughtful digital<br /> experiences.
            </p>
          </div>
          <div className="footer-links">
            <div className="footer-col">
              <span className="footer-col-title">Navigate</span>
              <Link to="/" className="footer-link">Home</Link>
              <Link to="/portfolio" className="footer-link">Portfolio</Link>
              <Link to="/blog" className="footer-link">Blog</Link>
            </div>
            <div className="footer-col">
              <span className="footer-col-title">Connect</span>
              <a href="https://github.com" target="_blank" rel="noreferrer" className="footer-link">GitHub</a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="footer-link">LinkedIn</a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="footer-link">Twitter</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span className="footer-copy">
            © {new Date().getFullYear()} DevFolio. Built with <Heart size={12} style={{ color: 'var(--accent)', display: 'inline', verticalAlign: 'middle' }} /> using MERN stack.
          </span>
          <div className="footer-social">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="social-link"><FaGithub size={16} /></a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="social-link"><FaLinkedin size={16} /></a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="social-link"><FaTwitter size={16} /></a>
          </div>
        </div>
      </div>
      <style>{`
        .footer {
          border-top: 1px solid var(--border);
          padding: 64px 0 32px;
          margin-top: 80px;
        }
        .footer-inner {
          display: flex;
          justify-content: space-between;
          gap: 48px;
          margin-bottom: 48px;
          flex-wrap: wrap;
        }
        .footer-logo {
          font-family: var(--font-mono);
          font-size: 18px;
          color: var(--text);
          font-weight: 500;
          margin-bottom: 12px;
        }
        .footer-tagline {
          font-size: 13px;
          color: var(--text-3);
          line-height: 1.6;
        }
        .footer-links { display: flex; gap: 64px; }
        .footer-col {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .footer-col-title {
          font-family: var(--font-mono);
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-3);
          margin-bottom: 4px;
        }
        .footer-link {
          font-size: 14px;
          color: var(--text-2);
          transition: color 0.15s;
        }
        .footer-link:hover { color: var(--accent); }
        .footer-bottom {
          border-top: 1px solid var(--border);
          padding-top: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .footer-copy {
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--text-3);
        }
        .footer-social { display: flex; gap: 16px; }
        @media (max-width: 600px) {
          .footer-links { gap: 32px; }
          .footer-bottom { flex-direction: column; gap: 16px; align-items: flex-start; }
        }
      `}</style>
    </footer>
  );
}