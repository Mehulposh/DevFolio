import  { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, Save, ExternalLink } from 'lucide-react';
import { FaGithub  } from 'react-icons/fa';

import toast from 'react-hot-toast';
import api from '../../api/api.js';

const EMPTY = {
  title: '', description: '', longDescription: '', techStack: '',
  category: 'web', links: { github: '', live: '', demo: '' },
  status: 'published', featured: false, order: 0,
  coverImage: { url: '', publicId: '' }
};

export default function ProjectsAdmin() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [uploading, setUploading] = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/portfolio/admin')
      .then(r => setProjects(r.data.projects))
      .catch(() => toast.error('Failed to load projects'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(EMPTY); setModalOpen(true); };
  const openEdit = (p) => {
    setEditing(p._id);
    setForm({
      title: p.title || '', description: p.description || '',
      longDescription: p.longDescription || '',
      techStack: p.techStack?.join(', ') || '',
      category: p.category || 'web',
      links: p.links || { github: '', live: '', demo: '' },
      status: p.status || 'published',
      featured: p.featured || false,
      order: p.order || 0,
      coverImage: p.coverImage || { url: '', publicId: '' }
    });
    setModalOpen(true);
  };

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const setLink = (key, val) => setForm(f => ({ ...f, links: { ...f.links, [key]: val } }));

const handleImageUpload = async (e) => {
  // e.stopPropagation(); // ✅ optional safety
  const file = e.target.files[0];
  console.log('selected image' , file);
  
  if (!file) return;

  setUploading(true);

  try {
    const fd = new FormData();
    fd.append('image', file);

    for (let pair of fd.entries()) {
      console.log(pair);
    }
    
    console.log(fd instanceof FormData); // should be true
    console.log("BEFORE API CALL");
    const res = await api.post('/upload/image', fd);
    console.log("AFTER   API CALL");
    setForm(f => ({
      ...f,
      coverImage: {
        url: res.data.url,
        publicId: res.data.publicId
      }
    }));

    toast.success('Image uploaded');
  } catch (err) {
    console.error(err);
    toast.error('Upload failed');
  } finally {
    setUploading(false);
  }
};

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      toast.error('Title and description are required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        techStack: form.techStack.split(',').map(t => t.trim()).filter(Boolean)
      };
      if (editing) {
        await api.put(`/portfolio/${editing}`, payload);
        toast.success('Project updated!');
      } else {
        await api.post('/portfolio', payload);
        toast.success('Project created!');
      }
      setModalOpen(false);
      load();
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    setDeleting(id);
    try {
      await api.delete(`/portfolio/${id}`);
      toast.success('Project deleted');
      setProjects(p => p.filter(x => x._id !== id));
    } catch { toast.error('Failed to delete'); }
    finally { setDeleting(null); }
  };

  return (
    <div className="projects-admin">
      <div className="page-top">
        <div>
          <h2 className="page-title">Projects</h2>
          <p className="page-desc">{projects.length} projects in portfolio</p>
        </div>
        <button onClick={openNew} className="btn btn-primary">
          <Plus size={15} /> Add Project
        </button>
      </div>

      {loading ? (
        <div className="proj-grid">
          {[...Array(4)].map((_, i) => <div key={i} className="proj-skeleton" />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="empty-admin">
          <p>No projects yet.</p>
          <button onClick={openNew} className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>
            <Plus size={13} /> Add Project
          </button>
        </div>
      ) : (
        <div className="proj-grid">
          {projects.map(project => (
            <div key={project._id} className="proj-card">
              <div className="proj-cover">
                {project.coverImage?.url
                  ? <img src={project.coverImage.url} alt={project.title} />
                  : <div className="proj-placeholder" />
                }
                {project.featured && <span className="badge badge-yellow feat-badge">Featured</span>}
                <span className={`badge ${project.status === 'published' ? 'badge-green' : 'badge-yellow'} status-badge`}>
                  {project.status}
                </span>
              </div>
              <div className="proj-body">
                <div className="proj-cat">{project.category}</div>
                <div className="proj-name">{project.title}</div>
                <p className="proj-desc">{project.description}</p>
                {project.techStack?.length > 0 && (
                  <div className="tech-row">
                    {project.techStack.slice(0, 4).map(t => (
                      <span key={t} className="tag" style={{ fontSize: 10 }}>{t}</span>
                    ))}
                  </div>
                )}
                <div className="proj-actions">
                  {project.links?.github && (
                    <a href={project.links.github} target="_blank" rel="noreferrer" className="action-btn" title="GitHub">
                      <FaGithub size={14} />
                    </a>
                  )}
                  {project.links?.live && (
                    <a href={project.links.live} target="_blank" rel="noreferrer" className="action-btn" title="Live">
                      <ExternalLink size={14} />
                    </a>
                  )}
                  <div style={{ flex: 1 }} />
                  <button onClick={() => openEdit(project)} className="action-btn" title="Edit">
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(project._id)}
                    className="action-btn danger"
                    disabled={deleting === project._id}
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editing ? 'Edit Project' : 'New Project'}</h3>
              <button className="modal-close" onClick={() => setModalOpen(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="modal-grid">
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input type="text" className="form-input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Project title" />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={form.category} onChange={e => set('category', e.target.value)}>
                    {['web', 'mobile', 'api', 'ml', 'other'].map(c => (
                      <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea className="form-textarea" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Short description shown in cards" rows={2} style={{ minHeight: 'unset' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Tech Stack (comma-separated)</label>
                <input type="text" className="form-input" value={form.techStack} onChange={e => set('techStack', e.target.value)} placeholder="React, Node.js, MongoDB" />
              </div>
              <div className="modal-grid">
                <div className="form-group">
                  <label className="form-label"><FaGithub size={11} /> GitHub URL</label>
                  <input type="url" className="form-input" value={form.links.github} onChange={e => setLink('github', e.target.value)} placeholder="https://github.com/..." />
                </div>
                <div className="form-group">
                  <label className="form-label"><ExternalLink size={11} /> Live URL</label>
                  <input type="url" className="form-input" value={form.links.live} onChange={e => setLink('live', e.target.value)} placeholder="https://..." />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Cover Image</label>
                {form.coverImage.url ? (
                  <div className="cover-preview-sm">
                    <img src={form.coverImage.url} alt="Cover" />
                    <button type="button" onClick={() => setForm(f => ({ ...f, coverImage: { url: '', publicId: '' } }))} className="cover-remove-sm"><X size={12} /></button>
                  </div>
                ) : (
                  <label className="upload-btn-label">
                    {uploading ? <div className="loader" style={{ width: 14, height: 14, borderWidth: 2 }} /> : <><Upload size={14} /> Upload Image</>}
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e)=> handleImageUpload(e)} />
                  </label>
                )}
              </div>
              <div className="modal-grid">
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Order</label>
                  <input type="number" className="form-input" value={form.order} onChange={e => set('order', parseInt(e.target.value) || 0)} />
                </div>
              </div>
              <label className="checkbox-label" style={{ marginTop: 4 }}>
                <input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)} />
                <span>Featured project</span>
              </label>
            </div>
            <div className="modal-footer">
              <button onClick={() => setModalOpen(false)} className="btn btn-ghost">Cancel</button>
              <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
                {saving ? <span className="loader" style={{ width: 14, height: 14, borderWidth: 2 }} /> : <Save size={14} />}
                {editing ? 'Update' : 'Create'} Project
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .projects-admin { max-width: 1100px; }
        .page-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 28px; gap: 16px; flex-wrap: wrap; }
        .page-title { font-size: 1.8rem; margin-bottom: 4px; }
        .page-desc { font-size: 13px; color: var(--text-3); }
        .proj-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
        .proj-skeleton { height: 320px; background: var(--bg-2); border: 1px solid var(--border); border-radius: var(--radius-lg); animation: shimmer 1.5s infinite; }
        .proj-card { background: var(--bg-2); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; transition: border-color 0.2s; }
        .proj-card:hover { border-color: var(--border-2); }
        .proj-cover { height: 160px; background: var(--bg-4); overflow: hidden; position: relative; }
        .proj-cover img { width: 100%; height: 100%; object-fit: cover; }
        .proj-placeholder { width: 100%; height: 100%; background: linear-gradient(135deg, var(--bg-3), var(--bg-4)); }
        .feat-badge { position: absolute; top: 8px; left: 8px; }
        .status-badge { position: absolute; top: 8px; right: 8px; }
        .proj-body { padding: 16px; }
        .proj-cat { font-family: var(--font-mono); font-size: 11px; color: var(--accent); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
        .proj-name { font-family: var(--font-display); font-size: 1.1rem; color: var(--text); margin-bottom: 8px; }
        .proj-desc { font-size: 13px; color: var(--text-2); margin-bottom: 12px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .tech-row { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 14px; }
        .proj-actions { display: flex; align-items: center; gap: 6px; }
        .action-btn { width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; background: var(--bg-4); border: 1px solid var(--border); border-radius: var(--radius); color: var(--text-3); cursor: pointer; transition: all 0.15s; text-decoration: none; }
        .action-btn:hover { border-color: var(--border-2); color: var(--text); }
        .action-btn.danger:hover { border-color: var(--red); color: var(--red); }
        .action-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .empty-admin { text-align: center; padding: 80px; color: var(--text-3); }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .modal { background: var(--bg-2); border: 1px solid var(--border); border-radius: var(--radius-lg); width: 100%; max-width: 640px; max-height: 90vh; display: flex; flex-direction: column; }
        .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid var(--border); }
        .modal-header h3 { font-family: var(--font-display); font-size: 1.2rem; }
        .modal-close { background: none; border: none; color: var(--text-3); cursor: pointer; padding: 4px; transition: color 0.15s; }
        .modal-close:hover { color: var(--text); }
        .modal-body { padding: 24px; overflow-y: auto; display: flex; flex-direction: column; gap: 14px; }
        .modal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .modal-footer { padding: 16px 24px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 10px; }
        .cover-preview-sm { position: relative; display: inline-block; }
        .cover-preview-sm img { height: 80px; border-radius: var(--radius); object-fit: cover; display: block; }
        .cover-remove-sm { position: absolute; top: -6px; right: -6px; width: 20px; height: 20px; background: var(--red); border: none; border-radius: 50%; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .upload-btn-label { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; background: var(--bg-3); border: 1px dashed var(--border); border-radius: var(--radius); color: var(--text-3); font-size: 13px; cursor: pointer; transition: all 0.15s; }
        .upload-btn-label:hover { border-color: var(--accent); color: var(--accent); }
        .checkbox-label { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-2); cursor: pointer; }
        .checkbox-label input { accent-color: var(--accent); }
        @media (max-width: 600px) { .modal-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}

function Upload({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
    </svg>
  );
}