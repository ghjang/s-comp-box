import { createRange } from "../../vendor/monaco-editor/browser-rollup-custom/dist/monaco-editor-custom.bundle.js";

export default class EditAreaAdaptor {
    constructor(editor) {
        if (!editor) {
            throw new Error("Editor is required");
        }

        this.editor = editor;

        this.initialText = "";
        this.changelistener = null;
        this.selectionlistener = null;
    }

    addChangeListener(listener) {
        this.changelistener = listener;
    }

    addSelectionListener(listener) {
        this.selectionlistener = listener;
    }

    fireChanged() {
        this?.changelistener?.fireChanged();
    }

    fireSelectionChanged() {
        this?.selectionlistener?.fireSelectionChanged();
    }

    getString() {
        return this.editor.getText();
    }

    setString(str) {
        this.editor.setText(str);
    }

    getSelection() {
        const model = this.editor.getModel();

        // no loaded document
        if (!model) {
            return null;
        }

        const range = this.editor.getSelection();

        let startOffset;
        let endOffset;

        if (range) {
            startOffset = model.getOffsetAt(range.getStartPosition());
            endOffset = model.getOffsetAt(range.getEndPosition());
        } else {
            const position = this.editor.getPosition();
            startOffset = model.getOffsetAt(position);
            endOffset = startOffset;
        }

        return {
            start: startOffset,
            end: endOffset
        };
    }

    setSelection(startOffset, endOffset) {
        const model = this.editor.getModel();
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

    getElem() {
        return null;
    }

    clearEditorWarnings() {
        this.editor.clearEditorWarnings();
    }
};
