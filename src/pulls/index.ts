import type {
  GhubManagerClient,
  RepoIdentifier,
  CreatePullRequestOptions,
  UpdatePullRequestOptions,
  MergePullRequestOptions,
  ListPullRequestsOptions,
  ReviewRequestOptions,
} from "../types";
import { withErrorHandling } from "../client";

/**
 * Creates a new pull request.
 *
 * @example
 * ```ts
 * const pr = await createPullRequest(client, {
 *   owner: "octocat",
 *   repo: "hello-world",
 *   title: "Add dark mode support",
 *   head: "feature/dark-mode",
 *   base: "main",
 *   body: "## Changes\n- Added dark mode toggle\n- Updated color variables",
 *   draft: false,
 * });
 * console.log(`PR #${pr.number}: ${pr.html_url}`);
 * ```
 */
export async function createPullRequest(client: GhubManagerClient, options: CreatePullRequestOptions) {
  return withErrorHandling(async () => {
    const { data } = await client.octokit.pulls.create({
      owner: options.owner,
      repo: options.repo,
      title: options.title,
      head: options.head,
      base: options.base,
      body: options.body,
      draft: options.draft,
      maintainer_can_modify: options.maintainerCanModify,
    });
    return data;
  });
}

/**
 * Updates an existing pull request.
 *
 * @example
 * ```ts
 * await updatePullRequest(client, {
 *   owner: "octocat",
 *   repo: "hello-world",
 *   pullNumber: 123,
 *   title: "feat: Add dark mode support",
 *   body: "Updated PR description with more details",
 * });
 * ```
 */
export async function updatePullRequest(client: GhubManagerClient, options: UpdatePullRequestOptions) {
  return withErrorHandling(async () => {
    const { data } = await client.octokit.pulls.update({
      owner: options.owner,
      repo: options.repo,
      pull_number: options.pullNumber,
      title: options.title,
      body: options.body,
      state: options.state,
      base: options.base,
      maintainer_can_modify: options.maintainerCanModify,
    });
    return data;
  });
}

/**
 * Gets a single pull request by number.
 *
 * @example
 * ```ts
 * const pr = await getPullRequest(client, { owner: "octocat", repo: "hello-world" }, 123);
 * console.log(`Mergeable: ${pr.mergeable}`);
 * console.log(`Changed files: ${pr.changed_files}`);
 * ```
 */
export async function getPullRequest(
  client: GhubManagerClient,
  id: RepoIdentifier,
  pullNumber: number,
) {
  return withErrorHandling(async () => {
    const { data } = await client.octokit.pulls.get({
      owner: id.owner,
      repo: id.repo,
      pull_number: pullNumber,
    });
    return data;
  });
}

/**
 * Lists pull requests for a repository.
 *
 * @example
 * ```ts
 * const openPRs = await listPullRequests(client, {
 *   owner: "octocat",
 *   repo: "hello-world",
 *   state: "open",
 *   sort: "updated",
 *   direction: "desc",
 * });
 * openPRs.forEach(pr => console.log(`#${pr.number}: ${pr.title}`));
 * ```
 */
export async function listPullRequests(client: GhubManagerClient, options: ListPullRequestsOptions) {
  return withErrorHandling(async () => {
    const { data } = await client.octokit.pulls.list({
      owner: options.owner,
      repo: options.repo,
      state: options.state,
      head: options.head,
      base: options.base,
      sort: options.sort,
      direction: options.direction,
      per_page: options.perPage ?? 30,
      page: options.page ?? 1,
    });
    return data;
  });
}

/**
 * Merges a pull request.
 *
 * @example
 * ```ts
 * const result = await mergePullRequest(client, {
 *   owner: "octocat",
 *   repo: "hello-world",
 *   pullNumber: 123,
 *   mergeMethod: "squash",
 *   commitTitle: "feat: Add dark mode (#123)",
 * });
 * console.log(`Merged: ${result.merged}`);
 * ```
 */
export async function mergePullRequest(client: GhubManagerClient, options: MergePullRequestOptions) {
  return withErrorHandling(async () => {
    const { data } = await client.octokit.pulls.merge({
      owner: options.owner,
      repo: options.repo,
      pull_number: options.pullNumber,
      commit_title: options.commitTitle,
      commit_message: options.commitMessage,
      merge_method: options.mergeMethod ?? "merge",
      sha: options.sha,
    });
    return data;
  });
}

/**
 * Closes a pull request without merging.
 *
 * @example
 * ```ts
 * await closePullRequest(client, { owner: "octocat", repo: "hello-world" }, 123);
 * ```
 */
export async function closePullRequest(
  client: GhubManagerClient,
  id: RepoIdentifier,
  pullNumber: number,
) {
  return updatePullRequest(client, { ...id, pullNumber, state: "closed" });
}

/**
 * Requests reviews on a pull request.
 *
 * @example
 * ```ts
 * await requestReviewers(client, {
 *   owner: "octocat",
 *   repo: "hello-world",
 *   pullNumber: 123,
 *   reviewers: ["reviewer1", "reviewer2"],
 *   teamReviewers: ["frontend-team"],
 * });
 * ```
 */
export async function requestReviewers(client: GhubManagerClient, options: ReviewRequestOptions) {
  return withErrorHandling(async () => {
    const { data } = await client.octokit.pulls.requestReviewers({
      owner: options.owner,
      repo: options.repo,
      pull_number: options.pullNumber,
      reviewers: options.reviewers,
      team_reviewers: options.teamReviewers,
    });
    return data;
  });
}

/**
 * Removes review requests from a pull request.
 *
 * @example
 * ```ts
 * await removeReviewers(client, {
 *   owner: "octocat",
 *   repo: "hello-world",
 *   pullNumber: 123,
 *   reviewers: ["reviewer1"],
 * });
 * ```
 */
export async function removeReviewers(client: GhubManagerClient, options: ReviewRequestOptions) {
  return withErrorHandling(async () => {
    const { data } = await client.octokit.pulls.removeRequestedReviewers({
      owner: options.owner,
      repo: options.repo,
      pull_number: options.pullNumber,
      reviewers: options.reviewers ?? [],
      team_reviewers: options.teamReviewers,
    });
    return data;
  });
}

/**
 * Lists files changed in a pull request.
 *
 * @example
 * ```ts
 * const files = await listPullRequestFiles(client,
 *   { owner: "octocat", repo: "hello-world" },
 *   123
 * );
 * files.forEach(f => console.log(`${f.status}: ${f.filename} (+${f.additions}/-${f.deletions})`));
 * ```
 */
export async function listPullRequestFiles(
  client: GhubManagerClient,
  id: RepoIdentifier,
  pullNumber: number,
) {
  return withErrorHandling(async () => {
    const { data } = await client.octokit.pulls.listFiles({
      owner: id.owner,
      repo: id.repo,
      pull_number: pullNumber,
      per_page: 100,
    });
    return data;
  });
}

/**
 * Lists reviews on a pull request.
 *
 * @example
 * ```ts
 * const reviews = await listPullRequestReviews(client,
 *   { owner: "octocat", repo: "hello-world" },
 *   123
 * );
 * ```
 */
export async function listPullRequestReviews(
  client: GhubManagerClient,
  id: RepoIdentifier,
  pullNumber: number,
) {
  return withErrorHandling(async () => {
    const { data } = await client.octokit.pulls.listReviews({
      owner: id.owner,
      repo: id.repo,
      pull_number: pullNumber,
    });
    return data;
  });
}

/**
 * Checks if a pull request has been merged.
 *
 * @example
 * ```ts
 * const isMerged = await isPullRequestMerged(client,
 *   { owner: "octocat", repo: "hello-world" },
 *   123
 * );
 * ```
 */
export async function isPullRequestMerged(
  client: GhubManagerClient,
  id: RepoIdentifier,
  pullNumber: number,
): Promise<boolean> {
  try {
    await client.octokit.pulls.checkIfMerged({
      owner: id.owner,
      repo: id.repo,
      pull_number: pullNumber,
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Updates a pull request's branch by merging the base branch into it.
 *
 * @example
 * ```ts
 * await updatePullRequestBranch(client,
 *   { owner: "octocat", repo: "hello-world" },
 *   123
 * );
 * ```
 */
export async function updatePullRequestBranch(
  client: GhubManagerClient,
  id: RepoIdentifier,
  pullNumber: number,
) {
  return withErrorHandling(async () => {
    const { data } = await client.octokit.pulls.updateBranch({
      owner: id.owner,
      repo: id.repo,
      pull_number: pullNumber,
    });
    return data;
  });
}
