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
    class:marquee-ttb={direction === "ttb"}
    class:marquee-btt={direction === "btt"}
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

  @keyframes marquee-ttb {
    from {
      transform: translateY(-100%);
    }
    to {
      transform: translateY(100%);
    }
  }

  @keyframes marquee-btt {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(-100%);
    }
  }

  .marquee-container {
    overflow: hidden;
    white-space: nowrap;
  }

  .marquee-rtl,
  .marquee-ltr,
  .marquee-ttb,
  .marquee-btt {
    display: inline-block;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
    animation-fill-mode: forwards;
  }

  .marquee-rtl {
    animation-name: marquee-rtl;
  }

  .marquee-ltr {
    animation-name: marquee-ltr;
  }

  .marquee-ttb,
  .marquee-btt {
    writing-mode: vertical-rl;
  }

  .marquee-btt {
    animation-name: marquee-btt;
  }

  .marquee-ttb {
    animation-name: marquee-ttb;
  }
</style>
