- [X] Confirm PRD spec details (UI presets, feature scope) with stakeholders
- [X] Initialize git repository & commit PRD and baseline files
- [X] Add MIT License file
- [X] Bootstrap project via Vite React-TS template (`pnpm create vite@latest logseq-query-editor --template react-ts`)
- [X] Install runtime dependencies: `codemirror`, `@nextjournal/clojure-mode`, `@codemirror/state`, `@codemirror/view`, `@logseq/libs`
- [X] Install dev dependency: `vite-plugin-singlefile`
- [X] Set up ESLint, Prettier, and Husky pre-commit hook for linting
- [X] Configure CI (GitHub Actions) for install, lint, test build
- [X] Scaffold sandbox folder with mocked Logseq API (`mock-logseq.ts`, `seed.ts`, and entry (`index.tsx`))
- [X] Implement bare CodeMirror editor component with Clojure mode, theme, and shortcuts
- [X] Implement query runner using `logseq.DB.datascriptQuery` (mocked in sandbox) that returns prettified JSON
- [X] Create result viewer component with `<pre>` display, copy-to-clipboard, and auto-scroll
- [X] Make the editor have toolbars and other basic UI elements, with built-in codemirror functionality.
- [X] Configure Vite single-file build (add plugin, adjust `vite.config.ts`) and verify `dist/main.js` output size
- [X] Integrate toolbar button & modal panel within actual Logseq environment (`logseq.UI.registerUIItem`)
- [X] Test plugin on Logseq Desktop ≥0.10.x for editor, execution, and results display
- [X] Use an EDN parser to extract the "query" portion of the query map, and pass that into the `datascriptQuery` api.
- [ ] Change the default query to:
    {:title "All tasks"
    :query [:find (pull ?b [*])
            :where
            [?b :block/marker _]]}

- [ ] Pending resolution of https://github.com/logseq/logseq/issues/11956, allow rules to be specified, and make the default query:
    {:title "TODO tasks"
        :query [:find (pull ?b [*])
                :in $ %
                :where
                (task ?b #{"TODO"})]}
    (see https://github.com/logseq/logseq/blob/master/deps/db/src/logseq/db/file_based/rules.cljc#L36 for default rules)


- [ ] Embed (or if available in logseq, use) a clojurescript compiler (such as cljs.js) to eval to evaluate the other components of the advanced query map, such as `:view`. Postprocess the query with that.
- [ ] Add more unit tests that test the eval behaviour
- [ ] Add a datomic backend to the test for more accurate testing
- [ ] Write README with setup, development, and release instructions
- [X] Prepare Logseq marketplace submission (metadata, icon, description)
- [X] Add smoke tests for UI components (CodeMirrorEditor, ResultViewer)
