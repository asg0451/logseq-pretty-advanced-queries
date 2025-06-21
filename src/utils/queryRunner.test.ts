import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { runQuery } from './queryRunner'

// Use a minimal advanced-query EDN map containing a :query key.
const ADVANCED_QUERY =
  '{:title "Example" :query [:find ?b :where [?b :block/refs #{"TODO"}]]}'

// Advanced query with view function
const ADVANCED_QUERY_WITH_VIEW =
  '{:title "Example" :query [:find ?b :where [?b :block/refs #{"TODO"}]] :view (fn [data] (map first data))}'

// Advanced query with result-transform
const ADVANCED_QUERY_WITH_TRANSFORM =
  '{:title "Example" :query [:find ?b :where [?b :block/refs #{"TODO"}]] :result-transform (fn [data] (take 2 data))}'

// Advanced query with both view and result-transform
const ADVANCED_QUERY_WITH_BOTH =
  '{:title "Example" :query [:find ?b :where [?b :block/refs #{"TODO"}]] :result-transform (fn [data] (take 3 data)) :view (fn [data] (map first data))}'

// Extract the expected EDN vector string that should be handed to DataScript.
const EXPECTED_VECTOR = '[:find ?b :where [?b :block/refs #{"TODO"}]]'

describe('runQuery', () => {
  let datascriptQuerySpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    datascriptQuerySpy = vi.fn().mockResolvedValue([
      ['block1', 'content1'],
      ['block2', 'content2'],
      ['block3', 'content3'],
      ['block4', 'content4'],
      ['block5', 'content5'],
    ])

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

  it('applies view function when present', async () => {
    const result = await runQuery(ADVANCED_QUERY_WITH_VIEW)

    expect(datascriptQuerySpy).toHaveBeenCalledWith(EXPECTED_VECTOR)

    // Parse the JSON result to check the transformation
    const parsedResult = JSON.parse(result)
    expect(parsedResult).toEqual([
      'block1',
      'block2',
      'block3',
      'block4',
      'block5',
    ])
  })

  it('applies result-transform when present', async () => {
    const result = await runQuery(ADVANCED_QUERY_WITH_TRANSFORM)

    expect(datascriptQuerySpy).toHaveBeenCalledWith(EXPECTED_VECTOR)

    // Parse the JSON result to check the transformation
    const parsedResult = JSON.parse(result)
    expect(parsedResult).toEqual([
      ['block1', 'content1'],
      ['block2', 'content2'],
    ])
  })

  it('applies result-transform then view when both are present', async () => {
    const result = await runQuery(ADVANCED_QUERY_WITH_BOTH)

    expect(datascriptQuerySpy).toHaveBeenCalledWith(EXPECTED_VECTOR)

    // Parse the JSON result to check the transformation
    const parsedResult = JSON.parse(result)
    // First result-transform takes 3 items, then view maps first
    expect(parsedResult).toEqual(['block1', 'block2', 'block3'])
  })

  it('handles ClojureScript evaluation errors gracefully', async () => {
    const invalidQuery =
      '{:title "Example" :query [:find ?b :where [?b :block/refs #{"TODO"}]] :view invalid-function}'

    const result = await runQuery(invalidQuery)

    expect(datascriptQuerySpy).toHaveBeenCalledWith(EXPECTED_VECTOR)

    // Should return original results when view evaluation fails
    const parsedResult = JSON.parse(result)
    expect(parsedResult).toEqual([
      ['block1', 'content1'],
      ['block2', 'content2'],
      ['block3', 'content3'],
      ['block4', 'content4'],
      ['block5', 'content5'],
    ])
  })

  it('works with empty query results', async () => {
    datascriptQuerySpy.mockResolvedValue([])

    const result = await runQuery(ADVANCED_QUERY_WITH_VIEW)

    expect(datascriptQuerySpy).toHaveBeenCalledWith(EXPECTED_VECTOR)

    const parsedResult = JSON.parse(result)
    expect(parsedResult).toEqual([])
  })
})
