<script>
  import Bubble from "./Bubble.svelte";
  import Card from "./Card.svelte";

  export let direction = "column";
  export let defaultItemProps = {};
  export let items = [];

  let flexBox;
</script>

<div class="flex-box" bind:this={flexBox} style:flex-direction={direction}>
  {#each items as item}
    {@const itemProps = { ...defaultItemProps, ...item }}
    {@const type = itemProps.type}
    {@const deleted = delete itemProps.type}
    {#if type === "bubble"}
      <Bubble {...itemProps} />
    {:else if type === "card"}
      <Card {...itemProps} />
    {:else if deleted}
      {@html JSON.stringify({ type: type, ...itemProps })}
    {/if}
  {/each}
</div>

<style>
  .flex-box {
    display: flex;
    flex-wrap: nowrap;
    overflow: auto;
  }
</style>
