import {   ExternalLink, Code2 } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';

function ProjectCard({ project, index }) {
  return (
    <>
    <div className="project-card" style={{ animationDelay: `${index * 0.1}s` }}>
      <div className="project-cover">
        {project.coverImage?.url
          ? <img src={project.coverImage.url} alt={project.title} />
          : <div className="project-cover-placeholder"><Code2 size={32} /></div>
        }
      </div>
      <div className="project-body">
        <div className="project-category">{project.category}</div>
        <h3 className="project-title">{project.title}</h3>
        <p className="project-desc">{project.description}</p>
        {project.techStack?.length > 0 && (
          <div className="project-tech">
            {project.techStack.slice(0, 5).map(t => (
              <span key={t} className="tech-chip">{t}</span>
            ))}
          </div>
        )}
        <div className="project-links">
          {project.links?.github && (
            <a href={project.links.github} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
              <FaGithub size={13} /> Code
            </a>
          )}
          {project.links?.live && (
            <a href={project.links.live} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">
              <ExternalLink size={13} /> Live
            </a>
          )}
        </div>
      </div>
    </div>

     <style>{`
        
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

        
      `}</style>
    </>
  );
}


export default ProjectCard