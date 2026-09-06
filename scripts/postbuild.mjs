import fs from 'fs';
import path from 'path';

function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error('Invalid frontmatter');
  
  const frontmatterYaml = match[1];
  const lines = frontmatterYaml.split('\n');
  const result = {};
  
  for (const line of lines) {
    const splitIndex = line.indexOf(':');
    if (splitIndex === -1) continue;
    const key = line.slice(0, splitIndex).trim();
    const value = line.slice(splitIndex + 1).trim();
    
    if (value === 'true') result[key] = true;
    else if (value === 'false') result[key] = false;
    else if (!isNaN(Number(value)) && value !== '') result[key] = Number(value);
    else if (value.startsWith('[') && value.endsWith(']')) {
      result[key] = value.slice(1, -1).split(',').map(v => v.trim()).filter(Boolean);
    } else {
      result[key] = value.replace(/^['"](.*)['"]$/, '$1');
    }
  }
  
  return result;
}

function escapeHtml(unsafe) {
  if (typeof unsafe !== 'string') return unsafe;
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// V2.1 P4: src/config/projects.ts is TypeScript, and this script runs as
// plain Node (no ts-node/tsx dep — ADR-005 zero-dependency precedent), so
// it can't `import` it directly. Same spirit as parseFrontmatter above
// (hand-rolled parsing over a heavier dependency): pull just the fields
// this prerender needs (id/title/overview) out of the source with a
// couple of targeted regexes, scoped between one `id:` and the next so
// each project's own fields don't bleed into another's. A project that
// doesn't match (unexpected formatting) is skipped rather than crashing
// the build — it still works fine client-side via the SPA route, it just
// won't get a prerendered HTML file.
function parseProjectsForPrerender(source) {
  const projects = [];
  const idMatches = [...source.matchAll(/id:\s*'([^']+)'/g)];
  for (let i = 0; i < idMatches.length; i++) {
    const start = idMatches[i].index;
    const end = i + 1 < idMatches.length ? idMatches[i + 1].index : source.length;
    const block = source.slice(start, end);
    const titleMatch = block.match(/title:\s*'([^']+)'/);
    const overviewMatch = block.match(/overview:\s*\n?\s*'([^']+)'/);
    if (titleMatch) {
      projects.push({
        id: idMatches[i][1],
        title: titleMatch[1],
        overview: overviewMatch ? overviewMatch[1] : '',
      });
    }
  }
  return projects;
}

const DIST_DIR = path.resolve(process.cwd(), 'dist');
const BLOG_CONTENT_DIR = path.resolve(process.cwd(), 'src/content/blog');
const PROJECTS_CONFIG_PATH = path.resolve(process.cwd(), 'src/config/projects.ts');
const BASE_PATH = process.env.VITE_BASE_PATH || '/';
const INDEX_HTML_PATH = path.join(DIST_DIR, 'index.html');
const NOT_FOUND_HTML_PATH = path.join(DIST_DIR, '404.html');
const SITEMAP_PATH = path.join(DIST_DIR, 'sitemap.xml');

async function run() {
  if (!fs.existsSync(INDEX_HTML_PATH)) {
    console.error('index.html not found in dist. Run vite build first.');
    process.exit(1);
  }
  
  const baseHtml = fs.readFileSync(INDEX_HTML_PATH, 'utf-8');
  
  // 1. Copy index.html to 404.html
  fs.writeFileSync(NOT_FOUND_HTML_PATH, baseHtml);
  console.log('Copied index.html to 404.html');
  
  // 2. Read posts
  const posts = [];
  if (fs.existsSync(BLOG_CONTENT_DIR)) {
    const files = fs.readdirSync(BLOG_CONTENT_DIR).filter(f => f.endsWith('.md'));
    for (const file of files) {
      const content = fs.readFileSync(path.join(BLOG_CONTENT_DIR, file), 'utf-8');
      const meta = parseFrontmatter(content);
      if (meta.slug) posts.push(meta);
    }
  }
  
  // 3. Emit /blog/index.html (list page)
  const blogListDir = path.join(DIST_DIR, 'blog');
  fs.mkdirSync(blogListDir, { recursive: true });
  const blogListHtml = baseHtml
    .replace(/<title>.*?<\/title>/, `<title>Blog | Portfolio</title>`);
  fs.writeFileSync(path.join(blogListDir, 'index.html'), blogListHtml);
  
  // 4. Emit /blog/<slug>/index.html per post
  for (const post of posts) {
    const postDir = path.join(DIST_DIR, 'blog', post.slug);
    fs.mkdirSync(postDir, { recursive: true });
    
    // Canonical path with VITE_BASE_PATH handling
    const canonicalPath = (BASE_PATH + (BASE_PATH.endsWith('/') ? '' : '/') + 'blog/' + post.slug).replace(/(?<!:)\/\/+/g, '/');
    
    // Attempt to parse domain from sitemap if needed, but the canonical must be built from VITE_BASE_PATH.
    // So usually canonical includes the domain, but VITE_BASE_PATH typically provides the subpath (e.g. /kuldeep-portfolio/).
    // We'll extract origin from sitemap or default to https://kuldeeplodha.github.io
    let origin = 'https://kuldeeplodha.github.io';
    if (fs.existsSync(SITEMAP_PATH)) {
       const sitemapContent = fs.readFileSync(SITEMAP_PATH, 'utf-8');
       const originMatch = sitemapContent.match(/<loc>(https?:\/\/[^/]+)/);
       if (originMatch) origin = originMatch[1];
    }
    const fullCanonicalUrl = origin + canonicalPath;
    
    const safeTitle = escapeHtml(post.title);
    const safeExcerpt = escapeHtml(post.excerpt || '');
    const safeCanonicalUrl = escapeHtml(fullCanonicalUrl);
    
    let postHtml = baseHtml
      .replace(/<title>.*?<\/title>/s, `<title>${safeTitle} | Blog</title>`)
      .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/s, `<meta name="description" content="${safeExcerpt}">`)
      .replace(/<link\s+rel="canonical"[^>]*>/gs, '')
      .replace(/<meta\s+property="og:[^"]+"[^>]*>/gs, '');
      
    const ogTags = `
    <link rel="canonical" href="${safeCanonicalUrl}">
    <meta property="og:title" content="${safeTitle}">
    <meta property="og:description" content="${safeExcerpt}">
    <meta property="og:url" content="${safeCanonicalUrl}">
    <meta property="og:type" content="article">
    `;
    postHtml = postHtml.replace('</head>', `${ogTags}</head>`);
    
    fs.writeFileSync(path.join(postDir, 'index.html'), postHtml);
    console.log(`Generated HTML for post: ${post.slug}`);
  }
  
  // 5. Emit /projects/<id>/index.html per real project (V2.1 P4) — mirrors
  // steps 3-4 above for blog posts. Without this, a project detail link
  // returns HTTP 404 on GitHub Pages (only the client-side SPA route
  // handles it, via the 404.html fallback) even though the page itself
  // renders fine once JS loads — bad for crawlers/link-preview bots.
  const projects = fs.existsSync(PROJECTS_CONFIG_PATH)
    ? parseProjectsForPrerender(fs.readFileSync(PROJECTS_CONFIG_PATH, 'utf-8'))
    : [];

  let origin = 'https://kuldeeplodha.github.io';
  if (fs.existsSync(SITEMAP_PATH)) {
    const sitemapContent = fs.readFileSync(SITEMAP_PATH, 'utf-8');
    const originMatch = sitemapContent.match(/<loc>(https?:\/\/[^/]+)/);
    if (originMatch) origin = originMatch[1];
  }

  for (const project of projects) {
    const projectDir = path.join(DIST_DIR, 'projects', project.id);
    fs.mkdirSync(projectDir, { recursive: true });

    const canonicalPath = (BASE_PATH + (BASE_PATH.endsWith('/') ? '' : '/') + 'projects/' + project.id).replace(/(?<!:)\/\/+/g, '/');
    const fullCanonicalUrl = origin + canonicalPath;

    const safeTitle = escapeHtml(`${project.title} | Kuldeep Lodha`);
    const safeDescription = escapeHtml(project.overview);
    const safeCanonicalUrl = escapeHtml(fullCanonicalUrl);

    let projectHtml = baseHtml
      .replace(/<title>.*?<\/title>/s, `<title>${safeTitle}</title>`)
      .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/s, `<meta name="description" content="${safeDescription}">`)
      .replace(/<link\s+rel="canonical"[^>]*>/gs, '')
      .replace(/<meta\s+property="og:[^"]+"[^>]*>/gs, '');

    const ogTags = `
    <link rel="canonical" href="${safeCanonicalUrl}">
    <meta property="og:title" content="${safeTitle}">
    <meta property="og:description" content="${safeDescription}">
    <meta property="og:url" content="${safeCanonicalUrl}">
    <meta property="og:type" content="article">
    `;
    projectHtml = projectHtml.replace('</head>', `${ogTags}</head>`);

    fs.writeFileSync(path.join(projectDir, 'index.html'), projectHtml);
    console.log(`Generated HTML for project: ${project.id}`);
  }

  // 6. Update sitemap
  if (fs.existsSync(SITEMAP_PATH)) {
    let sitemap = fs.readFileSync(SITEMAP_PATH, 'utf-8');

    const sitemapUrls = [];
    const blogListPath = (BASE_PATH + (BASE_PATH.endsWith('/') ? '' : '/') + 'blog').replace(/(?<!:)\/\/+/g, '/');
    sitemapUrls.push(`  <url>\n    <loc>${origin}${blogListPath}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`);

    for (const post of posts) {
      const postPath = (BASE_PATH + (BASE_PATH.endsWith('/') ? '' : '/') + 'blog/' + post.slug).replace(/(?<!:)\/\/+/g, '/');
      sitemapUrls.push(`  <url>\n    <loc>${origin}${postPath}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`);
    }

    for (const project of projects) {
      const projectPath = (BASE_PATH + (BASE_PATH.endsWith('/') ? '' : '/') + 'projects/' + project.id).replace(/(?<!:)\/\/+/g, '/');
      sitemapUrls.push(`  <url>\n    <loc>${origin}${projectPath}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`);
    }

    sitemap = sitemap.replace('</urlset>', `${sitemapUrls.join('\n')}\n</urlset>`);
    fs.writeFileSync(SITEMAP_PATH, sitemap);
    console.log('Updated sitemap.xml');
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
