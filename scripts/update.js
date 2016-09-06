const path  = require('path');
const fs    = require('fs-extra');
const sh    = require('kool-shell');

const rootPath = path.join(__dirname, '..');
const indexPath = path.join(rootPath, 'index.html');
const replaceRegex = /(<ul>)([^]*)(<\/ul>)/;
const blacklistedDirs = ['.git', 'node_modules', 'scripts'];

let projectList = '';

function loadProjectInfos(dir) {
  let project = {};
  try {
    const package = require(path.join(rootPath, dir, 'package.json'));
    project.name = package.name || 'untitled';
    project.description = package.description;
    project.folder = dir;
    projectList += template(project);
  } catch (e) {
    sh.error(e);
    return false
  }
}

function template(props) {
  return(`
        <li><a href="/${props.folder}">${props.name}</a></li>`);
}


sh.info('Updating index...');

try {
  fs.readdirSync(rootPath).forEach(file => (
    fs.statSync(path.join(rootPath, file)).isDirectory()
    && blacklistedDirs.indexOf(file) < 0
    && loadProjectInfos(file)
  ));

  const newIndex = fs.readFileSync(indexPath, 'utf8')
                  .replace(replaceRegex, ('$1' + projectList + '\n    $3'))

  fs.writeFileSync(indexPath, newIndex);
  sh.success('Index updated !\n');

} catch (e) {
  sh.error(e);
}