import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, relative } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const baselinePath = resolve(root, 'scripts/design-system-baseline.json');
const rules = {
  'literal-color': /#[\da-fA-F]{3,8}\b|(?:rgb|rgba|hsl|hsla)\(\s*\d/g,
  'palette-utility': /\b(?:bg|text|border|from|via|to|ring|shadow)-(?:white|black|slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)(?:-\d{2,3})?\b/g,
  'raw-button': /<button\b/g,
  'arbitrary-visual-value': /\b(?:bg|text|border|shadow|rounded|p[trblxy]?|m[trblxy]?|gap|w|h|max-w|min-w)-\[[^\]\n]+\]/g,
  'custom-font': /fontFamily\s*:/g,
};
function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const path = resolve(dir, entry.name);
    if (entry.isDirectory()) return walk(path);
    return /\.(tsx|ts)$/.test(path) && !/\.(test|spec)\./.test(path) ? [path] : [];
  });
}
function scan() {
  const findings = {};
  for (const file of walk(resolve(root, 'src'))) {
    const path = relative(root, file);
    // Generated integrations are not editable; shared UI primitives own native controls.
    if (path.startsWith('src/integrations/')) continue;
    const source = readFileSync(file, 'utf8');
    for (const [rule, pattern] of Object.entries(rules)) {
      if (rule === 'raw-button' && path.startsWith('src/components/ui/')) continue;
      for (const match of source.matchAll(pattern)) {
        const key = `${path} | ${rule} | ${match[0]}`;
        findings[key] = (findings[key] || 0) + 1;
      }
    }
  }
  return findings;
}
const current = scan();
if (process.argv.includes('--init-baseline')) {
  writeFileSync(baselinePath, JSON.stringify(current, null, 2) + '\n', { flag: 'wx' });
  console.log('Recorded existing visual debt; new occurrences will fail.');
} else {
  const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
  const added = Object.entries(current).filter(([key, count]) => count > (baseline[key] || 0));
  if (added.length) {
    console.error('New design drift: reuse DESIGN-SYSTEM.md tokens and controls.');
    added.forEach(([key, count]) => console.error(`${key} (+${count - (baseline[key] || 0)})`));
    process.exitCode = 1;
  } else {
    console.log('Design check passed: no new off-system styling.');
  }
}