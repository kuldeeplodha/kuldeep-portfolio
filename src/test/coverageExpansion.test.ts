import { describe, expect, it } from 'vitest'
import { ClientSearchProvider, ServerLLMProvider, getAIProvider, setAIProvider, type AIProvider } from '../lib/ai/provider'

// CMS-UNIFY-CONFIG-EDITOR: this file used to also cover validationRegistry
// and exportImport branch coverage (the legacy Configuration Panel's
// draft/import/export/validation machinery) -- all removed along with
// those files. Only the AI provider registry suite, unrelated to the
// retired config-draft system, survives.

describe('coverage expansion — AI provider registry', () => {
  it('getAIProvider/setAIProvider swap the active provider', async () => {
    const original = getAIProvider()
    expect(original).toBeInstanceOf(ClientSearchProvider)

    const custom: AIProvider = { search: async (q: string) => `echo:${q}` }
    setAIProvider(custom)
    expect(getAIProvider()).toBe(custom)
    expect(await getAIProvider().search('hi')).toBe('echo:hi')

    setAIProvider(original)
    expect(getAIProvider()).toBe(original)
  })

  it('ServerLLMProvider is not configured', async () => {
    await expect(new ServerLLMProvider().search('x')).rejects.toThrow('not configured')
  })
})
