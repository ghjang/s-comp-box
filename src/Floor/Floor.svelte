<script>
  import ContextMenuMediator from "../ContextMenuMediator/ContextMenuMediator.svelte";
  import PopUp from "../PopUp/PopUp.svelte";

  export let menuItems = [];
  export let childComponentInfo = null;
  export let pattern = "honeycomb";
  export let defaultActionHandler = null;

  export const getAvailableFloorPatterns = () => [
    "honeycomb",
    "dots",
    "checkerboard",
    "squares",
    "stripes",
  ];

  export const setFloorPattern = (newPattern) => (pattern = newPattern);

  let contextMenu;

  let showPopUp = false;
  let popUpProps = {};

  function handleMenuItemClicked(event) {
    if (event.detail.link) {
      const url = event.detail.link.url;
      const target = event.detail.link.target;
      if (target === "_blank") {
        window.open(url, "_blank");
      } else {
        window.location.href = url;
      }
    } else if (event.detail.popup) {
      // TODO: 'info' 팝업외의 다른 종류의 팝업 처리 추가
      popUpProps = { ...event.detail.popup } ;
      delete popUpProps.text; // '메뉴 항목' 표시용 'text' 속성을 전달하지 않는다.
      showPopUp = true;
    } else if (event.detail.action) {
      let handler = event.detail.action.handler;

      if (!handler || typeof handler !== "function") {
        if (
          defaultActionHandler &&
          typeof defaultActionHandler === "function"
        ) {
          handler = () => defaultActionHandler(event.detail.action);
        } else {
          handler = () => {
            console.warn(
              `no proper action menu item handler: ${event.detail.action.text}`
            );
          };
        }
      }

      const newElemInfo = handler();

      // FIXME: 'svelte:element'로 동적으로 요소 렌더링시에 불필요 '경고' 출력 제거
      // 'svelte:element'로 동적으로 요소 렌더링시에
      // "<s-marquee> was created with unknown prop 'class'"와 같은
      // '경고'가 '개발자 도구'에 출력된다. 확인결과 커스텀 요소 컴포넌트를 내부에서
      // 생성할 때 'class' 속성이 자동으로 추가되는 것으로 보인다.
      // 현재로서는 이를 해결할 방법을 찾지 못했다.
      childComponentInfo = newElemInfo;
    } else {
      // Do nothing
    }
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

{#if showPopUp}
  <PopUp {...popUpProps} on:buttonClicked={(e) => (showPopUp = false)} />
{/if}

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
