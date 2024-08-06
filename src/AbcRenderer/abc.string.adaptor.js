export default class StringAdaptor {
    constructor(str) {
        if (!str) {
            throw new Error("string value is required");
        }

        this.str = str;
        this.isStringAdaptor = true;

        this.initialText = "";
        this.changelistener = null;
        this.selectionlistener = null;
    }

    addChangeListener(listener) { }
    addSelectionListener(listener) { }
    fireChanged() { }
    fireSelectionChanged() { }

    getString() {
        return this.str;
    }

    setString(str) {
        this.str = str;
    }

    getSelection() {
        return {
            start: 0,
            end: 0
        };
    }

    setSelection(startOffset, endOffset) { }

    getElem() {
        return null;
    }

    clearEditorWarnings() { }
    setEditorWarnings(warnings) { }
};
