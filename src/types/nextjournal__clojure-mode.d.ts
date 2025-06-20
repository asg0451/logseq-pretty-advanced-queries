declare module '@nextjournal/clojure-mode' {
  import type { LanguageSupport } from '@codemirror/language'
  import type { Extension } from '@codemirror/state'
  import type { KeyBinding } from '@codemirror/view'
  /** Returns the CodeMirror6 LanguageSupport instance for Clojure */
  export const language_support: LanguageSupport
  
  /** Default extensions for Clojure editing */
  export const default_extensions: Extension[]
  
  /** Complete keymap for Clojure editing */
  export const complete_keymap: KeyBinding[]
}
