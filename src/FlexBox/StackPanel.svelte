<svelte:options customElement="s-stack-panel" />

<script>
  // NOTE: 'FlexBox' wrapper이다. 'display: flex'를 이해하는게 쉽지 않다.
  //       주로 이용하는 'flex' 패턴에 대해서 좀더 단순한 형태로 작성되었다.

  import { createEventDispatcher } from "svelte";
  import FlexBox from "./FlexBox.svelte";

  const dispatch = createEventDispatcher();

  export let direction = "vertical";
  export let reverse = false;
  export let hAlign = "center";
  export let vAlign = "top";

  let flexDirection;
  let justifyContent;
  let alignItems;

  export let enableTrapFocus = false;

  export let defaultItemProps = {};
  export let items = [];

  export let autoRegisterCustomEventsFromItemProps = true;
  export const customEvents = [];

  export function clearRegisteredCustomEvents() {
    unregisterEventHandlers.forEach((unregister) => unregister());
    unregisterEventHandlers = [];
  }

  let unregisterEventHandlers = [];

  function registerCustomEventsFrom(flexBox) {
    customEvents.length = 0;
    customEvents.push(...flexBox.customEvents);

    customEvents.forEach((eventName) => {
      const unregister = flexBox.$on(eventName, (event) => {
        dispatch(eventName, event.detail);
      });
      unregisterEventHandlers.push(unregister);
    });
  }

  function reverseFlexAlign(align) {
    switch (align) {
      case "flex-start":
        return "flex-end";
      case "center":
        return "center";
      case "flex-end":
        return "flex-start";
      default:
        throw new Error(`Unsupported align value: '${align}'`);
    }
  }

  function mapAlignProps(direction, hAlign, vAlign) {
    const alignMap = {
      top: "flex-start",
      middle: "center",
      bottom: "flex-end",
      left: "flex-start",
      center: "center",
      right: "flex-end",
    };

    if (direction === "vertical") {
      if (!alignMap[vAlign] || !alignMap[hAlign]) {
        throw new Error(`Unsupported align value for '${direction}' direction`);
      }
      flexDirection = "column";
      justifyContent = reverse
        ? reverseFlexAlign(alignMap[vAlign])
        : alignMap[vAlign];
      alignItems = alignMap[hAlign];
    } else if (direction === "horizontal") {
      if (!alignMap[hAlign] || !alignMap[vAlign]) {
        throw new Error(`Unsupported align value for '${direction}' direction`);
      }
      flexDirection = "row";
      justifyContent = reverse
        ? reverseFlexAlign(alignMap[hAlign])
        : alignMap[hAlign];
      alignItems = alignMap[vAlign];
    } else {
      throw new Error(`Unsupported direction: '${direction}'`);
    }
  }

  $: mapAlignProps(direction, hAlign, vAlign);

  let flexBox;

  $: if (flexBox) {
    clearRegisteredCustomEvents();
    registerCustomEventsFrom(flexBox);
  }
</script>

<FlexBox
  bind:this={flexBox}
  direction={flexDirection}
  {reverse}
  {justifyContent}
  {alignItems}
  {enableTrapFocus}
  {defaultItemProps}
  {items}
  {autoRegisterCustomEventsFromItemProps}
>
  <slot />
</FlexBox>
