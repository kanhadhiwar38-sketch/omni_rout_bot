import React, { useState } from 'react';
import { Send, Square, FileCode, Settings, Zap } from 'lucide-react';
import { useFileStore } from '../../stores/fileStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { PROVIDER_PRESETS } from '../../types/chat';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  onStop: () => void;
  isStreaming: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, onStop, isStreaming }) => {
  const [text, setText] = useState('');
  const { getActiveFile } = useFileStore();
  const { aiSettings, setAISettings, openSettings } = useSettingsStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isStreaming) return;
    onSendMessage(text.trim());
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleAttachActiveFile = () => {
    const file = getActiveFile();
    if (!file || !file.content) return;

    const attachment = `\n\nContext from file \`${file.name}\`:\n\`\`\`${file.language || ''}\n${file.content}\n\`\`\`\n`;
    setText((prev) => prev + attachment);
  };

  const isOmniRoute = aiSettings.baseUrl.includes('omniroute') || aiSettings.baseUrl.includes(':20128');

  // Find preset models or defaults
  const preset = PROVIDER_PRESETS.find((p) => p.baseUrl === aiSettings.baseUrl);
  const modelOptions = preset?.popularModels || [
    'omniroute/auto',
    'omniroute/free',
    'gpt-4o-mini',
    'gpt-4o',
    'claude-3-7-sonnet',
    'deepseek-r1',
    'qwen-2.5-coder-32b',
  ];

  if (!modelOptions.includes(aiSettings.model)) {
    modelOptions.unshift(aiSettings.model);
  }

  return (
    <div className="p-3 border-t border-[var(--border)] bg-[#1e1e1e]">
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center space-x-2">
          <label className="text-xs text-gray-400 flex items-center space-x-1">
            {isOmniRoute && <Zap className="w-3 h-3 text-amber-400" />}
            <span>Model:</span>
          </label>
          <select
            value={aiSettings.model}
            onChange={(e) => setAISettings({ model: e.target.value })}
            className="bg-[#252526] text-xs text-gray-200 border border-[var(--border)] rounded px-2 py-1 outline-none font-mono max-w-[180px] truncate"
          >
            {modelOptions.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleAttachActiveFile}
            title="Attach active file code to prompt"
            className="flex items-center space-x-1 text-xs text-gray-400 hover:text-gray-200 transition"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Attach File</span>
          </button>
          <button
            onClick={openSettings}
            title="AI Gateway Settings"
            className="text-gray-400 hover:text-gray-200 transition p-1 hover:bg-[#252526] rounded"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="relative flex items-center">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isOmniRoute
              ? "Ask OmniRoute AI (Enter to send, Shift+Enter for newline)..."
              : "Ask AI assistant (Enter to send, Shift+Enter for newline)..."
          }
          rows={2}
          className="w-full bg-[#252526] text-gray-200 text-sm rounded-lg p-2.5 pr-10 border border-[var(--border)] focus:outline-none focus:border-blue-500 resize-none font-sans"
        />
        {isStreaming ? (
          <button
            type="button"
            onClick={onStop}
            className="absolute right-2.5 bottom-2.5 p-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white transition"
            title="Stop generating"
          >
            <Square className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!text.trim()}
            className="absolute right-2.5 bottom-2.5 p-1.5 rounded-md bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white transition"
            title="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        )}
      </form>
    </div>
  );
};