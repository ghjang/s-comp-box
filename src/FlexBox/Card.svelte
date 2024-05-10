<script>
  export let title;
  export let body;
  export let width = "200px";
  export let height = "auto";
  export let fontFamily = "Roboto, Arial, sans-serif";
</script>

<div class="card" style:width style:height style:font-family={fontFamily}>
  <div class="title">{title}</div>
  <div class="body">{body}</div>
</div>

<style lang="scss">
  .card {
    flex-shrink: 0;
    padding: 10px;
    margin: 10px;
    border-radius: 10px;
    background-color: #f8f9fa;
    box-shadow: 0 0px 10px 2px rgba(0, 0, 0, 0.2);
    overflow: auto;

    & > .title {
      font-size: 1.25em;
      font-weight: bold;
      margin-bottom: 10px;
    }

    & > div.body {
      font-size: 1em;
    }
  }
</style>
