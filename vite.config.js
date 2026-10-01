import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  build: {
    // Warn on chunks > 500 kB; target chunks < 350 kB after code-splitting
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        /**
         * Manual chunk strategy: split the largest view groups into isolated
         * async chunks so the initial JS bundle stays well under 350 kB.
         *
         * Chunk boundaries:
         *   vendor        — react, react-dom, lucide-react
         *   chunk-admin   — AdminPortal + AdminDashboard + AdminLoginPage (~68 KB)
         *   chunk-settings — SettingsPage (~82 KB)
         *   chunk-messages — MessagesPage (~52 KB)
         *   chunk-dashboard — remaining dashboard modules
         *   chunk-website  — public marketing pages
         *   chunk-auth     — auth & onboarding pages
         */
        manualChunks(id) {
          // Vendor: React core + UI library
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons';
          }

          // Admin Portal (heaviest set — isolated)
          if (id.includes('/pages/admin/')) {
            return 'chunk-admin';
          }

          // SettingsPage (82 KB — isolated)
          if (id.includes('/pages/dashboard/SettingsPage')) {
            return 'chunk-settings';
          }

          // MessagesPage (52 KB — isolated)
          if (id.includes('/pages/dashboard/MessagesPage')) {
            return 'chunk-messages';
          }

          // IntegrationsPage (33 KB)
          if (id.includes('/pages/dashboard/IntegrationsPage')) {
            return 'chunk-integrations';
          }

          // Remaining dashboard pages
          if (id.includes('/pages/dashboard/')) {
            return 'chunk-dashboard';
          }

          // Public marketing website pages
          if (id.includes('/pages/website/')) {
            return 'chunk-website';
          }

          // Auth & onboarding
          if (id.includes('/pages/auth/')) {
            return 'chunk-auth';
          }
        }
      }
    }
  }
});
