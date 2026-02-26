import type {
  GhubManagerClient,
  RepoIdentifier,
  CreateBranchOptions,
  DeleteBranchOptions,
  BranchProtectionOptions,
  MergeBranchOptions,
  RenameBranchOptions,
  ListBranchesOptions,
} from "../types";
import { withErrorHandling } from "../client";

/**
 * Creates a new branch from an existing branch or SHA.
 *
 * @example
 * ```ts
 * // Create from default branch
 * await createBranch(client, {
 *   owner: "octocat",
 *   repo: "hello-world",
 *   branchName: "feature/new-feature",
 * });
 *
 * // Create from a specific branch
 * await createBranch(client, {
 *   owner: "octocat",
 *   repo: "hello-world",
 *   branchName: "hotfix/urgent-fix",
 *   fromBranch: "release/v1.0",
 * });
 *
 * // Create from a specific commit SHA
 * await createBranch(client, {
 *   owner: "octocat",
 *   repo: "hello-world",
 *   branchName: "experiment/test",
 *   fromSha: "abc123def456",
 * });
 * ```
 */
export async function createBranch(client: GhubManagerClient, options: CreateBranchOptions) {
  return withErrorHandling(async () => {
    let sha = options.fromSha;

    if (!sha) {
      const sourceBranch = options.fromBranch ?? (await getDefaultBranch(client, options));
      const { data: ref } = await client.octokit.git.getRef({
        owner: options.owner,
        repo: options.repo,
        ref: `heads/${sourceBranch}`,
      });
      sha = ref.object.sha;
    }

    const { data } = await client.octokit.git.createRef({
      owner: options.owner,
      repo: options.repo,
      ref: `refs/heads/${options.branchName}`,
      sha,
    });
    return data;
  });
}

/**
 * Deletes a branch from a repository.
 *
 * @example
 * ```ts
 * await deleteBranch(client, {
 *   owner: "octocat",
 *   repo: "hello-world",
 *   branchName: "feature/old-feature",
 * });
 * ```
 */
export async function deleteBranch(client: GhubManagerClient, options: DeleteBranchOptions) {
  return withErrorHandling(async () => {
    await client.octokit.git.deleteRef({
      owner: options.owner,
      repo: options.repo,
      ref: `heads/${options.branchName}`,
    });
  });
}

/**
 * Lists branches for a repository.
 *
 * @example
 * ```ts
 * const branches = await listBranches(client, {
 *   owner: "octocat",
 *   repo: "hello-world",
 *   protected: true,
 * });
 * branches.forEach(b => console.log(`${b.name} (protected: ${b.protected})`));
 * ```
 */
export async function listBranches(client: GhubManagerClient, options: ListBranchesOptions) {
  return withErrorHandling(async () => {
    const { data } = await client.octokit.repos.listBranches({
      owner: options.owner,
      repo: options.repo,
      protected: options.protected,
      per_page: options.perPage ?? 30,
      page: options.page ?? 1,
    });
    return data;
  });
}

/**
 * Gets detailed information about a specific branch.
 *
 * @example
 * ```ts
 * const branch = await getBranch(client, {
 *   owner: "octocat",
 *   repo: "hello-world",
 * }, "main");
 * console.log(`Latest commit: ${branch.commit.sha}`);
 * ```
 */
export async function getBranch(client: GhubManagerClient, id: RepoIdentifier, branchName: string) {
  return withErrorHandling(async () => {
    const { data } = await client.octokit.repos.getBranch({
      owner: id.owner,
      repo: id.repo,
      branch: branchName,
    });
    return data;
  });
}

/**
 * Renames a branch.
 *
 * @example
 * ```ts
 * await renameBranch(client, {
 *   owner: "octocat",
 *   repo: "hello-world",
 *   branch: "master",
 *   newName: "main",
 * });
 * ```
 */
export async function renameBranch(client: GhubManagerClient, options: RenameBranchOptions) {
  return withErrorHandling(async () => {
    const { data } = await client.octokit.repos.renameBranch({
      owner: options.owner,
      repo: options.repo,
      branch: options.branch,
      new_name: options.newName,
    });
    return data;
  });
}

/**
 * Merges one branch into another.
 *
 * @example
 * ```ts
 * const merge = await mergeBranch(client, {
 *   owner: "octocat",
 *   repo: "hello-world",
 *   base: "main",
 *   head: "feature/my-feature",
 *   commitMessage: "Merge feature into main",
 * });
 * ```
 */
export async function mergeBranch(client: GhubManagerClient, options: MergeBranchOptions) {
  return withErrorHandling(async () => {
    const { data } = await client.octokit.repos.merge({
      owner: options.owner,
      repo: options.repo,
      base: options.base,
      head: options.head,
      commit_message: options.commitMessage,
    });
    return data;
  });
}

/**
 * Sets branch protection rules.
 *
 * @example
 * ```ts
 * await setBranchProtection(client, {
 *   owner: "octocat",
 *   repo: "hello-world",
 *   branch: "main",
 *   requiredReviews: {
 *     requiredApprovingReviewCount: 2,
 *     dismissStaleReviews: true,
 *     requireCodeOwnerReviews: true,
 *   },
 *   requiredStatusChecks: {
 *     strict: true,
 *     contexts: ["ci/build", "ci/test"],
 *   },
 *   enforceAdmins: true,
 *   allowForcePushes: false,
 *   allowDeletions: false,
 * });
 * ```
 */
export async function setBranchProtection(client: GhubManagerClient, options: BranchProtectionOptions) {
  return withErrorHandling(async () => {
    const { data } = await client.octokit.repos.updateBranchProtection({
      owner: options.owner,
      repo: options.repo,
      branch: options.branch,
      required_pull_request_reviews: options.requiredReviews
        ? {
            dismiss_stale_reviews: options.requiredReviews.dismissStaleReviews,
            require_code_owner_reviews: options.requiredReviews.requireCodeOwnerReviews,
            required_approving_review_count: options.requiredReviews.requiredApprovingReviewCount,
          }
        : null,
      required_status_checks: options.requiredStatusChecks
        ? {
            strict: options.requiredStatusChecks.strict,
            contexts: options.requiredStatusChecks.contexts,
          }
        : null,
      enforce_admins: options.enforceAdmins ?? null,
      restrictions: options.restrictions ?? null,
      allow_force_pushes: options.allowForcePushes ?? false,
      allow_deletions: options.allowDeletions ?? false,
    });
    return data;
  });
}

/**
 * Removes branch protection rules.
 *
 * @example
 * ```ts
 * await removeBranchProtection(client, { owner: "octocat", repo: "hello-world" }, "main");
 * ```
 */
export async function removeBranchProtection(
  client: GhubManagerClient,
  id: RepoIdentifier,
  branch: string,
) {
  return withErrorHandling(async () => {
    await client.octokit.repos.deleteBranchProtection({
      owner: id.owner,
      repo: id.repo,
      branch,
    });
  });
}

/**
 * Gets the branch protection rules for a branch.
 *
 * @example
 * ```ts
 * const protection = await getBranchProtection(client,
 *   { owner: "octocat", repo: "hello-world" },
 *   "main"
 * );
 * ```
 */
export async function getBranchProtection(
  client: GhubManagerClient,
  id: RepoIdentifier,
  branch: string,
) {
  return withErrorHandling(async () => {
    const { data } = await client.octokit.repos.getBranchProtection({
      owner: id.owner,
      repo: id.repo,
      branch,
    });
    return data;
  });
}

/**
 * Compares two branches and returns the diff.
 *
 * @example
 * ```ts
 * const comparison = await compareBranches(client,
 *   { owner: "octocat", repo: "hello-world" },
 *   "main",
 *   "feature/new-feature"
 * );
 * console.log(`Ahead by ${comparison.ahead_by}, behind by ${comparison.behind_by}`);
 * console.log(`Files changed: ${comparison.files?.length}`);
 * ```
 */
export async function compareBranches(
  client: GhubManagerClient,
  id: RepoIdentifier,
  base: string,
  head: string,
) {
  return withErrorHandling(async () => {
    const { data } = await client.octokit.repos.compareCommits({
      owner: id.owner,
      repo: id.repo,
      base,
      head,
    });
    return data;
  });
}

/**
 * Gets the default branch name for a repository.
 */
async function getDefaultBranch(client: GhubManagerClient, id: RepoIdentifier): Promise<string> {
  const { data } = await client.octokit.repos.get({
    owner: id.owner,
    repo: id.repo,
  });
  return data.default_branch;
}
