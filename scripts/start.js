const path  = require('path');
const fs    = require('fs-extra');
const sh    = require('kool-shell');

const rootPath = path.join(__dirname, '..');
const demoName = process.argv[2] || null;

if (demoName) {
  const demoPath = path.join(rootPath, demoName);
  try {
    if (fs.statSync(demoPath).isDirectory()) {
      sh.success(`Running ${demoPath}...`);
      sh.exec('npm', ['run', 'start'], {cwd: demoPath});
    } else {
      sh.error(`${demoPath} isn't a directory.`);
    }
  } catch (e) {
    sh.error(e);
  }
} else {
  sh.error(`Error: No demo folder defined.`);
  sh.info('Usage:\nnpm run start -- demoName');
}