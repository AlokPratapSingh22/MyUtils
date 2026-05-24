import { type LucideIcon, FileJson, GitCompare, FileText, Terminal, Palette, BookOpen } from 'lucide-react';
import type React from 'react';
import JsonViewer from './utilities/JsonViewer';
import CodeDiff from './utilities/CodeDiff';
import MdNotes from './utilities/MdNotes';
import JsConsole from './utilities/JsConsole';
import Whiteboard from './utilities/Whiteboard';
import LinuxRef from './utilities/LinuxRef';

export interface UtilityModule {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  component: React.ComponentType;
}

export const utilitiesRegistry: UtilityModule[] = [
  {
    id: 'json-viewer',
    name: 'JSON Viewer & Formatter',
    description: 'Format, minify, and inspect JSON payloads with error validation.',
    icon: FileJson,
    component: JsonViewer,
  },
  {
    id: 'code-diff',
    name: 'Text & Code Diff',
    description: 'Compare two text snippets side-by-side or inline with formatting controls.',
    icon: GitCompare,
    component: CodeDiff,
  },
  {
    id: 'markdown-notes',
    name: 'Markdown Notes',
    description: 'Write markdown notes with live preview and local storage autosave.',
    icon: FileText,
    component: MdNotes,
  },
  {
    id: 'js-console',
    name: 'JS Console Playground',
    description: 'Execute JavaScript code snippets and inspect logging console output.',
    icon: Terminal,
    component: JsConsole,
  },
  {
    id: 'whiteboard',
    name: 'Whiteboard & Diagramming',
    description: 'Sketch ideas, wireframes, flowcharts, and diagrams client-side.',
    icon: Palette,
    component: Whiteboard,
  },
  {
    id: 'linux-ref',
    name: 'Linux Command Reference',
    description: 'Retrieve search cheat sheets and tldr manuals for command tools.',
    icon: BookOpen,
    component: LinuxRef,
  },
];
