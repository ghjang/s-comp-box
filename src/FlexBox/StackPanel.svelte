<svelte:options customElement="s-stack-panel" />

<script>
  // NOTE: 'FlexBox' wrapper이다. 'display: flex'를 이해하는게 쉽지 않다.
  //       주로 이용하는 'flex' 패턴에 대해서 좀더 단순한 형태로 작성되었다.

  import FlexBox from "./FlexBox.svelte";

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

  function mapAlignProps(hAlign, vAlign) {
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
      justifyContent = alignMap[vAlign];
      alignItems = alignMap[hAlign];
    } else if (direction === "horizontal") {
      if (!alignMap[hAlign] || !alignMap[vAlign]) {
        throw new Error(`Unsupported align value for '${direction}' direction`);
      }
      flexDirection = "row";
      justifyContent = alignMap[hAlign];
      alignItems = alignMap[vAlign];
    } else {
      throw new Error(`Unsupported direction: '${direction}'`);
    }
  }

  $: mapAlignProps(hAlign, vAlign);
</script>

<FlexBox
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
