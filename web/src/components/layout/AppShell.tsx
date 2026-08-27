import React, { useEffect, useState } from 'react';
import { Group, Panel, Separator } from 'react-resizable-panels';
import { useFileStore } from '../../stores/fileStore';
import { useChatStore } from '../../stores/chatStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { FileTree } from '../file-tree/FileTree';
import { TabBar } from '../editor/TabBar';
import { CodeEditor } from '../editor/CodeEditor';
import { ChatPanel } from '../chat/ChatPanel';
import { SettingsModal } from '../settings/SettingsModal';
import {
  Code2,
  FolderTree,
  MessageSquare,
  Settings as SettingsIcon,
  Sun,
  Moon,
} from 'lucide-react';

export const AppShell: React.FC = () => {
  const { loadFiles, getActiveFile } = useFileStore();
  const { loadConversations } = useChatStore();
  const { openSettings, editorSettings, setEditorSettings } = useSettingsStore();

  const [showSidebar, setShowSidebar] = useState(true);
  const [showChat, setShowChat] = useState(true);

  useEffect(() => {
    loadFiles();
    loadConversations();
  }, [loadFiles, loadConversations]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        setShowChat((prev) => !prev);
      } else if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setShowSidebar((prev) => !prev);
      } else if (e.ctrlKey && e.key === ',') {
        e.preventDefault();
        openSettings();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [openSettings]);

  const activeFile = getActiveFile();

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#1e1e1e] text-gray-200 font-sans">
      {/* Top Header Bar */}
      <header className="flex items-center justify-between px-3 py-1.5 bg-[#252526] border-b border-[var(--border)] select-none text-xs">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 font-bold text-white tracking-wide">
            <Code2 className="w-4 h-4 text-blue-500" />
            <span>CodeEditor AI</span>
          </div>

          <div className="h-4 w-px bg-[var(--border)]" />

          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className={`p-1 rounded hover:bg-[#333] transition ${
              showSidebar ? 'text-blue-400' : 'text-gray-400'
            }`}
            title="Toggle File Tree (Ctrl+Shift+E)"
          >
            <FolderTree className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowChat(!showChat)}
            className={`p-1 rounded hover:bg-[#333] transition ${
              showChat ? 'text-purple-400' : 'text-gray-400'
            }`}
            title="Toggle AI Chat (Ctrl+Shift+L)"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() =>
              setEditorSettings({
                theme: editorSettings.theme === 'vs-dark' ? 'vs-light' : 'vs-dark',
              })
            }
            className="p-1 rounded hover:bg-[#333] text-gray-400 hover:text-white transition"
            title="Toggle Theme"
          >
            {editorSettings.theme === 'vs-dark' ? (
              <Moon className="w-4 h-4 text-amber-400" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500" />
            )}
          </button>

          <button
            onClick={openSettings}
            className="p-1 rounded hover:bg-[#333] text-gray-400 hover:text-white transition"
            title="Settings (Ctrl+,)"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Resizable Panel Layout */}
      <div className="flex-1 overflow-hidden" style={{ height: 'calc(100vh - 52px)' }}>
        <Group orientation="horizontal" style={{ height: '100%', width: '100%' }}>
          {showSidebar && (
            <>
              <Panel defaultSize="20%" minSize="150px" maxSize="40%">
                <FileTree />
              </Panel>
              <Separator className="w-1 bg-[#2b2b2b] hover:bg-blue-600 transition cursor-col-resize" />
            </>
          )}

          <Panel defaultSize="50%" minSize="30%">
            <div className="flex flex-col h-full bg-[#1e1e1e] overflow-hidden">
              <TabBar />
              <div className="flex-1 relative overflow-hidden">
                <CodeEditor />
              </div>
            </div>
          </Panel>

          {showChat && (
            <>
              <Separator className="w-1 bg-[#2b2b2b] hover:bg-purple-600 transition cursor-col-resize" />
              <Panel defaultSize="30%" minSize="20%" maxSize="50%">
                <ChatPanel />
              </Panel>
            </>
          )}
        </Group>
      </div>

      {/* Status Bar */}
      <footer className="flex items-center justify-between px-3 py-1 bg-[#007acc] text-white text-[11px] font-mono select-none">
        <div className="flex items-center space-x-3">
          <span>{activeFile ? `File: ${activeFile.name}` : 'No Active File'}</span>
          {activeFile?.language && <span>Language: {activeFile.language}</span>}
        </div>
        <div className="flex items-center space-x-3">
          <span>UTF-8</span>
          <span>OpenAI-Compatible AI Ready</span>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal />
    </div>
  );
};