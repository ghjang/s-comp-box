import type MonacoEditor from "../MonacoEditor/MonacoEditor.svelte";
import { createRange } from "../../vendor/monaco-editor/browser-rollup-custom/dist/monaco-editor-custom.bundle.js";

interface ChangeListener {
  fireChanged(): void;
}

interface SelectionListener {
  fireSelectionChanged(): void;
}

interface Selection {
  start: number;
  end: number;
}

export default class MonacoAdaptor {
  private editor: MonacoEditor;
  private initialText: string;
  private changelistener: ChangeListener | null;
  private selectionlistener: SelectionListener | null;

  constructor(editor: MonacoEditor) {
    if (!editor) {
      throw new Error("Monaco editor is required");
    }

    this.editor = editor;
    this.initialText = "";
    this.changelistener = null;
    this.selectionlistener = null;
  }

  addChangeListener(listener: ChangeListener): void {
    this.changelistener = listener;
  }

  addSelectionListener(listener: SelectionListener): void {
    this.selectionlistener = listener;
  }

  fireChanged(): void {
    this.changelistener?.fireChanged();
  }

  fireSelectionChanged(): void {
    this.selectionlistener?.fireSelectionChanged();
  }

  getString(): string {
    return this.editor.getText();
  }

  setString(str: string): void {
    this.editor.setText(str);
  }

  getSelection(): Selection | null {
    const selection = this.editor.getSelection();
    if (!selection) {
      return null;
    }
    const model = this.editor.getModel();

    // no loaded document
    if (!model) {
      return null;
    }

    const range = this.editor.getSelection();

    let startOffset;
    let endOffset;

    if (range) {
      startOffset = model.getOffsetAt({
        lineNumber: range.startLineNumber,
        column: range.startColumn,
      });
      endOffset = model.getOffsetAt({
        lineNumber: range.endLineNumber,
        column: range.endColumn,
      });
    } else {
      const position = this.editor.getPosition();
      startOffset = model.getOffsetAt(position);
      endOffset = startOffset;
    }

    return {
      start: startOffset,
      end: endOffset,
    };
  }

  setSelection(startOffset: number, endOffset: number): void {
    const model = this.editor.getModel();
    if (model) {
      const startPosition = model.getPositionAt(startOffset);
      const endPosition = model.getPositionAt(endOffset);
      const range = createRange(
        startPosition.lineNumber,
        startPosition.column,
        endPosition.lineNumber,
        endPosition.column
      );
      this.editor.setSelection(range);
    }
  }

  getElem(): HTMLElement | null {
    return null;
  }

  clearEditorWarnings(): void {
    this.editor.clearEditorWarnings();
  }

  setEditorWarnings(warnings: any[]): void {
    this.editor.setEditorWarnings(warnings);
  }
}
