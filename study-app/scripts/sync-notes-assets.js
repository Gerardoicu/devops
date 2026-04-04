const fs = require('fs');
const path = require('path');

const notesDir = path.join(__dirname, '..', '..', 'notes');
const outputDir = path.join(__dirname, '..', 'public', 'assets', 'notes');
const indexPath = path.join(__dirname, '..', 'public', 'assets', 'notes-index.json');

fs.mkdirSync(outputDir, { recursive: true });

const files = fs
  .readdirSync(notesDir)
  .filter((file) => file.toLowerCase().endsWith('.md'))
  .sort((a, b) => a.localeCompare(b, 'es'));

const index = files.map((file) => {
  const sourcePath = path.join(notesDir, file);
  const content = fs.readFileSync(sourcePath, 'utf8').replace(/^\uFEFF/, '');
  const targetPath = path.join(outputDir, file);
  fs.writeFileSync(targetPath, content, 'utf8');

  return {
    id: file.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    title: file.replace(/\.md$/i, ''),
    fileName: file,
  };
});

fs.writeFileSync(indexPath, `${JSON.stringify(index, null, 2)}\n`, 'utf8');
console.log(`Notes synced: ${index.length}`);
