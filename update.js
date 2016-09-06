const fs  = require('fs');
const path  = require('path');

const rootPath = path.join(__dirname);
const indexPath = path.join(rootPath, 'index.html');
const replaceRegex = /(<ul>)([^]*)(<\/ul>)/;
const blacklistedDirs = ['.git', 'node_modules'];

let projectList = '';

function loadProjectInfos(dir) {
  let project = {};
  try {
    const package = require(path.join(rootPath, dir, 'package.json'));
    project.name = package.name || 'Untitled';
    project.description = package.description;
    project.folder = dir;
    projectList += template(project);
  } catch (e) {
    return false
  }
}

function template(props) {
  return(`
        <li><a href="/${props.folder}">${props.name}</a></li>`);
}

try {
  fs.readdirSync(rootPath).forEach(file => (
    fs.statSync(path.join(rootPath, file)).isDirectory()
    && blacklistedDirs.indexOf(file) < 0
    && loadProjectInfos(file)
  ));
  const newIndex = fs.readFileSync(indexPath, 'utf8')
                  .replace(replaceRegex, ('$1' + projectList + '\n    $3'))
  fs.writeFileSync(indexPath, newIndex);
  console.log('brocessing.github.io > Projects list updated.');
} catch (e) {
  console.log(e);
}