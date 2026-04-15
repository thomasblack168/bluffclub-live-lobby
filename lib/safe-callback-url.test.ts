import { describe, expect, it } from "vitest";
import { getSafeCallbackPath, getSafePostSignInLocation } from "./safe-callback-url";

describe("getSafeCallbackPath", () => {
  it("allows normal paths", () => {
    expect(getSafeCallbackPath("/admin")).toBe("/admin");
    expect(getSafeCallbackPath("/admin/tables")).toBe("/admin/tables");
    expect(getSafeCallbackPath("/admin?x=1")).toBe("/admin?x=1");
  });

  it("rejects protocol-relative and non-path", () => {
    expect(getSafeCallbackPath("//evil.com")).toBe("/admin");
    expect(getSafeCallbackPath("https://evil.com")).toBe("/admin");
    expect(getSafeCallbackPath("evil")).toBe("/admin");
  });

  it("rejects backslash and control chars", () => {
    expect(getSafeCallbackPath("/admin\\evil")).toBe("/admin");
    expect(getSafeCallbackPath("/admin\n")).toBe("/admin");
  });

  it("uses custom fallback", () => {
    expect(getSafeCallbackPath(null, "/")).toBe("/");
    expect(getSafeCallbackPath("//x", "/home")).toBe("/home");
  });
});

describe("getSafePostSignInLocation", () => {
  const origin = "http://localhost:3000";

  it("accepts same-origin absolute URL", () => {
    expect(getSafePostSignInLocation("http://localhost:3000/admin?x=1", origin)).toBe("/admin?x=1");
  });

  it("rejects other origins", () => {
    expect(getSafePostSignInLocation("https://evil.com/phish", origin)).toBe("/admin");
  });

  it("falls back for relative path input", () => {
    expect(getSafePostSignInLocation("/lobby", origin, "/lobby")).toBe("/lobby");
  });
});
