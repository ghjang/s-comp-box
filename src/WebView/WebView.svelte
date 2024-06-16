<svelte:options accessors />

<script>
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let url = "";

  let iframe;

  export function getContentWindow() {
    return iframe.contentWindow;
  }

  // TODO: iframe에 로딩되는 웹 페이지와의 '통신'을 위한 방법 정의
  //
  // - 'same origin'에 있는 경우, iframe의 'contentWindow'를 통해 DOM에 직접 접근 가능하다고 함.
  // - 'cross origin'에 있는 경우(== same origin에 있지 않은 경우), 'postMessage'를 통해 메시지를 주고받아야 한다고 함.
</script>

<iframe
  bind:this={iframe}
  src={url ?? "about:blank"}
  title=""
  on:load={() => dispatch("webPageLoaded")}
/>

<style>
  iframe {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    border: none;
  }
</style>
