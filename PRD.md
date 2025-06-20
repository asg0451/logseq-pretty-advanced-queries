Below is a complete **design & implementation plan** for a Logseq “Advanced Query Editor” plugin that matches your answers.  In short, we’ll build a TypeScript plugin that bundles a CodeMirror-6 Clojure(Script) editor into a single `main.js`, launches from a toolbar button, executes transient DataScript queries through `logseq.DB.datascriptQuery`, and shows raw JSON results.  A Vite-powered sandbox with a mocked Logseq API lets you iterate quickly before shipping.  Details follow.

## 1  Goals & non-goals

* **Goals**

  * Provide an embedded editor with syntax highlighting, basic shortcuts, and a “Run” action for ad-hoc Logseq advanced queries (wrapped ClojureScript map + Datalog vector).
  * Display results as minimal, copy-able JSON.
  * Ship as a single, MIT-licensed `main.js` plugin for recent desktop Logseq versions.
  * Offer a standalone web harness for rapid development/testing.

* **Non-goals**

  * Persistent query storage or snippet management (may be added later).
  * Deep IntelliSense, autocomplete, or schema-aware linting unless it’s trivial.

## 2  Technical foundations

| Concern                 | Decision                                                                        | Notes                                                                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Editor engine           | **CodeMirror 6** with `@nextjournal/clojure-mode`                               | Light bundle; supports Clojure **and ClojureScript** — syntax is identical, so no extra work needed ([github.com][1], [nextjournal.github.io][2]) |
| Query execution         | `logseq.DB.datascriptQuery` / `logseq.DB.q`                                     | Returns a Promise of tuples; API documented in community docs and forum examples ([discuss.logseq.com][3])                                        |
| Advanced-query envelope | Map keys surfaced as presets: `:title`, `:inputs`, `:view`, `:result-transform` | Derived from Logseq docs & forum explanations ([discuss.logseq.com][4], [discuss.logseq.com][5])                                                  |
| UI entry point          | `logseq.UI.registerUIItem("toolbar", …)`                                        | Adds a toolbar icon; proven in sample plugins and bug threads ([discuss.logseq.com][6], [github.com][7])                                          |
| Build pipeline          | Vite + `vite-plugin-singlefile` → single `main.js`                              | Keeps the official sample layout, but emits one file for plugin packaging ([github.com][8], [npmjs.com][9])                                       |
| Data layer              | DataScript (browser)                                                            | Same engine Logseq uses; language reference on GitHub ([github.com][10], [github.com][11])                                                        |
| Dev harness             | React/Vite sandbox that mocks `logseq.*`                                        | Lets you seed a DataScript DB and stub `datascriptQuery`, inspired by plugin-sample dev workflow ([discuss.logseq.com][12])                       |

## 3  High-level architecture

### 3.1  Runtime components

1. **Toolbar launcher** – registers on plugin `main` startup.
2. **Modal panel** – lightweight React component housing the CodeMirror instance, preset controls, and “Run” button.
3. **Query runner** – packs user input into `[advanced-query-map]` EDN, calls `logseq.DB.datascriptQuery`, converts the tuple array to prettified JSON.
4. **Result viewer** – `<pre>` element with monospace formatting; auto-scrolls and offers “Copy JSON” action.

### 3.2  Standalone sandbox

```
/sandbox
  ├─ mock-logseq.ts     // Minimal stubs for DB, UI
  ├─ seed.ts            // Sample blocks & pages for DataScript
  └─ index.tsx          // Re-exports plugin UI in dev mode
```

Run `pnpm dev` to hot-reload the editor without opening Logseq.

## 4  User-interface flow

1. **User clicks toolbar icon** → modal opens with:

   * CodeMirror area preloaded with a template:

     ```clojure
     {:title "Ad-hoc"
      :query [:find ?b :where [?b :block/refs #{"TODO"}]]}
     ```
   * Dropdown presets for `view`, `inputs`, `result-transform`.
   * “Run” button (or `⇧⏎`) to execute.
2. **Execution** → spinner overlay while awaiting Promise.
3. **Results panel** replaces (or slides under) editor, showing JSON.

## 5  Build & packaging

1. `pnpm create vite@latest logseq-query-editor --template react-ts`
2. Add dependencies:

   ```bash
   pnpm add codemirror @nextjournal/clojure-mode @codemirror/state @codemirror/view @logseq/libs
   pnpm add -D vite-plugin-singlefile
   ```
3. `vite.config.ts`:

   ```ts
   import singleFile from 'vite-plugin-singlefile';
   export default { plugins: [singleFile()], build: { lib: { entry: 'src/main.ts', formats: ['iife'], name: 'main' } } };
   ```
4. `pnpm build` → `dist/main.js` (≤ \~400 KB gzipped).

## 6  Implementation roadmap

| Phase                                 | Deliverable                        | Est. effort |
| ------------------------------------- | ---------------------------------- | ----------- |
| **0** Bootstrap repo, CI, MIT license | skeleton + pre-commit lint         | 0.5 d       |
| **1** Stand-alone sandbox             | mock API, seed DB, bare editor     | 1 d         |
| **2** CodeMirror integration          | Clojure mode, shortcuts, theme     | 1 d         |
| **3** Advanced-query presets UI       | React controls, EDN assembly       | 0.5 d       |
| **4** Query execution + JSON viewer   | handles errors gracefully          | 1 d         |
| **5** Toolbar & modal in real Logseq  | registerUIItem, panel style        | 0.5 d       |
| **6** Vite single-file build & test   | run on 0.10.x desktop              | 0.5 d       |
| **7** Docs & release                  | README, GIF demo, marketplace form | 0.5 d       |
| **Total:** \~5 developer-days.        |                                    |             |

## 7  Risks & mitigations

| Risk                                 | Mitigation                                                                                        |
| ------------------------------------ | ------------------------------------------------------------------------------------------------- |
| **Logseq API shape drift** (pre-1.0) | Keep `logseq` peerDep loose; wrap calls in thin adapter to patch quickly.                         |
| **CodeMirror bundle size**           | Tree-shake unused CM6 packages; defer load until modal opens.                                     |
| **ClojureScript vs Clojure quirks**  | The editor works on reader syntax; query engine itself is DataScript JS, so no language mismatch. |

## 8  Next steps

- [X] Confirm this spec, especially UI details and preset list.
- [ ] Create repository and scaffold (Phase 0).
- [ ] Begin sandbox work (Phase 1).

[1]: https://github.com/nextjournal/clojure-mode?utm_source=chatgpt.com "nextjournal/clojure-mode: Clojure/Script mode for CodeMirror 6"
[2]: https://nextjournal.github.io/clojure-mode/?utm_source=chatgpt.com "Clojure/Script mode for CodeMirror 6"
[3]: https://discuss.logseq.com/t/logseq-db-q-case-insensitive-search-using-logseq-api/26259?utm_source=chatgpt.com "logseq.DB.q - case insensitive search using logseq API"
[4]: https://discuss.logseq.com/t/how-to-show-page-title-in-table-view-mode-by-using-advanced-query/14789?utm_source=chatgpt.com "How to show page title in table view mode by using advanced query"
[5]: https://discuss.logseq.com/t/how-advanced-queries-work-step-by-step-explainer/30544?utm_source=chatgpt.com "How advanced queries work - step-by-step explainer"
[6]: https://discuss.logseq.com/t/add-a-plugin-button-to-sidebar-pagebar-not-working-with-registeruiitem/20056?utm_source=chatgpt.com "Add a plugin button to sidebar (pagebar) not working with ..."
[7]: https://github.com/logseq/logseq/issues/9275?utm_source=chatgpt.com "[API] registerUIItem for pagebar stops to work · Issue #9275 - GitHub"
[8]: https://github.com/logseq/logseq-plugin-samples?utm_source=chatgpt.com "Logseq plugin samples for beginner - GitHub"
[9]: https://www.npmjs.com/package/vite-plugin-singlefile?utm_source=chatgpt.com "vite-plugin-singlefile - NPM"
[10]: https://github.com/tonsky/datascript/blob/master/docs/queries.md?utm_source=chatgpt.com "datascript/docs/queries.md at master - GitHub"
[11]: https://github.com/tonsky/datascript?utm_source=chatgpt.com "tonsky/datascript: Immutable database and Datalog query ... - GitHub"
[12]: https://discuss.logseq.com/t/logseq-plugin-samples-repository-translator-plugin-handshake-timeout/26500?utm_source=chatgpt.com "Translator plugin: handshake Timeout - Questions & Help - Logseq"
