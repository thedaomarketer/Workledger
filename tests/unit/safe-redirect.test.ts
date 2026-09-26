import { describe, expect, it } from "vitest";

import { safeRedirectPath } from "@/lib/safe-redirect";

describe("safeRedirectPath", () => {
  it("keeps same-site paths with query and hash", () => {
    expect(safeRedirectPath("/dashboard", "/x")).toBe("/dashboard");
    expect(safeRedirectPath("/reports?start=2024-06-01#top", "/x")).toBe("/reports?start=2024-06-01#top");
  });

  it.each([
    "https://evil.example",
    "//evil.example/path",
    "/\\evil.example",
    "\\\\evil.example",
    "javascript:alert(1)",
    "dashboard",
    "/\t/evil.example",
    "/\n/evil.example",
    "",
  ])("rejects %j", (value) => {
    expect(safeRedirectPath(value, "/dashboard")).toBe("/dashboard");
  });

  it("rejects non-strings", () => {
    expect(safeRedirectPath(null, "/dashboard")).toBe("/dashboard");
    expect(safeRedirectPath(undefined, "/dashboard")).toBe("/dashboard");
  });
});
