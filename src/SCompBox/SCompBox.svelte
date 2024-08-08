<script>
  import { onMount, onDestroy } from "svelte";
  import {
    fileExists,
    loadScript,
    loadClassFromModule,
  } from "../common/util.js";
  import SCompInfo from "./SCompInfo.svelte";
  import Floor from "../Floor/Floor.svelte";

  export let compProps = {};
  export let customElementConfigBasePath;

  export let compJsBundleBasePath;
  export let customCompJsBundleBasePath;

  let menuItems = [];
  let designMode = true;
  let isMenuItemsLoaded = false;

  let sCompInfo;

  $: if (sCompInfo) {
    // NOTE; 아래 비동기 코드에서 채워질 'menuItems' 배열 참조를 넘긴다.
    //       '커스텀 컨테이너'의 내부에서 로딩된 '커스텀 엘리먼트'를 참조하기 위함이다.
    const customContainers = sCompInfo.getAvailableCustomContainers(menuItems);

    sCompInfo
      .getAvailableCustomElements()
      .then((customElements) => {
        return loadCustomElementsInfo(customContainers, customElements);
      })
      .then((_menuItems) => {
        // NOTE: 이 '반응형 블럭'과 다른 '비동기 실행 컨텍스트'에 있는
        //       이 대입문의 실행은 결과적으로 이 반응형 블럭을 '무한 루프'에 빠뜨린다.
        //       'menuItems'는 이 반응형 블럭 실행 의존성에 포함되어 있다.
        //menuItems = _menuItems;

        // NOTE: 'length' 속성을 설정하는 것은 menuItems 배열 자체를 수정한 것으로
        //       취급되기 때문에 역시 이 반응형 블럭을 재트리거하게해 '무한 루프'로 만든다.
        //       이 빈응형 블럭은 초기에 '빈 배열'인 상태에서 실행되기 때문에
        //       현재 구현에서 명시적으로 'length'를 설정해주지 않아도 문제 없다.
        //menuItems.length = 0;

        // NOTE: 'push' 메소드 호출은 '객체의 변경'으로 취급되지 않아 이 반응형 블럭을
        //       재트리거하지 않는다. 결과적으로 '무한 루프'에 빠지지 않는다.
        //
        //       '무한 루프'를 회피하는 또다른 방법은 아예 이 반응형 블럭을 별도의 함수로
        //       분리하고 오직 'sCompInfo' 객체에 대해서만 반응형 블럭의 '의존성 변수'로
        //       설정하게하는 것이다. 다음과 같이 할 수도 있겠다:
        //
        //       function updateMenuItems() {
        //         // ... 'sCompInfo, menuItems'를 사용한 코드
        //       }
        //
        //       // 'sCompInfo' 객체에 대해서만 반응형 블럭의 '의존성 변수'로 설정
        //       $: sCompInfo && updateMenuItems();
        //
        //       일단 학습 목적의 코드이므로 이 방법을 적용하지 않고 주석내용으로 기록한다.
        menuItems.push(..._menuItems);

        isMenuItemsLoaded = true;
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

        if (comp.componentClass || comp.componentClassName) {
          // 설정에서 직접 '컴포넌트 클래스 생성자'나 '컴포넌트 이름 문자열' 지정한 경우

          // NOTE: 'comp.componentClass.name'은 사용할 수 없다.
          //       릴리즈 빌드의 '번들링 최적화' 과정에서 '클래스 이름이 축소 변경'될 수 있기 때문이다.
          //       해서 명시적으로 'componentClassName'을 추가적으로 설정하도록 한다.
          const orgCompName = comp.componentClassName;

          // 사용자 설정이 존재할 경우에 사용자 설정으로 오버라이드
          if (compProps[orgCompName]) {
            props = { ...props, ...compProps[orgCompName] };
          }

          // 'normal'로 번들링된 컴포넌트
          if (compJsBundleBasePath) {
            const scriptPath = `${compJsBundleBasePath}/${orgCompName}.js`;
            await loadScript(scriptPath);
            if (!comp.componentClass) {
              comp.componentClass = await loadClassFromModule(
                scriptPath,
                orgCompName
              );
            }
          }
        } else if (comp.name) {
          // '컴포넌트 문자열 이름'으로 설정한 경우

          // 사용자 설정이 존재할 경우에 사용자 설정으로 오버라이드
          if (compProps[comp.name]) {
            props = { ...props, ...compProps[comp.name] };
          }

          // 'custom'으로 번들링된 컴포넌트
          if (customCompJsBundleBasePath) {
            let scriptPath = `${customCompJsBundleBasePath}/${comp.name}.custom.js`;
            let foundFile = await fileExists(scriptPath);

            if (foundFile) {
              try {
                await loadScript(scriptPath);
              } catch (error) {
                console.warn(
                  `failed to load the custom component script: ${scriptPath}, error: `,
                  error
                );
              }
            } else {
              // 'custom'으로 번들링된 컴포넌트가 없을 경우 'normal'로 번들링된 컴포넌트 시도
              if (compJsBundleBasePath) {
                scriptPath = `${compJsBundleBasePath}/${comp.name}.js`;
                foundFile = await fileExists(scriptPath);

                if (foundFile) {
                  await loadScript(scriptPath);
                  comp.componentClass = await loadClassFromModule(
                    scriptPath,
                    comp.name
                  );
                }
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
                componentClassName: comp.componentClassName,
                customElementName: comp.customElementName,
                componentNodeName: comp.description,
                props,
              };
            },
          },
        });
      }
    }

    return _menuItems;
  }

  function handleKeyDown(event) {
    if (
      event.ctrlKey &&
      event.metaKey &&
      event.shiftKey &&
      event.code === "KeyD"
    ) {
      event.preventDefault();
      designMode = !designMode;

      const settings = loadSettings();
      settings.designMode = designMode;
      saveSettings(settings);
    }
  }

  function loadSettings() {
    const settings = localStorage.getItem("SCompBox_settings");
    return settings ? JSON.parse(settings) : {};
  }

  function saveSettings(settings) {
    localStorage.setItem("SCompBox_settings", JSON.stringify(settings));
  }

  function restoreSettings() {
    const settings = loadSettings();

    if (settings.designMode !== undefined) {
      designMode = settings.designMode;
    } else {
      settings.designMode = designMode;
    }
    
    saveSettings(settings);
  }

  onMount(() => {
    document.addEventListener("keydown", handleKeyDown);
    restoreSettings();
  });
  onDestroy(() => {
    document.removeEventListener("keydown", handleKeyDown);
  });
</script>

<SCompInfo
  bind:this={sCompInfo}
  {customElementConfigBasePath}
  {compJsBundleBasePath}
/>

{#if isMenuItemsLoaded}
  <Floor
    {menuItems}
    {designMode}
    componentScriptBasePath={compJsBundleBasePath}
  />
{:else}
  <div>Loading...</div>
{/if}
