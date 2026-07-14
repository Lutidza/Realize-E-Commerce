/**
 * @file .ai/tools/agent-monitor/vite.config.ts
 * @version 0.4.1 - 2026-05-14 00:00
 * @docref DOC-SYSTEM-SPEC-042
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-042-agent-monitor-runtime-observability.md
 * @description Vite configuration for the local worker-session monitor. The
 * tool is isolated to the development environment contour and Vite is used
 * only as the frontend dev/build tool; runtime data is owned by the Agent
 * Runtime gateway.
 *
 * Changes in version 0.4.1:
 * - Locked the monitor dev and preview server to the approved loopback URL.
 */
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const toolRoot = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      '@': resolve(toolRoot, 'src'),
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
  },
  preview: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
  },
});
