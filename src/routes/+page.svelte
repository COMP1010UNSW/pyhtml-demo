<script lang="ts">
  import { evalPyHTML, getPyodide } from '$lib';
  import { onMount } from 'svelte';

  let pyhtmlCode = $state(`
p.html(
    p.head(
        p.title("Hello, world!"),
    ),
    p.body(
        p.h1("Hello, world!"),
        p.p("This content is being dynamically generated using PyHTML!"),
    ),
)
  `.trim());

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
  <textarea name="" id="" bind:value={pyhtmlCode} oninput={renderHtml}>
  </textarea>

  <pre>
  <code>
{htmlCode}
  </code>
</pre>

  <iframe srcdoc={htmlCode} title="PyHTML preview" frameborder="0"></iframe>
{:else}
  <p>Pyodide is loading...</p>
{/if}
