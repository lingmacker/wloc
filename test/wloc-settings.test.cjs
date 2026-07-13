const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const script = fs.readFileSync(require.resolve("../dist/wloc-settings.js"), "utf8");

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
    "https://gs-loc.apple.com/wloc-settings/save?lon=139.767125&lat=35.681236&acc=18&altitude=0&verticalAccuracy=&motionActivityType=0&motionActivityConfidence=100",
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

  const queried = runSettings(
    "https://gs-loc.apple.com/wloc-settings/save?action=query",
    values,
  );
  assert.equal(queried.altitude, 0);
  assert.equal(queried.verticalAccuracy, null);
  assert.equal(queried.motionActivityType, 0);
  assert.equal(queried.motionActivityConfidence, 100);
});

test("route controls preserve elapsed progress across pause and resume", () => {
  const values = new Map();
  const route = encodeURIComponent(
    JSON.stringify([
      { latitude: 35.681236, longitude: 139.767125, altitude: 10 },
      { latitude: 35.658581, longitude: 139.745433, altitude: 30 },
    ]),
  );
  const started = runSettings(
    `https://gs-loc.apple.com/wloc-settings/save?mode=route&route=${route}&profile=walking&loop=false&diagnostics=true`,
    values,
    1_000,
  );
  assert.equal(started.success, true);
  assert.equal(started.settings.mode, "route");
  assert.equal(started.settings.status, "running");
  assert.equal(started.settings.startedAt, 1_000);
  assert.equal(started.settings.profile, "walking");
  assert.equal(started.settings.speed, 1.4);
  assert.equal(started.settings.accuracy, 12);
  assert.equal(started.settings.diagnostics, true);

  const paused = runSettings(
    "https://gs-loc.apple.com/wloc-settings/save?action=pause",
    values,
    6_000,
  );
  assert.equal(paused.settings.status, "paused");
  assert.equal(paused.settings.pausedAt, 6_000);

  const resumed = runSettings(
    "https://gs-loc.apple.com/wloc-settings/save?action=resume",
    values,
    16_000,
  );
  assert.equal(resumed.settings.status, "running");
  assert.equal(resumed.settings.startedAt, 11_000);
  assert.equal(resumed.settings.pausedAt, null);

  const stopped = runSettings(
    "https://gs-loc.apple.com/wloc-settings/save?action=stop",
    values,
    20_000,
  );
  assert.equal(stopped.settings.status, "stopped");
  assert.equal(stopped.settings.stoppedAt, 20_000);

  const resumeStopped = runSettings(
    "https://gs-loc.apple.com/wloc-settings/save?action=resume",
    values,
    25_000,
  );
  assert.equal(resumeStopped.settings.status, "stopped");

  const queried = runSettings(
    "https://gs-loc.apple.com/wloc-settings/save?action=query",
    values,
    30_000,
  );
  assert.equal(queried.settings.route.length, 2);
  assert.equal(queried.settings.status, "stopped");
});

test("rejects an invalid later route point before persisting", () => {
  const values = new Map();
  const route = encodeURIComponent(
    JSON.stringify([
      { latitude: 35.681236, longitude: 139.767125 },
      { latitude: "invalid", longitude: 139.745433 },
    ]),
  );
  const result = runSettings(
    `https://gs-loc.apple.com/wloc-settings/save?action=start&mode=route&route=${route}&profile=walking`,
    values,
    1_000,
  );
  assert.equal(result.success, false);
  assert.equal(values.has("wloc_settings"), false);
});

test("reports a non-looping route as completed after its duration", () => {
  const values = new Map();
  const route = encodeURIComponent(
    JSON.stringify([
      { latitude: 0, longitude: 0 },
      { latitude: 0, longitude: 0.001 },
    ]),
  );
  const started = runSettings(
    `https://gs-loc.apple.com/wloc-settings/save?action=start&mode=route&route=${route}&speed=1&loop=false`,
    values,
    1_000,
  );
  assert.equal(started.success, true);
  const queried = runSettings(
    "https://gs-loc.apple.com/wloc-settings/save?action=query",
    values,
    200_000,
  );
  assert.equal(queried.settings.status, "completed");
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
