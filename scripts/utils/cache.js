const path  = require('path');
const fs    = require('fs-extra');
const spawn = require('child_process').spawn;

const copyOptions = {
  clobber: true,
  dereference: false,
  preserveTimestamps: true
}

function remove(cachePath) {
  return new Promise((resolve, reject) => {
    fs.remove(cachePath, err => err ? reject(err) : resolve());
  })
}

function create(cachePath) {
  return new Promise((resolve, reject) => {
    fs.mkdirp(cachePath, err => err ? reject(err) : resolve());
  })
}

function getRemoteGit() {
  let stdout = '';
  let stderr = '';
  return new Promise((resolve, reject) => {
    const child = spawn('git', ['config', '--get', 'remote.origin.url']);
    child.stdout.on('data', (data) => { stdout += data.toString(); });
    child.stderr.on('data', (data) => { stderr += data.toString(); });
    child.on('error', () => reject(stderr));
    child.on('close', code => (code === 0) ? resolve(stdout.trim()) : reject(new Error(code)));
  });
}

function getRepoPath(cachePath) {
  return new Promise((resolve, reject) => {
    fs.readdir(cachePath, (err, data) => {
      if (err) return reject(err);
      return data[0] ? resolve(path.join(cachePath, data[0])) : reject('Repo directory not found.')
    });
  });
}

function removeDemo(demoName, cacheRepoPath) {
  return new Promise((resolve, reject) => {
    fs.remove(path.join(cacheRepoPath, demoName), err => err ? reject(err) : resolve());
  });
}

function copyDemoFiles(demoName, demoPath, cacheRepoPath) {
  cacheDemoPath = path.join(cacheRepoPath, demoName);
  return new Promise((resolve, reject) => {
    try {
      fs.copySync(path.join(demoPath, 'example'), cacheDemoPath, copyOptions);
      fs.copySync(path.join(demoPath, 'package.json'), path.join(cacheDemoPath, 'package.json'), copyOptions);
      resolve();
    } catch(e) { reject(e); }
  });
}

module.exports = {
  remove,
  create,
  getRemoteGit,
  getRepoPath,
  removeDemo,
  copyDemoFiles
}