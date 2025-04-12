import { loadPyodide } from 'pyodide';

/**
 * Set up Pyodide and install pyhtml-enhanced.
 */
export async function pythonInit() {
  let pyodide = await loadPyodide();
  await pyodide.loadPackage("micropip");
  const micropip = pyodide.pyimport("micropip");
  await micropip.install('pyhtml-enhanced');
  return pyodide;
}
