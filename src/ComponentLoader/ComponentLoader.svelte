<script>
  import ComponentMap from "./ComponentMap.svelte";

  export function getRegisteredComponent(componentName) {
    if (!compMap) {
      throw new Error("ComponentMap is not initialized.");
    }

    return compMap.getRegisteredComponent(componentName);
  }

  export async function load(componentName) {
    if (!compMap) {
      throw new Error("ComponentMap is not initialized.");
    }

    let componentClass = compMap.getRegisteredComponent(componentName);

    if (componentClass) {
      return componentClass;
    }

    const baseUrl = new URL(import.meta.url);
    const targetComponentBundle = baseUrl.pathname.replace(
      "ComponentLoader.js",
      `${componentName}.js`
    );

    const componentModule = await import(targetComponentBundle);
    componentClass = componentModule.default;
    compMap.registerComponent(componentName, componentClass);

    return componentClass;
  }

  export async function loadAll(items) {
    if (!items || items.length <= 0) {
      return [];
    }

    let loadTargetComponentNames = [
      ...new Set(
        items
          .filter((item) => typeof item.component === "string")
          .map((item) => item.component)
      ),
    ];

    loadTargetComponentNames = loadTargetComponentNames.filter(
      (componentName) => !getRegisteredComponent(componentName)
    );

    if (loadTargetComponentNames.length <= 0) {
      return [];
    }

    return Promise.all(
      loadTargetComponentNames.map(async (componentName) => {
        return await load(componentName);
      })
    );
  }

  let compMap;
</script>

<ComponentMap bind:this={compMap} />
