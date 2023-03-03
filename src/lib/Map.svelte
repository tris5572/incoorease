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

<!--------------------------------------------------------------------------------->
<style>
  #map {
    height: 100dvh;
    width: 100dvw;
  }
</style>
