import { expect, test } from "vitest";
import {
  isGpx,
  latLngEleFromGpx,
  latLngFromGpx,
  runGpxIncrease,
} from "../scripts/gpx";

test("isGpx()", () => {
  const gpx = `
<?xml version="1.0" encoding="UTF-8"?>
<gpx xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.topografix.com/GPX/1/1" xmlns:gpxdata="http://www.cluetrust.com/XML/GPXDATA/1/0" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd http://www.cluetrust.com/XML/GPXDATA/1/0 http://www.cluetrust.com/Schemas/gpxdata10.xsd" version="1.1" creator="http://ridewithgps.com/">
  <metadata>
    <name>TEST</name>
    <link href="https://ridewithgps.com/routes/000000">
      <text>TEST</text>
    </link>
    <time>2023-02-03T10:20:30Z</time>
  </metadata>
  <trk>
    <name>TEST</name>
    <trkseg>
      <trkpt lat="35.1000" lon="139.6000">
        <ele>50.0</ele>
      </trkpt>
      <trkpt lat="35.6000" lon="139.1000">
        <ele>40.0</ele>
      </trkpt>
    </trkseg>
  </trk>
</gpx>
`;
  expect(isGpx(gpx)).toBeTruthy();

  const notGpx = "This is NOT GPX.\n";
  expect(isGpx(notGpx)).toBeFalsy();

  const html = `
<!DOCTYPE html>
<html>
  <body>
    <h1>My First Heading</h1>
    <p>My first paragraph.</p>

</body>
</html>
  `;
  expect(isGpx(html)).toBeFalsy();
});

///////////////////////////////////////////////////////////////////////////////

test("latLngFromGpx()", () => {
  const gpx = `
<?xml version="1.0" encoding="UTF-8"?>
<gpx xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.topografix.com/GPX/1/1" xmlns:gpxdata="http://www.cluetrust.com/XML/GPXDATA/1/0" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd http://www.cluetrust.com/XML/GPXDATA/1/0 http://www.cluetrust.com/Schemas/gpxdata10.xsd" version="1.1" creator="http://ridewithgps.com/">
  <metadata>
    <name>TEST</name>
    <link href="https://ridewithgps.com/routes/000000">
      <text>TEST</text>
    </link>
    <time>2023-02-03T10:20:30Z</time>
  </metadata>
  <trk>
    <name>TEST</name>
    <trkseg>
      <trkpt lat="35.1000" lon="139.6000">
        <ele>50.0</ele>
      </trkpt>
      <trkpt lat="35.6000" lon="139.1000">
        <ele>40.0</ele>
      </trkpt>
    </trkseg>
  </trk>
</gpx>
`;
  const r1 = latLngFromGpx(gpx);
  expect(r1).toEqual([
    [35.1, 139.6],
    [35.6, 139.1],
  ]);
});

///////////////////////////////////////////////////////////////////////////////

test("runGpxIncrease()", () => {
  // 比較は、trkpt の中身を見て行わないと、小数点周りの誤差が出る。

  const gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.topografix.com/GPX/1/1" xmlns:gpxdata="http://www.cluetrust.com/XML/GPXDATA/1/0" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd http://www.cluetrust.com/XML/GPXDATA/1/0 http://www.cluetrust.com/Schemas/gpxdata10.xsd" version="1.1" creator="http://ridewithgps.com/">
  <metadata>
    <name>TEST</name>
    <link href="https://ridewithgps.com/routes/000000">
      <text>TEST</text>
    </link>
    <time>2023-02-03T10:20:30Z</time>
  </metadata>
  <trk>
    <name>TEST</name>
    <trkseg>
      <trkpt lat="35.1000" lon="139.6000">
        <ele>50.0</ele>
      </trkpt>
      <trkpt lat="35.6000" lon="139.1000">
        <ele>40.0</ele>
      </trkpt>
      <trkpt lat="36.6000" lon="139.1000">
        <ele>40.5</ele>
      </trkpt>
      <trkpt lat="36.6000" lon="138.1000">
        <ele>40.5</ele>
      </trkpt>
      <trkpt lat="36.6000" lon="138.1000">
        <ele>60.5</ele>
      </trkpt>
    </trkseg>
  </trk>
</gpx>
`;
  const r1 = runGpxIncrease(gpx, 1);
  const v1 = [
    [35.1, 139.6, 50], // source
    [35.6, 139.1, 40], // source
    [36.6, 139.1, 40.5], // source
    [36.6, 138.1, 40.5], // source
    [36.6, 138.1, 60.5], // source
  ];
  expect(latLngEleFromGpx(r1)).toEqual(v1);

  // 半分に分割して倍に。
  const r2 = runGpxIncrease(gpx, 2);
  const v2 = [
    [35.1, 139.6, 50], // source
    [35.35, 139.35, 45],
    [35.6, 139.1, 40], // source
    [36.1, 139.1, 40.25],
    [36.6, 139.1, 40.5], // source
    [36.6, 138.6, 40.5],
    [36.6, 138.1, 40.5], // source
    [36.6, 138.1, 50.5],
    [36.6, 138.1, 60.5], // source
  ];
  expect(latLngEleFromGpx(r2)).toEqual(v2);
});
