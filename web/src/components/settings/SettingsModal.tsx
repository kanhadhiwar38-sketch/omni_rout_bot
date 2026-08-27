import React, { useState, useEffect } from 'react';
import { useSettingsStore } from '../../stores/settingsStore';
import { PROVIDER_PRESETS } from '../../types/chat';
import { fetchAvailableModels } from '../../services/aiService';
import { X, Key, Globe, Cpu, Sliders, Monitor, Type, RefreshCw, Zap } from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsOpen,
    closeSettings,
    aiSettings,
    setAISettings,
    editorSettings,
    setEditorSettings,
  } = useSettingsStore();

  const [activeTab, setActiveTab] = useState<'ai' | 'editor'>('ai');
  const [fetchedModels, setFetchedModels] = useState<string[]>([]);
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const handleSelectPreset = (presetId: string) => {
    const preset = PROVIDER_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setAISettings({
        baseUrl: preset.baseUrl,
        model: preset.defaultModel,
        providerPreset: preset.id,
      });
      setFetchedModels([]);
    }
  };

  const handleFetchModels = async () => {
    setIsFetchingModels(true);
    setFetchError(null);
    try {
      const models = await fetchAvailableModels(aiSettings.baseUrl, aiSettings.apiKey);
      if (models.length > 0) {
        setFetchedModels(models);
        if (!models.includes(aiSettings.model)) {
          setAISettings({ model: models[0] });
        }
      } else {
        setFetchError('No models returned. Check endpoint or API key.');
      }
    } catch {
      setFetchError('Failed to fetch models from endpoint.');
    } finally {
      setIsFetchingModels(false);
    }
  };

  useEffect(() => {
    if (isSettingsOpen && aiSettings.baseUrl) {
      handleFetchModels();
    }
  }, [isSettingsOpen, aiSettings.baseUrl]);

  if (!isSettingsOpen) return null;

  const currentPreset = PROVIDER_PRESETS.find((p) => p.id === aiSettings.providerPreset);
  const availableModelsList = fetchedModels.length > 0
    ? fetchedModels
    : currentPreset?.popularModels || [
        'omniroute/auto',
        'omniroute/free',
        'gpt-4o-mini',
        'gpt-4o',
        'claude-3-7-sonnet',
        'deepseek-r1',
      ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 select-none">
      <div className="bg-[#1e1e1e] border border-[var(--border)] rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[#252526]">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-white">Settings</h2>
          </div>
          <button
            onClick={closeSettings}
            className="p-1 rounded-lg hover:bg-[#333] text-gray-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--border)] bg-[#252526] px-6">
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${
              activeTab === 'ai'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            AI Gateway & Router
          </button>
          <button
            onClick={() => setActiveTab('editor')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${
              activeTab === 'editor'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            Editor Config
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-gray-300">
          {activeTab === 'ai' ? (
            <div className="space-y-5">
              {/* Provider Quick Presets */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">
                  Provider / Gateway Preset
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {PROVIDER_PRESETS.map((preset) => {
                    const isSelected = aiSettings.baseUrl === preset.baseUrl;
                    const isOmni = preset.id.startsWith('omniroute');
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectPreset(preset.id)}
                        className={`flex flex-col items-start p-2.5 rounded-lg border text-left transition ${
                          isSelected
                            ? 'border-blue-500 bg-blue-950/30 text-white'
                            : 'border-[var(--border)] bg-[#252526] text-gray-400 hover:border-gray-500 hover:text-gray-200'
                        }`}
                      >
                        <div className="flex items-center space-x-1.5 font-medium text-xs">
                          {isOmni && <Zap className="w-3.5 h-3.5 text-amber-400" />}
                          <span>{preset.name}</span>
                        </div>
                        <span className="text-[10px] text-gray-500 truncate w-full mt-0.5">
                          {preset.baseUrl}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Base URL */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1 flex items-center space-x-1.5">
                  <Globe className="w-4 h-4 text-blue-400" />
                  <span>Base URL</span>
                </label>
                <input
                  type="text"
                  value={aiSettings.baseUrl}
                  onChange={(e) => setAISettings({ baseUrl: e.target.value })}
                  placeholder="http://localhost:20128/v1"
                  className="w-full bg-[#252526] border border-[var(--border)] rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                />
                <span className="text-[11px] text-gray-500 mt-1 block">
                  OmniRoute Local: <code className="text-amber-400 font-mono">http://localhost:20128/v1</code> | Any OpenAI-compatible gateway
                </span>
              </div>

              {/* API Key */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1 flex items-center space-x-1.5">
                  <Key className="w-4 h-4 text-amber-400" />
                  <span>API Key (Optional for OmniRoute Local)</span>
                </label>
                <input
                  type="password"
                  value={aiSettings.apiKey}
                  onChange={(e) => setAISettings({ apiKey: e.target.value })}
                  placeholder="sk-... or leave empty for local OmniRoute"
                  className="w-full bg-[#252526] border border-[var(--border)] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Model selection */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-gray-400 flex items-center space-x-1.5">
                    <Cpu className="w-4 h-4 text-purple-400" />
                    <span>Model Name</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleFetchModels}
                    disabled={isFetchingModels}
                    className="flex items-center space-x-1 text-xs text-blue-400 hover:underline disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${isFetchingModels ? 'animate-spin' : ''}`} />
                    <span>Fetch Models</span>
                  </button>
                </div>

                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={aiSettings.model}
                    onChange={(e) => setAISettings({ model: e.target.value })}
                    placeholder="omniroute/auto"
                    className="flex-1 bg-[#252526] border border-[var(--border)] rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                  />
                  <select
                    value={aiSettings.model}
                    onChange={(e) => setAISettings({ model: e.target.value })}
                    className="bg-[#252526] border border-[var(--border)] rounded-lg px-2 text-white text-xs max-w-[160px] focus:outline-none"
                  >
                    {availableModelsList.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                {fetchError && (
                  <span className="text-[11px] text-red-400 mt-1 block">{fetchError}</span>
                )}
              </div>

              {/* Temperature */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-gray-400 flex items-center space-x-1.5">
                    <Sliders className="w-4 h-4 text-green-400" />
                    <span>Temperature ({aiSettings.temperature})</span>
                  </label>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={aiSettings.temperature}
                  onChange={(e) => setAISettings({ temperature: parseFloat(e.target.value) })}
                  className="w-full accent-blue-500"
                />
              </div>

              {/* System Prompt */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">
                  System Prompt
                </label>
                <textarea
                  value={aiSettings.systemPrompt}
                  onChange={(e) => setAISettings({ systemPrompt: e.target.value })}
                  rows={3}
                  className="w-full bg-[#252526] border border-[var(--border)] rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1 flex items-center space-x-1.5">
                  <Monitor className="w-4 h-4 text-blue-400" />
                  <span>Editor Theme</span>
                </label>
                <select
                  value={editorSettings.theme}
                  onChange={(e) => setEditorSettings({ theme: e.target.value as 'vs-dark' | 'vs-light' })}
                  className="w-full bg-[#252526] border border-[var(--border)] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="vs-dark">Dark (VS Dark)</option>
                  <option value="vs-light">Light (VS Light)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1 flex items-center space-x-1.5">
                  <Type className="w-4 h-4 text-purple-400" />
                  <span>Font Size ({editorSettings.fontSize}px)</span>
                </label>
                <input
                  type="range"
                  min="10"
                  max="24"
                  value={editorSettings.fontSize}
                  onChange={(e) => setEditorSettings({ fontSize: parseInt(e.target.value) })}
                  className="w-full accent-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">
                  Tab Size
                </label>
                <select
                  value={editorSettings.tabSize}
                  onChange={(e) => setEditorSettings({ tabSize: parseInt(e.target.value) })}
                  className="w-full bg-[#252526] border border-[var(--border)] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value={2}>2 spaces</option>
                  <option value={4}>4 spaces</option>
                </select>
              </div>

              <div className="flex items-center justify-between py-2 border-t border-[var(--border)]">
                <span className="text-xs font-semibold text-gray-400">Minimap</span>
                <input
                  type="checkbox"
                  checked={editorSettings.minimap}
                  onChange={(e) => setEditorSettings({ minimap: e.target.checked })}
                  className="w-4 h-4 accent-blue-500"
                />
              </div>

              <div className="flex items-center justify-between py-2 border-t border-[var(--border)]">
                <span className="text-xs font-semibold text-gray-400">Word Wrap</span>
                <input
                  type="checkbox"
                  checked={editorSettings.wordWrap === 'on'}
                  onChange={(e) => setEditorSettings({ wordWrap: e.target.checked ? 'on' : 'off' })}
                  className="w-4 h-4 accent-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-[var(--border)] bg-[#252526]">
          <button
            onClick={closeSettings}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};