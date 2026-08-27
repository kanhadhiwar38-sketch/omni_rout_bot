export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  parentId: string | null;
  content?: string;
  language?: string;
  createdAt: number;
  updatedAt: number;
  children?: FileNode[];
  isExpanded?: boolean;
}

export interface Tab {
  fileId: string;
  name: string;
  isDirty: boolean;
}

export interface FileTree {
  nodes: FileNode[];
  rootId: string;
}

export const LANGUAGE_MAP: Record<string, string> = {
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.py': 'python',
  '.html': 'html',
  '.css': 'css',
  '.scss': 'scss',
  '.json': 'json',
  '.md': 'markdown',
  '.txt': 'plaintext',
  '.java': 'java',
  '.kt': 'kotlin',
  '.cpp': 'cpp',
  '.c': 'c',
  '.rs': 'rust',
  '.go': 'go',
  '.php': 'php',
  '.rb': 'ruby',
  '.swift': 'swift',
  '.sh': 'shell',
  '.yaml': 'yaml',
  '.yml': 'yaml',
  '.xml': 'xml',
  '.sql': 'sql',
};

export function getLanguageFromExtension(filename: string): string {
  const ext = '.' + filename.split('.').pop()?.toLowerCase();
  return LANGUAGE_MAP[ext] || 'plaintext';
}

export function generateId(): string {
  return crypto.randomUUID();
}