import type {
  GhubManagerClient,
  CreateRepoOptions,
  UpdateRepoOptions,
  RepoIdentifier,
  ListReposOptions,
  TransferRepoOptions,
  ForkRepoOptions,
  RepoTopicsOptions,
  RepoVisibility,
  CollaboratorOptions,
  ListCollaboratorsOptions,
  CreateWebhookOptions,
  UpdateWebhookOptions,
  CreateOrgRepoOptions,
} from "../types";
import { withErrorHandling } from "../client";
import { paginate } from "../utils";

/**
 * Creates a new repository for the authenticated user.
 *
 * @example
 * ```ts
 * const repo = await createRepo(client, {
 *   name: "my-new-project",
 *   description: "A cool new project",
 *   private: true,
 *   autoInit: true,
 *   gitignoreTemplate: "Node",
 *   licenseTemplate: "mit",
 * });
 * console.log(`Created: ${repo.html_url}`);
 * ```
 */
export async function createRepo(client: GhubManagerClient, options: CreateRepoOptions) {
  return withErrorHandling(async () => {
    const { data } = await client.octokit.repos.createForAuthenticatedUser({
      name: options.name,
      description: options.description,
      private: options.private ?? false,
      auto_init: options.autoInit,
      gitignore_template: options.gitignoreTemplate,
      license_template: options.licenseTemplate,
      homepage: options.homepage,
      has_issues: options.hasIssues ?? true,
      has_projects: options.hasProjects ?? true,
      has_wiki: options.hasWiki ?? true,
      has_downloads: options.hasDownloads ?? true,
      is_template: options.isTemplate,
      allow_squash_merge: options.allowSquashMerge,
      allow_merge_commit: options.allowMergeCommit,
      allow_rebase_merge: options.allowRebaseMerge,
      delete_branch_on_merge: options.deleteBranchOnMerge,
    });
    return data;
  });
}

/**
 * Creates a new repository within an organization.
 *
 * @example
 * ```ts
 * const repo = await createOrgRepo(client, {
 *   org: "my-org",
 *   name: "shared-utils",
 *   description: "Shared utilities for the org",
 *   private: true,
 * });
 * ```
 */
export async function createOrgRepo(client: GhubManagerClient, options: CreateOrgRepoOptions) {
  return withErrorHandling(async () => {
    const { data } = await client.octokit.repos.createInOrg({
      org: options.org,
      name: options.name,
      description: options.description,
      private: options.private ?? false,
      auto_init: options.autoInit,
      gitignore_template: options.gitignoreTemplate,
      license_template: options.licenseTemplate,
      homepage: options.homepage,
      has_issues: options.hasIssues ?? true,
      has_projects: options.hasProjects ?? true,
      has_wiki: options.hasWiki ?? true,
      is_template: options.isTemplate,
      allow_squash_merge: options.allowSquashMerge,
      allow_merge_commit: options.allowMergeCommit,
      allow_rebase_merge: options.allowRebaseMerge,
      delete_branch_on_merge: options.deleteBranchOnMerge,
      team_id: options.teamId,
    });
    return data;
  });
}

/**
 * Gets detailed information about a repository.
 *
 * @example
 * ```ts
 * const repo = await getRepo(client, { owner: "octocat", repo: "hello-world" });
 * console.log(`Stars: ${repo.stargazers_count}`);
 * console.log(`Default branch: ${repo.default_branch}`);
 * ```
 */
export async function getRepo(client: GhubManagerClient, id: RepoIdentifier) {
  return withErrorHandling(async () => {
    const { data } = await client.octokit.repos.get({
      owner: id.owner,
      repo: id.repo,
    });
    return data;
  });
}

/**
 * Updates repository settings and metadata.
 *
 * @example
 * ```ts
 * await updateRepo(client, {
 *   owner: "octocat",
 *   repo: "hello-world",
 *   description: "Updated description",
 *   hasWiki: false,
 *   deleteBranchOnMerge: true,
 * });
 * ```
 */
export async function updateRepo(client: GhubManagerClient, options: UpdateRepoOptions) {
  return withErrorHandling(async () => {
    const { data } = await client.octokit.repos.update({
      owner: options.owner,
      repo: options.repo,
      name: options.name,
      description: options.description,
      homepage: options.homepage,
      private: options.private,
      has_issues: options.hasIssues,
      has_projects: options.hasProjects,
      has_wiki: options.hasWiki,
      default_branch: options.defaultBranch,
      allow_squash_merge: options.allowSquashMerge,
      allow_merge_commit: options.allowMergeCommit,
      allow_rebase_merge: options.allowRebaseMerge,
      delete_branch_on_merge: options.deleteBranchOnMerge,
      archived: options.archived,
    });
    return data;
  });
}

/**
 * Permanently deletes a repository. This action is irreversible.
 * Requires the `delete_repo` scope on the token.
 *
 * @example
 * ```ts
 * await deleteRepo(client, { owner: "octocat", repo: "old-project" });
 * ```
 */
export async function deleteRepo(client: GhubManagerClient, id: RepoIdentifier) {
  return withErrorHandling(async () => {
    await client.octokit.repos.delete({
      owner: id.owner,
      repo: id.repo,
    });
  });
}

/**
 * Lists repositories for the authenticated user.
 *
 * @example
 * ```ts
 * const repos = await listRepos(client, {
 *   type: "owner",
 *   sort: "updated",
 *   direction: "desc",
 *   perPage: 50,
 * });
 * repos.forEach(r => console.log(`${r.full_name} - ${r.description}`));
 * ```
 */
export async function listRepos(client: GhubManagerClient, options: ListReposOptions = {}) {
  return withErrorHandling(async () => {
    const { data } = await client.octokit.repos.listForAuthenticatedUser({
      type: options.type,
      sort: options.sort,
      direction: options.direction,
      per_page: options.perPage ?? 30,
      page: options.page ?? 1,
    });
    return data;
  });
}

/**
 * Lists all repositories for the authenticated user, handling pagination automatically.
 *
 * @example
 * ```ts
 * const allRepos = await listAllRepos(client, { type: "owner" });
 * console.log(`Total repos: ${allRepos.length}`);
 * ```
 */
export async function listAllRepos(
  client: GhubManagerClient,
  options: Omit<ListReposOptions, "page" | "perPage"> = {},
) {
  return paginate(
    client,
    (octokit, opts) => octokit.repos.listForAuthenticatedUser(opts as Parameters<typeof octokit.repos.listForAuthenticatedUser>[0]),
    { ...options, per_page: 100 },
  );
}

/**
 * Forks a repository to the authenticated user's account or an organization.
 *
 * @example
 * ```ts
 * const fork = await forkRepo(client, {
 *   owner: "facebook",
 *   repo: "react",
 *   organization: "my-org",
 * });
 * ```
 */
export async function forkRepo(client: GhubManagerClient, options: ForkRepoOptions) {
  return withErrorHandling(async () => {
    const { data } = await client.octokit.repos.createFork({
      owner: options.owner,
      repo: options.repo,
      organization: options.organization,
      name: options.name,
      default_branch_only: options.defaultBranchOnly,
    });
    return data;
  });
}

/**
 * Transfers a repository to a new owner.
 *
 * @example
 * ```ts
 * await transferRepo(client, {
 *   owner: "old-owner",
 *   repo: "my-repo",
 *   newOwner: "new-owner",
 * });
 * ```
 */
export async function transferRepo(client: GhubManagerClient, options: TransferRepoOptions) {
  return withErrorHandling(async () => {
    const { data } = await client.octokit.repos.transfer({
      owner: options.owner,
      repo: options.repo,
      new_owner: options.newOwner,
      new_name: options.newName,
      team_ids: options.teamIds,
    });
    return data;
  });
}

/**
 * Changes the visibility of a repository (public, private, or internal).
 *
 * @example
 * ```ts
 * await changeVisibility(client, {
 *   owner: "octocat",
 *   repo: "secret-project",
 *   visibility: "private",
 * });
 * ```
 */
export async function changeVisibility(client: GhubManagerClient, options: RepoVisibility) {
  return withErrorHandling(async () => {
    const { data } = await client.octokit.repos.update({
      owner: options.owner,
      repo: options.repo,
      visibility: options.visibility,
    });
    return data;
  });
}

/**
 * Replaces all topics on a repository.
 *
 * @example
 * ```ts
 * await setTopics(client, {
 *   owner: "octocat",
 *   repo: "hello-world",
 *   topics: ["javascript", "tutorial", "hello-world"],
 * });
 * ```
 */
export async function setTopics(client: GhubManagerClient, options: RepoTopicsOptions) {
  return withErrorHandling(async () => {
    const { data } = await client.octokit.repos.replaceAllTopics({
      owner: options.owner,
      repo: options.repo,
      names: options.topics,
    });
    return data;
  });
}

/**
 * Gets the list of topics for a repository.
 *
 * @example
 * ```ts
 * const topics = await getTopics(client, { owner: "octocat", repo: "hello-world" });
 * ```
 */
export async function getTopics(client: GhubManagerClient, id: RepoIdentifier) {
  return withErrorHandling(async () => {
    const { data } = await client.octokit.repos.getAllTopics({
      owner: id.owner,
      repo: id.repo,
    });
    return data.names;
  });
}

/**
 * Archives a repository, making it read-only.
 *
 * @example
 * ```ts
 * await archiveRepo(client, { owner: "octocat", repo: "deprecated-lib" });
 * ```
 */
export async function archiveRepo(client: GhubManagerClient, id: RepoIdentifier) {
  return updateRepo(client, { ...id, archived: true });
}

/**
 * Adds a collaborator to a repository.
 *
 * @example
 * ```ts
 * await addCollaborator(client, {
 *   owner: "octocat",
 *   repo: "hello-world",
 *   username: "new-contributor",
 *   permission: "push",
 * });
 * ```
 */
export async function addCollaborator(client: GhubManagerClient, options: CollaboratorOptions) {
  return withErrorHandling(async () => {
    const { data } = await client.octokit.repos.addCollaborator({
      owner: options.owner,
      repo: options.repo,
      username: options.username,
      permission: options.permission,
    });
    return data;
  });
}

/**
 * Removes a collaborator from a repository.
 *
 * @example
 * ```ts
 * await removeCollaborator(client, {
 *   owner: "octocat",
 *   repo: "hello-world",
 *   username: "former-contributor",
 * });
 * ```
 */
export async function removeCollaborator(client: GhubManagerClient, options: Omit<CollaboratorOptions, "permission">) {
  return withErrorHandling(async () => {
    await client.octokit.repos.removeCollaborator({
      owner: options.owner,
      repo: options.repo,
      username: options.username,
    });
  });
}

/**
 * Lists collaborators for a repository.
 *
 * @example
 * ```ts
 * const collabs = await listCollaborators(client, {
 *   owner: "octocat",
 *   repo: "hello-world",
 *   affiliation: "direct",
 * });
 * ```
 */
export async function listCollaborators(client: GhubManagerClient, options: ListCollaboratorsOptions) {
  return withErrorHandling(async () => {
    const { data } = await client.octokit.repos.listCollaborators({
      owner: options.owner,
      repo: options.repo,
      affiliation: options.affiliation,
      permission: options.permission,
      per_page: options.perPage ?? 30,
      page: options.page ?? 1,
    });
    return data;
  });
}

/**
 * Creates a webhook for a repository.
 *
 * @example
 * ```ts
 * const hook = await createWebhook(client, {
 *   owner: "octocat",
 *   repo: "hello-world",
 *   url: "https://example.com/webhook",
 *   events: ["push", "pull_request"],
 *   secret: "my-webhook-secret",
 * });
 * ```
 */
export async function createWebhook(client: GhubManagerClient, options: CreateWebhookOptions) {
  return withErrorHandling(async () => {
    const { data } = await client.octokit.repos.createWebhook({
      owner: options.owner,
      repo: options.repo,
      config: {
        url: options.url,
        content_type: options.contentType ?? "json",
        secret: options.secret,
        insecure_ssl: options.insecureSsl ? "1" : "0",
      },
      events: options.events ?? ["push"],
      active: options.active ?? true,
    });
    return data;
  });
}

/**
 * Deletes a webhook from a repository.
 *
 * @example
 * ```ts
 * await deleteWebhook(client, { owner: "octocat", repo: "hello-world" }, 12345);
 * ```
 */
export async function deleteWebhook(client: GhubManagerClient, id: RepoIdentifier, hookId: number) {
  return withErrorHandling(async () => {
    await client.octokit.repos.deleteWebhook({
      owner: id.owner,
      repo: id.repo,
      hook_id: hookId,
    });
  });
}

/**
 * Lists webhooks for a repository.
 *
 * @example
 * ```ts
 * const hooks = await listWebhooks(client, { owner: "octocat", repo: "hello-world" });
 * ```
 */
export async function listWebhooks(client: GhubManagerClient, id: RepoIdentifier) {
  return withErrorHandling(async () => {
    const { data } = await client.octokit.repos.listWebhooks({
      owner: id.owner,
      repo: id.repo,
    });
    return data;
  });
}

/**
 * Gets the languages breakdown for a repository.
 *
 * @example
 * ```ts
 * const langs = await getLanguages(client, { owner: "octocat", repo: "hello-world" });
 * // => { TypeScript: 45000, JavaScript: 12000, CSS: 3000 }
 * ```
 */
export async function getLanguages(client: GhubManagerClient, id: RepoIdentifier) {
  return withErrorHandling(async () => {
    const { data } = await client.octokit.repos.listLanguages({
      owner: id.owner,
      repo: id.repo,
    });
    return data;
  });
}

/**
 * Checks if a user is a collaborator on a repository.
 *
 * @example
 * ```ts
 * const isCollab = await isCollaborator(client, {
 *   owner: "octocat",
 *   repo: "hello-world",
 *   username: "someuser",
 * });
 * ```
 */
export async function isCollaborator(
  client: GhubManagerClient,
  options: Omit<CollaboratorOptions, "permission">,
): Promise<boolean> {
  try {
    await client.octokit.repos.checkCollaborator({
      owner: options.owner,
      repo: options.repo,
      username: options.username,
    });
    return true;
  } catch {
    return false;
  }
}
