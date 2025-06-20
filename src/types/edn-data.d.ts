declare module 'edn-data' {
  interface ParseOptions {
    mapAs?: 'object' | 'map'
    keywordAs?: 'string' | 'keyword'
  }

  /** Parse an EDN string and return the corresponding JavaScript value */
  export function parseEDNString(edn: string, options?: ParseOptions): unknown
}
