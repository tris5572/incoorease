<script lang="ts">
  import DropZone from "./lib/DropZone.svelte";
  import Map from "./lib/Map.svelte";
  import Operation from "./lib/Operation.svelte";
</script>

<main>
  <Map />
  <Operation />
  <DropZone />
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
  }
  :global(#app) {
    margin: 0;
    padding: 0;
  }

  main {
    height: 100dvh;
    width: 100dvw;
  }
</style>
