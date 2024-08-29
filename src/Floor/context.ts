import { getContext, setContext } from "svelte";
import { Writable, writable, get } from "svelte/store";
import { deepCopy, cDiffObj } from "../common/util";
import { DataSink } from "../common/data/DataStore.js";
import { ChildComponentInfo, FloorData } from "./types";
import {
  getAncestorFloorId,
  loadFloor,
  loadAncestorFloors,
  removeFloor,
  updateTabFloors,
} from "./persistency";

interface TreeNode {
  id: string;
  name: string | null;
  open: boolean;
  children: TreeNode[];
}

interface ContextStore {
  maxLevel: number;
  updateReason: string | null;
  targetFloorId: string | null;
  ancestorFloorId: string | null;
  dataSink: DataSink | null;
  replaceIdMap: Map<string, string>;
  designMode: boolean;
  childComponentInfo: ChildComponentInfo | null;
  floorData: FloorData | null;
  componentTreeData: TreeNode[];
}

export class FloorContext {
  #ctxName: string;
  #props: Record<string, any>;
  #contextStore: Writable<ContextStore>;
  #unsubscribe: () => void;

  constructor(ctxName: string, props: Record<string, any>) {
    this.#ctxName = ctxName;
    this.#props = props;

    if (props.floorLevel === 0) {
      this.#contextStore = writable<ContextStore>({
        maxLevel: 0,
        updateReason: null,
        targetFloorId: null,
        ancestorFloorId: null,
        dataSink: null,
        replaceIdMap: new Map(),
        designMode: !!props.designMode,
        childComponentInfo: null,
        floorData: null,
        componentTreeData: [
          {
            id: props.floorId,
            name: null,
            open: true,
            children: [],
          },
        ],
      });
      setContext(ctxName, this.#contextStore);
    } else {
      this.#contextStore = getContext(ctxName);
    }

    this.#unsubscribe = this.#contextStore.subscribe((value) => {
      this.#updateFloorState(value);
    });

    if (props.floorLevel > 0) {
      this.#contextStore.update((value) => {
        value.updateReason = "componentTreeChange";
        if (props.floorLevel > value.maxLevel) {
          value.maxLevel = props.floorLevel;
        }
        const treeData = value.componentTreeData;
        addNodeById(treeData, props.ancestorFloorId, props.floorId);
        return value;
      });
    }
  }

  dispose() {
    this.#unsubscribe();
  }

  getContextDesignMode() {
    return get(this.#contextStore).designMode;
  }

  updateDesignMode(designMode: boolean) {
    this.#props.designMode = designMode;
    if (this.#props.floorLevel === 0) {
      const ctx = get(this.#contextStore);
      ctx.designMode = designMode;
    }
  }

  async ensureVisible(targetFloorId: string) {
    const ancestorFloorData = await loadAncestorFloors(targetFloorId);
    ancestorFloorData.forEach((floorData) => {
      this.#contextStore.update((value) => {
        value.updateReason = "ensureVisible";
        value.floorData = floorData;
        return value;
      });
    });
  }

  async highlight(targetFloorId: string) {
    const ancestorFloorId = await getAncestorFloorId(targetFloorId);
    this.#contextStore.update((value) => {
      value.updateReason = "highlightFloor";
      value.targetFloorId = targetFloorId;
      value.ancestorFloorId = ancestorFloorId;
      return value;
    });
  }

  removeComponent(targetFloorId: string) {
    this.#contextStore.update((value) => {
      value.updateReason = "componentRemove";
      value.targetFloorId = targetFloorId;
      return value;
    });
  }

  /**
   * 'Tab' 컴포넌트의 '탭에 설정된 Floor 컴포넌트'를 제거할 때 호출된다.
   *
   * @param targetFloorId 제거할 탭에 설정된 Floor 컴포넌트의 ID
   * @param tabIndexUpdateInfo 탭 인덱스 업데이트 정보를 포함하는 객체
   */
  async removeTabComponent(
    targetFloorId: string,
    tabIndexUpdateInfo: Record<string, any>
  ) {
    const ancestorFloorId = await getAncestorFloorId(targetFloorId);

    // NOTE: 'IndexedDB'에서 해당 컴포넌트 정보를 '삭제'한다.
    //       '컴포넌트 트리 GUI'에서는 해당 컴포넌트를 리셋한다.
    this.removeComponent(targetFloorId);

    if (ancestorFloorId) {
      await updateTabFloors(ancestorFloorId, tabIndexUpdateInfo);
    }

    // NOTE: '컴포넌트 트리 GUI'에서 해당 컴포넌트를 삭제한다.
    //       'Splitter'의 경우와 같이 자시 컴포넌트 크기가 고정된 경우는
    //       트리 노드를 리셋만 해주는 것이 맞다. 'Tab'의 경우는 삭제된
    //       탭과 연계된 트리 노드를 삭제하는 것이 맞다.
    const ctx = get(this.#contextStore);
    removeNodeById(ctx.componentTreeData, targetFloorId);
    this.#props.dispatch("componentTreeChanged", {
      componentTreeData: ctx.componentTreeData,
    });
  }

  updateInvalidFloorIdInfo(newInvalidFloorId: string, orgFloodId: string) {
    this.#contextStore.update((value) => {
      value.updateReason = "updateInvalidFloorIdInfo";
      value.replaceIdMap.set(newInvalidFloorId, orgFloodId);
      return value;
    });
  }

  // NOTE: 'SCompBox'의 '디자인 모드'에서 좌측의 '컴포넌트 트리' 표시를 위한 데이터를 업데이트한다.
  updateChildComponentTreeData(
    childComponentInfo: ChildComponentInfo,
    debug = false
  ) {
    this.#contextStore.update((value) => {
      value.updateReason = "componentTreeChange";
      if (
        this.#props.floorLevel === 0 &&
        value.componentTreeData.length === 0
      ) {
        value.componentTreeData = [
          {
            id: "floor-root",
            name: null,
            open: true,
            children: [],
          },
        ];
      }

      const beforeUpdate = debug ? deepCopy(value.componentTreeData) : null;

      const treeData = value.componentTreeData;
      updateNodeById(
        treeData,
        this.#props.floorId,
        childComponentInfo,
        value.designMode
      );

      if (beforeUpdate) {
        cDiffObj(
          beforeUpdate,
          treeData,
          `floorId: ${this.#props.floorId}, 트리 데이터 변경사항:`
        );
      }

      return value;
    });
  }

  clearChildComponentTreeData() {
    this.#contextStore.update((value) => {
      value.updateReason = "componentTreeChange";
      if (this.#props.floorLevel === 0) {
        value.componentTreeData = [];
      } else {
        const treeData = value.componentTreeData;
        resetNodeById(treeData, this.#props.floorId);
      }
      return value;
    });
  }

  // NOTE: 'replaceIdMap'은 'IndexedDB'에 저장된 '컴포넌트 트리' 정보로부터 '로딩'시에 임시로 사용된다.
  //       최초에 컴포넌트를 구성했을때의 'id'값을 복원하기 위한 용도이다. 로딩이 끝난 후에는 필요가 없다.
  //       문제는 replaceIdMap을 'clear'시킬 시점이 언제인지가 애매하다. 현재 구현에서 모든 컴포넌트
  //       로딩 완료 시점을 판단하는 로직이 없다. 사실 이 맵 객체를 그대로 내버려두어도 메모리를 약간 소모한다는
  //       것을 빼고는 그다지 문제는 없다. 그래도 이 맵을 클리어하는 것이 안전한 시점에는 클리어하는 것이 좋겠다.
  //       'clearReplaceIdMap' 함수는 그러한 시점에 호출할 수 있도록 작성한 도우미 함수이다.
  clearReplaceIdMap() {
    const ctx = get(this.#contextStore);
    ctx.replaceIdMap.clear();
  }

  linkDataStore(dataSink: DataSink) {
    this.#contextStore.update((value) => {
      value.updateReason = "linkDataStore";
      value.dataSink = dataSink;
      return value;
    });
  }

  // context: '#contextStore'에 저장된 '공유 컨텍스트 객체'
  #updateFloorState(context: ContextStore) {
    if (context.updateReason === "componentTreeChange") {
      if (this.#props.floorLevel === 0) {
        // NOTE: 'root floor'에서만 업데이트해주면 된다.
        removeInvalidNode(context.componentTreeData, context.replaceIdMap);
        this.#props.dispatch("componentTreeChanged", {
          componentTreeData: context.componentTreeData,
        });
      } else {
        // do nothing
      }
    } else if (
      context.updateReason === "ensureVisible" &&
      context.floorData?.floorId === this.#props.floorId
    ) {
      if (context.floorData?.nonFloorParentInfo) {
        const tabIndex = context.floorData.nonFloorParentInfo.tabIndex;

        // '이 Floor' 컴포넌트의 DOM 트리 상에서의 부모가 'Tab' 컨테이너인 경우에
        // 현재의 '이 Floor' 컴포넌트가 화면에 보이도록 한다.
        if (tabIndex) {
          this.#props.dispatch("queryContainerInfo", {
            infoCallback: async (containerInfo: Record<string, any>) => {
              if (containerInfo.containerName === "Tab") {
                containerInfo.ensureTabVisible(tabIndex);
              }
            },
          });
        }
      }

      context.floorData = null;
    } else if (
      context.updateReason === "highlightFloor" &&
      context.targetFloorId &&
      context.ancestorFloorId
    ) {
      const targetFloorId = context.targetFloorId;
      const targetAncestorFloorId = context.ancestorFloorId;
      this.#props.dispatch("queryContainerInfo", {
        infoCallback: async (containerInfo: Record<string, any>) => {
          if (containerInfo.containerName === "Tab") {
            const curTabAncestorFloorId = containerInfo.ancestorFloorId;
            const curTabIndex = containerInfo.tabIndex;
            const curFloorInfo = await loadFloor(targetFloorId);
            const curFloorTabIndex = curFloorInfo?.nonFloorParentInfo?.tabIndex;
            if (
              targetAncestorFloorId === curTabAncestorFloorId &&
              curTabIndex === curFloorTabIndex
            ) {
              containerInfo.ensureTabVisible(curTabIndex);
            }
          }

          // NOTE: 'Floor' 컴포넌트의 영역이 하이라이트된다.
          this.#props.dispatch("highlightFloor", {
            floorId: targetFloorId,
          });
        },
      });
    } else if (
      context.updateReason === "componentRemove" &&
      context.targetFloorId &&
      context.targetFloorId === this.#props.floorId
    ) {
      // 'IndexedDB'에서 해당 컴포넌트 정보를 '삭제'한다.
      removeFloor(this.#props.floorId);

      // '화면'에서 해당 컴포넌트를 '제거'한다.
      this.#props.setChildComponentInfo(null);

      context.replaceIdMap.clear();

      // '컴포넌트 트리 GUI'에서 해당 컴포넌트를 리셋한다.
      resetNodeById(context.componentTreeData, this.#props.floorId);
      this.#props.dispatch("componentTreeChanged", {
        componentTreeData: context.componentTreeData,
      });
    } else if (context.updateReason === "updateInvalidFloorIdInfo") {
      const newInvalidFloorId = this.#props.floorId;
      if (context.replaceIdMap.has(newInvalidFloorId)) {
        const orgFloorId = context.replaceIdMap.get(newInvalidFloorId);
        if (orgFloorId) {
          replaceNodeId(
            context.componentTreeData,
            newInvalidFloorId,
            orgFloorId
          );
          this.#props.floorId = orgFloorId;
        }
      }
    } else if (context.updateReason === "linkDataStore") {
      const dataSink = context.dataSink;
      this.#props.dispatch("linkDataStore", { dataSink });
    } else {
      /*
            console.log(
              `unhandled update reason: ${context.updateReason}, floorId: ${this.#props.floorId}, targetFloorId: ${context.targetFloorId}`
            );
            */
    }
  }
}

//=============================================================================
// 최상위에 계층에 위치한 'Floor' 컴포넌트가 '디자인 모드'로 동작시 좌측의 '컴포넌트 트리'를
// 표현하기 위한 '스벨트 스토어 컨텍스트' 데이터 조작을 위한 함수들이다.
//=============================================================================
// 'tree' 노드 중에 'id'가 'ancestorFloorId'인 노드를 찾아서 그 노드의 'children'에 'newFloorId'를 추가한다.
// 리턴값은 'newFloorId'를 추가했는지 여부이다.
function addNodeById(
  tree: TreeNode[],
  ancestorFloorId: string,
  newFloorId: string
) {
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

// 'tree' 노드 중에 'id'가 'floorId'인 노드를 찾아서 그 노드의 내용을 '리셋'한다.
function resetNodeById(tree: TreeNode[], id: string) {
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

// 'tree' 노드 중에 'id'에 해당하는 노드의 'name' 정보를 업데이트한다.
// 'childComponentInfo'는 'id'와 대응되는 '컴포넌트' 정보를 가지고 있다.
function updateNodeById(
  tree: TreeNode[],
  id: string,
  childComponentInfo: ChildComponentInfo,
  isDesignMode: boolean,
  debug = false
) {
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
        isDesignMode
      );
      if (found) {
        return true;
      }
    }
  }

  return false;
}

// 'tree' 전체를 순회하면서 'oldId'를 'newId'로 변경한다.
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

// 'tree' 노드 중에 'id'가 'floorId'인 노드를 찾아서 그 노드를 삭제한다.
// 리턴값은 'floorId'를 삭제했는지 여부이다. 'id'에 해당하는 노드는 1개만 존재한다고 가정한다.
function removeNodeById(tree: TreeNode[], id: string) {
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

// 'TreeView'에 표시를 위해서 구성된 데이터 중에 DOM에서 '삭제'된 'Floor' 컴포넌트 데이터를 제거한다.
//
// treeRootData: 'SCompBox'의 '디자인 모드'에서 좌측 '트리'를 표현하는 데이터
// excludeIdMap: NOTE: '스벨트' 컴포넌트의 동장 방식으로 인해 현재 '처림 시점' 제어가 쉽지 않은 상황이다.
//                     일단은 돌아가는 임시 방법으로 도입한 것이다.
//                     'excludeIdMap'에 포함된 'id'는 '삭제'하지 않도록 한다.
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
