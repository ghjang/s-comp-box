<script>
  import { createEventDispatcher } from "svelte";

  // FIXME: 'on:tabClicked' 이벤트 발생시 'on:tabFocused' 이벤트도 함꼐 발생해 'itemSelected'가 2번 발생함.
  // 가능하면 제거할 것.
  const dispatch = createEventDispatcher();

  export let label = "";
  export let tabPosition = "top";
  export let context = {};
  export let selected = false;
</script>

<div
  class="button-container"
  class:top={tabPosition === "top"}
  class:bottom={tabPosition === "bottom"}
  class:left={tabPosition === "left"}
  class:right={tabPosition === "right"}
>
  <button
    class:selected
    on:click={dispatch("tabClicked", context)}
    on:focus={dispatch("tabFocused", context)}
  >
    {label}
  </button>
</div>

<style lang="scss">
  $tabs-height: 1.25em;
  $button-margin: 0.2em;

  .button-container {
    display: flex;
    max-width: fit-content;
    max-height: fit-content;
    padding: 0;
    margin: 0;
    justify-content: center;

    &.top {
      height: $tabs-height;
      flex-direction: row;

      align-items: flex-end;
    }

    &.bottom {
      height: $tabs-height;
      flex-direction: row;
      align-items: flex-start;
    }

    &.left {
      width: $tabs-height;
      flex-direction: column;
      align-items: flex-end;
    }

    &.right {
      width: $tabs-height;
      flex-direction: column;
      align-items: flex-start;
    }

    button {
      border: none;
      border-radius: 0;
      background-color: #d0d0d0;
      font-size: 0.7em;
      user-select: none;
      white-space: nowrap;

      &:focus {
        outline: 1px dotted blue;
        outline-offset: -0.3em;
      }

      &.selected {
        background-color: #b0b0b0;
      }
    }

    &.top button {
      margin-top: $button-margin;
      padding: 0.2em 0.5em;
      clip-path: polygon(3% 0, 97% 0, 100% 100%, 0 100%);
    }

    &.bottom button {
      margin-bottom: $button-margin;
      padding: 0.2em 0.5em;
      clip-path: polygon(0 0, 100% 0, 97% 100%, 3% 100%);
    }

    &.left button {
      margin-left: $button-margin;
      padding: 0.5em 0.2em;
      writing-mode: vertical-rl;
      transform: rotate(180deg);
      white-space: nowrap;
      clip-path: polygon(0 0%, 100% 3%, 100% 97%, 0 100%);
    }

    &.right button {
      margin-right: $button-margin;
      padding: 0.5em 0.2em;
      writing-mode: vertical-rl;
      white-space: nowrap;
      clip-path: polygon(0 0%, 100% 3%, 100% 97%, 0 100%);
    }
  }
</style>
