import type {
  GhubManagerClient,
  ListOrgReposOptions,
  OrgMemberOptions,
  OrgTeamOptions,
  OrgInviteOptions,
} from "../types";
import { withErrorHandling } from "../client";

/**
 * Gets information about an organization.
 *
 * @example
 * ```ts
 * const org = await getOrg(client, "my-org");
 * console.log(`${org.login}: ${org.description}`);
 * console.log(`Public repos: ${org.public_repos}`);
 * ```
 */
export async function getOrg(client: GhubManagerClient, org: string) {
  return withErrorHandling(async () => {
    const { data } = await client.octokit.orgs.get({ org });
    return data;
  });
}

/**
 * Updates organization profile information.
 *
 * @example
 * ```ts
 * await updateOrg(client, "my-org", {
 *   description: "Building the future",
 *   blog: "https://blog.my-org.dev",
 *   defaultRepositoryPermission: "read",
 *   membersCanCreateRepositories: true,
 * });
 * ```
 */
export async function updateOrg(
  client: GhubManagerClient,
  org: string,
  options: {
    description?: string;
    blog?: string;
    company?: string;
    email?: string;
    location?: string;
    name?: string;
    defaultRepositoryPermission?: "read" | "write" | "admin" | "none";
    membersCanCreateRepositories?: boolean;
  },
) {
  return withErrorHandling(async () => {
    const { data } = await client.octokit.orgs.update({
      org,
      description: options.description,
      blog: options.blog,
      company: options.company,
      email: options.email,
      location: options.location,
      name: options.name,
      default_repository_permission: options.defaultRepositoryPermission,
      members_can_create_repositories: options.membersCanCreateRepositories,
    });
    return data;
  });
}

/**
 * Lists repositories belonging to an organization.
 *
 * @example
 * ```ts
 * const repos = await listOrgRepos(client, {
 *   org: "my-org",
 *   type: "all",
 *   sort: "updated",
 *   direction: "desc",
 * });
 * repos.forEach(r => console.log(`${r.full_name} [${r.visibility}]`));
 * ```
 */
export async function listOrgRepos(client: GhubManagerClient, options: ListOrgReposOptions) {
  return withErrorHandling(async () => {
    const { data } = await client.octokit.repos.listForOrg({
      org: options.org,
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
 * Lists members of an organization.
 *
 * @example
 * ```ts
 * const members = await listOrgMembers(client, "my-org", { role: "admin" });
 * members.forEach(m => console.log(m.login));
 * ```
 */
export async function listOrgMembers(
  client: GhubManagerClient,
  org: string,
  options?: { role?: "all" | "admin" | "member"; perPage?: number; page?: number },
) {
  return withErrorHandling(async () => {
    const { data } = await client.octokit.orgs.listMembers({
      org,
      role: options?.role,
      per_page: options?.perPage ?? 30,
      page: options?.page ?? 1,
    });
    return data;
  });
}

/**
 * Sets the organization membership role for a user.
 *
 * @example
 * ```ts
 * await setMemberRole(client, {
 *   org: "my-org",
 *   username: "newadmin",
 *   role: "admin",
 * });
 * ```
 */
export async function setMemberRole(client: GhubManagerClient, options: OrgMemberOptions) {
  return withErrorHandling(async () => {
    const { data } = await client.octokit.orgs.setMembershipForUser({
      org: options.org,
      username: options.username,
      role: options.role ?? "member",
    });
    return data;
  });
}

/**
 * Removes a member from an organization.
 *
 * @example
 * ```ts
 * await removeMember(client, "my-org", "former-member");
 * ```
 */
export async function removeMember(client: GhubManagerClient, org: string, username: string) {
  return withErrorHandling(async () => {
    await client.octokit.orgs.removeMember({ org, username });
  });
}

/**
 * Creates a team within an organization.
 *
 * @example
 * ```ts
 * const team = await createTeam(client, {
 *   org: "my-org",
 *   name: "frontend-team",
 *   description: "Frontend developers",
 *   privacy: "closed",
 * });
 * console.log(`Team: ${team.name} (${team.slug})`);
 * ```
 */
export async function createTeam(client: GhubManagerClient, options: OrgTeamOptions) {
  return withErrorHandling(async () => {
    const { data } = await client.octokit.teams.create({
      org: options.org,
      name: options.name,
      description: options.description,
      privacy: options.privacy,
      parent_team_id: options.parentTeamId,
    });
    return data;
  });
}

/**
 * Deletes a team from an organization.
 *
 * @example
 * ```ts
 * await deleteTeam(client, "my-org", "deprecated-team");
 * ```
 */
export async function deleteTeam(client: GhubManagerClient, org: string, teamSlug: string) {
  return withErrorHandling(async () => {
    await client.octokit.teams.deleteInOrg({ org, team_slug: teamSlug });
  });
}

/**
 * Lists teams in an organization.
 *
 * @example
 * ```ts
 * const teams = await listTeams(client, "my-org");
 * teams.forEach(t => console.log(`${t.name}: ${t.description}`));
 * ```
 */
export async function listTeams(
  client: GhubManagerClient,
  org: string,
  options?: { perPage?: number; page?: number },
) {
  return withErrorHandling(async () => {
    const { data } = await client.octokit.teams.list({
      org,
      per_page: options?.perPage ?? 30,
      page: options?.page ?? 1,
    });
    return data;
  });
}

/**
 * Adds a member to a team.
 *
 * @example
 * ```ts
 * await addTeamMember(client, "my-org", "frontend-team", "newdev", "member");
 * ```
 */
export async function addTeamMember(
  client: GhubManagerClient,
  org: string,
  teamSlug: string,
  username: string,
  role: "member" | "maintainer" = "member",
) {
  return withErrorHandling(async () => {
    const { data } = await client.octokit.teams.addOrUpdateMembershipForUserInOrg({
      org,
      team_slug: teamSlug,
      username,
      role,
    });
    return data;
  });
}

/**
 * Removes a member from a team.
 *
 * @example
 * ```ts
 * await removeTeamMember(client, "my-org", "frontend-team", "formerdev");
 * ```
 */
export async function removeTeamMember(
  client: GhubManagerClient,
  org: string,
  teamSlug: string,
  username: string,
) {
  return withErrorHandling(async () => {
    await client.octokit.teams.removeMembershipForUserInOrg({
      org,
      team_slug: teamSlug,
      username,
    });
  });
}

/**
 * Adds a repository to a team.
 *
 * @example
 * ```ts
 * await addTeamRepo(client, "my-org", "frontend-team", "my-org/web-app", "push");
 * ```
 */
export async function addTeamRepo(
  client: GhubManagerClient,
  org: string,
  teamSlug: string,
  repoFullName: string,
  permission: "pull" | "push" | "admin" | "maintain" | "triage" = "push",
) {
  const [owner, repo] = repoFullName.split("/");
  return withErrorHandling(async () => {
    await client.octokit.teams.addOrUpdateRepoPermissionsInOrg({
      org,
      team_slug: teamSlug,
      owner,
      repo,
      permission,
    });
  });
}

/**
 * Removes a repository from a team.
 *
 * @example
 * ```ts
 * await removeTeamRepo(client, "my-org", "frontend-team", "my-org/old-app");
 * ```
 */
export async function removeTeamRepo(
  client: GhubManagerClient,
  org: string,
  teamSlug: string,
  repoFullName: string,
) {
  const [owner, repo] = repoFullName.split("/");
  return withErrorHandling(async () => {
    await client.octokit.teams.removeRepoInOrg({
      org,
      team_slug: teamSlug,
      owner,
      repo,
    });
  });
}

/**
 * Invites a user to join an organization.
 *
 * @example
 * ```ts
 * await inviteToOrg(client, {
 *   org: "my-org",
 *   email: "newdev@example.com",
 *   role: "direct_member",
 *   teamIds: [12345],
 * });
 * ```
 */
export async function inviteToOrg(client: GhubManagerClient, options: OrgInviteOptions) {
  return withErrorHandling(async () => {
    const { data } = await client.octokit.orgs.createInvitation({
      org: options.org,
      email: options.email,
      invitee_id: options.inviteeId,
      role: options.role ?? "direct_member",
      team_ids: options.teamIds,
    });
    return data;
  });
}

/**
 * Lists pending organization invitations.
 *
 * @example
 * ```ts
 * const invites = await listPendingInvitations(client, "my-org");
 * invites.forEach(i => console.log(`${i.email} - ${i.role}`));
 * ```
 */
export async function listPendingInvitations(
  client: GhubManagerClient,
  org: string,
  options?: { perPage?: number; page?: number },
) {
  return withErrorHandling(async () => {
    const { data } = await client.octokit.orgs.listPendingInvitations({
      org,
      per_page: options?.perPage ?? 30,
      page: options?.page ?? 1,
    });
    return data;
  });
}

/**
 * Checks if a user is a member of an organization.
 *
 * @example
 * ```ts
 * const isMember = await isOrgMember(client, "my-org", "someuser");
 * ```
 */
export async function isOrgMember(
  client: GhubManagerClient,
  org: string,
  username: string,
): Promise<boolean> {
  try {
    await client.octokit.orgs.checkMembershipForUser({ org, username });
    return true;
  } catch {
    return false;
  }
}
