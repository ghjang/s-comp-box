<script>
  export let isSubMenu = false;

  export let menuItems = [];
  export let menuPos = { x: 0, y: 0 };

  export let menuSize = { width: 0, height: 0 };

  let contextMenu;

  $: if (contextMenu) {
    menuSize = {
      width: contextMenu.offsetWidth,
      height: contextMenu.offsetHeight,
    };

    if (isSubMenu) {
      // NOTE: 부모 컨텍스트 메뉴의 위치 정보가 업데이트 되는 시점 문제가 있음.
      //       'onMount, afterUJpdate'로 해결이 안됨. 'setTimeout'으로도
      //       어느 정도 해결이 되지만, 'requestAnimationFrame'이 가장 안정적임.
      requestAnimationFrame(() => {
        const parentContextMenu =
          contextMenu.parentElement.closest(".context-menu");
        const parentMenuItem = contextMenu.parentElement.closest(".menu-item");

        if (!parentContextMenu) {
          return;
        }

        menuPos = {
          x: parentContextMenu.offsetLeft + parentContextMenu.offsetWidth - 4,
          y: parentContextMenu.offsetTop + parentMenuItem.offsetTop,
        };
      });
    }
  }
</script>

<div
  bind:this={contextMenu}
  class="context-menu"
  style:left={`${menuPos.x}px`}
  style:top={`${menuPos.y}px`}
>
  {#each menuItems as item}
    <div class="menu-item" on:hover>
      {#if item.handler}
        <button on:click|preventDefault={item.handler}>{item.text}</button>
      {:else}
        <button on:click|preventDefault|stopPropagation>{item.text}</button>
      {/if}
      {#if item.subMenu}
        <div class="sub-menu">
          <svelte:self isSubMenu={true} menuItems={item.subMenu} />
        </div>
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

      .sub-menu {
        position: absolute;
        display: none;
        z-index: 1;
      }

      &:hover {
        .sub-menu {
          display: block;
        }
      }
    }
  }
</style>
