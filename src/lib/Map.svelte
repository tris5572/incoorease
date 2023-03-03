<script lang="ts">
  import * as L from "leaflet";
  import "leaflet/dist/leaflet.css";
  import { onMount } from "svelte";
  import { drawTrack, fitFlag } from "../scripts/stores";

  const LINE_OPTIONS = {
    color: "red",
    weight: 2,
    opacity: 0.8,
  };

  const POINT_OPTIONS = {
    color: "purple",
    radius: 2,
    opacity: 0.8,
  };

  let map: L.Map;
  let mapElement: HTMLElement;
  let trackLayer = L.layerGroup();

  onMount(() => {
    initMap();
  });

  /// 地図タイルを初期化する。onMount() 以降で呼び出すこと。
  function initMap() {
    let pale = L.tileLayer("https://maps.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html">国土地理院</a>',
      maxZoom: 18,
    });
    let std = L.tileLayer("https://maps.gsi.go.jp/xyz/std/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html">国土地理院</a>',
      maxZoom: 18,
    });
    let photo = L.tileLayer(
      "https://maps.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg",
      {
        attribution:
          '&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html">国土地理院</a>',
        maxZoom: 18,
      }
    );

    // 地図を初期化する。
    map = L.map(mapElement, {
      center: [36.2, 138.5],
      zoom: 8,
      layers: [pale],
    });

    trackLayer.addTo(map);

    // タイル一覧を設定する。オプションを渡して常に表示させる。
    L.control
      .layers(
        {
          "地理院地図(淡色)": pale,
          "地理院地図(標準)": std,
          "地理院地図(写真)": photo,
        },
        null,
        { collapsed: false } // 常に表示
      )
      .addTo(map);
  }

  /**
   * 座標データが更新されたら、表示を更新する。
   */
  $: {
    if (map != null) {
      updateTrackView();

      // 軌跡全体を表示。
      if ($fitFlag === true) {
        fitBounds();
        $fitFlag = false;
      }
    }

    $drawTrack;
  }

  /// 表示している線を更新する。
  function updateTrackView() {
    trackLayer.clearLayers();

    // 線を表示する。
    let line = L.polyline($drawTrack, LINE_OPTIONS);
    line.addTo(trackLayer);

    // 点を表示する。
    for (const p of $drawTrack) {
      let circle = L.circleMarker(p, POINT_OPTIONS);
      circle.addTo(trackLayer);
    }
  }

  /**
   * 軌跡全体を表示するように拡大縮小する。
   */
  function fitBounds() {
    // LayerGroup では getBounds() できないので、全ポイントの位置を見えるという迂遠な方法を取っている。
    if ($drawTrack.length != 0) {
      const bounds = L.latLngBounds($drawTrack[0], $drawTrack[0]);
      for (const p of $drawTrack) {
        bounds.extend(p);
      }
      map.fitBounds(bounds);
    }
  }
</script>

<!--------------------------------------------------------------------------------->

<div id="map" bind:this={mapElement} />

<a
  href="https://github.com/tris5572/incoorease"
  target="_blank"
  rel="noreferrer"
>
  <div id="gh-link">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      ><path
        d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
      /></svg
    >
  </div>
</a>

<!--------------------------------------------------------------------------------->
<style>
  #map {
    height: 100dvh;
    width: 100dvw;
  }
  #gh-link {
    position: absolute;
    left: 0;
    bottom: 0;
    z-index: 100000;
    background: hsla(170, 32%, 56%, 60%);
    padding: 0.2em 0.2em 0;
  }
  #gh-link svg {
    fill: white;
  }
</style>
