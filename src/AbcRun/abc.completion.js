import { CompletionItemKind as _ } from "../../vendor/monaco-editor/browser-rollup-custom/dist/monaco-editor-custom.bundle.js";

const completionItemProvider = {
    provideCompletionItems: function (model, position) {
        const textUntilPosition = model.getValueInRange({
            startLineNumber: position.lineNumber,
            startColumn: 1,
            endLineNumber: position.lineNumber,
            endColumn: position.column
        });

        if (textUntilPosition.match(/^K:\s*/)) {
            let suggestions = [
                { label: 'Select [Key]:', kind: _.Text, insertText: '', selectable: false },
                { label: 'C Major', insertText: 'C' },
                { label: 'G Major', insertText: 'G' },
                { label: 'D Major', insertText: 'D' },
                { label: 'A Major', insertText: 'A' },
                { label: 'E Major', insertText: 'E' },
                { label: 'B Major', insertText: 'B' },
                { label: 'F# Major', insertText: 'F#' },
                { label: 'C# Major', insertText: 'C#' },
                { label: 'F Major', insertText: 'F' },
                { label: 'Bb Major', insertText: 'Bb' },
                { label: 'Eb Major', insertText: 'Eb' },
                { label: 'Ab Major', insertText: 'Ab' },
                { label: 'Db Major', insertText: 'Db' },
                { label: 'Gb Major', insertText: 'Gb' },
                { label: 'Cb Major', insertText: 'Cb' },
                { label: 'A Minor', insertText: 'Am' },
                { label: 'E Minor', insertText: 'Em' },
                { label: 'B Minor', insertText: 'Bm' },
                { label: 'F# Minor', insertText: 'F#m' },
                { label: 'C# Minor', insertText: 'C#m' },
                { label: 'G# Minor', insertText: 'G#m' },
                { label: 'D# Minor', insertText: 'D#m' },
                { label: 'A# Minor', insertText: 'A#m' },
                { label: 'D Minor', insertText: 'Dm' },
                { label: 'G Minor', insertText: 'Gm' },
                { label: 'C Minor', insertText: 'Cm' },
                { label: 'F Minor', insertText: 'Fm' },
                { label: 'Bb Minor', insertText: 'Bbm' },
                { label: 'Eb Minor', insertText: 'Ebm' },
                { label: 'Ab Minor', insertText: 'Abm' }
            ];

            suggestions = setKindAndSortText(suggestions);

            return { suggestions };
        }

        if (textUntilPosition.match(/^L:\s*/)) {
            let suggestions = [
                { label: 'Select [Default Note Length]', kind: _.Text, insertText: '', selectable: false },
                { label: 'Whole', insertText: '1/1' },
                { label: 'Half', insertText: '1/2' },
                { label: 'Quarter', insertText: '1/4' },
                { label: 'Eighth', insertText: '1/8' },
                { label: 'Sixteenth', insertText: '1/16' },
                { label: 'Thirty-second', insertText: '1/32' },
                { label: 'Sixty-fourth', insertText: '1/64' }
            ];

            suggestions = setKindAndSortText(suggestions);

            return { suggestions };
        }

        return { suggestions: [] };
    },

    // TODO: 'item'에 맞는 설명 작성
    // 
    // 'documentation' 속성에는 '일반 텍스트' 또는 '마크다운' 형식의 문자열을 설정할 수 있다.
    resolveCompletionItem: function (item) {
        if (item.selectable === false) {
            return null;
        }

        item.documentation = `You selected ${item.label}`;
        return item;
    }
};

function setKindAndSortText(suggestions) {
    return suggestions.map((item, index) => ({
        ...item,
        kind: item.kind || _.Constant,
        sortText: String(index).padStart(2, '0')
    }));
}

export default completionItemProvider;