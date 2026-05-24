import { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import {
  utilitiesRegistry,
  type UtilityModule
} from './registry';
import {
  Menu,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Cpu,
  LayoutDashboard,
  ExternalLink,
  Sparkles
} from 'lucide-react';

export default function App() {
  return (
    <HashRouter>
      <AppShell />
    </HashRouter>
  );
}

function AppShell() {
  const location = useLocation();

  // Theme Management
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Sidebar Collapse state
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', String(isCollapsed));
  }, [isCollapsed]);

  // Mobile Menu state
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200">

      {/* Sidebar - Desktop Layout */}
      <aside
        className={`hidden md:flex flex-col h-full bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-850 shrink-0 transition-all duration-300 relative overflow-x-hidden ${isCollapsed ? 'w-16' : 'w-64'
          }`}
      >
        {/* Logo and App Title */}
        <div className="flex items-center h-16 px-4 border-b border-slate-100 dark:border-slate-900 select-none overflow-hidden">
          <Link to="/" className="flex items-center gap-3 font-bold text-indigo-650 dark:text-indigo-400">
            <Cpu className="w-6 h-6 flex-shrink-0 animate-pulse text-indigo-600 dark:text-indigo-400" />
            {!isCollapsed && (
              <span className="text-lg tracking-tight bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-400">
                DevUtils Hub
              </span>
            )}
          </Link>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto overflow-x-hidden">
          {/* Dashboard Link */}
          <Link
            to="/"
            className={`flex items-center rounded-xl text-sm font-medium transition-all group relative ${isCollapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5'
              } ${location.pathname === '/' || location.pathname === '/dashboard'
                ? 'bg-gradient-to-r from-indigo-605 to-indigo-500 text-white shadow-md shadow-indigo-550/15'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
          >
            <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span>Dashboard</span>}

            {/* Tooltip for collapsed mode */}
            {isCollapsed && (
              <div className="absolute left-14 scale-0 group-hover:scale-100 px-2 py-1 bg-slate-900 text-white text-xs rounded-md shadow-md border border-slate-700 whitespace-nowrap transition-all z-20 pointer-events-none">
                Dashboard
              </div>
            )}
          </Link>

          <div className="my-3 mx-2 border-t border-slate-100 dark:border-slate-900" />

          {/* Active Utility Links */}
          {utilitiesRegistry.map((item: UtilityModule) => {
            const isActive = location.pathname === `/${item.id}`;
            return (
              <Link
                key={item.id}
                to={`/${item.id}`}
                className={`flex items-center rounded-xl text-sm font-medium transition-all group relative ${isCollapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5'
                  } ${isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/10'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="truncate">{item.name}</span>}

                {/* Collapsed Tooltip */}
                {isCollapsed && (
                  <div className="absolute left-14 scale-0 group-hover:scale-100 px-2 py-1 bg-slate-900 text-white text-xs rounded-md shadow-md border border-slate-700 whitespace-nowrap transition-all z-20 pointer-events-none">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer controls & theme switch inside sidebar */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-900 space-y-2">
          {/* Theme switcher */}
          <button
            onClick={toggleTheme}
            className={`flex items-center justify-center w-full rounded-xl text-sm font-medium text-slate-655 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200 transition-all cursor-pointer ${isCollapsed ? 'px-0 py-2' : 'gap-2 px-3 py-2'
              }`}
            title="Toggle color theme"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-5 h-5 text-amber-550 fill-amber-500/20" />
                {!isCollapsed && <span>Light Mode</span>}
              </>
            ) : (
              <>
                <Moon className="w-5 h-5 text-indigo-600" />
                {!isCollapsed && <span>Dark Mode</span>}
              </>
            )}
          </button>

          {/* Sidebar Collapse Toggle Arrow */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`hidden md:flex items-center justify-center w-full rounded-xl text-xs text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-700 dark:hover:text-slate-300 transition-all cursor-pointer ${isCollapsed ? 'px-0 py-2' : 'gap-2 px-3 py-2'
              }`}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? (
              <>
                <ChevronRight className="w-5 h-5" />
              </>
            ) : (
              <>
                <ChevronLeft className="w-5 h-5" />
                <span>Collapse Panel</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Sidebar Overlay */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer Navigation Pane */}
      <aside
        className={`md:hidden fixed inset-y-0 left-0 w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-850 z-50 flex flex-col transition-transform duration-300 transform ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100 dark:border-slate-900">
          <div className="flex items-center gap-3 font-bold text-indigo-600 dark:text-indigo-450">
            <Cpu className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span className="text-lg tracking-tight bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-400">
              DevUtils Hub
            </span>
          </div>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          <Link
            to="/"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${location.pathname === '/' || location.pathname === '/dashboard'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>

          <div className="my-3 mx-2 border-t border-slate-100 dark:border-slate-900" />

          {utilitiesRegistry.map((item: UtilityModule) => {
            const isActive = location.pathname === `/${item.id}`;
            return (
              <Link
                key={item.id}
                to={`/${item.id}`}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-100 dark:border-slate-900">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm font-medium text-slate-655 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all cursor-pointer"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-5 h-5 text-amber-550 fill-amber-500/20" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-5 h-5 text-indigo-600" />
                <span>Dark Mode</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">

        {/* Mobile Header Bar */}
        <header className="md:hidden flex items-center justify-between h-16 px-4 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-850 shrink-0">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 focus:outline-none"
            title="Open side menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <Link to="/" className="flex items-center gap-2 font-bold text-indigo-600 dark:text-indigo-400">
            <Cpu className="w-5 h-5 animate-pulse" />
            <span className="text-sm tracking-tight">DevUtils Hub</span>
          </Link>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 focus:outline-none"
            title="Toggle color theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-600" />}
          </button>
        </header>

        {/* Content routing container */}
        <main className="flex-1 overflow-hidden min-h-0 relative">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Dynamically generated routes from registry */}
            {utilitiesRegistry.map((item: UtilityModule) => (
              <Route
                key={item.id}
                path={`/${item.id}`}
                element={<item.component />}
              />
            ))}

            {/* Redirect fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

    </div>
  );
}

// Dashboard Landing Screen
function Dashboard() {
  return (
    <div className="h-full w-full overflow-y-auto bg-slate-50 dark:bg-slate-900 p-6 md:p-10 select-none">
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">

        {/* Banner Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 p-8 md:p-12 text-white shadow-xl shadow-indigo-600/10">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />
          <div className="absolute left-1/3 bottom-0 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

          <div className="max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md border border-white/10 text-indigo-100">
              <Sparkles className="w-3.5 h-3.5" />
              100% Client-Side
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Developer Utilities Workspace
            </h1>
            <p className="text-sm md:text-base text-indigo-100 font-medium max-w-xl leading-relaxed">
              A premium, offline-first collection of essential tools for developers. No data ever leaves your computer—all parsing, formatting, and diffing occurs purely inside your browser.
            </p>
          </div>
        </div>

        {/* Utilities Directory Grid */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Available Utilities</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {utilitiesRegistry.map((item: UtilityModule) => (
              <Link
                key={item.id}
                to={`/${item.id}`}
                className="group relative flex flex-col justify-between p-6 bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 hover:border-indigo-500/50 dark:hover:border-indigo-550/50 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/5 dark:hover:shadow-indigo-500/5 duration-300"
              >
                <div className="space-y-4">
                  {/* Icon badge */}
                  <div className="inline-flex p-3 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                    <item.icon className="w-6 h-6" />
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:gap-1.5 transition-all">
                  <span>Open Utility</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
