const fs = require('fs');
const path = require('path');

const sourceRoot = path.join(__dirname, '..', 'src', 'app');
const files = [];

function collectFiles(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      collectFiles(filePath);
    } else if (/\.(html|ts)$/.test(entry.name)) {
      files.push(filePath);
    }
  }
}

function flattenKeys(value, prefix = '', keys = new Set()) {
  for (const [key, child] of Object.entries(value)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (child && typeof child === 'object') {
      flattenKeys(child, fullKey, keys);
    } else {
      keys.add(fullKey);
    }
  }
  return keys;
}

collectFiles(sourceRoot);

const usedKeys = new Map();
for (const filePath of files) {
  const source = fs.readFileSync(filePath, 'utf8');
  for (const match of source.matchAll(/["'`]([A-Z][A-Z0-9_]*\.[A-Z][A-Z0-9_.]*)["'`]/g)) {
    const key = match[1];
    if (!usedKeys.has(key)) usedKeys.set(key, new Set());
    usedKeys.get(key).add(path.relative(sourceRoot, filePath));
  }
}

let hasMissingKeys = false;
for (const language of ['en', 'ar']) {
  const translationPath = path.join(__dirname, '..', 'src', 'assets', 'i18n', `${language}.json`);
  const translations = JSON.parse(fs.readFileSync(translationPath, 'utf8'));
  const availableKeys = flattenKeys(translations);
  const missingKeys = [...usedKeys.keys()].filter(key => !availableKeys.has(key)).sort();

  console.log(`${language}: ${missingKeys.length} missing key(s)`);
  for (const key of missingKeys) {
    console.log(`  ${key}: ${[...usedKeys.get(key)].join(', ')}`);
  }
  hasMissingKeys ||= missingKeys.length > 0;
}

process.exitCode = hasMissingKeys ? 1 : 0;
