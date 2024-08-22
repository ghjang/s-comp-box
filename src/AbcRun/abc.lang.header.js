// 'ABC music notation' 헤더
export const headers = [
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
];

export const headerRules = {
    headerX: [
        [/\d+/, 'number'],
        [/[ \t]+/, 'white'],
        [/\n/, '', '@pop'],
    ],

    headerT: [
        [/.*\n/, 'string', '@pop']
    ],

    headerC: [
        [/.*\n/, 'string', '@pop']
    ],

    headerM: [
        [/\d+/, 'number'],
        [/\//, 'operator'],
        [/[ \t]+/, 'white'],
        [/\n|\]/, '', '@pop'],
    ],

    headerL: [
        [/\d+/, 'number'],
        [/\//, 'operator'],
        [/[ \t]+/, 'white'],
        [/\n/, '', '@pop'],
    ],

    headerQ: [
        [/\d+/, 'number'],
        [/[\/=]/, 'operator'],
        [/[ \t]+/, 'white'],
        [/\n|\]/, '', '@pop'],
    ],

    headerK: [
        [/([A-G][#b]?m?)/, 'string'],
        [/[ \t]+/, 'white'],
        [/\n/, '', '@pop'],
    ],

    headerV: [
        [/%\{/, { token: 'delimiter.bracket', bracket: '@open' }],
        [/%\}/, { token: 'delimiter.bracket', bracket: '@close' }],
        [/%[^\{\}]?.*\n/, 'comment', '@pop'],
        [/\w+/, 'identifier'],
        [/=/, 'operator'],
        [/[ \t]+/, 'white'],
        [/"/, 'string', '@string'],
        [/\n/, '', '@pop'],
    ],
};
