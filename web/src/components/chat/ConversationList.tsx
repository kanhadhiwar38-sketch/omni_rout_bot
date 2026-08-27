import React from 'react';
import type { Conversation } from '../../types/chat';
import { Plus, MessageSquare, Trash2 } from 'lucide-react';

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
}) => {
  return (
    <div className="flex flex-col h-full bg-[#181818] text-gray-300 border-r border-[var(--border)] w-48">
      <div className="p-3 border-b border-[var(--border)] flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Chats</span>
        <button
          onClick={onNew}
          className="p-1 rounded hover:bg-[#252526] text-gray-300 transition"
          title="New Conversation"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {conversations.map((conv) => {
          const isActive = conv.id === activeId;
          return (
            <div
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={`group flex items-center justify-between px-2 py-1.5 rounded text-xs cursor-pointer transition ${
                isActive ? 'bg-[#37373d] text-white font-medium' : 'hover:bg-[#252526] text-gray-400'
              }`}
            >
              <div className="flex items-center space-x-2 truncate pr-1">
                <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{conv.title || 'Untitled Chat'}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(conv.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:text-red-400 transition"
                title="Delete Chat"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};