
import WebView from '/build/dev/default/WebView.js';

const urlPrefix = window.location.protocol === 'chrome-extension:' ? 'https://ghjang.github.io/s-comp' : 's-comp';
const url = `${urlPrefix}/test/PyRun/PyRun.custom.html`;

const webView = new WebView({
    target: document.getElementById('container'),
    props: {
        url
    }
});

window.addEventListener("beforeunload", () => webView?.$destroy());
