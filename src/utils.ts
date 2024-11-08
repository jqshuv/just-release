// Copyright (c) 2024 Joshua Schmitt
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { readFile, writeFile } from "fs/promises";

const currentDirectory = process.cwd();

export function getCurrentDirectory() {
  return currentDirectory;
}

export async function updatePackageJsonVersion(version: string): Promise<void> {
  var packageJson = JSON.parse(await readFile(`${currentDirectory}/package.json`, 'utf8'));
  packageJson.version = version;
  await writeFile(`${currentDirectory}/package.json`, JSON.stringify(packageJson, null, 2));
  return;
}
