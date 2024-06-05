export function _handleKeyUp(event, treeContainer, tree) {
    const rootUlElem = treeContainer?.querySelector("ul[data-node-level='0']");

    switch (event.key) {
        case "ArrowUp":
            tree?.moveSelectRectToPrevNode(rootUlElem);
            break;
        case "ArrowDown":
            tree?.moveSelectRectToNextNode(rootUlElem);
            break;
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
        default:
            break;
    }
}