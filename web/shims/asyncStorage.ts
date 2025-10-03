const memory = new Map<string, string>();

async function getItem(key: string) {
  return memory.has(key) ? memory.get(key)! : null;
}

async function setItem(key: string, value: string) {
  memory.set(key, value);
}

async function removeItem(key: string) {
  memory.delete(key);
}

async function clear() {
  memory.clear();
}

async function getAllKeys() {
  return Array.from(memory.keys());
}

async function multiGet(keys: string[]) {
  return keys.map((key) => [key, memory.get(key) ?? null] as const);
}

async function multiSet(entries: Array<[string, string]>) {
  for (const [key, value] of entries) {
    memory.set(key, value);
  }
}

async function multiRemove(keys: string[]) {
  for (const key of keys) {
    memory.delete(key);
  }
}

const AsyncStorage = {
  getItem,
  setItem,
  removeItem,
  clear,
  getAllKeys,
  multiGet,
  multiSet,
  multiRemove,
};

export default AsyncStorage;
export { getItem, setItem, removeItem, clear, getAllKeys, multiGet, multiSet, multiRemove };
