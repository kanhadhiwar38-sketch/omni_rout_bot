import React from 'react';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-center space-x-1.5 p-3 text-gray-400">
      <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
      <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
      <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
      <span className="text-xs text-gray-400 ml-2 font-sans">AI is thinking...</span>
    </div>
  );
};