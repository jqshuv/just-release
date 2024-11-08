// Copyright (c) 2024 Joshua Schmitt
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import convict from 'convict';
import { existsSync } from 'fs';
import { join } from 'path';

const config = convict({
  "$schema": {
    doc: 'Schema version',
    format: String,
    default: '0.0.0'
  },
  git: {
    enabled: {
      doc: 'Enable git',
      format: Boolean,
      default: false
    },
    commit: {
      doc: 'Commit changes',
      format: Boolean,
      default: true
    },
    commitMessage: {
      doc: 'Commit message',
      format: String,
      default: 'chore(release): :rocket: ${version}'
    },
    commitArgs: {
      doc: 'Commit arguments',
      format: Array<String>,
      default: []
    },
    tag: {
      doc: 'Tag the release',
      format: Boolean,
      default: true
    },
    tagName: {
      doc: 'Tag message',
      format: String,
      default: 'v${version}'
    },
    tagArgs: {
      doc: 'Tag arguments',
      format: Array<String>,
      default: []
    },
    tagAnnotation: {
      doc: 'Tag annotation',
      format: String,
      default: 'Release ${version}'
    },
    push: {
      doc: 'Push changes',
      format: Boolean,
      default: true
    },
    requireCleanWorkingDir: {
      doc: 'Require a clean working directory',
      format: Boolean,
      default: true
    },
    changelog: {
      doc: 'Generate changelog',
      format: String,
      default: 'default'
    }
  },
  github: {
    enabled: {
      doc: 'Enable GitHub',
      format: Boolean,
      default: false
    },
    release: {
      doc: 'Create a GitHub release',
      format: Boolean,
      default: true
    },
    releaseName: {
      doc: 'Release name',
      format: String,
      default: 'Release ${version}'
    },
    releaseBody: {
      doc: 'Release body',
      format: String,
      default: ''
    },
  }
});

if (existsSync(join(process.cwd(), '.just-release.json'))) {
  config.loadFile(join(process.cwd(), '.just-release.json'));

  config.validate({ allowed: 'strict' });
}

config.validate({ allowed: 'strict' });

export default config;
