import { expect, it } from "vitest";
import { validReport } from "./upload-security";
it("accepts only PDF and JPEG/PNG/WebP health reports", () => {
  expect(validReport({ type: "application/pdf", size: 100 })).toBe(true);
  expect(validReport({ type: "text/html", size: 100 })).toBe(false);
  expect(validReport({ type: "image/svg+xml", size: 100 })).toBe(false);
});
it("limits each report to 10 MB and rejects empty files", () => {
  expect(validReport({ type: "image/jpeg", size: 10 * 1024 * 1024 })).toBe(true);
  expect(validReport({ type: "image/jpeg", size: 10 * 1024 * 1024 + 1 })).toBe(false);
  expect(validReport({ type: "image/jpeg", size: 0 })).toBe(false);
});