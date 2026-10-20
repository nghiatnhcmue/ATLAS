const fs = require('fs');

const indexHtml = fs.readFileSync('index.html', 'utf8');
const jsFiles = ['js/app.js', 'js/atlas-engine.js', 'js/chart-trainer.js', 'js/geo-calculator.js'];

const allIdsInJs = [];
jsFiles.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const idRegex = /document\.getElementById\(['"]([^'"]+)['"]\)/g;
  let match;
  while ((match = idRegex.exec(content)) !== null) {
    allIdsInJs.push({ id: match[1], file: f });
  }
});

console.log('Total static IDs queried in JS:', allIdsInJs.length);

const missing = [];
allIdsInJs.forEach(item => {
  const pattern1 = 'id="' + item.id + '"';
  const pattern2 = "id='" + item.id + "'";
  if (!indexHtml.includes(pattern1) && !indexHtml.includes(pattern2)) {
    missing.push(item);
  }
});

console.log('IDs in JS not found directly in index.html:');
missing.forEach(m => console.log(` - [${m.file}] #${m.id}`));

