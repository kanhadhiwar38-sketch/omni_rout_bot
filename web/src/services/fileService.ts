import { openDB, type IDBPDatabase } from 'idb';
import type { FileNode } from '../types/file';
import type { Conversation } from '../types/chat';

const DB_NAME = 'CodeEditorDB';
const DB_VERSION = 1;

export interface Schema {
  files: {
    key: string;
    value: FileNode;
    indexes: { 'by-parent': string | null };
  };
  conversations: {
    key: string;
    value: Conversation;
  };
}

let dbPromise: Promise<IDBPDatabase<Schema>> | null = null;

export function getDB(): Promise<IDBPDatabase<Schema>> {
  if (!dbPromise) {
    dbPromise = openDB<Schema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('files')) {
          const fileStore = db.createObjectStore('files', { keyPath: 'id' });
          fileStore.createIndex('by-parent', 'parentId');
        }
        if (!db.objectStoreNames.contains('conversations')) {
          db.createObjectStore('conversations', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

export const fileService = {
  async getAllFiles(): Promise<FileNode[]> {
    const db = await getDB();
    return db.getAll('files');
  },

  async getFileById(id: string): Promise<FileNode | undefined> {
    const db = await getDB();
    return db.get('files', id);
  },

  async createFile(file: FileNode): Promise<FileNode> {
    const db = await getDB();
    await db.put('files', file);
    return file;
  },

  async updateFile(file: FileNode): Promise<FileNode> {
    const db = await getDB();
    const updated = { ...file, updatedAt: Date.now() };
    await db.put('files', updated);
    return updated;
  },

  async deleteFile(id: string): Promise<void> {
    const db = await getDB();
    const all = await db.getAll('files');
    
    // Find recursively all descendant IDs if directory
    const toDelete: string[] = [id];
    const getDescendants = (parentId: string) => {
      const children = all.filter((f) => f.parentId === parentId);
      for (const child of children) {
        toDelete.push(child.id);
        if (child.type === 'folder') {
          getDescendants(child.id);
        }
      }
    };
    getDescendants(id);

    const tx = db.transaction('files', 'readwrite');
    await Promise.all(toDelete.map((fileId) => tx.store.delete(fileId)));
    await tx.done;
  },

  async initSampleFilesIfEmpty(): Promise<FileNode[]> {
    const files = await this.getAllFiles();
    if (files.length > 0) return files;

    const sampleFiles: FileNode[] = [
      {
        id: '1',
        name: 'src',
        type: 'folder',
        parentId: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: '2',
        name: 'App.tsx',
        type: 'file',
        parentId: '1',
        content: `import React from 'react';\n\nexport function App() {\n  return (\n    <div className="container">\n      <h1>Welcome to Code Editor AI</h1>\n      <p>Start editing or ask AI for help!</p>\n    </div>\n  );\n}\n`,
        language: 'typescript',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: '3',
        name: 'index.css',
        type: 'file',
        parentId: '1',
        content: `body {\n  margin: 0;\n  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;\n  background-color: #1e1e1e;\n  color: #d4d4d4;\n}\n`,
        language: 'css',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: '4',
        name: 'README.md',
        type: 'file',
        parentId: null,
        content: `# Code Editor + AI Chat App\n\nA local-first general-purpose web code editor with integrated AI assistant.\n\n## Features\n- Virtual file tree\n- Multi-tab Monaco Editor\n- Resizable 3-panel shell\n- OpenAI API stream integration\n`,
        language: 'markdown',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];

    for (const f of sampleFiles) {
      await this.createFile(f);
    }
    return sampleFiles;
  },
};