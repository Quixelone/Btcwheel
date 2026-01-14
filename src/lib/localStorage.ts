/**
 * localStorage Wrapper with App-Specific Prefix
 * Prevents conflicts with other apps using the same Supabase project
 */

// Unique prefix for this app to isolate storage
const APP_PREFIX = 'btcwheel_';

export const storage = {
  /**
   * Get item from localStorage with app prefix
   */
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(`${APP_PREFIX}${key}`);
    } catch (error) {
      console.error('localStorage getItem error:', error);
      return null;
    }
  },

  /**
   * Set item in localStorage with app prefix
   */
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(`${APP_PREFIX}${key}`, value);
      window.dispatchEvent(new CustomEvent('btcwheel-storage', { detail: { key, value } }));
    } catch (error) {
      console.error('localStorage setItem error:', error);
    }
  },

  /**
   * Remove item from localStorage with app prefix
   */
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(`${APP_PREFIX}${key}`);
      window.dispatchEvent(new CustomEvent('btcwheel-storage', { detail: { key, value: null } }));
    } catch (error) {
      console.error('localStorage removeItem error:', error);
    }
  },

  /**
   * Clear all items with app prefix
   */
  clear: (): void => {
    try {
      // Only clear items with our prefix to avoid affecting other apps
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(APP_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('localStorage clear error:', error);
    }
  },

  /**
   * Check if localStorage is available
   */
  isAvailable: (): boolean => {
    try {
      const testKey = `${APP_PREFIX}__test__`;
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Get all keys with app prefix
   */
  getAllKeys: (): string[] => {
    try {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(APP_PREFIX)) {
          // Remove prefix from returned keys
          keys.push(key.replace(APP_PREFIX, ''));
        }
      }
      return keys;
    } catch (error) {
      console.error('localStorage getAllKeys error:', error);
      return [];
    }
  },

  /**
   * Migrate data from old keys (without prefix) to new keys (with prefix)
   * Use this once to migrate existing user data
   */
  migrateFromOldKeys: (oldKeys: string[]): void => {
    try {
      console.log('🔄 Migrating localStorage keys with prefix:', APP_PREFIX);
      oldKeys.forEach(oldKey => {
        const value = localStorage.getItem(oldKey);
        if (value !== null) {
          // Save with new prefix
          storage.setItem(oldKey, value);
          // Remove old key
          localStorage.removeItem(oldKey);
          console.log(`✅ Migrated: ${oldKey} → ${APP_PREFIX}${oldKey}`);
        }
      });
      console.log('✅ Migration complete');
    } catch (error) {
      console.error('localStorage migration error:', error);
    }
  }
};

// Export APP_PREFIX for reference
export const getAppPrefix = () => APP_PREFIX;
