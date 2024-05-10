<script>
  import Bubble from "./Bubble.svelte";

  export let direction = "column";
  export let items = [];

  let flexBox;
</script>

<div class="flex-box" bind:this={flexBox} style:flex-direction={direction}>
  {#each items as item}
    {@const type = item.type}
    {@const deleted = delete item.type}
    {#if type === "bubble"}
      <Bubble {...item} />
    {:else if deleted}
      {@html JSON.stringify({ type: type, ...item })}
    {/if}
  {/each}
</div>

<style>
  .flex-box {
    display: flex;
  }
</style>
