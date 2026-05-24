import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Trash2, Terminal, Clipboard, ClipboardCheck, HelpCircle } from 'lucide-react';

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

const SAMPLE_JS = `// Welcome to the JS Console Playground!
// Write your JavaScript code here and click "Run" to execute it.

console.log("Hello, developer! This is standard console.log output.");
console.info("This is an info message.");
console.warn("Here is a warning alert.");
console.error("Oops! Something went wrong.");

// Try working with objects:
const user = {
  name: "Sarah Jenkins",
  role: "Lead Architect",
  skills: ["React", "TypeScript", "Tailwind CSS"],
  coffeeConsumed: 3
};

console.log("Structured user object details:", user);

// Loop example:
const primes = [2, 3, 5, 7, 11];
console.log("Let's print some primes:");
primes.forEach((prime, idx) => {
  console.log(\`Prime #\${idx + 1}: \${prime}\`);
});
`;

interface ConsoleLog {
  type: 'log' | 'info' | 'warn' | 'error';
  content: string;
  timestamp: string;
}

export default function JsConsole() {
  const isDark = useDarkMode();
  const [code, setCode] = useState<string>(() => {
    return localStorage.getItem('devutils_js_console_code') || SAMPLE_JS;
  });
  const [outputs, setOutputs] = useState<ConsoleLog[]>([]);
  const [copied, setCopied] = useState<boolean>(false);

  // Save code to localStorage on change
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('devutils_js_console_code', code);
    }, 500);
    return () => clearTimeout(timer);
  }, [code]);

  const handleRun = () => {
    const logsList: ConsoleLog[] = [];
    const now = () => new Date().toLocaleTimeString();

    const stringifyValue = (val: any): string => {
      if (typeof val === 'object' && val !== null) {
        try {
          return JSON.stringify(val, null, 2);
        } catch {
          return String(val);
        }
      }
      return String(val);
    };

    // Creating Mock Console
    const mockConsole = {
      log: (...args: any[]) => {
        logsList.push({
          type: 'log',
          content: args.map(arg => stringifyValue(arg)).join(' '),
          timestamp: now(),
        });
      },
      info: (...args: any[]) => {
        logsList.push({
          type: 'info',
          content: args.map(arg => stringifyValue(arg)).join(' '),
          timestamp: now(),
        });
      },
      warn: (...args: any[]) => {
        logsList.push({
          type: 'warn',
          content: args.map(arg => stringifyValue(arg)).join(' '),
          timestamp: now(),
        });
      },
      error: (...args: any[]) => {
        logsList.push({
          type: 'error',
          content: args.map(arg => stringifyValue(arg)).join(' '),
          timestamp: now(),
        });
      },
    };

    try {
      // Sandboxed execution scope wrapping
      const runner = new Function('console', `
        try {
          ${code}
        } catch (err) {
          console.error(err.stack || err.message || err);
        }
      `);
      runner(mockConsole);
    } catch (err: any) {
      mockConsole.error(err.message || err);
    }

    setOutputs(logsList);
  };

  const handleClearOutput = () => {
    setOutputs([]);
  };

  const handleLoadSample = () => {
    setCode(SAMPLE_JS);
  };

  const handleCopyLogs = async () => {
    if (outputs.length === 0) return;
    const text = outputs.map(log => `[${log.timestamp}] [${log.type.toUpperCase()}] ${log.content}`).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      {/* Header Panel */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">JS Console Playground</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Execute JavaScript code snippets and inspect logging console</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLoadSample}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-655 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-all"
            title="Reload default console script"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Load Sample</span>
          </button>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

          <button
            onClick={handleRun}
            className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-600/10 transition-all cursor-pointer"
            title="Execute Code"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Run Script</span>
          </button>
        </div>
      </div>

      {/* Editor & Console Split Workspace */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 bg-white dark:bg-slate-950">

        {/* Editor Pane (Left Side) */}
        <div className="flex-1 flex flex-col border-r border-slate-200 dark:border-slate-850 min-h-0 relative">
          <Editor
            height="100%"
            defaultLanguage="javascript"
            language="javascript"
            theme={isDark ? "vs-dark" : "light"}
            value={code}
            onChange={(val) => setCode(val || '')}
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

        {/* Terminal/Console Output Pane (Right Side) */}
        <div className="flex-1 flex flex-col min-h-0 bg-slate-950 text-slate-200 border-l border-slate-800">

          {/* Output Toolbar */}
          <div className="flex items-center justify-between p-2 bg-slate-900 border-b border-slate-800 select-none">
            <span className="text-xs font-bold text-slate-400 px-2 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" />
              CONSOLE OUTPUT
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={handleCopyLogs}
                disabled={outputs.length === 0}
                className={`p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-40 disabled:hover:text-slate-400 transition-colors ${copied ? 'text-emerald-400 hover:text-emerald-300' : ''
                  }`}
                title="Copy Terminal Logs"
              >
                {copied ? <ClipboardCheck className="w-4 h-4" /> : <Clipboard className="w-4 h-4" />}
              </button>

              <button
                onClick={handleClearOutput}
                disabled={outputs.length === 0}
                className="p-1.5 rounded-lg text-slate-450 hover:text-red-400 disabled:opacity-40 disabled:hover:text-slate-450 transition-colors"
                title="Clear Terminal Outputs"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Logs Terminal Area */}
          <div className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-2 select-text">
            {outputs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 select-none">
                <Terminal className="w-12 h-12 mb-2 opacity-50" />
                <p>Console is empty. Click "Run Script" to execute code.</p>
              </div>
            ) : (
              outputs.map((log, index) => {
                let colorClass = 'text-slate-300';
                if (log.type === 'error') colorClass = 'text-rose-500 bg-rose-950/20 px-2 py-0.5 rounded border border-rose-900/30';
                if (log.type === 'warn') colorClass = 'text-amber-500 bg-amber-950/20 px-2 py-0.5 rounded border border-amber-900/30';
                if (log.type === 'info') colorClass = 'text-cyan-400';

                return (
                  <div key={index} className={`flex items-start gap-3 select-text py-0.5 border-b border-slate-900/50 last:border-b-0 leading-relaxed ${colorClass}`}>
                    <span className="text-[10px] text-slate-600 shrink-0 select-none mt-0.5">[{log.timestamp}]</span>
                    <pre className="whitespace-pre-wrap break-all select-text font-mono font-medium flex-1">{log.content}</pre>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
