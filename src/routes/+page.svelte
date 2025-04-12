<script lang="ts">
  import { pythonInit } from '$lib';

  const pyodide = pythonInit();
</script>

<h1>Test out PyHTML</h1>

{#await pyodide}
  <p>Pyodide is loading...</p>
{:then pyodide}
  <p>Pyodide loaded successfully!</p>
{/await}
