import { useEffect, useRef } from 'react'
import { EditorState } from '@codemirror/state'
import { EditorView, basicSetup } from 'codemirror'
import {
  highlightActiveLineGutter,
  highlightActiveLine,
  rectangularSelection,
  keymap,
} from '@codemirror/view'
import {
  highlightSelectionMatches,
  search,
  searchKeymap,
} from '@codemirror/search'
import { undo, redo, indentWithTab } from '@codemirror/commands'
// The Clojure mode ships as a CodeMirror 6 LanguageSupport extension.
// It works for both Clojure and ClojureScript.
import {
  default_extensions,
  complete_keymap,
  language_support,
} from '@nextjournal/clojure-mode'
// Import prettier for formatting
import prettier from 'prettier/standalone'
import clojurePlugin from '@cospaia/prettier-plugin-clojure'

// Custom theme for better Clojure syntax highlighting visibility
const clojureHighlightTheme = EditorView.theme({
  // Clojure-specific syntax highlighting improvements
  '.cm-punctuation': { color: '#64b5f6' }, // Light blue for brackets, parens
  '.cm-bracket': { color: '#64b5f6' }, // Light blue for brackets
  '.cm-paren': { color: '#64b5f6' }, // Light blue for parentheses
  '.cm-brace': { color: '#64b5f6' }, // Light blue for braces
  '.cm-variableName': { color: '#81c784' }, // Light green for variable names
  '.cm-function': { color: '#ffb74d' }, // Light orange for function names
  '.cm-keyword': { color: '#e57373' }, // Light red for keywords
  '.cm-atom': { color: '#ba68c8' }, // Light purple for atoms/keywords
  '.cm-bool': { color: '#ba68c8' }, // Light purple for booleans
  '.cm-number': { color: '#4fc3f7' }, // Light cyan for numbers
  '.cm-string': { color: '#a5d6a7' }, // Light green for strings
  '.cm-comment': { color: '#9e9e9e' }, // Gray for comments
  '.cm-meta': { color: '#ffcc02' }, // Yellow for metadata
  '.cm-builtin': { color: '#ff8a65' }, // Light orange for built-ins
  '.cm-def': { color: '#ffb74d' }, // Light orange for definitions
  '.cm-operator': { color: '#64b5f6' }, // Light blue for operators
  '.cm-special': { color: '#ff8a65' }, // Light orange for special forms
  '.cm-namespace': { color: '#81c784' }, // Light green for namespaces
  '.cm-property': { color: '#ffb74d' }, // Light orange for properties
  '.cm-tag': { color: '#e57373' }, // Light red for tags
  '.cm-attribute': { color: '#ffb74d' }, // Light orange for attributes
  '.cm-qualifier': { color: '#81c784' }, // Light green for qualifiers
  '.cm-type': { color: '#ba68c8' }, // Light purple for types
  '.cm-modifier': { color: '#ffcc02' }, // Yellow for modifiers
  '.cm-regexp': { color: '#4fc3f7' }, // Light cyan for regex
  '.cm-escape': { color: '#ffcc02' }, // Yellow for escape sequences
  '.cm-invalid': { color: '#f44336', textDecoration: 'underline' }, // Red for invalid syntax

  // Additional improvements for brackets and matching
  '.cm-matchingBracket': {
    backgroundColor: 'rgba(100, 181, 246, 0.2)',
    color: '#64b5f6',
    fontWeight: 'bold',
  },
  '.cm-nonmatchingBracket': {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    color: '#f44336',
  },

  // Improve selection visibility
  '.cm-selectionBackground': { backgroundColor: 'rgba(100, 181, 246, 0.3)' },
  '.cm-focused .cm-selectionBackground': {
    backgroundColor: 'rgba(100, 181, 246, 0.4)',
  },

  // Improve cursor visibility
  '.cm-cursor': { borderLeft: '2px solid #64b5f6' },
  '.cm-dropCursor': { borderLeft: '2px solid #64b5f6' },
})

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
  // Capture initial value to avoid dependency issues in mount effect
  const initialValueRef = useRef(value)
  // Hold latest callback refs to avoid remounting the editor on every render.
  const onChangeRef = useRef<typeof onChange>(onChange)
  const onRunRef = useRef<typeof onRun>(onRun)

  // Update refs whenever callbacks change.
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    onRunRef.current = onRun
  }, [onRun])

  // Format the current code using prettier with Clojure plugin
  const formatCode = async () => {
    const view = viewRef.current
    if (!view) return

    try {
      const currentCode = view.state.doc.toString()
      const formattedCode = await prettier.format(currentCode, {
        parser: 'clojure',
        plugins: [clojurePlugin],
      })

      // Apply the formatted code to the editor
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: formattedCode },
      })

      // Notify parent component of the change
      if (onChangeRef.current) {
        onChangeRef.current(formattedCode)
      }
    } catch (error) {
      console.error('Failed to format code:', error)
      // Could show user-friendly error message here
    }
  }

  // Mount the EditorView once with initial value. Subsequent value changes handled separately.
  useEffect(() => {
    if (!containerRef.current) return
    if (viewRef.current) return // already mounted

    const state = EditorState.create({
      doc: initialValueRef.current,
      extensions: [
        // Custom keymap first so it takes precedence over defaults
        keymap.of([
          {
            key: 'Shift-Enter',
            run: () => {
              onRunRef.current?.()
              return true // prevent default newline insert
            },
          },
        ]),
        basicSetup,
        language_support,
        keymap.of(complete_keymap),
        ...default_extensions,
        // Enhanced editor ergonomics beyond the default basicSetup
        highlightActiveLineGutter(),
        highlightActiveLine(),
        highlightSelectionMatches(),
        search({ top: true }),
        EditorView.lineWrapping,
        rectangularSelection(),
        keymap.of([indentWithTab]),
        // Search panel & keys (Cmd/Ctrl+F, etc.)
        keymap.of(searchKeymap),
        EditorView.updateListener.of(update => {
          if (update.docChanged && onChangeRef.current) {
            onChangeRef.current(update.state.doc.toString())
          }
        }),
        EditorView.theme({
          '&': { height: '100%' },
          '.cm-content': {
            fontFamily:
              'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace',
            fontSize: '14px',
            textAlign: 'left',
          },
          '.cm-editor': {
            textAlign: 'left',
          },
        }),
        clojureHighlightTheme,
      ],
    })

    viewRef.current = new EditorView({ state, parent: containerRef.current })

    return () => {
      viewRef.current?.destroy()
      viewRef.current = null
    }
  }, []) // Intentionally empty - we only want to mount once

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
    <div style={{ display: 'flex', flexDirection: 'column', height: 340 }}>
      <div
        style={{
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          padding: '4px 0',
        }}
      >
        {/* Run Button */}
        {onRun && (
          <button
            type="button"
            onClick={() => onRun()}
            title="Run (Shift+Enter)"
            style={{ cursor: 'pointer' }}
          >
            ▶ Run
          </button>
        )}

        {/* Format Button */}
        <button
          type="button"
          onClick={formatCode}
          title="Format code using prettier"
          style={{ cursor: 'pointer' }}
        >
          ✨ Format
        </button>

        {/* Undo / Redo use CodeMirror commands */}
        <button
          type="button"
          onClick={() => viewRef.current && undo(viewRef.current)}
          title="Undo (Ctrl/Cmd+Z)"
          style={{ cursor: 'pointer' }}
        >
          ↺ Undo
        </button>
        <button
          type="button"
          onClick={() => viewRef.current && redo(viewRef.current)}
          title="Redo (Ctrl/Cmd+Y)"
          style={{ cursor: 'pointer' }}
        >
          ↻ Redo
        </button>
      </div>

      {/* Editor container */}
      <div ref={containerRef} style={{ flex: 1, border: '1px solid #444' }} />
    </div>
  )
}
