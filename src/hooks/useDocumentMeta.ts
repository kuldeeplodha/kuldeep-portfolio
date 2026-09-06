import { useEffect } from 'react'

/**
 * Sets the document title and meta-description for the current route
 * (V2-P6 polish — per-page SEO). Shared between BlogDetailPage and
 * ProjectDetailPage instead of each re-implementing the same
 * document.title / meta[name=description] update.
 *
 * Skips entirely when `title` is undefined (e.g. project not found) so the
 * caller can leave the site-wide default in place for that render.
 */
export function useDocumentMeta(title: string | undefined, description?: string): void {
  useEffect(() => {
    if (!title) return
    document.title = title
    if (description) {
      const meta = document.querySelector('meta[name="description"]')
      if (meta) meta.setAttribute('content', description)
    }
  }, [title, description])
}
