const path  = require('path');
const fs    = require('fs-extra');
const sh    = require('kool-shell');

const rootPath = path.join(__dirname, '..');
const demoName = process.argv[2] || null;
const demoPath = path.join(rootPath, demoName);

if (demoName) {
  try {
    if (!fs.existsSync(demoPath)) {
      sh.info(`Creating ${demoName}...`);
      sh.exec('npm', ['update', 'bro-totype'])
        .then(() => sh.exec('node', ['./node_modules/bro-totype/bin/bro-totype.js', demoName], {cwd: rootPath}))
        .then(() => {
          sh.success(`\n${demoName} successfully created !`);
          sh.warning(`To install dependencies to ${demoName}, don't forget to cd to its directory by typing "cd ${demoName}"`);
          sh.info(`Enter "npm run publish -- ${demoName}" to publish your demo to http://brocessing.github.io/\n`);
        });
    } else {
      sh.error(`${demoName} already exists.`);
    }
  } catch (e) {
    sh.error(e);
  }
} else {
  sh.error('Error: No demo name given.');
  sh.info('Usage:\nnpm run create -- demoName');
}