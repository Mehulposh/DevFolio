import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  longDescription: String,
  coverImage: {
    url: { type: String, default: '' },
    publicId: { type: String, default: '' }
  },
  images: [{
    url: String,
    publicId: String
  }],
  techStack: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    enum: ['web', 'mobile', 'api', 'ml', 'other'],
    default: 'web'
  },
  links: {
    github: String,
    live: String,
    demo: String
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'published'
  },
  featured: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Project', projectSchema);