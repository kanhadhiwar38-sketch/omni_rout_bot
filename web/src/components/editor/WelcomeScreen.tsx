import React from 'react';
import { useFileStore } from '../../stores/fileStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { FileCode, Sparkles, Settings as SettingsIcon } from 'lucide-react';

export const WelcomeScreen: React.FC = () => {
  const { createFile } = useFileStore();
  const { openSettings } = useSettingsStore();

  return (
    <div className="flex flex-col items-center justify-center h-full bg-[#1e1e1e] text-gray-300 p-6 select-none">
      <div className="max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-4 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 text-white shadow-lg">
            <FileCode className="w-12 h-12" />
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Code Editor + AI Assistant</h1>
          <p className="text-sm text-gray-400">
            A fast, local-first code workspace integrated with an OpenAI-compatible stream assistant.
          </p>
        </div>

        <div className="flex flex-col space-y-2">
          <button
            onClick={() => createFile('main.js', null)}
            className="flex items-center justify-center space-x-2 w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition"
          >
            <FileCode className="w-4 h-4" />
            <span>Create New File</span>
          </button>
          <button
            onClick={openSettings}
            className="flex items-center justify-center space-x-2 w-full py-2.5 px-4 rounded-lg bg-[#252526] hover:bg-[#333333] border border-[var(--border)] text-gray-200 text-sm font-medium transition"
          >
            <SettingsIcon className="w-4 h-4" />
            <span>Configure AI API / Editor Settings</span>
          </button>
        </div>

        <div className="border-t border-[var(--border)] pt-4 text-xs text-gray-500 space-y-1">
          <div className="flex items-center justify-center space-x-1 text-purple-400 font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Keyboard Shortcuts</span>
          </div>
          <p><kbd className="px-1.5 py-0.5 bg-[#333] rounded text-gray-300 font-mono">Ctrl+S</kbd> Save File</p>
          <p><kbd className="px-1.5 py-0.5 bg-[#333] rounded text-gray-300 font-mono">Ctrl+Shift+L</kbd> Toggle AI Chat</p>
          <p><kbd className="px-1.5 py-0.5 bg-[#333] rounded text-gray-300 font-mono">Ctrl+Shift+E</kbd> Toggle File Tree</p>
        </div>
      </div>
    </div>
  );
};