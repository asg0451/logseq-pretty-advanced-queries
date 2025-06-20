export async function runQuery(query: unknown): Promise<string> {
  // Importing here avoids circular deps when the actual plugin runtime provides a global `logseq`.
  // In the sandbox we rely on the mocked implementation living under `sandbox/mock-logseq`.

  const { logseq } = await import('../../sandbox/mock-logseq')

  // Execute the query through the mocked (or real) Logseq API.
  const raw = await logseq.DB.datascriptQuery(query)

  // Return a human-readable JSON string.
  return JSON.stringify(raw, null, 2)
}
