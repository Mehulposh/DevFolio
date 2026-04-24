
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';



// Public Pages
import Home from './pages/Home';
import BlogList from './pages/BlogList';
import BlogPost from './pages/BlogPost';
import Portfolio from './pages/Portfolio';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin.jsx';
import AdminLayout from './pages/admin/AdminLayout.jsx';
import Dashboard from './pages/admin/Dashboard';
import BlogsAdmin from './pages/admin/BlogsAdmin';
import BlogEditor from './pages/admin/BlogsEditor.jsx';
import ProjectsAdmin from './pages/admin/AdminProjects.jsx';
import SettingsAdmin from './pages/admin/SettingsAdmin';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="loading-screen">
      <div className="loader" />
    </div>
  );
  return user ? children : <Navigate to="/admin/login" replace />;
};

const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/admin" replace /> : children;
};

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#0a0a0a',
                color: '#f0f0f0',
                border: '1px solid #2a2a2a',
                fontFamily: 'DM Mono, monospace',
                fontSize: '13px'
              }
            }}
          />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/portfolio" element={<Portfolio />} />

            {/* Admin routes */}
            <Route path="/admin/login" element={
              <PublicOnlyRoute><AdminLogin /></PublicOnlyRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute><AdminLayout /></ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="blogs" element={<BlogsAdmin />} />
              <Route path="blogs/new" element={<BlogEditor />} />
              <Route path="blogs/edit/:id" element={<BlogEditor />} />
              <Route path="projects" element={<ProjectsAdmin />} />
              <Route path="settings" element={<SettingsAdmin />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;

