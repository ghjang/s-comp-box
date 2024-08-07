<svelte:options accessors />

<script lang="ts">
  import {
    DataStore,
    DataStoreAdaptor,
    DataSink,
    DataProps,
  } from "../common/data/DataStoreAdaptor";

  let _subscriberCount = 0;
  export const subscriberCount = () => _subscriberCount;
  export let maxSubscriberCount: undefined | number = undefined;
  export let dataProps: DataProps = { sourceComponentName: null };

  let dataStore: DataStore;

  $: if (dataProps) {
    dataStore = new DataStoreAdaptor(dataProps);
    _subscriberCount = 0;
  }

  type SubscribeReturnType = ReturnType<typeof dataStore.subscribe>;
  type SetReturnType = ReturnType<typeof dataStore.set>;

  export function subscribe(dataSink: DataSink): SubscribeReturnType {
    if (
      maxSubscriberCount !== undefined &&
      _subscriberCount >= maxSubscriberCount
    ) {
      throw new Error(
        `DataStore: maximum subscriber count exceeded: ${maxSubscriberCount}`
      );
    }

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
      dataProps,
      detail: data,
    });
  }
</script>
