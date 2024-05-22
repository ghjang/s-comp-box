<script>
  import { onMount, createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let title = "";
  export let content = "";
  export let buttons = [{ text: "OK", value: "ok" }];
  export let background = "white";

  let buttonRefs = [];

  if (content) {
    content = content.replace(/\n/g, "<br>");
  }

  onMount(() => {
    if (buttonRefs[0]) {
      buttonRefs[0].focus();
    }
  });

  function handleButtonClick(btn) {
    dispatch("buttonClicked", btn);
  }

  function handleKeydown(event) {
    if (event.key === "Escape") {
      handleButtonClick({ text: "esc", value: "cancel" });
    }
  }
</script>

<div class="popup-container">
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
  <div
    class="popup"
    style:background
    tabindex="0"
    on:focus={(_) => buttonRefs[0]?.focus()}
    on:keydown|stopPropagation={handleKeydown}
  >
    <div class="title">{title}</div>
    <div class="content">{@html content}</div>
    <div class="button-group">
      {#each buttons as btn, i}
        <button
          bind:this={buttonRefs[i]}
          on:click={(_) => handleButtonClick(btn)}
        >
          {btn.text}
        </button>
      {/each}
    </div>
  </div>
</div>

<style lang="scss">
  .popup-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.1);
    pointer-events: none;
    user-select: none;

    & .popup {
      position: fixed;
      top: 30%;
      left: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 5px 10px;
      border: 1px solid black;
      border-radius: 2px;
      box-shadow: 0 0 3px rgba(0, 0, 0, 0.5);
      font-family: Arial, Helvetica, sans-serif;
      pointer-events: auto;
      
      & .title {
        width: 100%;
        text-align: left;
        font-weight: bold;
      }
      
      & .content {
        width: 100%;
        margin: 10px 5px;
        font-size: 0.7em;
        text-align: left;
      }

      & .button-group {
        width: 100%;
        display: flex;
        justify-content: flex-end;

        & button:not(:last-child) {
          margin-right: 5px;
        }
      }
    }
  }
</style>
