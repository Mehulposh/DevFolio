import  { useState, useEffect } from 'react';
import {  useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {  Search } from 'lucide-react';
import api from '../api/api.js';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import BlogCard from '../components/BlogCard.jsx';

export default function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [tags, setTags] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1');
  const tag = searchParams.get('tag') || '';
  const search = searchParams.get('search') || '';

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page, limit: 9 });
        if (tag) params.set('tag', tag);
        if (search) params.set('search', search);

        const [blogsRes, tagsRes] = await Promise.all([
          api.get(`/blogs?${params}`),
          api.get('/blogs/tags')
        ]);
        setBlogs(blogsRes.data.blogs);
        setPagination(blogsRes.data.pagination);
        setTags(tagsRes.data.tags);
      } catch { /* fail */ } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, tag, search]);

  const setTag = (t) => {
    const p = new URLSearchParams(searchParams);
    if (t) { p.set('tag', t); p.delete('page'); } else p.delete('tag');
    setSearchParams(p);
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      const p = new URLSearchParams(searchParams);
      if (e.target.value) { p.set('search', e.target.value); p.delete('page'); } else p.delete('search');
      setSearchParams(p);
    }
  };

  return (
    <>
      <Helmet>
        <title>Blog — DevFolio</title>
        <meta name="description" content="Technical writing on web development, engineering, and lessons learned." />
      </Helmet>
      <Navbar />

      <div className="blog-page">
        <div className="container">
          {/* Header */}
          <div className="page-header animate-in">
            <span className="section-label-sm">Writing</span>
            <h1>Blog</h1>
            <p>Thoughts on software development, architecture, and things I learn building on the web.</p>
          </div>

          {/* Search + Filter */}
          <div className="blog-controls">
            <div className="search-wrap">
              <Search size={15} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search posts..."
                defaultValue={search}
                onKeyDown={handleSearch}
              />
            </div>
            <div className="tag-filters">
              <button
                className={`tag ${!tag ? 'active' : ''}`}
                onClick={() => setTag('')}
              >All</button>
              {tags.map(t => (
                <button
                  key={t}
                  className={`tag ${tag === t ? 'active' : ''}`}
                  onClick={() => setTag(t)}
                >{t}</button>
              ))}
            </div>
          </div>

          {/* Blog Grid */}
          {loading ? (
            <div className="blogs-loading">
              {[...Array(6)].map((_, i) => <div key={i} className="blog-skeleton" />)}
            </div>
          ) : blogs.length === 0 ? (
            <div className="empty-state">
              <p>No posts found.</p>
            </div>
          ) : (
            <div className="blogs-grid">
              {blogs.map((blog, i) => (
                <BlogCard key={blog._id} blog={blog} index={i} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="pagination">
              {[...Array(pagination.pages)].map((_, i) => (
                <button
                  key={i}
                  className={`page-btn ${page === i + 1 ? 'active' : ''}`}
                  onClick={() => {
                    const p = new URLSearchParams(searchParams);
                    p.set('page', i + 1);
                    setSearchParams(p);
                  }}
                >{i + 1}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />

      <style>{`
        .blog-page { padding: 100px 0 0; }
        .page-header { padding: 60px 0 48px; }
        .page-header h1 { margin: 8px 0 16px; }
        .page-header p { max-width: 560px; font-size: 1.05rem; }
        .section-label-sm {
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--accent);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .blog-controls {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 48px;
          flex-wrap: wrap;
        }
        .search-wrap {
          position: relative;
          flex-shrink: 0;
        }
        .search-icon {
          position: absolute;
          left: 12px; top: 50%;
          transform: translateY(-50%);
          color: var(--text-3);
          pointer-events: none;
        }
        .search-input {
          background: var(--bg-3);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          color: var(--text);
          font-family: var(--font-mono);
          font-size: 13px;
          padding: 9px 14px 9px 36px;
          width: 240px;
          transition: border-color 0.2s;
        }
        .search-input:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--accent-glow);
        }
        .tag-filters { display: flex; gap: 8px; flex-wrap: wrap; }

        .blogs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
          margin-bottom: 60px;
        }
        .blogs-loading {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }
        .blog-skeleton {
          height: 280px;
          background: var(--bg-2);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        
        .empty-state {
          text-align: center;
          padding: 80px 0;
          color: var(--text-3);
        }
        .pagination {
          display: flex;
          justify-content: center;
          gap: 8px;
          padding: 40px 0 60px;
        }
        .page-btn {
          width: 36px; height: 36px;
          background: var(--bg-3);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          color: var(--text-2);
          cursor: pointer;
          font-family: var(--font-mono);
          font-size: 13px;
          transition: all 0.15s;
        }
        .page-btn:hover { border-color: var(--border-2); color: var(--text); }
        .page-btn.active { background: var(--accent); border-color: var(--accent); color: #080808; }
      `}</style>
    </>
  );
}

