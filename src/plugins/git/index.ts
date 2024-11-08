// Copyright (c) 2024 Joshua Schmitt
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { execa } from "execa";

export type GitCommits = {
  message: string;
  authorName: string;
  authorEmail: string;
};

async function isGitRepository() {
  return await execa('git', ['status']).then(() => true).catch(() => false);
}

async function gitAdd() {
  await execa('git', ['add', '.']);
}

async function gitCommit(message: string, args?: string[]) {
  if (args) {
    await execa('git', ['commit', '-m', message, ...args]);
    return;
  } else {
    await execa('git', ['commit', '-m', message]);
  }
}

async function gitTag(tag: string, args?: string[]) {
  if (args) {
    await execa('git', ['tag', tag, ...args]);
    return;
  } else {
    await execa('git', ['tag', tag]);
  }
}

async function gitPush() {
  await execa('git', ['push']);
}

async function gitPushTags() {
  await execa('git', ['push', '--tags']);
}

export async function gitGetLatestTag() {
  return await execa('git', ['describe', '--tags', '--abbrev=0']).then((stdout) => {
    return stdout.stdout;
  }).catch(() => {
    return '';
  });
}

export async function gitPlugin(version: string) {
  if (!await isGitRepository()) {
    throw new Error('Not a git repository');
  }

  await gitAdd();
  // await gitCommit(`Release ${version}`);
  // await gitTag(`v${version}`);

  console.log('Git plugin');
}

export async function gitCheckClean() {
  return await execa('git', ['status', '--porcelain']).then((stdout) => {
    if (stdout.stdout) {
      return false;
    } else {
      return true;
    }
  });
}

export async function getCommitHistoryName(toTag?: string) {
  return await execa('git', ['--no-pager', 'log', '--format=%s,jrs,%an,jrs,%ae', toTag ? `${toTag}..HEAD` : '.']).then((stdout) => {
    const commits: GitCommits[] = [];

    for (const line of stdout.stdout.split('\n')) {
      if (line) {
        line.trim();
        const commit = line.split(',jrs,')
        commits.push({
          message: commit[0],
          authorName: commit[1],
          authorEmail: commit[2],
        });
      }
    }

    return commits;
  })
}
