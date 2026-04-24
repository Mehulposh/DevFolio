import  { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Eye, EyeOff, Upload, X, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import api from '../../api/api.js';

const INITIAL = {
  title: '', excerpt: '', content: '', tags: '', category: 'General',
  status: 'draft', featured: false,
  seo: { metaTitle: '', metaDescription: '', keywords: '' },
  coverImage: { url: '', publicId: '', alt: '' }
};

export default function BlogEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [preview, setPreview] = useState(false);
  const [seoOpen, setSeoOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/blogs/admin/${id}`)
      .then(r => {
        const b = r.data.blog;
        setForm({
          title: b.title || '',
          excerpt: b.excerpt || '',
          content: b.content || '',
          tags: b.tags?.join(', ') || '',
          category: b.category || 'General',
          status: b.status || 'draft',
          featured: b.featured || false,
          seo: {
            metaTitle: b.seo?.metaTitle || '',
            metaDescription: b.seo?.metaDescription || '',
            keywords: b.seo?.keywords?.join(', ') || ''
          },
          coverImage: b.coverImage || { url: '', publicId: '', alt: '' }
        });
      })
      .catch(() => toast.error('Failed to load post'))
      .finally(() => setFetching(false));
  }, [id, isEdit]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const setSeo = (key, val) => setForm(f => ({ ...f, seo: { ...f.seo, [key]: val } }));

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await api.post('/upload/image', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setForm(f => ({
        ...f,
        coverImage: { url: res.data.url, publicId: res.data.publicId, alt: f.title }
      }));
      toast.success('Image uploaded');
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const removeCover = async () => {
    if (form.coverImage.publicId) {
      try {
        await api.delete(`/upload/${encodeURIComponent(form.coverImage.publicId)}`);
      } catch { /* ignore */ }
    }
    setForm(f => ({ ...f, coverImage: { url: '', publicId: '', alt: '' } }));
  };

  const handleSave = async (statusOverride) => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!form.excerpt.trim()) { toast.error('Excerpt is required'); return; }
    if (!form.content.trim()) { toast.error('Content is required'); return; }

    setLoading(true);
    try {
      const payload = {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        status: statusOverride || form.status,
        seo: {
          ...form.seo,
          keywords: form.seo.keywords.split(',').map(k => k.trim()).filter(Boolean)
        }
      };

      if (isEdit) {
        await api.put(`/blogs/${id}`, payload);
        toast.success('Post updated!');
      } else {
        const res = await api.post('/blogs', payload);
        toast.success('Post created!');
        navigate(`/admin/blogs/edit/${res.data.blog._id}`, { replace: true });
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="loader" /></div>;

  const wordCount = form.content.split(/\s+/).filter(Boolean).length;
  const readTime = Math.ceil(wordCount / 200);

  return (
    <div className="editor-page">
      {/* Header */}
      <div className="editor-header">
        <button onClick={() => navigate('/admin/blogs')} className="btn btn-ghost btn-sm">
          <ArrowLeft size={13} /> Back
        </button>
        <h2 className="editor-title">{isEdit ? 'Edit Post' : 'New Post'}</h2>
        <div className="editor-actions">
          <span className="word-count">{wordCount} words · {readTime} min</span>
          <button
            onClick={() => setPreview(p => !p)}
            className={`btn btn-ghost btn-sm ${preview ? 'preview-active' : ''}`}
          >
            {preview ? <EyeOff size={14} /> : <Eye size={14} />}
            {preview ? 'Edit' : 'Preview'}
          </button>
          <button
            onClick={() => handleSave('draft')}
            className="btn btn-ghost btn-sm"
            disabled={loading}
          >
            Save Draft
          </button>
          <button
            onClick={() => handleSave('published')}
            className="btn btn-primary btn-sm"
            disabled={loading}
          >
            {loading
              ? <span className="loader" style={{ width: 14, height: 14, borderWidth: 2 }} />
              : <Save size={14} />
            }
            {form.status === 'published' ? 'Update' : 'Publish'}
          </button>
        </div>
      </div>

      <div className="editor-layout">
        {/* Main Column */}
        <div className="editor-main">
          {/* Title */}
          <input
            type="text"
            className="title-input"
            placeholder="Post title..."
            value={form.title}
            onChange={e => set('title', e.target.value)}
          />

          {/* Excerpt */}
          <textarea
            className="excerpt-input"
            placeholder="Brief excerpt / summary (shown in blog list and SEO)..."
            value={form.excerpt}
            onChange={e => set('excerpt', e.target.value)}
            rows={2}
          />

          {/* Editor / Preview */}
          {preview ? (
            <div className="preview-pane prose">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{form.content || '*Nothing to preview yet.*'}</ReactMarkdown>
            </div>
          ) : (
            <textarea
              className="content-editor"
              placeholder={`Write your post in Markdown...\n\n# Heading\n**Bold** *Italic*\n\n\`\`\`js\nconst hello = 'world';\n\`\`\`\n\n> Blockquote\n\n- List item`}
              value={form.content}
              onChange={e => set('content', e.target.value)}
              spellCheck
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="editor-sidebar">
          {/* Publish Box */}
          <div className="card sidebar-card">
            <h4 className="sidebar-card-title">Publish</h4>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={form.status}
                onChange={e => set('status', e.target.value)}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={e => set('featured', e.target.checked)}
              />
              <span>Featured post</span>
            </label>
          </div>

          {/* Cover Image */}
          <div className="card sidebar-card">
            <h4 className="sidebar-card-title">Cover Image</h4>
            {form.coverImage.url ? (
              <div className="cover-preview">
                <img src={form.coverImage.url} alt="Cover" />
                <button className="cover-remove" onClick={removeCover}>
                  <X size={14} />
                </button>
              </div>
            ) : (
              <>
                <div
                  className="cover-upload-zone"
                  onClick={() => fileRef.current?.click()}
                >
                  {uploading
                    ? <div className="loader" style={{ width: 20, height: 20, borderWidth: 2 }} />
                    : <><Upload size={18} /><span>Click to upload</span><span className="upload-hint">JPG, PNG, WebP · Max 5MB</span></>
                  }
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
              </>
            )}
            {form.coverImage.url && (
              <div className="form-group" style={{ marginTop: 10 }}>
                <label className="form-label">Alt Text</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Image description for SEO"
                  value={form.coverImage.alt}
                  onChange={e => setForm(f => ({ ...f, coverImage: { ...f.coverImage, alt: e.target.value } }))}
                />
              </div>
            )}
          </div>

          {/* Meta */}
          <div className="card sidebar-card">
            <h4 className="sidebar-card-title">Post Info</h4>
            <div className="form-group">
              <label className="form-label">Category</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Tutorial, Opinion..."
                value={form.category}
                onChange={e => set('category', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Tags (comma-separated)</label>
              <input
                type="text"
                className="form-input"
                placeholder="react, javascript, tips"
                value={form.tags}
                onChange={e => set('tags', e.target.value)}
              />
            </div>
          </div>

          {/* SEO */}
          <div className="card sidebar-card">
            <button
              className="seo-toggle"
              onClick={() => setSeoOpen(o => !o)}
            >
              <h4 className="sidebar-card-title" style={{ margin: 0 }}>SEO Settings</h4>
              {seoOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
            {seoOpen && (
              <div className="seo-fields">
                <div className="form-group">
                  <label className="form-label">
                    Meta Title
                    <span className={`char-count ${form.seo.metaTitle.length > 60 ? 'over' : ''}`}>
                      {form.seo.metaTitle.length}/60
                    </span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="SEO title (leave blank to use post title)"
                    value={form.seo.metaTitle}
                    onChange={e => setSeo('metaTitle', e.target.value)}
                    maxLength={70}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Meta Description
                    <span className={`char-count ${form.seo.metaDescription.length > 160 ? 'over' : ''}`}>
                      {form.seo.metaDescription.length}/160
                    </span>
                  </label>
                  <textarea
                    className="form-textarea"
                    placeholder="Brief description for search engines"
                    value={form.seo.metaDescription}
                    onChange={e => setSeo('metaDescription', e.target.value)}
                    maxLength={180}
                    rows={3}
                    style={{ minHeight: 'unset' }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Keywords (comma-separated)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="react, hooks, tutorial"
                    value={form.seo.keywords}
                    onChange={e => setSeo('keywords', e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .editor-page { height: calc(100vh - 64px); display: flex; flex-direction: column; gap: 0; max-width: 1300px; }
        .editor-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--border);
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        .editor-title { font-size: 1.2rem; flex: 1; }
        .editor-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .word-count { font-family: var(--font-mono); font-size: 12px; color: var(--text-3); }
        .preview-active { border-color: var(--accent) !important; color: var(--accent) !important; }
        .editor-layout { display: grid; grid-template-columns: 1fr 280px; gap: 24px; flex: 1; overflow: hidden; }
        .editor-main { display: flex; flex-direction: column; gap: 12px; overflow: hidden; }
        .title-input {
          background: transparent;
          border: none;
          border-bottom: 1px solid var(--border);
          color: var(--text);
          font-family: var(--font-display);
          font-size: 1.8rem;
          padding: 8px 0;
          width: 100%;
          outline: none;
          transition: border-color 0.2s;
        }
        .title-input:focus { border-color: var(--accent); }
        .title-input::placeholder { color: var(--text-3); }
        .excerpt-input {
          background: var(--bg-3);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          color: var(--text-2);
          font-family: var(--font-body);
          font-size: 14px;
          padding: 12px 16px;
          resize: vertical;
          min-height: 60px;
          outline: none;
          transition: border-color 0.2s;
        }
        .excerpt-input:focus { border-color: var(--accent); }
        .content-editor {
          flex: 1;
          background: var(--bg-2);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          color: var(--text);
          font-family: var(--font-mono);
          font-size: 14px;
          line-height: 1.7;
          padding: 20px;
          resize: none;
          outline: none;
          min-height: 480px;
          transition: border-color 0.2s;
        }
        .content-editor:focus { border-color: var(--accent); }
        .preview-pane {
          flex: 1;
          background: var(--bg-2);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 24px 32px;
          overflow-y: auto;
          min-height: 480px;
        }
        .editor-sidebar { overflow-y: auto; display: flex; flex-direction: column; gap: 16px; }
        .sidebar-card { padding: 16px; }
        .sidebar-card-title {
          font-family: var(--font-mono);
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-3);
          margin-bottom: 12px;
        }
        .sidebar-card .form-group { margin-bottom: 12px; }
        .sidebar-card .form-group:last-child { margin-bottom: 0; }
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--text-2);
          cursor: pointer;
          margin-top: 8px;
        }
        .checkbox-label input { accent-color: var(--accent); width: 14px; height: 14px; }
        .cover-preview {
          position: relative;
          border-radius: var(--radius);
          overflow: hidden;
        }
        .cover-preview img { width: 100%; height: 120px; object-fit: cover; display: block; }
        .cover-remove {
          position: absolute;
          top: 6px; right: 6px;
          width: 24px; height: 24px;
          background: rgba(0,0,0,0.7);
          border: none;
          border-radius: 50%;
          color: white;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
        }
        .cover-upload-zone {
          border: 2px dashed var(--border);
          border-radius: var(--radius);
          padding: 24px 16px;
          text-align: center;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          color: var(--text-3);
          font-size: 13px;
          transition: border-color 0.2s, color 0.2s;
        }
        .cover-upload-zone:hover { border-color: var(--accent); color: var(--accent); }
        .upload-hint { font-size: 11px; font-family: var(--font-mono); }
        .seo-toggle {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: none;
          border: none;
          cursor: pointer;
          width: 100%;
          color: var(--text-3);
          padding: 0;
        }
        .seo-fields { margin-top: 12px; display: flex; flex-direction: column; gap: 12px; }
        .char-count {
          margin-left: auto;
          font-size: 11px;
          color: var(--text-3);
        }
        .char-count.over { color: var(--red); }
        .form-label { display: flex; align-items: center; }
        @media (max-width: 900px) {
          .editor-layout { grid-template-columns: 1fr; }
          .editor-sidebar { order: -1; }
        }
      `}</style>
    </div>
  );
}