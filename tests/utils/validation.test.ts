import { describe, it, expect } from 'vitest';
import { resolve } from 'path';
import {
  validatePathSecurity,
  validateSkillName,
  sanitizeSkillName,
  validateSkillFrontmatter,
  validateInstallSource,
} from '../../src/utils/validation.js';

describe('validation utilities', () => {
  describe('validatePathSecurity', () => {
    it('should allow paths within target directory', () => {
      expect(validatePathSecurity('/home/user/skills/my-skill', '/home/user/skills')).toBe(true);
    });

    it('should block path traversal with ../', () => {
      expect(
        validatePathSecurity('/home/user/skills/../../../etc/passwd', '/home/user/skills')
      ).toBe(false);
    });

    it('should block paths outside target directory', () => {
      expect(validatePathSecurity('/etc/passwd', '/home/user/skills')).toBe(false);
    });

    it('should block paths that are prefix but not subdirectory', () => {
      // /home/user/skills-evil should NOT be allowed when target is /home/user/skills
      expect(validatePathSecurity('/home/user/skills-evil', '/home/user/skills')).toBe(false);
    });

    it('should allow nested subdirectories', () => {
      expect(
        validatePathSecurity('/home/user/skills/category/my-skill', '/home/user/skills')
      ).toBe(true);
    });

    it('should handle relative paths correctly', () => {
      const targetDir = resolve('/home/user/skills');
      const targetPath = resolve('/home/user/skills/my-skill');
      expect(validatePathSecurity(targetPath, targetDir)).toBe(true);
    });
  });

  describe('validateSkillName', () => {
    it('should accept valid skill names', () => {
      expect(validateSkillName('my-skill')).toBe(true);
      expect(validateSkillName('pdf')).toBe(true);
      expect(validateSkillName('my-skill-123')).toBe(true);
    });

    it('should reject path traversal attempts', () => {
      expect(validateSkillName('../etc/passwd')).toBe(false);
      expect(validateSkillName('skill/../other')).toBe(false);
      expect(validateSkillName('..skill')).toBe(false);
    });

    it('should reject paths with slashes', () => {
      expect(validateSkillName('path/to/skill')).toBe(false);
      expect(validateSkillName('skill\\name')).toBe(false);
    });

    it('should reject hidden files', () => {
      expect(validateSkillName('.hidden')).toBe(false);
      expect(validateSkillName('.ssh')).toBe(false);
    });

    it('should reject empty names', () => {
      expect(validateSkillName('')).toBe(false);
    });

    it('should reject names that are too long', () => {
      const longName = 'a'.repeat(101);
      expect(validateSkillName(longName)).toBe(false);
    });
  });

  describe('sanitizeSkillName', () => {
    it('should convert to lowercase', () => {
      expect(sanitizeSkillName('MySkill')).toBe('myskill');
    });

    it('should replace invalid characters with hyphens', () => {
      expect(sanitizeSkillName('my skill!')).toBe('my-skill');
      expect(sanitizeSkillName('skill@#$name')).toBe('skill-name');
    });

    it('should collapse multiple hyphens', () => {
      expect(sanitizeSkillName('my---skill')).toBe('my-skill');
    });

    it('should remove leading/trailing hyphens', () => {
      expect(sanitizeSkillName('-my-skill-')).toBe('my-skill');
    });

    it('should handle complex cases', () => {
      expect(sanitizeSkillName('My Cool Skill (v2)!')).toBe('my-cool-skill-v2');
    });
  });

  describe('validateSkillFrontmatter', () => {
    it('should accept valid frontmatter', () => {
      const valid = {
        name: 'my-skill',
        description: 'A useful skill',
      };
      expect(validateSkillFrontmatter(valid)).toEqual(valid);
    });

    it('should accept optional fields', () => {
      const valid = {
        name: 'my-skill',
        description: 'A useful skill',
        version: '1.0.0',
        author: 'John Doe',
        tags: ['utility', 'helper'],
      };
      expect(validateSkillFrontmatter(valid)).toEqual(valid);
    });

    it('should reject missing name', () => {
      const invalid = {
        description: 'A useful skill',
      };
      expect(validateSkillFrontmatter(invalid)).toBeNull();
    });

    it('should reject missing description', () => {
      const invalid = {
        name: 'my-skill',
      };
      expect(validateSkillFrontmatter(invalid)).toBeNull();
    });

    it('should reject invalid skill name format', () => {
      const invalid = {
        name: 'My Skill!',
        description: 'A useful skill',
      };
      expect(validateSkillFrontmatter(invalid)).toBeNull();
    });

    it('should reject skill name that is too long', () => {
      const invalid = {
        name: 'a'.repeat(101),
        description: 'A useful skill',
      };
      expect(validateSkillFrontmatter(invalid)).toBeNull();
    });

    it('should reject description that is too long', () => {
      const invalid = {
        name: 'my-skill',
        description: 'a'.repeat(501),
      };
      expect(validateSkillFrontmatter(invalid)).toBeNull();
    });

    it('should reject invalid version format', () => {
      const invalid = {
        name: 'my-skill',
        description: 'A useful skill',
        version: 'v1.0',
      };
      expect(validateSkillFrontmatter(invalid)).toBeNull();
    });

    it('should accept valid semantic version', () => {
      const valid = {
        name: 'my-skill',
        description: 'A useful skill',
        version: '1.2.3',
      };
      expect(validateSkillFrontmatter(valid)).toEqual(valid);
    });
  });

  describe('validateInstallSource', () => {
    it('should accept absolute paths', () => {
      expect(validateInstallSource('/absolute/path/to/skill')).toBe(true);
    });

    it('should accept relative paths', () => {
      expect(validateInstallSource('./relative/path')).toBe(true);
      expect(validateInstallSource('../parent/path')).toBe(true);
    });

    it('should accept tilde paths', () => {
      expect(validateInstallSource('~/skills/my-skill')).toBe(true);
    });

    it('should accept SSH git URLs', () => {
      expect(validateInstallSource('git@github.com:owner/repo.git')).toBe(true);
    });

    it('should accept HTTPS git URLs', () => {
      expect(validateInstallSource('https://github.com/owner/repo')).toBe(true);
      expect(validateInstallSource('https://github.com/owner/repo.git')).toBe(true);
    });

    it('should accept git:// URLs', () => {
      expect(validateInstallSource('git://github.com/owner/repo.git')).toBe(true);
    });

    it('should accept GitHub shorthand', () => {
      expect(validateInstallSource('owner/repo')).toBe(true);
      expect(validateInstallSource('owner/repo/skill-path')).toBe(true);
    });

    it('should reject invalid formats', () => {
      expect(validateInstallSource('invalid')).toBe(false);
      expect(validateInstallSource('just-a-name')).toBe(false);
    });
  });
});
