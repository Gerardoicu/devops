const fs = require('fs');
const path = require('path');

function readJson(relativePath) {
  return JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', '..', relativePath), 'utf8').replace(/^\uFEFF/, '')
  );
}

function normalizeAnswers(value) {
  if (Array.isArray(value)) {
    return value;
  }

  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function auditBank(bank, fileLabel) {
  const stats = {
    file: fileLabel,
    total: bank.length,
    single: 0,
    multi: 0,
    emptyQuestion: 0,
    missingExplanation: 0,
    invalidAnswers: 0,
  };

  const issues = [];

  for (const question of bank) {
    if (question.questionType === 'single') {
      stats.single += 1;
    } else if (question.questionType === 'multi') {
      stats.multi += 1;
    } else {
      issues.push({ id: question.id, issue: `questionType invalido: ${question.questionType}` });
    }

    if (!question.question || !question.question.trim()) {
      stats.emptyQuestion += 1;
      issues.push({ id: question.id, issue: 'question vacia' });
    }

    if (!question.explanation || !question.explanation.trim()) {
      stats.missingExplanation += 1;
      issues.push({ id: question.id, issue: 'explanation vacia' });
    }

    for (const answer of normalizeAnswers(question.correctAnswers)) {
      if (!question.options || !question.options[answer]) {
        stats.invalidAnswers += 1;
        issues.push({ id: question.id, issue: `respuesta ${answer} no existe en options` });
      }
    }
  }

  return { stats, issues };
}

function auditTranslation(sourceBank, translatedBank, fileLabel) {
  const issues = [];

  if (sourceBank.length !== translatedBank.length) {
    issues.push({
      issue: `longitud distinta: source=${sourceBank.length}, translated=${translatedBank.length}`,
    });
  }

  for (let index = 0; index < Math.min(sourceBank.length, translatedBank.length); index += 1) {
    const source = sourceBank[index];
    const translated = translatedBank[index];

    if (source.id !== translated.id) {
      issues.push({ id: source.id, issue: `${fileLabel}: id distinto u orden alterado` });
    }
    if (source.questionType !== translated.questionType) {
      issues.push({ id: source.id, issue: `${fileLabel}: questionType distinto` });
    }
    if (JSON.stringify(source.correctAnswers) !== JSON.stringify(translated.correctAnswers)) {
      issues.push({ id: source.id, issue: `${fileLabel}: correctAnswers distintas` });
    }
    if (JSON.stringify(Object.keys(source.options ?? {})) !== JSON.stringify(Object.keys(translated.options ?? {}))) {
      issues.push({ id: source.id, issue: `${fileLabel}: option keys distintas` });
    }
  }

  return {
    file: fileLabel,
    sourceCount: sourceBank.length,
    translatedCount: translatedBank.length,
    mismatchCount: issues.length,
    sample: issues.slice(0, 10),
  };
}

const sourceBank = readJson('data/question_bank.json');
const verifiedBank = readJson('study-app/public/assets/simulator-bank.json');
const verifiedBankEn = readJson('study-app/public/assets/simulator-bank.en.json');
const publicBank = readJson('study-app/public/assets/simulator-bank-public.json');
const updatedBank = readJson('study-app/public/assets/simulator-bank-updated.json');
const updatedBankEn = readJson('study-app/public/assets/simulator-bank-updated.en.json');

const verifiedIssues = [];

if (sourceBank.length !== verifiedBank.length) {
  verifiedIssues.push({
    issue: `longitud distinta: source=${sourceBank.length}, verified=${verifiedBank.length}`,
  });
}

for (let index = 0; index < Math.min(sourceBank.length, verifiedBank.length); index += 1) {
  const source = sourceBank[index];
  const verified = verifiedBank[index];
  const sourceAnswers = normalizeAnswers(source.correct_answers);

  if (source.id !== verified.id) {
    verifiedIssues.push({ id: source.id, issue: 'id distinto u orden alterado' });
  }

  if (source.question !== verified.question) {
    verifiedIssues.push({ id: source.id, issue: 'question distinta' });
  }

  if (JSON.stringify(source.options) !== JSON.stringify(verified.options)) {
    verifiedIssues.push({ id: source.id, issue: 'options distintas' });
  }

  if (JSON.stringify(sourceAnswers) !== JSON.stringify(verified.correctAnswers)) {
    verifiedIssues.push({
      id: source.id,
      issue: 'correctAnswers distintas',
      source: sourceAnswers,
      verified: verified.correctAnswers,
    });
  }

  if ((source.explanation || '') !== (verified.explanation || '')) {
    verifiedIssues.push({ id: source.id, issue: 'explanation distinta' });
  }
}

const verifiedAudit = auditBank(verifiedBank, 'simulator-bank.json');
const verifiedEnAudit = auditBank(verifiedBankEn, 'simulator-bank.en.json');
const publicAudit = auditBank(publicBank, 'simulator-bank-public.json');
const updatedAudit = auditBank(updatedBank, 'simulator-bank-updated.json');
const updatedEnAudit = auditBank(updatedBankEn, 'simulator-bank-updated.en.json');

console.log(
  JSON.stringify(
    {
      verifiedMirror: {
        sourceCount: sourceBank.length,
        simulatorCount: verifiedBank.length,
        mismatchCount: verifiedIssues.length,
        sample: verifiedIssues.slice(0, 10),
      },
      verifiedStructure: verifiedAudit.stats,
      verifiedStructureIssues: verifiedAudit.issues.slice(0, 10),
      verifiedEnglishStructure: verifiedEnAudit.stats,
      verifiedEnglishStructureIssues: verifiedEnAudit.issues.slice(0, 10),
      verifiedEnglishMirror: auditTranslation(verifiedBank, verifiedBankEn, 'simulator-bank.en.json'),
      publicStructure: publicAudit.stats,
      publicStructureIssues: publicAudit.issues.slice(0, 10),
      updatedStructure: updatedAudit.stats,
      updatedStructureIssues: updatedAudit.issues.slice(0, 10),
      updatedEnglishStructure: updatedEnAudit.stats,
      updatedEnglishStructureIssues: updatedEnAudit.issues.slice(0, 10),
      updatedEnglishMirror: auditTranslation(updatedBank, updatedBankEn, 'simulator-bank-updated.en.json'),
    },
    null,
    2
  )
);
