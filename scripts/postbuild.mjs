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

const DIST_DIR = path.resolve(process.cwd(), 'dist');
const BLOG_CONTENT_DIR = path.resolve(process.cwd(), 'src/content/blog');
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
    
    let postHtml = baseHtml
      .replace(/<title>.*?<\/title>/, `<title>${post.title} | Blog</title>`)
      .replace(/<meta name="description" content=".*?">/, `<meta name="description" content="${post.excerpt || ''}">`);
      
    const ogTags = `
    <link rel="canonical" href="${fullCanonicalUrl}">
    <meta property="og:title" content="${post.title}">
    <meta property="og:description" content="${post.excerpt || ''}">
    <meta property="og:url" content="${fullCanonicalUrl}">
    <meta property="og:type" content="article">
    `;
    postHtml = postHtml.replace('</head>', `${ogTags}</head>`);
    
    fs.writeFileSync(path.join(postDir, 'index.html'), postHtml);
    console.log(`Generated HTML for post: ${post.slug}`);
  }
  
  // 5. Update sitemap
  if (fs.existsSync(SITEMAP_PATH)) {
    let sitemap = fs.readFileSync(SITEMAP_PATH, 'utf-8');
    
    let origin = 'https://kuldeeplodha.github.io';
    const originMatch = sitemap.match(/<loc>(https?:\/\/[^/]+)/);
    if (originMatch) origin = originMatch[1];
    
    const sitemapUrls = [];
    const blogListPath = (BASE_PATH + (BASE_PATH.endsWith('/') ? '' : '/') + 'blog').replace(/(?<!:)\/\/+/g, '/');
    sitemapUrls.push(`  <url>\n    <loc>${origin}${blogListPath}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`);
    
    for (const post of posts) {
      const postPath = (BASE_PATH + (BASE_PATH.endsWith('/') ? '' : '/') + 'blog/' + post.slug).replace(/(?<!:)\/\/+/g, '/');
      sitemapUrls.push(`  <url>\n    <loc>${origin}${postPath}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`);
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
