# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.4] - 2025-01-15

### Fixed
- Fixed rate limit error handling when `x-ratelimit-remaining` header is missing
- Improved pagination for repos with large numbers of branches

## [1.2.3] - 2025-01-08

### Fixed
- Fixed `transferRepo` not passing `team_ids` correctly
- Fixed TypeScript strict mode issues with optional webhook config fields

## [1.2.2] - 2024-12-20

### Added
- Added `isCollaborator` helper function for repos module
- Added `isPullRequestMerged` helper function for pulls module

### Fixed
- Fixed `bulkUpdateLabels` not removing labels correctly when label doesn't exist on issue

## [1.2.1] - 2024-12-10

### Fixed
- Fixed ESM exports not resolving correctly in some bundlers
- Fixed `parseRepoString` not handling URLs with trailing slashes

## [1.2.0] - 2024-11-28

### Added
- Added `compareBranches` for branch diff comparison
- Added `generateReleaseNotes` for auto-generating release content
- Added `updatePullRequestBranch` for keeping PR branches up to date
- Added `getLanguages` for repository language breakdown
- Added `listPullRequestReviews` for listing PR reviews
- Added `publishRelease` convenience method for publishing draft releases

### Changed
- Improved error messages in `GhubValidationError` to include field-level details
- `batchOperation` now preserves order of results

## [1.1.0] - 2024-11-15

### Added
- Added organization management module (`orgs`)
  - Team CRUD operations
  - Member management
  - Organization invitations
  - Team repository management
- Added `retry` utility with exponential backoff
- Added `validateToken` for checking token scopes
- Added bulk operations for issues (`bulkCloseIssues`, `bulkUpdateLabels`)

### Changed
- Upgraded to `@octokit/rest` v20
- Improved TypeScript strict mode compatibility

## [1.0.0] - 2024-10-20

### Added
- Initial stable release
- Repository management (create, update, delete, fork, transfer, archive)
- Branch management (create, delete, rename, merge, protection rules)
- Issue management (CRUD, comments, labels, assignments, lock/unlock)
- Pull request management (create, update, merge, reviews, file listing)
- Release management (create, update, delete, assets, latest release)
- Collaborator management (add, remove, list, check)
- Webhook management (create, list, delete)
- Utility functions (pagination, batch operations, repo string parsing)
- Typed error classes (auth, rate limit, not found, validation)
- Tree-shakeable exports for all modules
- Full TypeScript support with strict mode
- Comprehensive documentation and examples
