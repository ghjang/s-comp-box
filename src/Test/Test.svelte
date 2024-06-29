<script lang="ts">
  import { DataStore, DataStoreAdaptor } from "../common/data/DataStoreAdaptor";

  export let name: string;

  export const dataStore: DataStore = new DataStoreAdaptor;

  console.log(`Test: ${name}`);
  console.log(dataStore);
</script>
