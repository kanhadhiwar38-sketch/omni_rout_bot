import React from 'react';
import type { Tab as TabType } from '../../types/file';
import { X } from 'lucide-react';

interface TabProps {
  tab: TabType;
  isActive: boolean;
  onSelect: () => void;
  onClose: () => void;
}

export const TabItem: React.FC<TabProps> = ({ tab, isActive, onSelect, onClose }) => {
  return (
    <div
      onClick={onSelect}
      className={`group flex items-center space-x-2 px-3 py-2 border-r border-[var(--border)] text-xs font-mono cursor-pointer transition select-none ${
        isActive
          ? 'bg-[#1e1e1e] text-white border-t-2 border-t-blue-500 font-medium'
          : 'bg-[#2d2d2d] text-gray-400 hover:bg-[#252526]'
      }`}
    >
      <span className="truncate max-w-[120px]">{tab.name}</span>
      {tab.isDirty && <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-[#444] hover:text-white transition"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};