import type { GhubManagerClient, PaginatedResponse, BatchResult } from "./types";
import { withErrorHandling } from "./client";

/**
 * Automatically paginates through all pages of a GitHub API endpoint.
 *
 * @example
 * ```ts
 * const allRepos = await paginate(client, (octokit, opts) =>
 *   octokit.repos.listForAuthenticatedUser(opts),
 *   { per_page: 100 }
 * );
 * ```
 */
export async function paginate<T>(
  client: GhubManagerClient,
  method: (octokit: typeof client.octokit, options: Record<string, unknown>) => Promise<{ data: T[] }>,
  options: Record<string, unknown> = {},
): Promise<T[]> {
  const results: T[] = [];
  let page = 1;
  const perPage = (options.per_page as number) || 100;

  while (true) {
    const response = await withErrorHandling(() =>
      method(client.octokit, { ...options, page, per_page: perPage }),
    );

    results.push(...response.data);

    if (response.data.length < perPage) {
      break;
    }
    page++;
  }

  return results;
}

/**
 * Executes an operation on multiple items with concurrency control.
 * Returns a detailed report of successes and failures.
 *
 * @example
 * ```ts
 * const result = await batchOperation(
 *   repoNames,
 *   async (name) => deleteRepo(client, { owner: "myorg", repo: name }),
 *   { concurrency: 5 }
 * );
 * console.log(`Deleted ${result.successCount}/${result.total} repos`);
 * ```
 */
export async function batchOperation<T, R>(
  items: T[],
  operation: (item: T) => Promise<R>,
  options: { concurrency?: number } = {},
): Promise<BatchResult<T>> {
  const concurrency = options.concurrency ?? 5;
  const succeeded: Array<{ item: T; result: unknown }> = [];
  const failed: Array<{ item: T; error: Error }> = [];

  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += concurrency) {
    chunks.push(items.slice(i, i + concurrency));
  }

  for (const chunk of chunks) {
    const promises = chunk.map(async (item) => {
      try {
        const result = await operation(item);
        succeeded.push({ item, result });
      } catch (error) {
        failed.push({ item, error: error instanceof Error ? error : new Error(String(error)) });
      }
    });

    await Promise.all(promises);
  }

  return {
    succeeded,
    failed,
    total: items.length,
    successCount: succeeded.length,
    failureCount: failed.length,
  };
}

/**
 * Wraps a response with pagination metadata.
 */
export function wrapPaginatedResponse<T>(
  data: T[],
  status: number,
  headers: Record<string, string>,
  page: number,
  perPage: number,
): PaginatedResponse<T> {
  const linkHeader = headers.link ?? "";
  const hasNextPage = linkHeader.includes('rel="next"');
  const hasPreviousPage = linkHeader.includes('rel="prev"');

  return {
    data,
    status,
    headers,
    pagination: {
      page,
      perPage,
      hasNextPage,
      hasPreviousPage,
    },
  };
}

/**
 * Delays execution for the specified number of milliseconds.
 * Useful for rate limiting or retry backoff.
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retries an async function with exponential backoff.
 *
 * @example
 * ```ts
 * const result = await retry(
 *   () => createRepo(client, options),
 *   { maxAttempts: 3, baseDelay: 1000 }
 * );
 * ```
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: { maxAttempts?: number; baseDelay?: number } = {},
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 3;
  const baseDelay = options.baseDelay ?? 1000;
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxAttempts) {
        await delay(baseDelay * Math.pow(2, attempt - 1));
      }
    }
  }

  throw lastError;
}

/**
 * Parses a GitHub repository URL or "owner/repo" string into components.
 *
 * @example
 * ```ts
 * parseRepoString("octocat/hello-world");
 * // => { owner: "octocat", repo: "hello-world" }
 *
 * parseRepoString("https://github.com/octocat/hello-world");
 * // => { owner: "octocat", repo: "hello-world" }
 * ```
 */
export function parseRepoString(input: string): { owner: string; repo: string } {
  // Handle full GitHub URLs
  const urlMatch = input.match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?$/);
  if (urlMatch) {
    return { owner: urlMatch[1], repo: urlMatch[2] };
  }

  // Handle owner/repo format
  const parts = input.split("/");
  if (parts.length === 2 && parts[0] && parts[1]) {
    return { owner: parts[0], repo: parts[1] };
  }

  throw new Error(`Invalid repository identifier: "${input}". Expected "owner/repo" or a GitHub URL.`);
}
