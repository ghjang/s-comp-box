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

    sCompInfo.getAvailableCustomElements().then((customElements) => {
      const items = [...customContainers, divider, ...customElements];

      items.forEach((item) => {
        if (item.divider) {
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

      // NOTE: 다음 코드는 잘못된 스벨트 '반응성 블럭' 예로 남겨둔다.
      //       이 문맥에서 다음 코드는 이 반응성 블럭을 무한 루프에 빠드리게 한다.
      //menuItems = [...menuItems];
    });
  }
</script>

<SCompInfo bind:this={sCompInfo} />

<Floor {menuItems} />
