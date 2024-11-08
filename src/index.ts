// Copyright (c) 2024 Joshua Schmitt
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { confirm, select } from '@inquirer/prompts';
import { existsSync } from 'fs';
import semver from 'semver';
import { gitCheckClean, gitPlugin } from './plugins/git';
import { readFile, writeFile } from 'fs/promises';

const currentPath = process.cwd();

async function main() {
  if (!existsSync(`${currentPath}/package.json`)) {
    console.error('No package.json found in the current directory.');
    process.exit(1);
  }

  const currentVersion = await import(`${currentPath}/package.json`).then((pkg) => pkg.version);

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

  const useGit = await confirm({ message: 'Do you want to use git?', default: true });

  if (useGit) {
    const isClean = await gitCheckClean();
    // if (!isClean) {
    //   console.error('Git is not clean.');
    //   process.exit(1);
    // }
  }

  var packageJson = JSON.parse(await readFile(`${currentPath}/package.json`, 'utf8'));

  packageJson.version = newVersion;

  console.log(`New version: ${newVersion}`);

  const confirmVersion = await confirm({ message: 'Do you want to continue?' });

  if (!confirmVersion) {
    process.exit(1);
  }

  console.log('Writing package.json...');
  await writeFile(`${currentPath}/package.json`, JSON.stringify(packageJson, null, 2));

  gitPlugin(newVersion);

}

main();
