import LaTeXDisplay from '/build/dev/default/LaTeXDisplay.js';

const latexDisplay = new LaTeXDisplay({
    target: document.getElementById('container'),
    props: {
    }
});

window.addEventListener("beforeunload", () => latexDisplay?.$destroy());
