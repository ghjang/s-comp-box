<script>
  import ContextMenuMediator from "../ContextMenu/ContextMenuMediator.svelte";

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

  let contextMenu;

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
  on:contextmenu={(e) => contextMenu.showContextMenu(e)}
>
  {#if childComponentInfo}
    {#if childComponentInfo.componentClass}
      <svelte:component
        this={childComponentInfo.componentClass}
        {...childComponentInfo.props}
      />
    {:else if childComponentInfo.customElementName}
      <svelte:element
        this={childComponentInfo.customElementName}
        {...childComponentInfo.props}
      />
    {/if}
  {/if}
  <slot />
</div>

<ContextMenuMediator
  {menuItems}
  bind:this={contextMenu}
  on:menuItemClicked={handleMenuItemClicked}
/>

<style lang="scss">
  @import "./pattern.scss";
  @import "./color.scss";

  .floor-box {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    border: none;

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
