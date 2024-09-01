
import SCompBox from '/build/dist/default/SCompBox.js';

const sCompBox = new SCompBox({
    target: document.querySelector('#s-comp-box-container'),
    props: {
        customElementConfigBasePath: '/build/dist/default',

        compJsBundleBasePath: '/build/dist/default',
        customCompJsBundleBasePath: '/build/dist/custom',

        compProps: {
            AbcRun: {
                editorResourcePath: "/vendor/monaco-editor/browser-rollup-custom/dist"
            },
            Marquee: {
                text: 'Hello, SCompBox!'
            },
            PyRun: {
                pyodideIndexURL: "/build/dist/vendor/pyodide",
                editorResourcePath: "/vendor/monaco-editor/browser-rollup-custom/dist",
                code: 'print("Hello, Pyodide!")'
            }
        }
    }
});

window.addEventListener('beforeunload', () => sCompBox.$destroy());
