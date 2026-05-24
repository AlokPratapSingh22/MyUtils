import React, { useState, useEffect } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { Terminal, Search, Loader2, AlertCircle, ExternalLink } from 'lucide-react';

const QUICK_COMMANDS = ['tar', 'chmod', 'docker', 'git', 'grep', 'ssh', 'curl', 'find', 'ip', 'systemctl'];

export default function LinuxRef() {
  const [query, setQuery] = useState<string>('');
  const [currentCommand, setCurrentCommand] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [html, setHtml] = useState<string>('');

  const fetchCommandManual = async (commandName: string) => {
    if (!commandName.trim()) return;
    const cleanCommand = commandName.trim().toLowerCase();

    setLoading(true);
    setError(null);
    setHtml('');

    const commonUrl = `https://raw.githubusercontent.com/tldr-pages/tldr/main/pages/common/${cleanCommand}.md`;
    const linuxUrl = `https://raw.githubusercontent.com/tldr-pages/tldr/main/pages/linux/${cleanCommand}.md`;

    try {
      // 1. Try fetching from common pages catalog
      let response = await fetch(commonUrl);

      // 2. Fallback to linux specific catalog if common page returns 404/not ok
      if (!response.ok) {
        response = await fetch(linuxUrl);
      }

      if (!response.ok) {
        throw new Error(`Command "${cleanCommand}" was not found in the tldr-pages repository.`);
      }

      const markdown = await response.text();
      const parsed = marked.parse(markdown) as string;
      const sanitized = DOMPurify.sanitize(parsed);

      setHtml(sanitized);
      setCurrentCommand(cleanCommand);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve command manual.');
    } finally {
      setLoading(false);
    }
  };

  // Load tar as default on mount
  useEffect(() => {
    fetchCommandManual('tar');
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCommandManual(query);
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      {/* Header Panel */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-slate-200 dark:border-slate-850 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Linux Command Reference</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Search offline-friendly cheat sheets directly from the tldr-pages database</p>
          </div>
        </div>
      </div>

      {/* Workspace */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Search Box Card */}
          <div className="p-6 bg-white dark:bg-slate-950 border border-slate-205 dark:border-slate-850 rounded-2xl shadow-sm">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter command (e.g. tar, chmod, docker, git)..."
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-550/20 focus:bg-white dark:focus:bg-slate-950 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-sm shadow-indigo-600/10 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>Search</span>
              </button>
            </form>

            {/* Quick Links */}
            <div className="mt-4 flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1 select-none">Common Searches:</span>
              {QUICK_COMMANDS.map((cmd) => (
                <button
                  key={cmd}
                  onClick={() => {
                    setQuery(cmd);
                    fetchCommandManual(cmd);
                  }}
                  className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-all cursor-pointer ${currentCommand === cmd
                      ? 'bg-indigo-50 dark:bg-indigo-950/45 border-indigo-200 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400'
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-650 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                >
                  {cmd}
                </button>
              ))}
            </div>
          </div>

          {/* Results display panel */}
          {loading && (
            <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 rounded-2xl shadow-sm space-y-3">
              <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Searching raw git repository...</p>
            </div>
          )}

          {error && (
            <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-700 dark:text-red-300">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-sm">Command Not Found</span>
                <p className="text-xs text-red-650 dark:text-red-350 leading-relaxed">
                  We tried searching for <code className="px-1.5 py-0.5 bg-red-500/15 rounded font-mono text-[11px] font-bold">{query || currentCommand}</code> in both the <code className="font-mono text-[10px]">/common</code> and <code className="font-mono text-[10px]">/linux</code> directories of tldr-pages, but could not retrieve a manual.
                </p>
                <div className="pt-2 flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-500">Tips: Verify spelling (e.g. "tar" instead of "tarball") or try another program.</span>
                </div>
              </div>
            </div>
          )}

          {html && !loading && (
            <div className="bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-250">
              {/* Card Titlebar */}
              <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-900/20 border-b border-slate-200/65 dark:border-slate-850/65 flex justify-between items-center select-none">
                <div className="flex items-center gap-2">
                  <code className="text-sm font-bold text-indigo-600 dark:text-indigo-400 px-2 py-0.5 bg-indigo-500/10 rounded-md">
                    {currentCommand}
                  </code>
                  <span className="text-xs text-slate-400">Manual sheet</span>
                </div>
                <a
                  href={`https://github.com/tldr-pages/tldr/blob/main/pages/common/${currentCommand}.md`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  <span>View Source</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Rendered HTML Markdown Body */}
              <div className="p-6 md:p-8 select-text">
                <article
                  className="prose-custom max-w-none text-sm break-words select-text"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
