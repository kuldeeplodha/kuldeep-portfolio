CREATE TABLE IF NOT EXISTS site_content (
    section_key TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    status TEXT NOT NULL,
    published_at TEXT,
    updated_at TEXT NOT NULL
);
