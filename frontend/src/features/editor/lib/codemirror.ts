import { basicSetup } from 'codemirror';
import { EditorView, ViewPlugin, ViewUpdate, keymap, Decoration, DecorationSet, MatchDecorator, placeholder } from '@codemirror/view';
import { markdown, markdownLanguage, insertNewlineContinueMarkup } from '@codemirror/lang-markdown';
import { syntaxTree, HighlightStyle, syntaxHighlighting, LanguageDescription } from '@codemirror/language';
import { EditorState, Extension, Prec } from '@codemirror/state';
import { Tag, tags as t } from '@lezer/highlight';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { closeBrackets } from '@codemirror/autocomplete';
import { GFM, Table } from '@lezer/markdown';

// Custom tags
const markTag = Tag.define();

// 1. Highlight Decoration Plugin
const highlightDecorator = new MatchDecorator({
  regexp: /==([^=]+)==/g,
  decoration: m => Decoration.mark({ class: 'cm-highlight' })
});

const highlightPlugin = ViewPlugin.fromClass(class {
  decorations: DecorationSet;
  constructor(view: EditorView) { this.decorations = highlightDecorator.createDeco(view); }
  update(update: ViewUpdate) { this.decorations = highlightDecorator.updateDeco(update, this.decorations); }
}, { decorations: v => v.decorations });

// 2. Custom backtick and backspace-pair handler
const pairs: Record<string, string> = {
  '(': ')',
  '[': ']',
  '{': '}',
  "'": "'",
  '"': '"',
  '`': '`'
};

const customKeymap = keymap.of([
  {
    key: '`',
    run: (view: EditorView) => {
      const { state } = view;
      const { selection } = state;
      const main = selection.main;
      if (!main.empty) return false;

      const line = state.doc.lineAt(main.from);
      const before = state.doc.sliceString(line.from, main.from);
      
      if (before === '``') {
        view.dispatch({
          changes: { from: main.from, insert: '`\n\n```' },
          selection: { anchor: main.from + 2 }
        });
        return true;
      }
      
      const after = state.doc.sliceString(main.from, main.from + 1);
      if (after === '`') {
        view.dispatch({ selection: { anchor: main.from + 1 } });
        return true;
      }

      view.dispatch({
        changes: { from: main.from, insert: '``' },
        selection: { anchor: main.from + 1 }
      });
      return true;
    }
  },
  {
    key: 'Backspace',
    run: (view: EditorView) => {
      const { state } = view;
      const { selection } = state;
      const main = selection.main;
      if (!main.empty || main.from === 0) return false;

      const charBefore = state.doc.sliceString(main.from - 1, main.from);
      const charAfter = state.doc.sliceString(main.from, main.from + 1);

      if (pairs[charBefore] === charAfter) {
        view.dispatch({
          changes: { from: main.from - 1, to: main.from + 1, insert: '' },
          selection: { anchor: main.from - 1 }
        });
        return true;
      }
      return false;
    }
  }
]);

// Helper to filter out undefined tags
function tags(...tagList: (Tag | undefined)[]) {
  return tagList.filter((x): x is Tag => x !== undefined);
}

// 3. VS Code Light-like Highlight Style
export const markdownHighlightStyle = HighlightStyle.define([
  { tag: t.heading1, fontSize: '1.6em', fontWeight: 'bold', color: '#000000' },
  { tag: t.heading2, fontSize: '1.4em', fontWeight: 'bold', color: '#000000' },
  { tag: t.heading3, fontSize: '1.2em', fontWeight: 'bold', color: '#000000' },
  { tag: t.strong, fontWeight: 'bold', color: '#000000' },
  { tag: t.emphasis, fontStyle: 'italic' },
  { tag: t.strikethrough, textDecoration: 'line-through', color: '#808080' },
  { tag: t.link, color: '#005cc5', textDecoration: 'underline' },
  { tag: t.url, color: '#0366d6' },
  { tag: t.keyword, color: '#d73a49' },
  { tag: t.comment, color: '#6a737d', fontStyle: 'italic' },
  { tag: t.string, color: '#032f62' },
  { tag: t.number, color: '#005cc5' },
  { tag: t.operator, color: '#d73a49' },
  { tag: t.className, color: '#6f42c1' },
  { tag: t.propertyName, color: '#005cc5' },
  { tag: t.list, color: '#005cc5', fontWeight: 'bold' },
  { tag: tags(markTag, t.processingInstruction, t.labelName, t.meta), color: '#b0b0b0', fontWeight: 'normal', fontStyle: 'normal' },
  { tag: tags(t.monospace, t.literal, t.special(t.string)), class: 'cm-inline-code' }
]);

// 4. Base theme
const baseTheme = EditorView.theme({
  '&': {
    height: 'auto',
    minHeight: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'transparent',
    fontSize: '14px',
    fontFamily: 'var(--font-mono)'
  },
  '.cm-scroller': { 
    overflow: 'visible', 
    flexGrow: '1', 
    padding: '0' 
  },
  '.cm-content': { padding: '20px 40px 40px 40px', caretColor: '#000000' },
  '.cm-placeholder': {
    color: 'var(--ink-faint)',
    fontStyle: 'italic',
    position: 'relative',
    display: 'inline-block',
    paddingLeft: '12px'
  },
  '.cm-placeholder::before': {
    content: '""',
    position: 'absolute',
    left: '0',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '4px',
    height: '14px',
    backgroundColor: 'var(--accent-deep-teal)',
    opacity: '0.4'
  },
  '&.cm-focused .cm-cursor': { borderLeftColor: '#000000' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': { backgroundColor: '#add6ff !important' },
  '.cm-gutters': { backgroundColor: 'transparent', color: '#a0a0a0', border: 'none' },
  '.cm-activeLine': { backgroundColor: 'rgba(0,0,0,0.03)' },
  '.cm-highlight': { backgroundColor: '#ffff00', color: '#000000', borderRadius: '2px', padding: '1px 0' },
  '.cm-inline-code': {
    backgroundColor: 'rgba(27,31,35,0.08)',
    color: '#24292e',
    borderRadius: '3px',
    padding: '2px 4px',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.9em'
  },
  '.cm-fencedCode': {
    backgroundColor: 'rgba(27,31,35,0.05)',
    display: 'block',
    margin: '0 -4px',
    padding: '0 4px',
    borderRadius: '2px',
    border: '1px solid rgba(0,0,0,0.05)'
  }
});

// Verification
const syntaxLogger = ViewPlugin.fromClass(class {
  update(update: ViewUpdate) { if (update.docChanged) console.log('Syntax Tree:', syntaxTree(update.state).toString()); }
});

/**
 * Custom extension to handle auto-scrolling when the cursor 
 * moves near the edges of the parent scroll container.
 * This is necessary because the editor itself has height: auto and 
 * relies on a parent (.custom-scrollbar) for scrolling.
 */
const autoScrollExtension = EditorView.updateListener.of((update) => {
  // Only trigger on actual document changes or selection moves (typing/navigation)
  if (!update.docChanged && !update.selectionSet) return;
  
  const view = update.view;
  const selection = update.state.selection.main;
  if (!selection.empty) return; 
  
  const pos = selection.head;
  const coords = view.coordsAtPos(pos);
  if (!coords) return;

  // Find the nearest scrollable parent
  let parent = view.dom.parentElement;
  while (parent) {
    const style = window.getComputedStyle(parent);
    const isScrollable = (style.overflowY === 'auto' || style.overflowY === 'scroll') && parent.scrollHeight > parent.clientHeight;
    if (isScrollable) break;
    parent = parent.parentElement;
  }

  if (parent) {
    const rect = parent.getBoundingClientRect();
    const margin = 120; // Trigger scroll when cursor is within 120px of top/bottom

    if (coords.bottom > rect.bottom - margin) {
      // Cursor is too low
      const scrollAmount = coords.bottom - (rect.bottom - margin);
      parent.scrollBy({ top: scrollAmount, behavior: 'auto' }); 
    } else if (coords.top < rect.top + margin) {
      // Cursor is too high
      const scrollAmount = coords.top - (rect.top + margin);
      parent.scrollBy({ top: scrollAmount, behavior: 'auto' });
    }
  }
});

export const createEditorState = (
  initialContent: string, 
  languageType: 'markdown' | 'plain' = 'markdown',
  extensions: Extension[] = []
): EditorState => {
  const baseExtensions: Extension[] = [
    history(),
    closeBrackets(),
    placeholder('Start typing...'),
    Prec.high(customKeymap),
    keymap.of([
      ...defaultKeymap,
      ...historyKeymap,
      indentWithTab
    ]),
    baseTheme,
    EditorView.lineWrapping,
    autoScrollExtension,
    ...extensions
  ];

  if (languageType === 'markdown') {
    baseExtensions.push(
      keymap.of([{ key: 'Enter', run: insertNewlineContinueMarkup }]),
      markdown({
        // By not providing 'base', we use the internal default which avoids instanceof issues.
        // We pass an extension that disables SetextHeading.
        extensions: [
          { remove: ["SetextHeading"] } as any,
          GFM, 
          Table
        ],
        addKeymap: true
      }),
      syntaxHighlighting(markdownHighlightStyle),
      highlightPlugin,
      syntaxLogger
    );
  }

  return EditorState.create({
    doc: initialContent,
    extensions: baseExtensions
  });
};

export const createEditorView = (
  parent: HTMLElement, 
  state: EditorState
): EditorView => {
  return new EditorView({
    state,
    parent
  });
};
