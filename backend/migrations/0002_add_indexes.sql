CREATE INDEX IF NOT EXISTS idx_blogs_status_published ON blog_posts(status, published_at);
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_case_studies_status_published ON case_studies(status, published_at);
CREATE INDEX IF NOT EXISTS idx_case_studies_slug ON case_studies(slug);
