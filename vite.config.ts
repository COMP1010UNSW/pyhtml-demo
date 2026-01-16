import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'url';


const PYODIDE_EXCLUDE = [
    '!**/*.{md,html}',
    '!**/*.d.ts',
    '!**/*.whl',
    '!**/node_modules',
];

export function viteStaticCopyPyodide() {
    const pyodideDir = dirname(fileURLToPath(import.meta.resolve('pyodide')));
    return viteStaticCopy({
        targets: [
            {
                src: [join(pyodideDir, '*')].concat(PYODIDE_EXCLUDE),
                // Don't export to 'assets', or we'll get a 404 in production
                dest: '_app/immutable/nodes',
            },
        ],
    });
}


export default defineConfig({
    plugins: [viteStaticCopyPyodide(), sveltekit()],
    optimizeDeps: { exclude: ["pyodide"] },
});
