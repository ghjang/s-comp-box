import PdfViewer from '/build/dev/default/PdfViewer.js';

const pdfViewer = new PdfViewer({
    target: document.getElementById('container'),
    props: {
        pdfViewerHtmlUrl: '/build/dev/vendor/pdfjs/web/viewer.default.html',
        pdfViewerWorkerUrl: '/build/dev/vendor/pdfjs/build/pdf.worker.mjs',
        pdfFileUrl: '/build/dev/vendor/pdfjs/web/compressed.tracemonkey-pldi-09.pdf'
    }
});

window.addEventListener("beforeunload", () => pdfViewer?.$destroy());
