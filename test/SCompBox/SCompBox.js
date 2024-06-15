
import SCompBox from '/build/dev/default/SCompBox.js';

const sCompBox = new SCompBox({
    target: document.querySelector('#s-comp-box-container'),
    props: {
        customElementConfigBasePath: '/build/dev/default',

        compJsBundleBasePath: '/build/dev/default',
        customCompJsBundleBasePath: '/build/dev/custom',

        compProps: {
            Marquee: {
                text: 'Hello, Marquee!'
            },
            PyRun: {
                pyodideIndexURL: "/build/dev/vendor/pyodide",
                editorResourcePath: "/vendor/monaco-editor/dist-bundle",
                code: 'print("Hello, Pyodide!")'
            }
        }
    }
});

window.addEventListener('beforeunload', () => sCompBox.$destroy());
