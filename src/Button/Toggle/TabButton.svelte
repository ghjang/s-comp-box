<script>
  import { createEventDispatcher, getContext } from "svelte";

  const dispatch = createEventDispatcher();

  export let label = "";
  export let value;

  export let tabPosition = "top";

  const contextName = "toggle-group-context";
  const context = getContext(contextName);
  $: updateTabButtonState($context);

  function updateTabButtonState(context) {
    if (!context) {
      throw new Error(
        `The component must be used below a <ToggleGroup> parent component.`
      );
    }
  }

  async function handleToggleItemChanged(eventName) {
    eventName = value ? "toggleItemChanged" : eventName;
    dispatch(eventName, { label, value });
  }
</script>

<button
  class:selected={value === $context.activatedValue}
  class:top={tabPosition === "top"}
  class:bottom={tabPosition === "bottom"}
  class:left={tabPosition === "left"}
  class:right={tabPosition === "right"}
  tabindex="-1"
  on:click={() => handleToggleItemChanged("tabClicked")}
>
  {label}
</button>

<style lang="scss">
  $button-margin: 0.2em;

  button {
    border: none;
    border-radius: 0;
    background-color: #d0d0d0;
    font-size: 0.7em;
    user-select: none;
    white-space: nowrap;

    &:focus {
      outline: none;
    }

    &.selected {
      background-color: #b0b0b0;
    }

    &.top {
      margin-top: $button-margin;
      padding: 0.2em 0.5em;
      clip-path: polygon(3% 0, 97% 0, 100% 100%, 0 100%);
    }

    &.bottom {
      margin-bottom: $button-margin;
      padding: 0.2em 0.5em;
      clip-path: polygon(0 0, 100% 0, 97% 100%, 3% 100%);
    }

    &.left {
      margin-left: $button-margin;
      padding: 0.5em 0.2em;
      writing-mode: vertical-rl;
      transform: rotate(180deg);
      white-space: nowrap;
      clip-path: polygon(0 0%, 100% 3%, 100% 97%, 0 100%);
    }

    &.right {
      margin-right: $button-margin;
      padding: 0.5em 0.2em;
      writing-mode: vertical-rl;
      white-space: nowrap;
      clip-path: polygon(0 0%, 100% 3%, 100% 97%, 0 100%);
    }
  }
</style>
