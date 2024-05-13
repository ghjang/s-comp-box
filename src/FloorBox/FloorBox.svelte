<script>
  export let pattern = "honeycomb";

  export function getAvailableFloorPatterns() {
    return ["honeycomb", "dots", "checkerboard", "squares", "stripes"];
  }

  export const setFloorPattern = (newPattern) => pattern = newPattern;
</script>

<div class="floor-box {pattern}">
  <!-- 컴포넌트의 내용을 여기에 작성합니다. -->
</div>

<style lang="scss">
  @import "./floor-pattern.scss";

  $primary-color: #333;
  $secondary-color: #444;

  .floor-box {
    height: 100vh;
    width: 100vw;

    &.dots {
      @include dots-pattern($primary-color, $secondary-color);
    }

    &.honeycomb {
      @include honeycomb-pattern($primary-color, $secondary-color);
    }

    &.checkerboard {
      @include checkerboard-pattern($primary-color, $secondary-color);
    }

    &.squares {
      @include squares-pattern($primary-color, $secondary-color);
    }

    &.stripes {
      @include stripes-pattern($primary-color, $secondary-color);
    }
  }
</style>
