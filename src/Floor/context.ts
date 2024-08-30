import { getContext, setContext } from "svelte";
import { Writable, writable, get } from "svelte/store";
import { deepCopy, cDiffObj } from "../common/util";
import { DataSink } from "../common/data/DataStore.js";
import { ChildComponentInfo, FloorData, TreeNode } from "./types";
import {
  addNodeById,
  removeNodeById,
  updateNodeById,
  resetNodeById,
  removeInvalidNode,
  replaceNodeId,
} from "./tree";
import {
  getAncestorFloorId,
  loadFloor,
  loadAncestorFloors,
  removeFloor,
  resetFloor,
  updateTabFloors,
} from "./persistency";

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

  resetFloor(targetFloorId: string) {
    this.#contextStore.update((value) => {
      value.updateReason = "resetFloor";
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
  async removeTabFloor(
    targetFloorId: string,
    tabIndexUpdateInfo: Record<string, any>
  ) {
    const ancestorFloorId = await getAncestorFloorId(targetFloorId);

    // NOTE: 'IndexedDB'에서 해당 컴포넌트 정보를 '삭제'한다.
    //       '컴포넌트 트리 GUI'에서는 해당 컴포넌트를 리셋한다.
    this.resetFloor(targetFloorId);

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
  async #updateFloorState(context: ContextStore) {
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
      context.updateReason === "resetFloor" &&
      context.targetFloorId &&
      context.targetFloorId === this.#props.floorId
    ) {
      if (context.targetFloorId === "floor-root") {
        await removeFloor(context.targetFloorId);
        this.#props.setChildComponentInfo(null);
      } else {
        // 'IndexedDB'에서 해당 컴포넌트 정보를 '리셋'한다.
        const floorData = await resetFloor(this.#props.floorId);

        // '연계된 Floor 컴포넌트'에 설정된 자식 컴포넌트를 '제거'한다.
        this.#props.setChildComponentInfo(floorData?.childComponentInfo);
      }

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
