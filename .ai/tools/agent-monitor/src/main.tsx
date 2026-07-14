/**
 * @file .ai/tools/agent-monitor/src/main.tsx
 * @version 0.1.0 - 2026-05-05 00:05
 * @docref DOC-SYSTEM-SPEC-032
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-032-agent-runtime-and-worker-sessions.md
 * @description Browser entrypoint for the local worker-session monitor. It
 * mounts the read-only UI and keeps session registry access behind adapters.
 *
 * Changes in version 0.1.0:
 * - Added the initial React root for the monitor shell.
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import '@xyflow/react/dist/style.css';
import './styles/global.css';
import { App } from './App';

createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
