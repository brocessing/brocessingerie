const path     = require('path');
const fs       = require('fs-extra');
const sh       = require('kool-shell');
const rootPath = path.join(__dirname, '..', '..');

function nameValid(demoName) {
  return new Promise((resolve, reject) => {
    if (!demoName) return reject('No demo name given.');
    resolve();
  });
}

function exists(demoName) {
  const demoPath = path.join(rootPath, demoName);
  return new Promise((resolve, reject) => {
    fs.stat(demoPath, (err, stats) => {
      if (err) return reject(err);
      if (!stats.isDirectory) return reject(`${demoPath} isn't a directory.`);
      resolve();
    });
  });
}

module.exports = {
  nameValid,
  exists
}