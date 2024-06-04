import WebView from '/build/dev/default/ToggleGroup.js';

const webView = new WebView({
    target: document.getElementById('container'),
    props: {
    }
});

window.addEventListener("beforeunload", () => webView?.$destroy());
