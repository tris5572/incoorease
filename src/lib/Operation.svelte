<script lang="ts">
  import { getSourceGpx, increaseRate, runIncrease } from "../scripts/stores";

  /**
   * 生成したGPXファイルをダウンロードさせる。
   */
  function download() {
    const blob = new Blob([getSourceGpx()], { type: "text/xml" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.setAttribute("href", url);
    anchor.setAttribute("download", "GPX.gpx");
    const mouseEvent = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      view: window,
    });
    anchor.dispatchEvent(mouseEvent);
  }
</script>

<div id="operation-view">
  <div>
    <label for="range"
      >座標追加倍率<br />
      <strong>{$increaseRate}x</strong></label
    >
  </div>
  <input type="range" id="range" bind:value={$increaseRate} min="2" max="10" />
  <div>
    <input type="button" value="座標追加" on:click={runIncrease} />
  </div>
  <div>
    <input type="button" value="GPXダウンロード" on:click={download} />
  </div>
</div>

<style>
  #operation-view {
    position: absolute;
    top: 6em;
    right: 0;
    z-index: 10000;
    background: hsla(170, 30%, 80%, 0.8);
    padding: 0.4em 1em;
    vertical-align: middle;
  }
</style>
