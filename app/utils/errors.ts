/**
 * Extract a human-readable message from an error. Prefers the backend's
 * `response.data.message` (e.g. "Invalid credentials", "Account is deactivated")
 * so users always see the exact reason an operation failed.
 */
export function getErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (error && typeof error === "object") {
    const err = error as {
      response?: { data?: { message?: string } };
      message?: string;
    };
    if (err.response?.data?.message) return err.response.data.message;
    if (err.message) return err.message;
  }
  return fallback;
}
