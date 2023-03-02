/// GPXファイルを色々と扱うスクリプト。

import { XMLBuilder, XMLParser } from "fast-xml-parser";
import type { LatLngExpression } from "leaflet";

/**
 * GPXファイルから座標のリストを生成する。
 * @param gpx GPXファイルの中身の文字列
 * @returns 座標のリスト。もしGPXファイルでなかったときは undefined。
 */
export function latLngFromGpx(gpx: string): LatLngExpression[] | undefined {
  if (!isGpx(gpx)) {
    return undefined;
  }

  const latlng = [];

  // パース時のオプション。trkpt の lat と lon を取得するために指定。
  const parsingOptions = {
    ignoreAttributes: false,
  };
  const parser = new XMLParser(parsingOptions);
  let jsonObj = parser.parse(gpx);

  // gpx > trk > trkseg に、配列として trkpt があるはず。
  const array = jsonObj.gpx.trk.trkseg.trkpt;

  // trkpt を座標として出力用へ格納。
  for (const a of array) {
    latlng.push([Number(a["@_lat"]), Number(a["@_lon"])]);
  }

  return latlng;
}

/**
 * GPXファイルから座標と標高のリストを生成する。
 * @param gpx GPXファイルの中身の文字列
 * @returns [lat, lng, ele]のリスト。もしGPXファイルでなかったときは undefined。
 */
export function latLngEleFromGpx(gpx: string): LatLngExpression[] | undefined {
  if (!isGpx(gpx)) {
    return undefined;
  }

  const latlng = [];

  // パース時のオプション。trkpt の lat と lon を取得するために指定。
  const parsingOptions = {
    ignoreAttributes: false,
  };
  const parser = new XMLParser(parsingOptions);
  let jsonObj = parser.parse(gpx);

  // gpx > trk > trkseg に、配列として trkpt があるはず。
  const array = jsonObj.gpx.trk.trkseg.trkpt;

  // trkpt を座標として出力用へ格納。
  for (const a of array) {
    latlng.push([Number(a["@_lat"]), Number(a["@_lon"]), Number(a["ele"])]);
  }

  return latlng;
}

/**
 * 渡された文字列がGPXファイルかどうかを判別する。
 * @param gpx ファイルの中身の文字列
 * @returns GPXファイルか否か
 */
export function isGpx(gpx: string): boolean {
  const parser = new XMLParser();
  let jsonObj = parser.parse(gpx);

  // {} が返ってきたらXMLではない。
  if (Object.keys(jsonObj).length === 0) {
    return false;
  }

  // キーに gpx を含んでいたらGPXと判定。
  for (const key of Object.keys(jsonObj)) {
    if (key.toUpperCase() === "GPX") {
      return true;
    }
  }

  return false;
}

/**
 * GPXファイルの座標数を増やす。
 * @param gpx GPXファイルの文字列
 * @param rate 増加率。2なら座標数が2倍になる。
 * @returns 増加したGPXの文字列。
 */
export function runGpxIncrease(gpx: string, rate: number): string {
  const parsingOptions = {
    ignoreAttributes: false,
  };
  const parser = new XMLParser(parsingOptions);
  let jsonObj = parser.parse(gpx);

  const outTrkpts = []; // 座標を追加したリスト
  const trkpts = jsonObj.gpx.trk.trkseg.trkpt;
  let prev; // 前の座標データ

  for (let i = 0; i < trkpts.length; i++) {
    if (i === 0) {
      prev = trkpts[0];
      outTrkpts.push(trkpts[0]);
      continue;
    }

    // 差分を計算
    const lat = Number(trkpts[i]["@_lat"]);
    const latPrev = Number(prev["@_lat"]);
    const latDiff = lat - latPrev;
    const lon = Number(trkpts[i]["@_lon"]);
    const lonPrev = Number(prev["@_lon"]);
    const lonDiff = lon - lonPrev;
    const ele = Number(trkpts[i]["ele"]);
    const elePrev = Number(prev["ele"]);
    const eleDiff = ele - elePrev;

    // 追加
    for (let a = 1; a < rate; a++) {
      const obj = {};
      obj["@_lat"] = latPrev + (latDiff / rate) * a;
      obj["@_lon"] = lonPrev + (lonDiff / rate) * a;
      obj["ele"] = elePrev + (eleDiff / rate) * a;
      outTrkpts.push(obj);
    }

    outTrkpts.push(trkpts[i]);
    prev = trkpts[i];
  }

  // 新しく生成した位置のリストで上書き。
  jsonObj.gpx.trk.trkseg.trkpt = outTrkpts;

  const buildingOptions = {
    ignoreAttributes: false,
    format: true,
  };
  const builder = new XMLBuilder(buildingOptions);
  let xmlDataStr = builder.build(jsonObj);

  return xmlDataStr;
}
