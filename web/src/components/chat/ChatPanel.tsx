import React, { useState } from 'react';
import { useChatStore } from '../../stores/chatStore';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { ConversationList } from './ConversationList';
import { Bot, PanelLeftClose, PanelLeftOpen, AlertCircle } from 'lucide-react';

export const ChatPanel: React.FC = () => {
  const {
    conversations,
    activeConversationId,
    isStreaming,
    error,
    createConversation,
    deleteConversation,
    setActiveConversation,
    sendMessage,
    stopStreaming,
    getActiveConversation,
  } = useChatStore();

  const [showHistory, setShowHistory] = useState(false);
  const activeConv = getActiveConversation();

  return (
    <div className="flex h-full bg-[#1e1e1e] border-l border-[var(--border)] overflow-hidden">
      {showHistory && (
        <ConversationList
          conversations={conversations}
          activeId={activeConversationId}
          onSelect={(id) => setActiveConversation(id)}
          onNew={() => createConversation()}
          onDelete={(id) => deleteConversation(id)}
        />
      )}

      <div className="flex flex-col flex-1 h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)] bg-[#252526] text-xs font-semibold text-gray-300">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-1 rounded hover:bg-[#333] transition text-gray-400 hover:text-gray-200"
              title={showHistory ? 'Hide history' : 'Show chat history'}
            >
              {showHistory ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
            </button>
            <Bot className="w-4 h-4 text-purple-400" />
            <span className="truncate max-w-[150px]">{activeConv?.title || 'AI Assistant'}</span>
          </div>
          <button
            onClick={() => createConversation()}
            className="text-xs text-blue-400 hover:underline"
          >
            + New
          </button>
        </div>

        {error && (
          <div className="flex items-center space-x-2 bg-red-900/50 text-red-200 text-xs px-3 py-2 border-b border-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{error}</span>
          </div>
        )}

        {/* Messages */}
        <MessageList messages={activeConv?.messages || []} isStreaming={isStreaming} />

        {/* Input */}
        <ChatInput
          onSendMessage={(text) => sendMessage(text)}
          onStop={stopStreaming}
          isStreaming={isStreaming}
        />
      </div>
    </div>
  );
};