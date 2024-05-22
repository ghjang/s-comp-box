<script>
  import { createEventDispatcher, onMount } from "svelte";

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

        /*
          FIXME: 팝업이 최초에 오픈된 후에 자바스크립트로 첫번째 버튼에 포커스를 설정했을 때
                 사용자가 직접 탭으로 포커스를 주었을때랑 모양이 다름. 프고그래밍으로 포커스 설정시
                 '보안' 문제로 정책에 의해서 이렇게 처리된다고 함. ':focus'를 설정해서 최대한
                 맞춰주려고 했으나 일단 실패함.
         */

        & button:focus {
          outline: 1px solid blue;
          outline-offset: -2px;
          outline-style: dotted;
        }
      }
    }
  }
</style>
