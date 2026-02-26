import { describe, it, expect, vi } from "vitest";
import { createClient, withErrorHandling } from "../client";
import { GhubAuthError, GhubNotFoundError, GhubRateLimitError, GhubManagerError } from "../types";

describe("createClient", () => {
  it("should create a client with required token", () => {
    const client = createClient({ token: "ghp_test123" });
    expect(client.octokit).toBeDefined();
    expect(client.config.token).toBe("ghp_test123");
  });

  it("should use default config values", () => {
    const client = createClient({ token: "ghp_test123" });
    expect(client.config.baseUrl).toBe("https://api.github.com");
    expect(client.config.timeout).toBe(30_000);
    expect(client.config.retries).toBe(3);
    expect(client.config.debug).toBe(false);
  });

  it("should override defaults with provided config", () => {
    const client = createClient({
      token: "ghp_test123",
      baseUrl: "https://github.example.com/api/v3",
      timeout: 60_000,
      retries: 5,
      debug: true,
    });
    expect(client.config.baseUrl).toBe("https://github.example.com/api/v3");
    expect(client.config.timeout).toBe(60_000);
    expect(client.config.retries).toBe(5);
    expect(client.config.debug).toBe(true);
  });

  it("should throw GhubAuthError when token is empty", () => {
    expect(() => createClient({ token: "" })).toThrow(GhubAuthError);
  });
});

describe("withErrorHandling", () => {
  it("should return the result on success", async () => {
    const result = await withErrorHandling(async () => "success");
    expect(result).toBe("success");
  });

  it("should throw GhubAuthError for 401 status", async () => {
    await expect(
      withErrorHandling(async () => {
        throw { status: 401, response: { data: {} } };
      }),
    ).rejects.toThrow(GhubAuthError);
  });

  it("should throw GhubNotFoundError for 404 status", async () => {
    await expect(
      withErrorHandling(async () => {
        throw { status: 404, response: { data: {} } };
      }),
    ).rejects.toThrow(GhubNotFoundError);
  });

  it("should throw GhubRateLimitError for 403 with rate limit headers", async () => {
    const resetTime = Math.floor(Date.now() / 1000) + 3600;
    await expect(
      withErrorHandling(async () => {
        throw {
          status: 403,
          response: {
            data: {},
            headers: {
              "x-ratelimit-reset": String(resetTime),
              "x-ratelimit-remaining": "0",
            },
          },
        };
      }),
    ).rejects.toThrow(GhubRateLimitError);
  });

  it("should throw GhubManagerError for other HTTP errors", async () => {
    await expect(
      withErrorHandling(async () => {
        throw { status: 500, response: { data: { message: "Internal Server Error" } } };
      }),
    ).rejects.toThrow(GhubManagerError);
  });

  it("should re-throw non-HTTP errors as-is", async () => {
    const error = new Error("Network error");
    await expect(withErrorHandling(async () => { throw error; })).rejects.toThrow("Network error");
  });
});
