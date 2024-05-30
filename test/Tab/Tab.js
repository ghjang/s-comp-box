
import Tab from '/build/dev/default/Tab.js';
import PyRun from '/build/dev/default/PyRun.js';

const tab = new Tab({
    target: document.getElementById('container'),
    props: {
        tabs: [
            {
                label: "Tab 1",
                component: PyRun,
                props: {
                    pyodideIndexURL: "/build/dev/vendor/pyodide",
                    editorCssBasePath: "/vendor/monaco-editor/dist-bundle",
                    code: 'print("Hello, Pyodide!")'
                }
            },
            {
                label: "두번째 탭"
            },
            {
            }
        ]
    }
});

window.addEventListener("beforeunload", () => tab?.$destroy());
