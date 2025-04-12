import { loadPyodide, type PyodideInterface } from 'pyodide';

const PYODIDE_VERSION = 'v0.27.5';

/**
 * Set up Pyodide and install pyhtml-enhanced.
 */
async function pyodideInit(onStatusUpdate: (status: string) => void) {
  onStatusUpdate("Loading pyodide...");
  const pyodide = await loadPyodide({
    indexURL: `https://cdn.jsdelivr.net/pyodide/${PYODIDE_VERSION}/full`
  });
  onStatusUpdate("Loading micropip...");
  await pyodide.loadPackage("micropip");
  const micropip = pyodide.pyimport("micropip");
  onStatusUpdate("micropip install pyhtml-enhanced");
  await micropip.install('pyhtml-enhanced');
  return pyodide;
}

let pyodide: PyodideInterface;

export async function getPyodide(onStatusUpdate: (status: string) => void) {
  if (pyodide) return pyodide;
  pyodide = await pyodideInit(onStatusUpdate);
  return pyodide;
}

export async function evalPyHTML(pyhtml: string): Promise<string> {
  const pyodide = await getPyodide(() => { });
  return pyodide.runPython(pyhtml) as string;
}
