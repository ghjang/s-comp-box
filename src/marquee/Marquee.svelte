<script>
  import { onMount } from "svelte";

  export let text;
  export let direction = "rtl";
  export let duration;
  export let debug;

  let container;
  let marquee;
  let animationDuration;

  function enableDebug(debug, container, marquee) {
    container && (container.style.border = debug ? "1px solid black" : "");
    marquee && (marquee.style.border = debug ? "1px solid red" : "");
  }

  function setAnimation() {
    const { width, height } = marquee.getBoundingClientRect();
    container.style.width = `${width}px`;
    container.style.height = `${height}px`;

    animationDuration = duration || width / 100;
    marquee.style.animationDuration = `${animationDuration}s`;
  }

  onMount(setAnimation);

  $: enableDebug(debug, container, marquee);
</script>

<div class="marquee-container" bind:this={container}>
  <div
    bind:this={marquee}
    class:marquee-rtl={direction === "rtl"}
    class:marquee-ltr={direction === "ltr"}
  >
    {text}
  </div>
</div>

<style>
  @keyframes marquee-rtl {
    from {
      transform: translateX(100%);
    }
    to {
      transform: translateX(-100%);
    }
  }

  @keyframes marquee-ltr {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(100%);
    }
  }

  .marquee-container {
    overflow: hidden;
    white-space: nowrap;
  }

  .marquee-rtl {
    display: inline-block;
    animation-name: marquee-rtl;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
    animation-fill-mode: forwards;
  }

  .marquee-ltr {
    display: inline-block;
    animation-name: marquee-ltr;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
    animation-fill-mode: forwards;
  }
</style>
