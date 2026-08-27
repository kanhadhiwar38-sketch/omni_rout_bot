import React, { useState } from 'react';
import type { FileNode } from '../../types/file';
import { useFileStore } from '../../stores/fileStore';
import {
  Folder,
  FolderOpen,
  FileCode,
  ChevronRight,
  ChevronDown,
  FilePlus,
  FolderPlus,
  Edit2,
  Trash2,
} from 'lucide-react';

interface FileNodeProps {
  node: FileNode;
  level: number;
}

export const FileNodeItem: React.FC<FileNodeProps> = ({ node, level }) => {
  const {
    activeTabId,
    expandedFolders,
    openFile,
    toggleFolder,
    createFile,
    createFolder,
    renameFileNode,
    deleteFileNode,
  } = useFileStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(node.name);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  const isFolder = node.type === 'folder';
  const isExpanded = expandedFolders.has(node.id);
  const isActive = activeTabId === node.id;

  const handleLeftClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFolder) {
      toggleFolder(node.id);
    } else {
      openFile(node.id);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editName.trim() && editName !== node.name) {
      await renameFileNode(node.id, editName.trim());
    }
    setIsEditing(false);
  };

  return (
    <div className="select-none">
      <div
        onClick={handleLeftClick}
        onContextMenu={handleContextMenu}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        className={`group relative flex items-center py-1 pr-2 text-xs font-mono cursor-pointer transition ${
          isActive
            ? 'bg-[#37373d] text-white font-medium'
            : 'hover:bg-[#2a2d2e] text-gray-300'
        }`}
      >
        {isFolder ? (
          <span className="mr-1 text-gray-400">
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </span>
        ) : (
          <span className="w-3.5 mr-1" />
        )}

        {isFolder ? (
          isExpanded ? (
            <FolderOpen className="w-4 h-4 text-blue-400 mr-1.5 flex-shrink-0" />
          ) : (
            <Folder className="w-4 h-4 text-blue-400 mr-1.5 flex-shrink-0" />
          )
        ) : (
          <FileCode className="w-4 h-4 text-amber-400 mr-1.5 flex-shrink-0" />
        )}

        {isEditing ? (
          <form onSubmit={handleRenameSubmit} className="flex-1">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleRenameSubmit}
              autoFocus
              className="w-full bg-[#1e1e1e] text-white text-xs px-1 border border-blue-500 rounded outline-none"
            />
          </form>
        ) : (
          <span className="truncate">{node.name}</span>
        )}
      </div>

      {/* Context Menu Overlay */}
      {contextMenu && (
        <div
          className="fixed inset-0 z-50"
          onClick={() => setContextMenu(null)}
          onContextMenu={(e) => {
            e.preventDefault();
            setContextMenu(null);
          }}
        >
          <div
            style={{ top: contextMenu.y, left: contextMenu.x }}
            className="absolute bg-[#252526] border border-[var(--border)] rounded shadow-lg py-1 w-40 text-xs text-gray-200 z-50"
          >
            {isFolder && (
              <>
                <button
                  onClick={async () => {
                    setContextMenu(null);
                    await createFile('new-file.txt', node.id);
                  }}
                  className="flex items-center space-x-2 px-3 py-1.5 hover:bg-[#04395e] w-full text-left"
                >
                  <FilePlus className="w-3.5 h-3.5" />
                  <span>New File</span>
                </button>
                <button
                  onClick={async () => {
                    setContextMenu(null);
                    await createFolder('new-folder', node.id);
                  }}
                  className="flex items-center space-x-2 px-3 py-1.5 hover:bg-[#04395e] w-full text-left"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>New Folder</span>
                </button>
                <div className="border-b border-[var(--border)] my-1" />
              </>
            )}
            <button
              onClick={() => {
                setContextMenu(null);
                setIsEditing(true);
              }}
              className="flex items-center space-x-2 px-3 py-1.5 hover:bg-[#04395e] w-full text-left"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Rename</span>
            </button>
            <button
              onClick={async () => {
                setContextMenu(null);
                await deleteFileNode(node.id);
              }}
              className="flex items-center space-x-2 px-3 py-1.5 hover:bg-[#04395e] w-full text-left text-red-400"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};