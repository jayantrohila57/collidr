import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseSessionDevice, sessionDeviceLabel } from "./session-device";

const MAC_CHROME =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";
const WIN_EDGE =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36 Edg/130.0";
const IPHONE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";

describe("parseSessionDevice", () => {
  it("parses desktop browsers", () => {
    assert.deepEqual(parseSessionDevice(MAC_CHROME), {
      kind: "desktop",
      os: "macOS",
      browser: "Chrome",
    });
    assert.equal(sessionDeviceLabel(WIN_EDGE), "Edge on Windows");
  });
  it("parses mobile", () => {
    assert.equal(parseSessionDevice(IPHONE).kind, "mobile");
    assert.equal(sessionDeviceLabel(IPHONE), "Safari on iOS");
  });
  it("handles missing agents", () => {
    assert.equal(sessionDeviceLabel(null), "Unknown device");
    assert.equal(parseSessionDevice("").kind, "unknown");
  });
});
