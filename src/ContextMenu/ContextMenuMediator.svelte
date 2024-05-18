<script context="module">
  let lastShownContextMenuParentBox;
  let hideLastShownContextMenu;

  async function setLastShownContextMenuInfo(
    currentContextMenuParentBox,
    hideCurrentContextMenuFunction
  ) {
    if (currentContextMenuParentBox === lastShownContextMenuParentBox) {
      return;
    }

    if (typeof hideLastShownContextMenu === "function") {
      await hideLastShownContextMenu();
    }

    lastShownContextMenuParentBox = currentContextMenuParentBox;
    hideLastShownContextMenu = hideCurrentContextMenuFunction;
  }
</script>

<script>
  import { tick } from "svelte";
  import ContextMenu from "./ContextMenu.svelte";

  export let menuItems = [];

  let menuVisible = false;
  let menuSize;
  let menuPos = { x: 0, y: 0 };

  export const isContextMenuVisible = () => menuVisible;

  // '부모 컴포넌트'의 'contextmenu' 이벤트 객체를 받아서 '최상위 컨텍스트 메뉴'를 표시한다.
  export async function showContextMenu(event) {
    event.preventDefault();
    event.stopPropagation();

    await hideContextMenu();

    menuVisible = true;
    await tick();

    // NOTE:
    //  'getBoundingClientRect()'로 구한 사각형의 좌표는 'viewport' 기준이다.
    //  'clientX'와 'clientY' 역시 'viewport' 기준이다.

    const parentBox = event.target;
    const boxRect = parentBox.getBoundingClientRect();

    let x = event.clientX;
    let y = event.clientY;

    if (boxRect.right - x < menuSize.width) {
      x -= menuSize.width;
    }

    if (boxRect.bottom - y < menuSize.height) {
      y -= menuSize.height;
    }

    x = Math.max(x, boxRect.left);
    y = Math.max(y, boxRect.top);

    menuPos = { x, y };

    await setLastShownContextMenuInfo(parentBox, hideContextMenu);
  }

  async function hideContextMenu() {
    menuVisible = false;
    await tick();
  }
</script>

<svelte:window on:click={hideContextMenu} />

{#if menuVisible}
  <ContextMenu {menuItems} {menuPos} bind:menuSize on:menuItemClicked />
{/if}
