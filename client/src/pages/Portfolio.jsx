import  { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '../api/api.js';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import ProjectCard from '../components/ProjectCard.jsx';

const CATEGORIES = ['all', 'web', 'mobile', 'api', 'ml', 'other'];

export default function Portfolio() {
  const [projects, setProjects] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/portfolio')
      .then(r => { setProjects(r.data.projects); setFiltered(r.data.projects); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeCategory === 'all') setFiltered(projects);
    else setFiltered(projects.filter(p => p.category === activeCategory));
  }, [activeCategory, projects]);

  return (
    <>
      <Helmet>
        <title>Portfolio — DevFolio</title>
        <meta name="description" content="A showcase of my work — web apps, APIs, and side projects." />
      </Helmet>
      <Navbar />

      <div className="portfolio-page">
        <div className="container">
          <div className="page-header animate-in">
            <span className="section-label-sm">Selected Work</span>
            <h1>Portfolio</h1>
            <p>A collection of projects I've built — from full-stack web apps to experiments.</p>
          </div>

          {/* Category Filter */}
          <div className="cat-filters">
            {CATEGORIES.map(c => (
              <button
                key={c}
                className={`tag ${activeCategory === c ? 'active' : ''}`}
                onClick={() => setActiveCategory(c)}
                style={{ textTransform: 'capitalize' }}
              >{c}</button>
            ))}
          </div>

          {loading ? (
            <div className="projects-loading">
              {[...Array(6)].map((_, i) => <div key={i} className="project-skeleton" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state"><p>No projects found.</p></div>
          ) : (
            <div className="projects-masonry">
              {filtered.map((project, i) => (
                <ProjectCard key={project._id} project={project} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />

      <style>{`
        .portfolio-page { padding: 100px 0 0; }
        .page-header { padding: 60px 0 40px; }
        .page-header h1 { margin: 8px 0 16px; }
        .page-header p { max-width: 560px; font-size: 1.05rem; }
        .section-label-sm {
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--accent);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .cat-filters { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 48px; }
        .projects-masonry {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
          margin-bottom: 80px;
        }
        .projects-loading {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }
        .project-skeleton {
          height: 320px;
          background: var(--bg-2);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          animation: shimmer 1.5s infinite;
        }
        .project-card-v2 {
          background: var(--bg-2);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          transition: border-color 0.2s, transform 0.2s var(--ease);
          animation: fadeIn 0.4s var(--ease) both;
        }
        .project-card-v2:hover {
          border-color: var(--border-2);
          transform: translateY(-4px);
        }
        .project-cover-v2 {
          height: 200px;
          background: var(--bg-4);
          overflow: hidden;
          position: relative;
        }
        .project-cover-v2 img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s var(--ease); }
        .project-card-v2:hover .project-cover-v2 img { transform: scale(1.05); }
        .project-placeholder-v2 {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, var(--bg-3) 0%, var(--bg-4) 100%);
          color: var(--text-3);
        }
        .featured-badge {
          position: absolute;
          top: 12px; right: 12px;
          font-family: var(--font-mono);
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          padding: 3px 8px;
          background: var(--accent);
          color: #080808;
          border-radius: 4px;
        }
        .project-body-v2 { padding: 24px; }
        .project-cat {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--accent);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 8px;
        }
        .project-name-v2 {
          font-family: var(--font-display);
          font-size: 1.25rem;
          color: var(--text);
          margin-bottom: 10px;
        }
        .project-desc-v2 {
          font-size: 13px;
          color: var(--text-2);
          line-height: 1.65;
          margin-bottom: 16px;
        }
        .tech-row { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 20px; }
        .project-actions { display: flex; gap: 8px; }
        .empty-state {
          text-align: center;
          padding: 80px 0;
          color: var(--text-3);
        }
      `}</style>
    </>
  );
}
