const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const moduleDir = path.join(__dirname, "..", "modules");
const hosts = [
  "gs-loc.apple.com",
  "gs-loc-cn.apple.com",
  "bluedot.is.autonavi.com",
  "bluedot.is.autonavi.com.gds.alibabadns.com",
];
const amapPattern = String.raw`bluedot\.is\.autonavi\.com(?:\.gds\.alibabadns\.com)?`;
const escapedAmapFragment = String.raw`bluedot\.is\.autonavi\.com(?:\.gds\.alibabadns\.com)?`;

function readModule(name) {
  return fs.readFileSync(path.join(moduleDir, name), "utf8");
}

function section(source, name) {
  const match = source.match(new RegExp(`\\[${name}\\]([\\s\\S]*?)(?=\\n\\[|$)`));
  assert.ok(match, `missing [${name}] section`);
  return match[1];
}

function assertHostPattern(line) {
  assert.ok(line.includes(escapedAmapFragment));
  assert.match(line, /gs-loc/);
  assert.ok(line.includes(String.raw`\/clls\/wloc`));
}

function assertMitmHosts(source) {
  for (const host of hosts) assert.ok(source.includes(host), `missing MITM host ${host}`);
}

test("Quantumult X config binds WLOC prepare and binary response rules", () => {
  const source = readModule("wloc.conf");
  const rewrite = section(source, "rewrite_local");
  const prepare = rewrite.split("\n").find((line) => line.includes("script-request-header"));
  const response = rewrite.split("\n").find((line) => line.includes("script-response-body"));
  assert.ok(prepare);
  assert.ok(response);
  assertHostPattern(prepare);
  assertHostPattern(response);
  assert.match(prepare, /dist\/wloc\.js/);
  assert.match(response, /dist\/wloc\.js/);
  assertMitmHosts(section(source, "mitm"));
});

for (const [name, preparePrefix, responsePrefix] of [
  ["wloc.lpx", "http-request ", "http-response "],
  ["wloc.module", "WLOC Prepare = type=http-request", "Apple WLOC = type=http-response"],
  ["wloc.sgmodule", "WLOC Prepare = type=http-request", "Apple WLOC = type=http-response"],
]) {
  test(`${name} binds prepare and binary response rules to every WLOC host`, () => {
    const source = readModule(name);
    const scripts = section(source, "Script");
    const prepare = scripts.split("\n").find((line) => line.startsWith(preparePrefix));
    const response = scripts.split("\n").find((line) => line.startsWith(responsePrefix));
    assert.ok(prepare);
    assert.ok(response);
    assertHostPattern(prepare);
    assertHostPattern(response);
    assert.match(prepare, /requires-body=(?:0|false)/);
    assert.match(response, /binary-(?:body-)?mode=(?:1|true)/);
    assert.match(prepare, /dist\/wloc\.js/);
    assert.match(response, /dist\/wloc\.js/);
    assertMitmHosts(section(source, "MITM"));
  });
}

test("Stash config binds prepare and binary response providers", () => {
  const source = readModule("wloc.stoverride");
  assert.match(source, /name: WLOC\.Prepare\n\s+type: request\n\s+require-body: false/);
  assert.match(source, /name: WLOC\.Location\n\s+type: response\n\s+require-body: true\n\s+binary-mode: true/);
  assert.match(source, /WLOC\.Prepare:\n\s+url: .*dist\/wloc\.js/);
  assert.match(source, /WLOC\.Location:\n\s+url: .*dist\/wloc\.js/);
  assert.equal((source.match(new RegExp(amapPattern, "g")) || []).length >= 2, true);
  assertMitmHosts(source.slice(source.indexOf("mitm:"), source.indexOf("script:")));
});
