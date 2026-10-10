const fs = require('fs');
const path = require('path');

const root = process.cwd();
const pkg = require(path.join(root, 'package.json'));
const packageDeps = new Set([
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.devDependencies || {}),
]);
const jsFiles = [];

function walk(target) {
  const stat = fs.statSync(target);
  if (stat.isDirectory()) {
    for (const item of fs.readdirSync(target)) {
      if (item === 'node_modules') continue;
      walk(path.join(target, item));
    }
  } else if (target.endsWith('.js')) {
    jsFiles.push(target);
  }
}

for (const target of ['server.js', 'src', 'database', 'scripts']) {
  const full = path.join(root, target);
  if (fs.existsSync(full)) walk(full);
}

const missingFiles = [];
const missingPackages = [];
const builtins = new Set(require('module').builtinModules.map((x) => x.replace(/^node:/, '')));

for (const file of jsFiles) {
  const text = fs.readFileSync(file, 'utf8');
  const regex = /require\(['"]([^'"]+)['"]\)/g;
  for (const match of text.matchAll(regex)) {
    const spec = match[1];
    if (spec.startsWith('.')) {
      const base = path.resolve(path.dirname(file), spec);
      const candidates = [base, `${base}.js`, path.join(base, 'index.js')];
      if (!candidates.some(fs.existsSync)) missingFiles.push(`${path.relative(root, file)} -> ${spec}`);
    } else {
      const pkgName = spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0];
      if (!builtins.has(pkgName) && !packageDeps.has(pkgName)) missingPackages.push(`${path.relative(root, file)} -> ${pkgName}`);
    }
  }
}

if (missingFiles.length || missingPackages.length) {
  if (missingFiles.length) console.error('Missing local modules:\n' + missingFiles.join('\n'));
  if (missingPackages.length) console.error('Missing package.json dependencies:\n' + missingPackages.join('\n'));
  process.exit(1);
}
console.log(`Project audit OK: ${jsFiles.length} JS files, all local imports and declared package dependencies look consistent.`);
