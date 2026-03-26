const fs = require('fs');
const path = require('path');

const replacements = [
  { regex: /#667eea/gi, replacement: '#3D1E0B' },
  { regex: /#5568d3/gi, replacement: '#291407' },
  { regex: /#764ba2/gi, replacement: '#5C3215' },
  { regex: /102,\s*126,\s*234/g, replacement: '61,30,11' },
  { regex: /102\s+126\s+234/g, replacement: '61 30 11' },
  { regex: /118,\s*75,\s*162/g, replacement: '92,50,21' },
  { regex: /118\s+75\s+162/g, replacement: '92 50 21' }
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === 'dist' || file.startsWith('.')) continue;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else {
      if (['.css', '.js', '.jsx', '.html', '.json', '.svg'].includes(path.extname(fullPath))) {
        let content = fs.readFileSync(fullPath, 'utf8');
        let newContent = content;
        for (const { regex, replacement } of replacements) {
          newContent = newContent.replace(regex, replacement);
        }
        if (content !== newContent) {
          fs.writeFileSync(fullPath, newContent, 'utf8');
          console.log(`Updated: ${fullPath}`);
        }
      }
    }
  }
}

processDirectory('./client');