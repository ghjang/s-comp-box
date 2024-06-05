<svelte:options accessors />

<script>
  import { onMount, createEventDispatcher } from "svelte";
  import { conditionalTrapFocus } from "../common/action/trapFocus.js";

  const dispatch = createEventDispatcher();

  export let direction = "column";
  export let reverse = false;
  export let justifyContent = "flex-start";
  export let alignItems = "flex-start";

  export let enableTrapFocus = false;

  export let defaultItemProps = {};
  export let items = [];

  export let autoRegisterCustomEventsFromItemProps = true;
  export const customEvents = [];

  export function clearRegisteredCustomEvents() {
    unregisterEventHandlers.forEach((unregister) => unregister());
    unregisterEventHandlers = [];
  }

  let itemInstances = [];
  let unregisterEventHandlers = [];

  function registerCustomEvents() {
    clearRegisteredCustomEvents();
    customEvents.length = 0;

    const eventNames = new Set();

    itemInstances.forEach((instance, index) => {
      if (!instance || typeof instance.$on !== "function") {
        return;
      }

      const itemProps = { ...defaultItemProps, ...items[index] };
      itemProps.customEvents?.forEach((eventName) => {
        eventNames.add(eventName);

        const unregister = instance.$on(eventName, (event) => {
          const eventArg = {
            ...event.detail,
            context: { item: items[index], index },
          };
          dispatch(eventName, eventArg);
        });
        unregisterEventHandlers.push(unregister);
      });
    });

    customEvents.push(...eventNames);
  }

  $: autoRegisterCustomEventsFromItemProps && items && registerCustomEvents();

  onMount(() => {
    if (autoRegisterCustomEventsFromItemProps) {
      registerCustomEvents();
    }
  });
</script>

<div
  class="flex-box"
  style:flex-direction={reverse ? `${direction}-reverse` : direction}
  style:justify-content={justifyContent}
  style:align-items={alignItems}
  use:conditionalTrapFocus={{ predicate: enableTrapFocus }}
>
  {#each items as item, index}
    {@const { component, customEvents, ...itemProps } = {
      ...defaultItemProps,
      ...item,
    }}
    {#if component}
      <svelte:component
        this={component}
        bind:this={itemInstances[index]}
        {...itemProps}
      />
    {:else}
      {@html JSON.stringify({ component: undefined, ...itemProps })}
    {/if}
  {/each}

  <slot />
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
