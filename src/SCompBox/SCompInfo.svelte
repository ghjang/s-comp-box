<script>
  import Marquee from "../Marquee/Marquee.svelte";
  import Splitter from "../Splitter/Splitter.svelte";
  import Floor from "../Floor/Floor.svelte";

  /*
   * FIXME: 'lodash-es' 패키지를 설치하고 '_.cloneDeep()' 함수를 사용해 '코드 중복'을
   *        제거 시도했지만, 'Splitter, Floor'등의 '생성자 함수'등을 제대로 딥카피
   *        하지 못하는 것인지 제대로 동작하지 않음.
   */
  export function getAvailableCustomContainers(menuItems) {
    return [
      {
        customElementName: "s-splitter",
        description: "Horizontal Splitter",
        componentClass: Splitter,
        props: {
          orientation: "horizontal",
          component_0: {
            component: Floor,
            props: {
              menuItems,
            },
          },
          component_1: {
            component: Floor,
            props: {
              menuItems,
            },
          },
        },
      },
      {
        customElementName: "s-splitter",
        description: "Vertical Splitter",
        componentClass: Splitter,
        props: {
          orientation: "vertical",
          component_0: {
            component: Floor,
            props: {
              menuItems,
            },
          },
          component_1: {
            component: Floor,
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
        componentClass: Marquee,
        props: {},
      },

      // NOTE: 'PyRun'의 경우 's-pyrun' 커스텀 엘리먼트를 사용하도록 함.
      //       'PyRun.svelte' 컴포넌트의 '컴파일 타임' 의존성을 제거해
      //       '빌드 실패, 빌드 시간' 문제를 해결하기 위함.
      {
        customElementName: "s-pyrun",
        componentName: "PyRun",
        description: "PyRun",
        props: {},
      },
    ];
  }
</script>
