import  { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { Heart, Eye, Clock, ArrowLeft, Link2 } from 'lucide-react';
import {  FaTwitter , FaLinkedin } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../api/api.js';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

export default function BlogPost() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/blogs/${slug}`);
        setBlog(res.data.blog);
        setRelated(res.data.related || []);
        setLikeCount(res.data.blog.analytics?.likes || 0);
        // Check local storage for like state
        const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '{}');
        setLiked(!!likedPosts[res.data.blog._id]);
      } catch { /* 404 handled */ } finally {
        setLoading(false);
      }
    };
    load();
    window.scrollTo(0, 0);
  }, [slug]);

  const handleLike = async () => {
    if (liking) return;
    setLiking(true);
    try {
      const res = await api.post(`/blogs/${blog._id}/like`);
      setLiked(res.data.liked);
      setLikeCount(res.data.likes);
      const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '{}');
      if (res.data.liked) likedPosts[blog._id] = true;
      else delete likedPosts[blog._id];
      localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
    } catch { /* fail */ } finally {
      setLiking(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied!');
  };

  if (loading) return (
    <><Navbar />
      <div style={{ padding: '120px 0', display: 'flex', justifyContent: 'center' }}>
        <div className="loader" />
      </div>
    </>
  );

  if (!blog) return (
    <><Navbar />
      <div style={{ padding: '120px 0', textAlign: 'center' }}>
        <h2>Post not found</h2>
        <Link to="/blog" className="btn btn-ghost" style={{ marginTop: 16 }}>Back to Blog</Link>
      </div>
    </>
  );

  const date = blog.publishedAt
    ? new Date(blog.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : '';

  return (
    <>
      <Helmet>
        <title>{blog.seo?.metaTitle || blog.title} — DevFolio</title>
        <meta name="description" content={blog.seo?.metaDescription || blog.excerpt} />
        {blog.seo?.keywords?.length > 0 && (
          <meta name="keywords" content={blog.seo.keywords.join(', ')} />
        )}
        <meta property="og:title" content={blog.title} />
        <meta property="og:description" content={blog.excerpt} />
        {blog.coverImage?.url && <meta property="og:image" content={blog.coverImage.url} />}
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={blog.title} />
        <meta name="twitter:description" content={blog.excerpt} />
        {blog.coverImage?.url && <meta name="twitter:image" content={blog.coverImage.url} />}
        <link rel="canonical" href={window.location.href} />
      </Helmet>
      <Navbar />

      <article className="post-page">
        {/* Hero */}
        <div className="post-hero">
          <div className="container-sm">
            <Link to="/blog" className="back-link">
              <ArrowLeft size={14} /> All Posts
            </Link>
            <div className="post-meta-top">
              {blog.category && <span className="tag active">{blog.category}</span>}
              {date && <span className="post-date">{date}</span>}
              <span className="meta-item-sm"><Clock size={12} /> {blog.analytics?.readTime || 1} min read</span>
              <span className="meta-item-sm"><Eye size={12} /> {blog.analytics?.views || 0} views</span>
            </div>
            <h1 className="post-title">{blog.title}</h1>
            <p className="post-excerpt">{blog.excerpt}</p>
            {blog.author && (
              <div className="post-author">
                {blog.author.avatar
                  ? <img src={blog.author.avatar} alt={blog.author.name} className="author-avatar" />
                  : <div className="author-avatar-placeholder">{blog.author.name?.[0]}</div>
                }
                <span className="author-name">{blog.author.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Cover Image */}
        {blog.coverImage?.url && (
          <div className="post-cover-wrap">
            <div className="container">
              <img src={blog.coverImage.url} alt={blog.coverImage.alt || blog.title} className="post-cover-img" />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="post-content-wrap">
          <div className="container-sm">
            <div className="prose post-body">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight, rehypeRaw]}
              >
                {blog.content}
              </ReactMarkdown>
            </div>

            {/* Tags */}
            {blog.tags?.length > 0 && (
              <div className="post-tags">
                {blog.tags.map(t => (
                  <Link key={t} to={`/blog?tag=${t}`} className="tag">{t}</Link>
                ))}
              </div>
            )}

            {/* Like + Share */}
            <div className="post-actions">
              <button
                onClick={handleLike}
                className={`like-btn ${liked ? 'liked' : ''}`}
                disabled={liking}
              >
                <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
                <span>{likeCount}</span>
              </button>
              <div className="share-btns">
                <span className="share-label">Share:</span>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(window.location.href)}`}
                  target="_blank" rel="noreferrer"
                  className="btn btn-ghost btn-sm"
                >
                  <FaTwitter size={13} /> Twitter
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                  target="_blank" rel="noreferrer"
                  className="btn btn-ghost btn-sm"
                >
                  <FaLinkedin size={13} /> LinkedIn
                </a>
                <button onClick={copyLink} className="btn btn-ghost btn-sm">
                  <Link2 size={13} /> Copy
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        {related.length > 0 && (
          <div className="related-section">
            <div className="container">
              <h3 className="related-title">Related Posts</h3>
              <div className="related-grid">
                {related.map(post => {
                  const d = post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
                  return (
                    <Link key={post._id} to={`/blog/${post.slug}`} className="related-card">
                      {post.coverImage?.url && (
                        <div className="related-cover">
                          <img src={post.coverImage.url} alt={post.title} />
                        </div>
                      )}
                      <div className="related-body">
                        <span className="post-date">{d}</span>
                        <div className="blog-card-title" style={{ fontSize: '1rem' }}>{post.title}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </article>

      <Footer />

      <style>{`
        .post-page { padding-top: 64px; }
        .post-hero { padding: 60px 0 48px; }
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--text-3);
          margin-bottom: 28px;
          transition: color 0.15s;
        }
        .back-link:hover { color: var(--accent); }
        .post-meta-top {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        .post-date {
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--text-3);
        }
        .meta-item-sm {
          display: flex;
          align-items: center;
          gap: 4px;
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--text-3);
        }
        .post-title {
          font-size: clamp(2rem, 5vw, 3.5rem);
          margin-bottom: 20px;
          line-height: 1.15;
        }
        .post-excerpt {
          font-size: 1.1rem;
          color: var(--text-2);
          max-width: 600px;
          margin-bottom: 24px;
        }
        .post-author {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .author-avatar {
          width: 36px; height: 36px;
          border-radius: 50%;
          object-fit: cover;
          border: 1px solid var(--border);
        }
        .author-avatar-placeholder {
          width: 36px; height: 36px;
          border-radius: 50%;
          background: var(--bg-4);
          border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-mono);
          font-size: 14px;
          color: var(--text-2);
        }
        .author-name {
          font-family: var(--font-mono);
          font-size: 13px;
          color: var(--text-2);
        }
        .post-cover-wrap { margin-bottom: 60px; }
        .post-cover-img {
          width: 100%;
          max-height: 520px;
          object-fit: cover;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
        }
        .post-content-wrap { padding-bottom: 80px; }
        .post-body { animation: fadeIn 0.5s var(--ease) both; }
        .post-tags {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 48px;
          padding-top: 32px;
          border-top: 1px solid var(--border);
        }
        .post-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid var(--border);
          flex-wrap: wrap;
          gap: 16px;
        }
        .like-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: var(--bg-3);
          border: 1px solid var(--border);
          border-radius: 100px;
          color: var(--text-3);
          cursor: pointer;
          font-family: var(--font-mono);
          font-size: 14px;
          transition: all 0.2s;
        }
        .like-btn:hover { border-color: var(--red); color: var(--red); }
        .like-btn.liked { border-color: var(--red); color: var(--red); background: rgba(224,84,84,0.1); }
        .share-btns {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .share-label {
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--text-3);
        }
        .related-section {
          border-top: 1px solid var(--border);
          padding: 64px 0;
        }
        .related-title {
          font-family: var(--font-display);
          font-size: 1.5rem;
          color: var(--text);
          margin-bottom: 24px;
        }
        .related-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }
        .related-card {
          background: var(--bg-2);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          transition: border-color 0.2s, transform 0.2s;
          text-decoration: none;
        }
        .related-card:hover { border-color: var(--border-2); transform: translateY(-2px); }
        .related-cover { height: 140px; overflow: hidden; }
        .related-cover img { width: 100%; height: 100%; object-fit: cover; }
        .related-body { padding: 16px; }
      `}</style>
    </>
  );
}