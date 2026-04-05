const fs = require('fs');
const path = require('path');

const conceptPath = path.join(__dirname, '..', 'public', 'assets', 'concept-feed.json');
const existing = JSON.parse(fs.readFileSync(conceptPath, 'utf8'));

const themedCards = [
  {
    id: 'theme-cicd-patterns',
    type: 'learn',
    title: '1. CI/CD - patrones ganadores',
    prompt: 'En automatizacion del ciclo de vida, piensa primero en pipeline, artefacto y rollback.',
    body: 'Patrones: CodePipeline como orquestador central, separacion CodeCommit -> CodeBuild -> CodeDeploy, Blue/Green para minimizar downtime, rollback automatico con CloudWatch Alarms, artefactos versionados en S3, variables por entorno y roles IAM por servicio con minimo privilegio.',
    explanation: 'Si el escenario habla de CI/CD serio, casi nunca gana una mezcla manual con SSH o scripts sueltos. Gana el flujo declarativo, versionado y automatizado.',
    tags: ['ci-cd', 'codepipeline', 'codebuild', 'codedeploy', 'rollback', 'artifacts'],
    source: 'notes',
    questionIds: [5, 30, 39, 54, 62, 68, 72, 120],
    difficulty: 2
  },
  {
    id: 'theme-cicd-traps',
    type: 'learn',
    title: '1. CI/CD - trampas',
    prompt: 'Las trampas clasicas de CI/CD son manualidad, falta de versionado y source equivocado.',
    body: 'Trampas: scripts manuales en EC2 en vez de CodeDeploy, acceso directo SSH, no versionar artefactos, deploy a produccion sin stage intermedio, no considerar rollback automatico, confundir CodeBuild con CodeDeploy y usar polling en vez de triggers.',
    explanation: 'En DOP-C02, una solucion que funciona pero depende de SSH, pasos manuales o polling suele perder frente a una automatizada y menos operativa.',
    tags: ['ci-cd', 'traps', 'ssh', 'branching', 'rollback'],
    source: 'notes',
    questionIds: [19, 39, 54, 68, 72, 120],
    difficulty: 2
  },
  {
    id: 'theme-iac-patterns',
    type: 'learn',
    title: '2. IaC - patrones ganadores',
    prompt: 'Infraestructura como codigo gana con declarativo, modularidad y despliegue automatizado.',
    body: 'Patrones: CloudFormation o Terraform declarativo, StackSets para multi-cuenta/multi-region, Drift Detection, parametros y outputs, versionado de templates, pipelines para aplicar cambios y separacion por stacks como network/app/data.',
    explanation: 'Si la infraestructura cambia seguido o vive en muchas cuentas, la respuesta buena se parece a stacks versionados, no a scripts imperativos lanzados a mano.',
    tags: ['iac', 'cloudformation', 'stacksets', 'drift', 'change-set'],
    source: 'notes',
    questionIds: [1, 2, 9, 22, 34, 35, 94],
    difficulty: 2
  },
  {
    id: 'theme-iac-traps',
    type: 'learn',
    title: '2. IaC - trampas',
    prompt: 'Las trampas de IaC suelen ser drift, valores hardcodeados y cambios aplicados fuera del flujo.',
    body: 'Trampas: cambios manuales fuera de CloudFormation, no usar StackSets en organizaciones grandes, hardcodear valores, scripts imperativos en vez de declarativos, no manejar rollback de stack failures, ignorar dependencias y no usar Change Sets antes de cambios criticos.',
    explanation: 'La infraestructura declarativa se rompe cuando la operas como si fuera scripting manual. El examen castiga mucho eso.',
    tags: ['iac', 'traps', 'drift', 'stacksets', 'change-set'],
    source: 'notes',
    questionIds: [1, 2, 9, 34, 35, 94],
    difficulty: 2
  },
  {
    id: 'theme-observability-patterns',
    type: 'learn',
    title: '3. Observabilidad - patrones ganadores',
    prompt: 'Observabilidad buena mezcla logs, metricas, alarmas, dashboards y acciones.',
    body: 'Patrones: CloudWatch Logs + Metrics + Alarms, centralizacion de logs, dashboards operativos, alarmas de negocio ademas de CPU, X-Ray para tracing, Auto Scaling con metricas reales y runbooks automatizados con Systems Manager.',
    explanation: 'Monitorear bien no es solo ver CPU; es tener señales utiles, alarmas accionables y capacidad de respuesta automatizada.',
    tags: ['observability', 'cloudwatch', 'xray', 'dashboards', 'ssm-automation'],
    source: 'notes',
    questionIds: [3, 4, 11, 16, 44, 66, 79, 100],
    difficulty: 2
  },
  {
    id: 'theme-observability-traps',
    type: 'learn',
    title: '3. Observabilidad - trampas',
    prompt: 'Las trampas de observabilidad suelen ser monitorear poco y actuar tarde.',
    body: 'Trampas: monitorear solo infraestructura, no configurar alarmas, thresholds pobres, ignorar tracing distribuido, no centralizar logs, usar logs sin estructura y no conectar alertas con acciones como rollback.',
    explanation: 'Si solo tienes logs pasivos o dashboards bonitos sin alarmas y runbooks, no tienes observabilidad operativa suficiente.',
    tags: ['observability', 'traps', 'alarms', 'xray', 'logs'],
    source: 'notes',
    questionIds: [3, 4, 16, 44, 66, 100],
    difficulty: 2
  },
  {
    id: 'theme-security-patterns',
    type: 'learn',
    title: '4. Seguridad y cumplimiento - patrones ganadores',
    prompt: 'Seguridad en DOP-C02 suele premiar minimo privilegio, auditoria y cumplimiento continuo.',
    body: 'Patrones: minimo privilegio con IAM, roles en vez de credenciales estaticas, SCPs a nivel organizacion, CloudTrail en todas las cuentas, Config + Security Hub para cumplimiento, cifrado por defecto con KMS y secretos en Secrets Manager o Parameter Store.',
    explanation: 'La respuesta buena suele separar identidad, auditoria, cumplimiento y cifrado. No metas un solo servicio para todo.',
    tags: ['security', 'iam', 'cloudtrail', 'config', 'kms', 'secrets'],
    source: 'notes',
    questionIds: [1, 7, 15, 18, 20, 24, 26, 43, 98],
    difficulty: 2
  },
  {
    id: 'theme-security-traps',
    type: 'learn',
    title: '4. Seguridad y cumplimiento - trampas',
    prompt: 'Las trampas de seguridad suelen ser credenciales estaticas, permisos amplios y confundir capas.',
    body: 'Trampas: access keys hardcodeadas, confundir IAM con SCP, no habilitar CloudTrail en todas las regiones, permisos *:*, no rotar credenciales, guardar secretos en codigo y pensar que Security Groups reemplazan IAM.',
    explanation: 'El examen suele poner una opcion parcialmente segura pero con una decision de identidad o gobernanza claramente mala.',
    tags: ['security', 'traps', 'iam', 'scp', 'cloudtrail', 'secrets'],
    source: 'notes',
    questionIds: [1, 15, 18, 20, 24, 26, 43, 98],
    difficulty: 2
  },
  {
    id: 'theme-resilience-patterns',
    type: 'learn',
    title: '5. Resiliencia y DR - patrones ganadores',
    prompt: 'Resiliencia buena empieza en multi-AZ y DR serio empieza en RTO/RPO.',
    body: 'Patrones: multi-AZ por defecto, Auto Scaling + Load Balancer, estrategias DR claras (Backup & Restore, Pilot Light, Warm Standby, Active/Active), backups automatizados, pruebas periodicas de DR y RTO/RPO alineados al negocio.',
    explanation: 'No confundas alta disponibilidad con DR. El examen distingue muy bien entre soportar fallo local y recuperarte de un desastre mayor.',
    tags: ['resilience', 'dr', 'multi-az', 'backup', 'route53', 'auto-scaling'],
    source: 'notes',
    questionIds: [14, 17, 31, 41, 59, 74, 82, 86],
    difficulty: 2
  },
  {
    id: 'theme-resilience-traps',
    type: 'learn',
    title: '5. Resiliencia y DR - trampas',
    prompt: 'Las trampas de resiliencia suelen ser confundir disponibilidad local con recuperacion real.',
    body: 'Trampas: Single AZ, backups sin restauracion probada, confundir HA con DR, no definir RTO/RPO, pensar que Multi-AZ es Multi-region, no automatizar failover y subestimar latencia multi-region.',
    explanation: 'Una arquitectura puede ser muy disponible en una region y aun asi tener mal plan de desastre.',
    tags: ['resilience', 'traps', 'dr', 'rto', 'rpo', 'failover'],
    source: 'notes',
    questionIds: [17, 31, 41, 59, 74, 82, 86],
    difficulty: 2
  },
  {
    id: 'theme-cross-patterns',
    type: 'learn',
    title: 'Patrones transversales del examen',
    prompt: 'Hay palabras clave que reducen el espacio de respuesta en segundos.',
    body: 'Reglas rapidas: menor esfuerzo operativo -> servicio administrado/serverless; escalable automaticamente -> Auto Scaling o serverless; sin intervencion manual -> eventos + automatizacion; multi-cuenta -> Organizations + StackSets; auditoria -> CloudTrail + Config; tiempo real -> eventos/EventBridge, no polling.',
    explanation: 'Estas pistas te ayudan a arrancar una pregunta larga sin abrir todo el arbol de posibilidades.',
    tags: ['matrix', 'exam', 'patterns', 'operations'],
    source: 'notes',
    questionIds: [1, 8, 15, 16, 17, 18, 68, 85, 94],
    difficulty: 2
  },
  {
    id: 'theme-classic-traps',
    type: 'learn',
    title: 'Trampas clasicas del examen',
    prompt: 'Muchas respuestas son tecnicamente validas, pero no cumplen todos los requisitos o meten mas operacion.',
    body: 'Trampas clasicas: opcion correcta a medias, solucion valida pero con mas carga operativa, servicio correcto en el nivel equivocado, ignorar palabras como automatico, sin intervencion, menor costo operativo y respuestas que funcionan pero no escalan.',
    explanation: 'DOP-C02 no premia solo que algo funcione; premia que sea la mejor respuesta bajo las restricciones dadas.',
    tags: ['exam', 'traps', 'scale', 'managed', 'scope'],
    source: 'notes',
    questionIds: [12, 16, 18, 39, 54, 68, 85, 94, 120],
    difficulty: 2
  }
];

const existingById = new Map(existing.map((card) => [card.id, card]));
for (const card of themedCards) {
  existingById.set(card.id, card);
}

const preservedExisting = existing.filter((card) => !themedCards.some((theme) => theme.id === card.id));
const nextFeed = [...themedCards, ...preservedExisting];

fs.writeFileSync(conceptPath, `${JSON.stringify(nextFeed, null, 2)}\n`, 'utf8');
console.log(`Concept feed expanded: ${nextFeed.length} cards`);
