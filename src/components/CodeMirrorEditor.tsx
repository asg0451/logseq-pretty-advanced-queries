import { useEffect, useRef } from 'react'
import { EditorState } from '@codemirror/state'
import { EditorView, basicSetup } from 'codemirror'
import { keymap } from '@codemirror/view'
// The Clojure mode ships as a CodeMirror 6 LanguageSupport extension.
// It works for both Clojure and ClojureScript.
import {
  default_extensions,
  complete_keymap,
  language_support,
} from '@nextjournal/clojure-mode'

export interface CodeMirrorEditorProps {
  /** Current editor value */
  value: string
  /** Called on every document change */
  onChange?: (value: string) => void
  /** Optional callback for the Shift+Enter "run" shortcut */
  onRun?: () => void
}

/**
 * Bare CodeMirror 6 editor wired for Clojure(Script) syntax.
 *
 * The component purposefully exposes only the essentials needed in early
 * development.  Additional extensions (linting, autocomplete, etc.) can be
 * layered later without changing this public interface.
 */
export default function CodeMirrorEditor({
  value,
  onChange,
  onRun,
}: CodeMirrorEditorProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const viewRef = useRef<EditorView | null>(null)

  // Initialise the EditorView once the DOM node is available.
  useEffect(() => {
    if (!containerRef.current) return
    if (viewRef.current) return // already mounted

    const state = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        language_support,
        keymap.of(complete_keymap),
        ...default_extensions,
        keymap.of([
          {
            key: 'Shift-Enter',
            run: () => {
              onRun?.()
              return true // prevent default newline insert
            },
          },
        ]),
        EditorView.updateListener.of(update => {
          if (update.docChanged && onChange) {
            onChange(update.state.doc.toString())
          }
        }),
        EditorView.theme({
          '&': { height: '100%' },
          '.cm-content': {
            fontFamily:
              'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace',
            fontSize: '14px',
          },
        }),
      ],
    })

    viewRef.current = new EditorView({ state, parent: containerRef.current })

    return () => {
      viewRef.current?.destroy()
      viewRef.current = null
    }
  }, [onChange, onRun, value])

  // Keep external value in sync when it changes (rare)
  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    if (view.state.doc.toString() === value) return
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: value },
    })
  }, [value])

  return (
    <div ref={containerRef} style={{ height: 300, border: '1px solid #444' }} />
  )
}
