import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'public/manifest.json',
          dest: '.',
        }
      ],
    }),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'build',
    rollupOptions: {
      input: {
        main: resolve(__dirname, './index.html'),
        background: resolve(__dirname, './src/extension/background.ts'),
        // popup: resolve(__dirname, 'src/popup.html'),
        // content: resolve(__dirname, 'src/content.ts'),
      },
      output: {
        entryFileNames: '[name].js', // Specify output as JS files
      },
    },
  },
});