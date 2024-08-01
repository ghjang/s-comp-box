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
    getFloorRecordCount,
    loadFloor,
    loadDescendentFloor,
    saveFloor,
    removeFloor,
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
    updateChildComponentTreeData();
    console.log(
      `childComponentInfo was set: level: ${floorLevel}, id: ${floorId}`,
      childComponentInfo
    );

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
          console.log(`queryContainerInfo, id: ${floorId},`, containerInfo);
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
  } else {
    clearChildComponentTreeData();

    if (floorLevel === 0) {
      console.log("initial root floor is loaded.");

      getFloorRecordCount()
        .then((count) => {
          context.update((value) => {
            value.updateReason = "updateTotalFloorCount";
            value.totalFloorCount = count;
            return value;
          });
          return loadFloor(floorId);
        })
        .then((floorData) => {
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
        });
    } else if (floorLevel > 0) {
      console.log(
        `initial floor is loaded, level: ${floorLevel}, floorId: ${floorId}`
      );

      dispatch("queryContainerInfo", {
        infoCallback: (containerInfo) => {
          console.log(`queryContainerInfo, id: ${floorId},`, containerInfo);
          const containerName = containerInfo.containerName;
          if (containerName === "Splitter") {
            loadDescendentFloor(ancestorFloorId).then((floors) => {
              const floorData = floors.find((floor) => {
                const nonFloorParentInfo = floor.nonFloorParentInfo;
                if (nonFloorParentInfo.containerName !== containerName) {
                  return false;
                }
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
                  isInContextDesignMode: getContextDesignMode(),
                });
              } else {
                console.log(`floor data not found: ${containerName}`);
              }
            });
          }
        },
      });
    }
  }

  $: if (childComponent) {
    childCustomEventsRegister = new CustomEventsRegister(
      dispatch,
      childComponent,
      (eventName, bubble) => {
        console.log(`FloorChild, eventName: ${eventName}`);
        if (eventName === "splitterOrientationChanged") {
          const ctx = get(context);
          ctx.replaceIdMap.clear();

          const detail = bubble.forwardingDetail;
          console.log(`splitterOrientationChanged, detail:`, detail);
          childComponentInfo.props.orientation = detail.orientation;
          childComponentInfo = { ...childComponentInfo };
        }
      }
    );
  } else {
    childCustomEventsRegister?.unregister();
    childCustomEventsRegister = null;
  }

  export function getContextDesignMode() {
    return get(context).designMode;
  }

  export function highlight(targetFloorId) {
    context.update((value) => {
      value.updateReason = "highlightFloor";
      value.targetFloorId = targetFloorId;
      return value;
    });
  }

  export function removeComponent(targetFloorId) {
    context.update((value) => {
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
        totalFloorCount: 0,
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
        console.log(
          `after addNodeById, ancestorFloorId: ${ancestorFloorId}, floorId: ${floorId}`
        );
        return value;
      });
    }
    return context;
  }

  function updateFloorState(context) {
    if (context.updateReason === "componentTreeChange") {
      console.log(`componentTreeChange, ${floorId}`);
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
      console.log(`component removed: ${floorId}`);
    } else if (context.updateReason === "loadFloorChildComponent") {
      console.log(
        `loaded floor child component: ${context.targetFloorId}, floorId: ${floorId}`
      );
    } else if (context.updateReason === "updateChildComponentId") {
      console.log(`updateChildComponentId, ${floorId}`, context.replaceIdMap);
      let newInvalidFloorId = null;
      let orgFloodId = null;
      if (context.replaceIdMap.has(floorId)) {
        newInvalidFloorId = floorId;
        orgFloodId = context.replaceIdMap.get(newInvalidFloorId);
        replaceNodeId(context.componentTreeData, newInvalidFloorId, orgFloodId);
      }
    } else if (context.updateReason === "updateTotalFloorCount") {
      console.log(`updateTotalFloorCount: ${context.totalFloorCount}`);
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
