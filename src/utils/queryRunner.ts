/**
 * Execute a Logseq advanced/DataScript query and return the pre-formatted JSON
 * results. When the code runs inside Logseq, it uses the global `logseq` variable
 * with `DB` and `UI` namespaces. We perform a minimal shape check instead of using
 * `instanceof` to remain resilient to bundler tree-shaking and cross-realm issues.
 */
import { parseEDNString } from 'edn-data'

export async function runQuery(query: unknown): Promise<string> {
  // Detect whether we are running inside Logseq. The official plugin runtime
  // injects a global `logseq` variable with `DB` and `UI` namespaces. We perform
  // a minimal shape check instead of using `instanceof` to remain resilient to
  // bundler tree-shaking and cross-realm issues.

  type LogseqLike = {
    DB: { datascriptQuery: (q: unknown) => Promise<unknown[]> }
  }
  let logseqApi: LogseqLike

  if (
    typeof globalThis !== 'undefined' &&
    (globalThis as { logseq?: Partial<LogseqLike> }).logseq?.DB
  ) {
    // Real environment → use the provided API. The double assertion via `unknown` bypasses
    // the structural mismatch warning while still keeping types reasonably safe.
    logseqApi = (globalThis as unknown as { logseq: LogseqLike }).logseq
  } else {
    // Dev/sandbox → fall back to the lightweight mock.
    // Dynamic import keeps the mock out of the production bundle when Vite
    // performs dead-code elimination based on the `if` branch above.

    const { logseq } = await import('../../sandbox/mock-logseq')
    logseqApi = logseq as LogseqLike
  }

  // Normalize the input: if the caller passes an advanced-query EDN map as a
  // string, extract only the `:query` portion so that we hand DataScript a
  // plain Datalog vector. For non-string inputs (or when parsing fails), we
  // fall back to the original value so that existing behaviour is preserved.

  let datascriptInput: unknown = query

  if (typeof query === 'string') {
    try {
      const parsed = parseEDNString(query, {
        mapAs: 'object',
        keywordAs: 'string',
      }) as Record<string, unknown>

      // When the root form is an advanced-query map, look for a `query` key
      // (the leading colon is stripped by `keywordAs: 'string'`). Otherwise we
      // assume the string already represents a bare Datalog vector.
      if (
        parsed &&
        typeof parsed === 'object' &&
        'query' in parsed &&
        parsed.query != null
      ) {
        datascriptInput = (parsed as { query: unknown }).query
      } else {
        datascriptInput = parsed
      }
    } catch {
      // Ignore parser errors – the user might already be supplying a raw
      // Datalog vector or malformed EDN. In that case we defer to Logseq/DataScript
      // for validation by forwarding the original string.
    }
  }

  // Execute the query and stringify the result for display.
  const raw = await logseqApi.DB.datascriptQuery(datascriptInput)
  return JSON.stringify(raw, null, 2)
}
