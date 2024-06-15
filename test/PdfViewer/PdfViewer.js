import PdfViewer from '/build/dev/default/PdfViewer.js';

const pdfViewer = new PdfViewer({
    target: document.getElementById('container'),
    props: {
        viewerUrl: '/build/dev/vendor/pdfjs/web/viewer.html'
    }
});

window.addEventListener("beforeunload", () => pdfViewer?.$destroy());
