const tokenizer = {
    root: [
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
    ]
};

export default tokenizer;
