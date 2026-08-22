import type { ThemeTokens } from '../types'

/**
 * Role theme tokens — applied as CSS custom properties via useRole.
 * Usage guidelines, contrast ratios, and motion rules: docs/DESIGN_SYSTEM.md
 *
 * Each theme provides: background, surface, text hierarchy, accent pair,
 * border, and heroGradient for the Hero section.
 */
export const themes: Record<string, ThemeTokens> = {
  software: {
    id: 'software',
    name: 'Software Engineer',
    background: '#0f1419',
    surface: '#1a2332',
    text: '#e8edf4',
    textMuted: '#8b9cb3',
    accent: '#22d3ee',
    accentMuted: '#0891b2',
    border: '#2d3a4f',
    heroGradient: 'linear-gradient(135deg, #0f1419 0%, #1a2a3a 50%, #0f1a24 100%)',
    layoutVariant: 'terminal',
  },
  ai: {
    id: 'ai',
    name: 'AI / ML',
    background: '#0a0e1a',
    surface: '#141b2e',
    text: '#e8e4f4',
    textMuted: '#9b8fc7',
    accent: '#a78bfa',
    accentMuted: '#7c3aed',
    border: '#2d2654',
    heroGradient: 'linear-gradient(135deg, #0a0e1a 0%, #1a1433 50%, #0f0a1f 100%)',
    layoutVariant: 'neural',
  },
  data: {
    id: 'data',
    name: 'Data Analyst',
    background: '#f8fafc',
    surface: '#ffffff',
    text: '#0f172a',
    textMuted: '#64748b',
    accent: '#0ea5e9',
    accentMuted: '#0284c7',
    border: '#e2e8f0',
    heroGradient: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #f1f5f9 100%)',
    layoutVariant: 'dashboard',
  },
  system: {
    id: 'system',
    name: 'System View',
    background: '#111827',
    surface: '#1f2937',
    text: '#f3f4f6',
    textMuted: '#9ca3af',
    accent: '#34d399',
    accentMuted: '#059669',
    border: '#374151',
    heroGradient: 'linear-gradient(135deg, #111827 0%, #1a2e35 25%, #1f2937 50%, #1a2332 75%, #111827 100%)',
    layoutVariant: 'hybrid',
  },
}
