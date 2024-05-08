<svelte:options customElement="s-bubble-box" />

<script>
  import Bubble from "./Bubble.svelte";

  export let bubbles = [];
</script>

<div class="bubble-box">
  {#each bubbles as bubble}
    <Bubble {...bubble} />
  {/each}
</div>

<style>
  .bubble-box {
    display: flex;
    flex-direction: column;
  }
</style>
