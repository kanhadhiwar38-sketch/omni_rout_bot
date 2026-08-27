import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Copy, ArrowRightFromLine } from 'lucide-react';
import { useFileStore } from '../../stores/fileStore';

interface CodeBlockProps {
  language: string;
  code: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language, code }) => {
  const [copied, setCopied] = React.useState(false);
  const { activeTabId, updateFileContent, getActiveFile } = useFileStore();

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInsertIntoEditor = () => {
    const activeFile = getActiveFile();
    if (!activeFile || !activeTabId) return;

    const currentContent = activeFile.content || '';
    const newContent = currentContent ? `${currentContent}\n\n${code}` : code;
    updateFileContent(activeFile.id, newContent);
  };

  return (
    <div className="my-3 rounded-lg overflow-hidden border border-[var(--border)] bg-[#1e1e1e]">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#252526] text-xs text-gray-400 border-b border-[var(--border)]">
        <span className="font-mono text-gray-300">{language || 'text'}</span>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleInsertIntoEditor}
            disabled={!activeTabId}
            title={activeTabId ? 'Insert into active file' : 'Open a file first'}
            className="flex items-center space-x-1 px-2 py-1 rounded bg-[#333333] hover:bg-[#444444] disabled:opacity-50 text-xs text-gray-200 transition"
          >
            <ArrowRightFromLine className="w-3.5 h-3.5" />
            <span>Insert</span>
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 px-2 py-1 rounded bg-[#333333] hover:bg-[#444444] text-xs text-gray-200 transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-400" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>
      <SyntaxHighlighter
        language={language || 'text'}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: '12px',
          fontSize: '13px',
          background: 'transparent',
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};