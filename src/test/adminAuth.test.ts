import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  constantTimeEqual,
  isAdminConfigured,
  loginAdmin,
  sha256Hex,
} from '../lib/admin/auth'

const SESSION_KEY = 'kuldeep-portfolio-admin-session'

describe('admin auth (hash-based gate)', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    sessionStorage.clear()
  })

  it('sha256Hex produces the known digest for a sample input', async () => {
    expect(await sha256Hex('password')).toBe(
      '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    )
  })

  it('login succeeds when the entered password hashes to the configured digest', async () => {
    const hash = await sha256Hex('correct-horse-battery')
    vi.stubEnv('VITE_ADMIN_PASSWORD_HASH', hash)
    expect(isAdminConfigured()).toBe(true)
    expect(await loginAdmin('correct-horse-battery')).toBe(true)
    expect(sessionStorage.getItem(SESSION_KEY)).toBe('authenticated')
  })

  it('matches even when the configured digest has uppercase hex', async () => {
    const upper = (await sha256Hex('correct-horse-battery')).toUpperCase()
    vi.stubEnv('VITE_ADMIN_PASSWORD_HASH', upper)
    expect(await loginAdmin('correct-horse-battery')).toBe(true)
  })

  it('rejects a wrong password and leaves the session unset', async () => {
    vi.stubEnv('VITE_ADMIN_PASSWORD_HASH', await sha256Hex('correct-horse-battery'))
    expect(await loginAdmin('wrong-password')).toBe(false)
    expect(sessionStorage.getItem(SESSION_KEY)).toBeNull()
  })

  it('safe-defaults when the env var is absent or empty', async () => {
    vi.stubEnv('VITE_ADMIN_PASSWORD_HASH', '')
    expect(isAdminConfigured()).toBe(false)
    expect(await loginAdmin('anything')).toBe(false)
    expect(sessionStorage.getItem(SESSION_KEY)).toBeNull()

    delete import.meta.env.VITE_ADMIN_PASSWORD_HASH
    expect(isAdminConfigured()).toBe(false)
  })

  describe('constantTimeEqual', () => {
    it('accepts identical strings', () => {
      expect(constantTimeEqual('abc123', 'abc123')).toBe(true)
    })

    it('rejects equal-length but different strings', () => {
      expect(constantTimeEqual('abc123', 'abc124')).toBe(false)
    })

    it('rejects different lengths without folding', () => {
      expect(constantTimeEqual('abc', 'abcd')).toBe(false)
      expect(constantTimeEqual('', '')).toBe(true)
    })
  })
})
