<script>
  import { createEventDispatcher, onDestroy } from "svelte";
  import { get } from "svelte/store";
  import { CustomEventsRegister } from "../common/customEvents.js";
  import {
    restoreUnserializableProperties as restoreComponentClass,
    removeUnserializableProperties as cleanProps,
  } from "../common/serialization.js";
  import { FloorContext } from "./context.js";
  import {
    loadFloor,
    loadDescendentFloor,
    saveFloor,
    swapFloorData,
    updateMenuItemsInProps,
  } from "./persistency.js";

  const dispatch = createEventDispatcher();

  export let floorLevel = -1;
  export let floorId = null;
  export let ancestorFloorId = null;
  export let designMode = false;

  export let componentScriptBasePath;
  export let childComponentInfo = null;
  export let menuItems = [];

  const contextName = "floor-context";
  const getContextInitOptions = () => ({
    floorLevel,
    floorId,
    ancestorFloorId,
    dispatch,
    setChildComponentInfo: (info) => (childComponentInfo = info),
  });

  let context;

  let childComponent;
  let childCustomEventsRegister;

  $: if (floorLevel >= 0) {
    const opts = getContextInitOptions();
    context = new FloorContext(contextName, opts);
  }

  $: floorLevel >= 0 && context?.updateDesignMode(designMode);

  $: if (childComponentInfo) {
    setChildComponentInfo();
  } else {
    clearChildComponentTreeData();
  }

  $: if (floorLevel >= 0 && componentScriptBasePath) {
    loadChildComponentInfo();
  }

  $: if (childComponent) {
    registerCustomEvents();
  } else {
    childCustomEventsRegister?.unregister();
    childCustomEventsRegister = null;
  }

  export const getContextDesignMode = () => context?.getContextDesignMode();

  export function getChildComponentInfo() {
    return {
      floorId,
      childComponentInfo,
    };
  }

  export const highlight = (targetFloorId) => context?.highlight(targetFloorId);
  export const removeComponent = (targetFloorId) =>
    context?.removeComponent(targetFloorId);

  function registerCustomEvents() {
    childCustomEventsRegister = new CustomEventsRegister(
      dispatch,
      childComponent,
      (eventName, bubble) => {
        if (eventName === "splitterOrientationChanged") {
          context.clearReplaceIdMap();

          const detail = bubble.forwardingDetail;
          childComponentInfo.props.orientation = detail.orientation;
          childComponentInfo = { ...childComponentInfo };
        } else if (eventName === "splitterPanelSwapped") {
          context.clearReplaceIdMap();

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
    context?.updateChildComponentTreeData(childComponentInfo);

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

  function clearChildComponentTreeData() {
    context?.clearChildComponentTreeData();
  }

  async function loadChildComponentInfo() {
    if (floorLevel === 0) {
      const floorData = await loadFloor(floorId);
      if (floorData) {
        restoreComponentClass(floorData, componentScriptBasePath).then(
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
      const newInvalidFloorId = floorId;
      const orgFloodId = floorData.floorId;
      context?.updateInvalidFloorIdInfo(newInvalidFloorId, orgFloodId);
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

  onDestroy(() => context?.dispose());
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
