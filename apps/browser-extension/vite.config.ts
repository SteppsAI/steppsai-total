import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
    plugins: [react(), tailwindcss()],
    base: './',  // Use relative paths for Chrome extension compatibility
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
            '@user-app': resolve(__dirname, '../user-application'),
        },
    },
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                sidepanel: resolve(__dirname, 'sidepanel.html'),
                offscreen: resolve(__dirname, 'offscreen.html'),
                selection: resolve(__dirname, 'selection.html'),
                background: resolve(__dirname, 'src/background/index.ts'),
                content: resolve(__dirname, 'src/content/index.ts'),
            },
            output: {
                entryFileNames: 'assets/[name].js',
                chunkFileNames: 'assets/[name].js',
                assetFileNames: 'assets/[name].[ext]',
            },
        },
    },
});
