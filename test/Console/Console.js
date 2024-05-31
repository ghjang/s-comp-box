
import Console from '/build/dev/default/Console.js';

const customConsole = new Console({
    target: document.getElementById('container'),
    props: {
        initialOutput: 'Hello~\nThis is a custom console.\n\n'
    }
});

for (let i = 0; i < 3; ++i) {
    customConsole.log("This is a log message.");
}

for (let i = 0; i < 5; ++i) {
    customConsole.error("This is an error message.");
}

const clearBtn = document.getElementById('clearConsoleBtn');
clearBtn.addEventListener('click', () => customConsole.clear());

window.addEventListener("beforeunload", () => customConsole?.$destroy());
