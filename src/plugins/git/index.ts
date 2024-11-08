// Copyright (c) 2024 Joshua Schmitt
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { execa } from "execa";

async function isGitRepository() {
  return await execa('git', ['status']).then(() => true).catch(() => false);
}

async function gitAdd() {
  await execa('git', ['add', '.']);
}

async function gitCommit(message: string) {
  await execa('git', ['commit', '-m', message]);
}

async function gitTag(tag: string) {
  await execa('git', ['tag', tag]);
}

async function gitPush() {
  await execa('git', ['push']);
}

async function gitPushTags() {
  await execa('git', ['push', '--tags']);
}

export default async function git() {
  if (!await isGitRepository()) {
    throw new Error('Not a git repository');
  }

  console.log('Git plugin');
}

export async function getCommitHistoryName(toTag?: string) {
  return await execa('git', ['--no-pager', 'log', '--format=%s', toTag ? `${toTag}..HEAD` : '.']).then(({ stdout }) => stdout);
}
