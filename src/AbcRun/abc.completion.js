import { CompletionItemKind as _ } from "../../vendor/monaco-editor/browser-rollup-custom/dist/monaco-editor-custom.bundle.js";


function createCompletionItems(items) {
    return items.map((item, index) => ({
        label: item[0],
        insertText: item[1],
        kind: item.kind || _.Constant,
        sortText: String(index + 1).padStart(2, '0')
    }));
}

// NOTE: 'whiteKeys'와 'blackKeys'에는 'b, #'을 최대 1개만 사용한 음이름만을 포함시킴.
function createKeyCompletionItems() {
    const whiteKeys = [
        'C', 'D', 'E', 'F', 'G', 'A', 'B',
        'Cb', 'Fb', 'B#', 'E#'
    ];

    const blackKeys = [
        'C#', 'D#', 'F#', 'G#', 'A#',
        'Db', 'Eb', 'Gb', 'Ab', 'Bb'
    ];

    const twelveKeys = [...whiteKeys, ...blackKeys].sort();
    
    const keyPairs = [
        ...twelveKeys.map(key => [`${key} Major`, key]),
        ...twelveKeys.map(key => [`${key} Minor`, `${key}m`])
    ];

    const header = {
        label: 'Select [Key]:',
        kind: _.Text,
        insertText: '',
        selectable: false,
        sortText: '00'
    };

    return [header, ...createCompletionItems(keyPairs)];
}

function createDefaultNoteLengthCompletionItems() {
    const notes = [
        ['Whole', '1/1'],
        ['Half', '1/2'],
        ['Quarter', '1/4'],
        ['Eighth', '1/8'],
        ['Sixteenth', '1/16'],
        ['Thirty-second', '1/32'],
        ['Sixty-fourth', '1/64']
    ];

    const header = {
        label: 'Select [Default Note Length]',
        kind: _.Text,
        insertText: '',
        selectable: false,
        sortText: '00'
    };

    return [header, ...createCompletionItems(notes)];
}


const completionItemProvider = {
    provideCompletionItems: function (model, position) {
        const textUntilPosition = model.getValueInRange({
            startLineNumber: position.lineNumber,
            startColumn: 1,
            endLineNumber: position.lineNumber,
            endColumn: position.column
        });

        const matched = (regex) => textUntilPosition.match(regex);

        const headers = [
            [/^K:\s*/, createKeyCompletionItems],
            [/^L:\s*/, createDefaultNoteLengthCompletionItems]
        ];

        let suggestions = [];

        for (const [regex, createItems] of headers) {
            if (matched(regex)) {
                suggestions = createItems();
                break;
            }
        }

        return { suggestions };
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


export default completionItemProvider;