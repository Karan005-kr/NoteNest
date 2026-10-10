const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const roots = ['server.js', 'src', 'database', 'examples'];
const files = [];
function walk(target) {
  const stat = fs.statSync(target);
  if (stat.isDirectory()) {
    for (const item of fs.readdirSync(target)) walk(path.join(target, item));
  } else if (target.endsWith('.js')) files.push(target);
}
for (const item of roots) if (fs.existsSync(item)) walk(item);

let failed = false;
for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { stdio: 'inherit' });
  if (result.status !== 0) failed = true;
}
if (failed) process.exit(1);
console.log(`Syntax OK: ${files.length} JavaScript files checked.`);
