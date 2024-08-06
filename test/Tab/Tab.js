
import Tab from '/build/dev/default/Tab.js';

import Console from '/build/dev/default/Console.js';
import PyRun from '/build/dev/default/PyRun.js';

import AbcRenderer from '/build/dev/default/AbcRenderer.js';
import AbcRun from '/build/dev/default/AbcRun.js';

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
                    editorResourcePath: "/vendor/monaco-editor/browser-rollup-custom/dist",
                    code: 'print("Hello, Pyodide!")'
                }
            },
            {
                label: "PyRun(1) - autoClearConsole",
                component: PyRun,
                props: {
                    pyodideIndexURL: "/build/dev/vendor/pyodide",
                    editorResourcePath: "/vendor/monaco-editor/browser-rollup-custom/dist",
                    code: 'print("From Tab, Hello, Pyodide!")',
                    autoClearConsole: true
                }

            },
            {
                label: "PyRun(2) - Editor",
                component: PyRun,
                props: {
                    pyodideIndexURL: "/build/dev/vendor/pyodide",
                    editorResourcePath: "/vendor/monaco-editor/browser-rollup-custom/dist",
                    code: 'print("From Tab, Hello, Pyodide!")',
                    noConsole: true
                }

            },
            {
                label: "PyRun(2) - Console",
                component: Console,
                props: {
                }
            },
            {
                label: "AbcRun - Editor",
                component: AbcRun,
                props: {
                    editorResourcePath: "/vendor/monaco-editor/browser-rollup-custom/dist",
                    abcText:
                        `X: 1
T: Simple Tune
M: 4/4
L: 1/4
K: C
C D E F | G A B c | c B A G | F E D C |`,
                    autoSave: false,
                    showPlayControl: true,
                    enableMidiFileDownload: true,
                    enablePdfFileDownload: true
                }
            },
            {
                label: "AbcRun - Renderer",
                component: AbcRenderer,
                props: {
                    abcParams: {}
                }
            },
            {
            }
        ]
    }
});


// NOTE: 'tab.$on'으로 '모든 자식 컴포넌트가 탭에 마운트된 시점'을 알기 위해서
//       'allTabsMounted' 같은 이벤트를 'dispatch'하는 방법을 시도했으나 실패함.
//
//       컴포넌트의 'onMount' 시점등에서 'dispatch'시 내부적으로 '$$.callbacks' 배열에
//       'allTabsMounted' 이벤트 핸들러가 등록되어 있지 않은 것이 원인으로 보임.
//       이 'Tab.js'에서 'tab.$on("allTabsMounted", () => { ... })'을 호출하는
//       시점보다 'new Tab' 내부에서 'dispatch'가 먼저 발생하는 것으로 보임.
//
//       좀더 테스트가 필요할 것 같으나, 'new Tab'가 리턴되는 시점이 자식 컴포넌트가 모두
//       마운트된 시점이라고 볼 수 있을 것 같음. 해서 일단 아래와 같이 메쏘드 호출로 처리함.
const tabComponents = tab.getTabComponents();
const unsubscribes = [];

if (tabComponents?.length > 0) {
    const noConsolePyRun = tabComponents[2];
    const console = tabComponents[3];

    let dataStore = noConsolePyRun.getDataStore?.();
    let dataSink = console.getDataSink?.();

    unsubscribes.push(dataStore?.subscribe(dataSink));

    const abcRun = tabComponents[4];
    const abcRenderer = tabComponents[5];

    dataStore = abcRun.getDataStore?.();
    dataSink = abcRenderer.getDataSink?.();

    unsubscribes.push(dataStore?.subscribe(dataSink));
}


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

window.addEventListener("beforeunload", () => {
    unsubscribes.forEach((unsubscribe) => unsubscribe());
    tab?.$destroy();
});
