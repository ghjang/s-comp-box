
import Console from '/build/dev/default/Console.js';

const customConsole = new Console({
    target: document.getElementById('container'),
    props: {
    }
});

for (let i = 0; i < 3; ++i) {
    customConsole.log("This is a log message.");
}

for (let i = 0; i < 5; ++i) {
    customConsole.error("This is an error message.");
}

window.addEventListener("beforeunload", () => customConsole?.$destroy());
