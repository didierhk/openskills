import { escapeRegExp } from './input-validation.js';

/**
 * Extract field from YAML frontmatter
 * Security: Escapes field name to prevent RegExp injection
 */
export function extractYamlField(content: string, field: string): string {
  const escapedField = escapeRegExp(field);
  const match = content.match(new RegExp(`^${escapedField}:\\s*(.+?)$`, 'm'));
  return match ? match[1].trim() : '';
}

/**
 * Validate SKILL.md has proper YAML frontmatter
 */
export function hasValidFrontmatter(content: string): boolean {
  return content.trim().startsWith('---');
}
