
import Tab from '/build/dev/default/Tab.js';
import PyRun from '/build/dev/default/PyRun.js';

const tab = new Tab({
    target: document.getElementById('container'),
    props: {
        tabTrapFocus: true,

        tabs: [
            {
                label: "PyRun - default",
                component: PyRun,
                props: {
                    pyodideIndexURL: "/build/dev/vendor/pyodide",
                    editorCssBasePath: "/vendor/monaco-editor/dist-bundle",
                    code: 'print("Hello, Pyodide!")'
                }
            },
            {
                label: "PyRun(1) - autoClearConsole",
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


const tabPositionSelect = document.getElementById("tabPosition");
tabPositionSelect.addEventListener("change", () => {
    tab.$set({ tabPosition: tabPositionSelect.value });
});


window.addEventListener("beforeunload", () => tab?.$destroy());
