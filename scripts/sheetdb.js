const dbName = 'SheetDB';
let version;
let isUpgrading = false;

function generateUniqueKey(prefix = 'row') {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1e6);
  return `${prefix}-${timestamp}-${random}`;
}

async function getVersion(dbName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName); // Open without specifying a version

    request.onsuccess = () => {
      const db = request.result;
      const version = db.version; // Get the current version
      db.close(); // Close the connection to avoid conflicts
      resolve(version);
    };

    request.onerror = () => reject(request.error);
    request.onupgradeneeded = () => {
      // If this runs, the database is being created for the first time
      const db = request.result;
      const version = db.version; // This will be 1 for a new database
      db.close();
      resolve(version);
    };
  });
}

// Helper function to open the database
async function open(upgradeCallback) {
  version = await getVersion(dbName);

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

export async function init(upgradeCallback) {
  const db = await open(upgradeCallback);
  version = db.version; // Update the version for future connections

  return new DbContext(db);
}

class DbContext {
  constructor(db) {
    this.db = db;
  }

  async get(storeName) {
    if (!this.db.objectStoreNames.contains(storeName)) {
      throw new Error(`Store "${storeName}" does not exist.`);
    }
    return new Store(this.db, storeName);
  }

  async createStore(storeName) {
    if (isUpgrading) {
      throw new Error("Database is being upgraded, please wait.");
    }

    console.log("Creating store", storeName);

    isUpgrading = true; // Set the lock

    try {
      version = this.db.version + 1;

      // Use the existing `open` function, passing an upgrade callback
      this.db = await open((db) => {
        console.log("DB Opened", db.objectStoreNames);

        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'id' });
          console.log(`Store "${storeName}" created successfully.`);
        }
      });

      isUpgrading = false; // Release the lock
      return new Store(this.db, storeName);
    } catch (error) {
      isUpgrading = false; // Release the lock on error
      throw error;
    }
  }
}

class Store {
  constructor(db, storeName) {
    this.db = db;
    this.storeName = storeName;
    this.mq = new MessageQueue();
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
      const obj = { ...data, id: key };
      const request = store.add(obj);

      this.mq.emit('added', obj);

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

class MessageQueue {
  constructor() {
    this.events = {};
  }

  subscribe(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }

  unsubscribe(event, listener) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(l => l !== listener);
  }

  emit(event, data) {
    if (!this.events[event]) return;
    this.events[event].forEach(listener => listener(data));
  }
}
