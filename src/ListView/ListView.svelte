<script lang="ts">
  import { camelToKebab } from "../common/util";

  type StyleProps = Record<string, string>;

  type Header = {
    displayNames?: string[];
    fieldNames: string[];
    style?: StyleProps | StyleProps[];
  };

  type Row = {
    style?: StyleProps;
    [key: string]: any;
  };

  export let header: Header = {
    fieldNames: [],
  };
  export let items: Row[] = [];

  export let defaultHeaderStyle: StyleProps = {
    fontWeight: "bold",
    fontFamily: "'Noto Sans KR', sans-serif",
  };

  export let defaultBodyStyle: StyleProps | StyleProps[] = {
    fontFamily: "'Noto Sans KR', sans-serif",
  };

  function getValue(item: Row, field: string): any {
    return item[field] || "";
  }

  // fieldNames가 없거나 비어있으면 에러를 발생시킨다.
  $: if (!header.fieldNames || header.fieldNames.length === 0) {
    throw new Error(
      "fieldNames는 반드시 지정되어야 하며, 최소 1개 이상의 열을 포함해야 합니다.",
    );
  }

  // displayNames가 지정되었지만 fieldNames와 길이가 다른 경우 에러를 발생시킨다.
  $: if (
    header.displayNames &&
    header.displayNames.length !== header.fieldNames.length
  ) {
    throw new Error(
      "displayNames가 지정된 경우, fieldNames와 길이가 같아야 합니다.",
    );
  }

  // displayNames가 없는 경우 fieldNames를 기반으로 자동 생성시킨다.
  $: displayNames =
    header.displayNames ||
    header.fieldNames.map(
      (field) => field.charAt(0).toUpperCase() + field.slice(1),
    );

  $: if (header.style) {
    if (
      Array.isArray(header.style) &&
      header.style.length !== header.fieldNames.length
    ) {
      throw new Error("styles는 반드시 fieldNames와 길이가 같아야 합니다.");
    }
  }

  $: if (defaultBodyStyle) {
    if (
      Array.isArray(defaultBodyStyle) &&
      defaultBodyStyle.length !== header.fieldNames.length
    ) {
      throw new Error(
        "defaultBodyStyle는 반드시 fieldNames와 길이가 같아야 합니다.",
      );
    }
  }

  function getColumnStyle(index: number): StyleProps {
    if (!header.style) return {};
    if (Array.isArray(header.style)) {
      return header.style[index] || {};
    }
    return header.style;
  }

  function getStyleString(style: StyleProps): string {
    return Object.entries(style)
      .map(([key, value]) => `${camelToKebab(key)}:${value}`)
      .join(";");
  }

  function getHeaderColumnStyle(index: number): string {
    const style = { ...defaultHeaderStyle, ...getColumnStyle(index) };
    return getStyleString(style);
  }

  function getBodyColumnStyle(
    item: Row,
    index: number,
    fieldName: string,
  ): string {
    const defaultStyle = Array.isArray(defaultBodyStyle)
      ? defaultBodyStyle[index] ?? {}
      : defaultBodyStyle;
    const styleFieldName = `${fieldName}Style`;
    const style = { ...defaultStyle, ...(item[styleFieldName] ?? {}) };
    return getStyleString(style);
  }
</script>

<div class="list-view">
  <div class="list-header">
    {#each displayNames as displayName, index}
      <div class="header-cell" style={getHeaderColumnStyle(index)}>
        {displayName}
      </div>
    {/each}
  </div>

  <div class="list-body">
    {#each items as item}
      <div class="list-row">
        {#each header.fieldNames as fieldName, index}
          <div
            class="list-cell"
            style={getBodyColumnStyle(item, index, fieldName)}
          >
            {getValue(item, fieldName)}
          </div>
        {/each}
      </div>
    {/each}
  </div>
</div>

<style lang="scss">
  .list-view {
    border: 1px solid #ccc;

    .list-header {
      display: flex;
      background-color: #f0f0f0;
      font-weight: bold;

      .header-cell {
        padding: 8px;
        flex: 1;
      }
    }

    .list-body {
      max-height: 400px;
      overflow-y: auto;

      .list-row {
        display: flex;
        border-bottom: 1px solid #eee;

        .list-cell {
          padding: 8px;
          flex: 1;
        }

        &:last-child {
          border-bottom: none;
        }
      }
    }
  }
</style>
