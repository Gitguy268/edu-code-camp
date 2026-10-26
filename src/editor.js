// The code editor: CodeMirror 6, coloured by the current look through CSS variables.
import { EditorView, basicSetup } from "codemirror";
import { keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";
import { syntaxHighlighting } from "@codemirror/language";
import { classHighlighter } from "@lezer/highlight";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { sql, SQLite } from "@codemirror/lang-sql";

const LANGS = { js: () => javascript(), py: () => python(), sql: () => sql({ dialect: SQLite }) };

const theme = EditorView.theme({
  "&": { color: "var(--code-text)", backgroundColor: "var(--code-bg)", fontSize: "14.5px", height: "100%" },
  ".cm-content": { fontFamily: "var(--font-code)", caretColor: "var(--code-text)", padding: "10px 0" },
  ".cm-scroller": { fontFamily: "var(--font-code)", lineHeight: "1.55" },
  ".cm-gutters": { backgroundColor: "transparent", color: "var(--code-gutter)", border: "none" },
  ".cm-activeLine": { backgroundColor: "color-mix(in srgb, var(--code-text) 7%, transparent)" },
  ".cm-activeLineGutter": { backgroundColor: "transparent", color: "var(--code-text)" },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": { backgroundColor: "var(--selection) !important" },
  ".cm-cursor, .cm-dropCursor": { borderLeftColor: "var(--code-text)", borderLeftWidth: "2px" },
  ".cm-matchingBracket": { outline: "1px solid var(--code-gutter)", backgroundColor: "transparent" },
  "&.cm-focused": { outline: "none" },
  ".cm-tooltip": { backgroundColor: "var(--surface)", color: "var(--text)", border: "1px solid var(--border)" },
});

export function createEditor(parent, { lang, doc, onChange, label }) {
  const view = new EditorView({
    parent,
    doc,
    extensions: [
      basicSetup,
      keymap.of([indentWithTab]),
      LANGS[lang]?.() ?? [],
      syntaxHighlighting(classHighlighter),
      theme,
      EditorView.contentAttributes.of({ "aria-label": label ?? "Code editor" }),
      EditorView.updateListener.of(u => { if (u.docChanged) onChange?.(u.state.doc.toString()); }),
    ],
  });
  return {
    view,
    get value() { return view.state.doc.toString(); },
    set value(text) { view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: text } }); },
    focus: () => view.focus(),
    destroy: () => view.destroy(),
  };
}
