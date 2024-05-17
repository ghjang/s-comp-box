<script>
  import { tick } from "svelte";
  import ContextMenu from "../ContextMenu/ContextMenu.svelte";

  export let menuItems = [];
  export let pattern = "honeycomb";

  export const getAvailableFloorPatterns = () => [
    "honeycomb",
    "dots",
    "checkerboard",
    "squares",
    "stripes",
  ];

  export const setFloorPattern = (newPattern) => (pattern = newPattern);

  let floorBox;
  let menuSize;
  let menuVisible = false;
  let menuPos = { x: 0, y: 0 };

  async function showContextMenu(event) {
    event.preventDefault();
    event.stopPropagation();

    await hideContextMenu();

    menuVisible = true;
    await tick();

    const boxWidth = floorBox.offsetWidth;
    const boxHeight = floorBox.offsetHeight;

    let x = event.clientX;
    let y = event.clientY;

    if (boxWidth - x < menuSize.width) {
      x -= menuSize.width;
    }

    if (boxHeight - y < menuSize.height) {
      y -= menuSize.height;
    }

    if (x < 0) {
      x = 0;
    }

    if (y < 0) {
      y = 0;
    }

    menuPos = { x, y };
  }

  async function hideContextMenu() {
    menuVisible = false;
    await tick();
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="floor-box {pattern}"
  bind:this={floorBox}
  on:contextmenu={showContextMenu}
></div>

<svelte:window on:click={hideContextMenu} />

{#if menuVisible}
  <ContextMenu {menuItems} {menuPos} bind:menuSize />
{/if}

<style lang="scss">
  @import "./floor-pattern.scss";
  @import "./colors.scss";

  .floor-box {
    height: 100vh;
    width: 100vw;

    &.dots {
      @include dots-pattern($primary-color, $secondary-color);
    }

    &.honeycomb {
      @include honeycomb-pattern($primary-color, $secondary-color);
    }

    &.checkerboard {
      @include checkerboard-pattern($primary-color, $secondary-color);
    }

    &.squares {
      @include squares-pattern($primary-color, $secondary-color);
    }

    &.stripes {
      @include stripes-pattern($primary-color, $secondary-color);
    }
  }
</style>
