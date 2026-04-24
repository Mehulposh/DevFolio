import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

function BlogCard({ blog, index }) {
  const date = blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
  return (
    <>
    <Link
      to={`/blog/${blog.slug}`}
      className="blog-card-featured"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {blog.coverImage?.url && (
        <div className="blog-cover-sm">
          <img src={blog.coverImage.url} alt={blog.title} />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="blog-meta-row">
          <span className="blog-date">{date}</span>
          {blog.tags?.slice(0, 2).map(t => (
            <span key={t} className="tag" style={{ fontSize: 10 }}>{t}</span>
          ))}
          {blog.analytics?.readTime && (
            <span className="blog-date">{blog.analytics.readTime} min read</span>
          )}
        </div>
        <div className="blog-title-sm">{blog.title}</div>
        <div className="blog-excerpt-sm">{blog.excerpt}</div>
      </div>
      <ArrowRight size={16} className="blog-arrow" />
    </Link>

     <style>{`
        
        .blog-list-featured {
          display: flex;
          flex-direction: column;
          gap: 1px;
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }
        .blog-card-featured {
          background: var(--bg-2);
          padding: 28px 32px;
          display: flex;
          gap: 24px;
          align-items: center;
          border-bottom: 1px solid var(--border);
          transition: background 0.15s;
          animation: fadeIn 0.5s var(--ease) both;
          text-decoration: none;
        }
        .blog-card-featured:last-child { border-bottom: none; }
        .blog-card-featured:hover { background: var(--bg-3); }
        .blog-cover-sm {
          width: 80px; height: 60px;
          border-radius: 6px;
          overflow: hidden;
          flex-shrink: 0;
          background: var(--bg-4);
        }
        .blog-cover-sm img { width: 100%; height: 100%; object-fit: cover; }
        .blog-meta-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 6px;
          flex-wrap: wrap;
        }
        .blog-date {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-3);
        }
        .blog-title-sm {
          font-family: var(--font-display);
          font-size: 1.1rem;
          color: var(--text);
          margin-bottom: 6px;
        }
        .blog-excerpt-sm {
          font-size: 13px;
          color: var(--text-3);
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .blog-arrow {
          margin-left: auto;
          color: var(--text-3);
          flex-shrink: 0;
          transition: transform 0.2s, color 0.2s;
        }
        .blog-card-featured:hover .blog-arrow {
          transform: translateX(4px);
          color: var(--accent);
        }
        @media (max-width: 768px) {
          .section-header { flex-direction: column; align-items: flex-start; gap: 16px; }
          .projects-grid { grid-template-columns: 1fr; }
          .blog-card-featured { padding: 20px; }
          .blog-cover-sm { display: none; }
        }
      `}</style>
    </>
  );
}


export default BlogCard