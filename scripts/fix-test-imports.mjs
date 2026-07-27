import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const srcDir = resolve(fileURLToPath(import.meta.url), '../../src');

function getRelativeImportPaths(content) {
  const paths = [];
  const re = /(?<=(?:from|import)\s*\(?\s*["'`])(\.\.?\/[^"'`]+)(?=["'`])/g;
  let match;
  while ((match = re.exec(content)) !== null) {
    if (!paths.length || match.index !== paths[paths.length - 1].index) {
      paths.push({ index: match.index, path: match[0], end: match.index + match[0].length });
    }
  }
  return paths;
}

function resolveRelative(importPath, testRelativeDir) {
  const parts = testRelativeDir ? testRelativeDir.split('/').filter(Boolean) : [];
  const importParts = importPath.split('/');
  for (const part of importParts) {
    if (part === '.' || part === '') continue;
    if (part === '..') { if (parts.length > 0) parts.pop(); }
    else parts.push(part);
  }
  return parts.join('/');
}

function adjustImportPath(importPath, testRelativeDir) {
  // Strip the __tests__/ prefix to get the original source dir
  const srcDir = testRelativeDir.replace(/^__tests__\//, '');
  // Resolve the import relative to the original source dir
  const resolved = resolveRelative(importPath, srcDir);
  // Go up from __tests__/<subdir>/ to src/, then down to resolved
  const depth = testRelativeDir ? testRelativeDir.split('/').filter(Boolean).length : 0;
  const prefix = '../'.repeat(depth);
  return prefix + resolved;
}

function processFile(filePath) {
  const absPath = resolve(filePath);
  const relativeToSrc = relative(srcDir, absPath).replace(/\\/g, '/');
  const testRelativeDir = dirname(relativeToSrc).replace(/\\/g, '/');
  const normalizedDir = testRelativeDir === '.' ? '' : testRelativeDir;

  const content = readFileSync(absPath, 'utf-8');
  const importPaths = getRelativeImportPaths(content);

  if (importPaths.length === 0) return null;

  let newContent = content;
  for (const { index, path: impPath, end } of importPaths.reverse()) {
    const adjusted = adjustImportPath(impPath, normalizedDir);
    newContent = newContent.slice(0, index) + adjusted + newContent.slice(end);
  }

  writeFileSync(absPath, newContent, 'utf-8');
  return importPaths.length;
}

const file = process.argv[2];
if (!file) {
  console.error('Usage: node scripts/fix-test-imports.mjs <absolute-or-relative-path>');
  process.exit(1);
}

const count = processFile(file);
if (count !== null) {
  console.log(`Fixed ${count} import(s) in ${file}`);
} else {
  console.log(`No issues in ${file}`);
}
