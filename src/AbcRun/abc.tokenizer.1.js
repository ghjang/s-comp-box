const tokenizer = {
    root: [
        [/[\^_=,']/, "string"],  // accidentalsAndOctaves
        [/\"([^\".]*)\"/, "comment"],  // annotations
        [/:?\|[:\]]?/, "keyword.other.bar.abc"],  // bar
        [/%[^%].*/, "comment.line.abc"],  // comments
        [/^(C:)(.*)/, [{ token: "keyword.other.composer.abc" }, { token: "string.value.composer.abc", next: "@composerValue" }]],  // composer
        [/^%%.*/, "keyword.other.instruction.abc"],  // instructions
        [/^(K:)(.*)/, [{ token: "keyword.other.key.abc" }, { token: "string.value.key.abc", next: "@keyValue" }]],  // key
        [/^(L:)(.*)/, [{ token: "keyword.other.length.abc" }, { token: "string.value.length.abc", next: "@lengthValue" }]],  // length
        [/^(M:)(.*)/, [{ token: "keyword.other.meter.abc" }, { token: "string.value.meter.abc", next: "@meterValue" }]],  // meter
        [/\[M:(.*?)\]/, [{ token: "keyword.other.meter.abc" }, { token: "string.value.meter.abc", next: "@meterValue" }]],  // meter within brackets
        [/^(N:)(.*)/, [{ token: "keyword.other.notes.abc" }, { token: "string.value.notes.abc", next: "@notesValue" }]],  // notes
        [/^(O:)(.*)/, [{ token: "keyword.other.origin.abc" }, { token: "string.value.origin.abc", next: "@originValue" }]],  // origin
        [/^(P:)(.*)/, [{ token: "keyword.other.part.abc" }, { token: "string.value.part.abc", next: "@partValue" }]],  // part
        [/^(Q:)(.*)/, [{ token: "keyword.other.tempo.abc" }, { token: "string.value.tempo.abc", next: "@tempoValue" }]],  // tempo
        [/^(R:)(.*)/, [{ token: "keyword.other.rhythm.abc" }, { token: "string.value.rhythm.abc", next: "@rhythmValue" }]],  // rhythm
        [/^(S:)(.*)/, [{ token: "keyword.other.source.abc" }, { token: "string.value.source.abc", next: "@sourceValue" }]],  // source
        [/^(T:)(.*)/, [{ token: "keyword.other.title.abc" }, { token: "string.value.title.abc", next: "@titleValue" }]],  // title
        [/^(U:)(.*)/, [{ token: "keyword.other.redefine.abc" }, { token: "string.value.redefine.abc", next: "@redefineValue" }]],  // redefine
        [/^(X:)(.*)/, [{ token: "keyword.other.referencenumber.abc" }, { token: "string.value.referencenumber.abc", next: "@referencenumberValue" }]],  // referencenumber
        [/^(Z:)(.*)/, [{ token: "keyword.other.transcription.abc" }, { token: "string.value.transcription.abc", next: "@transcriptionValue" }]],  // transcription
        [/^(V:\d)(.*)/, [{ token: "keyword.other.region.voice.abc" }, { token: "string.value.voice.abc", next: "@voiceSection" }]],  // voice-section
        [/^([Ww]:)(.*)/, [{ token: "keyword.other.words.abc" }, { token: "string.value.words.abc", next: "@wordsValue" }]],  // words
        [/\!([^!.]*)\!/, "entity.name.type.other.ornaments.abc"],  // ornaments
        [/\!([^!.]*)\!/, "keyword.other.symbols.abc"],  // symbols
        [/\(/, "string"],  // ties
        [/\)/, "string"],  // ties
        [/\[/, "string"],  // chord
        [/\]/, "string"],  // chord
        [/^\[V:[^\]]*\]/, "comment"],  // voice
        [/[><]/, "string"],  // note-rhythm
        [/(?!^[a-gzA-GZ]([,']?)+)[/0-9]+/, "string"],  // note-rhythm
    ],

    composerValue: [
        [/.*$/, "string.value.composer.abc", "@pop"]
    ],

    keyValue: [
        [/.*$/, "string.value.key.abc", "@pop"]
    ],

    lengthValue: [
        [/.*$/, "string.value.length.abc", "@pop"]
    ],

    meterValue: [
        [/.*$/, "string.value.meter.abc", "@pop"]
    ],

    notesValue: [
        [/.*$/, "string.value.notes.abc", "@pop"]
    ],

    originValue: [
        [/.*$/, "string.value.origin.abc", "@pop"]
    ],

    partValue: [
        [/.*$/, "markup.bold.other.part.abc", "@pop"]
    ],

    tempoValue: [
        [/.*$/, "string.value.tempo.abc", "@pop"]
    ],

    rhythmValue: [
        [/.*$/, "string.value.rhythm.abc", "@pop"]
    ],

    sourceValue: [
        [/.*$/, "string.value.source.abc", "@pop"]
    ],

    titleValue: [
        [/.*$/, "string.value.title.abc", "@pop"]
    ],

    redefineValue: [
        [/.*$/, "string.value.redefine.abc", "@pop"]
    ],

    referencenumberValue: [
        [/.*$/, "string.value.referencenumber.abc", "@pop"]
    ],

    transcriptionValue: [
        [/.*$/, "string.value.transcription.abc", "@pop"]
    ],

    voiceSection: [
        [/^(?!V:\d|X:).*/, "abc.section.voice", "@pop"]
    ],

    wordsValue: [
        [/.*$/, "string.value.words.abc", "@pop"]
    ]
};

export default tokenizer;
