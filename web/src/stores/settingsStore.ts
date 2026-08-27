import { create } from 'zustand';
import type { AISettings } from '../types/chat';
import { DEFAULT_AI_SETTINGS } from '../types/chat';
import type { EditorSettings } from '../types/editor';
import { DEFAULT_EDITOR_SETTINGS } from '../types/editor';

const AI_SETTINGS_KEY = 'code_editor_ai_settings';
const EDITOR_SETTINGS_KEY = 'code_editor_editor_settings';

function loadStoredAISettings(): AISettings {
  try {
    const raw = localStorage.getItem(AI_SETTINGS_KEY);
    return raw ? { ...DEFAULT_AI_SETTINGS, ...JSON.parse(raw) } : DEFAULT_AI_SETTINGS;
  } catch {
    return DEFAULT_AI_SETTINGS;
  }
}

function loadStoredEditorSettings(): EditorSettings {
  try {
    const raw = localStorage.getItem(EDITOR_SETTINGS_KEY);
    return raw ? { ...DEFAULT_EDITOR_SETTINGS, ...JSON.parse(raw) } : DEFAULT_EDITOR_SETTINGS;
  } catch {
    return DEFAULT_EDITOR_SETTINGS;
  }
}

interface SettingsState {
  aiSettings: AISettings;
  editorSettings: EditorSettings;
  isSettingsOpen: boolean;

  setAISettings: (settings: Partial<AISettings>) => void;
  setEditorSettings: (settings: Partial<EditorSettings>) => void;
  openSettings: () => void;
  closeSettings: () => void;
  toggleSettings: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  aiSettings: loadStoredAISettings(),
  editorSettings: loadStoredEditorSettings(),
  isSettingsOpen: false,

  setAISettings: (newSettings) => {
    set((state) => {
      const updated = { ...state.aiSettings, ...newSettings };
      localStorage.setItem(AI_SETTINGS_KEY, JSON.stringify(updated));
      return { aiSettings: updated };
    });
  },

  setEditorSettings: (newSettings) => {
    set((state) => {
      const updated = { ...state.editorSettings, ...newSettings };
      localStorage.setItem(EDITOR_SETTINGS_KEY, JSON.stringify(updated));
      return { editorSettings: updated };
    });
  },

  openSettings: () => set({ isSettingsOpen: true }),
  closeSettings: () => set({ isSettingsOpen: false }),
  toggleSettings: () => set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),
}));