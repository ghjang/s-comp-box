/*=============================================================================
 * 최상위에 계층에 위치한 'Floor' 컴포넌트가 '디자인 모드'로 동작시 좌측의 '컴포넌트 트리'를
 * 표현하기 위한 '스벨트 스토어 컨텍스트' 데이터 조작을 위한 내부 구현 함수들이다.
 *============================================================================*/

import { TreeNode, ChildComponentInfo } from "./types";

export default class FloorTree {
  #root: TreeNode[];

  constructor(tree: TreeNode[]) {
    this.#root = tree;
  }

  get root() {
    return this.#root;
  }

  appendNewEmptyNode(ancestorFloorId: string, newFloorId: string) {
    return addNodeById(this.#root, ancestorFloorId, newFloorId);
  }

  resetNode(id: string) {
    return resetNodeById(this.#root, id);
  }

  updateNode(
    id: string,
    childComponentInfo: ChildComponentInfo,
    isDesignMode: boolean,
    debug = false
  ) {
    return updateNodeById(
      this.#root,
      id,
      childComponentInfo,
      isDesignMode,
      debug
    );
  }

  replaceNode(oldId: string, newId: string) {
    return replaceNodeId(this.#root, oldId, newId);
  }

  removeNode(id: string) {
    return removeNodeById(this.#root, id);
  }

  removeInvalidNode(excludeIdMap: Map<string, string>) {
    return removeInvalidNode(this.#root, excludeIdMap);
  }
}

//=============================================================================
// 이하 내부 구현 함수들
//=============================================================================

/**
 * 'tree' 노드 중에 'id'가 'ancestorFloorId'인 노드를 찾아서 그 노드의 'children'에 'newFloorId'를 추가한다.
 * @param tree 트리 구조
 * @param ancestorFloorId 부모 노드의 ID
 * @param newFloorId 추가할 새 노드의 ID
 * @returns 새 노드를 추가했는지 여부
 */
function addNodeById(
  tree: TreeNode[],
  ancestorFloorId: string,
  newFloorId: string
): boolean {
  for (const node of tree) {
    if (node.id === ancestorFloorId) {
      node.children.push({
        id: newFloorId,
        name: null,
        open: true,
        children: [],
      });
      return true;
    }
    if (node.children.length > 0) {
      const found = addNodeById(node.children, ancestorFloorId, newFloorId);
      if (found) {
        return true;
      }
    }
  }
  return false;
}

/**
 * 'tree' 노드 중에 'id'가 'floorId'인 노드를 찾아서 그 노드의 내용을 '리셋'한다.
 * @param tree 트리 구조
 * @param id 리셋할 노드의 ID
 * @returns 노드를 리셋했는지 여부
 */
function resetNodeById(tree: TreeNode[], id: string): boolean {
  for (const node of tree) {
    if (node.id === id) {
      node.name = null;
      node.children = [];
      return true;
    }
    if (node.children.length > 0) {
      const found = resetNodeById(node.children, id);
      if (found) {
        return true;
      }
    }
  }
  return false;
}

/**
 * 'tree' 노드 중에 'id'에 해당하는 노드의 'name' 정보를 업데이트한다.
 * @param tree 트리 구조
 * @param id 업데이트할 노드의 ID
 * @param childComponentInfo 컴포넌트 정보
 * @param isDesignMode 디자인 모드 여부
 * @param debug 디버그 모드 여부
 * @returns 노드를 업데이트했는지 여부
 */
function updateNodeById(
  tree: TreeNode[],
  id: string,
  childComponentInfo: ChildComponentInfo,
  isDesignMode: boolean,
  debug = false
): boolean {
  for (const node of tree) {
    if (node.id === id) {
      let compName;

      if (typeof childComponentInfo.componentClass === "function") {
        // NOTE: '릴리즈 번들링 최적화'시에 '컴포넌트 클래스'를 사용하는 경우에
        //       '클래스 이름'이 '축소 변경'될 수 있어 '원래의 클래스 이름'을
        //       클래스 생성자 함수로부터 얻을 수가 없어 명시적으로 지정된
        //       '컴포넌트 클래스 이름'을 사용한다.
        compName = childComponentInfo.componentClassName;
      } else {
        compName = childComponentInfo.customElementName;
      }

      if (!compName) {
        throw new Error("Component name is required.");
      }

      if (compName === "Splitter" || compName === "Tab") {
        childComponentInfo.props = {
          ...childComponentInfo.props,
          showContentControl: isDesignMode,
        };
        if (compName === "Splitter") {
          childComponentInfo.props.showPanelResizingInfo = isDesignMode;
        }
      }

      const compNodeName = childComponentInfo.componentNodeName || compName;
      node.name = debug ? `${id} => ${compNodeName}` : compNodeName;
      node.children = node.children ?? [];

      return true;
    }

    if (node.children.length > 0) {
      const found = updateNodeById(
        node.children,
        id,
        childComponentInfo,
        isDesignMode,
        debug
      );
      if (found) {
        return true;
      }
    }
  }

  return false;
}

/**
 * 'tree' 전체를 순회하면서 'oldId'를 'newId'로 변경한다.
 * @param tree 트리 구조
 * @param oldId 변경할 기존 ID
 * @param newId 새로운 ID
 */
function replaceNodeId(tree: TreeNode[], oldId: string, newId: string) {
  for (let i = 0; i < tree.length; ++i) {
    const node = tree[i];
    if (node.id === oldId) {
      node.id = newId;
    }
    if (node.children.length > 0) {
      replaceNodeId(node.children, oldId, newId);
    }
  }
}

/**
 * 'tree' 노드 중에 'id'가 'floorId'인 노드를 찾아서 그 노드를 삭제한다.
 * @param tree 트리 구조
 * @param id 삭제할 노드의 ID
 * @returns 노드를 삭제했는지 여부
 */
function removeNodeById(tree: TreeNode[], id: string): boolean {
  for (let i = 0; i < tree.length; ++i) {
    const node = tree[i];
    if (node.id === id) {
      tree.splice(i, 1);
      return true;
    }
    if (node.children.length > 0 && removeNodeById(node.children, id)) {
      return true;
    }
  }
  return false;
}

/**
 * 'TreeView'에 표시를 위해서 구성된 데이터 중에 DOM에서 '삭제'된 'Floor' 컴포넌트 데이터를 제거한다.
 * @param treeRootData 트리 루트 데이터
 * @param excludeIdMap 제외할 ID 맵
 */
function removeInvalidNode(
  treeRootData: TreeNode[],
  excludeIdMap: Map<string, string>
) {
  const floorRootElem = document.querySelector(
    "div.floor-container[data-floor-id='floor-root'][data-floor-level='0']"
  );

  if (!floorRootElem && treeRootData.length !== 0) {
    throw new Error("Root floor not found.");
  }

  // NOTE: '루트 노드'는 '1개'만 존재하는 것으로 가정했다.
  if (treeRootData.length !== 1) {
    return;
  }

  const keySet = new Set(excludeIdMap?.keys());
  const valueSet = new Set(excludeIdMap?.values());
  const excludeIds = new Set([...keySet, ...valueSet]);

  if (floorRootElem) {
    removeInvalidNodeArrayElement(floorRootElem, treeRootData[0].children);
  }

  function removeInvalidNodeArrayElement(
    parentElem: Element,
    treeData: TreeNode[]
  ) {
    for (let i = 0; i < treeData.length; i++) {
      const node = treeData[i];
      const floorElem = parentElem.querySelector(
        `[data-floor-id="${node.id}"]`
      );

      if (!floorElem && !excludeIds.has(node.id)) {
        //console.log(`remove invalid node: ${node.id}`);
        treeData.splice(i, 1);
        i--;
      } else {
        if (floorElem && node.children.length > 0) {
          removeInvalidNodeArrayElement(floorElem, node.children);
        }
      }
    }
  }
}
