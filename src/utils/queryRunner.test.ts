import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { runQuery } from './queryRunner'

// Use a minimal advanced-query EDN map containing a :query key.
const BASIC_ADVANCED_QUERY =
  '{:title "Example" :query [:find ?b :where [?b :block/refs #{"TODO"}]]}'

// Advanced query with view component
const ADVANCED_QUERY_WITH_VIEW =
  '{:title "Table View" :query [:find ?b :where [?b :block/refs #{"TODO"}]] :view "table"}'

// Advanced query with result transform
const ADVANCED_QUERY_WITH_TRANSFORM =
  '{:title "Transformed" :query [:find ?b :where [?b :block/refs #{"TODO"}]] :result-transform "(fn [results] (map first results))"}'

// Advanced query with multiple components
const COMPLEX_ADVANCED_QUERY =
  '{:title "Complex Query" :query [:find ?b :where [?b :block/refs #{"TODO"}]] :view "list" :result-transform "(fn [x] x)" :collapsed true}'

// Extract the expected EDN vector string that should be handed to DataScript.
const EXPECTED_VECTOR = '[:find ?b :where [?b :block/refs #{"TODO"}]]'

describe('runQuery', () => {
  let datascriptQuerySpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    datascriptQuerySpy = vi.fn().mockResolvedValue([['block-1'], ['block-2']])

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
    await runQuery(BASIC_ADVANCED_QUERY)

    expect(datascriptQuerySpy).toHaveBeenCalledTimes(1)
    expect(datascriptQuerySpy).toHaveBeenCalledWith(EXPECTED_VECTOR)
  })

  it('extracts and includes metadata from advanced query components', async () => {
    const result = await runQuery(BASIC_ADVANCED_QUERY)
    const parsed = JSON.parse(result)

    expect(parsed).toHaveProperty('results')
    expect(parsed).toHaveProperty('metadata')
    expect(parsed.metadata).toMatchObject({
      title: 'Example',
      collapsed: false,
      hasView: false,
      hasResultTransform: false,
      hasInputs: false,
      queryComponents: expect.arrayContaining(['title', 'query']),
    })
    expect(parsed).toHaveProperty('rawResults')
  })

  it('applies view transformations when :view is specified', async () => {
    const result = await runQuery(ADVANCED_QUERY_WITH_VIEW)
    const parsed = JSON.parse(result)

    expect(parsed.metadata.hasView).toBe(true)
    expect(parsed.results).toMatchObject({
      type: 'table',
      data: [['block-1'], ['block-2']],
    })
  })

  it('detects result-transform component', async () => {
    const result = await runQuery(ADVANCED_QUERY_WITH_TRANSFORM)
    const parsed = JSON.parse(result)

    expect(parsed.metadata.hasResultTransform).toBe(true)
    expect(parsed.metadata.title).toBe('Transformed')
  })

  it('handles complex queries with multiple components', async () => {
    const result = await runQuery(COMPLEX_ADVANCED_QUERY)
    const parsed = JSON.parse(result)

    expect(parsed.metadata).toMatchObject({
      title: 'Complex Query',
      collapsed: true,
      hasView: true,
      hasResultTransform: true,
      hasInputs: false,
    })

    expect(parsed.results).toMatchObject({
      type: 'list',
      items: [['block-1'], ['block-2']],
    })

    expect(parsed.metadata.queryComponents).toContain('title')
    expect(parsed.metadata.queryComponents).toContain('query')
    expect(parsed.metadata.queryComponents).toContain('view')
    expect(parsed.metadata.queryComponents).toContain('result-transform')
    expect(parsed.metadata.queryComponents).toContain('collapsed')
  })

  it('throws error when no :query component is found', async () => {
    const invalidQuery = '{:title "No Query" :view "table"}'

    await expect(runQuery(invalidQuery)).rejects.toThrow(
      'No :query component found in advanced query map',
    )
  })

  it('applies list view transformation', async () => {
    const queryWithListView =
      '{:query [:find ?b :where [?b :block/refs #{"TODO"}]] :view "list"}'
    const result = await runQuery(queryWithListView)
    const parsed = JSON.parse(result)

    expect(parsed.results).toMatchObject({
      type: 'list',
      items: [['block-1'], ['block-2']],
    })
  })

  it('handles unknown view types gracefully', async () => {
    const queryWithUnknownView =
      '{:query [:find ?b :where [?b :block/refs #{"TODO"}]] :view "unknown"}'
    const result = await runQuery(queryWithUnknownView)
    const parsed = JSON.parse(result)

    expect(parsed.results).toMatchObject({
      type: 'raw',
      data: [['block-1'], ['block-2']],
    })
  })
})
