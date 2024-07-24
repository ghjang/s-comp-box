// NOTE: abc.bnf 파일로부터 작성함.
//       '모나코 에디터'의 '문법 하이라이팅'용 토크나이저는 '줄단위 매칭'으로 진행된다고 함.
//
// refer to https://microsoft.github.io/monaco-editor/monarch.html
const langdef = {
    tokenizer: {
        root: [
            // Directives
            {
                regex: /(%%)(\s*)([a-zA-Z0-9_-]+)(\s*)(.*)/,
                action: [
                    { group: 1, token: 'keyword' },
                    { group: 2, token: 'whitespace' },
                    { group: 3, token: 'keyword' },
                    { group: 4, token: 'whitespace' },
                    { group: 5, token: 'number' }
                ]
            },

            // Comments
            { regex: /%[^%].*/, action: { token: 'comment' } },

            // Header Fields
            { regex: /^X:\s*\d+/, action: { token: 'keyword' } },
            { regex: /^T:.*$/, action: { token: 'keyword' } },
            { regex: /^A:.*$/, action: { token: 'keyword' } },
            { regex: /^B:.*$/, action: { token: 'keyword' } },
            { regex: /^C:.*$/, action: { token: 'keyword' } },
            { regex: /^D:.*$/, action: { token: 'keyword' } },
            { regex: /^E:.*$/, action: { token: 'keyword' } },
            { regex: /^G:.*$/, action: { token: 'keyword' } },
            { regex: /^H:.*$/, action: { token: 'keyword' } },
            { regex: /^I:.*$/, action: { token: 'keyword' } },
            { regex: /^L:\s*\d+\/\d+/, action: { token: 'keyword' } },
            { regex: /^M:\s*(C\||C|\d+\/\d+)/, action: { token: 'keyword' } },
            { regex: /^N:.*$/, action: { token: 'keyword' } },
            { regex: /^O:.*$/, action: { token: 'keyword' } },
            { regex: /^P:.*$/, action: { token: 'keyword' } },
            { regex: /^Q:\s*(\d+|C?\d+\/\d+=\d+)/, action: { token: 'keyword' } },
            { regex: /^R:.*$/, action: { token: 'keyword' } },
            { regex: /^S:.*$/, action: { token: 'keyword' } },
            { regex: /^Z:.*$/, action: { token: 'keyword' } },
            { regex: /^K:.*$/, action: { token: 'keyword' } },

            // Mid-tune Fields
            { regex: /P:.*$/, action: { token: 'keyword' } },
            { regex: /W:.*$/, action: { token: 'keyword' } },

            // Notes and Rests
            { regex: /[\^_=,']/, action: { token: 'string' } },
            { regex: /[a-gA-Gz]/, action: { token: 'string' } },
            { regex: /([><])/, action: { token: 'string' } },

            // Tuplets
            { regex: /\(\d(:\d(:\d)?)?/, action: { token: 'number' } },

            // Bar Lines
            { regex: /\|+/, action: { token: 'keyword' } },
            { regex: /:?\|:?/, action: { token: 'keyword' } },
            { regex: /\|\|/, action: { token: 'keyword' } },

            // Annotations and Gracings
            { regex: /!([^!.]*)!/, action: { token: 'annotation' } },
            { regex: /[\(\)]/, action: { token: 'annotation' } },
            { regex: /~/, action: { token: 'annotation' } },

            // Chords
            { regex: /".*"/, action: { token: 'string' } },

            // Slurs and Ties
            { regex: /[()]/, action: { token: 'string' } },
            { regex: /\-/, action: { token: 'string' } },

            // Text and comments
            { regex: /"[^"]*"/, action: { token: 'string' } },
            { regex: /\\[a-zA-Z]+/, action: { token: 'comment' } },

            // Spaces
            { regex: /[ \t]+/, action: { token: 'white' } },

            // Default
            { regex: /[^]/, action: { token: '' } },
        ],

        digits: [
            { regex: /^\d+$/, action: { token: 'number' } }
        ],

        directiveValue: [
            { regex: /^\d+$/, action: { token: 'number' } },
            { regex: /^.*$/, action: { token: 'string' } }
        ]
    }
};


const langdeftest = {
    ignoreCase: false,
    defaultToken: 'invalid',

    // 'ABC music notation' 헤더
    headers: [
        'X', // 참조 번호(Reference Number)
        'T', // 곡 제목(Title)
        'C', // 작곡가(Composer)
        'O', // 출처(Origin)
        'A', // 지역(Area)
        'M', // 박자(Meter)
        'L', // 기본 음표 길이(Default Note Length)
        'Q', // 템포(Tempo)
        'K', // 조성(Key)
        'P', // 파트(Parts)
        'Z', // 편집자(Editor)
        'N', // 노트(Notes)
        'G', // 그룹(Group)
        'H', // 역사(History)
        'R', // 리듬(Rhythm)
        'D', // 디스코그래피(Discography)
        'B', // 책(Book)
        'S', // 출처(Source)
        'W', // 가사의 단어(Words)
        'I', // 명령(Instruction)
        'V'  // 음성(Voice)
    ],

    escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

    tokenizer: {
        root: [
            [
                /^\s*([A-Z])(\s*)(:)/,
                [
                    {
                        cases: {
                            '@headers': 'keyword',
                        }
                    },
                    'white',
                    { token: 'delimiter', next: '@header$1' }
                ]
            ],

            { include: '@whitespace' },

            [/[A-Ga-gz]/, 'constant'],

            [/\d+/, 'number'],

            [/[\/,>-]/, 'operator'],

            [/\|:|:\||\|/, 'delimiter'],

            // strings
            [/"([^"\\]|\\.)*$/, 'string.invalid'],  // non-teminated string
            [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],

            // characters
            [/'[^\\']'/, 'string'],
            [/(')(@escapes)(')/, ['string', 'string.escape', 'string']],
            [/'/, 'string.invalid'],
        ],

        string: [
            [/[^\\"]+/, 'string'],
            [/@escapes/, 'string.escape'],
            [/\\./, 'string.escape.invalid'],
            [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
        ],

        whitespace: [
            [/[ \t\r\n]+/, 'white'],
            [/%.*$/, 'comment']
        ],

        headerX: [
            [/\s*\d+\s*$/, 'number', '@pop']
        ],

        headerT: [
            [/.*$/, 'string', '@pop']
        ],

        headerM: [
            [/\s*\d+\/\s*\d+\s*$/, 'number', '@pop']
        ],

        headerL: [
            [/\s*\d+\/\s*\d+\s*$/, 'number', '@pop']
        ],

        headerQ: [
            [/\s*\d+\/\s*\d+\s*=\s*\d+\s*$/, 'number', '@pop']
        ],

        headerK: [
            [/\s*([A-G][#b]?)\s*$/, 'string', '@pop'],
            [/.*$/, 'invalid', '@pop']
        ],

        headerV: [
            [/\w+$/, 'identifier', '@pop'],
            [/\w+/, 'identifier'],
            [/=/, 'operator'],
            [/\s+/, 'white'],
            [/"/, 'string', '@string'],
            [/;\s*$/, 'delimiter', '@pop'],
            [/[,;]/, 'delimiter']
        ],
    }
};


//export default langdef;
export default langdeftest;
