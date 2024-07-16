const tokenizer = {
    root: [
        // Comments
        [/%[^%].*/, 'comment'],

        // Header Fields
        [/^X:\s*\d+/, 'keyword'],
        [/^T:.*$/, 'keyword'],
        [/^A:.*$/, 'keyword'],
        [/^B:.*$/, 'keyword'],
        [/^C:.*$/, 'keyword'],
        [/^D:.*$/, 'keyword'],
        [/^E:.*$/, 'keyword'],
        [/^G:.*$/, 'keyword'],
        [/^H:.*$/, 'keyword'],
        [/^I:.*$/, 'keyword'],
        [/^L:\s*\d+\/\d+/, 'keyword'],
        [/^M:\s*(C\||C|\d+\/\d+)/, 'keyword'],
        [/^N:.*$/, 'keyword'],
        [/^O:.*$/, 'keyword'],
        [/^P:.*$/, 'keyword'],
        [/^Q:\s*(\d+|C?\d+\/\d+=\d+)/, 'keyword'],
        [/^R:.*$/, 'keyword'],
        [/^S:.*$/, 'keyword'],
        [/^Z:.*$/, 'keyword'],
        [/^K:.*$/, 'keyword'],

        // Mid-tune Fields
        [/P:.*$/, 'keyword'],
        [/W:.*$/, 'keyword'],

        // Notes and Rests
        [/[\^_=,']/, 'string'],
        [/[a-gA-Gz]/, 'string'],
        [/([><])/, 'string'],

        // Tuplets
        [/\(\d(:\d(:\d)?)?/, 'number'],

        // Bar Lines
        [/\|+/, 'keyword'],
        [/:?\|:?/, 'keyword'],
        [/\|\|/, 'keyword'],

        // Annotations and Gracings
        [/!([^!.]*)!/, 'annotation'],
        [/[\(\)]/, 'annotation'],
        [/~/, 'annotation'],

        // Chords
        [/".*"/, 'string'],

        // Slurs and Ties
        [/[()]/, 'string'],
        [/\-/, 'string'],

        // Text and comments
        [/"[^"]*"/, 'string'],
        [/\\[a-zA-Z]+/, 'comment'],

        // Spaces
        [/[ \t]+/, 'white'],

        // Default
        [/[^]/, ''],
    ]
};


export default tokenizer;
