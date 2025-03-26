import { FileDown, FileText, AlertCircle, Globe } from 'lucide-react';
import { useDocumentConverter } from './hooks/useDocumentConverter';
import { ProgressBar } from './components/ProgressBar';
import { Preview } from './components/Preview';

function App() {
  const {
    url,
    setUrl,
    status,
    message,
    progress,
    markdown,
    error,
    startConversion,
    downloadMarkdown,
  } = useDocumentConverter();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-4xl mx-auto p-6">
          <div className="flex flex-col items-center gap-4 mb-8">
            <FileText className="w-24 h-24 text-blue-600" />
            <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              API Documentation to Markdown Converter
            </h1>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="url"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  API Documentation URL
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Globe className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="url"
                    id="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://api.example.com/docs"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={status === 'fetching' || status === 'converting'}
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Enter the URL of any public API documentation page. The page should be publicly accessible.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={startConversion}
                  disabled={status === 'fetching' || status === 'converting'}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Convert to Markdown
                </button>

                {status === 'completed' && (
                  <button
                    onClick={downloadMarkdown}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <FileDown className="w-4 h-4" />
                    Download Markdown
                  </button>
                )}
              </div>

              {(status === 'fetching' || status === 'converting') && (
                <div className="space-y-2">
                  <ProgressBar progress={progress} />
                  <p className="text-sm text-gray-600">{message}</p>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-lg">
                  <AlertCircle className="w-5 h-5" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {status === 'completed' && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 p-4 rounded-lg">
                  <FileText className="w-5 h-5" />
                  <p className="text-sm">{message}</p>
                </div>
              )}

              <Preview markdown={markdown} />
            </div>
          </div>
        </div>
      </div>
      
      <footer className="fixed bottom-0 left-0 right-0 bg-white shadow-lg py-4">
        <div className="max-w-4xl mx-auto px-6 flex justify-between items-center">
          <div>
            Project by <a href="https://github.com/yashrajnayak" className="text-blue-600 hover:underline">Yashraj Nayak</a>
          </div>
          <a
            href="https://github.com/yashrajnayak/apidocs2markdown"
            className="text-blue-600 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            View on GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;