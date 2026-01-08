/**
 * Centralized input validation and sanitization
 * Security: Prevents command injection, path traversal, and other injection attacks
 */

/**
 * Validate git URL is safe and doesn't contain shell metacharacters
 * @throws Error if URL is invalid or potentially malicious
 */
export function validateGitUrl(url: string): void {
  // Validate URL format first
  try {
    const parsed = new URL(url);

    // Whitelist allowed protocols
    const allowedProtocols = ['https:', 'http:', 'git:', 'ssh:'];
    if (!allowedProtocols.includes(parsed.protocol)) {
      throw new Error(
        `Invalid protocol: ${parsed.protocol}. Allowed: ${allowedProtocols.join(', ')}`
      );
    }

    // Block shell metacharacters that could enable command injection
    const dangerousChars = /[`$(){};&|<>\\]/;
    if (dangerousChars.test(url)) {
      throw new Error('Invalid characters in git URL: potential command injection detected');
    }
  } catch (error) {
    // Handle git@ SSH URLs separately
    if (url.startsWith('git@')) {
      // Validate SSH URL format: git@host:path
      const sshPattern = /^git@[a-zA-Z0-9.-]+:[a-zA-Z0-9/_.-]+$/;
      const dangerousChars = /[`$(){};&|<>\\]/;

      if (!sshPattern.test(url) || dangerousChars.test(url)) {
        throw new Error('Invalid SSH git URL format');
      }
      return; // Valid SSH URL
    }

    throw error; // Re-throw protocol or format errors
  }
}

/**
 * Escape special characters for safe use in RegExp
 */
export function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Escape XML/HTML special characters to prevent injection
 */
export function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Validate skill subpath doesn't contain path traversal attempts
 * @throws Error if subpath is invalid or contains path traversal
 */
export function validateSkillSubpath(subpath: string): string {
  // Block path traversal
  if (subpath.includes('..')) {
    throw new Error('Invalid skill subpath: path traversal detected (..)');
  }

  // Block absolute paths
  if (subpath.startsWith('/')) {
    throw new Error('Invalid skill subpath: absolute paths not allowed');
  }

  // Block hidden paths
  if (subpath.startsWith('.')) {
    throw new Error('Invalid skill subpath: hidden paths not allowed');
  }

  // Normalize and validate
  const normalized = subpath.replace(/\/+/g, '/').replace(/^\/|\/$/g, '');

  // Allow empty string (no subpath)
  if (normalized === '') {
    return normalized;
  }

  // Validate characters (alphanumeric, dash, underscore, forward slash, dot)
  const validPattern = /^[a-zA-Z0-9/_.-]+$/;
  if (!validPattern.test(normalized)) {
    throw new Error('Invalid skill subpath: contains invalid characters');
  }

  return normalized;
}
