export default class IndexedDBManager {
  constructor(dbName, version) {
    this.dbName = dbName;
    this.version = version;
    this.db = null;
    this.storeConfigs = new Map();
  }

  addStoreConfig(storeName, keyPath, indexes = []) {
    this.storeConfigs.set(storeName, { keyPath, indexes });
  }

  async openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = (event) => reject(event.target.error);

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        this.storeConfigs.forEach((config, storeName) => {
          if (!db.objectStoreNames.contains(storeName)) {
            const objectStore = db.createObjectStore(storeName, {
              keyPath: config.keyPath,
            });
            config.indexes.forEach((index) => {
              objectStore.createIndex(index.name, index.keyPath, {
                unique: index.unique,
              });
            });
          }
        });
      };
    });
  }

  async getDatabase() {
    if (!this.db) {
      await this.openDatabase();
    }
    return this.db;
  }

  async getData(storeName, key) {
    const db = await this.getDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onerror = (event) => reject(event.target.error);
      request.onsuccess = (event) => resolve(event.target.result);
    });
  }

  async saveData(storeName, data, key = null, overwrite = false) {
    const db = await this.getDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);

      let request;
      if (key !== null) {
        request = overwrite ? store.put(data, key) : store.add(data, key);
      } else {
        request = overwrite ? store.put(data) : store.add(data);
      }

      request.onerror = (event) => reject(event.target.error);
      request.onsuccess = (event) => resolve(event.target.result);

      transaction.oncomplete = () => resolve(request.result);
      transaction.onerror = (event) => reject(event.target.error);
    });
  }

  async deleteData(storeName, key) {
    const db = await this.getDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onerror = (event) => reject(event.target.error);
      request.onsuccess = (event) => resolve(event.target.result);
    });
  }

  async getDataByIndex(storeName, indexName, key) {
    const db = await this.getDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(key);

      request.onerror = (event) => reject(event.target.error);
      request.onsuccess = (event) => resolve(event.target.result);
    });
  }

  async getRecordCount(storeName) {
    const db = await this.getDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const countRequest = store.count();

      countRequest.onerror = (event) => reject(event.target.error);
      countRequest.onsuccess = (event) => resolve(event.target.result);
    });
  }

  closeDatabase() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

export const promisifyRequest = (request) => {
  return new Promise((resolve, reject) => {
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
};

export const promisifyTransaction = (transaction) => {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = (event) => reject(event.target.error);
    transaction.onabort = (event) => reject(event.target.error);
  });
};
