
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    minify: true,
    // Use more advanced code splitting strategy
    cssCodeSplit: true,
    modulePreload: {
      polyfill: true,
    },
    rollupOptions: {
      output: {
        // Implement more granular chunk strategy
        manualChunks(id) {
          // Core React libraries
          if (id.includes('node_modules/react/') || 
              id.includes('node_modules/react-dom/')) {
            return 'react-core';
          }
          
          // React router
          if (id.includes('node_modules/react-router') || 
              id.includes('node_modules/history') ||
              id.includes('node_modules/@remix-run')) {
            return 'router';
          }
          
          // Radix UI components (split into smaller chunks)
          if (id.includes('node_modules/@radix-ui')) {
            if (id.includes('dialog') || id.includes('popover') || id.includes('modal')) {
              return 'ui-overlays';
            }
            if (id.includes('accordion') || id.includes('tabs') || id.includes('collapsible')) {
              return 'ui-containers';
            }
            if (id.includes('form') || id.includes('checkbox') || id.includes('radio') || id.includes('select')) {
              return 'ui-inputs';
            }
            return 'ui-base';
          }
          
          // Form libraries
          if (id.includes('node_modules/react-hook-form') || 
              id.includes('node_modules/@hookform') ||
              id.includes('node_modules/zod')) {
            return 'forms';
          }
          
          // Charts
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3')) {
            return 'charts';
          }
          
          // Animation
          if (id.includes('node_modules/framer-motion')) {
            return 'animation';
          }
          
          // Document processing
          if (id.includes('node_modules/docx') || 
              id.includes('node_modules/file-saver') || 
              id.includes('node_modules/pdfjs-dist')) {
            return 'document-processing';
          }
          
          // Utilities
          if (id.includes('node_modules/date-fns') ||
              id.includes('node_modules/lodash') ||
              id.includes('node_modules/clsx') ||
              id.includes('node_modules/class-variance-authority') ||
              id.includes('node_modules/tailwind-merge')) {
            return 'utils';
          }
          
          // AI/OpenAI
          if (id.includes('node_modules/openai') || 
              id.includes('node_modules/langchain')) {
            return 'ai';
          }
          
          // Supabase
          if (id.includes('node_modules/@supabase')) {
            return 'supabase';
          }
        },
        // Optimize file names and organization
        entryFileNames: 'assets/js/[name]-[hash].js',
        chunkFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: ({ name }) => {
          // Put CSS files in their own directory
          if (/\.css$/.test(name ?? '')) {
            return 'assets/css/[name]-[hash][extname]';
          }
          // Put images in their own directory
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(name ?? '')) {
            return 'assets/img/[name]-[hash][extname]';
          }
          // Put fonts in their own directory
          if (/\.(woff|woff2|eot|ttf|otf)$/.test(name ?? '')) {
            return 'assets/fonts/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      },
    },
  }
}));
