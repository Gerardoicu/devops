const fs = require('fs');
const path = require('path');

const sourcePath = path.join(__dirname, '..', '..', 'data', 'question_bank.json');
const outputPath = path.join(__dirname, '..', 'public', 'assets', 'simulator-bank.json');

const raw = fs.readFileSync(sourcePath, 'utf8').replace(/^\uFEFF/, '');
const bank = JSON.parse(raw);

const cleaned = bank.map((item) => {
  const correctAnswers = Array.isArray(item.correct_answers)
    ? item.correct_answers
    : String(item.correct_answers)
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);

  return {
    id: item.id,
    questionType: item.question_type,
    question: item.question,
    options: item.options,
    correctAnswers,
    explanation: item.explanation,
    domainName: item.domain_name ?? null,
    topic: item.topic ?? null,
  };
});

fs.writeFileSync(outputPath, `${JSON.stringify(cleaned, null, 2)}\n`, 'utf8');
console.log(`Simulator bank exported: ${cleaned.length} questions`);
