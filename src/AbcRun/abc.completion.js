import {
    createRange,
    CompletionItemKind as _
} from "../../vendor/monaco-editor/browser-rollup-custom/dist/monaco-editor-custom.bundle.js";

function setCompletionItemReplaceInfo(model, position, items) {
    items.forEach(item => {
        switch (item.type) {
            case 'key': {
                const lineContent = model.getLineContent(position.lineNumber);
                const afterCursor = lineContent.slice(position.column - 1);
                for (const i of items) {
                    const keyText = i.insertText;
                    const match = afterCursor.match(new RegExp(`\\s*${keyText}`));
                    if (match) {
                        const startIdx = position.column;
                        const endIdx = startIdx + match[0].length + 1;
                        item.range = createRange(position.lineNumber, startIdx, position.lineNumber, endIdx);
                        break;
                    }
                }
                break;
            }

            case 'noteLength': {
                const lineContent = model.getLineContent(position.lineNumber);
                const afterCursor = lineContent.slice(position.column - 1);
                for (const i of items) {
                    const noteLengthText = i.insertText;
                    const [numerator, denominator] = noteLengthText.split('/');
                    const match = afterCursor.match(new RegExp(`\\s*${numerator}\\s*/\\s*${denominator}`));
                    if (match) {
                        const startIdx = position.column;
                        const endIdx = startIdx + match[0].length + 1;
                        item.range = createRange(position.lineNumber, startIdx, position.lineNumber, endIdx);
                        break;
                    }
                }
                break;
            }

            case 'decoration': {
                const lineContent = model.getLineContent(position.lineNumber);
                const startIdx = lineContent.lastIndexOf('!', position.column - 1);
                if (startIdx !== -1) {
                    const afterExclamation = lineContent.slice(startIdx + 1);
                    let endIdx = startIdx;
                    for (const i of items) {
                        const decorationText = i.insertText;
                        if (afterExclamation.startsWith(decorationText)) {
                            endIdx = startIdx + decorationText.length;
                            break;
                        }
                    }
                    if (startIdx < endIdx) {
                        item.range = createRange(position.lineNumber, startIdx + 2, position.lineNumber, endIdx + 2);
                        const afterDecoration = afterExclamation.slice(endIdx - startIdx);
                        if (!afterDecoration.startsWith('!')) {
                            item.insertText += '!';
                        }
                    } else {
                        item.insertText += '!';
                    }
                }
                break;
            }

            default:
                break
        }
    });
}

function createCompletionItems(model, position, items, itemType) {
    const _items = items.map((item, index) => ({
        type: itemType,
        kind: item[2] || _.Constant,
        label: item[0],
        insertText: item[1],
        sortText: String(index + 1).padStart(2, '0'),
    }));

    setCompletionItemReplaceInfo(model, position, _items);

    return _items;
}

// NOTE: 'whiteKeys'와 'blackKeys'에는 'b, #'을 최대 1개만 사용한 음이름만을 포함시킴.
function createKeyCompletionItems(model, position) {
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

    return [header, ...createCompletionItems(model, position, keyPairs, 'key')];
}

function createDefaultNoteLengthCompletionItems(model, position) {
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

    return [header, ...createCompletionItems(model, position, notes, 'noteLength')];
}

function createDecorationCompletionItems(model, position) {
    const decorations = [
        ['Arpeggio', 'arpeggio', _.Text],
        ['Fermata', 'fermata', _.Text],
        ['Trill', 'trill', _.Text],
    ];

    return createCompletionItems(model, position, decorations, 'decoration');
}

// TODO: 'isAtDecoration' 함수 개선
//
// - 현재 '!' 문자 직후에서 '자동완성발동' 가능하게 되어 있음.
// - '!xxx!'와 같은 데코레이션 표현에서 '첫번째 느낌표 직후, 데코레이션 텍스트 내부'에서만 '자동완성발동'되게 하는게 좋을 듯.
// - '!'를 최초 입력후 자동완성을 발동하는 경우도 고려해야 함. '!' 문자 매칭 상태등을 고혀해야할 것으로 보임.
//
// (문자열 처리 관련 알고리즘?)
function isAtDecoration(model, position) {
    const lineContent = model.getLineContent(position.lineNumber);
    if (position.column > 1 && lineContent[position.column - 2] === '!') {
        return true;
    }
    return false;
}

const completionItemProvider = {
    provideCompletionItems: function (model, position) {
        const matched = (regex) => {
            const textUntilPosition = model.getValueInRange({
                startLineNumber: position.lineNumber,
                startColumn: 1,
                endLineNumber: position.lineNumber,
                endColumn: position.column
            });
            return textUntilPosition.match(regex);
        };

        const patterns = [
            [/.*K:\s*$/, createKeyCompletionItems],
            [/.*L:\s*$/, createDefaultNoteLengthCompletionItems],
            [isAtDecoration, createDecorationCompletionItems],
        ];

        let suggestions = [];

        for (const [matchObj, createItems] of patterns) {
            if ((matchObj instanceof RegExp && matched(matchObj))
                || (typeof matchObj === 'function' && matchObj(model, position))) {
                suggestions = createItems(model, position);
                break;
            }
        }

        /*
        suggestions.forEach(suggestion => {
            suggestion.model = model;
            suggestion.position = position;
        });
        */

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