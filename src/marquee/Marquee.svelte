<script>
  import { onMount } from "svelte";

  export let text;
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
    const width = marquee.getBoundingClientRect().width;
    animationDuration = duration || width / 100;
    marquee.style.animationDuration = `${animationDuration}s`;
    container.style.width = `${width}px`;
  }

  onMount(setAnimation);

  $: enableDebug(debug, container, marquee);
</script>

<div class="marquee-container" bind:this={container}>
  <div class="marquee" bind:this={marquee}>{text}</div>
</div>

<style>
  @keyframes marquee {
    from {
      transform: translateX(100%);
    }
    to {
      transform: translateX(-100%);
    }
  }

  .marquee-container {
    overflow: hidden;
    white-space: nowrap;
  }

  .marquee {
    display: inline-block;
    animation-name: marquee;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
    animation-fill-mode: forwards;
  }
</style>
