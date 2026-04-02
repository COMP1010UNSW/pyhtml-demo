import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'url';
import packageLock from './package-lock.json';

type Package = {
  version: string;
  // ...
};

// TypeScript doesn't seem to be aware that RegExp.escape exists, due to it
// being relatively new.
// Manually delcare it.
// https://github.com/microsoft/TypeScript/issues/61321#issuecomment-2872057073
declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface RegExpConstructor {
    escape(str: string): string,
  }
}

function getPackageVersion(pkg: string): string {
  const matcher = new RegExp(`/${RegExp.escape(pkg)}$`);
  for (const p of Object.keys(packageLock.packages)) {
    const candidate = p as keyof typeof packageLock.packages;
    if (matcher.test(candidate)) {
      console.log(candidate);
      console.log(packageLock.packages[candidate].version);
      return packageLock.packages[candidate].version;
    }
  }
  throw Error(`Package not found in package-lock.json: ${pkg}`);
}

// Bundle pyodide
// https://pyodide.org/en/stable/usage/working-with-bundlers.html#vite
const PYODIDE_EXCLUDE = [
  '!**/*.{md,html}',
  '!**/*.d.ts',
  '!**/*.whl',
  '!**/pyodide/node_modules',
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
  // Get pyodide version
  // Based on: https://www.codestudy.net/blog/how-can-i-display-the-current-app-version-from-package-json-to-the-user-using-vite/#method-2-inject-version-via-vite-config-recommended
  define: {
    'import.meta.env.PYODIDE_VERSION': JSON.stringify(getPackageVersion('pyodide')),
  },
});
