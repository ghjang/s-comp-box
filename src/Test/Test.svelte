<script lang="ts">
  import type { Observer, DataSource } from "../common/interface/DataSource.ts";

  export let name: string;

  export let dataSource: DataSource = {
    registerObserver: (observer: Observer) => {},
    removeObserver: (observer: Observer) => {},
  };

  console.log(`Test: ${name}`);
  console.log(dataSource);
</script>
