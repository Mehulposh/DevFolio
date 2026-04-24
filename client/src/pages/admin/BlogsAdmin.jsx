import  { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Eye, Heart, Search, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/api.js';

export default function BlogsAdmin() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleting, setDeleting] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const params = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const res = await api.get(`/blogs/admin${params}`);
      setBlogs(res.data.blogs);
    } catch { toast.error('Failed to load blogs'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [statusFilter]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this blog post? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await api.delete(`/blogs/${id}`);
      toast.success('Blog deleted');
      setBlogs(b => b.filter(x => x._id !== id));
    } catch { toast.error('Failed to delete'); }
    finally { setDeleting(null); }
  };

  const handleToggleStatus = async (blog) => {
    const newStatus = blog.status === 'published' ? 'draft' : 'published';
    try {
      await api.put(`/blogs/${blog._id}`, { status: newStatus });
      setBlogs(b => b.map(x => x._id === blog._id ? { ...x, status: newStatus } : x));
      toast.success(`Post ${newStatus === 'published' ? 'published' : 'moved to draft'}`);
    } catch { toast.error('Failed to update status'); }
  };

  const filtered = blogs.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="blogs-admin">
      <div className="page-top">
        <div>
          <h2 className="page-title">Blog Posts</h2>
          <p className="page-desc">{blogs.length} total posts</p>
        </div>
        <Link to="/admin/blogs/new" className="btn btn-primary">
          <Plus size={15} /> New Post
        </Link>
      </div>

      {/* Filters */}
      <div className="admin-controls">
        <div className="search-wrap">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search posts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="status-tabs">
          {['all', 'published', 'draft'].map(s => (
            <button
              key={s}
              className={`status-tab ${statusFilter === s ? 'active' : ''}`}
              onClick={() => setStatusFilter(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
              {s !== 'all' && (
                <span className="tab-count">
                  {blogs.filter(b => b.status === s).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="table-loading">
          {[...Array(5)].map((_, i) => <div key={i} className="row-skeleton" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-admin">
          <p>No posts found.</p>
          <Link to="/admin/blogs/new" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>
            <Plus size={13} /> Create Post
          </Link>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="blogs-table">
            <thead>
              <tr>
                <th>Post</th>
                <th>Status</th>
                <th>Views</th>
                <th>Likes</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(blog => (
                <tr key={blog._id}>
                  <td className="post-cell">
                    {blog.coverImage?.url && (
                      <img src={blog.coverImage.url} alt="" className="post-thumb" />
                    )}
                    <div className="post-cell-info">
                      <span className="post-cell-title">{blog.title}</span>
                      <div className="post-cell-meta">
                        {blog.tags?.slice(0, 3).map(t => (
                          <span key={t} className="tag" style={{ fontSize: 10 }}>{t}</span>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td>
                    <button
                      className={`badge ${blog.status === 'published' ? 'badge-green' : 'badge-yellow'}`}
                      style={{ cursor: 'pointer', border: 'none', background: blog.status === 'published' ? 'rgba(76,175,125,0.15)' : 'rgba(212,168,83,0.15)' }}
                      onClick={() => handleToggleStatus(blog)}
                      title="Click to toggle status"
                    >
                      {blog.status}
                    </button>
                  </td>
                  <td className="num-cell">
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Eye size={12} /> {blog.analytics?.views || 0}
                    </span>
                  </td>
                  <td className="num-cell">
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Heart size={12} /> {blog.analytics?.likes || 0}
                    </span>
                  </td>
                  <td className="date-cell">
                    {blog.publishedAt
                      ? new Date(blog.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : <span style={{ color: 'var(--text-3)' }}>Draft</span>
                    }
                  </td>
                  <td>
                    <div className="action-btns">
                      {blog.status === 'published' && (
                        <a
                          href={`/blog/${blog.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="action-btn"
                          title="View live"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                      <Link
                        to={`/admin/blogs/edit/${blog._id}`}
                        className="action-btn"
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </Link>
                      <button
                        className="action-btn danger"
                        onClick={() => handleDelete(blog._id)}
                        disabled={deleting === blog._id}
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        .blogs-admin { max-width: 1100px; }
        .page-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 28px;
          gap: 16px;
          flex-wrap: wrap;
        }
        .page-title { font-size: 1.8rem; margin-bottom: 4px; }
        .page-desc { font-size: 13px; color: var(--text-3); }
        .admin-controls {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        .search-wrap { position: relative; }
        .search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: var(--text-3); pointer-events: none; }
        .search-input {
          background: var(--bg-3);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          color: var(--text);
          font-family: var(--font-mono);
          font-size: 13px;
          padding: 8px 12px 8px 32px;
          width: 220px;
        }
        .search-input:focus { outline: none; border-color: var(--accent); }
        .status-tabs { display: flex; gap: 4px; }
        .status-tab {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          background: var(--bg-3);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          color: var(--text-3);
          cursor: pointer;
          font-family: var(--font-mono);
          font-size: 12px;
          transition: all 0.15s;
        }
        .status-tab:hover { border-color: var(--border-2); color: var(--text); }
        .status-tab.active { background: var(--accent-glow); border-color: rgba(212,168,83,0.3); color: var(--accent); }
        .tab-count {
          background: var(--bg-4);
          padding: 1px 6px;
          border-radius: 10px;
          font-size: 10px;
        }
        .table-loading { display: flex; flex-direction: column; gap: 8px; }
        .row-skeleton { height: 64px; background: var(--bg-2); border-radius: var(--radius); animation: shimmer 1.5s infinite; border: 1px solid var(--border); }
        .empty-admin { text-align: center; padding: 80px; color: var(--text-3); }
        .blogs-table { width: 100%; border-collapse: collapse; }
        .blogs-table th {
          text-align: left;
          padding: 12px 16px;
          font-family: var(--font-mono);
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-3);
          border-bottom: 1px solid var(--border);
          background: var(--bg-3);
        }
        .blogs-table td {
          padding: 12px 16px;
          border-bottom: 1px solid var(--border);
          vertical-align: middle;
          font-size: 14px;
          color: var(--text-2);
        }
        .blogs-table tr:last-child td { border-bottom: none; }
        .blogs-table tr:hover td { background: var(--bg-3); }
        .post-cell { display: flex !important; align-items: center; gap: 12px; }
        .post-thumb { width: 48px; height: 36px; border-radius: 4px; object-fit: cover; flex-shrink: 0; }
        .post-cell-title { display: block; font-size: 14px; color: var(--text); font-weight: 500; margin-bottom: 4px; }
        .post-cell-meta { display: flex; gap: 4px; flex-wrap: wrap; }
        .num-cell { font-family: var(--font-mono); font-size: 13px; white-space: nowrap; }
        .date-cell { font-family: var(--font-mono); font-size: 12px; color: var(--text-3); white-space: nowrap; }
        .action-btns { display: flex; gap: 4px; align-items: center; }
        .action-btn {
          width: 30px; height: 30px;
          display: flex; align-items: center; justify-content: center;
          background: var(--bg-4);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          color: var(--text-3);
          cursor: pointer;
          transition: all 0.15s;
          text-decoration: none;
        }
        .action-btn:hover { border-color: var(--border-2); color: var(--text); }
        .action-btn.danger:hover { border-color: var(--red); color: var(--red); background: rgba(224,84,84,0.1); }
        .action-btn:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>
    </div>
  );
}