import { z } from 'zod';
import { resolve, sep } from 'path';

/**
 * Schema for SKILL.md frontmatter
 */
export const SkillFrontmatterSchema = z.object({
  name: z
    .string()
    .min(1, 'Skill name cannot be empty')
    .max(100, 'Skill name too long')
    .regex(/^[a-z0-9-]+$/, 'Skill name must be lowercase alphanumeric with hyphens'),
  description: z.string().min(1, 'Description cannot be empty').max(500, 'Description too long'),
  version: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/, 'Version must be semantic (e.g., 1.0.0)')
    .optional(),
  author: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type SkillFrontmatter = z.infer<typeof SkillFrontmatterSchema>;

/**
 * Schema for installation source
 */
export const InstallSourceSchema = z.union([
  // Local path (absolute, relative, or tilde)
  z
    .string()
    .refine(
      (s) => s.startsWith('/') || s.startsWith('./') || s.startsWith('../') || s.startsWith('~/'),
      { message: 'Invalid local path' }
    ),
  // Git URL (SSH, HTTPS, git://)
  z
    .string()
    .refine(
      (s) =>
        s.startsWith('git@') ||
        s.startsWith('git://') ||
        s.startsWith('http://') ||
        s.startsWith('https://') ||
        s.endsWith('.git'),
      { message: 'Invalid git URL' }
    ),
  // GitHub shorthand (owner/repo or owner/repo/path)
  z.string().regex(/^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+(\/[\w\-./]+)?$/, {
    message: 'Invalid GitHub shorthand (expected: owner/repo or owner/repo/path)',
  }),
]);

/**
 * Validate path is within target directory (prevent path traversal)
 */
export function validatePathSecurity(targetPath: string, targetDir: string): boolean {
  const resolvedTargetPath = resolve(targetPath);
  const resolvedTargetDir = resolve(targetDir);

  // Ensure target path starts with target directory + separator
  // This prevents attacks like /home/user/skills-evil matching /home/user/skills
  // Use path.sep for cross-platform compatibility (Windows uses \, Unix uses /)
  return resolvedTargetPath.startsWith(resolvedTargetDir + sep);
}

/**
 * Validate SKILL.md frontmatter with Zod
 */
export function validateSkillFrontmatter(
  frontmatter: Record<string, unknown>
): SkillFrontmatter | null {
  try {
    return SkillFrontmatterSchema.parse(frontmatter);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('SKILL.md validation errors:');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    }
    return null;
  }
}

/**
 * Validate installation source format
 */
export function validateInstallSource(source: string): boolean {
  try {
    InstallSourceSchema.parse(source);
    return true;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Invalid source format:');
      error.errors.forEach((err) => {
        console.error(`  - ${err.message}`);
      });
    }
    return false;
  }
}

/**
 * Sanitize skill name for safe file system usage
 */
export function sanitizeSkillName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Validate skill name doesn't contain path traversal attempts
 */
export function validateSkillName(name: string): boolean {
  // Prevent path traversal
  if (name.includes('..') || name.includes('/') || name.includes('\\')) {
    return false;
  }

  // Prevent hidden files
  if (name.startsWith('.')) {
    return false;
  }

  // Enforce reasonable length
  if (name.length === 0 || name.length > 100) {
    return false;
  }

  return true;
}
