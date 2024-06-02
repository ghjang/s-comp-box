<svelte:options accessors />

<script>
  import { createEventDispatcher } from "svelte";
  import { conditionalTrapFocus } from "../common/action/trapFocus.js";

  const dispatch = createEventDispatcher();

  import Bubble from "./Bubble.svelte";
  import Card from "./Card.svelte";
  import TabButton from "./TabButton.svelte";

  export let direction = "column";
  export let reverse = false;
  export let justifyContent = "flex-start";
  export let alignItems = "flex-start";

  export let enableTrapFocus = false;

  export let defaultItemProps = {};
  export let items = [];

  export const customEvents = ["cardFolding"];
</script>

<div
  class="flex-box"
  style:flex-direction={reverse ? `${direction}-reverse` : direction}
  style:justify-content={justifyContent}
  style:align-items={alignItems}
  use:conditionalTrapFocus={{ predicate: enableTrapFocus }}
>
  {#each items as item, index}
    {@const itemProps = { ...defaultItemProps, ...item }}
    {@const type = itemProps.type}
    {@const deleted = delete itemProps.type}
    {#if type === "bubble"}
      <Bubble {...itemProps} />
    {:else if type === "card"}
      <Card
        {...itemProps}
        on:cardFolding={(e) =>
          dispatch("cardFolding", {
            itemIndex: index,
            ...e.detail,
          })}
      />
    {:else if type === "tabButton"}
      <TabButton {...itemProps} />
    {:else if deleted}
      {@html JSON.stringify({ type: type, ...itemProps })}
    {/if}
  {/each}
</div>

<style>
  /* NOTE: 'flex-box' div 영역내에서 'flex' 방식으로 '자식 요소'를 배치한다. */
  .flex-box {
    display: flex;
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
    flex-wrap: nowrap;
    overflow: auto;
  }
</style>
