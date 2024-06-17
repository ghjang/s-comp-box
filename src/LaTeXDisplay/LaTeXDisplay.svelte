<script>
  import { onMount } from "svelte";

  import ExprAnimator from "./modules/expr_animator.js";
  import { Triggers } from "./modules/animation/trigger/Triggers.js";

  export let mathJaxUrl = "";
  export let resourceUrl = "";
  export let singleLineMode = true;
  export let verticalInnerMargin = "20px";
  export let fontSize = "3em";
  export let animationDuration = "500";
  export let trigger = "default";
  export let debug = "true";

  let exprContainer;

  onMount(async () => {
    window.MathJax = {
      svg: {
        fontCache: "global",
      },
    };

    await import(mathJaxUrl);

    const triggerArg = Triggers[trigger];
    const animator = ExprAnimator.create(exprContainer, triggerArg);
    animator.debug = debug;

    const opts = {
      resourceUrl,
      singleLineMode,
      verticalInnerMargin,
      fontSize,
      animationDuration,
      debug,
    };

    await animator.run(resourceUrl, opts);
  });
</script>

<div bind:this={exprContainer} id="exprContainer"></div>

<style>
  #exprContainer {
    position: relative;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 3em;
  }

  mjx-container {
    display: block;
    text-align: center;
    margin: 15px auto;
  }

  mjx-assistive-mml {
    display: none;
  }

  #exprContainer mjx-container:first-of-type {
    margin-top: 0;
  }

  #exprContainer mjx-container:last-of-type {
    margin-bottom: 0;
  }
</style>
