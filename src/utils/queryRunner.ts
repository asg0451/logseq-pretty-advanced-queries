/**
 * Execute a Logseq advanced/DataScript query and return the pre-formatted JSON
 * results. When the code runs inside Logseq, it uses the global `logseq` variable
 * with `DB` and `UI` namespaces. We perform a minimal shape check instead of using
 * `instanceof` to remain resilient to bundler tree-shaking and cross-realm issues.
 */
import { parseEDNString, toEDNString } from 'edn-data'

interface ednSymbol {
  key: string
}

export async function runQuery(query: string): Promise<string> {
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

  const parsed = parseEDNString(query, {
    mapAs: 'map',
    keywordAs: 'keyword',
  }) as Map<ednSymbol, unknown>

  const queryEdn = Array.from(parsed.entries()).find(
    ([key]) => key.key === 'query',
  )?.[1]
  const queryStr = toEDNString(queryEdn)

  // Execute the query and stringify the result for display.
  const raw = await logseqApi.DB.datascriptQuery(queryStr)
  return JSON.stringify(raw, null, 2)
}
