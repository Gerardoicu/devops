const fs = require('fs');
const path = require('path');

const cardsPath = path.join(__dirname, '..', 'public', 'assets', 'cards.json');
const cards = JSON.parse(fs.readFileSync(cardsPath, 'utf8'));

const additions = [
  {
    id: 'learn-eventbridge-core',
    type: 'learn',
    title: 'EventBridge',
    prompt: 'EventBridge gana cuando el problema es reaccionar a un evento puntual.',
    body: 'Piensa en PR creado, build terminado, cambio en una regla de Config o disparar un workflow al ocurrir algo.',
    explanation: 'No lo uses como si fuera compliance continuo. Vive en reaccion, no en evaluacion persistente del estado.',
    tags: ['eventbridge'],
    source: 'notes',
    questionIds: [8, 18, 68, 118],
    difficulty: 1
  },
  {
    id: 'learn-sns-core',
    type: 'learn',
    title: 'SNS',
    prompt: 'SNS distribuye notificaciones; rara vez deberia ser donde resuelves la logica principal.',
    body: 'Si ya conoces exactamente que evento importa, filtra antes y usa SNS para repartir el mensaje.',
    explanation: 'En el examen SNS suele ser el ultimo paso util, no el cerebro del flujo.',
    tags: ['sns'],
    source: 'notes',
    questionIds: [3, 8, 16, 18],
    difficulty: 1
  },
  {
    id: 'learn-trusted-advisor-core',
    type: 'learn',
    title: 'Trusted Advisor',
    prompt: 'Trusted Advisor gana cuando AWS ya trae el check y la pregunta pide menor esfuerzo.',
    body: 'No lo confundas con enforcement continuo ni con observabilidad operativa fina.',
    explanation: 'Sirve como punto de partida cuando quieres aprovechar una recomendacion administrada existente.',
    tags: ['trusted-advisor'],
    source: 'notes',
    questionIds: [15, 85],
    difficulty: 1
  },
  {
    id: 'compare-trust-vs-permission-policy',
    type: 'compare',
    title: 'Trust policy vs permissions policy',
    prompt: 'En cross-account, cual define quien puede asumir el rol?',
    options: [
      { id: 'A', label: 'Trust policy' },
      { id: 'B', label: 'Permissions policy' }
    ],
    answer: 'A',
    explanation: 'La trust policy abre la relacion de asuncion. La permissions policy define que puede hacer el principal una vez asumido.',
    tags: ['iam', 'sts', 'cross-account'],
    source: 'notes',
    questionIds: [20, 36, 39, 60],
    difficulty: 2
  },
  {
    id: 'learn-kms-artifact-bucket',
    type: 'learn',
    title: 'KMS en pipelines',
    prompt: 'Cifrar el artifact bucket no basta si el problema real es acceso cross-account a la llave.',
    body: 'En pipelines revisa bucket, KMS, key policy y permisos del rol que consume o publica artefactos.',
    explanation: 'Muchas opciones esconden el verdadero problema en KMS, no en S3.',
    tags: ['kms', 's3', 'codepipeline'],
    source: 'notes',
    questionIds: [39, 43, 98],
    difficulty: 2
  },
  {
    id: 'mini-quiz-config-remediation-ssm',
    type: 'mini-quiz',
    title: 'Compliance con remediacion',
    prompt: 'Quieres asegurar cumplimiento continuo y corregir automaticamente recursos no conformes. Que patron gana?',
    options: [
      { id: 'A', label: 'AWS Config + recurso exacto + remediacion con SSM Automation' },
      { id: 'B', label: 'EventBridge por CreateResource + Lambda que etiquete solo al crear' },
      { id: 'C', label: 'Trusted Advisor + SNS para avisar y esperar correccion manual' },
      { id: 'D', label: 'CloudWatch alarm sobre logs de CloudTrail' }
    ],
    answer: 'A',
    explanation: 'Si el requisito es estado continuo mas correccion, Config con remediacion gana frente a eventos puntuales o simple notificacion.',
    tags: ['config', 'ssm', 'compliance'],
    source: 'notes',
    questionIds: [7, 15, 18],
    difficulty: 2
  },
  {
    id: 'mini-quiz-s3-logging-compliance',
    type: 'mini-quiz',
    title: 'S3 logging obligatorio',
    prompt: 'Quieres asegurar que todos los buckets S3 tengan logging habilitado sin escribir codigo personalizado si ya existe opcion administrada. Que eliges?',
    options: [
      { id: 'A', label: 'AWS Config con regla administrada y accion administrada de remediacion' },
      { id: 'B', label: 'EventBridge por CreateBucket y Lambda personalizada para habilitar logging' },
      { id: 'C', label: 'Trusted Advisor con SNS y correccion manual' },
      { id: 'D', label: 'CloudTrail Lake para detectar buckets sin logging' }
    ],
    answer: 'A',
    explanation: 'La pista es cumplimiento continuo y preferencia por managed sobre custom.',
    tags: ['s3', 'config', 'managed'],
    source: 'bank',
    questionIds: [12],
    difficulty: 2
  },
  {
    id: 'learn-cloudtrail-core',
    type: 'learn',
    title: 'CloudTrail',
    prompt: 'CloudTrail responde quien hizo que y cuando a nivel API.',
    body: 'No te da cumplimiento continuo por si solo; te da auditoria de gestion y, cuando aplica, de eventos de datos.',
    explanation: 'Si la pregunta pide evidencia o historial de llamadas API, empieza aqui antes que en Config.',
    tags: ['cloudtrail'],
    source: 'notes',
    questionIds: [1, 12, 26, 119],
    difficulty: 1
  },
  {
    id: 'compare-secrets-manager-parameter-store',
    type: 'compare',
    title: 'Secrets Manager vs Parameter Store',
    prompt: 'Si la pregunta exige rotacion nativa de secretos, cual gana?',
    options: [
      { id: 'A', label: 'Secrets Manager' },
      { id: 'B', label: 'Parameter Store' }
    ],
    answer: 'A',
    explanation: 'Parameter Store puede guardar parametros seguros, pero la rotacion administrada empuja primero a Secrets Manager.',
    tags: ['secrets-manager', 'parameter-store', 'compare'],
    source: 'official',
    questionIds: [],
    difficulty: 1
  },
  {
    id: 'mini-quiz-codedeploy-rollback-alarm',
    type: 'mini-quiz',
    title: 'Rollback de CodeDeploy',
    prompt: 'Quieres rollback automatico de un despliegue si una senal operativa empeora. Que pieza debe tomar la decision?',
    options: [
      { id: 'A', label: 'Una CloudWatch alarm asociada al deployment' },
      { id: 'B', label: 'La metrica suelta sin alarma' },
      { id: 'C', label: 'Un dashboard con la metrica visible al operador' },
      { id: 'D', label: 'Un log stream sin evaluacion' }
    ],
    answer: 'A',
    explanation: 'CodeDeploy reacciona a alarmas, no a metricas sueltas ni a dashboards.',
    tags: ['codedeploy', 'cloudwatch', 'alarm'],
    source: 'notes',
    questionIds: [58, 72, 97],
    difficulty: 2
  },
  {
    id: 'mini-quiz-route53-policy',
    type: 'mini-quiz',
    title: 'Routing policy correcta',
    prompt: 'Quieres enviar a usuarios a la region con menor latencia, no solo hacer failover. Que routing policy encaja mejor?',
    options: [
      { id: 'A', label: 'Latency-based routing' },
      { id: 'B', label: 'Failover routing' },
      { id: 'C', label: 'Weighted routing' },
      { id: 'D', label: 'Geolocation routing' }
    ],
    answer: 'A',
    explanation: 'Failover es primario/secundario, weighted reparte porcentajes y geolocation sigue ubicacion, no latencia observada.',
    tags: ['route53'],
    source: 'official',
    questionIds: [17, 31, 84],
    difficulty: 2
  },
  {
    id: 'trap-low-ttl-not-solution',
    type: 'trap',
    title: 'TTL bajo no salva todo',
    prompt: 'Cuando una pregunta menciona clientes que cachean mal DNS, que sesgo evita caer?',
    options: [
      { id: 'A', label: 'Bajar el TTL no resuelve por completo un problema estructural de switching' },
      { id: 'B', label: 'Siempre que bajes TTL, el trafico alabara la nueva ruta casi al instante' }
    ],
    answer: 'A',
    explanation: 'El examen usa TTL bajo como distractor operativo cuando la estrategia correcta esta en ALB, target groups o traffic shifting.',
    tags: ['route53', 'trap', 'alb'],
    source: 'notes',
    questionIds: [84],
    difficulty: 2
  },
  {
    id: 'compare-stepfunctions-vs-eventbridge',
    type: 'compare',
    title: 'Step Functions vs EventBridge',
    prompt: 'Si el problema es un workflow largo, con estado y varias ramas, cual gana mejor?',
    options: [
      { id: 'A', label: 'Step Functions' },
      { id: 'B', label: 'EventBridge solamente' }
    ],
    answer: 'A',
    explanation: 'EventBridge conecta eventos; Step Functions coordina pasos, espera y fallos con estado.',
    tags: ['step-functions', 'eventbridge', 'compare'],
    source: 'notes',
    questionIds: [11, 115, 117],
    difficulty: 2
  },
  {
    id: 'learn-cdk-vs-cloudformation',
    type: 'learn',
    title: 'CDK vs CloudFormation',
    prompt: 'CDK define infraestructura con codigo, pero CloudFormation sigue siendo el motor real del despliegue.',
    body: 'No confundas capa de definicion con capa de ejecucion cuando la pregunta habla de stacks, drift o imports.',
    explanation: 'CDK aparece mas como forma de authoring; CloudFormation sigue mandando en la semantica de despliegue.',
    tags: ['cloudformation', 'cdk'],
    source: 'official',
    questionIds: [],
    difficulty: 2
  },
  {
    id: 'learn-codedeploy-traffic-strategies',
    type: 'learn',
    title: 'Traffic shifting',
    prompt: 'En despliegues controlados distingue canary, linear y all-at-once; no son el mismo riesgo.',
    body: 'Cuando la pregunta pide reducir blast radius o validar gradualmente, el tipo de shifting importa.',
    explanation: 'Es una diferencia fina de deployment strategy que el examen usa mucho como distractor plausible.',
    tags: ['codedeploy', 'traffic-shifting', 'deployment'],
    source: 'official',
    questionIds: [5, 25, 48, 97],
    difficulty: 2
  },
  {
    id: 'mini-quiz-kms-cross-account-artifacts',
    type: 'mini-quiz',
    title: 'Artefactos cross-account',
    prompt: 'Un pipeline central cifra artefactos y una cuenta destino no puede consumirlos. Cual ajuste es el mas probable?',
    options: [
      { id: 'A', label: 'Revisar key policy y permisos del rol destino sobre la llave KMS' },
      { id: 'B', label: 'Desactivar el cifrado del bucket para simplificar el acceso' },
      { id: 'C', label: 'Agregar versionado al bucket de artefactos' },
      { id: 'D', label: 'Mover el artefacto a Parameter Store' }
    ],
    answer: 'A',
    explanation: 'El cuello de botella suele estar en KMS cross-account, no en S3 versioning ni en quitar cifrado.',
    tags: ['kms', 's3', 'cross-account', 'codepipeline'],
    source: 'notes',
    questionIds: [39, 43, 98],
    difficulty: 3
  },
  {
    id: 'mini-quiz-codebuild-role-vs-target-role',
    type: 'mini-quiz',
    title: 'Rol de CodeBuild vs rol destino',
    prompt: 'En un despliegue cross-account, que error conceptual es comun con CodeBuild?',
    options: [
      { id: 'A', label: 'Pensar que el rol de servicio de CodeBuild reemplaza al rol que debe asumirse en la cuenta destino' },
      { id: 'B', label: 'Creer que CodeBuild necesita una VPC para ejecutar cualquier build' },
      { id: 'C', label: 'Asumir que solo CodePipeline puede desplegar cross-account' },
      { id: 'D', label: 'Pensar que ECR obliga a usar Docker-in-Docker en todas las builds' }
    ],
    answer: 'A',
    explanation: 'El rol de servicio permite ejecutar el build; el acceso real al recurso destino suele requerir otro rol y trust policy.',
    tags: ['codebuild', 'cross-account', 'iam', 'assume-role'],
    source: 'notes',
    questionIds: [20, 39],
    difficulty: 3
  }
];

const existing = new Set(cards.map((card) => card.id));
for (const card of additions) {
  if (!existing.has(card.id)) {
    cards.push(card);
  }
}

fs.writeFileSync(cardsPath, `${JSON.stringify(cards, null, 2)}\n`, 'utf8');
console.log(`Cards after additions: ${cards.length}`);
