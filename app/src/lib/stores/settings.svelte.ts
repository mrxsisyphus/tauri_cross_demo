import type { AppSettings } from '$types';
import { backendApi } from '../backend';

const STORAGE_KEY = 'todo_app_settings';

const defaultSettings: AppSettings = {
  backendUrl: '',
  userId: 'default-user',
  isConnected: false
};

function loadSettings(): AppSettings {
  if (typeof window === 'undefined') return defaultSettings;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse settings', e);
    }
  }
  return defaultSettings;
}

let settings = $state<AppSettings>(loadSettings());

// Auto-check connection on startup
if (typeof window !== 'undefined' && settings.backendUrl) {
  setTimeout(() => {
    backendApi.healthCheck().then(connected => {
      settings.isConnected = connected;
      console.log(`[Settings] Auto connection check: ${connected ? 'Connected' : 'Disconnected'}`);
    });
  }, 1000);
}

export const settingsStore = {
  get backendUrl() { return settings.backendUrl; },
  get userId() { return settings.userId; },
  get isConnected() { return settings.isConnected; },
  get isConfigured() { return settings.backendUrl.length > 0; },
  
  async checkConnection() {
    if (!this.isConfigured) {
      settings.isConnected = false;
      console.log('[Settings] Not configured, skipping connection check');
      return false;
    }
    console.log(`[Settings] Checking connection to: ${settings.backendUrl}`);
    const isConnected = await backendApi.healthCheck();
    settings.isConnected = isConnected;
    console.log(`[Settings] Connection check result: ${isConnected}`);
    return isConnected;
  },

  update(newSettings: Partial<AppSettings>) {
    settings = { ...settings, ...newSettings };
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
    // Auto-check connection after update
    if (newSettings.backendUrl !== undefined) {
      this.checkConnection();
    }
  }
};
