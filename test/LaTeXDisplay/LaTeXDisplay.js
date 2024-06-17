import LaTeXDisplay from '/build/dev/default/LaTeXDisplay.js';

const latexDisplay = new LaTeXDisplay({
    target: document.getElementById('container'),
    props: {
        mathJaxUrl: '/build/dev/vendor/mathjax/es5/tex-svg.js',
        resourceUrl: './resources/latex/quadratic.yml',
        animationDuration: 100
    }
});

window.addEventListener("beforeunload", () => latexDisplay?.$destroy());
