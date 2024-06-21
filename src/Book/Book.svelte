<script>
  import { writable, derived } from "svelte/store";

  // '페이지 컨텐츠' 원본 목록
  export let pages = [];

  // '페이지 플리핑' 애메이션 관련 속성들
  export let animationDuration = "0.75s";
  export let animationTimingFunction = "ease-in";

  // 'pages'로부터 가공된 내부 구현용 페이지 컨텐츠 목록
  const leftPages = writable([]);
  const rightPages = writable([]);

  $: if (pages) {
    // '1장'이 항상 '앞/뒤' 2개 면을 가지도록 'pages'를 가공
    if (pages.length % 2 !== 0) {
      pages = [...pages, ""];
    }

    leftPages.set([]);
    rightPages.set(
      pages.map((page, index) => ({ no: index, content: page })).reverse()
    );
  }

  const leftPagePairs = derived(leftPages, ($leftPages) => {
    let pairs = [];
    for (let i = 0; i < $leftPages.length; i += 2) {
      pairs.push($leftPages.slice(i, i + 2));
    }
    return pairs;
  });

  const rightPagePairs = derived(rightPages, ($rightPages) => {
    let pairs = [];
    for (let i = 0; i < $rightPages.length; i += 2) {
      pairs.push($rightPages.slice(i, i + 2));
    }
    return pairs;
  });

  let book;
  let leftTopPageNo = -1;
  let rightTopPageNo = -1;

  async function flipPageToLeft() {
    const rightTopPagePair =
      $rightPagePairs.length > 0
        ? $rightPagePairs[$rightPagePairs.length - 1]
        : [];

    if (rightTopPagePair.length !== 2) {
      return;
    }

    rightTopPageNo = rightTopPagePair[1].no;

    const pagePairToFlip = book.querySelector(
      `.rightPageContentStack .pageContainer[data-page-no="${rightTopPageNo}"]`
    );

    if (pagePairToFlip) {
      pagePairToFlip.addEventListener(
        "animationend",
        () => {
          const frontPage = $rightPages.pop();
          const backPage = $rightPages.pop();
          leftPages.set([...$leftPages, frontPage, backPage]);
          rightPages.set([...$rightPages]);
          rightTopPageNo = -1;
          console.log("animationend", $leftPages, $rightPages);
        },
        { once: true }
      );
    }
  }

  function flipPageToRight() {
    const leftTopPagePair =
      $leftPagePairs.length > 0
        ? $leftPagePairs[$leftPagePairs.length - 1]
        : [];

    if (leftTopPagePair.length !== 2) {
      return;
    }

    leftTopPageNo = leftTopPagePair[1].no;

    const pagePairToFlip = book.querySelector(
      `.leftPageContentStack .pageContainer[data-page-no="${leftTopPageNo}"]`
    );

    if (pagePairToFlip) {
      pagePairToFlip.addEventListener(
        "animationend",
        () => {
          const backPage = $leftPages.pop();
          const frontPage = $leftPages.pop();
          rightPages.set([...$rightPages, backPage, frontPage]);
          leftPages.set([...$leftPages]);
          leftTopPageNo = -1;
        },
        { once: true }
      );
    }
  }
</script>

<div class="book" bind:this={book}>
  <div class="leftPageRegion">
    <div class="leftPageContentStack">
      {#each $leftPagePairs as pair}
        <div
          class="pageContainer"
          class:flipPageToRight={pair[1].no === leftTopPageNo}
          style:animation-duration={animationDuration}
          style:animation-timing-function={animationTimingFunction}
          data-page-no={pair[1].no}
        >
          {#each pair as page (page.no)}
            {@const pageNumber = page.no + 1}
            <div
              class="pageContent"
              class:frontPage={page.no % 2 === 1}
              class:backPage={page.no % 2 === 0}
            >
              {#if page.content.indexOf("<img") != -1}
                {@html page.content}
              {:else}
                {page.content}
              {/if}

              {#if pageNumber !== 1 && pageNumber !== pages.length}
                <div class="page-number">{pageNumber}</div>
              {/if}
            </div>
          {/each}
        </div>
      {/each}
    </div>
  </div>
  <div class="rightPageRegion">
    <div class="rightPageContentStack">
      {#each $rightPagePairs as pair}
        <div
          class="pageContainer"
          class:flipPageToLeft={pair[1].no === rightTopPageNo}
          style:animation-duration={animationDuration}
          style:animation-timing-function={animationTimingFunction}
          data-page-no={pair[1].no}
        >
          {#each pair as page (page.no)}
            {@const pageNumber = page.no + 1}
            <div
              class="pageContent"
              class:frontPage={page.no % 2 === 0}
              class:backPage={page.no % 2 === 1}
            >
              {#if page.content.indexOf("<img") != -1}
                {@html page.content}
              {:else}
                {page.content}
              {/if}

              {#if pageNumber !== 1 && pageNumber !== pages.length}
                <div class="page-number">{pageNumber}</div>
              {/if}
            </div>
          {/each}
        </div>
      {/each}
    </div>
  </div>
</div>
<div class="navigation-button">
  <button on:click={flipPageToLeft}>&lt;</button>
  <button on:click={flipPageToRight}>&gt;</button>
</div>

<style lang="scss">
  .book {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: stretch;
    height: calc(100% - 2em);
  }

  .leftPageRegion {
    flex: 1;
    border-top: 1px solid black;
    border-bottom: 1px solid black;
    border-left: 1px solid black;
  }

  .rightPageRegion {
    flex: 1;
    border-top: 1px solid black;
    border-bottom: 1px solid black;
    border-right: 1px solid black;
  }

  .leftPageContentStack,
  .rightPageContentStack {
    position: relative;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
  }

  .pageContent {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: calc(95% - 1em);
    height: calc(95% - 1em);
    padding: 1em;
    border-radius: 0.1em;
    background-color: lightcoral;
    font-size: 1.5em;
    overflow: hidden;
  }

  .leftPageContentStack .pageContent {
    right: 0;
    border-right: 1.5px solid rgb(62, 53, 53);
    box-shadow:
      -5px 0 5px rgba(0, 0, 0, 0.25),
      0 5px 5px rgba(0, 0, 0, 0.15),
      0 -5px 5px rgba(0, 0, 0, 0.15);

    &.backPage {
      transform: translateY(-50%) rotateY(180deg);
    }

    .page-number {
      position: absolute;
      bottom: 1em;
      left: 1em;
      font-size: 0.5em;
    }
  }

  .rightPageContentStack .pageContent {
    left: 0;
    border-left: 1.5px solid rgb(62, 53, 53);
    box-shadow:
      5px 0 5px rgba(0, 0, 0, 0.25),
      0 5px 5px rgba(0, 0, 0, 0.15),
      0 -5px 5px rgba(0, 0, 0, 0.15);

    &.backPage {
      transform: translateY(-50%) rotateY(180deg);
    }

    .page-number {
      position: absolute;
      bottom: 1em;
      right: 1em;
      font-size: 0.5em;
    }
  }

  .navigation-button {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  @keyframes flipPagePair {
    from {
      transform: rotateY(0deg);
    }
    to {
      transform: rotateY(-180deg);
    }
  }

  .pageContainer {
    position: absolute;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    border: none;
    backface-visibility: hidden;

    &.flipPageToLeft {
      z-index: 9999;
      transform-origin: left;
      animation-name: flipPagePair;
    }

    &.flipPageToRight {
      z-index: 9999;
      transform-origin: right;
      animation-name: flipPagePair;
    }
  }
</style>
