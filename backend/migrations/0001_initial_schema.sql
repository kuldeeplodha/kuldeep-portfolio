-- 1. Blog Posts Table
CREATE TABLE IF NOT EXISTS blog_posts (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  tags TEXT NOT NULL DEFAULT '[]', -- JSON string array of tags
  relevant_roles TEXT NOT NULL DEFAULT '["software","ai","data","system"]', -- JSON string array of RoleId
  reading_time_minutes INTEGER NOT NULL DEFAULT 1,
  featured_media_url TEXT,
  media_urls TEXT NOT NULL DEFAULT '[]' -- JSON string array of Cloudinary media URLs
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status_published ON blog_posts(status, published_at DESC);

-- 2. Case Studies Table
CREATE TABLE IF NOT EXISTS case_studies (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  summary TEXT NOT NULL,
  client_or_org TEXT NOT NULL,
  period TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  featured INTEGER NOT NULL DEFAULT 0, -- 1 = featured card treatment on homepage
  published_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  technologies TEXT NOT NULL DEFAULT '[]', -- JSON string array of technologies
  relevant_roles TEXT NOT NULL DEFAULT '["software","system"]', -- JSON string array of RoleId
  problem TEXT NOT NULL,
  context TEXT NOT NULL,
  architecture TEXT NOT NULL, -- Architecture narrative, pipeline steps, and diagram description
  outcome TEXT NOT NULL,
  future_improvements TEXT,
  github_url TEXT,
  live_url TEXT,
  featured_media_url TEXT,
  media_urls TEXT NOT NULL DEFAULT '[]' -- JSON string array of attached Cloudinary media URLs
);

CREATE INDEX IF NOT EXISTS idx_case_studies_slug ON case_studies(slug);
CREATE INDEX IF NOT EXISTS idx_case_studies_status_published ON case_studies(status, published_at DESC);

-- 3. Media Assets Registry
CREATE TABLE IF NOT EXISTS media_assets (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  public_id TEXT UNIQUE NOT NULL, -- Cloudinary public_id
  secure_url TEXT NOT NULL,       -- Cloudinary HTTPS delivery URL
  format TEXT NOT NULL,           -- jpg, png, webp, mp4, etc.
  resource_type TEXT NOT NULL CHECK (resource_type IN ('image', 'video', 'raw')),
  bytes INTEGER NOT NULL,
  width INTEGER,
  height INTEGER,
  uploaded_at TEXT NOT NULL,
  parent_type TEXT CHECK (parent_type IN ('blog', 'case_study', 'general')),
  parent_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_media_assets_public_id ON media_assets(public_id);
