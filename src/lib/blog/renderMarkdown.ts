import { marked } from 'marked';
import DOMPurify from 'dompurify';

export function renderMarkdown(raw: string): string {
  const html = marked.parse(raw, { async: false }) as string;
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'a', 'strong', 'em', 'code', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
      'ul', 'ol', 'li', 'img', 'blockquote', 'br', 'hr', 'del', 
      'table', 'thead', 'tbody', 'tr', 'th', 'td'
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class'],
    ALLOW_DATA_ATTR: false
  });
}
