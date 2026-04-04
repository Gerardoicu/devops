const fs = require('fs');
const path = require('path');

const cardsPath = path.join(__dirname, '..', 'public', 'assets', 'cards.json');
const cards = JSON.parse(fs.readFileSync(cardsPath, 'utf8'));

function replaceCard(id, updater) {
  const index = cards.findIndex((card) => card.id === id);
  if (index >= 0) {
    cards[index] = updater(cards[index]);
  }
}

replaceCard('decision-less-pieces', (card) => ({
  ...card,
  prompt: 'Si dos respuestas pueden funcionar y una cumple exacto con menos overhead, cual suele ganar?',
  explanation:
    'En DOP-C02 suele ganar la opcion mas simple cuando cumple exacto el requisito. No significa que siempre gane la mas corta, sino la menos sobreingenierizada.'
}));

replaceCard('decision-global-low-latency-serverless', (card) => ({
  ...card,
  tags: card.tags.filter((tag) => tag !== 'ci-cd')
}));

replaceCard('decision-stepfunctions-api', (card) => ({
  ...card,
  tags: card.tags.filter((tag) => tag !== 'ci-cd').concat('security')
}));

replaceCard('learn-trusted-advisor-core', (card) => ({
  ...card,
  body: 'Piensa en underutilized EC2 o checks administrados ya existentes. No lo confundas con enforcement continuo ni con observabilidad operativa fina.'
}));

fs.writeFileSync(cardsPath, `${JSON.stringify(cards, null, 2)}\n`, 'utf8');
console.log('Final content tune applied');
