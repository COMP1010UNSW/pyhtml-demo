<script lang="ts">
  import { evalPyHTML, getPyodide } from '$lib';
  import { onMount } from 'svelte';
  import { MediaQuery } from 'svelte/reactivity';
  // Editor
  import CodeMirror from 'svelte-codemirror-editor';
  // Editor syntax highlights
  import { python as langPython } from '@codemirror/lang-python';
  import { html as langHtml } from '@codemirror/lang-html';
  // Editor themes
  import { highContrastDark } from '@fsegurai/codemirror-theme-high-contrast-dark';
  import { highContrastLight } from '@fsegurai/codemirror-theme-high-contrast-light';
  import { materialDark } from '@fsegurai/codemirror-theme-material-dark';
  import { materialLight } from '@fsegurai/codemirror-theme-material-light';

  const prefersDark = new MediaQuery('prefers-color-scheme: dark');
  const prefersHighContrast = new MediaQuery('prefers-contrast: more');

  const editorTheme = $derived.by(() => {
    if (prefersDark.current) {
      return prefersHighContrast.current ? highContrastDark : materialDark;
    } else {
      return prefersHighContrast.current ? highContrastLight : materialLight;
    }
  });

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
  let pythonError = $state('');

  async function renderHtml() {
    try {
      htmlCode = await evalPyHTML(pyhtmlCode);
      pythonError = '';
    } catch (e) {
      htmlCode = '';
      pythonError = `${e}`;
    }
  }

  let pyodideReady = $state(false);
  let pyodideError: string | undefined = $state(undefined);

  let pyodideStatus = $state('Please wait...');

  function pyodideStatusUpdate(status: string) {
    pyodideStatus = status;
  }

  onMount(async () => {
    try {
      await getPyodide(pyodideStatusUpdate);
      await renderHtml();
      pyodideReady = true;
    } catch (e) {
      console.error(e);
      pyodideError = `${e}`;
    }
  });
</script>

<svelte:head>
  <title>Try out PyHTML</title>
</svelte:head>

<main>

  <h1 class="title">Try out PyHTML</h1>
  {#if pyodideReady}
    <div class="editor">
      <h2>Write some code</h2>
      <div class="code-block">
        <CodeMirror
          bind:value={pyhtmlCode}
          lang={langPython()}
          tabSize={4}
          onchange={renderHtml}
          theme={editorTheme}
        />
      </div>
    </div>

    <div class="preview">
      <h2>Page preview</h2>
      <iframe srcdoc={htmlCode} title="PyHTML preview" frameborder="0"></iframe>
    </div>

    <div class="html">
      {#if pythonError === ''}
        <h2>HTML preview</h2>
        <div class="code-block">
          <CodeMirror
            value={htmlCode}
            lang={langHtml()}
            tabSize={2}
            editable={false}
            theme={editorTheme}
          />
        </div>
      {:else}
        <h2>Evaluation error</h2>
        <div class="code-block">
          <CodeMirror
            value={pythonError}
            lang={langPython()}
            tabSize={4}
            editable={false}
            theme={editorTheme}
          />
        </div>
      {/if}
    </div>
  {:else if pyodideError}
    <h2>Oh no!</h2>
    <p>Pyodide failed to load!</p>
    <p>{pyodideError}</p>
  {:else}
    <div class="status-outer">
      <div class="status-inner">
        <i class="las la-sync spin"></i>
        <p class="status-text">{pyodideStatus}</p>
      </div>
    </div>
  {/if}
</main>

<style>
  :root {
    font-family: Verdana, Geneva, Tahoma, sans-serif;
    margin: 0;
    padding: 0;
  }

  /* Responsive design */
  @media only screen and (min-width: 1000px) {
    main {
      display: grid;
      grid-template-areas:
        'title title'
        'editor preview'
        'editor html';
      grid-template-columns: 50% 50%;
      grid-template-rows: 100px calc(50% - 50px) calc(50% - 50px);
      height: 100%;
      max-height: 100vh;
    }
  }

  main {
    height: 100%;
  }

  h1 {
    margin: 0px;
    padding: 10px;
  }

  h1, h2 {
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

  .code-block {
    height: 100%;
    width: 100%;
    overflow: scroll;
  }

  .title {
    grid-area: title;
  }
  .editor {
    grid-area: editor;
  }

  .preview {
    grid-area: preview;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  .preview iframe {
    width: 100%;
    height: 100%;
    border: 1px solid black;
    background-color: white;
  }

  .html {
    grid-area: html;
  }

  @media (prefers-color-scheme: dark) {
    :root {
      color: white;
      background-color: #121212;
    }
    @media (prefers-contrast: more) {
      :root {
        background-color: black;
      }
    }
  }
</style>
