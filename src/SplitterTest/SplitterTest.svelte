<script>
  import Splitter from "../Splitter/Splitter.svelte";
  import Marquee from "../Marquee/Marquee.svelte";

  export let orientation = "horizontal";

  const component_0 = {
    component: Marquee,
    props: {
      text: "Component 0",
    },
  };

  const component_1 = {
    component: Marquee,
    props: {
      text: "Component 1",
    },
  };
</script>

<Splitter {orientation} {component_0} {component_1} />
