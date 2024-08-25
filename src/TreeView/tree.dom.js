export function getFirstNodeId(rootUlElem) {
  let firstNodeId = null;

  const firstNodeElem = rootUlElem.querySelector(".node-content[data-node-id]");
  if (firstNodeElem) {
    firstNodeId = firstNodeElem.dataset.nodeId;
  }

  return firstNodeId;
}

export function getLastNodeId(rootUlElem) {
  let lastNodeId = null;

  const nodeElems = rootUlElem.querySelectorAll(
    ".node-content[data-node-id]:last-child"
  );
  if (nodeElems.length > 0) {
    const lastNodeElem = nodeElems[nodeElems.length - 1];
    lastNodeId = lastNodeElem.dataset.nodeId;
  }

  return lastNodeId;
}

export function getPrevNodeId(rootUlElem, nodeId) {
  let prevNodeId = null;

  const curNodeElem = rootUlElem.querySelector(
    `div.node-content[data-node-id="${nodeId}"]`
  );
  const parentLi = curNodeElem.closest("li.node-item");

  const prevLi = parentLi.previousElementSibling;
  if (prevLi) {
    const prevNodeElem = prevLi.querySelector(".node-content[data-node-id]");
    prevNodeId = prevNodeElem.dataset.nodeId;
    if (prevNodeElem.dataset.nodeOpen == "true") {
      const childUl = prevLi.querySelector("ul[data-node-level]");
      if (childUl) {
        let nodes = childUl.querySelectorAll(".node-content[data-node-id]");
        if (nodes.length > 0) {
          // 자식 노드 중 가장 마지막 노드의 ID를 반환
          prevNodeId = nodes[nodes.length - 1]?.dataset.nodeId;
        }
      }
    }
  } else {
    // 부모 노드로 이동
    const prevNodeItem = parentLi.parentNode.closest("li.node-item");
    if (prevNodeItem) {
      prevNodeId = prevNodeItem.querySelector(".node-content[data-node-id]")
        ?.dataset.nodeId;
    }
  }

  return prevNodeId;
}

export function getNextNodeId(rootUlElem, nodeId) {
  let nextNodeId = null;

  const curNodeElem = rootUlElem.querySelector(
    `div.node-content[data-node-id="${nodeId}"]`
  );
  const isNodeOpen = curNodeElem.dataset.nodeOpen == "true";
  const parentLi = curNodeElem.closest("li.node-item");

  // 현재 노드가 자식 노드를 가지고 있고 오픈된 경우에 첫번째 자식 노드로 이동
  if (isNodeOpen) {
    const childUl = parentLi.querySelector("ul[data-node-level]");
    if (childUl) {
      nextNodeId = childUl.querySelector(".node-content[data-node-id]")?.dataset
        .nodeId;
    }
  }

  // 현재 노드가 자식이 없는 경우에 다음 형제 노드로 이동
  if (!nextNodeId) {
    const nextLi = parentLi.nextElementSibling;
    if (nextLi) {
      nextNodeId = nextLi.querySelector(".node-content[data-node-id]")?.dataset
        .nodeId;
    }
  }

  // 현재 노드가 다음 형제 노드가 없는 경우에 부모 노드의 다음 형제 노드로 이동
  if (!nextNodeId) {
    const parentUl = parentLi.closest("ul[data-node-level]");
    const nextLi = parentUl.parentNode.nextElementSibling;
    if (nextLi) {
      nextNodeId = nextLi.querySelector(".node-content[data-node-id]")?.dataset
        .nodeId;
    }
  }

  return nextNodeId;
}
