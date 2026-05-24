import { useState, useEffect } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';

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

export default function Whiteboard() {
  const isDark = useDarkMode();

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 dark:bg-slate-900 transition-colors duration-200">

      {/* Canvas container with calculated height to fill remaining viewport height */}
      <div className="flex-1 w-full bg-white dark:bg-slate-950 relative min-h-0" style={{ height: 'calc(100vh - 5rem)' }}>
        <Excalidraw
          theme={isDark ? 'dark' : 'light'}
          UIOptions={{
            canvasActions: {
              toggleTheme: false, // Sync theme with App Shell
            }
          }}
        />
      </div>
    </div>
  );
}
