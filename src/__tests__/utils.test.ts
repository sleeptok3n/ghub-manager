import { describe, it, expect, vi } from "vitest";
import { parseRepoString, batchOperation, delay, retry } from "../utils";

describe("parseRepoString", () => {
  it("should parse owner/repo format", () => {
    const result = parseRepoString("octocat/hello-world");
    expect(result).toEqual({ owner: "octocat", repo: "hello-world" });
  });

  it("should parse full GitHub URL", () => {
    const result = parseRepoString("https://github.com/octocat/hello-world");
    expect(result).toEqual({ owner: "octocat", repo: "hello-world" });
  });

  it("should parse GitHub URL with .git suffix", () => {
    const result = parseRepoString("https://github.com/octocat/hello-world.git");
    expect(result).toEqual({ owner: "octocat", repo: "hello-world" });
  });

  it("should throw for invalid format", () => {
    expect(() => parseRepoString("invalid")).toThrow("Invalid repository identifier");
  });

  it("should throw for empty string", () => {
    expect(() => parseRepoString("")).toThrow("Invalid repository identifier");
  });

  it("should handle repos with hyphens and dots", () => {
    const result = parseRepoString("my-org/my-repo.js");
    expect(result).toEqual({ owner: "my-org", repo: "my-repo.js" });
  });
});

describe("batchOperation", () => {
  it("should execute all operations successfully", async () => {
    const items = [1, 2, 3, 4, 5];
    const result = await batchOperation(items, async (item) => item * 2);

    expect(result.total).toBe(5);
    expect(result.successCount).toBe(5);
    expect(result.failureCount).toBe(0);
    expect(result.succeeded).toHaveLength(5);
    expect(result.failed).toHaveLength(0);
  });

  it("should handle failures gracefully", async () => {
    const items = [1, 2, 3];
    const result = await batchOperation(items, async (item) => {
      if (item === 2) throw new Error("Failed on 2");
      return item;
    });

    expect(result.total).toBe(3);
    expect(result.successCount).toBe(2);
    expect(result.failureCount).toBe(1);
    expect(result.failed[0].item).toBe(2);
    expect(result.failed[0].error.message).toBe("Failed on 2");
  });

  it("should respect concurrency limit", async () => {
    let maxConcurrent = 0;
    let currentConcurrent = 0;

    const items = Array.from({ length: 10 }, (_, i) => i);
    await batchOperation(
      items,
      async () => {
        currentConcurrent++;
        maxConcurrent = Math.max(maxConcurrent, currentConcurrent);
        await delay(10);
        currentConcurrent--;
      },
      { concurrency: 3 },
    );

    expect(maxConcurrent).toBeLessThanOrEqual(3);
  });

  it("should handle empty items array", async () => {
    const result = await batchOperation([], async () => {});
    expect(result.total).toBe(0);
    expect(result.successCount).toBe(0);
  });
});

describe("retry", () => {
  it("should return immediately on first success", async () => {
    let attempts = 0;
    const result = await retry(async () => {
      attempts++;
      return "success";
    });
    expect(result).toBe("success");
    expect(attempts).toBe(1);
  });

  it("should retry on failure and succeed", async () => {
    let attempts = 0;
    const result = await retry(
      async () => {
        attempts++;
        if (attempts < 3) throw new Error("Not yet");
        return "success";
      },
      { maxAttempts: 3, baseDelay: 10 },
    );
    expect(result).toBe("success");
    expect(attempts).toBe(3);
  });

  it("should throw after max attempts", async () => {
    let attempts = 0;
    await expect(
      retry(
        async () => {
          attempts++;
          throw new Error("Always fails");
        },
        { maxAttempts: 3, baseDelay: 10 },
      ),
    ).rejects.toThrow("Always fails");
    expect(attempts).toBe(3);
  });
});

describe("delay", () => {
  it("should delay for the specified duration", async () => {
    const start = Date.now();
    await delay(50);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(40); // Allow some tolerance
  });
});
