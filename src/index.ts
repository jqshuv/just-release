// Copyright (c) 2024 Joshua Schmitt
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { confirm, select } from '@inquirer/prompts';
import { existsSync } from 'fs';
import semver from 'semver';
import { gitAdd, gitCheckClean, gitCommit, gitPlugin, gitPush, gitPushTags, gitTag } from './plugins/git';
import { readFile, writeFile } from 'fs/promises';
import config from './config/config';
import path, { join } from 'path';
import { pathToFileURL } from 'url';

const currentPath = process.cwd();
console.log(config.get('git.enabled'));

console.log(pathToFileURL(join(currentPath, 'package.json')).href)

async function main() {
  if (!existsSync(join(currentPath, 'package.json'))) {
    console.error('No package.json found in the current directory.');
    process.exit(1);
  }

  const packageJsonUrl = pathToFileURL(join(currentPath, 'package.json')).href;
  const currentVersion = await import(packageJsonUrl).then((pkg) => pkg.version);

  const majorVersion = semver.inc(currentVersion, 'major') || '';
  const minorVersion = semver.inc(currentVersion, 'minor') || '';
  const patchVersion = semver.inc(currentVersion, 'patch') || '';

  const choiseMajor = `Major (${majorVersion})`;
  const choiseMinor = `Minor (${minorVersion})`;
  const choisePatch = `Patch (${patchVersion})`;

  console.log(`Current version: ${currentVersion}`);

  const releaseType = await select({ message: 'What type of release is this?', choices: [
    choisePatch,
    choiseMinor,
    choiseMajor
  ], default: currentPath});

  var newVersion: string;

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


  var useGit = config.get('git.enabled') ?? await confirm({ message: 'Do you want to use git?', default: true });

  if (config.get('git.requireCleanWorkingDir') && useGit) {
    if (!await gitCheckClean()) {
      console.error('Working directory is not clean.');
      process.exit(1);
    }
  }

  var packageJson = JSON.parse(await readFile(`${currentPath}/package.json`, 'utf8'));
  packageJson.version = newVersion;
  await writeFile(`${currentPath}/package.json`, JSON.stringify(packageJson, null, 2));

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


  const confirmVersion = await confirm({ message: 'Do you want to continue?' });

  if (!confirmVersion) {
    process.exit(1);
  }

}

main();
