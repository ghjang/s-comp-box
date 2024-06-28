export interface Observer {
    update(value: object): void;
}

export interface DataSource {
    registerObserver(observer: Observer): void;
    removeObserver(observer: Observer): void;
}
