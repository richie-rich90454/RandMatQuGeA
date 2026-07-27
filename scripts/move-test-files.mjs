import { readFileSync, writeFileSync, mkdirSync, existsSync, unlinkSync } from 'fs';
import { resolve, dirname, relative, sep } from 'path';
import { fileURLToPath } from 'url';

const srcDir = resolve(fileURLToPath(import.meta.url), '../../src');

function getRelativeImportPaths(content) {
  const paths = [];
  // Match strings in quotes that start with ./ or ../
  const re = /(?<=from\s+["'`])(\.\.?\/[^"'`]+)(?=["'`])|(?<=vi\.mock\(["'`])(\.\.?\/[^"'`]+)(?=["'`])|(?<=require\(["'`])(\.\.?\/[^"'`]+)(?=["'`])/g;
  let match;
  while ((match = re.exec(content)) !== null) {
    paths.push({ index: match.index, path: match[0], end: match.index + match[0].length });
  }
  return paths;
}

function adjustImportPath(importPath, oldRelativeDir) {
  // Resolve importPath relative to oldRelativeDir (path from src/ to old test dir)
  const parts = oldRelativeDir ? oldRelativeDir.split('/').filter(Boolean) : [];
  const importParts = importPath.split('/');
  for (const part of importParts) {
    if (part === '.' || part === '') continue;
    if (part === '..') { if (parts.length > 0) parts.pop(); }
    else parts.push(part);
  }
  const resolved = parts.join('/');
  // Compute new relative path from __tests__/<oldRelativeDir>/ to resolved
  const oldParts = oldRelativeDir ? oldRelativeDir.split('/').filter(Boolean) : [];
  const depth = oldParts.length + 1;
  const prefix = '../'.repeat(depth);
  return prefix + resolved;
}

function processFile(relativePath) {
  const oldPath = resolve(srcDir, relativePath);
  const newPath = resolve(srcDir, '__tests__', relativePath);
  const newDir = dirname(newPath);

  if (!existsSync(oldPath)) {
    console.error(`File not found: ${oldPath}`);
    process.exit(1);
  }

  const content = readFileSync(oldPath, 'utf-8');

  // Determine oldRelativeDir - the directory of the test file relative to src/
  const oldRelativeDir = dirname(relativePath).replace(/\\/g, '/');
  const normalizedOldDir = oldRelativeDir === '.' ? '' : oldRelativeDir;

  const importPaths = getRelativeImportPaths(content);
  let newContent = content;
  // Process in reverse order to not mess up indices
  for (const { index, path: impPath, end } of importPaths.reverse()) {
    const adjusted = adjustImportPath(impPath, normalizedOldDir);
    newContent = newContent.slice(0, index) + adjusted + newContent.slice(end);
  }

  if (!existsSync(newDir)) {
    mkdirSync(newDir, { recursive: true });
  }

  writeFileSync(newPath, newContent, 'utf-8');
  console.log(`Written: ${newPath}`);
}

const file = process.argv[2];
if (!file) {
  console.error('Usage: node scripts/move-test-files.mjs <relative-path-from-src>');
  process.exit(1);
}
processFile(file);
