<script>
  import { getContext, setContext } from "svelte";
  import { writable } from "svelte/store";

  export let menuLevel = 0;

  export let menuItems = [];
  export let menuPos = { x: 0, y: 0 };

  export let menuSize = { width: 0, height: 0 };

  const context = initContext();
  $: menuLevel > 0 && updateSubMenuPos($context);

  let contextMenu;

  $: if (contextMenu) {
    menuSize = {
      width: contextMenu.offsetWidth,
      height: contextMenu.offsetHeight,
    };

    // NOTE: '디버깅'시 유용할 수 있다. 필요시 주석처리 해제하고 사용할 것.
    console.log(menuLevel ? "sub menu" : "main menu", menuSize);

    /* 
      NOTE: 다음과 같이 'div.context-menu'에 바인딩된 'menuPos' 변수를 참조해 로그를 출력하면
            이 '반응형 코드 블럭'이 (무한) 재실행됨으로 주의할 것:

      console.log(menuPos);
      console.log(menuPos.x);

            HTML 템플릿에 바인딩되지 않은 'menuSize' 변수를 참조하는 다음 코드는 문제 없음:

      console.log(menuSize);

            반응형 코드 블럭 내에서 직접 'menuPos'를 참조하는 경우에 이런 문제가 있을 수 있음.
            이 코드 블럭에서 어떤 함수(ex.> updateSubMenuPos)를 호출하고 그 함수 내부에서 'menuPos'를
            참조해서 콘솔에 출력하는 경우는 이런 '무한 재실행' 문제가 없음.
     */
  }

  function initContext() {
    let context;
    if (menuLevel === 0) {
      context = writable({
        maxLevel: 0,
        "level-0": { lastHoveredMenuItem: null },
      });
      setContext("context", context);
    } else {
      context = getContext("context");
      context.update((value) => {
        if (menuLevel > value.maxLevel) {
          value.maxLevel = menuLevel;
        }
        value[`level-${menuLevel}`] = { lastHoveredMenuItem: null };
        return value;
      });
    }
    return context;
  }

  function handleMenuItemHover(event) {
    context.update((value) => {
      value[`level-${menuLevel}`].lastHoveredMenuItem = event.currentTarget;
      return value;
    });
  }

  function updateSubMenuPos(context) {
    if (!contextMenu || !context) {
      return;
    }

    const subMenu = contextMenu.parentElement;
    const parentMenuItem = subMenu.closest(".menu-item");

    const parentHoveredMenuItem =
      context[`level-${menuLevel - 1}`].lastHoveredMenuItem;

    if (parentMenuItem !== parentHoveredMenuItem) {
      return;
    }

    // NOTE: 'subMenu' 자체는 '크기 값'이 '0'이다.
    const subMenuWidth = contextMenu.offsetWidth;
    const subMenuHeight = contextMenu.offsetHeight;

    const parentMenu = subMenu.closest(".context-menu");
    const parentMenuWidth = parentMenu.offsetWidth;

    const parentMenuItemWidth = parentMenuItem.offsetWidth;

    const offsetDiff = (parentMenuWidth - parentMenuItemWidth) / 2;

    let x = parentMenu.offsetLeft + parentMenu.offsetWidth - offsetDiff;
    let y = parentMenu.offsetTop + parentMenuItem.offsetTop;

    if (x + subMenuWidth > window.innerWidth) {
      x = parentMenu.offsetLeft - subMenuWidth + offsetDiff + 1;
    }

    if (y + subMenuHeight > window.innerHeight) {
      y = window.innerHeight - subMenuHeight;
    }

    if (x < 0) {
      x = 0;
    }

    if (y < 0) {
      y = 0;
    }

    menuPos = { x, y };
  }
</script>

<div
  bind:this={contextMenu}
  class="context-menu"
  style:left={`${menuPos.x}px`}
  style:top={`${menuPos.y}px`}
>
  {#each menuItems as item}
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="menu-item" on:mouseenter={handleMenuItemHover}>
      {#if item.divider}
        <hr />
      {:else if item.text}
        {#if item.handler}
          <button on:click|preventDefault={item.handler}>{item.text}</button>
        {:else}
          <button on:click|preventDefault|stopPropagation>{item.text}</button>
        {/if}
        {#if item.subMenu}
          <div class="sub-menu">
            <svelte:self menuLevel={menuLevel + 1} menuItems={item.subMenu} />
          </div>
        {/if}
      {/if}
    </div>
  {/each}
</div>

<style lang="scss">
  @import "./colors.scss";

  .context-menu {
    position: fixed;
    display: block;
    background-color: $secondary-color;
    border: 1px solid #ccc;
    padding: 3px;
    border-radius: 2px;
    font-family: Arial, sans-serif;

    button {
      display: block;
      width: 100%;
      text-align: left;
      padding: 1px;
      border-radius: 1px;
      font-size: 0.5em;
      color: $context-menu-text-color;
      background: none;
      border: none;
      cursor: pointer;

      &:hover {
        background-color: lighten($secondary-color, 10%);
      }
    }

    .menu-item {
      position: relative;

      hr {
        margin: 2px 0;
        border: none;
        border-top: 1px solid #ccc;
      }
      
      .sub-menu {
        position: absolute;
        display: none;
      }

      &:hover {
        .sub-menu {
          display: block;
        }
      }
    }
  }
</style>
