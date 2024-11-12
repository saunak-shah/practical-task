// src/global/common.tsx

/**
 * Utility function to save data to local storage.
 * @param key - The key under which the data will be stored.
 * @param value - The value to store, which will be stringified.
 */
export const saveToLocalStorage = (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error("Failed to save in local storage", error);
    }
  };
  