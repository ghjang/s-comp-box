import { Writable, writable } from "svelte/store";

export interface DataProps {
  sourceComponentName: string | null;
  [key: string]: any;
}

export abstract class DataSink {
  unsubscribe: () => void = () => {};

  abstract isCompatible(props: DataProps): boolean;
  abstract update(data: object): void;
}

export interface DataStore {
  dataProps: object;
  subscribe(dataSink: DataSink): () => void;
  set(data: object): void;
}

export class DataStoreAdaptor implements DataStore {
  private _dataProps: object;
  private data: Writable<object> = writable({});

  constructor(props: DataProps) {
    this._dataProps = props;
  }

  get dataProps(): object {
    return this._dataProps;
  }

  subscribe(dataSink: DataSink): () => void {
    dataSink.unsubscribe = this.data.subscribe((value) => {
      dataSink.update(value);
    });
    return dataSink.unsubscribe;
  }

  set(data: object): void {
    this.data.set(data);
  }
}
