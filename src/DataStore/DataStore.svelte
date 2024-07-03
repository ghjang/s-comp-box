<svelte:options accessors />

<script lang="ts">
  import {
    DataStore,
    DataStoreAdaptor,
    DataSink,
  } from "../common/data/DataStoreAdaptor";

  export let subscriberCount = 0;

  const dataStore: DataStore = new DataStoreAdaptor();

  type SubscribeReturnType = ReturnType<typeof dataStore.subscribe>;
  type SetReturnType = ReturnType<typeof dataStore.set>;

  export function subscribe(dataSink: DataSink): SubscribeReturnType {
    const unsubscribe = dataStore.subscribe(dataSink);
    ++subscriberCount;
    return unsubscribe;
  }

  export function set(data: object): SetReturnType {
    dataStore.set({
      subscriberCount,
      detail: data,
    });
  }
</script>
