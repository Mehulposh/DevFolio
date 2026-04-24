import  { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../api/api.js';
import { ArrowRight, BookOpen, Code2 } from 'lucide-react';
import { FaGithub , FaTwitter , FaLinkedin } from 'react-icons/fa';
import BlogCard from '../components/BlogCard.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

export default function Home() {
  const [featuredBlogs, setFeaturedBlogs] = useState([]);
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [blogsRes, projectsRes] = await Promise.all([
          api.get('/blogs?limit=3&featured=true'),
          api.get('/portfolio?featured=true')
        ]);
        setFeaturedBlogs(blogsRes.data.blogs || []);
        setFeaturedProjects(projectsRes.data.projects || []);
      } catch { /* silently fail */ } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <>
      <Helmet>
        <title>DevFolio — Developer Portfolio & Blog</title>
        <meta name="description" content="Full-stack developer crafting thoughtful digital experiences. Explore my projects and technical writing." />
        <meta property="og:title" content="DevFolio — Developer Portfolio & Blog" />
        <meta property="og:type" content="website" />
      </Helmet>
      <Navbar />

      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="hero-inner animate-in">
            <span className="hero-eyebrow">
              <span className="dot" />
              Available for work
            </span>
            <h1 className="hero-title">
              Building things<br />
              <em>for the web.</em>
            </h1>
            <p className="hero-desc">
              Full-stack developer with a passion for clean architecture, developer experience,
              and writing about what I learn along the way.
            </p>
            <div className="hero-actions">
              <Link to="/portfolio" className="btn btn-primary btn-lg">
                View Work <ArrowRight size={16} />
              </Link>
              <Link to="/blog" className="btn btn-ghost btn-lg">
                Read Blog <BookOpen size={16} />
              </Link>
            </div>
            <div className="hero-social">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="social-link">
                <FaGithub size={18} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="social-link">
                <FaLinkedin size={18} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="social-link">
                <FaTwitter size={18} />
              </a>
            </div>
          </div>

          <div className="hero-scroll-indicator">
            <span>scroll</span>
            <div className="scroll-line" />
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      {featuredProjects.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <div>
                <span className="section-label"><Code2 size={13} /> Selected Work</span>
                <h2>Projects</h2>
              </div>
              <Link to="/portfolio" className="btn btn-ghost">
                All Projects <ArrowRight size={14} />
              </Link>
            </div>
            <div className="projects-grid">
              {featuredProjects.slice(0, 3).map((project, i) => (
                <ProjectCard key={project._id} project={project} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Blogs */}
      {featuredBlogs.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <div>
                <span className="section-label"><BookOpen size={13} /> Writing</span>
                <h2>Latest Posts</h2>
              </div>
              <Link to="/blog" className="btn btn-ghost">
                All Posts <ArrowRight size={14} />
              </Link>
            </div>
            <div className="blog-list-featured">
              {featuredBlogs.map((blog, i) => (
                <BlogCard key={blog._id} blog={blog} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />

      <style>{`
        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          position: relative;
          padding: 100px 0 80px;
          overflow: hidden;
        }
        .hero::before {
          content: '';
          position: absolute;
          top: -200px;
          right: -200px;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(212,168,83,0.06) 0%, transparent 70%);
          pointer-events: none;
        }
        .hero-inner {
          max-width: 700px;
          animation-delay: 0.1s;
        }
        .hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--text-3);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 24px;
        }
        .dot {
          width: 7px; height: 7px;
          background: var(--green);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .hero-title {
          margin-bottom: 24px;
          color: var(--text);
        }
        .hero-title em {
          font-style: italic;
          color: var(--accent);
        }
        .hero-desc {
          font-size: 1.1rem;
          max-width: 520px;
          margin-bottom: 40px;
          color: var(--text-2);
        }
        .hero-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 48px;
        }
        .hero-social {
          display: flex;
          gap: 16px;
        }
        .social-link {
          color: var(--text-3);
          transition: color 0.2s;
          display: flex;
          align-items: center;
        }
        .social-link:hover { color: var(--accent); }
        .hero-scroll-indicator {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          color: var(--text-3);
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.1em;
        }
        .scroll-line {
          width: 1px;
          height: 40px;
          background: linear-gradient(to bottom, var(--text-3), transparent);
          animation: scrollLine 2s ease infinite;
        }
        @keyframes scrollLine {
          0% { transform: scaleY(0); transform-origin: top; }
          50% { transform: scaleY(1); transform-origin: top; }
          51% { transform: scaleY(1); transform-origin: bottom; }
          100% { transform: scaleY(0); transform-origin: bottom; }
        }

        .section { padding: 100px 0; }
        .section-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 48px;
        }
        .section-label {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--accent);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 8px;
          display: flex;
        }
        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 20px;
        }
        .project-card {
          background: var(--bg-2);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          transition: border-color 0.2s, transform 0.2s var(--ease);
          animation: fadeIn 0.5s var(--ease) both;
        }
        .project-card:hover {
          border-color: var(--border-2);
          transform: translateY(-3px);
        }
        .project-cover {
          height: 200px;
          background: var(--bg-4);
          overflow: hidden;
          position: relative;
        }
        .project-cover img { width: 100%; height: 100%; object-fit: cover; }
        .project-cover-placeholder {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, var(--bg-3), var(--bg-4));
          color: var(--text-3);
        }
        .project-body { padding: 24px; }
        .project-category {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--accent);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 8px;
        }
        .project-title {
          font-family: var(--font-display);
          font-size: 1.3rem;
          color: var(--text);
          margin-bottom: 10px;
        }
        .project-desc {
          font-size: 14px;
          color: var(--text-2);
          margin-bottom: 16px;
          line-height: 1.6;
        }
        .project-tech {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 20px;
        }
        .tech-chip {
          font-family: var(--font-mono);
          font-size: 11px;
          padding: 3px 8px;
          background: var(--bg-4);
          border-radius: 4px;
          color: var(--text-3);
        }
        .project-links { display: flex; gap: 8px; }

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



