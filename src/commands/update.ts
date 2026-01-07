import { existsSync, readFileSync, rmSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { execSync } from 'child_process';
import chalk from 'chalk';
import ora from 'ora';
import { checkbox, confirm } from '@inquirer/prompts';
import { ExitPromptError } from '@inquirer/core';
import { findAllSkills } from '../utils/skills.js';
import type { Skill } from '../types.js';

interface SkillMetadata {
  source?: string; // Git URL or local path
  version?: string;
  installedAt?: string;
  lastUpdated?: string;
}

/**
 * Get skill metadata if it exists
 */
function getSkillMetadata(skillPath: string): SkillMetadata | null {
  const metadataPath = join(skillPath, '.openskills-meta.json');
  if (!existsSync(metadataPath)) {
    return null;
  }

  try {
    const content = readFileSync(metadataPath, 'utf-8');
    return JSON.parse(content) as SkillMetadata;
  } catch {
    return null;
  }
}

/**
 * Check if skill is updateable (installed from git)
 */
function isUpdateable(skill: Skill): boolean {
  const metadata = getSkillMetadata(skill.path);
  if (!metadata || !metadata.source) {
    return false;
  }

  // Check if source is a git URL
  const source = metadata.source;
  return (
    source.startsWith('git@') ||
    source.startsWith('git://') ||
    source.startsWith('http://') ||
    source.startsWith('https://') ||
    source.includes('github.com') ||
    source.includes('gitlab.com')
  );
}

/**
 * Update skill from git repository
 */
async function updateSkill(skill: Skill): Promise<boolean> {
  const metadata = getSkillMetadata(skill.path);
  if (!metadata || !metadata.source) {
    console.error(chalk.red(`Cannot update ${skill.name}: No source information found`));
    return false;
  }

  const tempDir = join(homedir(), `.openskills-temp-${Date.now()}`);
  const spinner = ora(`Updating ${skill.name}...`).start();

  try {
    // Clone latest version
    execSync(`git clone --depth 1 --quiet "${metadata.source}" "${tempDir}"`, {
      stdio: 'pipe',
    });

    // Remove old version
    rmSync(skill.path, { recursive: true, force: true });

    // Move new version into place
    execSync(`mv "${tempDir}" "${skill.path}"`, { stdio: 'pipe' });

    spinner.succeed(chalk.green(`✅ Updated: ${skill.name}`));
    return true;
  } catch (error) {
    spinner.fail(chalk.red(`Failed to update ${skill.name}`));
    const err = error as { stderr?: Buffer };
    if (err.stderr) {
      console.error(chalk.dim(err.stderr.toString().trim()));
    }
    return false;
  }
}

/**
 * Update skills command
 */
export async function updateCommand(options: { all?: boolean; yes?: boolean }): Promise<void> {
  console.log(chalk.bold('Updating skills...\n'));

  // Find all installed skills
  const allSkills = findAllSkills();

  if (allSkills.length === 0) {
    console.log(chalk.yellow('No skills installed.'));
    console.log(`\n${chalk.dim('Install skills:')} ${chalk.cyan('openskills install <source>')}`);
    return;
  }

  // Filter updateable skills
  const updateableSkills = allSkills.filter(isUpdateable);

  if (updateableSkills.length === 0) {
    console.log(chalk.yellow('No updateable skills found.'));
    console.log(
      chalk.dim(
        '\nOnly skills installed from git repositories can be updated.\n' +
          'Local skills and manually installed skills cannot be auto-updated.'
      )
    );
    return;
  }

  console.log(
    chalk.dim(
      `Found ${updateableSkills.length} updateable skill(s) (${allSkills.length - updateableSkills.length} local/manual)\n`
    )
  );

  let skillsToUpdate = updateableSkills;

  // Interactive selection unless --all or --yes
  if (!options.all && !options.yes) {
    try {
      const choices = updateableSkills.map((skill) => {
        const metadata = getSkillMetadata(skill.path);
        const locationTag =
          skill.location === 'project' ? chalk.blue('[project]') : chalk.dim('[global]');

        return {
          name: `${chalk.bold(skill.name.padEnd(25))} ${locationTag}`,
          value: skill.name,
          description: `${skill.description.slice(0, 60)} ${chalk.dim(`(source: ${metadata?.source})`)}`,
          checked: true, // Check all by default
        };
      });

      const selected = await checkbox({
        message: 'Select skills to update',
        choices,
        pageSize: 15,
      });

      if (selected.length === 0) {
        console.log(chalk.yellow('No skills selected. Update cancelled.'));
        return;
      }

      skillsToUpdate = updateableSkills.filter((skill) => selected.includes(skill.name));
    } catch (error) {
      if (error instanceof ExitPromptError) {
        console.log(chalk.yellow('\n\nCancelled by user'));
        process.exit(0);
      }
      throw error;
    }
  }

  // Confirm update if not --yes
  if (!options.yes) {
    try {
      const shouldProceed = await confirm({
        message: chalk.yellow(
          `Update ${skillsToUpdate.length} skill(s)? This will overwrite local changes.`
        ),
        default: false,
      });

      if (!shouldProceed) {
        console.log(chalk.yellow('Update cancelled.'));
        return;
      }
    } catch (error) {
      if (error instanceof ExitPromptError) {
        console.log(chalk.yellow('\n\nCancelled by user'));
        process.exit(0);
      }
      throw error;
    }
  }

  // Update selected skills
  let successCount = 0;
  let failCount = 0;

  for (const skill of skillsToUpdate) {
    const success = await updateSkill(skill);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  console.log(
    chalk.green(
      `\n✅ Update complete: ${successCount} updated${failCount > 0 ? `, ${failCount} failed` : ''}`
    )
  );
}
