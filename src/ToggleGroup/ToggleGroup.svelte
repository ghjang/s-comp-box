<script>
  import { createEventDispatcher } from "svelte";
  import ComponentLoader from "../ComponentLoader/ComponentLoader.svelte";
  import StackPanel from "../FlexBox/StackPanel.svelte";

  const dispatch = createEventDispatcher();

  export let activatedValue = null;
  export let itemDirection = "vertical";
  export let itemHAlign = "left";
  export let itemVAlign = "top";
  export let items = [];

  function handleToggleItemActivated(event, item, itemIndex) {
    if (activatedValue === event.detail.value) {
      activatedValue = null;
    } else {
      activatedValue = event.detail.value;
    }
    dispatch("itemActivated", { value: activatedValue, item, itemIndex });
  }

  let loader;

  async function loadComponents(loader, targetItems) {
    if (!loader) {
      return;
    }

    await loader.loadAll(targetItems);

    let needToRerender = false;

    targetItems.forEach((item) => {
      if (typeof item.component === "string") {
        item.component = loader.getRegisteredComponent(item.component);
        needToRerender = true;
      }
    });

    if (needToRerender) {
      items = targetItems;
    }
  }

  $: loadComponents(loader, items);
</script>

<ComponentLoader bind:this={loader} />

<StackPanel direction={itemDirection} hAlign={itemHAlign} vAlign={itemVAlign}>
  {#each items as item, index}
    {#if typeof item.component === "function"}
      <svelte:component
        this={item.component}
        {...item.props}
        {activatedValue}
        on:itemActivated={(e) => handleToggleItemActivated(e, item, index)}
      />
    {/if}
  {/each}
</StackPanel>
