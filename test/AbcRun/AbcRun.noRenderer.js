
import AbcRun from '/build/dev/default/AbcRun.js';

const abcRun = new AbcRun({
    target: document.getElementById('container'),
    props: {
        editorResourcePath: "/vendor/monaco-editor/browser-rollup-custom/dist",
        abcText:
            `X: 1
T: Simple Tune
M: 4/4
L: 1/4
K: C
C D E F | G A B c | c B A G | F E D C |`,
        autoSave: false,
        noRenderer: true
    }
});

window.addEventListener("beforeunload", () => abcRun?.$destroy());
