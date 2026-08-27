import React from 'react';
import { useFileStore } from '../../stores/fileStore';
import { FileNodeItem } from './FileNodeItem';
import type { FileNode } from '../../types/file';
import { FilePlus, FolderPlus } from 'lucide-react';

export const FileTree: React.FC = () => {
  const { files, expandedFolders, createFile, createFolder, isLoading } = useFileStore();

  const buildTree = (parentId: string | null): FileNode[] => {
    return files
      .filter((f) => f.parentId === parentId)
      .map((f) => ({
        ...f,
        children: f.type === 'folder' ? buildTree(f.id) : undefined,
      }));
  };

  const rootNodes = buildTree(null);

  const renderNodes = (nodes: FileNode[], level = 0): React.ReactNode => {
    return nodes.map((node) => (
      <React.Fragment key={node.id}>
        <FileNodeItem node={node} level={level} />
        {node.type === 'folder' &&
          expandedFolders.has(node.id) &&
          node.children &&
          renderNodes(node.children, level + 1)}
      </React.Fragment>
    ));
  };

  return (
    <div className="flex flex-col h-full bg-[#181818] border-r border-[var(--border)] select-none">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)] bg-[#252526] text-xs font-bold uppercase tracking-wider text-gray-400">
        <span>Files</span>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => createFile('untitled.txt', null)}
            className="p-1 rounded hover:bg-[#333] text-gray-300 transition"
            title="New File at Root"
          >
            <FilePlus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => createFolder('new-folder', null)}
            className="p-1 rounded hover:bg-[#333] text-gray-300 transition"
            title="New Folder at Root"
          >
            <FolderPlus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {isLoading ? (
          <div className="p-4 text-xs text-gray-500">Loading workspace files...</div>
        ) : rootNodes.length === 0 ? (
          <div className="p-4 text-xs text-gray-500 text-center">No files found.</div>
        ) : (
          renderNodes(rootNodes)
        )}
      </div>
    </div>
  );
};