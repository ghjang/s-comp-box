<script>
  import Floor from "../Floor/Floor.svelte";
  import Splitter from "../Splitter/Splitter.svelte";
  import Tab from "../Tab/Tab.svelte";

  export let customElementConfigBasePath;

  const configFileName = "s-custom-elements.json";

  // TODO: 내용이 거의 같은 설정 객체 '코드 중복' 제거
  // 'lodash-es' 패키지를 설치하고 '_.cloneDeep()' 함수를 사용해 '코드 중복'을
  // 제거 시도했지만, 'Splitter, Floor'등의 '생성자 함수'등을 제대로 딥카피
  // 하지 못하는 것인지 제대로 동작하지 않음.
  export function getAvailableCustomContainers(menuItems) {
    return [
      {
        component: {
          componentClass: Splitter,
          componentClassName: "Splitter",
          customElementName: "s-splitter",
          description: "Horizontal Splitter",
          props: {
            orientation: "horizontal",
            component_0: {
              component: Floor,
              componentClassName: "Floor",
              props: {
                menuItems,
              },
            },
            component_1: {
              component: Floor,
              componentClassName: "Floor",
              props: {
                menuItems,
              },
            },
          },
        },
      },
      {
        component: {
          componentClass: Splitter,
          componentClassName: "Splitter",
          customElementName: "s-splitter",
          description: "Vertical Splitter",
          props: {
            orientation: "vertical",
            component_0: {
              component: Floor,
              componentClassName: "Floor",
              props: {
                menuItems,
              },
            },
            component_1: {
              component: Floor,
              componentClassName: "Floor",
              props: {
                menuItems,
              },
            },
          },
        },
      },
      {
        component: {
          componentClass: Tab,
          componentClassName: "Tab",
          description: "Tab",
          props: {
            selectedTabIndex: 0,

            tabs: [
              {
                label: "Tab 1",
                component: Floor,
                componentClassName: "Floor",
                props: {
                  menuItems,
                },
              },
            ],
          },
        },
      },
    ];
  }

  /*
    NOTE:
      's-custom-elements.json' 파일에는 '커스텀 엘리먼트'의 정보가 담겨 있음.

      'PyRun'과 같이 크기가 있는 컴포넌트를 직접 참조하는 경우에 '컴파일 실패' 또는
      '컴파일 시간 느림'의 문제가 있다. '커스텀 엘리먼트'를 사용해 이런 문제를 완화시킴.

      어떤 이유에서인지 커스텀 엘리먼트를 작성할 수 없는 경우에는 직접 '스벩트 컴포넌트 클래스'를
      참조하도록 할 수도 있음.
   */
  export async function getAvailableCustomElements() {
    const response = await fetch(
      `${customElementConfigBasePath}/${configFileName}`
    );
    const data = await response.json();

    let compnentInfo = [
      // NOTE: 필요시 여기에 다음과 유사한 형태의 스벨트 컴포넌트 클래스 직접 참조 설정을 넣어줄 것.
      //       이 예시에서 'componentClass'는 스벨트 '컴포넌트 클래스'를 지정한 것임.
      /*
          {
            customElementName: "s-marquee",
            description: "Marquee",
            componentClass: Marquee,
            componentClassName: "Marquee",
            props: {},
          }
       */
    ];

    return [...compnentInfo, ...data];
  }
</script>
