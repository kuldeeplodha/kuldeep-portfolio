import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Blog markdown carries root-relative refs (/blog/<slug> links,
// /blog-assets/<slug>/<img>.svg images) that resolve correctly at the site
// root but 404 once the app is served under a base path (GitHub Pages:
// /kuldeep-portfolio/). Only a SINGLE leading '/' is rewritten — '//host'
// (protocol-relative), 'http(s):', 'mailto:', and '#anchor' all start with
// something other than a lone '/', so they never match and pass through.
function prefixBasePath(html: string): string {
  const base = import.meta.env.BASE_URL ?? '/';
  const prefix = base === '/' ? '' : base.replace(/\/$/, '');
  if (!prefix) return html;
  return html.replace(/(href|src)="(\/(?!\/)[^"]*)"/g, `$1="${prefix}$2"`);
}

export function renderMarkdown(raw: string): string {
  const html = marked.parse(raw, { async: false }) as string;

  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'a', 'strong', 'em', 'code', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'img', 'blockquote', 'br', 'hr', 'del',
      'table', 'thead', 'tbody', 'tr', 'th', 'td'
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class'],
    ALLOW_DATA_ATTR: false
  });

  return prefixBasePath(sanitized);
}
