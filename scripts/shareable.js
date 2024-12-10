const store = new Map();
const subscribers = new Map(); // Tracks listeners for the store entries

function createReactiveObject(obj, onChange, parent, props = []) {
  return new Proxy(obj, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      // If the property is an object, wrap it recursively
      if (value && typeof value === 'object') {
        return createReactiveObject(value, onChange, parent || receiver, [...props, prop]);
      }
      return value;
    },
    set(target, prop, value, receiver) {
      const oldValue = target[prop];
      const result = Reflect.set(target, prop, value, receiver);

      // Trigger the onChange callback if the property value has changed
      if (oldValue !== value) {
        onChange([...props, prop], value, oldValue, parent || receiver);
      }

      return result;
    },
  });
}

function notify(key, data, props) {
  if (subscribers.has(key)) {
    subscribers.get(key).forEach((callback) => callback(data, props));
  }
}

export function shareSheet(key, data) {

  const reactive = createReactiveObject(data, (props, value, oldValue, proxy) => {
    console.log(`Property ${props.join(".")} changed from ${oldValue} to ${value}`);
    
    notify(key, proxy, props);
  });

  store.set(key, reactive);

  // Notify all subscribers for this key
  if (subscribers.has(key)) {
    notify(key, data);
  }

  return reactive;
}

export function getSharedSheet(key, callback) {

  if (!subscribers.has(key))
    subscribers.set(key, []);
  subscribers.get(key).push(callback); // Register callback for future updates

  if (store.has(key))
    callback(store.get(key)); // Immediately invoke callback if data exists
}

// export function remove(key) {
//   store.delete(key);
//   subscribers.delete(key); // Clean up listeners
// }

export function debug() {
  return store;
}