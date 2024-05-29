<svelte:options customElement="s-comp-box" />

<script>
  import SCompInfo from "./SCompInfo.svelte";
  import Floor from "../Floor/Floor.svelte";

  export let compProps = {};
  export let customElementConfigBasePath;

  export let compJsBundleBasePath;
  export let customCompJsBundleBasePath;

  let menuItems = [];

  let sCompInfo;

  $: if (sCompInfo) {
    const customContainers = sCompInfo.getAvailableCustomContainers(menuItems);

    sCompInfo.getAvailableCustomElements().then((customElements) => {
      loadCustomElementsInfo(customContainers, customElements);
    });
  }

  // FIXME: 현재 '탑 레벨' 메뉴에서만 '컴포넌트 설정'이 있는 것을 가정하고 있다.
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

          // 'normal'로 번들링된 컴포넌트
          if (compJsBundleBasePath) {
            const scriptPath = `${compJsBundleBasePath}/${constructorName}.js`;
            loadComponentScript(scriptPath);
          }
        } else if (comp.name && compProps[comp.name]) {
          props = { ...props, ...compProps[comp.name] };

          // 'custom'으로 번들링된 컴포넌트
          if (customCompJsBundleBasePath) {
            const scriptPath = `${customCompJsBundleBasePath}/${comp.name}.custom.js`;
            loadComponentScript(scriptPath);
          }
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

  function loadComponentScript(scriptPath) {
    const scriptElem = document.createElement("script");
    scriptElem.type = "module";
    scriptElem.src = scriptPath;
    document.head.appendChild(scriptElem);
  }
</script>

<SCompInfo bind:this={sCompInfo} {customElementConfigBasePath} />

<Floor {menuItems} />
