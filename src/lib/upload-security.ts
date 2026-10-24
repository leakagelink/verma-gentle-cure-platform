export const HEALTH_NOTICE_VERSION = "health-2026-10-24";
export const REPORT_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"] as const;
export const REPORT_MAX_BYTES = 10 * 1024 * 1024;
export function validReport(file: { type: string; size: number }) {
  return (REPORT_TYPES as readonly string[]).includes(file.type) && file.size > 0 && file.size <= REPORT_MAX_BYTES;
}