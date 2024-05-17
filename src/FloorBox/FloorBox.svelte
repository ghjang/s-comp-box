<script>
  import { tick } from "svelte";
  import ContextMenu from "../ContextMenu/ContextMenu.svelte";

  export let menuItems = [];
  export let childComponentInfo = null;
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

  function handleMenuItemClicked(event) {
    const handler = event.detail.handler;
    const newElemInfo = handler();

    /*
      FIXME: 'svelte:element'로 동적으로 요소 렌더링시에
             "<s-marquee> was created with unknown prop 'class'"와 같은
             '경고'가 '개발자 도구'에 출력된다. 확인결과 커스텀 요소 컴포넌트를 내부에서
             생성할 때 'class' 속성이 자동으로 추가되는 것으로 보인다.
             현재로서는 이를 해결할 방법을 찾지 못했다.
     */
    childComponentInfo = newElemInfo;
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="floor-box {pattern}"
  bind:this={floorBox}
  on:contextmenu={showContextMenu}
>
  {#if childComponentInfo}
    {#if childComponentInfo.constructor}
      <svelte:component
        this={childComponentInfo.constructor}
        {...childComponentInfo.props}
      />
    {:else}
      <svelte:element
        this={childComponentInfo.name}
        {...childComponentInfo.props}
      />
    {/if}
  {/if}
  <slot />
</div>

<svelte:window on:click={hideContextMenu} />

{#if menuVisible}
  <ContextMenu
    {menuItems}
    {menuPos}
    bind:menuSize
    on:menuItemClicked={handleMenuItemClicked}
  />
{/if}

<style lang="scss">
  @import "./floor-pattern.scss";
  @import "./colors.scss";

  .floor-box {
    width: 100%;
    height: 100%;

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
