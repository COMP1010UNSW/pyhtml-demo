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

  onMount(async () => {
    await getPyodide();
    console.log('Pyodide is ready');
    renderHtml();
    pyodideReady = true;
  });
</script>

<h1>Test out PyHTML</h1>
{#if pyodideReady}
  <p>Pyodide loaded successfully!</p>
  <main>
    <div class="editor">
      <CodeMirror
        bind:value={pyhtmlCode}
        lang={python()}
        on:change={renderHtml}
      />
    </div>

    <div class="preview">
      <iframe srcdoc={htmlCode} title="PyHTML preview" frameborder="0"></iframe>
    </div>

    <div class="html">
      <pre><code>{htmlCode}</code></pre>
    </div>
  </main>
{:else}
  <p>Pyodide is loading...</p>
{/if}

<style>
  main {
    display: grid;
    grid-template-areas:
      'editor preview'
      'editor html';
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;

    width: 100%;
    min-height: 100%;
  }

  .editor {
    grid-area: editor;
    height: 100%;
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
  }
</style>
