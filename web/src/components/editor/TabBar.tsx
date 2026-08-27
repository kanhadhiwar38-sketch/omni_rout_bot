import React from 'react';
import { useFileStore } from '../../stores/fileStore';
import { TabItem } from './TabItem';

export const TabBar: React.FC = () => {
  const { openTabs, activeTabId, setActiveTab, closeTab } = useFileStore();

  if (openTabs.length === 0) return null;

  return (
    <div className="flex items-center overflow-x-auto bg-[#252526] border-b border-[var(--border)] scrollbar-none">
      {openTabs.map((tab) => (
        <TabItem
          key={tab.fileId}
          tab={tab}
          isActive={tab.fileId === activeTabId}
          onSelect={() => setActiveTab(tab.fileId)}
          onClose={() => closeTab(tab.fileId)}
        />
      ))}
    </div>
  );
};