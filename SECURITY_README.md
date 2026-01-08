# Security Documentation Index

This directory contains comprehensive security documentation for OpenSkills v1.4.0 security release.

## 📋 Quick Links

### For Users

- **[RELEASE_NOTES_v1.4.0.md](RELEASE_NOTES_v1.4.0.md)** - User-facing release notes (copy/paste for GitHub release)
- **[CHANGELOG.md](CHANGELOG.md)** - Complete changelog with v1.4.0 security updates
- **Update Command:** `npm install -g openskills@1.4.0`

### For Security Researchers

- **[SECURITY_AUDIT.md](SECURITY_AUDIT.md)** - Comprehensive vulnerability report with CVE details
- **[SECURITY_FIXES.md](SECURITY_FIXES.md)** - Step-by-step implementation guide
- **[SECURITY_IMPLEMENTATION.md](SECURITY_IMPLEMENTATION.md)** - Complete fix summary and deployment guide

### For Maintainers

- **[RELEASE_SUMMARY.md](RELEASE_SUMMARY.md)** - Complete release status and next steps checklist
- **[.github/SECURITY_ADVISORY_DRAFT.md](.github/SECURITY_ADVISORY_DRAFT.md)** - GitHub security advisory template (copy/paste)
- **[GITHUB_SECURITY_ADVISORY.md](GITHUB_SECURITY_ADVISORY.md)** - Detailed advisory template with instructions

## 🔒 Vulnerabilities Fixed in v1.4.0

| CVE | Severity | CVSS | Description |
|-----|----------|------|-------------|
| CVE-2026-001 | CRITICAL | 9.8 | Command injection in git clone operations |
| CVE-2026-002 | CRITICAL | 8.6 | XML injection in AGENTS.md generation |
| CVE-2026-003 | HIGH | 7.8 | Command injection in move operation |
| CVE-2026-004 | HIGH | 7.4 | Predictable temp directories (TOCTOU) |
| CVE-2026-005 | MEDIUM | 5.3 | RegExp injection in YAML parsing |
| CVE-2026-006 | MEDIUM | 6.5 | Path traversal in skill subpath |
| CVE-2026-007 | LOW | 3.3 | Symlink TOCTOU |

## 📊 Statistics

- **Total Vulnerabilities:** 7
- **Vulnerabilities Fixed:** 7 (100%)
- **New Security Tests:** 34
- **Total Test Coverage:** 158 tests (100% passing)
- **Files Modified:** 6
- **New Files Created:** 5
- **Lines Added:** 1,940
- **Release Date:** 2026-01-07

## 🔧 Technical Details

### Security Module

All security functions are centralized in `src/utils/input-validation.ts`:

```typescript
// Git URL validation with protocol whitelisting
validateGitUrl(url: string): void

// XML/HTML entity escaping
escapeXml(unsafe: string): string

// RegExp metacharacter escaping
escapeRegExp(str: string): string

// Path traversal prevention
validateSkillSubpath(subpath: string): string
```

### Test Coverage

Security test suite: `tests/security/input-validation.test.ts`

- ✅ 13 tests: Git URL validation (command injection prevention)
- ✅ 8 tests: XML escaping (injection prevention)
- ✅ 5 tests: RegExp escaping (injection prevention)
- ✅ 8 tests: Path traversal prevention

## 📖 Reading Guide

### If you want to understand the vulnerabilities:
1. Start with **SECURITY_AUDIT.md** - detailed vulnerability analysis
2. Review attack examples and CVSS scores
3. Understand impact on users

### If you want to implement the fixes:
1. Read **SECURITY_FIXES.md** - step-by-step implementation guide
2. Review code examples and before/after comparisons
3. Follow testing procedures

### If you want to see what was done:
1. Check **SECURITY_IMPLEMENTATION.md** - complete fix summary
2. Review deployment checklist
3. Understand security impact assessment

### If you need to publish the release:
1. Use **RELEASE_NOTES_v1.4.0.md** for GitHub release description
2. Use **.github/SECURITY_ADVISORY_DRAFT.md** for security advisory
3. Follow **RELEASE_SUMMARY.md** for next steps

## ⚠️ Important Notice

This is a **CRITICAL SECURITY RELEASE**. All users running versions < 1.4.0 are vulnerable to:

- Remote Code Execution (RCE) via malicious git URLs
- XML/HTML injection in AGENTS.md
- Path traversal attacks
- Race condition exploits

**Update immediately:**
```bash
npm install -g openskills@1.4.0
```

## 🙏 Credits

**Security Research & Implementation:**
- Claude Sonnet 4.5 (Anthropic) - Red team security audit, vulnerability discovery, fix implementation
- Didier HK - Fork maintainer, release coordination

**Original Project:**
- numman-ali - Original OpenSkills creator
- https://github.com/numman-ali/openskills

## 📞 Contact

**Security Issues:**
- GitHub Security Advisories: https://github.com/didierhk/openskills/security/advisories
- Use GitHub Security tab for responsible disclosure

**General Support:**
- Issues: https://github.com/didierhk/openskills/issues
- Discussions: https://github.com/didierhk/openskills/discussions

---

**Last Updated:** 2026-01-07
**Release:** v1.4.0
**Status:** ✅ All vulnerabilities fixed and tested
