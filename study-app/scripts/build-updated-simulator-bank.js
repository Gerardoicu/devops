const fs = require('fs');
const path = require('path');

const defaultSourcePath = path.join(process.env.TEMP || '', 'aws-dop-c02-updated.txt');
const sourcePath = process.argv[2] || defaultSourcePath;
const outputPath = path.join(__dirname, '..', 'public', 'assets', 'simulator-bank-updated.json');

function normalizeText(value) {
  return value
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/^AWS DOP-C02 - Versión de estudio Página \d+\n/gm, '')
    .replace(/^-- \d+ of \d+ --\n?/gm, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function compact(value) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n')
    .trim();
}

function parseOptions(rawOptions, questionNumber) {
  const optionPattern = /^([A-F])\.\s+/gm;
  const matches = [...rawOptions.matchAll(optionPattern)];

  if (!matches.length) {
    throw new Error(`Question ${questionNumber}: no options found`);
  }

  const options = {};

  for (let index = 0; index < matches.length; index += 1) {
    const current = matches[index];
    const next = matches[index + 1];
    const key = current[1];
    const start = current.index + current[0].length;
    const end = next ? next.index : rawOptions.length;
    options[key] = compact(rawOptions.slice(start, end));
  }

  return options;
}

function parseKeywords(rawBlock) {
  const match = rawBlock.match(/KEYWORDS:\s*([\s\S]*?)\nRESPUESTAS/);
  if (!match) {
    return null;
  }

  const keywords = compact(match[1])
    .replace(/\n/g, ' ')
    .split('·')
    .map((item) => item.trim())
    .filter(Boolean);

  return keywords.find((item) => !/^MOST |^MUST |^TWO |^THREE |^LEAST /.test(item)) ?? keywords[0] ?? null;
}

function classifyDomain(topic) {
  const normalized = String(topic || '').toUpperCase();
  const byTopic = {
    'DYNAMODB STREAMS': 'Incident and Event Response',
    'REAL-TIME REPORTS': 'Resilient Cloud Solutions',
    'INTERNAL VS EXTERNAL': 'Security and Compliance',
    'MULTI-REGION': 'Security and Compliance',
    'ROOT USER LOGIN': 'Monitoring and Logging',
    'SIX REGIONS': 'Resilient Cloud Solutions',
    'EC2 REPLACED': 'Incident and Event Response',
    'ROTATE EVERY 90 DAYS': 'Security and Compliance',
    'REPEAT REQUESTS': 'Resilient Cloud Solutions',
    'COMPUTE-INTENSIVE': 'Resilient Cloud Solutions',
    CODEDEPLOY: 'SDLC Automation',
    'ENFORCE IMDSV2': 'Security and Compliance',
    'ASG TERMINATES EC2': 'Incident and Event Response',
    'ARCHIVE LONG TERM': 'Configuration Management and IaC',
    ECS: 'SDLC Automation',
    'EXISTING ACCOUNT': 'Configuration Management and IaC',
    'ON-PREMISES OUTAGE': 'Resilient Cloud Solutions',
    GUARDDUTY: 'Security and Compliance',
    'OUTBOUND BANDWIDTH': 'Resilient Cloud Solutions',
    'NOT DIRECTLY ACCESSIBLE': 'Security and Compliance',
    'STANDBY DR': 'Resilient Cloud Solutions',
    'S3 FILE UPDATE': 'Incident and Event Response',
    'UNAUTHORIZED MODIFICATIONS': 'Configuration Management and IaC',
    'NEW IAM USERS': 'Security and Compliance',
    'SINGLE SERVER AT A TIME': 'SDLC Automation',
    'DEVELOPMENT OU': 'Security and Compliance',
    CI: 'SDLC Automation',
    'CONFIG + GUARDDUTY': 'Security and Compliance',
    'LAMBDA EOL RUNTIME': 'Configuration Management and IaC',
    'KINESIS PROVISIONED': 'Monitoring and Logging',
    ECR: 'Security and Compliance',
    'API LATENCY': 'Monitoring and Logging',
    'S3 RAW DATA': 'Incident and Event Response',
    ORGANIZATIONS: 'Monitoring and Logging',
    'PACKAGE PUBLISHED': 'SDLC Automation',
    'CLOUDWATCH ALARM': 'Incident and Event Response',
    'CODEBUILD TEST REPORTS': 'SDLC Automation',
    'CLOUDWATCH LOGS TELEMETRY': 'Monitoring and Logging',
    'ELASTIC BEANSTALK': 'SDLC Automation',
    'BEGINNERS RESTRICTED': 'Security and Compliance',
    'REDIS CLUSTER MODE': 'Resilient Cloud Solutions',
    'USER-AGENT VERSION': 'SDLC Automation',
    'MIXED JSON AND CSV': 'Monitoring and Logging',
    'TRUSTED ADVISOR': 'Incident and Event Response',
    'ALL ALBS': 'Security and Compliance',
    STACKSETS: 'Configuration Management and IaC',
    'EXPOSED ACCESS KEYS': 'Security and Compliance',
    CODEPIPELINE: 'SDLC Automation',
    'LONG-RUNNING IMPORT': 'SDLC Automation',
    'IAM USER UNUSED 90 DAYS': 'Security and Compliance',
    'UNIT TESTS': 'SDLC Automation',
    'EC2 APPLICATION LOGS': 'Monitoring and Logging',
    'ZERO DOWNTIME': 'SDLC Automation',
    'SECURITY GROUP RULE MUST EXIST': 'Security and Compliance',
    'SIMPLE AUTOMATED DEPLOYMENT': 'SDLC Automation',
    'CUSTOM SECURITY PACKAGE': 'Security and Compliance',
    'ALL REQUESTS THROUGH CLOUDFRONT': 'Security and Compliance',
    'ONLY US-EAST-2 AND US-WEST-2': 'Security and Compliance',
    CODEBUILD: 'SDLC Automation',
    '99% SLA': 'Resilient Cloud Solutions',
    'DMS CDC': 'Resilient Cloud Solutions',
    'SERVICE CATALOG': 'Configuration Management and IaC',
    'CONSOLE LOGIN FAILURE': 'Security and Compliance',
    'PACKAGED LIBRARIES': 'SDLC Automation',
    'IMMUTABLE INFRASTRUCTURE': 'Configuration Management and IaC',
    'EC2 SCHEDULED MAINTENANCE': 'Incident and Event Response',
    'THOUSANDS OF HYBRID NODES': 'Configuration Management and IaC',
    'SECURITY SCAN BEFORE DEPLOYMENT': 'SDLC Automation',
    '400 ACCOUNTS': 'Configuration Management and IaC',
    RAM: 'Security and Compliance',
    EFS: 'Security and Compliance',
    'FEDERATED ACCESS': 'Configuration Management and IaC',
  };

  return byTopic[normalized] ?? 'Configuration Management and IaC';
}

function parseQuestion(block) {
  const headerMatch = block.match(/^Pregunta\s+(\d+)\s+·\s+(.+)$/m);
  if (!headerMatch) {
    throw new Error('Question header not found');
  }

  const originalNumber = Number(headerMatch[1]);
  const headerEnd = headerMatch.index + headerMatch[0].length;
  const keywordIndex = block.indexOf('\nKEYWORDS:', headerEnd);
  const answersIndex = block.indexOf('\nRESPUESTAS', headerEnd);
  const correctIndex = block.indexOf('\nRESPUESTA CORRECTA:', headerEnd);
  const explanationIndex = block.indexOf('\nEXPLICACIÓN DE LA RESPUESTA CORRECTA', headerEnd);

  if (keywordIndex === -1 || answersIndex === -1 || correctIndex === -1 || explanationIndex === -1) {
    throw new Error(`Question ${originalNumber}: required section missing`);
  }

  const question = compact(block.slice(headerEnd, keywordIndex));
  const rawOptions = block.slice(answersIndex + '\nRESPUESTAS'.length, correctIndex);
  const answerLine = block.slice(correctIndex, explanationIndex).match(/RESPUESTA CORRECTA:\s*([A-F](?:\s*,\s*[A-F])*)/);
  const explanation = compact(block.slice(explanationIndex + '\nEXPLICACIÓN DE LA RESPUESTA CORRECTA'.length));

  if (!answerLine) {
    throw new Error(`Question ${originalNumber}: correct answer missing`);
  }

  const correctAnswers = answerLine[1].split(',').map((answer) => answer.trim());
  const options = parseOptions(rawOptions, originalNumber);

  for (const answer of correctAnswers) {
    if (!options[answer]) {
      throw new Error(`Question ${originalNumber}: answer ${answer} not present in options`);
    }
  }

  const topic = parseKeywords(block);

  return {
    id: 2000 + originalNumber,
    questionType: headerMatch[2].includes('Selección') ? 'multi' : 'single',
    question,
    options,
    correctAnswers,
    explanation,
    domainName: classifyDomain(topic),
    topic,
  };
}

const raw = fs.readFileSync(sourcePath, 'utf8').replace(/^\uFEFF/, '');
const text = normalizeText(raw);
const starts = [...text.matchAll(/^Pregunta\s+\d+\s+·\s+.+$/gm)].map((match) => match.index);
const questions = starts.map((start, index) => {
  const end = starts[index + 1] ?? text.length;
  return parseQuestion(text.slice(start, end).trim());
});

if (questions.length !== 75) {
  throw new Error(`Expected 75 questions, found ${questions.length}`);
}

fs.writeFileSync(outputPath, `${JSON.stringify(questions, null, 2)}\n`, 'utf8');
console.log(`Updated simulator bank exported: ${questions.length} questions`);
