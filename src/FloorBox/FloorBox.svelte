<script>
  import { tick } from "svelte";
  import ContextMenu from "./ContextMenu.svelte";

  export let pattern = "honeycomb";

  export const getAvailableFloorPatterns = () => [
    "honeycomb",
    "dots",
    "checkerboard",
    "squares",
    "stripes",
  ];

  export const setFloorPattern = (newPattern) => (pattern = newPattern);

  const menuItems = [
    { text: "Menu Item 1", handler: () => console.log("Menu Item 1 clicked") },
    { text: "Menu Item 2", handler: () => console.log("Menu Item 2 clicked") },
    { text: "Menu Item 3", handler: () => console.log("Menu Item 3 clicked") },
    {
      text: "Menu Item 4",
      subMenu: [
        {
          text: "Sub Menu Item 1",
          handler: () => console.log("Sub Menu Item 1 clicked"),
        },
        {
          text: "Sub Menu Item 2",
          handler: () => console.log("Sub Menu Item 2 clicked"),
        },
        {
          text: "Sub Menu Item 3",
          handler: () => console.log("Sub Menu Item 3 clicked"),
        },
      ],
    },
    { text: "Menu Item 5", handler: () => console.log("Menu Item 5 clicked") },
  ];

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
