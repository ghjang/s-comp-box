<svelte:options customElement="s-marquee" />

<script>
  import { onMount, onDestroy } from "svelte";

  export let text = "";
  export let direction = "rtl";
  export let duration = 3;
  export let debug = false;

  let container;
  let marquee;
  let animationDuration;

  let observer;

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

  onMount(() => {
    const { width, height } = marquee.getBoundingClientRect();
    if (width > 0 && height > 0) {
      setAnimation();
    } else {
      observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setAnimation();
          observer.disconnect();
          observer = null;
        }
      });
      observer.observe(container);
    }
  });

  onDestroy(() => observer?.disconnect());

  $: enableDebug(debug, container, marquee);
</script>

<div class="marquee-wrapper" bind:this={container}>
  <div
    bind:this={marquee}
    class:marquee-rtl={direction === "rtl"}
    class:marquee-ltr={direction === "ltr"}
    class:marquee-ttb={direction === "ttb"}
    class:marquee-btt={direction === "btt"}
  >
    {#if text}
      {text}
    {:else}
      <slot />
    {/if}
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

  .marquee-wrapper {
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
