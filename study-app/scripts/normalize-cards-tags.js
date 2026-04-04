const fs = require('fs');
const path = require('path');

const cardsPath = path.join(__dirname, '..', 'public', 'assets', 'cards.json');
const raw = fs.readFileSync(cardsPath, 'utf8');
let cards = JSON.parse(raw);

const dropIds = new Set([
  'decision-branch-source-vs-approval',
  'decision-beanstalk-cname',
]);

const renameTags = {
  ondemand: 'on-demand',
  deletionpolicy: 'deletion-policy',
};

const conceptTagsById = {
  'decision-logs-alert': ['cloudwatch-logs', 'metric-filter', 'cloudwatch-alarm', 'sns'],
  'learn-provisioned-concurrency': ['provisioned-concurrency', 'reserved-concurrency'],
  'mini-quiz-cold-start': ['provisioned-concurrency', 'reserved-concurrency'],
  'decision-cross-account-eks': ['assume-role', 'aws-auth', 'sts'],
  'compare-metric-alarm': ['metric', 'alarm', 'cloudwatch-alarm'],
  'decision-branch-source': ['source-branch'],
  'learn-pilot-light': ['pilot-light', 'warm-standby', 'backup-restore', 'active-active'],
  'mini-quiz-dr': ['pilot-light', 'warm-standby', 'backup-restore', 'active-active'],
  'decision-beanstalk': ['blue-green', 'cname-swap'],
  'decision-autoscaling-raro': ['scale-in', 'scale-out', 'mixed-instances-policy', 'rebalancing', 'on-demand'],
  'mini-quiz-before-allow-traffic': ['before-allow-traffic', 'before-install', 'after-allow-test-traffic'],
  'decision-trusted-advisor': ['low-effort'],
  'compare-key-policy-iam': ['key-policy', 'iam-policy'],
  'learn-cloudformation-core': ['change-set', 'drift-detection'],
  'decision-retain-import': ['deletion-policy'],
  'learn-s3objectversion': ['s3objectversion'],
  'learn-ssm-operations': ['systems-manager', 'ssm-automation'],
  'mini-quiz-ssm-ops': ['systems-manager', 'ssm-automation'],
  'learn-secrets': ['secrets-manager'],
  'learn-rds-replica': ['read-replica', 'backup-restore'],
  'learn-organizations-controltower': ['control-tower'],
  'learn-route53-policies': ['failover-routing', 'weighted-routing', 'latency-based-routing', 'geolocation-routing'],
  'compare-pilotlight-warmstandby': ['pilot-light', 'warm-standby'],
  'compare-spot-ondemand': ['spot', 'on-demand', 'scale-in', 'scale-out'],
  'learn-xray': ['tracing'],
  'learn-dashboard-vs-alert': ['cloudwatch-alarm'],
  'learn-alb-target-groups': ['target-group', 'health-checks', 'traffic-shifting'],
  'learn-transit-gateway-firewall-logs': ['firewall-logs', 'flow-logs'],
  'mini-quiz-transit-gateway': ['cloudwatch-logs', 'metric-filter', 'cloudwatch-alarm', 'firewall-logs'],
  'compare-assumerole-saml': ['assume-role', 'assume-role-with-saml'],
  'compare-deletionpolicy-retain-snapshot': ['deletion-policy', 'snapshot'],
  'learn-custom-resource-drift': ['custom-resource', 'drift-detection'],
  'compare-scheduled-target-tracking': ['scheduled-scaling', 'target-tracking'],
  'decision-spotfleet-target-tracking': ['target-tracking', 'spot-fleet'],
  'decision-firewall-manager-waf': ['firewall-manager', 'waf'],
  'decision-global-low-latency-serverless': ['latency-based-routing', 'global-tables'],
  'decision-aurora-reader-endpoint': ['read-replica', 'reader-endpoint'],
  'decision-kinesis-reliability': ['millis-behind-latest', 'retention'],
  'learn-cloudtrail-org-trail': ['organization-trails'],
  'learn-ecr-image-immutability': ['image-digest'],
  'compare-tag-vs-digest': ['image-digest'],
  'learn-cloudfront-invalidation': ['cloudfront-invalidation'],
  'decision-stacksets-service-managed': ['service-managed-permissions'],
  'decision-update-rollback-failed': ['update-rollback-failed'],
  'decision-cloudfront-sdk-refresh': ['cloudfront-invalidation'],
  'decision-ecs-bluegreen-pipeline': ['blue-green'],
  'learn-codedeploy-agent-ec2': ['codedeploy-agent'],
  'decision-dual-alb-minimal-cost': ['dns-cache', 'traffic-shifting'],
  'decision-centralized-cloudwatch-logs': ['cloudwatch-logs', 'subscription-filter'],
  'decision-stepfunctions-backup-audit': ['orchestration'],
};

const systemMatchers = {
  'ci-cd': new Set([
    'codepipeline',
    'codebuild',
    'codecommit',
    'codedeploy',
    'beanstalk',
    'deployment',
    'deployments',
    'branching',
    'source-branch',
    'ecs',
    'ecr',
    'image-digest',
    'blue-green',
    'worker-tier',
    'cname-swap',
    'api-gateway',
    'codedeploy-agent',
  ]),
  iac: new Set([
    'cloudformation',
    'stacksets',
    'iac',
    'deletion-policy',
    'retain',
    'snapshot',
    'import',
    'change-set',
    'drift-detection',
    'custom-resource',
    's3objectversion',
    'service-managed-permissions',
    'ami',
  ]),
  resilience: new Set([
    'dr',
    'rto',
    'rpo',
    'pilot-light',
    'warm-standby',
    'backup-restore',
    'active-active',
    'route53',
    'failover-routing',
    'weighted-routing',
    'latency-based-routing',
    'alb',
    'target-group',
    'health-checks',
    'traffic-shifting',
    'asg',
    'autoscaling',
    'scale-in',
    'scale-out',
    'spot',
    'on-demand',
    'mixed-instances-policy',
    'rebalancing',
    'rds',
    'aurora',
    'read-replica',
    'reader-endpoint',
    'dynamodb',
    'global-tables',
    'kinesis',
    'spot-fleet',
    'lifecycle-hook',
    'dns-cache',
    'backup',
    'ebs',
  ]),
  observability: new Set([
    'cloudwatch',
    'cloudwatch-logs',
    'metric-filter',
    'metric',
    'alarm',
    'cloudwatch-alarm',
    'logs',
    'alerts',
    'central-logging',
    'subscription-filter',
    'xray',
    'tracing',
    'dashboards',
    'contributor-insights',
    'metric-math',
  ]),
  operations: new Set([
    'eventbridge',
    'sns',
    'ssm',
    'systems-manager',
    'ssm-automation',
    'patch-manager',
    'state-manager',
    'step-functions',
    'orchestration',
    'glue',
    'trusted-advisor',
    'low-effort',
    'lifecycle-hook',
  ]),
  security: new Set([
    'config',
    'compliance',
    'cloudtrail',
    'organizations',
    'control-tower',
    'service-catalog',
    'iam',
    'iam-policy',
    'sts',
    'assume-role',
    'assume-role-with-saml',
    'cross-account',
    'eks',
    'aws-auth',
    'kms',
    'key-policy',
    'guardduty',
    'inspector',
    'secrets-manager',
    'parameter-store',
    'transit-gateway',
    'firewall-manager',
    'waf',
    'cloudtrail',
    'organization-trails',
  ]),
};

const requiredConceptTags = [
  'config',
  'eventbridge',
  'cloudwatch',
  'sns',
  'trusted-advisor',
  'ssm-automation',
  'codedeploy',
  'beanstalk',
  'codepipeline',
  'codebuild',
  'codecommit',
  'provisioned-concurrency',
  'reserved-concurrency',
  'eks',
  'assume-role',
  'aws-auth',
  'cloudformation',
  'stacksets',
  'iam',
  'sts',
  'kms',
  'key-policy',
  's3',
  's3objectversion',
  'cloudtrail',
  'rds',
  'aurora',
  'read-replica',
  'ecs',
  'ecr',
  'dynamodb',
  'organizations',
  'control-tower',
  'route53',
  'alb',
  'api-gateway',
  'step-functions',
  'guardduty',
  'inspector',
  'secrets-manager',
  'parameter-store',
  'transit-gateway',
  'scale-in',
  'scale-out',
  'spot',
  'on-demand',
  'mixed-instances-policy',
  'rebalancing',
  'pilot-light',
  'warm-standby',
  'backup-restore',
  'active-active',
  'metric-filter',
  'cloudwatch-alarm',
  'managed',
  'custom',
  'scheduled-scaling',
  'target-tracking',
  'before-install',
  'before-allow-traffic',
];

function uniqueOrdered(values) {
  const seen = new Set();
  const result = [];
  for (const value of values) {
    if (!value || seen.has(value)) {
      continue;
    }
    seen.add(value);
    result.push(value);
  }
  return result;
}

cards = cards.filter((card) => !dropIds.has(card.id));

for (const card of cards) {
  card.tags = uniqueOrdered(
    card.tags
      .map((tag) => renameTags[tag] || tag)
      .concat(conceptTagsById[card.id] || []),
  );

  const tagSet = new Set(card.tags);
  const systemTags = [];
  for (const [system, matcher] of Object.entries(systemMatchers)) {
    for (const tag of tagSet) {
      if (matcher.has(tag)) {
        systemTags.push(system);
        break;
      }
    }
  }

  if (!systemTags.length) {
    systemTags.push('operations');
  }

  card.tags = uniqueOrdered(card.tags.concat(systemTags));

  if (typeof card.prompt === 'string') {
    card.prompt = card.prompt.replace(/seÃ±ales/g, 'senales');
  }
  if (typeof card.body === 'string') {
    card.body = card.body.replace(/seÃ±ales/g, 'senales');
  }
  if (typeof card.explanation === 'string') {
    card.explanation = card.explanation.replace(/seÃ±ales/g, 'senales');
  }
}

fs.writeFileSync(cardsPath, `${JSON.stringify(cards, null, 2)}\n`, 'utf8');

const tagCounts = new Map();
for (const card of cards) {
  for (const tag of card.tags) {
    tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
  }
}

const missingConcepts = requiredConceptTags.filter((tag) => !tagCounts.has(tag));
const systemSummary = ['ci-cd', 'iac', 'resilience', 'observability', 'operations', 'security']
  .map((tag) => `${tag}: ${tagCounts.get(tag) || 0}`)
  .join(', ');

console.log(`Cards: ${cards.length}`);
console.log(`Systems -> ${systemSummary}`);
console.log(`Missing required concept tags: ${missingConcepts.length ? missingConcepts.join(', ') : 'none'}`);
