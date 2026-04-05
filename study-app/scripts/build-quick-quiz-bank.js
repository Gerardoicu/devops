const fs = require('fs');
const path = require('path');

const cardsPath = path.join(__dirname, '..', 'public', 'assets', 'cards.json');
const conceptsPath = path.join(__dirname, '..', 'public', 'assets', 'concept-feed.json');
const glossaryPath = path.join(__dirname, '..', 'public', 'assets', 'glossary.json');
const outputPath = path.join(__dirname, '..', 'public', 'assets', 'quick-quiz-bank.json');

const cards = JSON.parse(fs.readFileSync(cardsPath, 'utf8'));
const concepts = JSON.parse(fs.readFileSync(conceptsPath, 'utf8'));
const glossary = JSON.parse(fs.readFileSync(glossaryPath, 'utf8'));

let nextId = 2001;

const fromCards = cards
  .filter((card) => Array.isArray(card.options) && card.options.length)
  .map((card) => ({
    id: nextId++,
    questionType: 'single',
    question: card.prompt,
    options: Object.fromEntries(card.options.map((option) => [option.id, option.label])),
    correctAnswers: [card.answer],
    explanation: card.explanation,
    domainName: null,
    topic: card.title,
  }));

const topicOverrides = {
  'Config vs EventBridge': {
    question: 'Quieres asegurar cumplimiento continuo de configuracion y detectar NON_COMPLIANT. Que servicio evalua primero el estado?',
    options: {
      A: 'AWS Config',
      B: 'Amazon EventBridge',
      C: 'Amazon CloudWatch',
      D: 'AWS Trusted Advisor'
    },
    correctAnswers: ['A'],
    explanation: 'Config evalua cumplimiento continuo. EventBridge reacciona a eventos puntuales.'
  },
  'Metric vs alarm': {
    question: 'Que elemento de CloudWatch permite tomar una decision operativa como rollback o notificacion automatica?',
    options: {
      A: 'Una metrica sin umbral',
      B: 'Una CloudWatch alarm',
      C: 'Un dashboard',
      D: 'Un log group'
    },
    correctAnswers: ['B'],
    explanation: 'La metrica es el dato; la alarm es la evaluacion accionable que puede disparar rollback o notificacion.'
  },
  'Capa del filtro': {
    question: 'Si ya conoces el evento exacto que quieres procesar, donde suele vivir la logica de filtrado ganadora?',
    options: {
      A: 'Lo mas tarde posible, idealmente en SNS',
      B: 'Lo antes posible, en la capa que ya entiende el evento',
      C: 'Solo en dashboards para no complicar la arquitectura',
      D: 'En una tabla temporal con polling'
    },
    correctAnswers: ['B'],
    explanation: 'En DOP-C02 suele ganar la opcion que filtra antes y en la capa correcta.'
  },
  'Source real del pipeline': {
    question: 'Produccion debe desplegar estrictamente desde production branch. Que define el artefacto real que llega a produccion?',
    options: {
      A: 'La aprobacion manual del stage de produccion',
      B: 'La branch configurada en el source stage',
      C: 'El nombre del environment',
      D: 'La politica de deployment de CodeDeploy'
    },
    correctAnswers: ['B'],
    explanation: 'La aprobacion manual no cambia el artefacto origen. La branch del source stage manda.'
  },
  'Managed vs custom': {
    question: 'Si AWS ya trae una capacidad administrada que cumple exacto y la pregunta pide menor esfuerzo, que suele ganar?',
    options: {
      A: 'La opcion administrada',
      B: 'La opcion custom con Lambda',
      C: 'La opcion con mas componentes para escalar despues',
      D: 'La que implique polling periodico'
    },
    correctAnswers: ['A'],
    explanation: 'Si existe una opcion administrada que cumple exacto, suele ganar sobre la version artesanal.'
  },
  'Recurso exacto': {
    question: 'La regla de cumplimiento exige que un volumen EBS tenga un tag obligatorio. Que recurso debe evaluar Config?',
    options: {
      A: 'AWS::EC2::Instance',
      B: 'AWS::EC2::Volume',
      C: 'AWS::EC2::SecurityGroup',
      D: 'AWS::SSM::Parameter'
    },
    correctAnswers: ['B'],
    explanation: 'El recurso exacto es el volumen. Elegir la instancia es una trampa clasica de scope.'
  },
  'Reserved vs Provisioned': {
    question: 'Que feature de Lambda reduce cold starts en una funcion sensible a latencia?',
    options: {
      A: 'Reserved concurrency',
      B: 'Provisioned concurrency',
      C: 'Lambda Layers',
      D: 'Mas almacenamiento efimero'
    },
    correctAnswers: ['B'],
    explanation: 'Provisioned concurrency mantiene entornos inicializados. Reserved concurrency no elimina cold starts.'
  },
  'Pilot Light vs Warm Standby': {
    question: 'Entre Pilot Light y Warm Standby, cual suele ser mas rapido pero mas caro?',
    options: {
      A: 'Backup and Restore',
      B: 'Pilot Light',
      C: 'Warm Standby',
      D: 'Active/Active siempre'
    },
    correctAnswers: ['C'],
    explanation: 'Warm Standby mantiene un entorno mas listo para escalar rapido, a costa de mas dinero.'
  },
  'Spot vs On-Demand': {
    question: 'Que tipo de capacidad EC2 suele ser mas barata pero puede ser interrumpida por AWS?',
    options: {
      A: 'On-Demand',
      B: 'Spot',
      C: 'Dedicated Hosts',
      D: 'Savings Plans'
    },
    correctAnswers: ['B'],
    explanation: 'Spot usa capacidad sobrante con descuento, pero AWS puede recuperarla.'
  },
  'Tag vs digest': {
    question: 'Que referencia de imagen de contenedor es inmutable y evita ambiguedad entre despliegues?',
    options: {
      A: 'Tag latest',
      B: 'Tag semantic version mutable',
      C: 'Digest de imagen',
      D: 'Nombre del repositorio'
    },
    correctAnswers: ['C'],
    explanation: 'El digest identifica de forma inmutable el artefacto exacto. Los tags pueden moverse.'
  },
  'CodePipeline': {
    question: 'Que servicio orquesta los stages de CI/CD entre source, build, test y deploy?',
    options: {
      A: 'CodeBuild',
      B: 'CodePipeline',
      C: 'CodeCommit',
      D: 'CodeDeploy'
    },
    correctAnswers: ['B'],
    explanation: 'CodePipeline orquesta; CodeBuild compila; CodeCommit aloja codigo; CodeDeploy despliega.'
  },
  'KMS': {
    question: 'En KMS, que pieza decide principalmente quien puede usar una clave, ademas de IAM?',
    options: {
      A: 'Target group',
      B: 'Key policy',
      C: 'CloudWatch Logs Insights',
      D: 'Security group'
    },
    correctAnswers: ['B'],
    explanation: 'En problemas de acceso con KMS debes revisar la key policy y no solo IAM.'
  }
};

for (const item of fromCards) {
  const override = topicOverrides[item.topic];
  if (override) {
    item.question = override.question;
    item.options = override.options;
    item.correctAnswers = override.correctAnswers;
    item.explanation = override.explanation;
  }
}

const conceptSupplements = [
  {
    topic: 'AWS Config',
    question: 'Cumplimiento continuo y NON_COMPLIANT. Que servicio eliges primero?',
    options: {
      A: 'Amazon EventBridge',
      B: 'AWS Config',
      C: 'Amazon CloudWatch',
      D: 'AWS Trusted Advisor',
    },
    correctAnswers: ['B'],
    explanation: 'AWS Config evalua cumplimiento continuo. EventBridge reacciona a eventos puntuales.',
  },
  {
    topic: 'EventBridge',
    question: 'PR creado o build terminado. Que servicio suele enrutar el evento?',
    options: {
      A: 'AWS Config',
      B: 'Amazon EventBridge',
      C: 'AWS Trusted Advisor',
      D: 'Amazon Athena',
    },
    correctAnswers: ['B'],
    explanation: 'Cuando la señal es un evento puntual, EventBridge suele ser la capa correcta.',
  },
  {
    topic: 'CloudWatch',
    question: 'Patron textual en logs ya cargados en CloudWatch Logs. Que pieza convierte el patron en metrica?',
    options: {
      A: 'CloudWatch Alarm',
      B: 'Subscription filter',
      C: 'Metric filter',
      D: 'CloudTrail trail',
    },
    correctAnswers: ['C'],
    explanation: 'Metric filter convierte patrones de logs en metricas.',
  },
  {
    topic: 'SNS',
    question: 'Que servicio distribuye la notificacion una vez que ya detectaste el evento correcto?',
    options: {
      A: 'SNS',
      B: 'Config',
      C: 'Athena',
      D: 'GuardDuty',
    },
    correctAnswers: ['A'],
    explanation: 'SNS distribuye. No suele ser la capa principal de filtrado.',
  },
  {
    topic: 'Trusted Advisor',
    question: 'La pregunta pide menor esfuerzo y AWS ya trae el check. Que servicio sospechas primero?',
    options: {
      A: 'Trusted Advisor',
      B: 'Lambda custom',
      C: 'AWS Config',
      D: 'Athena',
    },
    correctAnswers: ['A'],
    explanation: 'Si AWS ya tiene el check administrado, Trusted Advisor suele ganar por menor esfuerzo.',
  },
  {
    topic: 'Systems Manager Automation',
    question: 'Runbook, remediacion y aprobacion manual. Que servicio encaja?',
    options: {
      A: 'EventBridge',
      B: 'Systems Manager Automation',
      C: 'CloudFront',
      D: 'CodeArtifact',
    },
    correctAnswers: ['B'],
    explanation: 'Automation ejecuta el flujo operativo y de remediacion.',
  },
  {
    topic: 'CodeDeploy',
    question: 'Traffic shifting, hooks y rollback con alarmas. Que servicio domina aqui?',
    options: {
      A: 'Elastic Beanstalk',
      B: 'CodeDeploy',
      C: 'Config',
      D: 'GuardDuty',
    },
    correctAnswers: ['B'],
    explanation: 'Ese patron es propio de CodeDeploy.',
  },
  {
    topic: 'Elastic Beanstalk',
    question: 'Dos entornos y CNAME swap. Que servicio viene a la mente?',
    options: {
      A: 'CodeDeploy',
      B: 'Elastic Beanstalk',
      C: 'CloudFormation Hook',
      D: 'Config',
    },
    correctAnswers: ['B'],
    explanation: 'Ese es el patron nativo de blue/green en Beanstalk.',
  },
  {
    topic: 'CodePipeline',
    question: 'Que servicio orquesta stages de CI/CD?',
    options: {
      A: 'CodeBuild',
      B: 'CodePipeline',
      C: 'CodeCommit',
      D: 'SNS',
    },
    correctAnswers: ['B'],
    explanation: 'CodePipeline orquesta; CodeBuild compila; CodeCommit aloja codigo.',
  },
  {
    topic: 'CodeBuild',
    question: 'Que servicio compila y prueba dentro de un pipeline?',
    options: {
      A: 'CodePipeline',
      B: 'CodeCommit',
      C: 'CodeBuild',
      D: 'CloudTrail',
    },
    correctAnswers: ['C'],
    explanation: 'CodeBuild es el servicio de build y test.',
  },
  {
    topic: 'CodeCommit',
    question: 'Repositorio administrado de codigo fuente. Cual es?',
    options: {
      A: 'CodeCommit',
      B: 'CodeBuild',
      C: 'CodeDeploy',
      D: 'EventBridge',
    },
    correctAnswers: ['A'],
    explanation: 'CodeCommit es el repositorio; no lo confundas con CodeBuild o CodePipeline.',
  },
  {
    topic: 'Lambda concurrency',
    question: 'Cold starts en Lambda. Que feature ataca ese dolor?',
    options: {
      A: 'Reserved concurrency',
      B: 'Provisioned concurrency',
      C: 'Lambda Layers',
      D: 'Mas /tmp',
    },
    correctAnswers: ['B'],
    explanation: 'Provisioned concurrency mantiene entornos inicializados.',
  },
  {
    topic: 'EKS cross-account',
    question: 'Ademas de AssumeRole, que configuracion suele faltar en EKS cross-account?',
    options: {
      A: 'Config rule',
      B: 'aws-auth',
      C: 'CloudWatch dashboard',
      D: 'Lifecycle hook',
    },
    correctAnswers: ['B'],
    explanation: 'El cluster debe mapear el rol via aws-auth.',
  },
  {
    topic: 'CloudFormation',
    question: 'Retain, import y drift detection. Que servicio domina aqui?',
    options: {
      A: 'CloudFormation',
      B: 'Elastic Beanstalk',
      C: 'CodeDeploy',
      D: 'EventBridge',
    },
    correctAnswers: ['A'],
    explanation: 'Ese conjunto de mecanismos es propio de CloudFormation.',
  },
  {
    topic: 'StackSets',
    question: 'IaC multi-cuenta y multi-region ligado a Organizations. Que usas?',
    options: {
      A: 'State Manager',
      B: 'StackSets',
      C: 'OpsWorks',
      D: 'Service Catalog',
    },
    correctAnswers: ['B'],
    explanation: 'StackSets con service-managed permissions es el patron nativo.',
  },
  {
    topic: 'IAM y STS',
    question: 'Que policy decide quien puede asumir un rol destino cross-account?',
    options: {
      A: 'Bucket policy',
      B: 'Trust policy',
      C: 'Permissions boundary',
      D: 'Security group',
    },
    correctAnswers: ['B'],
    explanation: 'La trust policy del rol destino decide quien puede asumirlo.',
  },
  {
    topic: 'KMS',
    question: 'Si KMS bloquea el flujo, que pieza revisas ademas de IAM?',
    options: {
      A: 'Key policy',
      B: 'Target group',
      C: 'CloudWatch Logs Insights',
      D: 'Security Hub control',
    },
    correctAnswers: ['A'],
    explanation: 'En KMS suelen mezclarse IAM y key policy; debes revisar ambas.',
  },
  {
    topic: 'Route 53',
    question: 'La pista dice menor latencia. Que politica de Route 53 eliges?',
    options: {
      A: 'Failover',
      B: 'Weighted',
      C: 'Latency-based',
      D: 'Multivalue answer',
    },
    correctAnswers: ['C'],
    explanation: 'Si el requisito es latencia, latency-based routing es la respuesta natural.',
  },
  {
    topic: 'Auto Scaling',
    question: 'Mantener una metrica cerca de un objetivo cambiante. Que politica de scaling usas?',
    options: {
      A: 'Scheduled scaling',
      B: 'Target tracking',
      C: 'Manual',
      D: 'Lifecycle hook',
    },
    correctAnswers: ['B'],
    explanation: 'Target tracking mantiene una metrica alrededor de un valor objetivo.',
  },
  {
    topic: 'DR',
    question: 'RTO de horas, RPO moderado y costo contenido. Que estrategia suele ganar?',
    options: {
      A: 'Active/Active',
      B: 'Warm Standby',
      C: 'Pilot Light',
      D: 'Sin DR',
    },
    correctAnswers: ['C'],
    explanation: 'Pilot Light suele ganar cuando importa costo y el RTO no es inmediato.',
  },
  {
    topic: 'GuardDuty',
    question: 'Uso anomalo de credenciales. Que servicio gana?',
    options: {
      A: 'Inspector',
      B: 'GuardDuty',
      C: 'Config',
      D: 'Athena',
    },
    correctAnswers: ['B'],
    explanation: 'GuardDuty detecta amenazas; Inspector se enfoca en vulnerabilidades.',
  },
  {
    topic: 'Inspector',
    question: 'CVEs y exposicion de workloads. Que servicio es mas adecuado?',
    options: {
      A: 'GuardDuty',
      B: 'Inspector',
      C: 'SNS',
      D: 'CodeBuild',
    },
    correctAnswers: ['B'],
    explanation: 'Inspector gana en vulnerabilidades y exposicion.',
  },
  {
    topic: 'Secrets Manager',
    question: 'Rotacion nativa de secretos. Que servicio eliges?',
    options: {
      A: 'Parameter Store',
      B: 'Secrets Manager',
      C: 'S3',
      D: 'Config',
    },
    correctAnswers: ['B'],
    explanation: 'Si la pista clave es rotacion nativa, Secrets Manager gana.',
  },
  {
    topic: 'Parameter Store',
    question: 'Configuracion runtime centralizada, sin que la rotacion nativa sea la prioridad. Que servicio sospechas?',
    options: {
      A: 'Secrets Manager',
      B: 'GuardDuty',
      C: 'Parameter Store',
      D: 'CloudTrail',
    },
    correctAnswers: ['C'],
    explanation: 'Parameter Store suele ganar como configuracion runtime centralizada.',
  },
  {
    topic: 'Matriz',
    question: 'NON_COMPLIANT y enforcement continuo. Familia de solucion?',
    options: {
      A: 'Config',
      B: 'EventBridge',
      C: 'CloudWatch',
      D: 'Athena',
    },
    correctAnswers: ['A'],
    explanation: 'La familia de decision correcta es Config.',
  },
  {
    topic: 'Matriz',
    question: 'Logs ya en CloudWatch Logs y patron textual. Familia de solucion?',
    options: {
      A: 'Athena + S3',
      B: 'Metric filter + alarm + SNS',
      C: 'Custom polling',
      D: 'CloudTrail Lake',
    },
    correctAnswers: ['B'],
    explanation: 'Ese es el patron corto y nativo.',
  },
  {
    topic: 'Matriz',
    question: 'Evento puntual y reaccion en tiempo real. Familia de solucion?',
    options: {
      A: 'Config',
      B: 'EventBridge',
      C: 'Patch Manager',
      D: 'Route 53',
    },
    correctAnswers: ['B'],
    explanation: 'Si la pregunta es evento puntual, piensa en EventBridge.',
  },
  {
    topic: 'Matriz',
    question: 'Branch exacta del artefacto en pipeline. Que manda?',
    options: {
      A: 'Aprobacion manual',
      B: 'Source branch',
      C: 'Nombre del stage',
      D: 'Dashboard',
    },
    correctAnswers: ['B'],
    explanation: 'La source branch define el artefacto real.',
  },
  {
    topic: 'Trampas',
    question: 'Si una opcion amplia el alcance mas de lo pedido, que suele pasar?',
    options: {
      A: 'Suele ganar',
      B: 'Suele perder',
      C: 'Depende del ALB',
      D: 'Solo aplica en Lambda',
    },
    correctAnswers: ['B'],
    explanation: 'Scope exacto manda en DOP-C02.',
  },
  {
    topic: 'Trampas',
    question: 'Si AWS ya trae una accion administrada exacta, que suele ganar?',
    options: {
      A: 'La opcion custom con Lambda',
      B: 'La managed',
      C: 'La mas larga',
      D: 'La que tenga S3',
    },
    correctAnswers: ['B'],
    explanation: 'Managed suele ganar a custom cuando cumple exacto.',
  },
  {
    topic: 'Trampas',
    question: 'Si ya sabes el evento exacto, donde filtras primero?',
    options: {
      A: 'Lo antes posible',
      B: 'Hasta SNS',
      C: 'Solo en dashboards',
      D: 'En Excel',
    },
    correctAnswers: ['A'],
    explanation: 'Filtrar antes suele producir la opcion correcta.',
  },
  {
    topic: 'Trampas',
    question: 'Servicio correcto pero feature equivocada. Eso suele ser...',
    options: {
      A: 'Correcto',
      B: 'Distractor comun',
      C: 'Mejor respuesta',
      D: 'Arquitectura final',
    },
    correctAnswers: ['B'],
    explanation: 'DOP-C02 castiga mucho el casi-correcto.',
  },
  {
    topic: 'CloudWatch',
    question: 'Rollback de CodeDeploy por deterioro operativo. Que necesita de CloudWatch?',
    options: {
      A: 'Metrica sola',
      B: 'Alarm asociada',
      C: 'Solo dashboard',
      D: 'Solo log group',
    },
    correctAnswers: ['B'],
    explanation: 'CodeDeploy reacciona a alarms, no a metricas sueltas.',
  },
  {
    topic: 'Auto Scaling',
    question: 'Patron semanal predecible de trafico. Que politica de scaling sospechas?',
    options: {
      A: 'Scheduled scaling',
      B: 'Target tracking',
      C: 'Manual',
      D: 'Warm pool',
    },
    correctAnswers: ['A'],
    explanation: 'Si el patron es por calendario, empieza por scheduled scaling.',
  },
  {
    topic: 'CloudFormation',
    question: 'Renombrar stack manteniendo recursos. Que atributo es clave?',
    options: {
      A: 'DependsOn',
      B: 'Retain',
      C: 'Metadata',
      D: 'Condition',
    },
    correctAnswers: ['B'],
    explanation: 'DeletionPolicy: Retain conserva recursos para importarlos luego.',
  },
  {
    topic: 'CodeDeploy',
    question: 'Antes de exponer trafico real a la nueva version. Que hook suena correcto?',
    options: {
      A: 'AfterAllowTestTraffic',
      B: 'BeforeAllowTraffic',
      C: 'ApplicationStop',
      D: 'AfterInstall',
    },
    correctAnswers: ['B'],
    explanation: 'El momento importa: antes de trafico real -> BeforeAllowTraffic.',
  },
  {
    topic: 'Route 53',
    question: 'Primario/secundario segun salud. Que politica de Route 53 suena correcta?',
    options: {
      A: 'Latency-based',
      B: 'Geolocation',
      C: 'Failover',
      D: 'Weighted',
    },
    correctAnswers: ['C'],
    explanation: 'Primario/secundario y health checks apuntan a failover.',
  }
].map((item) => ({
  id: nextId++,
  questionType: 'single',
  domainName: null,
  ...item,
}));

const glossarySupplements = glossary.slice(0, 13).map((entry) => {
  const distractors = glossary
    .filter((other) => other.id !== entry.id)
    .slice(0, 3)
    .map((other) => other.title);
  const optionPool = [entry.title, ...distractors];
  const labels = ['A', 'B', 'C', 'D'];
  const options = Object.fromEntries(optionPool.map((value, index) => [labels[index], value]));
  const correctLabel = labels[optionPool.indexOf(entry.title)];

  return {
    id: nextId++,
    questionType: 'single',
    question: entry.summary,
    options,
    correctAnswers: [correctLabel],
    explanation: entry.details[0] || entry.summary,
    domainName: null,
    topic: entry.title,
  };
});

const quickQuizBank = [...fromCards, ...conceptSupplements, ...glossarySupplements].slice(0, 100);

fs.writeFileSync(outputPath, `${JSON.stringify(quickQuizBank, null, 2)}\n`, 'utf8');
console.log(`Quick quiz bank generated: ${quickQuizBank.length} questions`);
