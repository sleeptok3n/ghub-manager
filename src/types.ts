import type { Octokit } from "@octokit/rest";

// ─── Client Configuration ─────────────────────────────────────────────────────

export interface GhubManagerConfig {
  /** GitHub personal access token or OAuth token */
  token: string;
  /** GitHub API base URL (defaults to https://api.github.com) */
  baseUrl?: string;
  /** Request timeout in milliseconds (defaults to 30000) */
  timeout?: number;
  /** Custom user agent string */
  userAgent?: string;
  /** Number of retry attempts for failed requests (defaults to 3) */
  retries?: number;
  /** Enable debug logging */
  debug?: boolean;
}

export interface GhubManagerClient {
  octokit: Octokit;
  config: Required<GhubManagerConfig>;
}

// ─── Repository Types ─────────────────────────────────────────────────────────

export interface CreateRepoOptions {
  name: string;
  description?: string;
  private?: boolean;
  autoInit?: boolean;
  gitignoreTemplate?: string;
  licenseTemplate?: string;
  homepage?: string;
  hasIssues?: boolean;
  hasProjects?: boolean;
  hasWiki?: boolean;
  hasDownloads?: boolean;
  teamId?: number;
  isTemplate?: boolean;
  allowSquashMerge?: boolean;
  allowMergeCommit?: boolean;
  allowRebaseMerge?: boolean;
  deleteBranchOnMerge?: boolean;
}

export interface UpdateRepoOptions {
  owner: string;
  repo: string;
  name?: string;
  description?: string;
  homepage?: string;
  private?: boolean;
  hasIssues?: boolean;
  hasProjects?: boolean;
  hasWiki?: boolean;
  defaultBranch?: string;
  allowSquashMerge?: boolean;
  allowMergeCommit?: boolean;
  allowRebaseMerge?: boolean;
  deleteBranchOnMerge?: boolean;
  archived?: boolean;
}

export interface RepoIdentifier {
  owner: string;
  repo: string;
}

export interface ListReposOptions {
  type?: "all" | "owner" | "public" | "private" | "member";
  sort?: "created" | "updated" | "pushed" | "full_name";
  direction?: "asc" | "desc";
  perPage?: number;
  page?: number;
}

export interface TransferRepoOptions extends RepoIdentifier {
  newOwner: string;
  newName?: string;
  teamIds?: number[];
}

export interface ForkRepoOptions extends RepoIdentifier {
  organization?: string;
  name?: string;
  defaultBranchOnly?: boolean;
}

export interface RepoTopicsOptions extends RepoIdentifier {
  topics: string[];
}

export interface RepoVisibility extends RepoIdentifier {
  visibility: "public" | "private" | "internal";
}

// ─── Branch Types ─────────────────────────────────────────────────────────────

export interface CreateBranchOptions extends RepoIdentifier {
  branchName: string;
  fromBranch?: string;
  fromSha?: string;
}

export interface DeleteBranchOptions extends RepoIdentifier {
  branchName: string;
}

export interface BranchProtectionOptions extends RepoIdentifier {
  branch: string;
  requiredReviews?: {
    dismissStaleReviews?: boolean;
    requireCodeOwnerReviews?: boolean;
    requiredApprovingReviewCount?: number;
  };
  requiredStatusChecks?: {
    strict: boolean;
    contexts: string[];
  };
  enforceAdmins?: boolean;
  restrictions?: {
    users: string[];
    teams: string[];
  } | null;
  allowForcePushes?: boolean;
  allowDeletions?: boolean;
}

export interface MergeBranchOptions extends RepoIdentifier {
  base: string;
  head: string;
  commitMessage?: string;
}

export interface RenameBranchOptions extends RepoIdentifier {
  branch: string;
  newName: string;
}

export interface ListBranchesOptions extends RepoIdentifier {
  protected?: boolean;
  perPage?: number;
  page?: number;
}

// ─── Issue Types ──────────────────────────────────────────────────────────────

export interface CreateIssueOptions extends RepoIdentifier {
  title: string;
  body?: string;
  assignees?: string[];
  labels?: string[];
  milestone?: number;
}

export interface UpdateIssueOptions extends RepoIdentifier {
  issueNumber: number;
  title?: string;
  body?: string;
  state?: "open" | "closed";
  stateReason?: "completed" | "not_planned" | "reopened";
  assignees?: string[];
  labels?: string[];
  milestone?: number | null;
}

export interface ListIssuesOptions extends RepoIdentifier {
  state?: "open" | "closed" | "all";
  assignee?: string;
  creator?: string;
  labels?: string;
  sort?: "created" | "updated" | "comments";
  direction?: "asc" | "desc";
  since?: string;
  perPage?: number;
  page?: number;
}

export interface IssueCommentOptions extends RepoIdentifier {
  issueNumber: number;
  body: string;
}

export interface LockIssueOptions extends RepoIdentifier {
  issueNumber: number;
  lockReason?: "off-topic" | "too heated" | "resolved" | "spam";
}

export interface BulkIssueOperation extends RepoIdentifier {
  issueNumbers: number[];
}

export interface BulkLabelOptions extends BulkIssueOperation {
  addLabels?: string[];
  removeLabels?: string[];
}

// ─── Pull Request Types ───────────────────────────────────────────────────────

export interface CreatePullRequestOptions extends RepoIdentifier {
  title: string;
  head: string;
  base: string;
  body?: string;
  draft?: boolean;
  maintainerCanModify?: boolean;
}

export interface UpdatePullRequestOptions extends RepoIdentifier {
  pullNumber: number;
  title?: string;
  body?: string;
  state?: "open" | "closed";
  base?: string;
  maintainerCanModify?: boolean;
}

export interface MergePullRequestOptions extends RepoIdentifier {
  pullNumber: number;
  commitTitle?: string;
  commitMessage?: string;
  mergeMethod?: "merge" | "squash" | "rebase";
  sha?: string;
}

export interface ListPullRequestsOptions extends RepoIdentifier {
  state?: "open" | "closed" | "all";
  head?: string;
  base?: string;
  sort?: "created" | "updated" | "popularity" | "long-running";
  direction?: "asc" | "desc";
  perPage?: number;
  page?: number;
}

export interface ReviewRequestOptions extends RepoIdentifier {
  pullNumber: number;
  reviewers?: string[];
  teamReviewers?: string[];
}

// ─── Release Types ────────────────────────────────────────────────────────────

export interface CreateReleaseOptions extends RepoIdentifier {
  tagName: string;
  name?: string;
  body?: string;
  draft?: boolean;
  prerelease?: boolean;
  targetCommitish?: string;
  generateReleaseNotes?: boolean;
}

export interface UpdateReleaseOptions extends RepoIdentifier {
  releaseId: number;
  tagName?: string;
  name?: string;
  body?: string;
  draft?: boolean;
  prerelease?: boolean;
  targetCommitish?: string;
}

export interface ListReleasesOptions extends RepoIdentifier {
  perPage?: number;
  page?: number;
}

export interface ReleaseAssetOptions extends RepoIdentifier {
  releaseId: number;
  assetName: string;
  assetLabel?: string;
  data: Buffer | string;
  contentType?: string;
}

// ─── Organization Types ───────────────────────────────────────────────────────

export interface ListOrgReposOptions {
  org: string;
  type?: "all" | "public" | "private" | "forks" | "sources" | "member";
  sort?: "created" | "updated" | "pushed" | "full_name";
  direction?: "asc" | "desc";
  perPage?: number;
  page?: number;
}

export interface OrgMemberOptions {
  org: string;
  username: string;
  role?: "admin" | "member";
}

export interface OrgTeamOptions {
  org: string;
  name: string;
  description?: string;
  privacy?: "secret" | "closed";
  parentTeamId?: number;
}

export interface OrgInviteOptions {
  org: string;
  email?: string;
  inviteeId?: number;
  role?: "admin" | "direct_member" | "billing_manager";
  teamIds?: number[];
}

export interface CreateOrgRepoOptions extends CreateRepoOptions {
  org: string;
}

// ─── Webhook Types ────────────────────────────────────────────────────────────

export interface CreateWebhookOptions extends RepoIdentifier {
  url: string;
  contentType?: "json" | "form";
  secret?: string;
  events?: string[];
  active?: boolean;
  insecureSsl?: boolean;
}

export interface UpdateWebhookOptions extends RepoIdentifier {
  hookId: number;
  url?: string;
  contentType?: "json" | "form";
  secret?: string;
  events?: string[];
  active?: boolean;
  insecureSsl?: boolean;
}

// ─── Collaborator Types ───────────────────────────────────────────────────────

export interface CollaboratorOptions extends RepoIdentifier {
  username: string;
  permission?: "pull" | "push" | "admin" | "maintain" | "triage";
}

export interface ListCollaboratorsOptions extends RepoIdentifier {
  affiliation?: "outside" | "direct" | "all";
  permission?: "pull" | "triage" | "push" | "maintain" | "admin";
  perPage?: number;
  page?: number;
}

// ─── Response Types ───────────────────────────────────────────────────────────

export interface GhubResponse<T> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

export interface PaginatedResponse<T> extends GhubResponse<T[]> {
  pagination: {
    page: number;
    perPage: number;
    totalCount?: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface BatchResult<T> {
  succeeded: Array<{ item: T; result: unknown }>;
  failed: Array<{ item: T; error: Error }>;
  total: number;
  successCount: number;
  failureCount: number;
}

// ─── Error Types ──────────────────────────────────────────────────────────────

export class GhubManagerError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: unknown,
  ) {
    super(message);
    this.name = "GhubManagerError";
  }
}

export class GhubRateLimitError extends GhubManagerError {
  constructor(
    public resetAt: Date,
    public remaining: number,
  ) {
    super(`GitHub API rate limit exceeded. Resets at ${resetAt.toISOString()}`);
    this.name = "GhubRateLimitError";
    this.statusCode = 403;
  }
}

export class GhubNotFoundError extends GhubManagerError {
  constructor(resource: string) {
    super(`Resource not found: ${resource}`);
    this.name = "GhubNotFoundError";
    this.statusCode = 404;
  }
}

export class GhubAuthError extends GhubManagerError {
  constructor() {
    super("Authentication failed. Check your token and permissions.");
    this.name = "GhubAuthError";
    this.statusCode = 401;
  }
}

export class GhubValidationError extends GhubManagerError {
  constructor(
    message: string,
    public errors?: Array<{ field: string; code: string; message?: string }>,
  ) {
    super(message);
    this.name = "GhubValidationError";
    this.statusCode = 422;
  }
}
