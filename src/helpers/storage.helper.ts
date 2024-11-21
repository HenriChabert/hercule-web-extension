import browser from "webextension-polyfill";
import { StorageKey } from "../types/storage.type";

// Define a configuration interface
interface StorageConfig {
  storageType: "local" | "sync" | "managed"; // Supported storage types
}

class StorageHelper {
  private storageArea: browser.Storage.StorageArea;

  constructor(private config: StorageConfig) {
    // Determine the storage area to use based on the storageType provided
    switch (config.storageType) {
      case "local":
        this.storageArea = browser.storage.local;
        break;
      case "sync":
        this.storageArea = browser.storage.sync;
        break;
      case "managed":
        this.storageArea = browser.storage.managed;
        break;
      default:
        throw new Error(`Unsupported storage type: ${config.storageType}`);
    }
  }

  /**
   * Stores a value in the specified storage area.
   * @param key - The key to store the value under.
   * @param value - The value to store. Should be serializable to JSON.
   * @returns A promise that resolves when the data is stored.
   */
  async setData(key: StorageKey, value: any): Promise<void> {
    try {
      await this.storageArea.set({ [key]: value });
      console.log(`Data stored successfully in ${this.config.storageType} storage with key: ${key}`);
    } catch (error) {
      console.error(`Error storing data with key ${key} in ${this.config.storageType} storage:`, error);
    }
  }

  /**
   * Retrieves a value from the specified storage area by key.
   * @param key - The key of the data to retrieve.
   * @returns A promise that resolves with the data or undefined if not found.
   */
  async getData<T>(key: StorageKey): Promise<T | undefined> {
    try {
      const result = await this.storageArea.get(key);
      return result[key] as T;
    } catch (error) {
      console.error(`Error retrieving data with key ${key} from ${this.config.storageType} storage:`, error);
      return undefined;
    }
  }

  /**
   * Removes a value from the specified storage area by key.
   * @param key - The key of the data to remove.
   * @returns A promise that resolves when the data is removed.
   */
  async eraseData(key: StorageKey): Promise<void> {
    try {
      await this.storageArea.remove(key);
      console.log(`Data erased successfully from ${this.config.storageType} storage with key: ${key}`);
    } catch (error) {
      console.error(`Error erasing data with key ${key} from ${this.config.storageType} storage:`, error);
    }
  }
}

export { StorageHelper };
export type { StorageConfig };