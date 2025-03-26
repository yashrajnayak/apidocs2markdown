import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FileText, Eye } from 'lucide-react';
import type { Components } from 'react-markdown';

// Import specific languages
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import markdown from 'react-syntax-highlighter/dist/esm/languages/prism/markdown';
import shell from 'react-syntax-highlighter/dist/esm/languages/prism/shell-session';
import graphql from 'react-syntax-highlighter/dist/esm/languages/prism/graphql';
import yaml from 'react-syntax-highlighter/dist/esm/languages/prism/yaml';
import http from 'react-syntax-highlighter/dist/esm/languages/prism/http';

// Register languages
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('shell', shell);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('markdown', markdown);
SyntaxHighlighter.registerLanguage('graphql', graphql);
SyntaxHighlighter.registerLanguage('yaml', yaml);
SyntaxHighlighter.registerLanguage('http', http);

interface PreviewProps {
  markdown?: string;
}

export function Preview({ markdown }: PreviewProps) {
  const [activeTab, setActiveTab] = useState<'raw' | 'preview'>('raw');

  if (!markdown) return null;

  const components: Components = {
    pre({ children }) {
      return <>{children}</>;
    },
    code({ node, className, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const codeString = String(props.children).replace(/\n$/, '');
      
      // Map common language names to their Prism equivalents
      const languageMap: Record<string, string> = {
        'sh': 'shell',
        'bash': 'shell',
        'curl': 'shell',
        'shell-session': 'shell',
        'console': 'shell',
      };

      const language = match ? (languageMap[match[1]] || match[1]) : '';
      
      return match ? (
        <div className="relative my-4 rounded-lg overflow-hidden">
          <SyntaxHighlighter
            style={oneDark}
            language={language}
            PreTag="div"
            customStyle={{
              margin: 0,
              borderRadius: '0.5rem',
            }}
          >
            {codeString}
          </SyntaxHighlighter>
        </div>
      ) : (
        <code className={className} {...props} />
      );
    },
  };

  return (
    <div className="mt-6 w-full">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-lg font-semibold">Preview</h2>
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('raw')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
              activeTab === 'raw'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            Raw
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
              activeTab === 'preview'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
        </div>
      </div>
      <div className="bg-gray-50 rounded-lg overflow-hidden">
        {activeTab === 'raw' ? (
          <pre className="p-4 whitespace-pre-wrap font-mono text-sm overflow-x-auto">
            {markdown}
          </pre>
        ) : (
          <div className="prose prose-sm max-w-none p-6 bg-white">
            <ReactMarkdown components={components}>
              {markdown}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}