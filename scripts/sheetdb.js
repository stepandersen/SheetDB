const dbName = 'SheetDB';
const version = 2;

function generateUniqueKey(prefix = 'row') {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1e6);
  return `${prefix}-${timestamp}-${random}`;
}

// Helper function to open the database
async function open(upgradeCallback) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, version);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (upgradeCallback) {
        upgradeCallback(db, event.oldVersion, event.newVersion);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

class Sheet {
  constructor(db, storeName) {
    this.db = db;
    this.storeName = storeName;
  }

  async getRow(key) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async addRow(data, key = generateUniqueKey()) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.add({ ...data, id: key });

      request.onsuccess = () => resolve(key);
      request.onerror = () => reject(request.error);
    });
  }

  async updateRow(data) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteRow(key) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAllRows() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

class DB {
  constructor(db) {
    this.db = db;
  }

  async get(sheetName) {
    if (!this.db.objectStoreNames.contains(sheetName)) {
      throw new Error(`Sheet "${sheetName}" does not exist.`);
    }
    return new Sheet(this.db, sheetName);
  }

  async createSheet(sheetName) {
    return new Promise((resolve, reject) => {
      version = this.db.version + 1;
      this.db.close();
      const request = indexedDB.open(dbName, version);

      request.onupgradeneeded = (event) => {
        const db = request.result;
        if (!db.objectStoreNames.contains(sheetName)) {
          db.createObjectStore(sheetName, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(new Sheet(this.db, sheetName));
      };

      request.onerror = () => reject(request.error);
    });
  }
}

export async function init(upgradeCallback) {
  const db = await open(upgradeCallback);
  return new DB(db);
}