<svelte:options accessors />

<script lang="ts">
  import {
    DataStore,
    DataStoreAdaptor,
    DataSink,
  } from "../common/data/DataStoreAdaptor";

  let _subscriberCount = 0;
  export const subscriberCount = () => _subscriberCount;

  const dataStore: DataStore = new DataStoreAdaptor();

  type SubscribeReturnType = ReturnType<typeof dataStore.subscribe>;
  type SetReturnType = ReturnType<typeof dataStore.set>;

  export function subscribe(dataSink: DataSink): SubscribeReturnType {
    const unsubscribe = dataStore.subscribe(dataSink);
    ++_subscriberCount;
    dataSink.unsubscribe = () => {
      unsubscribe();
      --_subscriberCount;
    };
    return dataSink.unsubscribe;
  }

  export function set(data: object): SetReturnType {
    dataStore.set({
      subscriberCount: _subscriberCount,
      detail: data,
    });
  }
</script>
