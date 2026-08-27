import React, { useRef } from 'react';
import Editor, { type Monaco } from '@monaco-editor/react';
import { useFileStore } from '../../stores/fileStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { WelcomeScreen } from './WelcomeScreen';

export const CodeEditor: React.FC = () => {
  const { getActiveFile, updateFileContent } = useFileStore();
  const { editorSettings } = useSettingsStore();

  const activeFile = getActiveFile();
  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;

    // Ctrl+S / Cmd+S save binding
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      const currentActive = useFileStore.getState().activeTabId;
      if (currentActive) {
        useFileStore.getState().saveFile(currentActive);
      }
    });
  };

  if (!activeFile) {
    return <WelcomeScreen />;
  }

  return (
    <div className="h-full w-full bg-[#1e1e1e] overflow-hidden">
      <Editor
        height="100%"
        path={activeFile.id}
        language={activeFile.language || 'plaintext'}
        value={activeFile.content || ''}
        theme={editorSettings.theme}
        onChange={(val) => updateFileContent(activeFile.id, val || '')}
        onMount={handleEditorDidMount}
        options={{
          fontSize: editorSettings.fontSize,
          tabSize: editorSettings.tabSize,
          wordWrap: editorSettings.wordWrap,
          minimap: { enabled: editorSettings.minimap },
          lineNumbers: editorSettings.lineNumbers,
          automaticLayout: true,
          scrollBeyondLastLine: false,
          fontFamily: 'Fira Code, Consolas, Monaco, "Courier New", monospace',
          fontLigatures: true,
        }}
      />
    </div>
  );
};