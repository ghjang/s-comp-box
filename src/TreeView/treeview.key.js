// NOTE: 'keydown' 이벥트는 키를 누르고 있는 동안 계속 발생하고, 'keyup' 이벤트는 키를 눌렀다 뗄 때 발생한다.
//       '선택 영역'의 '위/아래' 이동시에는 'keydown' 이벤트를 이용하는 것이 좀더 자연스러운 조작방식으로 느껴진다.
export function _handleKeyDown(event, treeContainer, tree) {
  const rootUlElem = treeContainer?.querySelector("ul[data-node-level='0']");

  switch (event.key) {
    case "ArrowUp":
      tree?.moveSelectRectToPrevNode(rootUlElem);
      break;
    case "ArrowDown":
      tree?.moveSelectRectToNextNode(rootUlElem);
      break;
    default:
      break;
  }
}

export function _handleKeyUp(event, treeContainer, tree) {
  const rootUlElem = treeContainer?.querySelector("ul[data-node-level='0']");

  switch (event.key) {
    case "ArrowLeft":
      tree?.closeNodeAtSelectRect(rootUlElem);
      break;
    case "ArrowRight":
      tree?.openNodeAtSelectRect(rootUlElem);
      break;
    case "Home":
      tree?.moveSelectRectToFirstNode(rootUlElem);
      break;
    case "End":
      tree?.moveSelectRectToLastNode(rootUlElem);
      break;
    case "Enter":
      tree?.selectNodeAtSelectRect(rootUlElem);
      break;
    case "Escape":
      treeContainer?.blur();
      break;
    case "Delete":
      tree?.removeNodeAtSelectRect(rootUlElem);
      break;
    default:
      break;
  }
}
