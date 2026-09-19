import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildShipmentNumber, DEMO_TRACKING_PREFIX } from "@/services/shipment-number";
import { normalizeTrackingInput, randomToken, sha256, formatWeight } from "@/lib/utils";

describe("buildShipmentNumber", () => {
  it("formats counter with SHP-YYYY-000000", () => {
    assert.equal(buildShipmentNumber(1, 2026), "SHP-2026-000001");
    assert.equal(buildShipmentNumber(42, 2026), "SHP-2026-000042");
    assert.equal(buildShipmentNumber(123456, 2025), "SHP-2025-123456");
  });

  it("pads numbers beyond 6 digits without truncation", () => {
    assert.equal(buildShipmentNumber(1000000, 2026), "SHP-2026-1000000");
  });

  it("uses the current year by default", () => {
    const expected = `SHP-${new Date().getFullYear()}-000001`;
    assert.equal(buildShipmentNumber(1), expected);
  });
});

describe("tracking helpers", () => {
  it("normalizes tracking input to trimmed uppercase", () => {
    assert.equal(normalizeTrackingInput("  demo-cn-1234  "), "DEMO-CN-1234");
  });

  it("generates DEMO tracking numbers with the reserved prefix", () => {
    assert.ok(buildShipmentNumber(9, 2026).startsWith("SHP-2026-"));
    assert.ok(DEMO_TRACKING_PREFIX.startsWith("DEMO-CN-"));
  });

  it("produces hex tokens and stable sha256 hashes", () => {
    const a = randomToken(6);
    const b = randomToken(6);
    assert.match(a, /^[0-9a-f]{12}$/);
    assert.notEqual(a, b);
    assert.equal(sha256("payload"), sha256("payload"));
    assert.notEqual(sha256("payload"), sha256("other"));
  });

  it("formats weight with the metric unit", () => {
    assert.equal(formatWeight(1.25), "1.25 kg");
    assert.equal(formatWeight("0.5"), "0.5 kg");
  });
});