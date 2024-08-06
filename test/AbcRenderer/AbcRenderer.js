
import AbcRenderer from '/build/dev/default/AbcRenderer.js';

const renderer = new AbcRenderer({
    target: document.getElementById('container'),
    props: {
        abcParams: {
            noTextEditor: true,
            abcText: "X:1\nT:Test\nK:C\nCDEFGABc||",
        }
    }
});

window.addEventListener("beforeunload", () => renderer?.$destroy());
