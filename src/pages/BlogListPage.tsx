import { Link } from 'react-router-dom';
import { useBlogPosts } from '../lib/blog';

export function BlogListPage() {
  const posts = useBlogPosts();

  return (
    <main className="container mx-auto max-w-4xl px-4 py-16" style={{ minHeight: '80vh' }}>
      <h1 className="mb-12 text-4xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
        Blog
      </h1>
      
      {posts.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)' }}>No posts found.</p>
      ) : (
        <div className="flex flex-col gap-8">
          {posts.map((post) => (
            <article key={post.slug} className="flex flex-col gap-2 rounded-lg border p-6 transition-colors" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-alt)' }}>
              <Link to={`/blog/${post.slug}`} className="hover:underline focus:outline-none focus:ring-2" style={{ color: 'var(--color-primary)' }}>
                <h2 className="text-2xl font-semibold">{post.title}</h2>
              </Link>
              
              <div className="flex flex-wrap gap-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                <time dateTime={post.date}>{post.date}</time>
                {post.readingTimeMinutes && <span>{post.readingTimeMinutes} min read</span>}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex gap-2">
                    {post.tags.map(tag => (
                      <span key={tag} className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: 'var(--color-border)' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <p className="mt-2 leading-relaxed" style={{ color: 'var(--color-text)' }}>
                {post.excerpt}
              </p>
              
              <Link to={`/blog/${post.slug}`} className="mt-4 text-sm font-medium hover:underline focus:outline-none focus:ring-2 w-max" style={{ color: 'var(--color-primary)' }}>
                Read more →
              </Link>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
