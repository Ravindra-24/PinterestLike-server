import { describe, expect, it } from "vitest";
import { cursorFilter, decodeCursor, encodeCursor } from "../utils/cursor.js";

describe("cursor pagination", () => {
  it("round-trips stable cursor data", () => {
    const document = { _id: { toString: () => "507f1f77bcf86cd799439011" }, createdAt: new Date("2026-01-02T03:04:05.000Z") };
    const cursor = encodeCursor(document);
    expect(decodeCursor(cursor)).toMatchObject({ id: "507f1f77bcf86cd799439011", createdAt: document.createdAt });
    expect(cursorFilter(cursor).$or).toHaveLength(2);
  });

  it("rejects malformed cursors without throwing", () => {
    expect(decodeCursor("not-a-cursor")).toBeNull();
    expect(cursorFilter("not-a-cursor")).toEqual({});
  });
});
