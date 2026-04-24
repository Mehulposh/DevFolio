import  { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart2, Eye, Heart, FileText, TrendingUp, Plus, ArrowRight, ExternalLink } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../../api/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

function StatCard({ icon: Icon, label, value, color, trend }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: `${color}15`, color }}>
        <Icon size={18} />
      </div>
      <div>
        <div className="stat-value">{value?.toLocaleString() ?? '—'}</div>
        <div className="stat-label">{label}</div>
      </div>
      {trend && <div className="stat-trend">{trend}</div>}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/overview')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const chartData = data?.viewsByMonth?.map(m => ({
    name: new Date(m._id.year, m._id.month - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    views: m.views,
    posts: m.posts
  })) || [];

  return (
    <div className="dashboard">
      {/* Welcome */}
      <div className="dash-header">
        <div>
          <h2 className="dash-title">Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋</h2>
          <p className="dash-sub">Here's what's happening with your blog.</p>
        </div>
        <Link to="/admin/blogs/new" className="btn btn-primary">
          <Plus size={15} /> New Post
        </Link>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="stats-grid">
          {[...Array(4)].map((_, i) => <div key={i} className="stat-skeleton" />)}
        </div>
      ) : (
        <div className="stats-grid">
          <StatCard icon={Eye} label="Total Views" value={data?.overview?.totalViews} color="var(--blue)" />
          <StatCard icon={Heart} label="Total Likes" value={data?.overview?.totalLikes} color="var(--red)" />
          <StatCard icon={FileText} label="Published Posts" value={data?.overview?.publishedBlogs} color="var(--green)" />
          <StatCard icon={BarChart2} label="Draft Posts" value={data?.overview?.draftBlogs} color="var(--accent)" />
        </div>
      )}

      {/* Charts + Top Posts */}
      <div className="dash-grid">
        {/* Views Chart */}
        <div className="card dash-chart-card">
          <div className="card-header">
            <h4><TrendingUp size={15} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />Views Over Time</h4>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 8, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-3)', fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-3)', fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 6, fontFamily: 'DM Mono', fontSize: 12 }}
                  labelStyle={{ color: 'var(--text)', marginBottom: 4 }}
                  itemStyle={{ color: 'var(--text-2)' }}
                  cursor={{ fill: 'var(--bg-4)' }}
                />
                <Bar dataKey="views" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-chart">No data yet</div>
          )}
        </div>

        {/* Top Posts */}
        <div className="card">
          <div className="card-header">
            <h4>Top Posts</h4>
            <Link to="/admin/blogs" className="card-link">All Posts <ArrowRight size={12} /></Link>
          </div>
          {data?.topPosts?.length > 0 ? (
            <div className="top-posts">
              {data.topPosts.slice(0, 5).map((post, i) => (
                <div key={post._id} className="top-post-item">
                  <span className="top-rank">#{i + 1}</span>
                  <div className="top-post-info">
                    <span className="top-post-title">{post.title}</span>
                    <div className="top-post-meta">
                      <span><Eye size={11} /> {post.analytics?.views || 0}</span>
                      <span><Heart size={11} /> {post.analytics?.likes || 0}</span>
                    </div>
                  </div>
                  <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer" className="top-post-link">
                    <ExternalLink size={12} />
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-chart">No posts yet</div>
          )}
        </div>
      </div>

      {/* Recent Posts */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header">
          <h4>Recent Posts</h4>
          <Link to="/admin/blogs" className="card-link">Manage <ArrowRight size={12} /></Link>
        </div>
        {data?.recentBlogs?.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Views</th>
                <th>Likes</th>
                <th>Published</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.recentBlogs.map(post => (
                <tr key={post._id}>
                  <td className="post-title-cell">{post.title}</td>
                  <td><span className="meta-item-sm"><Eye size={11} /> {post.analytics?.views || 0}</span></td>
                  <td><span className="meta-item-sm"><Heart size={11} /> {post.analytics?.likes || 0}</span></td>
                  <td className="date-cell">
                    {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : '—'}
                  </td>
                  <td>
                    <Link to={`/admin/blogs/edit/${post._id}`} className="btn btn-ghost btn-sm">Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-chart">
            <p style={{ marginBottom: 16 }}>No posts yet.</p>
            <Link to="/admin/blogs/new" className="btn btn-primary btn-sm"><Plus size={13} /> Create First Post</Link>
          </div>
        )}
      </div>

      <style>{`
        .dashboard { max-width: 1100px; }
        .dash-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 16px;
        }
        .dash-title { font-size: 1.8rem; margin-bottom: 6px; }
        .dash-sub { color: var(--text-3); font-size: 14px; }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        .stat-card {
          background: var(--bg-2);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .stat-skeleton {
          height: 84px;
          background: var(--bg-2);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          animation: shimmer 1.5s infinite;
        }
        .stat-icon {
          width: 44px; height: 44px;
          border-radius: var(--radius);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .stat-value {
          font-family: var(--font-display);
          font-size: 1.6rem;
          color: var(--text);
          line-height: 1;
          margin-bottom: 4px;
        }
        .stat-label {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-3);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .dash-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 20px;
          margin-bottom: 0;
        }
        .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .card-header h4 {
          font-family: var(--font-display);
          font-size: 1.1rem;
          color: var(--text);
        }
        .card-link {
          display: flex;
          align-items: center;
          gap: 4px;
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--text-3);
          transition: color 0.15s;
        }
        .card-link:hover { color: var(--accent); }
        .empty-chart {
          text-align: center;
          padding: 40px 0;
          color: var(--text-3);
          font-size: 14px;
        }
        .top-posts { display: flex; flex-direction: column; gap: 4px; }
        .top-post-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px;
          border-radius: var(--radius);
          transition: background 0.15s;
        }
        .top-post-item:hover { background: var(--bg-3); }
        .top-rank {
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--text-3);
          width: 24px;
          flex-shrink: 0;
        }
        .top-post-info { flex: 1; min-width: 0; }
        .top-post-title {
          display: block;
          font-size: 13px;
          color: var(--text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: 3px;
        }
        .top-post-meta {
          display: flex;
          gap: 12px;
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-3);
        }
        .top-post-meta span { display: flex; align-items: center; gap: 3px; }
        .top-post-link {
          color: var(--text-3);
          transition: color 0.15s;
          flex-shrink: 0;
        }
        .top-post-link:hover { color: var(--accent); }
        .admin-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }
        .admin-table th {
          text-align: left;
          padding: 8px 12px;
          font-family: var(--font-mono);
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-3);
          border-bottom: 1px solid var(--border);
          background: var(--bg-3);
        }
        .admin-table td {
          padding: 12px;
          border-bottom: 1px solid var(--border);
          color: var(--text-2);
          vertical-align: middle;
        }
        .admin-table tr:last-child td { border-bottom: none; }
        .admin-table tr:hover td { background: var(--bg-3); }
        .post-title-cell { color: var(--text) !important; max-width: 280px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .date-cell { font-family: var(--font-mono); font-size: 12px; color: var(--text-3) !important; white-space: nowrap; }
        .meta-item-sm { display: flex; align-items: center; gap: 4px; font-family: var(--font-mono); font-size: 12px; }
        @media (max-width: 900px) {
          .dash-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}