
import Tab from '/build/dev/default/Tab.js';
import PyRun from '/build/dev/default/PyRun.js';

const tab = new Tab({
    target: document.getElementById('container'),
    props: {
        selectedTabIndex: 0,

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


window.addEventListener('load', function () {
    var tabPosition = document.getElementById('tabPosition');
    var container = document.getElementById('container');

    var tabPositionHeight = tabPosition.offsetHeight;
    container.style.height = 'calc(100vh - ' + tabPositionHeight + 'px)';
});

window.addEventListener("beforeunload", () => tab?.$destroy());
