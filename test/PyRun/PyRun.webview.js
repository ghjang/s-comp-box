
import WebView from '/build/dev/default/WebView.js';

let urlPrefix = '';

if (window.location.protocol === 'chrome-extension:') {
    urlPrefix = 'https://ghjang.github.io/s-comp';
} else if (window.location.protocol === 'https:') {
    urlPrefix = '/s-comp';
}

const url = `${urlPrefix}/test/PyRun/PyRun.custom.html`;

const webView = new WebView({
    target: document.getElementById('container'),
    props: {
        url
    }
});

window.addEventListener("beforeunload", () => webView?.$destroy());
