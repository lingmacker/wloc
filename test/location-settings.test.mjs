import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { gzipSync } from "node:zlib";
import {
  normalizeLocationSettings,
  selectTargetSettings,
} from "../src/location-settings.js";

const scripts = Object.fromEntries(
  ["wloc", "wloc-settings"].map((name) => [
    name,
    fs.readFileSync(new URL(`../dist/${name}.js`, import.meta.url), "utf8"),
  ]),
);
const platforms = {
  Surge: { $environment: { "surge-version": "1" } },
  Loon: { $loon: {} },
  Shadowrocket: { $rocket: {} },
  Egern: { Egern: {} },
  Stash: { $environment: { "stash-version": "1" } },
  QuantumultX: { $task: {} },
};
async function execute(
  script,
  {
    platform = "Surge",
    store = {},
    query = "",
    argument,
    body,
    random = () => 0.375,
    writeResult = true,
  } = {},
) {
  let result;
  let completions = 0;
  let randomCalls = 0;
  const math = Object.create(Math);
  math.random = () => {
    randomCalls++;
    return random();
  };
  const write = (value, key) => {
    if (!writeResult) return false;
    store[key] = value;
    return true;
  };
  const context = vm.createContext({
    ...platforms[platform],
    Math: math,
    Uint8Array,
    ArrayBuffer,
    $script: { startTime: Date.now() / 1000 },
    $request: {
      url: `https://gs-loc.apple.com/${script === "wloc" ? "clls/wloc" : "wloc-settings/save"}?${query}`,
    },
    ...(body
      ? {
          $response: {
            status: 200,
            bodyBytes: Uint8Array.from(body),
            headers: { "Content-Encoding": "gzip" },
          },
        }
      : {}),
    $argument: argument,
    $persistentStore: { read: (key) => store[key] ?? null, write },
    $prefs: { valueForKey: (key) => store[key] ?? null, setValueForKey: write },
    $done: (value) => {
      completions++;
      result = value;
    },
    console: { log() {} },
  });
  vm.runInContext(scripts[script], context, { timeout: 1000 });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(completions, 1);
  const response = result.response || result;
  return script === "wloc-settings"
    ? JSON.parse(response.body)
    : { response, randomCalls };
}
function varint(value) {
  value = BigInt.asUintN(64, BigInt(value));
  const bytes = [];
  do {
    let byte = Number(value & 127n);
    value >>= 7n;
    if (value) byte |= 128;
    bytes.push(byte);
  } while (value);
  return bytes;
}
const scalar = (field, value) => [...varint(field * 8), ...varint(value)];
const message = (field, bytes) => [
  ...varint(field * 8 + 2),
  ...varint(bytes.length),
  ...bytes,
];
function parse(bytes) {
  let offset = 0;
  function readVarint() {
    let value = 0n;
    let shift = 0n;
    do {
      const byte = bytes[offset++];
      value |= BigInt(byte & 127) << shift;
      if (!(byte & 128)) return value;
      shift += 7n;
    } while (offset < bytes.length);
    throw new Error("truncated fixture");
  }
  const fields = [];
  while (offset < bytes.length) {
    const start = offset;
    const tag = Number(readVarint());
    const wireType = tag & 7;
    let value;
    if (wireType === 0) value = BigInt.asIntN(64, readVarint());
    else if (wireType === 2) {
      const length = Number(readVarint());
      value = bytes.slice(offset, offset + length);
      offset += length;
    } else throw new Error(`unexpected fixture wire type ${wireType}`);
    fields.push({
      field: tag >> 3,
      wireType,
      value,
      raw: Array.from(bytes.slice(start, offset)),
    });
  }
  return fields;
}
const find = (fields, number) => fields.find((field) => field.field === number);
const baseLocation = [
  ...scalar(1, 3100000000),
  ...scalar(2, 12100000000),
  ...scalar(3, 25),
  ...scalar(6, 99),
  ...scalar(11, 63),
];
const mac = [...Buffer.from("12:34:56:78:9a:bc")];
function makeBody(location = [...baseLocation, ...scalar(5, 530)]) {
  const wifi = [...message(1, mac), ...message(2, location)];
  const cell = [...scalar(1, 460), ...message(5, location)];
  const payload = [
    ...message(2, wifi),
    ...message(22, cell),
    ...message(24, cell),
    ...scalar(30, 42),
  ];
  return [
    0,
    1,
    0,
    0,
    0,
    1,
    0,
    0,
    payload.length >> 8,
    payload.length & 255,
    ...payload,
    77,
    88,
  ];
}
function locationsFromResponse(response) {
  const body = response.bodyBytes || response.body;
  const bytes = Array.from(
    body instanceof ArrayBuffer ? new Uint8Array(body) : body,
  );
  const length = (bytes[8] << 8) | bytes[9];
  assert.deepEqual(
    bytes.slice(10 + length),
    [77, 88],
    "frame suffix must survive size changes",
  );
  const root = parse(bytes.slice(10, 10 + length));
  assert.equal(find(root, 30).value, 42n);
  return root
    .filter((field) => [2, 22, 24].includes(field.field))
    .map((field) =>
      parse(find(parse(field.value), field.field === 2 ? 2 : 5).value),
    );
}

test("opt-in signed altitude patches existing Wi-Fi/cell fields without altering other location data", async () => {
  for (const platform of Object.keys(platforms)) {
    const { response } = await execute("wloc", {
      platform,
      argument: { longitude: -73.9857, latitude: 0, altitude: -430 },
      body: gzipSync(Buffer.from(makeBody())),
    });
    for (const location of locationsFromResponse(response)) {
      assert.equal(find(location, 1).value, 0n);
      assert.equal(find(location, 2).value, -7398570000n);
      assert.equal(find(location, 5).value, -430n);
      assert.deepEqual(find(location, 6).raw, scalar(6, 99));
      assert.deepEqual(find(location, 11).raw, scalar(11, 63));
    }
  }
  for (const [altitude, expected] of [
    [0, 0n],
    [null, 530n],
    [undefined, 530n],
  ]) {
    const { response } = await execute("wloc", {
      argument: { longitude: 1, latitude: 2, altitude },
      body: makeBody(),
    });
    assert.equal(find(locationsFromResponse(response)[0], 5).value, expected);
  }
  const { response } = await execute("wloc", {
    argument: { longitude: 1, latitude: 2, altitude: 10 },
    body: makeBody(baseLocation),
  });
  assert.equal(
    find(locationsFromResponse(response)[0], 5),
    undefined,
    "missing altitude must not be synthesized",
  );
});

test("range-only settings use one bounded random point for every device in each response", async () => {
  const bounds = {
    randomMode: "bounds",
    minLatitude: -0.1,
    maxLatitude: 0.1,
    minLongitude: 10,
    maxLongitude: 12,
    randomRadius: 9999,
  };
  for (const platform of Object.keys(platforms)) {
    const { response, randomCalls } = await execute("wloc", {
      platform,
      argument: bounds,
      body: makeBody(),
    });
    const locations = locationsFromResponse(response);
    const first = locations[0];
    assert.equal(
      randomCalls,
      2,
      "one draw per coordinate, not per device or frame candidate",
    );
    for (const location of locations) {
      assert.equal(find(location, 1).value, find(first, 1).value);
      assert.equal(find(location, 2).value, find(first, 2).value);
      assert(
        Number(find(location, 1).value) / 1e8 >= -0.1 &&
          Number(find(location, 1).value) / 1e8 <= 0.1,
      );
      assert(
        Number(find(location, 2).value) / 1e8 >= 10 &&
          Number(find(location, 2).value) / 1e8 <= 12,
      );
    }
  }
  const low = await execute("wloc", {
    argument: bounds,
    body: makeBody(),
    random: () => 0,
  });
  const high = await execute("wloc", {
    argument: bounds,
    body: makeBody(),
    random: () => 1 - Number.EPSILON,
  });
  assert.equal(
    find(locationsFromResponse(low.response)[0], 1).value,
    -10000000n,
  );
  assert.equal(
    find(locationsFromResponse(high.response)[0], 2).value,
    1200000000n,
  );
});

test("narrow bounds cannot round outside the requested interval", () => {
  const settings = normalizeLocationSettings({
    randomMode: "bounds",
    minLatitude: 1.000000001,
    maxLatitude: 1.000000011,
    minLongitude: -2.00000001,
    maxLongitude: -2.00000001,
  });
  const selected = selectTargetSettings(settings);
  assert.equal(selected.latitude, 1.00000001);
  assert.equal(selected.longitude, -2.00000001);
  assert.throws(() =>
    normalizeLocationSettings({
      ...settings,
      minLatitude: 1.000000002,
      maxLatitude: 1.000000003,
    }),
  );
});

test("settings save/query/clear retain zero, optional altitude and random mode transitions", async () => {
  for (const platform of Object.keys(platforms)) {
    const store = {};
    const request = (query) =>
      execute("wloc-settings", { platform, store, query });
    assert.equal(
      (await request("lon=0&lat=0&altitude=-430&randomMode=fixed")).success,
      true,
    );
    assert.equal((await request("action=query")).altitude, -430);
    const preserved = await request("lon=1&lat=2");
    assert.equal(preserved.altitude, -430);
    assert.equal(
      (await request("lon=1&lat=2&randomRadius=50")).randomMode,
      "radius",
    );
    assert.equal(
      (await request("lon=1&lat=2&randomMode=fixed&altitude=")).altitude,
      null,
    );
    const bounds = await request(
      "randomMode=bounds&minLatitude=0&maxLatitude=2&minLongitude=10&maxLongitude=12",
    );
    assert.equal(bounds.success, true);
    assert.equal(bounds.latitude, 1);
    assert.equal(bounds.longitude, 11);
    assert.equal((await request("action=query")).maxLongitude, 12);
    assert.equal((await request("action=clear")).success, true);
    assert.equal((await request("action=query")).code, "NO_SAVED_SETTINGS");
  }
});

test("page-saved bounds, fixed mode and cleared altitude take precedence over conflicting module arguments", async () => {
  const store = {};
  const argument = {
    longitude: 120,
    latitude: 30,
    altitude: 999,
    randomMode: "radius",
    randomRadius: 5000,
    minLatitude: 40,
    maxLatitude: 41,
    minLongitude: 50,
    maxLongitude: 51,
  };
  const saved = await execute("wloc-settings", {
    store,
    query: "randomMode=bounds&altitude=-100&minLatitude=10&maxLatitude=12&minLongitude=30&maxLongitude=32",
  });
  assert.equal(saved.success, true);
  const bounded = await execute("wloc", { store, argument, body: makeBody() });
  const boundedLocation = locationsFromResponse(bounded.response)[0];
  assert.equal(find(boundedLocation, 1).value, 1075000000n);
  assert.equal(find(boundedLocation, 2).value, 3075000000n);
  assert.equal(find(boundedLocation, 5).value, -100n);
  const cleared = await execute("wloc-settings", {
    store,
    query: "lon=0&lat=0&randomMode=fixed&randomRadius=0&altitude=&minLatitude=&maxLatitude=&minLongitude=&maxLongitude=",
  });
  assert.equal(cleared.success, true);
  const fixed = await execute("wloc", { store, argument, body: makeBody() });
  const fixedLocation = locationsFromResponse(fixed.response)[0];
  assert.equal(fixed.randomCalls, 0);
  assert.equal(find(fixedLocation, 1).value, 0n);
  assert.equal(find(fixedLocation, 2).value, 0n);
  assert.equal(find(fixedLocation, 5).value, 530n);
});

test("invalid saves and failed storage writes cannot destroy a previously saved configuration", async () => {
  const store = {
    wloc_settings: JSON.stringify({ longitude: 1, latitude: 2, altitude: 10 }),
  };
  const before = store.wloc_settings;
  for (const query of [
    "lon=oops&lat=2",
    "lon=1&lat=2&altitude=Infinity",
    "randomMode=fixed",
    "randomMode=bounds&minLatitude=10&maxLatitude=0&minLongitude=1&maxLongitude=2",
    "randomMode=bounds&minLatitude=0&maxLatitude=1",
    "lon=1&lat=2&randomRadius=-1",
  ]) {
    assert.equal(
      (await execute("wloc-settings", { store, query })).success,
      false,
    );
    assert.equal(store.wloc_settings, before);
  }
  for (const query of ["lon=1&lat=2&altitude=20", "action=clear"]) {
    assert.equal(
      (await execute("wloc-settings", { store, query, writeResult: false }))
        .success,
      false,
    );
    assert.equal(store.wloc_settings, before);
  }
});

test("saved null altitude and legacy radius override module settings; fixed suppresses jitter", async () => {
  const store = {
    wloc_settings: JSON.stringify({
      longitude: 0,
      latitude: 0,
      altitude: null,
      randomRadius: 25,
    }),
  };
  const legacy = await execute("wloc", {
    store,
    argument: {
      longitude: 10,
      latitude: 20,
      altitude: 999,
      randomMode: "fixed",
    },
    body: makeBody(),
  });
  assert.equal(legacy.randomCalls, 2);
  assert.equal(find(locationsFromResponse(legacy.response)[0], 5).value, 530n);
  const settings = JSON.parse(store.wloc_settings);
  store.wloc_settings = JSON.stringify({
    ...settings,
    altitude: 0,
    randomMode: "fixed",
  });
  const fixed = await execute("wloc", { store, body: makeBody() });
  assert.equal(fixed.randomCalls, 0);
  const location = locationsFromResponse(fixed.response)[0];
  assert.equal(find(location, 1).value, 0n);
  assert.equal(find(location, 2).value, 0n);
  assert.equal(find(location, 5).value, 0n);
  const invalid = await execute("wloc", {
    argument: { longitude: "bad", latitude: 1 },
    body: makeBody(),
  });
  assert.deepEqual(
    Object.keys(invalid.response),
    [],
    "invalid module config must leave the original response untouched",
  );
});
