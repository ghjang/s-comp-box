<script>
  import WebView from "../WebView/WebView.svelte";

  export let viewerUrl = "";
  export let pdfUrl = "";

  let viewerUrlWithPdf = pdfUrl ? `${viewerUrl}?file=${pdfUrl}` : viewerUrl;
</script>

<WebView url={viewerUrlWithPdf} />

<style>
</style>
