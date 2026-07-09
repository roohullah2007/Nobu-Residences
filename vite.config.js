import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import path from 'path';

// On Windows the esbuild child process keeps a pipe open after the bundle is
// written, so `vite build` never exits and `&& vite build --ssr` never runs.
// Force-exit once the bundle is fully closed (last plugin hook of the build).
const forceExitAfterBuild = {
    name: 'force-exit-after-build',
    apply: 'build',
    closeBundle: {
        sequential: true,
        order: 'post',
        handler() {
            setTimeout(() => process.exit(0), 500);
        },
    },
};

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            ssr: 'resources/js/ssr.jsx',
            refresh: true,
        }),
        react(),
        forceExitAfterBuild,
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'resources/js'),
        },
    },
});
