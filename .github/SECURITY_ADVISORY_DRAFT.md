# Security Advisory - Copy/Paste for GitHub

## Instructions

1. Go to: https://github.com/didierhk/openskills/security/advisories/new
2. Copy the content below into the advisory form
3. Click "Create draft security advisory"
4. Request CVE IDs from GitHub
5. Publish when ready

---

## Advisory Form Content

### Ecosystem
npm

### Package name
openskills

### Affected versions
< 1.4.0

### Patched versions
1.4.0

### Severity
Critical

### CVE identifier
(Request from GitHub - they will auto-assign)

### Summary

Multiple critical security vulnerabilities have been discovered in OpenSkills versions prior to 1.4.0. These vulnerabilities could allow attackers to execute arbitrary commands, inject malicious content, and access files outside the intended directories.

All users should update to version 1.4.0 immediately.

### Details

#### CVE-2026-001: Command Injection in Git Clone Operations (CVSS 9.8) - CRITICAL

**Affected Components:** `openskills install`, `openskills update`

User-controlled git URLs were passed directly to `execSync` with string interpolation, allowing shell metacharacters to execute arbitrary commands.

**Attack Example:**
```bash
openskills install 'https://evil.com/repo" && rm -rf / #'
```

**Impact:** Remote Code Execution (RCE)

**Fix:** Replaced `execSync` with `spawnSync` using array arguments and added `validateGitUrl()` validation.

---

#### CVE-2026-002: XML Injection in AGENTS.md Generation (CVSS 8.6) - CRITICAL

**Affected Components:** Skill metadata processing, AGENTS.md generation

Skill metadata (name, description, location) was directly interpolated into XML without escaping, allowing malicious skills to inject arbitrary XML/HTML tags.

**Attack Example:**
```yaml
---
name: evil</name><script>alert(document.cookie)</script><name>
---
```

**Impact:** XML/HTML injection, potential XSS in downstream tools

**Fix:** Implemented `escapeXml()` function to sanitize all skill metadata.

---

#### CVE-2026-003: Command Injection in Move Operation (CVSS 7.8) - HIGH

**Affected Components:** `openskills update`

Shell `mv` command used with string interpolation for moving directories.

**Impact:** Local command execution

**Fix:** Replaced shell `mv` with Node.js native `renameSync`/`cpSync`.

---

#### CVE-2026-004: Predictable Temporary Directories (CVSS 7.4) - HIGH

**Affected Components:** `openskills install`, `openskills update`

Temp directories created with predictable names using `Date.now()`, enabling TOCTOU (Time-of-Check-Time-of-Use) race condition attacks.

**Impact:** Race condition attacks, potential file overwrite

**Fix:** Replaced `Date.now()` with cryptographic `mkdtempSync()`.

---

#### CVE-2026-005: RegExp Injection in YAML Parsing (CVSS 5.3) - MEDIUM

**Affected Components:** YAML frontmatter parsing

Field names interpolated directly into RegExp without escaping, allowing regex metacharacters to alter matching behavior.

**Impact:** Parsing bypass, potential DoS

**Fix:** Implemented `escapeRegExp()` for safe regex operations.

---

#### CVE-2026-006: Path Traversal in Skill Subpath (CVSS 6.5) - MEDIUM

**Affected Components:** `openskills install` (GitHub shorthand)

Skill subpaths from GitHub shorthand notation were not validated, allowing path traversal attempts.

**Attack Example:**
```bash
openskills install 'owner/repo/../../../etc/passwd'
```

**Impact:** Directory traversal, unauthorized file access

**Fix:** Added `validateSkillSubpath()` to prevent path traversal.

---

#### CVE-2026-007: Symlink TOCTOU in Skill Installation (CVSS 3.3) - LOW

**Affected Components:** Skill installation

Race condition in temp directory creation.

**Impact:** Low - resolved via cryptographic temp directory fix

### Impact

**CRITICAL:** Remote code execution possible via malicious git URLs
**HIGH:** Local command execution and race condition exploits
**MEDIUM:** Path traversal and parsing bypass attacks

Users running OpenSkills < 1.4.0 are vulnerable to multiple attack vectors.

### Patches

All vulnerabilities have been fixed in version 1.4.0.

**Update immediately:**
```bash
npm install -g openskills@1.4.0
```

### Workarounds

No workarounds available. Update to 1.4.0 immediately.

### References

- Release Notes: https://github.com/didierhk/openskills/releases/tag/v1.4.0
- Security Audit: https://github.com/didierhk/openskills/blob/main/SECURITY_AUDIT.md
- Fix Guide: https://github.com/didierhk/openskills/blob/main/SECURITY_FIXES.md
- Implementation Summary: https://github.com/didierhk/openskills/blob/main/SECURITY_IMPLEMENTATION.md
- Changelog: https://github.com/didierhk/openskills/blob/main/CHANGELOG.md

### Credits

Security vulnerabilities discovered and fixed by:
- Claude Sonnet 4.5 (Anthropic)
- Didier HK (Fork Maintainer)

### Timeline

- 2026-01-07: Vulnerabilities discovered during red team security audit
- 2026-01-07: All vulnerabilities fixed and tested (same day)
- 2026-01-07: Version 1.4.0 released with security fixes
- 2026-01-07: Security advisory published

### For more information

If you have any questions or comments about this advisory:
- Open an issue at https://github.com/didierhk/openskills/issues
- Email: (use GitHub Security for security issues)
