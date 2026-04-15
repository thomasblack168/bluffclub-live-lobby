import { describe, expect, it } from "vitest";
import { formatZodFormError, tableSchema } from "./table-schema";

describe("tableSchema", () => {
  it("accepts valid payload", () => {
    const r = tableSchema.safeParse({
      locationId: "loc1",
      title: "NLH",
      blindsLabel: "5/10",
      maxSeats: "9",
      footerText: "",
      logoKey: "",
      sortOrder: "0",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.maxSeats).toBe(9);
      expect(r.data.logoKey).toBeNull();
    }
  });

  it("rejects maxSeats out of range", () => {
    const r = tableSchema.safeParse({
      locationId: "x",
      title: "t",
      blindsLabel: "b",
      maxSeats: "99",
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(formatZodFormError(r)).toContain("maxSeats");
    }
  });
});
