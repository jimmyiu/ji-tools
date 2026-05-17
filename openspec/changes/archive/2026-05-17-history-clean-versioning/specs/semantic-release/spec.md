## REMOVED Requirements

### Requirement: semantic-release MUST generate and update CHANGELOG.md

**Reason**: The `@semantic-release/changelog` plugin has been removed from `.releaserc.json`. GitHub Releases now serve as the canonical changelog, eliminating the need for a local `CHANGELOG.md` file and the associated bot commit.

**Migration**: No migration needed. The GitHub Release UI provides the same information. Any scripts or processes reading `CHANGELOG.md` locally should use the GitHub API instead.

---

### Requirement: semantic-release MUST commit version changes back to main

**Reason**: The `@semantic-release/git` plugin has been removed from `.releaserc.json`. The version bump from `@semantic-release/npm` exists only on the CI runner and is discarded when the job completes. Git tags and GitHub Releases are the sole versioning record.

**Migration**: No migration needed. The git tag (e.g. `v1.2.0`) is still created by `@semantic-release/github` pointing to the triggering commit. CI/CD workflows should reference git tags instead of `package.json` for version information.
