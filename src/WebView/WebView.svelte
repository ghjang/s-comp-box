<svelte:options accessors />

<script>
  export let url;
</script>

<iframe src={url ?? "about:blank"} title="" />

<style>
  iframe {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    border: none;
  }
</style>
