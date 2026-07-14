const test = require("node:test");
const assert = require("node:assert/strict");
const { gzipSync } = require("node:zlib");
const fs = require("node:fs");
const vm = require("node:vm");

const { rewriteWlocResponse } = require("../src/wloc.js");
const runtimeScript = fs.readFileSync(require.resolve("../src/wloc.js"), "utf8");

async function runQuantumultX({ argument = "", request, response, storedSettings }) {
  let completed;
  const context = {
    $task: {},
    $argument: argument,
    $request: request,
    $response: response,
    $prefs: {
      valueForKey(key) {
        return key === "wloc_settings" && storedSettings
          ? JSON.stringify(storedSettings)
          : null;
      },
      setValueForKey() {
        return true;
      },
      removeValueForKey() {
        return true;
      },
    },
    $done(value) {
      completed = value;
    },
    console: { log() {} },
    TextEncoder,
    TextDecoder,
    Uint8Array,
    ArrayBuffer,
  };
  await vm.runInNewContext(runtimeScript, context);
  return completed;
}

async function runNonQuantumultRequest(platform, request) {
  let completed;
  const context = {
    $argument: "",
    $request: request,
    $script: { startTime: Date.now() },
    $persistentStore: { read() { return null; }, write() { return true; } },
    $done(value) { completed = value; },
    console: { log() {} },
    TextEncoder,
    TextDecoder,
    Uint8Array,
    ArrayBuffer,
  };
  if (platform === "Surge")
    context.$environment = { "surge-version": "test" };
  else if (platform === "Loon") context.$loon = "test";
  await vm.runInNewContext(runtimeScript, context);
  return completed;
}

function varint(value) {
  let remaining = BigInt(value);
  const bytes = [];
  while (remaining >= 0x80n) {
    bytes.push(Number(remaining & 0x7fn) | 0x80);
    remaining >>= 7n;
  }
  bytes.push(Number(remaining));
  return bytes;
}

function field(number, wireType, value) {
  const key = varint(number * 8 + wireType);
  return wireType === 0
    ? [...key, ...varint(value)]
    : [...key, ...varint(value.length), ...value];
}

function location(latitude, longitude) {
  return [
    ...field(1, 0, Math.round(latitude * 1e8)),
    ...field(2, 0, Math.round(longitude * 1e8)),
    ...field(3, 0, 80),
    ...field(4, 0, 3),
    ...field(5, 0, 530),
    ...field(6, 0, 1000),
    ...field(11, 0, 63),
    ...field(12, 0, 467),
    ...field(15, 0, 77),
  ];
}

function samplePayload() {
  const originalLocation = location(34.693725, 135.502254);
  const wifi = [
    ...field(1, 2, Array.from(Buffer.from("aa:bb:cc:dd:ee:ff"))),
    ...field(2, 2, originalLocation),
  ];
  const cell = field(5, 2, originalLocation);
  return [
    ...field(2, 2, wifi),
    ...field(22, 2, cell),
    ...field(24, 2, cell),
    ...field(3, 0, 1),
    ...field(4, 0, 2),
    ...field(33, 0, 3),
    ...field(40, 0, 9),
  ];
}

function syntheticResponse(payload) {
  return Uint8Array.from([
    0x00, 0x01, 0x00, 0x00, 0x00, 0x03, 0x00, 0x00,
    (payload.length >> 8) & 0xff,
    payload.length & 0xff,
    ...payload,
  ]);
}

function uint16(value) {
  return [(value >> 8) & 0xff, value & 0xff];
}

function uint32(value) {
  return [
    (value >>> 24) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 8) & 0xff,
    value & 0xff,
  ];
}

function pascal(value) {
  const bytes = Array.from(Buffer.from(value, "ascii"));
  return [...uint16(bytes.length), ...bytes];
}

function arpcResponse(payload, trailing = []) {
  return Uint8Array.from([
    ...uint16(1),
    ...pascal("ja_JP"),
    ...pascal("com.apple.locationd"),
    ...pascal("27.0"),
    ...uint32(1),
    ...uint32(payload.length),
    ...payload,
    ...trailing,
  ]);
}

function readArpc(bytes) {
  let offset = 0;
  const read16 = () => (bytes[offset++] << 8) | bytes[offset++];
  const read32 = () =>
    (bytes[offset++] * 0x1000000 +
      (bytes[offset++] << 16) +
      (bytes[offset++] << 8) +
      bytes[offset++]) >>>
    0;
  const readPascal = () => {
    const length = read16();
    const value = Buffer.from(bytes.slice(offset, offset + length)).toString("ascii");
    offset += length;
    return value;
  };
  const version = read16();
  const locale = readPascal();
  const appIdentifier = readPascal();
  const osVersion = readPascal();
  const functionId = read32();
  const payloadLength = read32();
  return {
    version,
    locale,
    appIdentifier,
    osVersion,
    functionId,
    payloadLength,
    payload: bytes.slice(offset, offset + payloadLength),
    trailing: bytes.slice(offset + payloadLength),
  };
}

function parseFields(bytes) {
  const fields = [];
  let offset = 0;
  const readVarint = () => {
    let value = 0n;
    let shift = 0n;
    while (offset < bytes.length) {
      const byte = bytes[offset++];
      value |= BigInt(byte & 0x7f) << shift;
      if (!(byte & 0x80)) return Number(value);
      shift += 7n;
    }
    throw new Error("truncated varint");
  };
  while (offset < bytes.length) {
    const key = readVarint();
    const number = Math.floor(key / 8);
    const wireType = key & 7;
    if (wireType === 0) {
      fields.push({ number, wireType, value: readVarint() });
    } else if (wireType === 2) {
      const length = readVarint();
      fields.push({ number, wireType, value: bytes.slice(offset, offset + length) });
      offset += length;
    } else {
      throw new Error(`unsupported wire type ${wireType}`);
    }
  }
  return fields;
}

function child(fields, number) {
  return fields.find((candidate) => candidate.number === number);
}

test("rewrites a complete WLOC response to the configured Tokyo location", () => {
  const input = syntheticResponse(samplePayload());
  const settings = {
    latitude: 35.681236,
    longitude: 139.767125,
    accuracy: 18,
    altitude: 41,
    verticalAccuracy: 12,
    motionActivityType: 1,
    motionActivityConfidence: 90,
  };

  const result = rewriteWlocResponse(input, settings);
  const payloadLength = (result.data[8] << 8) | result.data[9];
  const root = parseFields(result.data.slice(10, 10 + payloadLength));
  const locations = [
    child(parseFields(child(root, 2).value), 2).value,
    child(parseFields(child(root, 22).value), 5).value,
    child(parseFields(child(root, 24).value), 5).value,
  ];

  for (const bytes of locations) {
    const fields = parseFields(bytes);
    assert.equal(child(fields, 1).value, 3568123600);
    assert.equal(child(fields, 2).value, 13976712500);
    assert.equal(child(fields, 3).value, 18);
    assert.equal(child(fields, 4).value, 3);
    assert.equal(child(fields, 5).value, 41);
    assert.equal(child(fields, 6).value, 12);
    assert.equal(child(fields, 11).value, 1);
    assert.equal(child(fields, 12).value, 90);
    assert.equal(child(fields, 15).value, 77);
  }

  assert.equal(child(root, 40).value, 9);
  assert.equal(child(root, 3).value, 1);
  assert.equal(child(root, 4).value, 2);
  assert.equal(child(root, 33).value, 3);
  assert.deepEqual(result.stats, {
    wifi: 1,
    cell: 2,
    locations: 3,
    skipped: 0,
  });
});

test("preserves optional Apple metadata when settings are unset or invalid", () => {
  const input = syntheticResponse(samplePayload());
  const result = rewriteWlocResponse(input, {
    latitude: 35.681236,
    longitude: 139.767125,
    accuracy: 18,
    altitude: "not-a-number",
  });
  const payloadLength = (result.data[8] << 8) | result.data[9];
  const root = parseFields(result.data.slice(10, 10 + payloadLength));
  const fields = parseFields(child(parseFields(child(root, 2).value), 2).value);

  assert.equal(child(fields, 4).value, 3);
  assert.equal(child(fields, 5).value, 530);
  assert.equal(child(fields, 6).value, 1000);
  assert.equal(child(fields, 11).value, 63);
  assert.equal(child(fields, 12).value, 467);
});

test("preserves an ARPC envelope and updates its payload length", () => {
  const input = arpcResponse(samplePayload(), [0xde, 0xad]);
  const result = rewriteWlocResponse(input, {
    latitude: 35.681236,
    longitude: 139.767125,
    accuracy: 18,
    altitude: 41,
  });
  const arpc = readArpc(result.data);

  assert.equal(result.frameKind, "arpc");
  assert.equal(arpc.version, 1);
  assert.equal(arpc.locale, "ja_JP");
  assert.equal(arpc.appIdentifier, "com.apple.locationd");
  assert.equal(arpc.osVersion, "27.0");
  assert.equal(arpc.functionId, 1);
  assert.equal(arpc.payloadLength, arpc.payload.length);
  assert.deepEqual(Array.from(arpc.trailing), [0xde, 0xad]);

  const root = parseFields(arpc.payload);
  const wifiLocation = parseFields(child(parseFields(child(root, 2).value), 2).value);
  assert.equal(child(wifiLocation, 1).value, 3568123600);
  assert.equal(child(wifiLocation, 5).value, 41);
  assert.equal(child(root, 40).value, 9);
});

test("passes an unrecognized response through unchanged", () => {
  const input = Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  const result = rewriteWlocResponse(input, {
    latitude: 35.681236,
    longitude: 139.767125,
    accuracy: 18,
  });

  assert.deepEqual(result.data, Array.from(input));
  assert.equal(result.frameKind, "passthrough");
  assert.deepEqual(result.stats, {
    wifi: 0,
    cell: 0,
    locations: 0,
    skipped: 0,
  });
});

test("inspects a WLOC response without modifying or exposing identifiers", () => {
  const input = syntheticResponse(samplePayload());
  const result = rewriteWlocResponse(
    input,
    { diagnosticMode: "inspect", diagnosticOutput: "both" },
    1_500,
  );

  assert.deepEqual(result.data, Array.from(input));
  assert.equal(result.frameKind, "framed");
  assert.equal(result.diagnostics.mode, "inspect");
  assert.equal(result.diagnostics.compressed, false);
  assert.equal(result.diagnostics.inputLength, input.length);
  assert.equal(result.diagnostics.responseLengthBefore, input.length);
  assert.equal(result.diagnostics.responseLengthAfter, input.length);
  assert.equal(result.diagnostics.payloadLength, samplePayload().length);
  assert.equal(result.diagnostics.fieldHistogram["2/2"], 1);
  assert.equal(result.diagnostics.fieldHistogram["22/2"], 1);
  assert.equal(result.diagnostics.fieldHistogram["24/2"], 1);
  assert.equal(result.diagnostics.wifiCount, 1);
  assert.equal(result.diagnostics.cell22Count, 1);
  assert.equal(result.diagnostics.cell24Count, 1);
  assert.equal(result.diagnostics.locationCount, 3);

  const serialized = JSON.stringify(result.diagnostics).toLowerCase();
  for (const forbidden of ["base64", "bssid", "rawbody", "bodybytes", "aa:bb"])
    assert.equal(serialized.includes(forbidden), false);
});

test("inspects gzip data while returning the original compressed bytes", () => {
  const plain = syntheticResponse(samplePayload());
  const input = gzipSync(plain);
  const result = rewriteWlocResponse(input, { inspectMode: true });

  assert.deepEqual(result.data, Array.from(input));
  assert.equal(result.diagnostics.compressed, true);
  assert.equal(result.diagnostics.inputLength, input.length);
  assert.equal(result.diagnostics.decodedLength, plain.length);
  assert.equal(result.frameKind, "framed");
  assert.equal(result.diagnostics.locationCount, 3);
});

test("rewrites a gzip WLOC response to decoded patched bytes", () => {
  const plain = syntheticResponse(samplePayload());
  const input = gzipSync(plain);
  const settings = {
    longitude: 139.767125,
    latitude: 35.681236,
    accuracy: 18,
  };
  const expected = rewriteWlocResponse(plain, settings).data;
  const result = rewriteWlocResponse(input, settings);

  assert.deepEqual(result.data, expected);
  assert.equal(result.compressed, true);
});

test("Quantumult X request preparation asks the server for an identity body", async () => {
  const result = await runQuantumultX({
    request: {
      url: "https://bluedot.is.autonavi.com/clls/wloc",
      headers: { "User-Agent": "locationd", "Accept-Encoding": "gzip, br" },
    },
  });

  assert.equal(result.headers["User-Agent"], "locationd");
  assert.equal(result.headers["Accept-Encoding"], "identity");
});

test("Surge request preparation returns request headers without a response wrapper", async () => {
  const result = await runNonQuantumultRequest("Surge", {
    url: "https://gs-loc.apple.com/clls/wloc",
    headers: { "accept-encoding": "gzip", "User-Agent": "locationd" },
  });

  assert.equal(result.response, undefined);
  assert.equal(result.headers["accept-encoding"], "identity");
  assert.equal(result.headers["User-Agent"], "locationd");
});

test("Loon request preparation returns request headers without a response wrapper", async () => {
  const result = await runNonQuantumultRequest("Loon", {
    url: "https://bluedot.is.autonavi.com.gds.alibabadns.com/clls/wloc",
    headers: { "Accept-Encoding": "gzip" },
  });

  assert.equal(result.response, undefined);
  assert.equal(result.headers["Accept-Encoding"], "identity");
});

test("Quantumult X rewrites a gzip WLOC response through its complete script entry", async () => {
  const plain = syntheticResponse(samplePayload());
  const compressed = Uint8Array.from(gzipSync(plain));
  const settings = {
    mode: "static",
    longitude: 139.767125,
    latitude: 35.681236,
    accuracy: 18,
  };
  const expected = rewriteWlocResponse(plain, settings).data;
  const result = await runQuantumultX({
    request: { url: "https://bluedot.is.autonavi.com/clls/wloc" },
    response: {
      status: 200,
      headers: {
        "Content-Encoding": "gzip",
        "Content-Length": String(compressed.length),
      },
      bodyBytes: compressed,
    },
    storedSettings: settings,
  });

  assert.deepEqual(Array.from(new Uint8Array(result.bodyBytes)), expected);
  assert.equal(result.headers["Content-Encoding"], undefined);
  assert.equal(result.headers["Content-Length"], undefined);
  assert.match(result.status, /^HTTP\/1\.1 200 /);
});

test("Quantumult X inspect preserves gzip bytes and response headers", async () => {
  const compressed = Uint8Array.from(
    gzipSync(syntheticResponse(samplePayload())),
  );
  const result = await runQuantumultX({
    request: { url: "https://bluedot.is.autonavi.com/clls/wloc" },
    response: {
      status: 200,
      headers: {
        "Content-Encoding": "gzip",
        "Content-Length": String(compressed.length),
        "X-Origin": "amap",
      },
      bodyBytes: compressed,
    },
    storedSettings: {
      mode: "static",
      diagnosticMode: "inspect",
      diagnosticOutput: "headers",
    },
  });

  assert.deepEqual(
    Array.from(new Uint8Array(result.bodyBytes)),
    Array.from(compressed),
  );
  assert.equal(result.headers["Content-Encoding"], "gzip");
  assert.equal(result.headers["Content-Length"], String(compressed.length));
  assert.equal(result.headers["X-Origin"], "amap");
  assert.equal(result.headers["X-WLOC-Mode"], "inspect");
});
