<script>
  import { onMount } from "svelte";
  import abcjs from "../../vendor/abcjs/dist/abcjs.bundle.js";
  import Splitter from "../Splitter/Splitter.svelte";
  import MonacoEditor from "../MonacoEditor/MonacoEditor.svelte";

  onMount(() => {
    abcjs.renderAbc("note-staff", "X:1\nK:C\nCDEFGABcdefgab");
  });
</script>

<div class="abcrun-box">
  <div id="note-staff"></div>
  <MonacoEditor />
</div>

<style>
  .abcrun-box {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    border: none;
  }
</style>
