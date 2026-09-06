import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useRole } from '../hooks/useRole'
import { withRoleQuery } from '../lib/roleLink'
import { useBlogBySlug } from '../lib/content/usePublicContent'
import { useDocumentMeta } from '../hooks/useDocumentMeta'
import { renderMarkdown } from '../lib/blog/renderMarkdown'
import { NotFoundPage } from './NotFoundPage'

// V2.2 P3 (PRD §6.3): "/blog/:slug: Full article view with reading time,
// rendered markdown..." — table of contents and syntax-highlighted code
// blocks are in the PRD's fuller vision but outside this dispatch's stated
// scope (render body markdown + attached media); noted as a deferred
// enhancement rather than silently skipped. Reuses the existing
// marked+DOMPurify renderMarkdown() already used by the markdown-file blog
// detail page — same sanitization, same allowed-tags list, no new
// dependency.
export function CmsBlogDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { roleId } = useRole()
  const { data: post, loading, error } = useBlogBySlug(slug)

  useDocumentMeta(post ? `${post.title} | Kuldeep Lodha` : undefined, post?.excerpt)

  const html = useMemo(() => (post ? renderMarkdown(post.body) : ''), [post])

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center" role="status">
        <span style={{ color: 'var(--color-text-muted)' }}>Loading…</span>
      </main>
    )
  }

  // AC-3.4: drafts 404 at the public single-GET endpoint — indistinguishable
  // here from a typo'd/nonexistent slug, which is the correct behavior.
  if (error || !post) {
    return <NotFoundPage />
  }

  return (
    <main
      className="min-h-screen px-4 py-12 sm:px-6"
      style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      <article className="mx-auto max-w-3xl">
        <Link
          to={withRoleQuery('/blog', roleId)}
          className="mb-8 inline-block text-sm transition-opacity hover:opacity-80"
          style={{ color: 'var(--color-accent)' }}
        >
          ← Back to blog
        </Link>

        <h1 className="text-3xl font-bold sm:text-4xl">{post.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>
          {post.published_at && <time dateTime={post.published_at}>{new Date(post.published_at).toLocaleDateString()}</time>}
          <span>{post.reading_time_minutes} min read</span>
        </div>
        {post.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-[var(--radius-pill)] px-2.5 py-0.5 text-xs font-medium"
                style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent) 15%, transparent)', color: 'var(--color-accent)' }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {post.featured_media_url && (
          <img src={post.featured_media_url} alt="" className="mt-8 w-full rounded-[var(--radius-card)] object-cover" />
        )}

        {/* Reuses the app's own hand-rolled article typography (index.css
            `.blog-content`) — NOT Tailwind's `prose`/`prose-invert`, which
            aren't installed (see BlogDetailPage.tsx, the existing
            markdown-file detail page, for the same convention). */}
        <div className="blog-content mt-8 max-w-none" dangerouslySetInnerHTML={{ __html: html }} />

        {post.media_urls.length > 0 && (
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {post.media_urls.map((url) => (
              <img key={url} src={url} alt="" className="aspect-video w-full rounded-[var(--radius-base)] object-cover" />
            ))}
          </div>
        )}
      </article>
    </main>
  )
}
