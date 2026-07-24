const fs = require('fs');
const os = require('os');
const path = require('path');

const sourceFile = process.argv[2];
const outputFile = process.argv[3];

if (!sourceFile || !outputFile) {
  console.error('Usage: node scripts/translate-simulator-bank.js <source-json> <output-json>');
  process.exit(1);
}

const cachePath = path.join(os.tmpdir(), 'devops-trainer-translation-cache-en.json');
const cache = fs.existsSync(cachePath)
  ? JSON.parse(fs.readFileSync(cachePath, 'utf8').replace(/^\uFEFF/, ''))
  : {};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function splitText(text, maxLength = 3200) {
  if (text.length <= maxLength) {
    return [text];
  }

  const chunks = [];
  const paragraphs = text.split(/(\n{2,})/);
  let current = '';

  for (const paragraph of paragraphs) {
    if ((current + paragraph).length <= maxLength) {
      current += paragraph;
      continue;
    }

    if (current.trim()) {
      chunks.push(current);
      current = '';
    }

    if (paragraph.length <= maxLength) {
      current = paragraph;
      continue;
    }

    for (let index = 0; index < paragraph.length; index += maxLength) {
      chunks.push(paragraph.slice(index, index + maxLength));
    }
  }

  if (current.trim()) {
    chunks.push(current);
  }

  return chunks;
}

async function translateChunk(text) {
  const key = `es->en:${text}`;
  if (cache[key]) {
    return cache[key];
  }

  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=es&tl=en&dt=t&q=${encodeURIComponent(text)}`;
  let lastError = null;

  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const payload = await response.json();
      const translated = (payload[0] ?? []).map((entry) => entry[0]).join('');
      cache[key] = translated;
      fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2), 'utf8');
      await sleep(120);
      return translated;
    } catch (error) {
      lastError = error;
      await sleep(500 * attempt);
    }
  }

  throw lastError;
}

async function translateText(text) {
  if (!text || !text.trim()) {
    return text;
  }

  const chunks = splitText(text);
  const translated = [];

  for (const chunk of chunks) {
    translated.push(await translateChunk(chunk));
  }

  return translated.join('');
}

async function translateQuestion(question, index, total) {
  const options = {};
  const optionKeys = Object.keys(question.options ?? {});

  for (const key of optionKeys) {
    options[key] = await translateText(question.options[key]);
  }

  const translated = {
    ...question,
    question: await translateText(question.question),
    options,
    explanation: await translateText(question.explanation),
  };

  if (JSON.stringify(question.correctAnswers) !== JSON.stringify(translated.correctAnswers)) {
    throw new Error(`Question ${question.id}: correctAnswers changed during translation`);
  }

  for (const answer of translated.correctAnswers) {
    if (!translated.options[answer]) {
      throw new Error(`Question ${question.id}: answer ${answer} missing after translation`);
    }
  }

  process.stdout.write(`\rTranslated ${index + 1}/${total}`);
  return translated;
}

async function main() {
  const source = JSON.parse(fs.readFileSync(sourceFile, 'utf8').replace(/^\uFEFF/, ''));
  const translated = [];

  for (let index = 0; index < source.length; index += 1) {
    translated.push(await translateQuestion(source[index], index, source.length));
  }

  fs.writeFileSync(outputFile, `${JSON.stringify(translated, null, 2)}\n`, 'utf8');
  console.log(`\nEnglish simulator bank exported: ${translated.length} questions`);
}

main().catch((error) => {
  console.error(`\nTranslation failed: ${error.message}`);
  process.exit(1);
});
