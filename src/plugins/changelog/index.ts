// Copyright (c) 2024 Joshua Schmitt
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { GitCommits } from "@/plugins/git";

export default function generateChangelogFromCommits(commits: GitCommits[], versionNew: string, versionSince?: string, repositoryUrl?: string): string {
  const typeBreakingChanges = [];
  const typeFeatures = [];
  const typeFixes = [];
  const typePerf = [];
  const typeDocs = [];
  const authors = new Set<string>();

  if (repositoryUrl) {
    if (repositoryUrl.endsWith('.git')) {
      repositoryUrl = repositoryUrl.slice(0, -4);
    }

    if (!repositoryUrl.endsWith('/')) {
      repositoryUrl += '/';
    }
  }

  for (const commit of commits) {
    const [type, message] = commit.message.split(':');
    switch (type) {
      case 'BREAKING CHANGE':
        typeBreakingChanges.push(message);
        break;
      case 'feat':
        typeFeatures.push(message);
        break;
      case 'fix':
        typeFixes.push(message);
        break;
      case 'perf':
        typePerf.push(message);
        break;
      case 'docs':
        typeDocs.push(message);
        break;
    }

    authors.add(`${commit.authorName} <${commit.authorEmail}>`);
  }

  const changelog = [

  ];

  if (repositoryUrl) {
    changelog.push(`[compare changes](${repositoryUrl}compare/${versionSince}...${versionNew})`);
    changelog.push('');
  }

  if (typeBreakingChanges.length !== 0) {
    changelog.push('### ⚠ Breaking Changes');
    changelog.push('');
    changelog.push(...typeBreakingChanges.map((change) => `- ${change}`));
    changelog.push('');
  }

  if (typeFeatures.length !== 0) {
    changelog.push('### ✨ Features');
    changelog.push('');
    changelog.push(...typeFeatures.map((feature) => `- ${feature}`));
    changelog.push('');
  }

  if (typeFixes.length !== 0) {
    changelog.push('### 🐛 Fixes');
    changelog.push('');
    changelog.push(...typeFixes.map((fix) => `- ${fix}`));
    changelog.push('');
  }

  if (typePerf.length !== 0) {
    changelog.push('### 🚀 Performance Improvements');
    changelog.push('');
    changelog.push(...typePerf.map((perf) => `- ${perf}`));
    changelog.push('');
  }

  if (typeDocs.length !== 0) {
    changelog.push('### 📝 Documentation');
    changelog.push('');
    changelog.push(...typeDocs.map((doc) => `- ${doc}`));
    changelog.push('');
  }

  if (authors.size !== 0) {
    changelog.push('### ❤️ Contributors');
    changelog.push('');
    changelog.push(...Array.from(authors).map((author) => `- ${author}`));
    changelog.push('');
  }

  return changelog.join('\n');
}
