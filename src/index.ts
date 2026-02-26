// Core
export { createClient, getRateLimit, validateToken, withErrorHandling } from "./client";
export { paginate, batchOperation, parseRepoString, retry, delay } from "./utils";

// Modules
export * as repos from "./repos";
export * as branches from "./branches";
export * as issues from "./issues";
export * as pulls from "./pulls";
export * as releases from "./releases";
export * as orgs from "./orgs";

// Types
export type {
  GhubManagerConfig,
  GhubManagerClient,
  CreateRepoOptions,
  UpdateRepoOptions,
  RepoIdentifier,
  ListReposOptions,
  TransferRepoOptions,
  ForkRepoOptions,
  RepoTopicsOptions,
  RepoVisibility,
  CreateBranchOptions,
  DeleteBranchOptions,
  BranchProtectionOptions,
  MergeBranchOptions,
  RenameBranchOptions,
  ListBranchesOptions,
  CreateIssueOptions,
  UpdateIssueOptions,
  ListIssuesOptions,
  IssueCommentOptions,
  LockIssueOptions,
  BulkIssueOperation,
  BulkLabelOptions,
  CreatePullRequestOptions,
  UpdatePullRequestOptions,
  MergePullRequestOptions,
  ListPullRequestsOptions,
  ReviewRequestOptions,
  CreateReleaseOptions,
  UpdateReleaseOptions,
  ListReleasesOptions,
  ReleaseAssetOptions,
  ListOrgReposOptions,
  OrgMemberOptions,
  OrgTeamOptions,
  OrgInviteOptions,
  CreateOrgRepoOptions,
  CreateWebhookOptions,
  UpdateWebhookOptions,
  CollaboratorOptions,
  ListCollaboratorsOptions,
  GhubResponse,
  PaginatedResponse,
  BatchResult,
} from "./types";

// Error classes
export {
  GhubManagerError,
  GhubRateLimitError,
  GhubNotFoundError,
  GhubAuthError,
  GhubValidationError,
} from "./types";
