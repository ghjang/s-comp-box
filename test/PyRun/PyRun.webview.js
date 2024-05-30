
import WebView from '/build/dev/default/WebView.js';

const webView = new WebView({
    target: document.getElementById('container'),
    props: {
        url: "https://ghjang.github.io/s-comp/test/PyRun/PyRun.custom.html"
    }
});

window.addEventListener("beforeunload", () => webView?.$destroy());
