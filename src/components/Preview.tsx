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

// Register languages
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('markdown', markdown);

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
      
      return match ? (
        <div className="relative">
          <SyntaxHighlighter
            style={oneDark}
            language={match[1]}
            PreTag="div"
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