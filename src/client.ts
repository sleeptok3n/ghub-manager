import { Octokit } from "@octokit/rest";
import type { GhubManagerConfig, GhubManagerClient } from "./types";
import { GhubAuthError, GhubRateLimitError, GhubNotFoundError, GhubManagerError } from "./types";

const DEFAULT_CONFIG: Omit<Required<GhubManagerConfig>, "token"> = {
  baseUrl: "https://api.github.com",
  timeout: 30_000,
  userAgent: "ghub-manager/1.2.4",
  retries: 3,
  debug: false,
};

/**
 * Creates a configured GhubManager client instance.
 *
 * @example
 * ```ts
 * import { createClient } from "ghub-manager";
 *
 * const client = createClient({
 *   token: process.env.GITHUB_TOKEN!,
 *   debug: true,
 * });
 * ```
 */
export function createClient(config: GhubManagerConfig): GhubManagerClient {
  if (!config.token) {
    throw new GhubAuthError();
  }

  const mergedConfig: Required<GhubManagerConfig> = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  const octokit = new Octokit({
    auth: mergedConfig.token,
    baseUrl: mergedConfig.baseUrl,
    request: {
      timeout: mergedConfig.timeout,
    },
    userAgent: mergedConfig.userAgent,
    retry: {
      enabled: mergedConfig.retries > 0,
    },
    log: mergedConfig.debug
      ? {
          debug: (msg: string) => console.debug(`[ghub-manager] ${msg}`),
          info: (msg: string) => console.info(`[ghub-manager] ${msg}`),
          warn: (msg: string) => console.warn(`[ghub-manager] ${msg}`),
          error: (msg: string) => console.error(`[ghub-manager] ${msg}`),
        }
      : undefined,
  });

  return { octokit, config: mergedConfig };
}

/**
 * Wraps an Octokit API call with standardized error handling.
 * Transforms GitHub API errors into typed GhubManager errors.
 */
export async function withErrorHandling<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error: unknown) {
    if (error && typeof error === "object" && "status" in error) {
      const apiError = error as { status: number; response?: { data?: unknown; headers?: Record<string, string> } };

      switch (apiError.status) {
        case 401:
          throw new GhubAuthError();
        case 403: {
          const resetHeader = apiError.response?.headers?.["x-ratelimit-reset"];
          if (resetHeader) {
            const resetAt = new Date(parseInt(resetHeader) * 1000);
            const remaining = parseInt(
              apiError.response?.headers?.["x-ratelimit-remaining"] ?? "0",
            );
            throw new GhubRateLimitError(resetAt, remaining);
          }
          throw new GhubManagerError("Forbidden", 403, apiError.response?.data);
        }
        case 404:
          throw new GhubNotFoundError("The requested resource");
        case 422:
          throw new GhubManagerError(
            "Validation failed",
            422,
            apiError.response?.data,
          );
        default:
          throw new GhubManagerError(
            `GitHub API error (${apiError.status})`,
            apiError.status,
            apiError.response?.data,
          );
      }
    }
    throw error;
  }
}

/**
 * Returns current rate limit status for the authenticated user.
 *
 * @example
 * ```ts
 * const limits = await getRateLimit(client);
 * console.log(`Remaining: ${limits.remaining}/${limits.limit}`);
 * ```
 */
export async function getRateLimit(client: GhubManagerClient) {
  return withErrorHandling(async () => {
    const { data } = await client.octokit.rateLimit.get();
    return {
      limit: data.rate.limit,
      remaining: data.rate.remaining,
      reset: new Date(data.rate.reset * 1000),
      used: data.rate.used,
    };
  });
}

/**
 * Validates that the token has the required scopes.
 *
 * @example
 * ```ts
 * const isValid = await validateToken(client, ["repo", "delete_repo"]);
 * ```
 */
export async function validateToken(
  client: GhubManagerClient,
  requiredScopes?: string[],
): Promise<{ valid: boolean; scopes: string[]; user: string }> {
  return withErrorHandling(async () => {
    const { data, headers } = await client.octokit.users.getAuthenticated();
    const scopeHeader = (headers as Record<string, string>)["x-oauth-scopes"] ?? "";
    const scopes = scopeHeader.split(",").map((s: string) => s.trim()).filter(Boolean);

    const valid = requiredScopes
      ? requiredScopes.every((scope) => scopes.includes(scope))
      : true;

    return { valid, scopes, user: data.login };
  });
}
