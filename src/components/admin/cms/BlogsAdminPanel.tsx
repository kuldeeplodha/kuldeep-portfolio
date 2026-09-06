import { useCallback, useEffect, useState } from 'react'
import type { RoleId } from '../../../types'
import {
  CmsApiError,
  createBlog,
  deleteBlog,
  estimateReadingTimeMinutes,
  listAdminBlogs,
  nowIso,
  slugify,
  updateBlog,
  type CmsBlogPost,
  type ContentStatus,
} from '../../../lib/admin/cms'
import { renderMarkdown } from '../../../lib/blog/renderMarkdown'
import { adminInputClass, AdminCard } from '../AdminLayout'
import { RoleScopeEditor, RoleBadges } from '../RoleScopeEditor'
import { ConfirmModal } from '../ConfirmModal'
import { MediaUploadField } from './MediaUploadField'
import { TagsInput } from './TagsInput'
import { StatusBadge } from './StatusBadge'

function emptyBlog(): CmsBlogPost {
  const ts = nowIso()
  return {
    id: crypto.randomUUID(),
    slug: '',
    title: '',
    excerpt: '',
    body: '',
    status: 'draft',
    published_at: null,
    created_at: ts,
    updated_at: ts,
    tags: [],
    relevant_roles: [],
    reading_time_minutes: 1,
    featured_media_url: null,
    media_urls: [],
  }
}

export function BlogsAdminPanel() {
  const [posts, setPosts] = useState<CmsBlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [editing, setEditing] = useState<CmsBlogPost | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<CmsBlogPost | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Reusable refetch for after create/save/delete — called from event
  // handlers, so the setLoading(true)/setLoadError(null) reset here runs
  // outside of an effect body.
  const load = useCallback(() => {
    setLoading(true)
    setLoadError(null)
    listAdminBlogs()
      .then(setPosts)
      .catch((err) => setLoadError(err instanceof CmsApiError ? err.message : 'Failed to load blog posts.'))
      .finally(() => setLoading(false))
  }, [])

  // Mount-only fetch: `loading`/`loadError` already start at their reset
  // values, so this effect has no synchronous setState of its own — every
  // state update happens inside the promise callbacks.
  useEffect(() => {
    let cancelled = false
    listAdminBlogs()
      .then((data) => {
        if (!cancelled) setPosts(data)
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err instanceof CmsApiError ? err.message : 'Failed to load blog posts.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isNew = editing !== null && !posts.some((p) => p.id === editing.id)

  const handleSave = async (nextStatus?: ContentStatus) => {
    if (!editing) return
    setSaving(true)
    setSaveError(null)
    const toSave: CmsBlogPost = {
      ...editing,
      status: nextStatus ?? editing.status,
      published_at:
        (nextStatus ?? editing.status) === 'published' ? editing.published_at ?? nowIso() : editing.published_at,
      updated_at: nowIso(),
      reading_time_minutes: estimateReadingTimeMinutes(editing.body),
    }
    try {
      if (isNew) {
        await createBlog(toSave)
      } else {
        await updateBlog(toSave.id, toSave)
      }
      setEditing(null)
      load()
    } catch (err) {
      setSaveError(err instanceof CmsApiError ? err.message : 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  if (editing) {
    return (
      <AdminCard
        title={isNew ? 'New Blog Post' : `Edit: ${editing.title || 'Untitled'}`}
        description="Draft posts are only visible here — publish to show them on the live /blog archive (V2.2 P3)."
      >
        <label className="block">
          <span className="mb-1 block text-sm text-slate-400">Title</span>
          <input
            className={adminInputClass}
            value={editing.title}
            onChange={(e) => {
              const title = e.target.value
              setEditing({
                ...editing,
                title,
                slug: editing.slug || slugify(title),
              })
            }}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-slate-400">Slug</span>
          <input
            className={adminInputClass}
            value={editing.slug}
            onChange={(e) => setEditing({ ...editing, slug: slugify(e.target.value) })}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-slate-400">Excerpt</span>
          <textarea
            className={adminInputClass}
            rows={2}
            value={editing.excerpt}
            onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })}
          />
        </label>
        <TagsInput label="Tags" value={editing.tags} onChange={(tags) => setEditing({ ...editing, tags })} />
        <RoleScopeEditor
          value={editing.relevant_roles as RoleId[]}
          onChange={(roles) => setEditing({ ...editing, relevant_roles: roles })}
        />
        <MediaUploadField
          label="Featured image"
          value={editing.featured_media_url}
          onChange={(url) =>
            setEditing({
              ...editing,
              featured_media_url: url,
              media_urls: url ? [...new Set([...editing.media_urls, url])] : editing.media_urls,
            })
          }
        />
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label htmlFor="blog-body" className="text-sm text-slate-400">
              Body (Markdown)
            </label>
            <button
              type="button"
              onClick={() => setPreview((p) => !p)}
              className="rounded-md border border-slate-600 px-2 py-1 text-xs text-slate-300 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              {preview ? 'Edit' : 'Preview'}
            </button>
          </div>
          {preview ? (
            <div
              className="prose prose-invert prose-sm max-w-none rounded-lg border border-slate-700 bg-slate-800/30 p-4"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(editing.body) }}
            />
          ) : (
            <textarea
              id="blog-body"
              className={adminInputClass}
              rows={14}
              value={editing.body}
              onChange={(e) => setEditing({ ...editing, body: e.target.value })}
            />
          )}
        </div>

        {saveError && (
          <p className="text-sm text-red-400" role="alert">
            {saveError}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={saving || !editing.title || !editing.slug}
            onClick={() => handleSave('draft')}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save draft
          </button>
          <button
            type="button"
            disabled={saving || !editing.title || !editing.slug}
            onClick={() => handleSave('published')}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Publish'}
          </button>
          <button
            type="button"
            onClick={() => setEditing(null)}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            Cancel
          </button>
        </div>
      </AdminCard>
    )
  }

  return (
    <AdminCard title="Blog Posts" description="Authored server-side (Turso) — separate from the /blog markdown archive.">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{posts.length} post(s)</p>
        <button
          type="button"
          onClick={() => setEditing(emptyBlog())}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        >
          + New Blog Post
        </button>
      </div>

      {loading && (
        <p className="text-sm text-slate-400" role="status">
          Loading…
        </p>
      )}
      {loadError && (
        <p className="text-sm text-red-400" role="alert">
          {loadError}
        </p>
      )}
      {!loading && !loadError && posts.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-700 p-8 text-center">
          <p className="text-sm text-slate-400">No blog posts yet.</p>
        </div>
      )}

      {deleteError && (
        <p className="text-sm text-red-400" role="alert">
          {deleteError}
        </p>
      )}

      <ul className="divide-y divide-slate-800">
        {posts.map((post) => (
          <li key={post.id} className="flex flex-wrap items-center gap-3 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-100">{post.title || 'Untitled'}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <StatusBadge status={post.status} />
                <span className="text-xs text-slate-500">{new Date(post.updated_at).toLocaleDateString()}</span>
                <RoleBadges roles={post.relevant_roles as RoleId[]} />
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => setEditing(post)}
                className="rounded-md border border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(post)}
                className="rounded-md border border-rose-700/60 px-3 py-1.5 text-xs font-medium text-rose-400 hover:bg-rose-900/30 focus:outline-none focus:ring-2 focus:ring-rose-400"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Blog Post"
        itemName={deleteTarget?.title ?? ''}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return
          setDeleteError(null)
          try {
            await deleteBlog(deleteTarget.id)
            setDeleteTarget(null)
            load()
          } catch (err) {
            setDeleteError(err instanceof CmsApiError ? err.message : 'Delete failed.')
            setDeleteTarget(null)
          }
        }}
      />
    </AdminCard>
  )
}
