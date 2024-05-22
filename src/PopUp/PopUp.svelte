<script>
  import { createEventDispatcher, onMount } from "svelte";
  import { trapFocus } from "../common/action/trapFocus.js";

  const dispatch = createEventDispatcher();

  export let title = "";
  export let content = "";
  export let buttons = [{ text: "OK", value: "ok" }];
  export let background = "white";

  let buttonRefs = [];
  let lastFocusedButton = null;

  if (content) {
    content = content.replace(/\n/g, "<br>");
  }

  onMount(() => {
    if (buttonRefs[0]) {
      buttonRefs[0].focus();
      lastFocusedButton = buttonRefs[0];
    }
  });

  function handleButtonClick(btn) {
    dispatch("buttonClicked", btn);
  }

  function handleKeydown(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      handleButtonClick({ text: "esc", value: "cancel" });
    }
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
  class="popup-container"
  on:contextmenu|preventDefault|stopPropagation={lastFocusedButton?.focus()}
  on:click|preventDefault|stopPropagation={lastFocusedButton?.focus()}
  on:dblclick|preventDefault|stopPropagation={lastFocusedButton?.focus()}
>
  <div
    class="popup"
    style:background
    on:keydown|stopPropagation={handleKeydown}
  >
    <div class="title">{title}</div>
    <div class="content">{@html content}</div>
    <div class="button-group" use:trapFocus>
      {#each buttons as btn, i}
        <!--
            NOTE: tabindex 값에 '9999'를 사용한 것은 'Monaco Editor' 등의 입력을
                  받을 수 있는 컴포넌트가 '팝업' 아래에 있을 경우 '웹 브라우저 주소줄'을 사용자가
                  선택후 'Tab'을 눌렀을 때 '팝업' 내에 있는 요소에 포커스가 가는 것이 아니라
                  팝업 요소 레이어 아래에 있는 요소로 포커스가 이동하는 것을 방지하기 위함이다.

                  FIXME: 'Shift + Tab'의 경우에는 여전히 'Monaco Editor'로 포커스가
                         이동할 수 있다. 'Floor'나 'PyRun'쪽에서 뭔가 workaround 처리를
                        해야할 것으로 보인다(?).

            NOTE: 주소줄을 선택후 'Tab'과 'Shift + Tab'의 동작이 '크롬'과 '사파리'가 다르다.
         -->
        <!-- svelte-ignore a11y-positive-tabindex -->
        <button
          bind:this={buttonRefs[i]}
          tabindex="9999"
          on:focus={() => (lastFocusedButton = buttonRefs[i])}
          on:click={() => handleButtonClick(btn)}
        >
          {btn.text}
        </button>
      {/each}
    </div>
  </div>
</div>

<style lang="scss">
  /* NOTE: 'pointer-events: none;'을 적용하면 해당 div에 대해서 마우스 이벤트 따위가 발생하지 않고 아래에 보이는 요소로 전달된다. */
  .popup-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.4);
    z-index: 9999;
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
        user-select: text;
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
