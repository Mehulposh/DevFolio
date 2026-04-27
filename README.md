# DevFolio — MERN Stack Portfolio + Blog CMS

A full-stack developer portfolio and blog content management system built with MongoDB, Express, React, and Node.js.

## ✨ Features

- **Public Portfolio** — Hero landing page, project showcase, blog list
- **Blog System** — Markdown posts with syntax highlighting, tags, categories, SEO
- **Admin Panel** — Secure JWT-authenticated dashboard
- **Blog Editor** — Markdown editor with live preview, image upload, SEO fields
- **Image Upload** — Cloudinary integration with auto-optimization
- **Analytics** — Per-post view counts, likes (toggle), monthly chart
- **SEO** — Meta title, description, Open Graph, Twitter cards, canonical URLs
- **Projects Manager** — CRUD with cover images, tech stack, links
- **Settings** — Profile editing, avatar upload, password change
- **Security** — Rate limiting, helmet, bcrypt, JWT expiry, input validation

---

## 🗂 Project Structure

```
devfolio/
├── server/                 # Express + MongoDB API
│   ├── models/
│   │   ├── User.js         # Admin user model
│   │   ├── Blog.js         # Blog post model (slug, SEO, analytics)
│   │   └── Project.js      # Portfolio project model
│   ├── routes/
│   │   ├── auth.js         # Login, me, profile, password
│   │   ├── blogs.js        # Full blog CRUD + likes
│   │   ├── upload.js       # Cloudinary image upload
│   │   ├── portfolio.js    # Projects CRUD
│   │   └── analytics.js    # Dashboard analytics
│   ├── middleware/
│   │   └── auth.js         # JWT protect middleware
│   ├── .env.example
│   └── index.js            # Express app entry
│
└── client/                 # React frontend
    └── src/
        ├── context/
        │   └── AuthContext.js    # Auth state
        ├── utils/
        │   └── api.js            # Axios instance
        ├── pages/
        │   ├── Home.js           # Landing page
        │   ├── BlogList.js       # Blog listing + search/filter
        │   ├── BlogPost.js       # Single post with like/share
        │   ├── Portfolio.js      # Project showcase
        │   └── admin/
        │       ├── Login.js      # Admin login
        │       ├── Dashboard.js  # Analytics dashboard
        │       ├── BlogsAdmin.js # Blog management table
        │       ├── BlogEditor.js # Markdown editor
        │       ├── ProjectsAdmin.js # Projects CRUD
        │       └── SettingsAdmin.js # Profile settings
        └── components/
            ├── shared/
            │   ├── Navbar.js
            │   └── Footer.js
            └── admin/
                └── AdminLayout.js # Sidebar layout
```

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <repo-url>
cd devfolio
npm run install-all
```

### 2. Configure Environment

```bash
cd server
cp .env.example .env
```

Fill in your `.env`:

```env
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/devfolio
JWT_SECRET=your_long_random_secret_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:3000
```

### 3. Create Admin Account

After starting the server, make a one-time POST request to create your admin:

```bash
curl -X POST http://localhost:5000/api/auth/setup \
  -H "Content-Type: application/json" \
  -d '{"name":"Your Name","email":"admin@example.com","password":"securepass123"}'
```

> This route only works once — if an admin already exists, it returns an error.

### 4. Run Development

```bash
# From root — runs both server + client
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Admin: http://localhost:3000/admin

---

## 🔐 API Endpoints

### Auth
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/auth/setup` | Public (once) | Create first admin |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/me` | Admin | Get current user |
| PUT | `/api/auth/profile` | Admin | Update profile |
| POST | `/api/auth/change-password` | Admin | Change password |

### Blogs
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/blogs` | Public | List published blogs (paginated) |
| GET | `/api/blogs/:slug` | Public | Get blog + increment views |
| POST | `/api/blogs/:id/like` | Public | Toggle like |
| GET | `/api/blogs/admin` | Admin | All blogs incl. drafts |
| GET | `/api/blogs/admin/:id` | Admin | Single blog by ID |
| POST | `/api/blogs` | Admin | Create blog |
| PUT | `/api/blogs/:id` | Admin | Update blog |
| DELETE | `/api/blogs/:id` | Admin | Delete blog |

### Upload
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/upload/image` | Admin | Upload to Cloudinary |
| DELETE | `/api/upload/:publicId` | Admin | Delete from Cloudinary |

### Portfolio
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/portfolio` | Public | Published projects |
| GET | `/api/portfolio/admin` | Admin | All projects |
| POST | `/api/portfolio` | Admin | Create project |
| PUT | `/api/portfolio/:id` | Admin | Update project |
| DELETE | `/api/portfolio/:id` | Admin | Delete project |

### Analytics
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/analytics/overview` | Admin | Dashboard stats |

---

## 🌐 Deployment

### Backend (Railway / Render / Fly.io)
1. Set all environment variables
2. Set `NODE_ENV=production`
3. Update `CLIENT_URL` to your frontend domain

### Frontend (Vercel / Netlify)
1. Set `REACT_APP_API_URL` or update the proxy in `package.json`
2. Build: `npm run build`

### MongoDB Atlas
- Free tier M0 cluster works fine
- Add your server IP to the allowlist

---

## 📝 Blog Writing Tips

The editor supports full GitHub-flavored Markdown:

```markdown
# H1 Heading
## H2 Heading

**Bold** and *italic* text

\`\`\`javascript
const code = 'with syntax highlighting';
\`\`\`

> Blockquotes look great

| Tables | Work |
|--------|------|
| Too    | ✓    |

![Images](https://url-to-image.jpg)
```

---

## 🛡 Security Notes

- JWT tokens expire in 7 days (configurable via `JWT_EXPIRE`)
- Login is rate-limited to 10 attempts per 15 minutes
- All admin routes require valid Bearer token
- Passwords are hashed with bcrypt (12 rounds)
- Helmet sets security HTTP headers
- CORS is restricted to `CLIENT_URL`
