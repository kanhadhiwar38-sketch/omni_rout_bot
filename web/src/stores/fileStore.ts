import { create } from 'zustand';
import type { FileNode, Tab } from '../types/file';
import { getLanguageFromExtension, generateId } from '../types/file';
import { fileService } from '../services/fileService';

interface FileState {
  files: FileNode[];
  openTabs: Tab[];
  activeTabId: string | null;
  expandedFolders: Set<string>;
  isLoading: boolean;

  // Actions
  loadFiles: () => Promise<void>;
  openFile: (fileId: string) => void;
  closeTab: (fileId: string) => void;
  setActiveTab: (fileId: string) => void;
  createFile: (name: string, parentId: string | null, content?: string) => Promise<FileNode>;
  createFolder: (name: string, parentId: string | null) => Promise<FileNode>;
  updateFileContent: (fileId: string, content: string) => void;
  saveFile: (fileId: string) => Promise<void>;
  renameFileNode: (fileId: string, newName: string) => Promise<void>;
  deleteFileNode: (fileId: string) => Promise<void>;
  toggleFolder: (folderId: string) => void;
  getActiveFile: () => FileNode | undefined;
}

export const useFileStore = create<FileState>((set, get) => ({
  files: [],
  openTabs: [],
  activeTabId: null,
  expandedFolders: new Set<string>(['1']),
  isLoading: true,

  loadFiles: async () => {
    set({ isLoading: true });
    const files = await fileService.initSampleFilesIfEmpty();
    set({ files, isLoading: false });
    // Default open README.md if available
    const readme = files.find((f) => f.name === 'README.md');
    if (readme) {
      get().openFile(readme.id);
    }
  },

  openFile: (fileId: string) => {
    const { files, openTabs } = get();
    const file = files.find((f) => f.id === fileId);
    if (!file || file.type === 'folder') return;

    const existingTab = openTabs.find((t) => t.fileId === fileId);
    if (!existingTab) {
      set({
        openTabs: [...openTabs, { fileId: file.id, name: file.name, isDirty: false }],
        activeTabId: file.id,
      });
    } else {
      set({ activeTabId: file.id });
    }
  },

  closeTab: (fileId: string) => {
    const { openTabs, activeTabId } = get();
    const nextTabs = openTabs.filter((t) => t.fileId !== fileId);
    let nextActive = activeTabId;

    if (activeTabId === fileId) {
      if (nextTabs.length > 0) {
        const closedIndex = openTabs.findIndex((t) => t.fileId === fileId);
        const newIndex = Math.max(0, closedIndex - 1);
        nextActive = nextTabs[newIndex].fileId;
      } else {
        nextActive = null;
      }
    }

    set({ openTabs: nextTabs, activeTabId: nextActive });
  },

  setActiveTab: (fileId: string) => {
    set({ activeTabId: fileId });
  },

  createFile: async (name: string, parentId: string | null, content = '') => {
    const language = getLanguageFromExtension(name);
    const newFile: FileNode = {
      id: generateId(),
      name,
      type: 'file',
      parentId,
      content,
      language,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await fileService.createFile(newFile);
    set((state) => ({
      files: [...state.files, newFile],
    }));

    get().openFile(newFile.id);
    return newFile;
  },

  createFolder: async (name: string, parentId: string | null) => {
    const newFolder: FileNode = {
      id: generateId(),
      name,
      type: 'folder',
      parentId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await fileService.createFile(newFolder);
    set((state) => ({
      files: [...state.files, newFolder],
      expandedFolders: new Set([...state.expandedFolders, newFolder.id]),
    }));
    return newFolder;
  },

  updateFileContent: (fileId: string, content: string) => {
    set((state) => ({
      files: state.files.map((f) => (f.id === fileId ? { ...f, content, updatedAt: Date.now() } : f)),
      openTabs: state.openTabs.map((t) => (t.fileId === fileId ? { ...t, isDirty: true } : t)),
    }));
  },

  saveFile: async (fileId: string) => {
    const file = get().files.find((f) => f.id === fileId);
    if (file) {
      await fileService.updateFile(file);
      set((state) => ({
        openTabs: state.openTabs.map((t) => (t.fileId === fileId ? { ...t, isDirty: false } : t)),
      }));
    }
  },

  renameFileNode: async (fileId: string, newName: string) => {
    const file = get().files.find((f) => f.id === fileId);
    if (!file) return;

    const language = file.type === 'file' ? getLanguageFromExtension(newName) : undefined;
    const updated = { ...file, name: newName, language, updatedAt: Date.now() };

    await fileService.updateFile(updated);
    set((state) => ({
      files: state.files.map((f) => (f.id === fileId ? updated : f)),
      openTabs: state.openTabs.map((t) => (t.fileId === fileId ? { ...t, name: newName } : t)),
    }));
  },

  deleteFileNode: async (fileId: string) => {
    await fileService.deleteFile(fileId);
    set((state) => {
      const remainingFiles = state.files.filter((f) => f.id !== fileId && f.parentId !== fileId);
      const remainingTabs = state.openTabs.filter((t) => t.fileId !== fileId);
      return {
        files: remainingFiles,
        openTabs: remainingTabs,
        activeTabId: state.activeTabId === fileId ? (remainingTabs[0]?.fileId || null) : state.activeTabId,
      };
    });
  },

  toggleFolder: (folderId: string) => {
    set((state) => {
      const next = new Set(state.expandedFolders);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return { expandedFolders: next };
    });
  },

  getActiveFile: () => {
    const { files, activeTabId } = get();
    return files.find((f) => f.id === activeTabId);
  },
}));