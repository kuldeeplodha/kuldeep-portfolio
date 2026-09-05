import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBlogPosts } from '../lib/blog';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export function BlogListPage() {
  const posts = useBlogPosts();

  return (
    <main className="container mx-auto max-w-5xl px-4 py-16" style={{ minHeight: '80vh' }}>
      <h1 className="mb-12 text-4xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
        Blog
      </h1>

      {posts.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)' }}>No posts found.</p>
      ) : (
        <motion.div
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {posts.map((post) => (
            <motion.article
              key={post.slug}
              variants={cardVariants}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-3 rounded-[var(--radius-card)] border p-6 shadow-[var(--shadow-glass-md)] transition-shadow hover:shadow-[var(--shadow-glass-lg)]"
              style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-alt, var(--color-surface))' }}
            >
              <Link to={`/blog/${post.slug}`} className="hover:underline" style={{ color: 'var(--color-text)' }}>
                <h2 className="text-xl font-semibold">{post.title}</h2>
              </Link>

              <div className="flex flex-wrap items-center gap-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                <time dateTime={post.date}>{post.date}</time>
                {post.readingTimeMinutes && <span>{post.readingTimeMinutes} min read</span>}
              </div>

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

              <p className="leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                {post.excerpt}
              </p>

              <Link
                to={`/blog/${post.slug}`}
                className="mt-2 text-sm font-medium hover:underline w-max"
                style={{ color: 'var(--color-accent)' }}
              >
                Read more →
              </Link>
            </motion.article>
          ))}
        </motion.div>
      )}
    </main>
  );
}
