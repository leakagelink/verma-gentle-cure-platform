// Never retain raw request errors globally or serialize medical/provider payloads.
export function describeError(error: unknown): string {
 const status = error && typeof error === "object" && "statusCode" in error ? error.statusCode : undefined;
 return typeof status === "number" ? `Application request failed (status ${status})` : "Application request failed";
}
const originalConsoleError = console.error.bind(console);
console.error = (...args: unknown[]) => originalConsoleError(...args.map(describeError));
export function consumeLastCapturedError(): unknown { return undefined; }
