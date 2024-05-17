<script>
  import Marquee from "../Marquee/Marquee.svelte";
  import PyRun from "../PyRun/PyRun.svelte";
  import Splitter from "../Splitter/Splitter.svelte";
  import FloorBox from "../FloorBox/FloorBox.svelte";

  /*
   * FIXME: 'lodash-es' 패키지를 설치하고 '_.cloneDeep()' 함수를 사용해 '코드 중복'을
   *        제거 시도했지만, 'Splitter, FloorBox'등의 '생성자 함수'등을 제대로 딥카피
   *        하지 못하는 것인지 제대로 동작하지 않음.
   */
  export function getAvailableCustomContainers(menuItems) {
    return [
      {
        customElementName: "s-splitter",
        description: "Horizontal Splitter",
        constructor: Splitter,
        props: {
          orientation: "horizontal",
          component_0: {
            component: FloorBox,
            props: {
              menuItems,
            },
          },
          component_1: {
            component: FloorBox,
            props: {
              menuItems,
            },
          },
        },
      },
      {
        customElementName: "s-splitter",
        description: "Vertical Splitter",
        constructor: Splitter,
        props: {
          orientation: "vertical",
          component_0: {
            component: FloorBox,
            props: {
              menuItems,
            },
          },
          component_1: {
            component: FloorBox,
            props: {
              menuItems,
            },
          },
        },
      },
    ];
  }

  export function getAvailableCustomElements() {
    return [
      {
        customElementName: "s-marquee",
        description: "Marquee",
        constructor: Marquee,
        props: {
        },
      },
      {
        description: "PyRun",
        constructor: PyRun,
        props: {
        },
      },
    ];
  }
</script>
