<svelte:options customElement="s-comp-box" />

<script>
  import SCompInfo from "./SCompInfo.svelte";
  import Floor from "../Floor/Floor.svelte";

  export let compProps = {};
  export let customElementConfigBasePath;

  let menuItems = [];

  let sCompInfo;

  $: if (sCompInfo) {
    const customContainers = sCompInfo.getAvailableCustomContainers(menuItems);

    sCompInfo.getAvailableCustomElements().then((customElements) => {
      loadCustomElementsInfo(customContainers, customElements);
    });
  }

  function loadCustomElementsInfo(customContainers, customElements) {
    const divider = { divider: { style: "" } };
    const items = [...customContainers, divider, ...customElements];

    items.forEach((item) => {
      if (item.divider || item.link) {
        menuItems.push(item);
      } else {
        let props = item.props || {};

        const constructorName = item.componentClass
          ? item.componentClass.name
          : null;
        if (constructorName && compProps[constructorName]) {
          props = { ...props, ...compProps[constructorName] };
        } else if (item.componentName && compProps[item.componentName]) {
          props = { ...props, ...compProps[item.componentName] };
        }

        menuItems.push({
          text: item.description,
          handler: () => {
            return {
              customElementName: item.customElementName,
              componentClass: item.componentClass,
              props,
            };
          },
        });
      }
    });
  }
</script>

<SCompInfo bind:this={sCompInfo} {customElementConfigBasePath} />

<Floor {menuItems} />
