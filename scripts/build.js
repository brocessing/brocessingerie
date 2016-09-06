const path  = require('path');
const fs    = require('fs-extra');
const sh    = require('kool-shell');

const rootPath = path.join(__dirname, '..');
const demoName = process.argv[2] || null;
const demoPath = path.join(rootPath, demoName);

if (demoName) {

  try {
    if (fs.statSync(demoPath).isDirectory()) {
      sh.info(`Building ${demoName}...`);
      sh.exec('npm', ['run', 'build'], {cwd: demoPath})
        .then(() => sh.success(`${demoName} successfully built !\n`));
    } else {
      sh.error(`${demoName} isn't a directory.`);
    }
  } catch (e) {
    sh.error(e);
  }
} else {
  sh.error(`Error: No demo folder defined.`);
  sh.info('Usage:\nnpm run build -- demoName');
}