<script>
  import {
    getContext,
    setContext,
    createEventDispatcher,
    onDestroy,
  } from "svelte";
  import { writable, get } from "svelte/store";
  import { CustomEventsRegister } from "../common/customEvents.js";
  import {
    addNodeById,
    resetNodeById,
    updateNodeById,
    replaceNodeId,
    removeInvalidNode,
  } from "./context.js";
  import {
    loadFloor,
    loadDescendentFloor,
    saveFloor,
    removeFloor,
    swapFloorData,
    removeUnserializableProperties as cleanProps,
    restoreUnserializableProperties as restoreComponentClass,
    updateMenuItemsInProps,
  } from "./persistency.js";

  const dispatch = createEventDispatcher();

  export let floorLevel = -1;
  export let floorId = null;
  export let ancestorFloorId = null;
  export let childComponentInfo = null;
  export let menuItems = [];
  export let designMode = false;

  const contextName = "floor-context";
  let context;
  let contextUnsubscribe;

  let childComponent;
  let childCustomEventsRegister;

  $: floorLevel >= 0 && (context = initContext(contextName));

  // NOTE: 아래 '$context' 문법을 사용해 스토어 '자동 구독'을 한 경우에
  //       '최상위 Floor'에 'Splitter' 같은 '컨테이너' 성격의
  //       컴포넌트가 아닌 'Marquee'와 같은 일반 컴포넌트를 추가시
  //       'context.update'가 분명 호출되었음에도 이 '반응형 블럭'이
  //       트리거 되지 않은 문제가 있었음. 디버깅을 통해서 확인 결과
  //       다른 곳에 변경은 없는 상태에서 자동 구독이 아닌 'context.subscribe'를
  //       이용한 '수동 구독'의 경우에 정상적으로 동작하는 것을 확인했음.
  //$: context && updateFloorState($context);

  $: if (context) {
    contextUnsubscribe = context.subscribe((value) => {
      updateFloorState(value);
    });
  }

  $: if (childComponentInfo) {
    setChildComponentInfo();
  } else {
    clearChildComponentTreeData();
  }

  $: if (floorLevel >= 0) {
    loadChildComponentInfo();
  }

  $: if (childComponent) {
    registerCustomEvents();
  } else {
    childCustomEventsRegister?.unregister();
    childCustomEventsRegister = null;
  }

  export function getContextDesignMode() {
    return get(context).designMode;
  }

  export function getChildComponentInfo() {
    return {
      floorId,
      childComponentInfo,
    };
  }

  export function highlight(targetFloorId) {
    context.update((value) => {
      value.updateReason = "highlightFloor";
      value.targetFloorId = targetFloorId;
      return value;
    });
  }

  export function removeComponent(targetFloorId) {
    context?.update((value) => {
      value.updateReason = "componentRemove";
      value.targetFloorId = targetFloorId;
      return value;
    });
  }

  function initContext(ctxName) {
    let context;
    if (floorLevel === 0) {
      // 로컬 스토리지에 저장된 것이 있는지 확인후 로딩 처리?

      context = writable({
        maxLevel: 0,
        updateReason: null,
        designMode,
        targetFloorId: null,
        replaceIdMap: new Map(),
        childComponentInfo: null,
        componentTreeData: [
          {
            id: floorId,
            name: null,
            open: true,
            children: [],
          },
        ],
      });
      setContext(ctxName, context);
    } else {
      context = getContext(ctxName);
      context.update((value) => {
        value.updateReason = "componentTreeChange";
        if (floorLevel > value.maxLevel) {
          value.maxLevel = floorLevel;
        }
        const treeData = value.componentTreeData;
        addNodeById(treeData, ancestorFloorId, floorId);
        return value;
      });
    }
    return context;
  }

  function registerCustomEvents() {
    childCustomEventsRegister = new CustomEventsRegister(
      dispatch,
      childComponent,
      (eventName, bubble) => {
        if (eventName === "splitterOrientationChanged") {
          const ctx = get(context);
          ctx.replaceIdMap.clear();

          const detail = bubble.forwardingDetail;
          childComponentInfo.props.orientation = detail.orientation;
          childComponentInfo = { ...childComponentInfo };
        } else if (eventName === "splitterPanelSwapped") {
          const ctx = get(context);
          ctx.replaceIdMap.clear();

          const detail = bubble.forwardingDetail;
          const componentInstance_0 =
            detail.component_0.after.componentInstance;
          const componentInstance_1 =
            detail.component_1.after.componentInstance;

          const id_0 = componentInstance_0.getFloorId();
          const id_1 = componentInstance_1.getFloorId();
          swapFloorData(id_0, id_1, cleanProps(childComponentInfo));
          childComponentInfo = null;
          loadChildComponentInfo();
        } else {
          console.warn(`unhandled event: ${eventName}`);
        }
      }
    );
  }

  function setChildComponentInfo() {
    updateChildComponentTreeData();

    const cleanedData = cleanProps(childComponentInfo);

    if (floorLevel === 0) {
      saveFloor({
        floorId,
        ancestorFloorId,
        childComponentInfo: cleanedData,
        nonFloorParentInfo: null,
      });
    } else {
      dispatch("queryContainerInfo", {
        infoCallback: (containerInfo) => {
          const cleanedInfo = cleanProps(containerInfo);
          saveFloor({
            floorId,
            ancestorFloorId,
            childComponentInfo: cleanedData,
            nonFloorParentInfo: cleanedInfo,
          });
        },
      });
    }
  }

  async function loadChildComponentInfo() {
    if (floorLevel === 0) {
      const floorData = await loadFloor(floorId);
      if (floorData) {
        restoreComponentClass(floorData, "/build/dev/default").then(
          (restoredData) => {
            const restoredChildInfo = updateMenuItemsInProps(
              restoredData.childComponentInfo,
              menuItems
            );
            childComponentInfo = restoredChildInfo;
          }
        );
      }
    } else if (floorLevel > 0) {
      dispatch("queryContainerInfo", {
        infoCallback: (containerInfo) => {
          if (containerInfo.containerName === "Splitter") {
            tryToLoadSplitterChildComponent(containerInfo);
          }
        },
      });
    }
  }

  async function tryToLoadSplitterChildComponent(containerInfo) {
    const floors = await loadDescendentFloor(ancestorFloorId);

    if (floors.length < 0 || floors.length > 2) {
      console.warn(
        `invalid splitter's direct descendent floor count: ${floors.length}`
      );
      return;
    }

    const floorData = floors.find((floor) => {
      const nonFloorParentInfo = floor.nonFloorParentInfo;

      // 'IndexedDB'에 저장된 'nonFloorParentInfo'의 'containerName'이
      // '런타임'에 설정된 'containerInfo'의 'containerName'과 다른 경우,
      // 즉 '저장 오류' 또는 '데이터 오류'인 경우는 무시한다.
      if (nonFloorParentInfo.containerName !== containerInfo.containerName) {
        console.warn(
          `containerName is different: ${nonFloorParentInfo.containerName}, ${containerInfo.containerName}`
        );
        return false;
      }

      // 로딩된 2개의 'descendent floor' 중에서
      // 'Splitter'의 같은 '컨텐트 패널' 위치에서 있는 'floor'를 찾기 위한 조건
      const hasComponent_0 =
        nonFloorParentInfo.component_0 && containerInfo.component_0;
      const hasComponent_1 =
        nonFloorParentInfo.component_1 && containerInfo.component_1;
      return hasComponent_0 || hasComponent_1;
    });

    if (floorData) {
      context.update((value) => {
        value.updateReason = "updateChildComponentId";
        const newInvalidFloorId = floorId;
        const orgFloodId = floorData.floorId;
        value.replaceIdMap.set(newInvalidFloorId, orgFloodId);
        return value;
      });
      dispatch("loadFloorChildComponent", {
        orgFloorId: floorData.floorId,
        childComponentInfo: floorData.childComponentInfo,
      });
    } else {
      // 'null', 즉 '자식 컴포넌트가 설정되지 않은 상태' 또는 '데이터 오류'인 경우

      // 'null'인 경우는
      // 'floorId'를 '고정' 시켜 처리를 단순화 하기 위해서 '널 컴포넌트'를 설정해준다.
      childComponentInfo = {
        customElementName: "null",
      };
    }
  }

  function updateFloorState(context) {
    if (context.updateReason === "componentTreeChange") {
      if (floorLevel === 0) {
        // NOTE: 'root floor'에서만 업데이트해주면 된다.
        removeInvalidNode(context.componentTreeData, context.replaceIdMap);
        dispatch("componentTreeChanged", {
          componentTreeData: context.componentTreeData,
        });
      } else {
        // do nothing
      }
    } else if (
      context.updateReason === "highlightFloor" &&
      context.targetFloorId
    ) {
      dispatch("highlightFloor", { floorId: context.targetFloorId });
    } else if (
      context.updateReason === "componentRemove" &&
      context.targetFloorId &&
      context.targetFloorId === floorId
    ) {
      removeFloor(floorId);
      childComponentInfo = null;
    } else if (context.updateReason === "updateChildComponentId") {
      let newInvalidFloorId = null;
      let orgFloodId = null;
      if (context.replaceIdMap.has(floorId)) {
        newInvalidFloorId = floorId;
        orgFloodId = context.replaceIdMap.get(newInvalidFloorId);
        replaceNodeId(context.componentTreeData, newInvalidFloorId, orgFloodId);
      }
    } else {
      /*
      console.log(
        `unhandled update reason: ${context.updateReason}, floorId: ${floorId}, targetFloorId: ${context.targetFloorId}`
      );
      */
    }
  }

  // NOTE: 'SCompBox'의 '디자인 모드'에서 좌측의 '컴포넌트 트리' 표시를 위한 데이터를 업데이트한다.
  function updateChildComponentTreeData() {
    context.update((value) => {
      value.updateReason = "componentTreeChange";
      if (floorLevel === 0 && value.componentTreeData.length === 0) {
        value.componentTreeData = [
          {
            id: "floor-root",
            open: true,
            children: [],
          },
        ];
      }
      const treeData = value.componentTreeData;
      updateNodeById(
        treeData,
        floorId,
        childComponentInfo,
        getContextDesignMode()
      );
      return value;
    });
  }

  function clearChildComponentTreeData() {
    context?.update((value) => {
      value.updateReason = "componentTreeChange";
      if (floorLevel === 0) {
        value.componentTreeData = [];
      } else {
        const treeData = value.componentTreeData;
        resetNodeById(treeData, floorId);
      }
      return value;
    });
  }

  onDestroy(() => {
    contextUnsubscribe?.();
  });
</script>

{#if childComponentInfo}
  {#if childComponentInfo.componentClass}
    <svelte:component
      this={childComponentInfo.componentClass}
      bind:this={childComponent}
      {...childComponentInfo.props}
    />
  {:else if childComponentInfo.customElementName}
    <svelte:element
      this={childComponentInfo.customElementName}
      bind:this={childComponent}
      {...childComponentInfo.props}
    />
  {/if}
{/if}
