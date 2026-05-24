import { useState, useEffect, useRef } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { FileText, Bold, Italic, Link, Code, Quote, List, Table, Image, Download, Sparkles } from 'lucide-react';

const DEFAULT_MARKDOWN = `# Markdown Notes

Welcome to the **Developer Utilities Markdown Editor**! 

This is a premium, client-side markdown workspace. Your changes are automatically saved to your browser's \`localStorage\` on the fly.

## Key Features

1. **Split-pane Layout**: Live editing on the left, instant sanitized preview on the right.
2. **Auto-save**: Never lose your notes. A debounced auto-save engine backs up to local storage.
3. **HTML Sanitization**: Powered by \`DOMPurify\` to block any XSS or malicious scripts.
4. **Rich Toolbar**: Quickly format text with the utility buttons at the top of the editor.

---

### Code Formatting

Create inline code blocks like \`const dev = true;\` or full code blocks:

\`\`\`typescript
interface Developer {
  name: string;
  role: string;
  coffeeLevel: number;
}

const user: Developer = {
  name: "Alex",
  role: "Software Engineer",
  coffeeLevel: 100
};
\`\`\`

### Quotes & Blockquotes

> "Simplicity is the ultimate sophistication."
> — *Leonardo da Vinci*

### Tables & Lists

- **Client-side only**: 100% local processing.
- **Responsive design**: Works on tablets and desktops.
- **Easy download**: Export your note as a \`.md\` file with one click.

| Utility Name | Tech Stack | Status |
| :--- | :--- | :---: |
| JSON Viewer | Monaco Editor | Done |
| Text Code Diff | Monaco DiffEditor | Done |
| Markdown Notes | React + Marked | Done |

---
Enjoy writing!
`;

export default function MdNotes() {
  const [markdown, setMarkdown] = useState<string>(() => {
    return localStorage.getItem('devutils_markdown_notes') || DEFAULT_MARKDOWN;
  });
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Debounced auto-save to localStorage
  useEffect(() => {
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      localStorage.setItem('devutils_markdown_notes', markdown);
      setSaveStatus('saved');
    }, 500);

    return () => clearTimeout(timer);
  }, [markdown]);

  // Insert markdown helpers helper function
  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const selectedText = text.substring(start, end);
    const replacement = before + selectedText + after;

    setMarkdown(text.substring(0, start) + replacement + text.substring(end));
    
    // Reset focus and selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 50);
  };

  // Compile markdown to sanitized HTML
  const getHtmlContent = () => {
    try {
      const parsed = marked.parse(markdown) as string;
      return DOMPurify.sanitize(parsed);
    } catch (err) {
      console.error(err);
      return `<p class="text-red-500 font-mono">Error parsing markdown</p>`;
    }
  };

  // Word and character counts
  const getStats = () => {
    const chars = markdown.length;
    const words = markdown.trim() === '' ? 0 : markdown.trim().split(/\s+/).length;
    return { chars, words };
  };

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'markdown_note.md');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const stats = getStats();

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      {/* Header Panel */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Markdown Notes</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Write structured markdown with interactive live preview</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Save Status Badge */}
          <div className="flex items-center gap-1.5 text-xs">
            {saveStatus === 'saved' ? (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-full font-medium border border-emerald-200/50 dark:border-emerald-900/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                Auto-saved
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1 rounded-full font-medium border border-amber-200/50 dark:border-amber-900/30">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                Saving...
              </span>
            )}
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

          {/* Export Button */}
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-600/10 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .md</span>
          </button>
        </div>
      </div>

      {/* Editor & Preview Split Workspace */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 bg-white dark:bg-slate-950">
        
        {/* LEFT COLUMN: Editing Workspace */}
        <div className="flex-1 flex flex-col border-r border-slate-200 dark:border-slate-800 min-h-0">
          
          {/* Format Toolbar */}
          <div className="flex items-center justify-between gap-1 p-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => insertMarkdown('**', '**')}
                className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Bold"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                onClick={() => insertMarkdown('*', '*')}
                className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Italic"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                onClick={() => insertMarkdown('[', '](url)')}
                className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Insert Link"
              >
                <Link className="w-4 h-4" />
              </button>
              <button
                onClick={() => insertMarkdown('`', '`')}
                className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Insert Inline Code"
              >
                <Code className="w-4 h-4" />
              </button>
              <button
                onClick={() => insertMarkdown('\n```javascript\n', '\n```\n')}
                className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Insert Code Block"
              >
                <Sparkles className="w-4 h-4" />
              </button>
              <button
                onClick={() => insertMarkdown('\n> ', '\n')}
                className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Blockquote"
              >
                <Quote className="w-4 h-4" />
              </button>
              <button
                onClick={() => insertMarkdown('\n- ', '\n')}
                className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Unordered List"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => insertMarkdown('\n| Header 1 | Header 2 |\n| :--- | :--- |\n| Row 1 | Data 1 |\n| Row 2 | Data 2 |\n')}
                className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Insert Table"
              >
                <Table className="w-4 h-4" />
              </button>
              <button
                onClick={() => insertMarkdown('![Image Alt Text](', ')') }
                className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Insert Image"
              >
                <Image className="w-4 h-4" />
              </button>
            </div>
            
            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono px-2 select-none">
              Markdown Mode
            </div>
          </div>

          {/* Textarea Workspace */}
          <textarea
            ref={textareaRef}
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            className="flex-1 p-4 bg-white dark:bg-slate-950 border-0 outline-none text-slate-800 dark:text-slate-100 font-mono text-sm leading-relaxed resize-none overflow-y-auto focus:ring-0"
            placeholder="Write some markdown here..."
          />

          {/* Stats Bar */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-550 dark:text-slate-400 font-mono">
            <span>Words: <strong className="text-slate-700 dark:text-slate-300">{stats.words}</strong></span>
            <span>Characters: <strong className="text-slate-700 dark:text-slate-300">{stats.chars}</strong></span>
          </div>
        </div>

        {/* RIGHT COLUMN: Live HTML Rendered Preview */}
        <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50 dark:bg-slate-900/10">
          {/* Preview Tab Header */}
          <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 select-none">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-2">LIVE RENDERED PREVIEW</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono px-2">Sanitized</span>
          </div>

          {/* Render Pane */}
          <div className="flex-1 p-6 overflow-y-auto bg-white dark:bg-slate-950 select-text">
            <article 
              className="prose-custom max-w-none text-sm break-words select-text"
              dangerouslySetInnerHTML={{ __html: getHtmlContent() }}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
