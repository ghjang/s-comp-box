const tokenizer = {
    root: [
        // accidentalsAndOctaves
        { regex: /[\^_=,']/, action: { token: 'string' } },

        // annotations
        { regex: /"([^".]*)"/, action: { token: 'comment' } },

        // bar
        { regex: /:?\|[:\]]?/, action: { token: 'keyword.other.bar.abc' } },

        // comments
        { regex: /%[^%].*/, action: { token: 'comment.line.abc' } },

        // composer
        { regex: /^(C:)(.*)/, action: { token: 'keyword.other.composer.abc' } },

        // instructions
        { regex: /^%%.*/, action: { token: 'keyword.other.instruction.abc' } },

        // key
        { regex: /^(K:)(.*)/, action: { token: 'keyword.other.key.abc' } },

        // length
        { regex: /^(L:)(.*)/, action: { token: 'keyword.other.length.abc' } },

        // meter
        { regex: /^(M:)(.*)/, action: { token: 'keyword.other.meter.abc' } },
        { regex: /\[M:(.*?)\]/, action: { token: 'keyword.other.meter.abc' } },

        // notes
        { regex: /^(N:)(.*)/, action: { token: 'keyword.other.notes.abc' } },

        // origin
        { regex: /^(O:)(.*)/, action: { token: 'keyword.other.origin.abc' } },

        // part
        { regex: /^(P:)(.*)/, action: { token: 'keyword.other.part.abc' } },

        // tempo
        { regex: /^(Q:)(.*)/, action: { token: 'keyword.other.tempo.abc' } },

        // rhythm
        { regex: /^(R:)(.*)/, action: { token: 'keyword.other.rhythm.abc' } },

        // source
        { regex: /^(S:)(.*)/, action: { token: 'keyword.other.source.abc' } },

        // title
        { regex: /^(T:)(.*)/, action: { token: 'keyword.other.title.abc' } },

        // redefine
        { regex: /^(U:)(.*)/, action: { token: 'keyword.other.redefine.abc' } },

        // referencenumber
        { regex: /^(X:)(.*)/, action: { token: 'keyword.other.referencenumber.abc' } },

        // transcription
        { regex: /^(Z:)(.*)/, action: { token: 'keyword.other.transcription.abc' } },

        // voice-section
        { regex: /^(V:\d)(.*)/, action: { token: 'keyword.other.region.voice.abc' } },

        // words
        { regex: /^([Ww]:)(.*)/, action: { token: 'keyword.other.words.abc' } },

        // ornaments
        { regex: /!([^!.]*)!/, action: { token: 'entity.name.type.other.ornaments.abc' } },

        // symbols
        { regex: /!([^!.]*)!/, action: { token: 'keyword.other.symbols.abc' } },

        // ties
        { regex: /\(/, action: { token: 'string' } },
        { regex: /\)/, action: { token: 'string' } },

        // chord
        { regex: /\[/, action: { token: 'string' } },
        { regex: /\]/, action: { token: 'string' } },

        // voice
        { regex: /^\[V:[^\]]*\]/, action: { token: 'comment' } },

        // note-rhythm
        { regex: /[><]/, action: { token: 'string' } },
        { regex: /(?!^[a-gzA-GZ]([,']?)+)[/0-9]+/, action: { token: 'string' } }
    ]
};

export default tokenizer;
