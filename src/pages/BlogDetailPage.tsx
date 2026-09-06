import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBlogPostBySlug, getAllBlogPosts } from '../lib/blog';
import { renderMarkdown } from '../lib/blog/renderMarkdown';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { NotFoundPage } from './NotFoundPage';

export function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getBlogPostBySlug(slug) : undefined;

  useDocumentMeta(post ? `${post.title} | Blog` : undefined, post?.excerpt);

  const renderedContent = useMemo(() => {
    if (!post) return '';
    return renderMarkdown(post.body);
  }, [post]);

  // Related articles: other posts sharing at least one tag, most-shared-tags
  // first. Shown only when there's a genuine overlap — no arbitrary "other
  // posts" filler when nothing is actually related.
  const relatedPosts = useMemo(() => {
    if (!post || !post.tags || post.tags.length === 0) return [];
    return getAllBlogPosts()
      .filter((p) => p.slug !== post.slug)
      .map((p) => ({ post: p, sharedTags: (p.tags ?? []).filter((t) => post.tags!.includes(t)).length }))
      .filter((entry) => entry.sharedTags > 0)
      .sort((a, b) => b.sharedTags - a.sharedTags)
      .slice(0, 3)
      .map((entry) => entry.post);
  }, [post]);

  if (!post) {
    return <NotFoundPage />;
  }

  return (
    <main className="container mx-auto max-w-3xl px-4 py-16" style={{ minHeight: '80vh' }}>
      <Link to="/blog" className="mb-8 inline-flex items-center text-sm font-medium hover:underline focus:outline-none focus:ring-2" style={{ color: 'var(--color-accent)' }}>
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
              <div className="flex flex-wrap gap-2">
                {post.tags.map(tag => (
                  <span
                    key={tag}
                    className="rounded-[var(--radius-pill)] px-2.5 py-0.5 text-xs font-medium"
                    style={{
                      backgroundColor: 'color-mix(in srgb, var(--color-accent) 15%, transparent)',
                      color: 'var(--color-accent)',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </header>

        <div
          className="blog-content max-w-none"
          style={{ color: 'var(--color-text)' }}
          dangerouslySetInnerHTML={{ __html: renderedContent }}
        />
      </article>

      {relatedPosts.length > 0 && (
        <div className="mt-16 border-t pt-8" style={{ borderColor: 'var(--color-border)' }}>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
            Related articles
          </h2>
          <ul className="space-y-3">
            {relatedPosts.map((related) => (
              <li key={related.slug}>
                <Link
                  to={`/blog/${related.slug}`}
                  className="text-sm font-medium hover:underline"
                  style={{ color: 'var(--color-accent)' }}
                >
                  {related.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
