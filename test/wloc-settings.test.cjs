const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const script = fs.readFileSync(require.resolve("../src/wloc-settings.js"), "utf8");

function runSettings(url, values, now = Date.now()) {
  let response;
  const context = {
    $environment: { "surge-version": "test" },
    $request: { url },
    $script: { startTime: Date.now() },
    $persistentStore: {
      read(key) {
        return values.get(key) ?? null;
      },
      write(value, key) {
        if (value == null) values.delete(key);
        else values.set(key, value);
        return true;
      },
    },
    $done(value) {
      response = value.response || value;
    },
    Date: class extends Date {
      static now() {
        return now;
      }
    },
    console: { log() {} },
  };
  vm.runInNewContext(script, context);
  return JSON.parse(response.body);
}

test("optional settings round-trip zero and null values", () => {
  const values = new Map();
  const saved = runSettings(
    "https://gs-loc.apple.com/wloc-settings/save?lon=139.767125&lat=35.681236&acc=18&altitude=0&verticalAccuracy=&motionActivityType=0&motionActivityConfidence=100&diagnosticMode=inspect&diagnosticOutput=headers",
    values,
  );
  assert.equal(saved.success, true);
  assert.equal(saved.longitude, 139.767125);
  assert.equal(saved.latitude, 35.681236);
  assert.equal(saved.accuracy, 18);
  assert.equal(saved.altitude, 0);
  assert.equal(saved.verticalAccuracy, null);
  assert.equal(saved.motionActivityType, 0);
  assert.equal(saved.motionActivityConfidence, 100);
  assert.equal(saved.settings.mode, "static");
  assert.equal(saved.settings.diagnosticMode, "inspect");
  assert.equal(saved.settings.diagnosticOutput, "headers");

  const queried = runSettings(
    "https://gs-loc.apple.com/wloc-settings/save?action=query",
    values,
  );
  assert.equal(queried.altitude, 0);
  assert.equal(queried.verticalAccuracy, null);
  assert.equal(queried.motionActivityType, 0);
  assert.equal(queried.motionActivityConfidence, 100);
  assert.equal(queried.settings.diagnosticMode, "inspect");
});

test("rejects removed route simulation requests without persisting", () => {
  const values = new Map();
  const route = encodeURIComponent(
    JSON.stringify([
      { latitude: 35.681236, longitude: 139.767125, altitude: 10 },
      { latitude: 35.658581, longitude: 139.745433, altitude: 30 },
    ]),
  );
  const result = runSettings(
    `https://gs-loc.apple.com/wloc-settings/save?mode=route&route=${route}&profile=walking&loop=false&diagnosticMode=rewrite&diagnosticOutput=logs`,
    values,
    1_000,
  );
  assert.equal(result.success, false);
  assert.equal(result.error, "路线模拟功能已移除");
  assert.equal(values.has("wloc_settings"), false);
});

test("migrates previously saved routes to a static location", () => {
  const values = new Map([
    [
      "wloc_settings",
      JSON.stringify({
        mode: "route",
        route: [
          { latitude: 35.681236, longitude: 139.767125 },
          { latitude: 35.658581, longitude: 139.745433 },
        ],
        longitude: 139.767125,
        latitude: 35.681236,
        speed: 1.4,
        status: "running",
      }),
    ],
  ]);
  const queried = runSettings(
    "https://gs-loc.apple.com/wloc-settings/save?action=query",
    values,
  );
  assert.equal(queried.success, true);
  assert.equal(queried.settings.mode, "static");
  assert.equal("route" in queried.settings, false);
  assert.equal("speed" in queried.settings, false);
  assert.equal("status" in queried.settings, false);
});

test("accepts zero latitude and longitude", () => {
  const values = new Map();
  const saved = runSettings(
    "https://gs-loc.apple.com/wloc-settings/save?lon=0&lat=0&acc=25",
    values,
  );
  assert.equal(saved.success, true);
  const queried = runSettings(
    "https://gs-loc.apple.com/wloc-settings/save?action=query",
    values,
  );
  assert.equal(queried.success, true);
  assert.equal(queried.longitude, 0);
  assert.equal(queried.latitude, 0);
});
