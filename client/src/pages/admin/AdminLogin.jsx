import  { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>Admin Login — DevFolio</title></Helmet>

      <div className="login-page">
        <div className="login-card animate-in">
          <div className="login-brand">
            <span className="login-logo">
              <span style={{ color: 'var(--accent)' }}>&lt;</span>dev
              <span style={{ color: 'var(--accent)' }}>/&gt;</span>
            </span>
            <h2 className="login-title">Admin Access</h2>
            <p className="login-sub">Sign in to manage your content</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="admin@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="pass-wrap">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="pass-toggle"
                  onClick={() => setShowPass(s => !s)}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} disabled={loading}>
              {loading ? <span className="loader" style={{ width: 16, height: 16, borderWidth: 2 }} /> : <><LogIn size={15} /> Sign In</>}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg);
          padding: 24px;
          position: relative;
          overflow: hidden;
        }
        .login-page::before {
          content: '';
          position: absolute;
          top: -300px; left: -300px;
          width: 700px; height: 700px;
          background: radial-gradient(circle, rgba(212,168,83,0.05) 0%, transparent 70%);
          pointer-events: none;
        }
        .login-card {
          background: var(--bg-2);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 48px;
          width: 100%;
          max-width: 400px;
          animation-delay: 0.1s;
        }
        .login-brand { text-align: center; margin-bottom: 36px; }
        .login-logo {
          font-family: var(--font-mono);
          font-size: 22px;
          color: var(--text);
          display: block;
          margin-bottom: 16px;
        }
        .login-title {
          font-family: var(--font-display);
          font-size: 1.6rem;
          color: var(--text);
          margin-bottom: 8px;
        }
        .login-sub { font-size: 14px; color: var(--text-3); }
        .login-form { display: flex; flex-direction: column; gap: 20px; }
        .pass-wrap { position: relative; }
        .pass-wrap .form-input { padding-right: 42px; }
        .pass-toggle {
          position: absolute;
          right: 12px; top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--text-3);
          cursor: pointer;
          display: flex; align-items: center;
          transition: color 0.15s;
        }
        .pass-toggle:hover { color: var(--text); }
      `}</style>
    </>
  );
}