import { useState, useEffect } from 'react';
import { DiffEditor } from '@monaco-editor/react';
import { GitCompare, Columns, List, AlignJustify, Trash2, HelpCircle } from 'lucide-react';

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

const SAMPLE_ORIGINAL = `function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    let item = items[i];
    // Calculate total price with standard discount
    total += item.price * (item.quantity || 1);
  }
  return total;
}`;

const SAMPLE_MODIFIED = `function calculateTotal(items, discountRate = 0) {
  // Use array reduce for cleaner code
  const rawTotal = items.reduce((acc, item) => {
    return acc + (item.price * (item.quantity ?? 1));
  }, 0);

  // Apply optional custom discount rate
  return rawTotal * (1 - discountRate);
}`;

const SUPPORTED_LANGUAGES = [
  { value: 'plaintext', label: 'Plain Text' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'json', label: 'JSON' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'python', label: 'Python' },
  { value: 'markdown', label: 'Markdown' },
];

export default function CodeDiff() {
  const isDark = useDarkMode();
  const [original, setOriginal] = useState<string>('');
  const [modified, setModified] = useState<string>('');
  const [isSideBySide, setIsSideBySide] = useState<boolean>(true);
  const [ignoreTrim, setIgnoreTrim] = useState<boolean>(true);
  const [language, setLanguage] = useState<string>('javascript');
  const [showInputs, setShowInputs] = useState<boolean>(true);

  const handleLoadSample = () => {
    setOriginal(SAMPLE_ORIGINAL);
    setModified(SAMPLE_MODIFIED);
    setLanguage('javascript');
  };

  const handleClear = () => {
    setOriginal('');
    setModified('');
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      {/* Header Panel */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <GitCompare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Text & Code Diff</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Compare text inputs and view syntax-highlighted differences</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Language Selector */}
          <div className="flex items-center gap-1.5">
            <label htmlFor="diff-language" className="text-xs font-semibold text-slate-500 dark:text-slate-400">Language:</label>
            <select
              id="diff-language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="text-sm px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

          {/* Toggle inputs */}
          <button
            onClick={() => setShowInputs(!showInputs)}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
              showInputs 
                ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-900/50' 
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-750 hover:bg-slate-50 dark:hover:bg-slate-750'
            }`}
            title="Toggle input textareas visibility"
          >
            {showInputs ? 'Hide Input Fields' : 'Show Input Fields'}
          </button>

          {/* Side by side / Inline Toggle */}
          <button
            onClick={() => setIsSideBySide(!isSideBySide)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-355 border border-slate-200 dark:border-slate-750 rounded-lg transition-all"
            title={isSideBySide ? "Switch to Inline View" : "Switch to Side-by-Side View"}
          >
            {isSideBySide ? (
              <>
                <List className="w-3.5 h-3.5" />
                <span>Inline View</span>
              </>
            ) : (
              <>
                <Columns className="w-3.5 h-3.5" />
                <span>Side-by-Side</span>
              </>
            )}
          </button>

          {/* Ignore Whitespace Toggle */}
          <button
            onClick={() => setIgnoreTrim(!ignoreTrim)}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              ignoreTrim
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/55 dark:border-emerald-900/55 text-emerald-600 dark:text-emerald-400'
                : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-750 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
            }`}
            title="Toggle ignore trim whitespace"
          >
            <AlignJustify className="w-3.5 h-3.5" />
            <span>Ignore Whitespace: {ignoreTrim ? 'ON' : 'OFF'}</span>
          </button>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

          {/* Sample & Clear */}
          <button
            onClick={handleLoadSample}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-lg transition-all"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Load Sample</span>
          </button>

          <button
            onClick={handleClear}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Main Workspace (Inputs + Diff Editor) */}
      <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-950">
        
        {/* Dynamic Input Fields Section */}
        {showInputs && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 transition-all duration-300">
            {/* Original Input */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="original-input" className="text-xs font-semibold text-slate-550 dark:text-slate-400 flex justify-between items-center">
                <span>Original Text</span>
                <span className="text-[10px] text-slate-400 font-normal">Line count: {original.split('\n').length}</span>
              </label>
              <textarea
                id="original-input"
                value={original}
                onChange={(e) => setOriginal(e.target.value)}
                placeholder="Paste original code or text here..."
                className="w-full h-36 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-700 dark:text-slate-350 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-shadow resize-y"
              />
            </div>

            {/* Modified Input */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="modified-input" className="text-xs font-semibold text-slate-550 dark:text-slate-400 flex justify-between items-center">
                <span>Modified Text</span>
                <span className="text-[10px] text-slate-400 font-normal">Line count: {modified.split('\n').length}</span>
              </label>
              <textarea
                id="modified-input"
                value={modified}
                onChange={(e) => setModified(e.target.value)}
                placeholder="Paste modified code or text here..."
                className="w-full h-36 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-700 dark:text-slate-350 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-shadow resize-y"
              />
            </div>
          </div>
        )}

        {/* Monaco Diff Editor Panel */}
        <div className="flex-1 min-h-0 relative">
          <DiffEditor
            height="100%"
            original={original}
            modified={modified}
            language={language}
            theme={isDark ? "vs-dark" : "light"}
            options={{
              renderSideBySide: isSideBySide,
              ignoreTrimWhitespace: ignoreTrim,
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "'Fira Code', 'Courier New', Monaco, monospace",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 12, bottom: 12 },
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              renderLineHighlight: 'all',
              wordWrap: 'on'
            }}
          />

          {/* Empty Placeholder overlay if both are empty */}
          {!original && !modified && (
            <div className="absolute inset-0 bg-white dark:bg-slate-950 flex flex-col items-center justify-center pointer-events-none p-6 text-center">
              <GitCompare className="w-16 h-16 text-slate-300 dark:text-slate-750 mb-4" />
              <h3 className="text-lg font-medium text-slate-400 dark:text-slate-600">No Code Loaded</h3>
              <p className="text-sm text-slate-400 dark:text-slate-600 max-w-sm mt-1">
                Enter text in the original and modified fields above, or click "Load Sample" to see a comparison in action.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
