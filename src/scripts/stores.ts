import { derived, get, writable } from "svelte/store";
import { isGpx, latLngFromGpx, runGpxIncrease } from "./gpx";

/**
 * 地図に表示する座標のリスト。
 */
export const drawTrack = writable<L.LatLngExpression[]>([]);

/**
 * ファイルから読み込んだ、情報元のGPXの文字列。
 */
export const sourceGpx = writable("");

/**
 * 座標を増やす比率。
 */
export const increaseRate = writable(5);

/**
 * 軌跡に合わせて拡大縮小するかどうかのフラグ。
 */
export const fitFlag = writable(false);

/**
 * 座標数
 */
export const pointsCount = derived(sourceGpx, ($sourceGpx) => {
  const v = latLngFromGpx($sourceGpx);
  if (v == undefined) {
    return 0;
  } else {
    return v.length;
  }
});

////////////////////////////////////////////////////////////////////////////////////////

export function getSourceGpx(): string {
  return get(sourceGpx);
}

////////////////////////////////////////////////////////////////////////////////////////

/**
 * 新しいGPXファイルへ更新する。
 * 渡された文字列がGPXでないような場合は何もしない。
 * @param gpx GPXファイルの文字列
 * @param fit 軌跡に合わせて拡大縮小するかどうかのフラグ
 */
export function changeGpx(gpx: string, fit?: boolean) {
  if (!isGpx(gpx)) {
    return;
  }
  sourceGpx.set(gpx);

  const latlng = latLngFromGpx(gpx);
  if (latlng != null) {
    drawTrack.set(latlng);

    if (fit != undefined) {
      fitFlag.set(true);
    }
  }
}

/**
 * 座標増加を実行し、表示を更新する。
 */
export function runIncrease() {
  const gpx = runGpxIncrease(get(sourceGpx), get(increaseRate));
  sourceGpx.set(gpx);
  changeGpx(gpx);
}

/**
 * 表示する座標を、元のGPXデータに依存する形で書いたもの。
 * ただこれは元データと表示を連携させたく**ない**ときに微妙。
 */
// export const drawTrack = derived<Writable<string>, L.LatLngExpression[]>(
//   sourceGpx,
//   (gpx) => {
//     const latlng = latLngFromGpx(gpx);

//     if (latlng == null) {
//       return [];
//     } else {
//       return latlng;
//     }
//   }
// );
