const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const script = fs.readFileSync(require.resolve("../dist/wloc-settings.js"), "utf8");

function runSettings(url, values) {
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
  assert.deepEqual(
    JSON.parse(JSON.stringify(saved)),
    {
      success: true,
      longitude: 139.767125,
      latitude: 35.681236,
      accuracy: 18,
      altitude: 0,
      verticalAccuracy: null,
      motionActivityType: 0,
      motionActivityConfidence: 100,
    },
  );

  const queried = runSettings(
    "https://gs-loc.apple.com/wloc-settings/save?action=query",
    values,
  );
  assert.equal(queried.altitude, 0);
  assert.equal(queried.verticalAccuracy, null);
  assert.equal(queried.motionActivityType, 0);
  assert.equal(queried.motionActivityConfidence, 100);
});
