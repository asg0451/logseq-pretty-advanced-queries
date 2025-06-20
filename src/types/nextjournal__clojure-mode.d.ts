declare module '@nextjournal/clojure-mode' {
  import type { LanguageSupport } from '@codemirror/language'
  /** Returns the CodeMirror6 LanguageSupport instance for Clojure */
  export function language_support(): LanguageSupport
}
