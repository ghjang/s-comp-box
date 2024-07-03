import { Writable, writable } from 'svelte/store';


export abstract class DataSink {
    unsubscribe: () => void = () => {};

    abstract update(data: object): void;
}

export interface DataStore {
    subscribe(dataSink: DataSink): () => void;
    set(data: object): void;
}


export class DataStoreAdaptor implements DataStore {
    private data: Writable<object> = writable({});

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
