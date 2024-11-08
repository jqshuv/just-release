#!/usr/bin/env node

import { confirm, select } from '@inquirer/prompts';
import { existsSync } from 'fs';
import semver from 'semver';
import { gitAdd, gitCheckClean, gitCommit, gitPush, gitPushTags, gitTag } from './plugins/git/index.js';
import config from './config/config.js';
import { join } from 'path';
import { updatePackageJsonVersion } from './utils.js';
import { readFile } from 'fs/promises';

const currentPath = process.cwd();

async function main() {
  var releaseType: string;
  var newVersion: string;
  var useGit: boolean;
  var useGitHub: boolean;

  if (!existsSync(join(currentPath, 'package.json'))) {
    console.error('No package.json found in the current directory.');
    process.exit(1);
  }

  const currentVersion = await readFile(join(currentPath, 'package.json'), 'utf8').then((data) => JSON.parse(data).version).catch(() => { console.error('Failed to read package.json.'); process.exit(1); });

  const majorVersion = semver.inc(currentVersion, 'major') || '';
  const minorVersion = semver.inc(currentVersion, 'minor') || '';
  const patchVersion = semver.inc(currentVersion, 'patch') || '';

  const choiseMajor = `Major (${majorVersion})`;
  const choiseMinor = `Minor (${minorVersion})`;
  const choisePatch = `Patch (${patchVersion})`;

  console.log(`Current version: ${currentVersion}`);

  releaseType = await select({ message: 'What type of release is this?', choices: [
    choisePatch,
    choiseMinor,
    choiseMajor
  ], default: currentPath}).then((answer) => answer as string).catch(() => { console.error('Invalid release type.'); process.exit(1); });

  if (releaseType === choiseMajor) {
    newVersion = majorVersion;
  } else if (releaseType === choiseMinor) {
    newVersion = minorVersion;
  } else if (releaseType === choisePatch) {
    newVersion = patchVersion;
  } else {
    console.error('Invalid release type.');
    process.exit(1);
  }


  useGit = config.get('git.enabled') ?? await confirm({ message: 'Do you want to use git?', default: true });

  if (config.get('git.requireCleanWorkingDir') && useGit) {
    if (!await gitCheckClean()) {
      console.error('Working directory is not clean.');
      process.exit(1);
    }
  }


  useGitHub = config.get('github.enabled') ?? await confirm({ message: 'Do you want to use GitHub?' });

  const confirmVersion = await confirm({ message: 'Do you want to continue?' });

  if (!confirmVersion) {
    process.exit(1);
  }

  updatePackageJsonVersion(newVersion);

  if (useGit) {
    if (config.get('git.commit')) {
      console.log('Committing changes...');
      await gitAdd();
      await gitCommit(config.get('git.commitMessage').replace('${version}', newVersion), config.get('git.commitArgs'));
    }

    if (config.get('git.tag')) {
      console.log('Tagging release...');
      await gitTag(config.get('git.tagName').replace('${version}', newVersion), config.get('git.tagArgs'), config.get('git.tagAnnotation').replace('${version}', newVersion));
    }

    if (config.get('git.push')) {
      console.log('Pushing changes...');
      await gitPush();
      await gitPushTags();
    }

    if (config.get('git.changelog') === 'default') {
      console.log('Generating changelog...');
    }
  }

  if (useGitHub) {
    console.log('Creating release on GitHub...');
  }

  console.log(`Version updated to ${newVersion}`);

}

main();
