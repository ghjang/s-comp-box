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

  // FIXME: 현재 '탑 레벨' 메뉴에서만 컴포넌트 설정이 있는 것을 가정하고 있다.
  function loadCustomElementsInfo(customContainers, customElements) {
    const divider = { divider: { style: "" } };
    const items = [...customContainers, divider, ...customElements];

    items.forEach((item) => {
      if (item.divider || item.link || item.popup || item.subMenu) {
        menuItems.push(item);
      } else if (item.component) {
        const comp = item.component;
        let props = comp.props || {};

        const constructorName = comp.componentClass
          ? comp.componentClass.name
          : null;
        if (constructorName && compProps[constructorName]) {
          props = { ...props, ...compProps[constructorName] };
        } else if (comp.name && compProps[comp.name]) {
          props = { ...props, ...compProps[comp.name] };
        }

        menuItems.push({
          action: {
            text: comp.description,
            handler: () => {
              return {
                customElementName: comp.customElementName,
                componentClass: comp.componentClass,
                props,
              };
            },
          },
        });
      } else {
        // Do nothing
      }
    });
  }
</script>

<SCompInfo bind:this={sCompInfo} {customElementConfigBasePath} />

<Floor {menuItems} />
