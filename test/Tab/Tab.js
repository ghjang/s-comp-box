
import Tab from '/build/dev/default/Tab.js';
import PyRun from '/build/dev/default/PyRun.js';

const tab = new Tab({
    target: document.getElementById('container'),
    props: {
        tabs: [
            {
                label: "PyRun",
                component: PyRun,
                props: {
                    pyodideIndexURL: "/build/dev/vendor/pyodide",
                    editorCssBasePath: "/vendor/monaco-editor/dist-bundle",
                    code: 'print("Hello, Pyodide!")'
                }
            },
            {
                label: "PyRun(1) - Editor",
                component: PyRun,
                props: {
                    pyodideIndexURL: "/build/dev/vendor/pyodide",
                    editorCssBasePath: "/vendor/monaco-editor/dist-bundle",
                    code: 'print("From Tab, Hello, Pyodide!")',
                    autoClearConsole: true
                }

            },
            {
                label: "PyRun(2) - Editor",
                component: PyRun,
                props: {
                    pyodideIndexURL: "/build/dev/vendor/pyodide",
                    editorCssBasePath: "/vendor/monaco-editor/dist-bundle",
                    code: 'print("From Tab, Hello, Pyodide!")',
                    noConsole: true
                }

            },
            {
                label: "PyRun(2) - Console",
            },
            {
            }
        ]
    }
});

window.addEventListener("beforeunload", () => tab?.$destroy());
