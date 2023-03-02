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
  <label for="range">座標追加倍率</label>
  <input type="range" id="range" bind:value={$increaseRate} min="2" max="10" />
  {$increaseRate}x　
  <input type="button" value="座標追加" on:click={runIncrease} />
  <input type="button" value="ダウンロード" on:click={download} />
</div>

<style>
  #operation-view {
    position: absolute;
    bottom: 0;
    left: 2em;
    z-index: 10000;
    background: hsla(0, 0%, 80%, 0.5);
    padding: 0.2em 1em;
    vertical-align: middle;
  }
</style>
