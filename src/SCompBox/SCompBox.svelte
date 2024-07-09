<svelte:options customElement="s-comp-box" />

<script>
  import { loadScript, loadClassFromModule } from "../common/util.js";
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

    sCompInfo
      .getAvailableCustomElements()
      .then((customElements) => {
        return loadCustomElementsInfo(customContainers, customElements);
      })
      .then((_menuItems) => {
        menuItems = _menuItems;
      })
      .catch((error) => {
        console.error("Failed to load custom elements info: ", error);
      });
  }

  // FIXME: 현재 '탑 레벨' 메뉴에서만 '컴포넌트 설정'이 있는 것을 가정하고 있다.
  async function loadCustomElementsInfo(customContainers, customElements) {
    const divider = { divider: { style: "" } };
    const items = [...customContainers, divider, ...customElements];
    const _menuItems = [];

    for (const item of items) {
      if (item.divider || item.link || item.popup || item.subMenu) {
        _menuItems.push(item);
      } else if (item.component) {
        const comp = item.component;
        let props = comp.props || {};

        const constructorName = comp.componentClass
          ? comp.componentClass.name
          : null;
        if (constructorName && compProps[constructorName]) {
          // 설정에서 직접 '컴포넌트 클래스'를 지정한 경우

          // 사용자 설정이 존재할 경우에 사용자 설정으로 오버라이드
          props = { ...props, ...compProps[constructorName] };

          // 'normal'로 번들링된 컴포넌트
          if (compJsBundleBasePath) {
            const scriptPath = `${compJsBundleBasePath}/${constructorName}.js`;
            await loadScript(scriptPath);
          }
        } else if (comp.name && compProps[comp.name]) {
          // '컴포넌트 문자열 이름'으로 설정한 경우

          // 사용자 설정이 존재할 경우에 사용자 설정으로 오버라이드
          props = { ...props, ...compProps[comp.name] };

          // 'custom'으로 번들링된 컴포넌트
          if (customCompJsBundleBasePath) {
            let scriptPath = `${customCompJsBundleBasePath}/${comp.name}.custom.js`;
            try {
              await loadScript(scriptPath);
            } catch (error) {
              console.warn(
                `failed to load the custom component script: ${scriptPath}, error: `,
                error
              );

              // 'custom'으로 번들링된 컴포넌트가 없을 경우 'normal'로 번들링된 컴포넌트 시도
              if (compJsBundleBasePath) {
                scriptPath = `${compJsBundleBasePath}/${comp.name}.js`;
                await loadScript(scriptPath);
                comp.componentClass = await loadClassFromModule(
                  scriptPath,
                  comp.name
                );
              }
            }
          }
        } else {
          // Do nothing
        }

        if (!comp.componentClass && !comp.customElementName) {
          console.error(
            "No proper component class or custom element name: ",
            comp
          );
          throw new Error(
            "No proper component class or custom element name: ",
            comp
          );
        }

        _menuItems.push({
          action: {
            text: comp.description,
            handler: () => {
              return {
                componentClass: comp.componentClass,
                customElementName: comp.customElementName,
                props,
              };
            },
          },
        });
      }
    }

    return _menuItems;
  }
</script>

<SCompInfo bind:this={sCompInfo} {customElementConfigBasePath} />

<Floor {menuItems} />
