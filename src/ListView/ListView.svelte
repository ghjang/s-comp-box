<script lang="ts">
  type Header = {
    displayNames?: string[];
    fieldNames: string[];
  };

  export let items: any[] = [];
  export let header: Header;

  function getValue(item: any, field: string): string {
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
</script>

<div class="list-view">
  <div class="list-header">
    {#each displayNames as displayName}
      <div class="header-cell">{displayName}</div>
    {/each}
  </div>

  <div class="list-body">
    {#each items as item}
      <div class="list-row">
        {#each header.fieldNames as fieldName}
          <div class="list-cell">{getValue(item, fieldName)}</div>
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
