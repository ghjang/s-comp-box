<script lang="ts">
  import { MenuItem, CustomElement, AvailableContainer } from "./types";
  import Floor from "../Floor/Floor.svelte";
  import Splitter from "../Splitter/Splitter.svelte";
  import Tab from "../Tab/Tab.svelte";

  export let compJsBundleBasePath: string;
  export let customElementConfigBasePath: string;

  const configFileName = "s-custom-elements.json";

  export function getAvailableCustomContainers(
    menuItems: MenuItem[],
  ): AvailableContainer[] {
    return [
      {
        component: {
          componentClass: Splitter,
          componentClassName: "Splitter",
          customElementName: "s-splitter",
          description: "Splitter(Horizontal)",
          props: {
            orientation: "horizontal",
            component_0: {
              component: Floor,
              componentClassName: "Floor",
              props: {
                componentScriptBasePath: compJsBundleBasePath,
                menuItems,
              },
            },
            component_1: {
              component: Floor,
              componentClassName: "Floor",
              props: {
                componentScriptBasePath: compJsBundleBasePath,
                menuItems,
              },
            },
            showContentControl: false,
            showPanelResizingInfo: true,
          },
        },
      },
      {
        component: {
          componentClass: Splitter,
          componentClassName: "Splitter",
          customElementName: "s-splitter",
          description: "Splitter(Vertical)",
          props: {
            orientation: "vertical",
            component_0: {
              component: Floor,
              componentClassName: "Floor",
              props: {
                componentScriptBasePath: compJsBundleBasePath,
                menuItems,
              },
            },
            component_1: {
              component: Floor,
              componentClassName: "Floor",
              props: {
                componentScriptBasePath: compJsBundleBasePath,
                menuItems,
              },
            },
            showContentControl: false,
            showPanelResizingInfo: true,
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
                  componentScriptBasePath: compJsBundleBasePath,
                  menuItems,
                },
              },
            ],
          },
        },
      },
    ];
  }

  export async function getAvailableCustomElements(): Promise<CustomElement[]> {
    const response = await fetch(
      `${customElementConfigBasePath}/${configFileName}`,
    );
    const data: CustomElement[] = await response.json();

    let componentInfo: CustomElement[] = [
      {
        customElementName: "s-floor",
        description: "Floor",
        componentClass: Floor,
        componentClassName: "Floor",
        props: {},
      },
      {
        customElementName: "s-splitter",
        description: "Splitter",
        componentClass: Splitter,
        componentClassName: "Splitter",
        props: {},
      },
      {
        customElementName: "s-tab",
        description: "Tab",
        componentClass: Tab,
        componentClassName: "Tab",
        props: {
          tabs: [{ label: "New Tab" }],
        },
      },
    ];

    return [...componentInfo, ...data];
  }
</script>
