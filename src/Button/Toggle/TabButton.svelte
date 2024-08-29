<script>
  import { createEventDispatcher, getContext } from "svelte";

  const dispatch = createEventDispatcher();

  export let label = "";
  export let value;
  export let showDeleteButton = false;

  export let tabPosition = "top";

  const contextName = "toggle-group-context";
  const context = getContext(contextName);
  $: updateTabButtonState($context);

  function updateTabButtonState(context) {
    if (!context) {
      throw new Error(
        `The component must be used below a <ToggleGroup> parent component.`,
      );
    }
  }

  async function handleToggleItemChanged(eventName) {
    eventName = value ? "toggleItemChanged" : eventName;
    dispatch(eventName, { label, value });
  }

  function isKorean(text) {
    return /[\u3131-\uD79D]/.test(text);
  }
</script>

<button
  class:selected={value === $context.activatedValue}
  class={tabPosition}
  tabindex="-1"
  on:click={() => handleToggleItemChanged("tabClicked")}
>
  <span class={isKorean(label) ? "korean" : "english"}>{label}</span>
  {#if showDeleteButton && value === $context.activatedValue}
    <button class="tab-delete-button">X</button>
  {/if}
</button>

<style lang="scss">
  $button-margin: 0.2em;
  $background-color: #d0d0d0;
  $selected-background-color: #b0b0b0;

  button {
    border: none;
    border-radius: 0;
    background-color: $background-color;
    font-size: 0.7em;
    user-select: none;
    white-space: nowrap;
    display: flex;
    align-items: center;
    justify-content: center;

    &:focus {
      outline: none;
    }

    &.selected {
      background-color: $selected-background-color;
      font-weight: bold;

      &:has(.tab-delete-button) {
        padding-right: 0.25em;
      }

      .tab-delete-button {
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        border-radius: 0.2em;
        margin-left: 0.3em;
        margin-right: 0;
        padding: 0;
        width: 1.5em;
        height: 1.5em;
        background-color: transparent;
        font-size: 0.7em;
        user-select: none;
        white-space: nowrap;

        &:hover {
          background-color: darken($background-color, 25%);
        }
      }
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

    &.left,
    &.right {
      writing-mode: vertical-rl;
      padding: 0.5em 0.2em;

      span {
        display: inline-block;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;

        &.korean {
          text-orientation: upright;
        }

        &.english {
          text-orientation: mixed;
        }
      }
    }

    &.left {
      margin-left: $button-margin;
      clip-path: polygon(0 3%, 100% 0, 100% 100%, 0 97%);

      span.english {
        transform: rotate(180deg);
      }
    }

    &.right {
      margin-right: $button-margin;
      clip-path: polygon(0 0, 100% 3%, 100% 97%, 0 100%);
    }
  }
</style>
