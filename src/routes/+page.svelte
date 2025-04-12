<script lang="ts">
  import { evalPyHTML, getPyodide } from '$lib';
  import { onMount } from 'svelte';
  import CodeMirror from 'svelte-codemirror-editor';
  import { python } from '@codemirror/lang-python';

  let pyhtmlCode = $state(
    `import pyhtml as p

p.html(
    p.head(
        p.title("Hello, world!"),
    ),
    p.body(
        p.h1("Hello, world!"),
        p.p("This content is being dynamically generated using PyHTML!"),
    ),
)
`,
  );

  let htmlCode = $state('');

  async function renderHtml() {
    htmlCode = await evalPyHTML(pyhtmlCode);
  }

  let pyodideReady = $state(false);

  let pyodideStatus = $state('Please wait...');

  function pyodideStatusUpdate(status: string) {
    pyodideStatus = status;
  }

  onMount(async () => {
    await getPyodide(pyodideStatusUpdate);
    console.log('Pyodide is ready');
    renderHtml();
    pyodideReady = true;
  });
</script>

<h1>Try out PyHTML</h1>
{#if pyodideReady}
  <main>
    <div class="editor">
      <h2>Write some code</h2>
      <CodeMirror
        bind:value={pyhtmlCode}
        lang={python()}
        on:change={renderHtml}
      />
    </div>

    <div class="preview">
      <h2>Page preview</h2>
      <iframe srcdoc={htmlCode} title="PyHTML preview" frameborder="0"></iframe>
    </div>

    <div class="html">
      <h2>HTML preview</h2>
      <pre><code>{htmlCode}</code></pre>
    </div>
  </main>
{:else}
<div class="status-outer">
  <div class="status-inner">
    <i class="las la-sync spin"></i>
    <p class="status-text">{pyodideStatus}</p>
  </div>
</div>
{/if}

<style>
  :root {
    font-family: Verdana, Geneva, Tahoma, sans-serif;
  }

  h1 {
    margin: 0px;
    padding: 10px;
  }
  h1,
  h2 {
    text-align: center;
  }

  /* Status message when loading */
  .status-outer {
    width: 100%;
    display: flex;
    justify-content: center;
  }
  .status-inner {
    min-width: 300px;
    display: flex;
    gap: 10px;
  }
  .status-text {
    width: 100%;
  }
  .spin {
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: rotating 2s linear infinite;
  }
  @keyframes rotating {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  /* Responsive design */
  @media only screen and (min-width: 1000px) {
    main {
      display: grid;
      grid-template-areas:
        'editor preview'
        'editor html';
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr 1fr;

      width: 100%;
      height: 100%;
    }
  }

  .editor {
    grid-area: editor;
    height: 100%;
    width: 100%;
    overflow: scroll;
  }

  .preview {
    grid-area: preview;
    height: 100%;
  }
  .preview iframe {
    width: 100%;
    height: 100%;
  }

  .html {
    grid-area: html;
    height: 100%;
    width: 100%;
  }

  .html pre {
    overflow: scroll;
  }
</style>
