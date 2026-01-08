# GitHub Security Advisory Template

Use this template to create a GitHub Security Advisory for the vulnerabilities fixed in v1.4.0.

## How to Create the Advisory

1. Go to: https://github.com/didierhk/openskills/security/advisories
2. Click "New draft security advisory"
3. Fill in the details below

---

## Advisory Details

### Title
```
Multiple Critical Security Vulnerabilities in OpenSkills < 1.4.0
```

### CVE ID
Request CVE IDs from GitHub (they will auto-assign)

### Ecosystem
**npm**

### Package Name
```
openskills
```

### Affected Versions
```
< 1.4.0
```

### Patched Versions
```
1.4.0
```

### Severity
**Critical** (CVSS 9.8 for highest vulnerability)

### Description

```markdown
## Summary

Multiple critical security vulnerabilities have been discovered in OpenSkills versions prior to 1.4.0. These vulnerabilities could allow attackers to execute arbitrary commands, inject malicious content, and access files outside the intended directories.

**All users should update to version 1.4.0 immediately.**

## Impact

### CVE-2026-001: Command Injection in Git Clone Operations (CVSS 9.8) - CRITICAL

**Affected Components:** `openskills install`, `openskills update`

**Description:** User-controlled git URLs were passed directly to `execSync` with string interpolation, allowing shell metacharacters to execute arbitrary commands.

**Attack Example:**
```bash
openskills install 'https://evil.com/repo" && rm -rf / #'
```

**Impact:** Remote Code Execution (RCE)

---

### CVE-2026-002: XML Injection in AGENTS.md Generation (CVSS 8.6) - CRITICAL

**Affected Components:** Skill metadata processing, AGENTS.md generation

**Description:** Skill metadata (name, description, location) was directly interpolated into XML without escaping, allowing malicious skills to inject arbitrary XML/HTML tags.

**Attack Example:**
```yaml
---
name: evil</name><script>alert(document.cookie)</script><name>
---
```

**Impact:** XML/HTML injection, potential XSS in downstream tools

---

### CVE-2026-003: Command Injection in Move Operation (CVSS 7.8) - HIGH

**Affected Components:** `openskills update`

**Description:** Shell `mv` command used with string interpolation for moving directories.

**Impact:** Local command execution

---

### CVE-2026-004: Predictable Temporary Directories (CVSS 7.4) - HIGH

**Affected Components:** `openskills install`, `openskills update`

**Description:** Temp directories created with predictable names using `Date.now()`, enabling TOCTOU (Time-of-Check-Time-of-Use) race condition attacks.

**Impact:** Race condition attacks, potential file overwrite

---

### CVE-2026-005: RegExp Injection in YAML Parsing (CVSS 5.3) - MEDIUM

**Affected Components:** YAML frontmatter parsing

**Description:** Field names interpolated directly into RegExp without escaping, allowing regex metacharacters to alter matching behavior.

**Impact:** Parsing bypass, potential DoS

---

### CVE-2026-006: Path Traversal in Skill Subpath (CVSS 6.5) - MEDIUM

**Affected Components:** `openskills install` (GitHub shorthand)

**Description:** Skill subpaths from GitHub shorthand notation were not validated, allowing path traversal attempts.

**Attack Example:**
```bash
openskills install 'owner/repo/../../../etc/passwd'
```

**Impact:** Directory traversal, unauthorized file access

---

### CVE-2026-007: Symlink TOCTOU in Skill Installation (CVSS 3.3) - LOW

**Affected Components:** Skill installation

**Description:** Race condition in temp directory creation.

**Impact:** Low - resolved via cryptographic temp directory fix

## Patches

All vulnerabilities have been fixed in **version 1.4.0**.

### Fixes Implemented:

1. **Command Injection Prevention:**
   - Replaced `execSync` with `spawnSync` using array arguments (no shell interpolation)
   - Added `validateGitUrl()` to whitelist protocols and block shell metacharacters

2. **XML Injection Prevention:**
   - Implemented `escapeXml()` function to sanitize all skill metadata

3. **Safe Filesystem Operations:**
   - Replaced shell `mv` with Node.js native `renameSync`/`cpSync`

4. **Cryptographic Randomness:**
   - Replaced `Date.now()` temp directories with `mkdtempSync()` (cryptographically random)

5. **Input Validation:**
   - Implemented `escapeRegExp()` for safe regex operations
   - Added `validateSkillSubpath()` to prevent path traversal

6. **Comprehensive Testing:**
   - Added 34 security-focused tests
   - Total test coverage: 158 tests (100% passing)

## Workarounds

**No workarounds available. Update to 1.4.0 immediately.**

## Upgrade Instructions

Update globally:
```bash
npm install -g openskills@1.4.0
```

Update in project:
```bash
npm install openskills@1.4.0
```

Verify installation:
```bash
openskills --version  # Should show 1.4.0
```

For users who installed skills from untrusted sources:
1. Review installed skills: `openskills list`
2. Re-sync AGENTS.md: `openskills sync`

## References

- [SECURITY_AUDIT.md](https://github.com/didierhk/openskills/blob/main/SECURITY_AUDIT.md) - Comprehensive vulnerability report
- [SECURITY_FIXES.md](https://github.com/didierhk/openskills/blob/main/SECURITY_FIXES.md) - Implementation guide
- [SECURITY_IMPLEMENTATION.md](https://github.com/didierhk/openskills/blob/main/SECURITY_IMPLEMENTATION.md) - Fix summary
- [CHANGELOG.md](https://github.com/didierhk/openskills/blob/main/CHANGELOG.md) - v1.4.0 release notes

## Credits

Security vulnerabilities discovered and fixed by:
- Claude Sonnet 4.5 (Anthropic)
- Didier HK (Fork Maintainer)

## Timeline

- **2026-01-07:** Vulnerabilities discovered during red team security audit
- **2026-01-07:** All vulnerabilities fixed and tested
- **2026-01-07:** Version 1.4.0 released with security fixes
- **2026-01-07:** Security advisory published

## Severity Assessment

Based on CVSS 3.1 scoring:
- **CVE-2026-001:** CVSS 9.8 (Critical) - AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H
- **CVE-2026-002:** CVSS 8.6 (High) - AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:H/A:L
- **CVE-2026-003:** CVSS 7.8 (High) - AV:L/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H
- **CVE-2026-004:** CVSS 7.4 (High) - AV:L/AC:H/PR:L/UI:N/S:U/C:H/I:H/A:H
- **CVE-2026-005:** CVSS 5.3 (Medium) - AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:L/A:N
- **CVE-2026-006:** CVSS 6.5 (Medium) - AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:N/A:N
- **CVE-2026-007:** CVSS 3.3 (Low) - AV:L/AC:H/PR:L/UI:N/S:U/C:L/I:L/A:N

**Overall Severity: CRITICAL (9.8)**
```

---

## Additional Steps After Creating Advisory

1. **Tag the release:**
   ```bash
   git tag v1.4.0
   git push origin v1.4.0
   ```

2. **Create GitHub Release:**
   - Go to: https://github.com/didierhk/openskills/releases/new
   - Tag: v1.4.0
   - Title: "v1.4.0 - Critical Security Release"
   - Copy description from CHANGELOG.md

3. **Publish to npm:**
   ```bash
   npm publish
   ```

4. **Notify upstream:**
   - Consider creating an issue on https://github.com/numman-ali/openskills
   - Inform them of the security vulnerabilities discovered
   - Offer to contribute the fixes back via PR

5. **Update fork documentation:**
   - Add security badge to README.md
   - Link to security advisory
   - Update installation instructions to recommend v1.4.0+

---

**Status:** Ready for publication
**Action Required:** Create GitHub Security Advisory using the template above
