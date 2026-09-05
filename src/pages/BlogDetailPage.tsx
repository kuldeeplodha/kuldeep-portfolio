import { useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBlogPostBySlug } from '../lib/blog';
import { renderMarkdown } from '../lib/blog/renderMarkdown';
import { NotFoundPage } from './NotFoundPage';

export function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getBlogPostBySlug(slug) : undefined;

  useEffect(() => {
    if (post) {
      document.title = `${post.title} | Blog`;
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', post.excerpt);
      }
    }
  }, [post]);

  const renderedContent = useMemo(() => {
    if (!post) return '';
    return renderMarkdown(post.body);
  }, [post]);

  if (!post) {
    return <NotFoundPage />;
  }

  return (
    <main className="container mx-auto max-w-3xl px-4 py-16" style={{ minHeight: '80vh' }}>
      <Link to="/blog" className="mb-8 inline-flex items-center text-sm font-medium hover:underline focus:outline-none focus:ring-2" style={{ color: 'var(--color-primary)' }}>
        ← Back to Blog
      </Link>
      
      <article>
        <header className="mb-10">
          <h1 className="mb-4 text-4xl md:text-5xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
            <time dateTime={post.date}>{post.date}</time>
            {post.readingTimeMinutes && <span>• {post.readingTimeMinutes} min read</span>}
            {post.tags && post.tags.length > 0 && (
              <>
                <span aria-hidden="true">•</span>
                <div className="flex gap-2">
                  {post.tags.map(tag => (
                    <span key={tag} className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: 'var(--color-border)', color: 'var(--color-text)' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </header>
        
        <div 
          className="blog-content prose prose-lg dark:prose-invert max-w-none"
          style={{ color: 'var(--color-text)' }}
          dangerouslySetInnerHTML={{ __html: renderedContent }} 
        />
      </article>
    </main>
  );
}
