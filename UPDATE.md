# Updating Skills

This document explains how to keep your installed skills up-to-date with their source repositories.

## Quick Start

```bash
# Update all updateable skills (interactive selection)
openskills update

# Update all without prompting
openskills update --all --yes

# Update only selected skills (interactive)
openskills update
```

## The `openskills update` Command

The `update` command allows you to update skills that were installed from git repositories to their latest versions.

### Usage

```bash
openskills update [options]
```

### Options

| Option | Description |
|--------|-------------|
| `-a, --all` | Update all updateable skills without prompting for selection |
| `-y, --yes` | Skip confirmation prompts (fully automated) |

### How It Works

1. **Scans installed skills** - Finds all skills in project and global directories
2. **Identifies updateable skills** - Only skills installed from git repositories can be auto-updated
3. **Interactive selection** - Shows checkbox menu to select which skills to update (unless `--all`)
4. **Confirmation** - Asks for confirmation before overwriting (unless `--yes`)
5. **Updates** - Clones latest version from source and replaces local copy

### Examples

**Interactive update (recommended for manual use):**
```bash
openskills update
```

**Fully automated update (for CI/CD or scripts):**
```bash
openskills update --all --yes
```

**Update specific skills interactively:**
```bash
openskills update
# Select only the skills you want to update from the checkbox menu
```

## Metadata Tracking (Future Enhancement)

> **Note:** Full metadata tracking is planned for a future release. Currently, the `update` command works for skills with `.openskills-meta.json` files.

### Planned Features

In future versions, the install command will automatically track:
- Source repository URL
- Installation date
- Last update date
- Skill version (from SKILL.md frontmatter)

This metadata will be stored in `.openskills-meta.json` inside each skill directory.

### Example Metadata Format

```json
{
  "source": "https://github.com/anthropics/skills",
  "skillSubpath": "document-skills/pdf",
  "version": "1.0.0",
  "installedAt": "2026-01-07T10:30:00Z",
  "lastUpdated": "2026-01-07T14:45:00Z"
}
```

## Current Workaround: Manual Updates

Until automatic metadata tracking is implemented, you can update skills manually:

### Method 1: Reinstall

The simplest approach is to reinstall skills:

```bash
# Reinstall from source (will prompt to overwrite)
openskills install anthropics/skills

# Or auto-overwrite without prompting
openskills install anthropics/skills --yes
```

### Method 2: Manual Tracking

If you want to track where skills came from, create a note in your project:

**`.claude/SKILL_SOURCES.md`:**
```markdown
# Installed Skills Sources

- pdf: anthropics/skills/document-skills/pdf
- terminal-audit: anthropics/skills/coding-skills/terminal-audit
- my-custom-skill: myorg/custom-skills/my-custom-skill
```

Then update manually:
```bash
openskills remove pdf
openskills install anthropics/skills/document-skills/pdf --yes
```

### Method 3: Git Submodules (Advanced)

For version-controlled projects, use git submodules:

```bash
# Add skill as submodule
git submodule add https://github.com/anthropics/skills .claude/skills-repo

# Link specific skills
ln -s .claude/skills-repo/document-skills/pdf .claude/skills/pdf

# Update all submodules
git submodule update --remote
```

## Skill Compatibility

The update command maintains compatibility with:

- ✅ **Anthropic's SKILL.md specification**
- ✅ **All AI agents** (Claude Code, Cursor, Windsurf, Aider)
- ✅ **Project and global installations**
- ✅ **Universal `.agent/skills/` mode**

## Comparison: Manual vs Automatic

| Approach | Pros | Cons |
|----------|------|------|
| **`openskills update`** | Fast, automated, preserves metadata | Requires metadata files (future) |
| **Reinstall** | Works now, simple, reliable | Requires knowing source URLs |
| **Git submodules** | Full version control, git history | Complex setup, requires git knowledge |

## Best Practices

1. **Track your sources** - Document where each skill came from
2. **Test after updating** - Verify skills work after updates
3. **Review changes** - Check skill repositories for breaking changes
4. **Update regularly** - Keep skills current with bug fixes and improvements
5. **Backup first** - Use git to track your `.claude/skills/` if customized

## Troubleshooting

**Q: "No updateable skills found"**

A: This means no skills have `.openskills-meta.json` files. Use the manual update methods above.

**Q: Can I update local skills?**

A: No, only skills installed from git repositories can be auto-updated. Local skills should be managed manually.

**Q: Will updating overwrite my customizations?**

A: Yes! If you've modified a skill, the update will replace it. Use git or backups for custom skills.

**Q: Can I update a single skill?**

A: Yes, use the interactive mode (just `openskills update`) and select only the skill you want.

## Roadmap

Future enhancements for the update command:

- [ ] Automatic metadata tracking during install
- [ ] Version comparison (show which skills have updates)
- [ ] Changelog display before update
- [ ] Selective file updates (preserve customizations)
- [ ] Rollback to previous versions
- [ ] Update notifications

## Related Commands

- `openskills install <source>` - Install skills from source
- `openskills list` - List all installed skills
- `openskills remove <name>` - Remove a skill

## Feedback

Found an issue or have a suggestion? Open an issue at:
- Fork: [didierhk/openskills](https://github.com/didierhk/openskills/issues)
- Original: [numman-ali/openskills](https://github.com/numman-ali/openskills/issues)

---

**Last Updated:** 2026-01-07
**Addresses:** Issue #9 - [FEATURE] Document workflow/create script for updating skills
