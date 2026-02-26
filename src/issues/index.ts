import type {
  GhubManagerClient,
  RepoIdentifier,
  CreateIssueOptions,
  UpdateIssueOptions,
  ListIssuesOptions,
  IssueCommentOptions,
  LockIssueOptions,
  BulkLabelOptions,
} from "../types";
import { withErrorHandling } from "../client";
import { batchOperation } from "../utils";

/**
 * Creates a new issue in a repository.
 *
 * @example
 * ```ts
 * const issue = await createIssue(client, {
 *   owner: "octocat",
 *   repo: "hello-world",
 *   title: "Bug: Login page crashes on mobile",
 *   body: "## Steps to reproduce\n1. Open login page on mobile\n2. ...",
 *   labels: ["bug", "mobile"],
 *   assignees: ["octocat"],
 * });
 * console.log(`Created issue #${issue.number}: ${issue.html_url}`);
 * ```
 */
export async function createIssue(client: GhubManagerClient, options: CreateIssueOptions) {
  return withErrorHandling(async () => {
    const { data } = await client.octokit.issues.create({
      owner: options.owner,
      repo: options.repo,
      title: options.title,
      body: options.body,
      assignees: options.assignees,
      labels: options.labels,
      milestone: options.milestone,
    });
    return data;
  });
}

/**
 * Updates an existing issue.
 *
 * @example
 * ```ts
 * await updateIssue(client, {
 *   owner: "octocat",
 *   repo: "hello-world",
 *   issueNumber: 42,
 *   state: "closed",
 *   stateReason: "completed",
 *   labels: ["bug", "mobile", "fixed"],
 * });
 * ```
 */
export async function updateIssue(client: GhubManagerClient, options: UpdateIssueOptions) {
  return withErrorHandling(async () => {
    const { data } = await client.octokit.issues.update({
      owner: options.owner,
      repo: options.repo,
      issue_number: options.issueNumber,
      title: options.title,
      body: options.body,
      state: options.state,
      state_reason: options.stateReason,
      assignees: options.assignees,
      labels: options.labels,
      milestone: options.milestone,
    });
    return data;
  });
}

/**
 * Gets a single issue by number.
 *
 * @example
 * ```ts
 * const issue = await getIssue(client, { owner: "octocat", repo: "hello-world" }, 42);
 * console.log(`#${issue.number}: ${issue.title} [${issue.state}]`);
 * ```
 */
export async function getIssue(client: GhubManagerClient, id: RepoIdentifier, issueNumber: number) {
  return withErrorHandling(async () => {
    const { data } = await client.octokit.issues.get({
      owner: id.owner,
      repo: id.repo,
      issue_number: issueNumber,
    });
    return data;
  });
}

/**
 * Lists issues for a repository with filtering options.
 *
 * @example
 * ```ts
 * const openBugs = await listIssues(client, {
 *   owner: "octocat",
 *   repo: "hello-world",
 *   state: "open",
 *   labels: "bug",
 *   sort: "updated",
 *   direction: "desc",
 * });
 * ```
 */
export async function listIssues(client: GhubManagerClient, options: ListIssuesOptions) {
  return withErrorHandling(async () => {
    const { data } = await client.octokit.issues.listForRepo({
      owner: options.owner,
      repo: options.repo,
      state: options.state,
      assignee: options.assignee,
      creator: options.creator,
      labels: options.labels,
      sort: options.sort,
      direction: options.direction,
      since: options.since,
      per_page: options.perPage ?? 30,
      page: options.page ?? 1,
    });
    return data;
  });
}

/**
 * Adds a comment to an issue.
 *
 * @example
 * ```ts
 * const comment = await addComment(client, {
 *   owner: "octocat",
 *   repo: "hello-world",
 *   issueNumber: 42,
 *   body: "This has been fixed in PR #45",
 * });
 * ```
 */
export async function addComment(client: GhubManagerClient, options: IssueCommentOptions) {
  return withErrorHandling(async () => {
    const { data } = await client.octokit.issues.createComment({
      owner: options.owner,
      repo: options.repo,
      issue_number: options.issueNumber,
      body: options.body,
    });
    return data;
  });
}

/**
 * Lists comments on an issue.
 *
 * @example
 * ```ts
 * const comments = await listComments(client,
 *   { owner: "octocat", repo: "hello-world" },
 *   42
 * );
 * ```
 */
export async function listComments(
  client: GhubManagerClient,
  id: RepoIdentifier,
  issueNumber: number,
  options?: { perPage?: number; page?: number },
) {
  return withErrorHandling(async () => {
    const { data } = await client.octokit.issues.listComments({
      owner: id.owner,
      repo: id.repo,
      issue_number: issueNumber,
      per_page: options?.perPage ?? 30,
      page: options?.page ?? 1,
    });
    return data;
  });
}

/**
 * Closes an issue.
 *
 * @example
 * ```ts
 * await closeIssue(client, { owner: "octocat", repo: "hello-world" }, 42, "completed");
 * ```
 */
export async function closeIssue(
  client: GhubManagerClient,
  id: RepoIdentifier,
  issueNumber: number,
  reason: "completed" | "not_planned" = "completed",
) {
  return updateIssue(client, {
    ...id,
    issueNumber,
    state: "closed",
    stateReason: reason,
  });
}

/**
 * Reopens a closed issue.
 *
 * @example
 * ```ts
 * await reopenIssue(client, { owner: "octocat", repo: "hello-world" }, 42);
 * ```
 */
export async function reopenIssue(client: GhubManagerClient, id: RepoIdentifier, issueNumber: number) {
  return updateIssue(client, {
    ...id,
    issueNumber,
    state: "open",
    stateReason: "reopened",
  });
}

/**
 * Locks an issue, preventing further comments.
 *
 * @example
 * ```ts
 * await lockIssue(client, {
 *   owner: "octocat",
 *   repo: "hello-world",
 *   issueNumber: 42,
 *   lockReason: "resolved",
 * });
 * ```
 */
export async function lockIssue(client: GhubManagerClient, options: LockIssueOptions) {
  return withErrorHandling(async () => {
    await client.octokit.issues.lock({
      owner: options.owner,
      repo: options.repo,
      issue_number: options.issueNumber,
      lock_reason: options.lockReason,
    });
  });
}

/**
 * Unlocks an issue, allowing comments again.
 *
 * @example
 * ```ts
 * await unlockIssue(client, { owner: "octocat", repo: "hello-world" }, 42);
 * ```
 */
export async function unlockIssue(client: GhubManagerClient, id: RepoIdentifier, issueNumber: number) {
  return withErrorHandling(async () => {
    await client.octokit.issues.unlock({
      owner: id.owner,
      repo: id.repo,
      issue_number: issueNumber,
    });
  });
}

/**
 * Adds labels to an issue.
 *
 * @example
 * ```ts
 * await addLabels(client, { owner: "octocat", repo: "hello-world" }, 42, ["priority:high", "bug"]);
 * ```
 */
export async function addLabels(
  client: GhubManagerClient,
  id: RepoIdentifier,
  issueNumber: number,
  labels: string[],
) {
  return withErrorHandling(async () => {
    const { data } = await client.octokit.issues.addLabels({
      owner: id.owner,
      repo: id.repo,
      issue_number: issueNumber,
      labels,
    });
    return data;
  });
}

/**
 * Removes a label from an issue.
 *
 * @example
 * ```ts
 * await removeLabel(client, { owner: "octocat", repo: "hello-world" }, 42, "wontfix");
 * ```
 */
export async function removeLabel(
  client: GhubManagerClient,
  id: RepoIdentifier,
  issueNumber: number,
  label: string,
) {
  return withErrorHandling(async () => {
    await client.octokit.issues.removeLabel({
      owner: id.owner,
      repo: id.repo,
      issue_number: issueNumber,
      name: label,
    });
  });
}

/**
 * Bulk close multiple issues at once.
 *
 * @example
 * ```ts
 * const result = await bulkCloseIssues(client,
 *   { owner: "octocat", repo: "hello-world" },
 *   [1, 5, 12, 23],
 *   "not_planned"
 * );
 * console.log(`Closed ${result.successCount}/${result.total} issues`);
 * ```
 */
export async function bulkCloseIssues(
  client: GhubManagerClient,
  id: RepoIdentifier,
  issueNumbers: number[],
  reason: "completed" | "not_planned" = "completed",
) {
  return batchOperation(issueNumbers, (num) => closeIssue(client, id, num, reason));
}

/**
 * Adds or removes labels across multiple issues in bulk.
 *
 * @example
 * ```ts
 * const result = await bulkUpdateLabels(client, {
 *   owner: "octocat",
 *   repo: "hello-world",
 *   issueNumbers: [1, 2, 3, 4, 5],
 *   addLabels: ["v2.0"],
 *   removeLabels: ["v1.0"],
 * });
 * ```
 */
export async function bulkUpdateLabels(client: GhubManagerClient, options: BulkLabelOptions) {
  return batchOperation(options.issueNumbers, async (issueNumber) => {
    if (options.addLabels?.length) {
      await addLabels(client, options, issueNumber, options.addLabels);
    }
    if (options.removeLabels?.length) {
      for (const label of options.removeLabels) {
        await removeLabel(client, options, issueNumber, label);
      }
    }
  });
}

/**
 * Assigns users to an issue.
 *
 * @example
 * ```ts
 * await assignIssue(client, { owner: "octocat", repo: "hello-world" }, 42, ["user1", "user2"]);
 * ```
 */
export async function assignIssue(
  client: GhubManagerClient,
  id: RepoIdentifier,
  issueNumber: number,
  assignees: string[],
) {
  return withErrorHandling(async () => {
    const { data } = await client.octokit.issues.addAssignees({
      owner: id.owner,
      repo: id.repo,
      issue_number: issueNumber,
      assignees,
    });
    return data;
  });
}

/**
 * Removes assignees from an issue.
 *
 * @example
 * ```ts
 * await unassignIssue(client, { owner: "octocat", repo: "hello-world" }, 42, ["user1"]);
 * ```
 */
export async function unassignIssue(
  client: GhubManagerClient,
  id: RepoIdentifier,
  issueNumber: number,
  assignees: string[],
) {
  return withErrorHandling(async () => {
    const { data } = await client.octokit.issues.removeAssignees({
      owner: id.owner,
      repo: id.repo,
      issue_number: issueNumber,
      assignees,
    });
    return data;
  });
}
