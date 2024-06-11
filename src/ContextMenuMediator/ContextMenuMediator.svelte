<script context="module">
  let _lastShownContextMenuParentBox;
  let _hideLastShownContextMenu;

  async function setLastShownContextMenuInfo(
    currentContextMenuParentBox,
    hideCurrentContextMenuFunction
  ) {
    if (currentContextMenuParentBox === _lastShownContextMenuParentBox) {
      return;
    }

    if (typeof _hideLastShownContextMenu === "function") {
      await _hideLastShownContextMenu();
    }

    _lastShownContextMenuParentBox = currentContextMenuParentBox;
    _hideLastShownContextMenu = hideCurrentContextMenuFunction;
  }

  async function hideLastShownContextMenu() {
    if (typeof _hideLastShownContextMenu === "function") {
      await _hideLastShownContextMenu();
    }
    _lastShownContextMenuParentBox = null;
    _hideLastShownContextMenu = null;
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

  // NOTE: '부모 컴포넌트'의 'contextmenu' 이벤트 객체를 받아서 '최상위 컨텍스트 메뉴'를 표시하는 방법으로 보통 사용한다.
  //       또는 임의의 지정한 위치에 '컨텍스트 메뉴'를 표시할 수도 있다.
  export async function showContextMenu(
    event,
    hidePrevContextMenu = false,
    position = { parentBox: null, x: null, y: null }
  ) {
    // NOTE: 'showContextMenu'측에서 'target'값만을 직접 설정한 '유사 event' 객체를 전달할 수도 있다.
    event.preventDefault && event.preventDefault();
    event.stopPropagation && event.stopPropagation();

    await hideContextMenu();

    menuVisible = true;
    await tick();

    // NOTE:
    //  'getBoundingClientRect()'로 구한 사각형의 좌표는 'viewport' 기준이다.
    //  'clientX'와 'clientY' 역시 'viewport' 기준이다.

    const parentBox = position.parentBox ?? event.target;
    const boxRect = parentBox.getBoundingClientRect();

    let x = position.x ?? event.clientX;
    let y = position.y ?? event.clientY;

    if (boxRect.right - x < menuSize.width) {
      x -= menuSize.width;
    }

    if (boxRect.bottom - y < menuSize.height) {
      y -= menuSize.height;
    }

    x = Math.max(x, boxRect.left);
    y = Math.max(y, boxRect.top);

    menuPos = { x, y };

    if (hidePrevContextMenu) {
      await hideLastShownContextMenu();

      // NOtE: 마지막으로 보인 컨텍스트 윈도가 '자신'이었다면 '자신'을 화면에 표시하기 위해서 속성 설정이 필요하다.
      menuVisible = true;
    }

    await setLastShownContextMenuInfo(parentBox, hideContextMenu);
  }

  export async function hideContextMenu() {
    menuVisible = false;
    await tick();
  }
</script>

<svelte:window on:click={hideContextMenu} />

{#if menuVisible}
  <ContextMenu {menuItems} {menuPos} bind:menuSize on:menuItemClicked />
{/if}
