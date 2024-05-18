<svelte:options customElement="s-comp-box" />

<script>
  import SCompInfo from "./SCompInfo.svelte";
  import Floor from "../Floor/Floor.svelte";

  export let compProps = {};

  let menuItems = [];

  let sCompInfo;

  $: if (sCompInfo) {
    const divider = { divider: { style: "" } };
    const customContainers = sCompInfo.getAvailableCustomContainers(menuItems);
    const customElements = sCompInfo.getAvailableCustomElements();
    const items = [...customContainers, divider, ...customElements];

    items.forEach((item) => {
      if (item.divider) {
        menuItems.push(item);
      } else {
        let props = item.props || {};
        const constructorName = item.constructor ? item.constructor.name : null;
        if (constructorName && compProps[constructorName]) {
          props = { ...props, ...compProps[constructorName] };
        }

        menuItems.push({
          text: item.description,
          handler: () => {
            return {
              name: item.customElementName,
              constructor: item.constructor,
              props,
            };
          },
        });
      }
    });
  }
</script>

<SCompInfo bind:this={sCompInfo} />

<Floor {menuItems} />
