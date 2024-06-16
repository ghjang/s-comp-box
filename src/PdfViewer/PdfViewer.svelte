<script>
  import WebView from "../WebView/WebView.svelte";

  export let pdfViewerHtmlUrl = "";
  export let pdfViewerWorkerUrl = "";
  export let pdfFileUrl = "";

  let pdfViewerPage;
  let pdfViewerPageLoaded = false;

  $: if (pdfFileUrl && pdfViewerPage && pdfViewerPageLoaded) {
    const viewerWnd = pdfViewerPage.getContentWindow();
    viewerWnd.postMessage(
      { type: "loadPdfFile", pdfFileUrl, workerSrc: pdfViewerWorkerUrl },
      window.location.origin
    );
  }

  function handleWebPageLoaded() {
    pdfViewerPageLoaded = true;
  }
</script>

<WebView
  bind:this={pdfViewerPage}
  url={pdfViewerHtmlUrl}
  on:webPageLoaded={handleWebPageLoaded}
/>

<style>
</style>
