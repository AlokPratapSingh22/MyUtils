import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Clipboard, ClipboardCheck, Trash2, HelpCircle, AlertCircle, FileJson } from 'lucide-react';

// Custom hook to detect if dark mode is active on documentElement
function useDarkMode() {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return isDark;
}

const SAMPLE_JSON = {
  appName: "DevUtils Hub",
  version: "1.0.0",
  description: "A highly modular client-side developer utility platform",
  isProduction: false,
  technologies: [
    "React 19",
    "Vite",
    "TypeScript",
    "Tailwind CSS v4",
    "Monaco Editor"
  ],
  configuration: {
    theme: "dark",
    autoSave: true,
    sidebarExpanded: true,
    limits: {
      maxFileSizeMB: 10,
      historyItems: 50
    }
  },
  status: "active"
};

export default function JsonViewer() {
  const isDark = useDarkMode();
  const [value, setValue] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Auto-validate JSON as the user types (with debouncing)
  useEffect(() => {
    if (!value.trim()) {
      setError(null);
      return;
    }
    const timer = setTimeout(() => {
      try {
        JSON.parse(value);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Invalid JSON');
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [value]);

  const handleFormat = () => {
    if (!value.trim()) return;
    try {
      const parsed = JSON.parse(value);
      setValue(JSON.stringify(parsed, null, 2));
      setError(null);
    } catch (err: any) {
      setError(`Cannot format: ${err.message}`);
    }
  };

  const handleMinify = () => {
    if (!value.trim()) return;
    try {
      const parsed = JSON.parse(value);
      setValue(JSON.stringify(parsed));
      setError(null);
    } catch (err: any) {
      setError(`Cannot minify: ${err.message}`);
    }
  };

  const handleCopy = async () => {
    if (!value.trim()) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleLoadSample = () => {
    setValue(JSON.stringify(SAMPLE_JSON, null, 2));
    setError(null);
  };

  const handleClear = () => {
    setValue('');
    setError(null);
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      {/* Header Panel */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <FileJson className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">JSON Formatter & Viewer</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Beautify, validate, and minify your JSON data</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLoadSample}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-all"
            title="Load template JSON"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Load Sample</span>
          </button>
          
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-all"
            title="Clear Editor"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear</span>
          </button>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

          <button
            onClick={handleFormat}
            disabled={!value.trim()}
            className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:pointer-events-none rounded-lg shadow-sm shadow-indigo-600/10 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Format</span>
          </button>

          <button
            onClick={handleMinify}
            disabled={!value.trim()}
            className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:pointer-events-none rounded-lg shadow-sm shadow-violet-600/10 transition-all cursor-pointer"
          >
            <span>Minify</span>
          </button>

          <button
            onClick={handleCopy}
            disabled={!value.trim()}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold rounded-lg shadow-sm transition-all cursor-pointer ${
              copied
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 hover:bg-slate-700 dark:hover:bg-white'
            }`}
          >
            {copied ? (
              <>
                <ClipboardCheck className="w-4 h-4" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Clipboard className="w-4 h-4" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor & Message Container */}
      <div className="flex-1 flex flex-col relative min-h-0 bg-white dark:bg-slate-950">
        <div className="flex-1 min-h-0 relative">
          <Editor
            height="100%"
            defaultLanguage="json"
            language="json"
            theme={isDark ? "vs-dark" : "light"}
            value={value}
            onChange={(val) => setValue(val || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "'Fira Code', 'Courier New', Monaco, monospace",
              lineNumbers: 'on',
              roundedSelection: true,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              padding: { top: 12, bottom: 12 },
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              formatOnPaste: true,
              renderLineHighlight: 'all',
              wordWrap: 'on'
            }}
          />
        </div>

        {/* Error / Status Bar */}
        {error && (
          <div className="absolute bottom-4 left-4 right-4 flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/25 rounded-xl backdrop-blur-md text-red-700 dark:text-red-300 text-sm animate-in fade-in slide-in-from-bottom-2 duration-200 shadow-lg">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">JSON Parsing Error:</span>
              <p className="font-mono mt-0.5 text-xs select-text leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {/* Welcome Placeholder overlay if empty */}
        {!value && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-6 text-center">
            <FileJson className="w-16 h-16 text-slate-300 dark:text-slate-700 mb-4 animate-pulse" />
            <h3 className="text-lg font-medium text-slate-400 dark:text-slate-600">No JSON Data</h3>
            <p className="text-sm text-slate-400 dark:text-slate-600 max-w-sm mt-1">
              Paste your JSON payload, load the sample JSON template, or start typing here to begin.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
