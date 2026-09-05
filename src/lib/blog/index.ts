import type { BlogMetadata, BlogPost } from './types';

// Depending on Vite version and settings, ?raw with eager:true returns either the string or { default: string }
const postModules = import.meta.glob('/src/content/blog/*.md', { query: '?raw', eager: true }) as Record<string, any>;

export function parseFrontmatter(raw: string): { meta: BlogMetadata; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error('Invalid frontmatter');
  
  const [, frontmatterYaml, body] = match;
  const meta = parseSimpleFrontmatter(frontmatterYaml) as BlogMetadata;
  return { meta, body: body.trim() };
}

function parseSimpleFrontmatter(raw: string): Record<string, any> {
  const lines = raw.split('\n');
  const result: Record<string, any> = {};
  
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
      result[key] = value.replace(/^['"](.*)['"]$/, '$1'); // strip basic quotes
    }
  }
  
  return result;
}

export function getAllBlogPosts(): BlogPost[] {
  return Object.entries(postModules)
    .map(([filepath, module]) => {
      const rawString = typeof module === 'string' ? module : module.default;
      const { meta, body } = parseFrontmatter(rawString);
      if (!meta.slug) throw new Error(`Post ${filepath} missing slug in frontmatter`);
      return { ...meta, body };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function useBlogPosts(): BlogPost[] {
  return getAllBlogPosts();
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  const posts = getAllBlogPosts();
  return posts.find(p => p.slug === slug);
}
