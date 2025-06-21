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

interface AdvancedQueryComponents {
  query?: unknown
  view?: unknown
  inputs?: unknown
  'result-transform'?: unknown
  title?: string
  collapsed?: boolean
  [key: string]: unknown
}

/**
 * Apply a simple JavaScript-based transformation to query results.
 * This is a basic implementation that can be enhanced with full ClojureScript evaluation later.
 */
function applyResultTransform(
  results: unknown[],
  transform: unknown,
): unknown[] {
  // For now, we'll just pass through the results
  // TODO: Implement proper ClojureScript evaluation for transformations
  console.log('Result transform specified but not yet implemented:', transform)
  return results
}

/**
 * Apply a simple view transformation to query results.
 * This converts raw query results into a more readable format.
 */
function applyView(results: unknown[], view: unknown): unknown {
  // For now, implement some basic view transformations
  if (typeof view === 'string') {
    // Simple string views might be like "table", "list", etc.
    switch (view) {
      case 'table':
        return {
          type: 'table',
          data: results,
          columns: results.length > 0 ? Object.keys(results[0] || {}) : [],
        }
      case 'list':
        return {
          type: 'list',
          items: results,
        }
      default:
        return { type: 'raw', data: results }
    }
  }

  // For complex view functions, we'll need ClojureScript evaluation
  // TODO: Implement proper ClojureScript evaluation for view functions
  console.log('Complex view specified but not yet implemented:', view)
  return { type: 'raw', data: results }
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

  // Parse the EDN string to extract all components
  const parsed = parseEDNString(query, {
    mapAs: 'map',
    keywordAs: 'keyword',
  }) as Map<ednSymbol, unknown>

  // Extract all query components
  const components: AdvancedQueryComponents = {}

  for (const [key, value] of parsed.entries()) {
    const keyName = key.key
    components[keyName] = value
  }

  // Extract the main query component
  const queryEdn = components.query
  if (!queryEdn) {
    throw new Error('No :query component found in advanced query map')
  }

  const queryStr = toEDNString(queryEdn)

  // Execute the base query
  let results = await logseqApi.DB.datascriptQuery(queryStr)

  // Apply result transformations if specified
  if (components['result-transform']) {
    results = applyResultTransform(results, components['result-transform'])
  }

  // Apply view transformations if specified
  let finalResults: unknown = results
  if (components.view) {
    finalResults = applyView(results, components.view)
  }

  // Create enhanced result object with metadata
  const enhancedResult = {
    results: finalResults,
    metadata: {
      title: components.title || 'Advanced Query Results',
      collapsed: components.collapsed || false,
      hasView: !!components.view,
      hasResultTransform: !!components['result-transform'],
      hasInputs: !!components.inputs,
      queryComponents: Object.keys(components),
    },
    rawResults: results, // Keep original results for debugging
  }

  return JSON.stringify(enhancedResult, null, 2)
}
