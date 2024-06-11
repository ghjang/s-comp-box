<script>
  import StackPanel from "../FlexBox/StackPanel.svelte";
  import ContextMenuMediator from "../ContextMenuMediator/ContextMenuMediator.svelte";

  export let menus = [];

  let menuBar;
  let contextMenus = [];
  let activeMenuIndex = -1;

  function deactivateMenuBar() {
    activeMenuIndex = -1;
  }

  function showMenu(event, menuIndex) {
    const menuBarRect = menuBar.getBoundingClientRect();
    const menuBtnRect = event.target.getBoundingClientRect();
    const menuPos = {
      parentBox: menuBar.parentElement,
      x: menuBtnRect.left,
      y: menuBarRect.bottom,
    };
    contextMenus[menuIndex].showContextMenu(event, true, menuPos);
    activeMenuIndex = menuIndex;
  }

  // 사용자가 명시적으로 '마우스 클릭'으로 메뉴를 선택한 경우에
  // 마우스 포인터 진입만으로 메뉴를 활성화하도록 한다.
  function handleMouseEnter(event, menuIndex) {
    if (activeMenuIndex !== -1) {
      showMenu(event, menuIndex);
    }
  }
</script>

<svelte:window on:click={deactivateMenuBar} />

<!--
  NOTE: '메뉴 버튼 그룹'은 일종의 'ToggleGroup'으로 볼 수도 있다.
        메뉴바 또는 메뉴 버튼의 동작이 복잡하다면 아래의 'StackPanel'을
        'ToggleGroup'으로 대체하고 '버튼'을 '토글 동작'을 하는 '컴포넌트'로
        대체하는 방법도 있을 것 같다. 현재 시점에서는 아래의 구현이 단순하고 효율적이다.
  -->
<nav bind:this={menuBar} class="menu-bar">
  <StackPanel direction="horizontal" hAlign="left" vAlign="center">
    {#each menus as menu, index}
      <button
        class="menu-name-btn"
        class:activeMenu={activeMenuIndex === index}
        on:click={(e) => showMenu(e, index)}
        on:mouseenter={(e) => handleMouseEnter(e, index)}
      >
        {menu.name}
      </button>
      <ContextMenuMediator
        bind:this={contextMenus[index]}
        menuItems={menu.items}
        on:menuItemClicked
      />
    {/each}
  </StackPanel>
</nav>

<style lang="scss">
  @import "../ContextMenuMediator/context-menu.scss";

  .menu-bar {
    height: 1em;
    padding: 0 0 0 0.1em;
    background-color: $context-menu-background-color;
    border-bottom: 0.5px solid $context-menu-border-color;
    cursor: default;
    font-family: Arial, sans-serif;

    .menu-name-btn {
      margin: 0;
      border: none;
      background: none;
      cursor: pointer;
      color: $context-menu-text-color;
      text-align: left;
      font-size: 0.5em;

      &.activeMenu {
        background-color: $context-menu-hover-background-color;
      }
    }
  }
</style>
