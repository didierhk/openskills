import { describe, it, expect } from 'vitest';
import {
  validateGitUrl,
  escapeRegExp,
  escapeXml,
  validateSkillSubpath,
} from '../../src/utils/input-validation.js';

describe('Security: Input Validation', () => {
  describe('validateGitUrl', () => {
    describe('Valid URLs', () => {
      it('should allow valid HTTPS URLs', () => {
        expect(() => validateGitUrl('https://github.com/user/repo')).not.toThrow();
        expect(() => validateGitUrl('https://github.com/user/repo.git')).not.toThrow();
        expect(() => validateGitUrl('https://gitlab.com/group/project')).not.toThrow();
      });

      it('should allow valid HTTP URLs', () => {
        expect(() => validateGitUrl('http://github.com/user/repo')).not.toThrow();
      });

      it('should allow valid git:// URLs', () => {
        expect(() => validateGitUrl('git://github.com/user/repo.git')).not.toThrow();
      });

      it('should allow valid SSH URLs', () => {
        expect(() => validateGitUrl('git@github.com:user/repo.git')).not.toThrow();
        expect(() => validateGitUrl('git@gitlab.com:group/project.git')).not.toThrow();
      });
    });

    describe('Command Injection Prevention', () => {
      it('should block URLs with backticks', () => {
        expect(() => validateGitUrl('https://evil.com/repo`whoami`')).toThrow(/command injection/);
      });

      it('should block URLs with command substitution', () => {
        expect(() => validateGitUrl('https://evil.com/repo$(whoami)')).toThrow(/command injection/);
        expect(() => validateGitUrl('https://evil.com/repo${USER}')).toThrow(/command injection/);
      });

      it('should block URLs with shell operators', () => {
        expect(() => validateGitUrl('https://evil.com/repo" && rm -rf / #')).toThrow(
          /command injection/
        );
        expect(() => validateGitUrl('https://evil.com/repo;whoami')).toThrow(/command injection/);
        expect(() => validateGitUrl('https://evil.com/repo|whoami')).toThrow(/command injection/);
        expect(() => validateGitUrl('https://evil.com/repo>file')).toThrow(/command injection/);
        expect(() => validateGitUrl('https://evil.com/repo<file')).toThrow(/command injection/);
      });

      it('should block URLs with parentheses and braces', () => {
        expect(() => validateGitUrl('https://evil.com/repo()')).toThrow(/command injection/);
        expect(() => validateGitUrl('https://evil.com/repo{}')).toThrow(/command injection/);
      });

      it('should block URLs with backslashes', () => {
        expect(() => validateGitUrl('https://evil.com/repo\\n')).toThrow(/command injection/);
      });
    });

    describe('Protocol Validation', () => {
      it('should block invalid protocols', () => {
        expect(() => validateGitUrl('file:///etc/passwd')).toThrow(/protocol/);
        expect(() => validateGitUrl('ftp://evil.com/repo')).toThrow(/protocol/);
        expect(() => validateGitUrl('data:text/html,<script>alert(1)</script>')).toThrow(
          /protocol/
        );
      });
    });

    describe('Malformed URLs', () => {
      it('should reject invalid SSH format', () => {
        expect(() => validateGitUrl('git@github.com repo.git')).toThrow(/Invalid SSH/);
        expect(() => validateGitUrl('git@')).toThrow(/Invalid SSH/);
      });

      it('should reject completely invalid URLs', () => {
        expect(() => validateGitUrl('not-a-url')).toThrow(); // URL constructor throws TypeError
        expect(() => validateGitUrl('://missing-protocol')).toThrow();
      });
    });
  });

  describe('escapeRegExp', () => {
    it('should escape regex metacharacters', () => {
      expect(escapeRegExp('test.file')).toBe('test\\.file');
      expect(escapeRegExp('test*')).toBe('test\\*');
      expect(escapeRegExp('test+')).toBe('test\\+');
      expect(escapeRegExp('test?')).toBe('test\\?');
      expect(escapeRegExp('test^')).toBe('test\\^');
      expect(escapeRegExp('test$')).toBe('test\\$');
    });

    it('should escape brackets and braces', () => {
      expect(escapeRegExp('test[0-9]')).toBe('test\\[0-9\\]');
      expect(escapeRegExp('test{1,3}')).toBe('test\\{1,3\\}');
      expect(escapeRegExp('test(group)')).toBe('test\\(group\\)');
    });

    it('should escape pipes and backslashes', () => {
      expect(escapeRegExp('test|other')).toBe('test\\|other');
      expect(escapeRegExp('test\\path')).toBe('test\\\\path');
    });

    it('should handle complex patterns', () => {
      const complex = 'name.*|description.+';
      const escaped = escapeRegExp(complex);
      expect(escaped).toBe('name\\.\\*\\|description\\.\\+');
      // Verify it matches literally
      expect('name.*|description.+').toMatch(new RegExp(escaped));
      expect('nameXYZ|descriptionABC').not.toMatch(new RegExp(escaped));
    });
  });

  describe('escapeXml', () => {
    it('should escape ampersands', () => {
      expect(escapeXml('Tom & Jerry')).toBe('Tom &amp; Jerry');
      expect(escapeXml('&&&')).toBe('&amp;&amp;&amp;');
    });

    it('should escape angle brackets', () => {
      expect(escapeXml('<script>')).toBe('&lt;script&gt;');
      expect(escapeXml('<div>content</div>')).toBe('&lt;div&gt;content&lt;/div&gt;');
    });

    it('should escape quotes', () => {
      expect(escapeXml('"quoted"')).toBe('&quot;quoted&quot;');
      expect(escapeXml("'quoted'")).toBe('&apos;quoted&apos;');
    });

    it('should handle XML injection attempts', () => {
      const injection = '</name><evil>injected</evil><name>';
      const escaped = escapeXml(injection);
      expect(escaped).toBe('&lt;/name&gt;&lt;evil&gt;injected&lt;/evil&gt;&lt;name&gt;');
      expect(escaped).not.toContain('<evil>');
      expect(escaped).not.toContain('</name>');
    });

    it('should handle complex malicious payloads', () => {
      const payload = '<script>alert(document.cookie)</script>';
      const escaped = escapeXml(payload);
      expect(escaped).toBe('&lt;script&gt;alert(document.cookie)&lt;/script&gt;');
      expect(escaped).not.toContain('<script>');
    });

    it('should escape all special characters together', () => {
      const complex = '& < > " \'';
      expect(escapeXml(complex)).toBe('&amp; &lt; &gt; &quot; &apos;');
    });
  });

  describe('validateSkillSubpath', () => {
    describe('Valid Subpaths', () => {
      it('should allow simple paths', () => {
        expect(validateSkillSubpath('skills/pdf')).toBe('skills/pdf');
        expect(validateSkillSubpath('document-skills/pdf')).toBe('document-skills/pdf');
        expect(validateSkillSubpath('coding_skills/terminal')).toBe('coding_skills/terminal');
      });

      it('should normalize multiple slashes', () => {
        expect(validateSkillSubpath('skills//pdf')).toBe('skills/pdf');
        expect(validateSkillSubpath('skills///pdf')).toBe('skills/pdf');
      });

      it('should allow paths with dots in filenames', () => {
        expect(validateSkillSubpath('skills/my.skill')).toBe('skills/my.skill');
        expect(validateSkillSubpath('skills/v1.2.3')).toBe('skills/v1.2.3');
      });
    });

    describe('Path Traversal Prevention', () => {
      it('should block parent directory references', () => {
        expect(() => validateSkillSubpath('../etc/passwd')).toThrow(/path traversal/);
        expect(() => validateSkillSubpath('skills/../../../etc/passwd')).toThrow(/path traversal/);
        expect(() => validateSkillSubpath('skills/../../other')).toThrow(/path traversal/);
      });

      it('should block current directory references in unsafe positions', () => {
        expect(() => validateSkillSubpath('./skills')).toThrow(/hidden paths/);
        expect(() => validateSkillSubpath('.hidden/skill')).toThrow(/hidden paths/);
      });

      it('should block absolute paths', () => {
        expect(() => validateSkillSubpath('/etc/passwd')).toThrow(/absolute paths/);
        expect(() => validateSkillSubpath('/usr/bin/whoami')).toThrow(/absolute paths/);
      });
    });

    describe('Invalid Characters', () => {
      it('should block null bytes', () => {
        expect(() => validateSkillSubpath('skills\0/evil')).toThrow(/invalid characters/);
      });

      it('should block special shell characters', () => {
        expect(() => validateSkillSubpath('skills;rm -rf /')).toThrow(/invalid characters/);
        expect(() => validateSkillSubpath('skills|whoami')).toThrow(/invalid characters/);
        expect(() => validateSkillSubpath('skills&evil')).toThrow(/invalid characters/);
      });

      it('should block backticks and dollar signs', () => {
        expect(() => validateSkillSubpath('skills`whoami`')).toThrow(/invalid characters/);
        expect(() => validateSkillSubpath('skills$(whoami)')).toThrow(/invalid characters/);
      });
    });

    describe('Edge Cases', () => {
      it('should handle empty string', () => {
        expect(validateSkillSubpath('')).toBe('');
      });

      it('should strip leading/trailing slashes', () => {
        expect(validateSkillSubpath('skills/pdf/')).toBe('skills/pdf');
      });

      it('should allow deeply nested paths', () => {
        expect(validateSkillSubpath('a/b/c/d/e/f/skill')).toBe('a/b/c/d/e/f/skill');
      });
    });
  });
});
