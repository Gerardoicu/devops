const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'public', 'assets', 'simulator-bank-public.json');
let content = fs.readFileSync(filePath, 'utf8');

const replacements = new Map([
  ['Â¿', '¿'],
  ['Ã±', 'ñ'],
  ['Ã¡', 'á'],
  ['Ã©', 'é'],
  ['Ã­', 'í'],
  ['Ã³', 'ó'],
  ['Ãº', 'ú'],
  ['Ã‘', 'Ñ'],
  ['Ã‰', 'É'],
  ['Ã“', 'Ó'],
]);

for (const [bad, good] of replacements.entries()) {
  content = content.split(bad).join(good);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Public simulator encoding fixed');
