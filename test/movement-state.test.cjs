const test = require("node:test");
const assert = require("node:assert/strict");

const { resolveLocationState } = require("../src/wloc.js");

const METERS_PER_EQUATOR_DEGREE = 111195.080234;

function route(overrides = {}) {
  return {
    mode: "route",
    route: [
      { latitude: 0, longitude: 0, altitude: 10 },
      { latitude: 0, longitude: 1, altitude: 30 },
    ],
    speed: METERS_PER_EQUATOR_DEGREE,
    startedAt: 1_000,
    status: "running",
    loop: false,
    accuracy: 12,
    verticalAccuracy: 8,
    motionActivityType: 1,
    motionActivityConfidence: 90,
    ...overrides,
  };
}

test("resolves a route position from elapsed time", () => {
  const before = resolveLocationState(route(), 500);
  assert.equal(before.status, "pending");
  assert.equal(before.latitude, 0);
  assert.equal(before.longitude, 0);
  assert.equal(before.progress, 0);

  const halfway = resolveLocationState(route(), 1_500);
  assert.equal(halfway.status, "running");
  assert.ok(Math.abs(halfway.longitude - 0.5) < 1e-9);
  assert.equal(halfway.latitude, 0);
  assert.ok(Math.abs(halfway.altitude - 20) < 1e-9);
  assert.ok(Math.abs(halfway.progress - 0.5) < 1e-9);
  assert.equal(halfway.accuracy, 12);
  assert.equal(halfway.verticalAccuracy, 8);
  assert.equal(halfway.motionActivityType, 1);
  assert.equal(halfway.motionActivityConfidence, 90);

  const finished = resolveLocationState(route(), 3_000);
  assert.equal(finished.status, "completed");
  assert.equal(finished.longitude, 1);
  assert.equal(finished.altitude, 30);
  assert.equal(finished.progress, 1);
});

test("freezes paused routes and wraps looping routes", () => {
  const paused = resolveLocationState(
    route({ status: "paused", pausedAt: 1_250 }),
    9_000,
  );
  assert.equal(paused.status, "paused");
  assert.ok(Math.abs(paused.longitude - 0.25) < 1e-9);

  const looped = resolveLocationState(route({ loop: true }), 2_250);
  assert.equal(looped.status, "running");
  assert.ok(Math.abs(looped.longitude - 0.25) < 1e-9);
  assert.ok(Math.abs(looped.progress - 0.25) < 1e-9);

  const stopped = resolveLocationState(
    route({ status: "stopped", stoppedAt: 1_750 }),
    9_000,
  );
  assert.equal(stopped.status, "stopped");
  assert.ok(Math.abs(stopped.longitude - 0.75) < 1e-9);
});

test("applies safe speed and accuracy defaults from a movement profile", () => {
  const state = resolveLocationState(
    route({
      profile: "walking",
      speed: undefined,
      accuracy: undefined,
      motionActivityType: undefined,
      motionActivityConfidence: undefined,
    }),
    1_500,
  );
  assert.equal(state.profile, "walking");
  assert.equal(state.speed, 1.4);
  assert.equal(state.accuracy, 12);
  assert.equal(state.motionActivityType, null);
  assert.equal(state.motionActivityConfidence, null);
});

test("rejects an unknown persisted lifecycle state", () => {
  assert.throws(
    () => resolveLocationState(route({ status: "teleporting" }), 1_500),
    /invalid route status/,
  );
});
