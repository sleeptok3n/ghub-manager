import type {
  GhubManagerClient,
  RepoIdentifier,
  CreateReleaseOptions,
  UpdateReleaseOptions,
  ListReleasesOptions,
} from "../types";
import { withErrorHandling } from "../client";

/**
 * Creates a new release with optional auto-generated release notes.
 *
 * @example
 * ```ts
 * const release = await createRelease(client, {
 *   owner: "octocat",
 *   repo: "hello-world",
 *   tagName: "v1.0.0",
 *   name: "Version 1.0.0",
 *   body: "## What's Changed\n- Initial stable release",
 *   generateReleaseNotes: true,
 * });
 * console.log(`Release: ${release.html_url}`);
 * ```
 */
export async function createRelease(client: GhubManagerClient, options: CreateReleaseOptions) {
  return withErrorHandling(async () => {
    const { data } = await client.octokit.repos.createRelease({
      owner: options.owner,
      repo: options.repo,
      tag_name: options.tagName,
      name: options.name,
      body: options.body,
      draft: options.draft,
      prerelease: options.prerelease,
      target_commitish: options.targetCommitish,
      generate_release_notes: options.generateReleaseNotes,
    });
    return data;
  });
}

/**
 * Updates an existing release.
 *
 * @example
 * ```ts
 * await updateRelease(client, {
 *   owner: "octocat",
 *   repo: "hello-world",
 *   releaseId: 12345,
 *   name: "Version 1.0.1 (Hotfix)",
 *   body: "## Hotfix\n- Fixed critical bug",
 * });
 * ```
 */
export async function updateRelease(client: GhubManagerClient, options: UpdateReleaseOptions) {
  return withErrorHandling(async () => {
    const { data } = await client.octokit.repos.updateRelease({
      owner: options.owner,
      repo: options.repo,
      release_id: options.releaseId,
      tag_name: options.tagName,
      name: options.name,
      body: options.body,
      draft: options.draft,
      prerelease: options.prerelease,
      target_commitish: options.targetCommitish,
    });
    return data;
  });
}

/**
 * Deletes a release (does not delete the associated tag).
 *
 * @example
 * ```ts
 * await deleteRelease(client, { owner: "octocat", repo: "hello-world" }, 12345);
 * ```
 */
export async function deleteRelease(
  client: GhubManagerClient,
  id: RepoIdentifier,
  releaseId: number,
) {
  return withErrorHandling(async () => {
    await client.octokit.repos.deleteRelease({
      owner: id.owner,
      repo: id.repo,
      release_id: releaseId,
    });
  });
}

/**
 * Gets a single release by ID.
 *
 * @example
 * ```ts
 * const release = await getRelease(client, { owner: "octocat", repo: "hello-world" }, 12345);
 * ```
 */
export async function getRelease(
  client: GhubManagerClient,
  id: RepoIdentifier,
  releaseId: number,
) {
  return withErrorHandling(async () => {
    const { data } = await client.octokit.repos.getRelease({
      owner: id.owner,
      repo: id.repo,
      release_id: releaseId,
    });
    return data;
  });
}

/**
 * Gets the latest release for a repository.
 *
 * @example
 * ```ts
 * const latest = await getLatestRelease(client, { owner: "octocat", repo: "hello-world" });
 * console.log(`Latest: ${latest.tag_name} - ${latest.name}`);
 * ```
 */
export async function getLatestRelease(client: GhubManagerClient, id: RepoIdentifier) {
  return withErrorHandling(async () => {
    const { data } = await client.octokit.repos.getLatestRelease({
      owner: id.owner,
      repo: id.repo,
    });
    return data;
  });
}

/**
 * Gets a release by its tag name.
 *
 * @example
 * ```ts
 * const release = await getReleaseByTag(client,
 *   { owner: "octocat", repo: "hello-world" },
 *   "v1.0.0"
 * );
 * ```
 */
export async function getReleaseByTag(
  client: GhubManagerClient,
  id: RepoIdentifier,
  tag: string,
) {
  return withErrorHandling(async () => {
    const { data } = await client.octokit.repos.getReleaseByTag({
      owner: id.owner,
      repo: id.repo,
      tag,
    });
    return data;
  });
}

/**
 * Lists releases for a repository.
 *
 * @example
 * ```ts
 * const releases = await listReleases(client, {
 *   owner: "octocat",
 *   repo: "hello-world",
 *   perPage: 10,
 * });
 * releases.forEach(r => console.log(`${r.tag_name}: ${r.name}`));
 * ```
 */
export async function listReleases(client: GhubManagerClient, options: ListReleasesOptions) {
  return withErrorHandling(async () => {
    const { data } = await client.octokit.repos.listReleases({
      owner: options.owner,
      repo: options.repo,
      per_page: options.perPage ?? 30,
      page: options.page ?? 1,
    });
    return data;
  });
}

/**
 * Lists assets for a release.
 *
 * @example
 * ```ts
 * const assets = await listReleaseAssets(client,
 *   { owner: "octocat", repo: "hello-world" },
 *   12345
 * );
 * assets.forEach(a => console.log(`${a.name} (${a.size} bytes, ${a.download_count} downloads)`));
 * ```
 */
export async function listReleaseAssets(
  client: GhubManagerClient,
  id: RepoIdentifier,
  releaseId: number,
) {
  return withErrorHandling(async () => {
    const { data } = await client.octokit.repos.listReleaseAssets({
      owner: id.owner,
      repo: id.repo,
      release_id: releaseId,
    });
    return data;
  });
}

/**
 * Deletes a release asset.
 *
 * @example
 * ```ts
 * await deleteReleaseAsset(client, { owner: "octocat", repo: "hello-world" }, 67890);
 * ```
 */
export async function deleteReleaseAsset(
  client: GhubManagerClient,
  id: RepoIdentifier,
  assetId: number,
) {
  return withErrorHandling(async () => {
    await client.octokit.repos.deleteReleaseAsset({
      owner: id.owner,
      repo: id.repo,
      asset_id: assetId,
    });
  });
}

/**
 * Generates release notes content for a tag.
 *
 * @example
 * ```ts
 * const notes = await generateReleaseNotes(client, {
 *   owner: "octocat",
 *   repo: "hello-world",
 *   tagName: "v2.0.0",
 *   targetCommitish: "main",
 * });
 * console.log(notes.body);
 * ```
 */
export async function generateReleaseNotes(
  client: GhubManagerClient,
  options: {
    owner: string;
    repo: string;
    tagName: string;
    targetCommitish?: string;
    previousTagName?: string;
  },
) {
  return withErrorHandling(async () => {
    const { data } = await client.octokit.repos.generateReleaseNotes({
      owner: options.owner,
      repo: options.repo,
      tag_name: options.tagName,
      target_commitish: options.targetCommitish,
      previous_tag_name: options.previousTagName,
    });
    return data;
  });
}

/**
 * Publishes a draft release (makes it non-draft).
 *
 * @example
 * ```ts
 * await publishRelease(client, { owner: "octocat", repo: "hello-world" }, 12345);
 * ```
 */
export async function publishRelease(
  client: GhubManagerClient,
  id: RepoIdentifier,
  releaseId: number,
) {
  return updateRelease(client, { ...id, releaseId, draft: false });
}
