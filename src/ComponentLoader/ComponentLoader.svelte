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

  let compMap;
</script>

<ComponentMap bind:this={compMap} />
