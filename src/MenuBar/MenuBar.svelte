<script>
  import ContextMenuMediator from "../ContextMenuMediator/ContextMenuMediator.svelte";

  export let menus = [];

  let menuBar;
  let contextMenus = [];

  function handMenuNameClick(event, menuIndex) {
    const menuBarRect = menuBar.getBoundingClientRect();
    const menuBtnRect = event.target.getBoundingClientRect();
    const viewportBottomLeft = {
      parentBox: menuBar.parentElement,
      x: menuBtnRect.left,
      y: menuBarRect.bottom,
    };
    contextMenus[menuIndex].showContextMenu(event, true, viewportBottomLeft);
  }
</script>

<div bind:this={menuBar} class="menu-bar">
  {#each menus as menu, index}
    <button class="menu-name-btn" on:click={(e) => handMenuNameClick(e, index)}>
      {menu.name}
    </button>
    <ContextMenuMediator
      bind:this={contextMenus[index]}
      menuItems={menu.items}
      on:menuItemClicked
    />
  {/each}
</div>

<style lang="scss">
  $menu-text-color: #fff;
  $secondary-color: #444;

  .menu-bar {
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 1em;
    padding: 0;
    background-color: $secondary-color;
    border-bottom: 0.5px solid #ccc;
    cursor: default;
    font-family: Arial, sans-serif;

    .menu-name-btn {
      margin: 0;
      border: none;
      background: none;
      cursor: pointer;
      color: $menu-text-color;
      text-align: left;
      font-size: 0.5em;
    }
  }
</style>
