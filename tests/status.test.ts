import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  normalizeStatus,
  isTerminalStatus,
  isStatusAfter,
  statusOrder,
  STATUS_FLOW,
} from "@/lib/status";
import { ShipmentStatus } from "@prisma/client";

describe("normalizeStatus", () => {
  it("maps well-known carrier statuses to canonical statuses", () => {
    assert.equal(normalizeStatus("DELIVERED"), ShipmentStatus.DELIVERED);
    assert.equal(normalizeStatus("SIGNED_FOR"), ShipmentStatus.DELIVERED);
    assert.equal(normalizeStatus("INFO_RECEIVED"), ShipmentStatus.CREATED);
    assert.equal(normalizeStatus("PACKAGE_RECEIVED"), ShipmentStatus.RECEIVED);
    assert.equal(normalizeStatus("DEPARTED_ORIGIN"), ShipmentStatus.DISPATCHED);
    assert.equal(normalizeStatus("customs clearance"), ShipmentStatus.CUSTOMS);
    assert.equal(normalizeStatus("Out for delivery"), ShipmentStatus.OUT_FOR_DELIVERY);
  });

  it("fuzzy-matches unknown codes via keyword", () => {
    assert.equal(normalizeStatus("YUN-EXPRESS-DELIVERED-2026"), ShipmentStatus.DELIVERED);
    assert.equal(normalizeStatus("PACKAGE AT CUSTOMS GATE"), ShipmentStatus.CUSTOMS);
    assert.equal(normalizeStatus("FLIGHT DEPARTED PVG"), ShipmentStatus.IN_TRANSIT);
    assert.equal(normalizeStatus("DELIVERY ATTEMPT #1"), ShipmentStatus.EXCEPTION);
    assert.equal(normalizeStatus("RETURN TO SENDER REQUESTED"), ShipmentStatus.RETURNED);
  });

  it("gives priority to DB-configured carrier mappings", () => {
    const mappings = { "CUSTOM_READY": ShipmentStatus.READY_FOR_DISPATCH };
    assert.equal(normalizeStatus("CUSTOM_READY", mappings), ShipmentStatus.READY_FOR_DISPATCH);
  });

  it("defaults to CREATED for empty or unknown input", () => {
    assert.equal(normalizeStatus(null), ShipmentStatus.CREATED);
    assert.equal(normalizeStatus(undefined), ShipmentStatus.CREATED);
    assert.equal(normalizeStatus("  "), ShipmentStatus.CREATED);
    assert.equal(normalizeStatus("COMPLETELY-UNKNOWN"), ShipmentStatus.CREATED);
  });
});

describe("status helpers", () => {
  it("marks delivered/returned/cancelled as terminal", () => {
    assert.equal(isTerminalStatus(ShipmentStatus.DELIVERED), true);
    assert.equal(isTerminalStatus(ShipmentStatus.RETURNED), true);
    assert.equal(isTerminalStatus(ShipmentStatus.CANCELLED), true);
    assert.equal(isTerminalStatus(ShipmentStatus.IN_TRANSIT), false);
  });

  it("orders statuses by the logistics flow", () => {
    assert.ok(statusOrder(ShipmentStatus.DELIVERED) > statusOrder(ShipmentStatus.CREATED));
    assert.ok(isStatusAfter(ShipmentStatus.OUT_FOR_DELIVERY, ShipmentStatus.IN_TRANSIT));
    assert.equal(isStatusAfter(ShipmentStatus.CREATED, ShipmentStatus.RECEIVED), false);
  });

  it("has a complete ordered flow from DRAFT to DELIVERED", () => {
    assert.equal(STATUS_FLOW[0], ShipmentStatus.DRAFT);
    assert.equal(STATUS_FLOW.at(-1), ShipmentStatus.DELIVERED);
    assert.equal(STATUS_FLOW.length, 11);
  });
});