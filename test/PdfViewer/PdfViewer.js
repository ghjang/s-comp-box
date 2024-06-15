import PdfViewer from '/build/dev/default/PdfViewer.js';

const pdfViewer = new PdfViewer({
    target: document.getElementById('container'),
    props: {
    }
});

window.addEventListener("beforeunload", () => pdfViewer?.$destroy());
