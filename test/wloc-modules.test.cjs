const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const moduleDir = path.join(__dirname, "..", "modules");
const moduleFiles = [
  "wloc.conf",
  "wloc.lpx",
  "wloc.module",
  "wloc.sgmodule",
  "wloc.stoverride",
];

function readModule(name) {
  return fs.readFileSync(path.join(moduleDir, name), "utf8");
}

test("all proxy modules intercept Apple and Amap WLOC hosts", () => {
  for (const name of moduleFiles) {
    const source = readModule(name);
    assert.match(source, /bluedot\.is\.autonavi\.com/);
    assert.match(source, /bluedot\.is\.autonavi\.com\.gds\.alibabadns\.com/);
  }
});

test("all proxy modules install a WLOC request preparation rule", () => {
  for (const name of moduleFiles) {
    const source = readModule(name);
    assert.match(source, /WLOC[^\n]*(Prepare|预处理)|script-request-header/);
  }
});
