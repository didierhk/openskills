# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.0] - 2026-01-07

### Security

⚠️ **CRITICAL SECURITY UPDATE** - This release fixes 7 security vulnerabilities (2 CRITICAL, 2 HIGH, 2 MEDIUM, 1 LOW). All users should update immediately.

#### CRITICAL Fixes

- **CVE-2026-001: Command Injection in Git Clone Operations** (CVSS 9.8)
  - Fixed command injection vulnerability in `openskills install` and `openskills update`
  - Replaced `execSync` with `spawnSync` using array arguments (no shell interpolation)
  - Added `validateGitUrl()` to whitelist protocols and block shell metacharacters
  - Attackers could previously execute arbitrary commands via malicious git URLs

- **CVE-2026-002: XML Injection in AGENTS.md Generation** (CVSS 8.6)
  - Fixed XML injection vulnerability in skill metadata processing
  - Implemented `escapeXml()` function to sanitize all skill names, descriptions, and locations
  - Malicious skills could previously inject arbitrary XML/HTML into AGENTS.md

#### HIGH Priority Fixes

- **CVE-2026-003: Command Injection in Move Operation** (CVSS 7.8)
  - Replaced shell `mv` command with Node.js native `renameSync`/`cpSync` operations
  - Eliminates shell execution for filesystem operations in `openskills update`

- **CVE-2026-004: Predictable Temporary Directories (TOCTOU)** (CVSS 7.4)
  - Replaced `Date.now()` temp directories with cryptographically random `mkdtempSync()`
  - Prevents Time-of-Check-Time-of-Use (TOCTOU) race condition attacks
  - Uses OS temp directory with proper permissions and atomic creation

#### MEDIUM Priority Fixes

- **CVE-2026-005: RegExp Injection in YAML Parsing** (CVSS 5.3)
  - Implemented `escapeRegExp()` to sanitize field names before regex matching
  - Prevents regex metacharacters from altering YAML parsing behavior

- **CVE-2026-006: Path Traversal in Skill Subpath** (CVSS 6.5)
  - Added `validateSkillSubpath()` to prevent directory traversal attacks
  - Blocks `..`, absolute paths, hidden paths, and invalid characters
  - Validates GitHub shorthand subpaths (e.g., `owner/repo/path/to/skill`)

#### LOW Priority Fixes

- **CVE-2026-007: Symlink TOCTOU in Skill Installation** (CVSS 3.3)
  - Resolved via cryptographic temp directory fix (CVE-2026-004)

### Added

- **Security validation module** (`src/utils/input-validation.ts`)
  - `validateGitUrl()` - Git URL validation with protocol whitelisting
  - `escapeXml()` - XML/HTML entity escaping
  - `escapeRegExp()` - RegExp metacharacter escaping
  - `validateSkillSubpath()` - Path traversal prevention

- **Comprehensive security test suite** (34 new tests)
  - 13 tests for git URL validation (command injection prevention)
  - 8 tests for XML escaping (injection prevention)
  - 5 tests for RegExp escaping (injection prevention)
  - 8 tests for path traversal prevention

- **Security documentation**
  - `SECURITY_AUDIT.md` - Comprehensive vulnerability report
  - `SECURITY_FIXES.md` - Implementation guide
  - `SECURITY_IMPLEMENTATION.md` - Fix summary and deployment guide

### Changed

- **Git operations now use safe APIs**
  - `git clone` via `spawnSync` with array arguments (no shell)
  - All git URLs validated before use
  - Error handling improved with proper stderr output

- **Filesystem operations use Node.js native APIs**
  - Replaced shell `mv` with `renameSync`/`cpSync`
  - Cross-device move support via fallback to copy+remove
  - Proper cleanup on errors

- **Temp directory creation**
  - Now uses cryptographically random names via `mkdtempSync()`
  - Uses OS temp directory (`os.tmpdir()`) instead of home directory
  - Atomic creation eliminates race conditions

- **Input validation applied throughout**
  - All user-controlled input validated before use
  - All interpolated content properly escaped (XML, RegExp)
  - Path traversal protection on skill subpaths

### Testing

- **Total tests: 158** (previously 124)
  - +34 new security tests
  - 100% passing
  - All builds and lints passing (0 errors, 0 warnings)

### Migration Notes

No breaking changes. Update is seamless:

```bash
npm install -g openskills@1.4.0
```

For users who installed skills from untrusted sources:
1. Review installed skills: `openskills list`
2. Re-sync AGENTS.md after update: `openskills sync`

## [1.3.0] - 2025-12-14

### Added

- **Symlink support** - Skills can now be symlinked into the skills directory ([#3](https://github.com/numman-ali/openskills/issues/3))
  - Enables git-based skill updates by symlinking from a cloned repo
  - Supports local skill development workflows
  - Broken symlinks are gracefully skipped

- **Configurable output path** - New `--output` / `-o` flag for sync command ([#5](https://github.com/numman-ali/openskills/issues/5))
  - Sync to any `.md` file (e.g., `.ruler/AGENTS.md`)
  - Auto-creates file with heading if it doesn't exist
  - Auto-creates nested directories if needed

- **Local path installation** - Install skills from local directories ([#10](https://github.com/numman-ali/openskills/issues/10))
  - Supports absolute paths (`/path/to/skill`)
  - Supports relative paths (`./skill`, `../skill`)
  - Supports tilde expansion (`~/my-skills/skill`)

- **Private git repo support** - Install from private repositories ([#10](https://github.com/numman-ali/openskills/issues/10))
  - SSH URLs (`git@github.com:org/private-skills.git`)
  - HTTPS with authentication
  - Uses system SSH keys automatically

- **Comprehensive test suite** - 88 tests across 6 test files
  - Unit tests for symlink detection, YAML parsing
  - Integration tests for install, sync commands
  - E2E tests for full CLI workflows

### Changed

- **`--yes` flag now skips all prompts** - Fully non-interactive mode for CI/CD ([#6](https://github.com/numman-ali/openskills/issues/6))
  - Overwrites existing skills without prompting
  - Shows `Overwriting: <skill-name>` message when skipping prompt
  - All commands now work in headless environments

- **CI workflow reordered** - Build step now runs before tests
  - Ensures `dist/cli.js` exists for E2E tests

### Security

- **Path traversal protection** - Validates installation paths stay within target directory
- **Symlink dereference** - `cpSync` uses `dereference: true` to safely copy symlink targets
- **Non-greedy YAML regex** - Prevents potential ReDoS in frontmatter parsing

## [1.2.1] - 2025-10-27

### Fixed

- README documentation cleanup - removed duplicate sections and incorrect flags

## [1.2.0] - 2025-10-27

### Added

- `--universal` flag to install skills to `.agent/skills/` instead of `.claude/skills/`
  - For multi-agent setups (Claude Code + Cursor/Windsurf/Aider)
  - Avoids conflicts with Claude Code's native marketplace plugins

### Changed

- Project install is now the default (was global)
- Skills install to `./.claude/skills/` by default

## [1.1.0] - 2025-10-27

### Added

- Comprehensive single-page README with technical deep dive
- Side-by-side comparison with Claude Code

### Fixed

- Location tag now correctly shows `project` or `global` based on install location

## [1.0.0] - 2025-10-26

### Added

- Initial release
- `openskills install <source>` - Install skills from GitHub repos
- `openskills sync` - Generate `<available_skills>` XML for AGENTS.md
- `openskills list` - Show installed skills
- `openskills read <name>` - Load skill content for agents
- `openskills manage` - Interactive skill removal
- `openskills remove <name>` - Remove specific skill
- Interactive TUI for all commands
- Support for Anthropic's SKILL.md format
- Progressive disclosure (load skills on demand)
- Bundled resources support (references/, scripts/, assets/)

[1.4.0]: https://github.com/didierhk/openskills/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/numman-ali/openskills/compare/v1.2.1...v1.3.0
[1.2.1]: https://github.com/numman-ali/openskills/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/numman-ali/openskills/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/numman-ali/openskills/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/numman-ali/openskills/releases/tag/v1.0.0
