
import AbcRun from '/build/dev/default/AbcRun.js';

const abcRun = new AbcRun({
    target: document.getElementById('container'),
    props: {
    }
});

window.addEventListener("beforeunload", () => abcRun?.$destroy());
