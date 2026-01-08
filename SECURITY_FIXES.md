# Security Fixes Implementation Guide

This document provides step-by-step instructions for implementing the security fixes identified in SECURITY_AUDIT.md.

## 🔴 CRITICAL FIXES

### Fix 1: Command Injection in Git Operations

**Files to modify:**
- `src/commands/install.ts`
- `src/commands/update.ts`

**Current vulnerable code:**
```typescript
execSync(`git clone --depth 1 --quiet "${repoUrl}" "${tempDir}/repo"`, {
  stdio: 'pipe',
});
```

**Secure replacement:**
```typescript
import { spawnSync } from 'child_process';
import { validateGitUrl } from '../utils/input-validation.js';

// Validate URL before use
validateGitUrl(repoUrl);

// Use spawn with array arguments (no shell interpolation)
const result = spawnSync(
  'git',
  ['clone', '--depth', '1', '--quiet', repoUrl, join(tempDir, 'repo')],
  {
    stdio: 'pipe',
    encoding: 'utf-8',
  }
);

if (result.error) {
  throw new Error(`Git command failed: ${result.error.message}`);
}

if (result.status !== 0) {
  throw new Error(`Git clone failed: ${result.stderr || 'Unknown error'}`);
}
```

**Implementation steps:**

1. Import spawnSync and validation:
```typescript
import { spawnSync } from 'child_process';
import { validateGitUrl } from '../utils/input-validation.js';
```

2. Replace execSync calls in install.ts (line ~100):
```typescript
// Before git clone
validateGitUrl(repoUrl);

const spinner = ora('Cloning repository...').start();
try {
  const result = spawnSync(
    'git',
    ['clone', '--depth', '1', '--quiet', repoUrl, join(tempDir, 'repo')],
    {
      stdio: 'pipe',
      encoding: 'utf-8',
    }
  );

  if (result.error || result.status !== 0) {
    spinner.fail('Failed to clone repository');
    if (result.stderr) {
      console.error(chalk.dim(result.stderr.trim()));
    }
    console.error(
      chalk.yellow('\nTip: For private repos, ensure git SSH keys or credentials are configured')
    );
    process.exit(1);
  }

  spinner.succeed('Repository cloned');
} catch (error) {
  spinner.fail('Failed to clone repository');
  throw error;
}
```

3. Replace execSync in update.ts (line ~72):
```typescript
// Before git clone
validateGitUrl(metadata.source);

const result = spawnSync(
  'git',
  ['clone', '--depth', '1', '--quiet', metadata.source, tempDir],
  {
    stdio: 'pipe',
    encoding: 'utf-8',
  }
);

if (result.error || result.status !== 0) {
  throw new Error(`Git clone failed: ${result.stderr || result.error?.message}`);
}
```

4. Replace mv command in update.ts (line ~80):
```typescript
// Replace shell mv with Node.js operations
import { renameSync, cpSync, rmSync } from 'fs';

try {
  renameSync(tempDir, skill.path);
} catch (error) {
  // Handle cross-device moves
  cpSync(tempDir, skill.path, { recursive: true, dereference: true });
  rmSync(tempDir, { recursive: true, force: true });
}
```

---

### Fix 2: XML Injection in AGENTS.md

**File to modify:**
- `src/utils/agents-md.ts`

**Status:** ✅ Already fixed above
**Verification:**
```typescript
// Ensure escapeXml is imported and used:
import { escapeXml } from './input-validation.js';

const skillTags = skills.map((s) => `<skill>
<name>${escapeXml(s.name)}</name>
<description>${escapeXml(s.description)}</description>
<location>${escapeXml(s.location)}</location>
</skill>`).join('\n\n');
```

---

## 🟠 HIGH PRIORITY FIXES

### Fix 3: Predictable Temporary Directories

**Files to modify:**
- `src/commands/install.ts` (line ~94)
- `src/commands/update.ts` (line ~67)

**Install tmp package:**
```bash
npm install --save tmp
npm install --save-dev @types/tmp
```

**Secure replacement:**
```typescript
import tmp from 'tmp';

// Create cryptographically random temp directory with automatic cleanup
const tempObj = tmp.dirSync({
  prefix: 'openskills-',
  unsafeCleanup: true  // Remove even if not empty
});
const tempDir = tempObj.name;

try {
  // ... operations ...
} finally {
  // Manual cleanup (or rely on unsafeCleanup)
  tempObj.removeCallback();
}
```

**Alternative using native Node.js (no dependencies):**
```typescript
import { mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

// Cryptographically random temp directory
const tempDir = mkdtempSync(join(tmpdir(), 'openskills-'));

try {
  // ... operations ...
} finally {
  // Cleanup
  rmSync(tempDir, { recursive: true, force: true });
}
```

---

### Fix 4: Path Traversal in Skill Subpath

**File to modify:**
- `src/commands/install.ts` (line ~85)

**Status:** ✅ Validation function created in input-validation.ts

**Implementation:**
```typescript
import { validateSkillSubpath } from '../utils/input-validation.js';

// After parsing GitHub shorthand
if (parts.length > 2) {
  repoUrl = `https://github.com/${parts[0]}/${parts[1]}`;
  const rawSubpath = parts.slice(2).join('/');

  // Validate and normalize subpath
  try {
    skillSubpath = validateSkillSubpath(rawSubpath);
  } catch (error) {
    console.error(chalk.red(`Error: ${(error as Error).message}`));
    process.exit(1);
  }
}
```

---

## 🟡 MEDIUM PRIORITY FIXES

### Fix 5: RegExp Injection in YAML Parsing

**File to modify:**
- `src/utils/yaml.ts`

**Status:** ✅ Already fixed above

**Verification:**
```typescript
import { escapeRegExp } from './input-validation.js';

export function extractYamlField(content: string, field: string): string {
  const escapedField = escapeRegExp(field);
  const match = content.match(new RegExp(`^${escapedField}:\\s*(.+?)$`, 'm'));
  return match ? match[1].trim() : '';
}
```

---

## 🧪 Testing Security Fixes

### Create Security Test Suite

**File:** `tests/security/command-injection.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { validateGitUrl, validateSkillSubpath } from '../../src/utils/input-validation.js';

describe('Security: Command Injection Prevention', () => {
  describe('validateGitUrl', () => {
    it('should allow valid HTTPS URLs', () => {
      expect(() => validateGitUrl('https://github.com/user/repo')).not.toThrow();
    });

    it('should allow valid SSH URLs', () => {
      expect(() => validateGitUrl('git@github.com:user/repo.git')).not.toThrow();
    });

    it('should block URLs with shell metacharacters', () => {
      expect(() => validateGitUrl('https://evil.com/repo" && rm -rf / #')).toThrow(/command injection/);
      expect(() => validateGitUrl('https://evil.com/repo`curl evil.com`')).toThrow(/command injection/);
      expect(() => validateGitUrl('https://evil.com/repo$(whoami)')).toThrow(/command injection/);
      expect(() => validateGitUrl('https://evil.com/repo;whoami')).toThrow(/command injection/);
    });

    it('should block invalid protocols', () => {
      expect(() => validateGitUrl('file:///etc/passwd')).toThrow(/protocol/);
      expect(() => validateGitUrl('ftp://evil.com/repo')).toThrow(/protocol/);
    });
  });

  describe('validateSkillSubpath', () => {
    it('should allow valid subpaths', () => {
      expect(validateSkillSubpath('skills/pdf')).toBe('skills/pdf');
      expect(validateSkillSubpath('document-skills/pdf')).toBe('document-skills/pdf');
    });

    it('should block path traversal', () => {
      expect(() => validateSkillSubpath('../../../etc/passwd')).toThrow(/path traversal/);
      expect(() => validateSkillSubpath('skills/../../etc/passwd')).toThrow(/path traversal/);
    });

    it('should block absolute paths', () => {
      expect(() => validateSkillSubpath('/etc/passwd')).toThrow(/absolute paths/);
    });

    it('should block hidden paths', () => {
      expect(() => validateSkillSubpath('.hidden')).toThrow(/hidden paths/);
    });
  });
});
```

**File:** `tests/security/xml-injection.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { escapeXml } from '../../src/utils/input-validation.js';

describe('Security: XML Injection Prevention', () => {
  it('should escape XML special characters', () => {
    expect(escapeXml('<script>alert(1)</script>')).toBe(
      '&lt;script&gt;alert(1)&lt;/script&gt;'
    );
  });

  it('should escape ampersands', () => {
    expect(escapeXml('Tom & Jerry')).toBe('Tom &amp; Jerry');
  });

  it('should escape quotes', () => {
    expect(escapeXml('"quoted"')).toBe('&quot;quoted&quot;');
    expect(escapeXml("'quoted'")).toBe('&apos;quoted&apos;');
  });

  it('should handle malicious XML injection attempts', () => {
    const malicious = '</name><evil>injected</evil><name>';
    const escaped = escapeXml(malicious);
    expect(escaped).toBe('&lt;/name&gt;&lt;evil&gt;injected&lt;/evil&gt;&lt;name&gt;');
    expect(escaped).not.toContain('<evil>');
  });
});
```

---

## 📋 Implementation Checklist

### Week 1: Critical Fixes
- [ ] Create `src/utils/input-validation.ts` with validation functions
- [ ] Fix command injection in `src/commands/install.ts` (git clone)
- [ ] Fix command injection in `src/commands/update.ts` (git clone + mv)
- [ ] Fix XML injection in `src/utils/agents-md.ts`
- [ ] Fix RegExp injection in `src/utils/yaml.ts`
- [ ] Add security test suite (`tests/security/`)
- [ ] Run all tests and ensure they pass
- [ ] Test with malicious inputs manually

### Week 2: High Priority Fixes
- [ ] Install `tmp` package or use `mkdtempSync`
- [ ] Replace predictable temp dirs in `install.ts`
- [ ] Replace predictable temp dirs in `update.ts`
- [ ] Add path traversal validation for skill subpaths
- [ ] Update documentation with security best practices
- [ ] Add security section to README.md

### Week 3: Testing & Documentation
- [ ] Run security test suite
- [ ] Manual penetration testing
- [ ] Update SECURITY.md with reporting process
- [ ] Add security badges to README
- [ ] Prepare security release notes

### Week 4: Release
- [ ] Bump version to 1.4.0-security
- [ ] Create GitHub security advisory
- [ ] Publish npm package
- [ ] Notify users of security update
- [ ] Update documentation

---

## 🔍 Verification Steps

After implementing fixes, verify:

1. **Command Injection Test:**
```bash
# Should fail gracefully, not execute commands
openskills install 'https://evil.com/repo" && echo EXPLOITED #'
```

2. **XML Injection Test:**
Create malicious SKILL.md:
```yaml
---
name: evil</name><script>alert(1)</script><name>
description: test
---
```
Run `openskills sync` - verify XML is escaped in AGENTS.md

3. **Path Traversal Test:**
```bash
# Should fail, not access /etc/passwd
openskills install 'owner/repo/../../../etc/passwd'
```

4. **RegExp Injection Test:**
```typescript
// In tests
extractYamlField(content, 'name.*'); // Should match only 'name:', not 'nameXYZ:'
```

---

## 📊 Success Criteria

- [ ] All 90+ existing tests pass
- [ ] All new security tests pass
- [ ] Manual penetration testing shows no exploits
- [ ] Code review by security team
- [ ] No new vulnerabilities in `npm audit`
- [ ] Documentation updated
- [ ] Security advisory published

---

## 🆘 Rollback Plan

If issues arise:

1. Revert to previous version:
```bash
git revert <security-fix-commit>
npm publish --tag previous
```

2. Notify users via:
- GitHub issue
- npm deprecation warning
- Security advisory update

3. Fix issues and re-release

---

**Status:** Implementation Guide Complete
**Next Step:** Begin Week 1 critical fixes
**ETA:** 2-3 weeks for full remediation
