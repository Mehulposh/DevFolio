import mongoose from 'mongoose';
import slugify from 'slugify';

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    index: true
  },
  excerpt: {
    type: String,
    required: [true, 'Excerpt is required'],
    maxlength: [500, 'Excerpt cannot exceed 500 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  coverImage: {
    url: { type: String, default: '' },
    publicId: { type: String, default: '' },
    alt: { type: String, default: '' }
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  category: {
    type: String,
    trim: true,
    default: 'General'
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  featured: {
    type: Boolean,
    default: false
  },
  // SEO Fields
  seo: {
    metaTitle: { type: String, maxlength: 60 },
    metaDescription: { type: String, maxlength: 160 },
    keywords: [String],
    ogImage: String
  },
  // Analytics
  analytics: {
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    likedBy: [{ type: String }], // store IP or session IDs
    readTime: { type: Number, default: 0 } // minutes
  },
  publishedAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Auto-generate slug from title
blogSchema.pre('save', async function () {
  if (!this.isModified('title') && this.slug) return;

  let baseSlug = slugify(this.title, { lower: true, strict: true });
  let slug = baseSlug;
  let count = 0;

  while (true) {
    const existing = await mongoose
      .model('Blog')
      .findOne({ slug, _id: { $ne: this._id } });

    if (!existing) break;

    count++;
    slug = `${baseSlug}-${count}`;
  }

  this.slug = slug;

  // Auto-calculate read time
  const wordCount = this.content
    .replace(/<[^>]+>/g, '')
    .split(/\s+/).length;

  this.analytics.readTime = Math.ceil(wordCount / 200);

  // Set publishedAt
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
});

// Indexes
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ 'analytics.views': -1 });
blogSchema.index({ title: 'text', content: 'text', tags: 'text' });

export default mongoose.model('Blog', blogSchema);