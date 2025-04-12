import { loadPyodide, type PyodideInterface } from 'pyodide';


/**
 * Set up Pyodide and install pyhtml-enhanced.
 */
async function pyodideInit() {
  const pyodide = await loadPyodide();
  await pyodide.loadPackage("micropip");
  const micropip = pyodide.pyimport("micropip");
  await micropip.install('pyhtml-enhanced');
  return pyodide;
}

let pyodide: PyodideInterface;

export async function getPyodide() {
  if (pyodide) return pyodide;
  pyodide = await pyodideInit();
  return pyodide;
}

export async function evalPyHTML(pyhtml: string): Promise<string> {
  const pyodide = await getPyodide();
  return pyodide.runPython(pyhtml) as string;
}
