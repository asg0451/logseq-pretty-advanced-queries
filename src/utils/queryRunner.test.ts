import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { runQuery } from './queryRunner'

// Use a minimal advanced-query EDN map containing a :query key.
const ADVANCED_QUERY =
  '{:title "Example" :query [:find ?b :where [?b :block/refs #{"TODO"}]]}'

// Extract the expected EDN vector string that should be handed to DataScript.
const EXPECTED_VECTOR = '[:find ?b :where [?b :block/refs #{"TODO"}]]'

describe('runQuery', () => {
  let datascriptQuerySpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    datascriptQuerySpy = vi.fn().mockResolvedValue([])

    // Inject a stubbed Logseq-like object so that runQuery uses it instead of
    // dynamically importing the sandbox mock.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(globalThis as any).logseq = {
      DB: { datascriptQuery: datascriptQuerySpy },
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
    // Clean up global injection to avoid leaking between tests.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (globalThis as any).logseq
  })

  it('passes only the :query vector to datascriptQuery', async () => {
    await runQuery(ADVANCED_QUERY)

    expect(datascriptQuerySpy).toHaveBeenCalledTimes(1)
    expect(datascriptQuerySpy).toHaveBeenCalledWith(EXPECTED_VECTOR)
  })
})
