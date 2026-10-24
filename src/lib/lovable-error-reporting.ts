type LovableErrorOptions = {
  mechanism?: "manual" | "onerror" | "unhandledrejection" | "react_error_boundary";
  handled?: boolean;
  severity?: "error" | "warning" | "info";
};

type LovableEvents = {
  captureException?: (
    error: unknown,
    context?: Record<string, unknown>,
    options?: LovableErrorOptions,
  ) => void;
};

declare global {
  interface Window {
    __lovableEvents?: LovableEvents;
    __lovableReportRuntimeError?: (payload: {
      message: string;
      stack?: string;
      filename?: string;
    }) => void;
  }
}

export function reportLovableError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  // Never export raw errors, identifiers, medical content or arbitrary context.
  const safeError = new Error("Application request failed");
  const safeContext = { source: "react_error_boundary", status: error instanceof Response ? error.status : 500 };
  window.__lovableEvents?.captureException?.(safeError, safeContext, { mechanism: "react_error_boundary", handled: true, severity: "error" });
  window.__lovableReportRuntimeError?.({ message: "Application request failed", filename: "application" });
  void context;
}
