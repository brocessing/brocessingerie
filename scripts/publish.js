const path  = require('path');
const fs    = require('fs-extra');
const sh    = require('kool-shell');
const demo  = require('./utils/demo');
const cache = require('./utils/cache');

const rootPath = path.join(__dirname, '..');
const cachePath = path.join(rootPath, '.cache');
const demoName = process.argv[2] || '';
const demoPath = path.join(rootPath, demoName);
const commitMessage = process.argv[3] || `💪 ${demoName}`;

let cacheRepoPath = '';

demo.nameValid(demoName)
  .then(() => demo.exists(demoName))
  .then(() => sh.exec('npm', ['run', 'build', '--', demoName]))
  .then(() => cache.remove(cachePath))
  .then(() => cache.create(cachePath))
  .then(() => cache.getRemoteGit())
  .then((url) => sh.exec('git', ['clone', '-b', 'master', url], {cwd: cachePath}))
  .then(() => cache.getRepoPath(cachePath))
  .then((repoPath) => { cacheRepoPath = repoPath })
  .then(() => cache.removeDemo(demoName, cacheRepoPath))
  .then(() => cache.copyDemoFiles(demoName, demoPath, cacheRepoPath))
  .then(() => sh.exec('node', ['update'], {cwd: cacheRepoPath} ))
  .then(() => sh.exec('git', ['add', '-A'], {cwd: cacheRepoPath} ))
  .then(() => sh.exec('git', ['commit', '-m', commitMessage], {cwd: cacheRepoPath}))
  .catch(e => '') //mute error if there is nothing to commit
  .then(() => sh.exec('git', ['push', 'origin', 'master'], {cwd: cacheRepoPath}))
  .then(() => cache.remove(cachePath))
  .catch(e => sh.error(e).exit(0)) //exit with 0 even if this is an error. We don't want NPM Errors here