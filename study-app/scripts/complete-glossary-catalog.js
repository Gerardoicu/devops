const fs = require('fs');
const path = require('path');

const glossaryPath = path.join(__dirname, '..', 'public', 'assets', 'glossary.json');
const glossary = JSON.parse(fs.readFileSync(glossaryPath, 'utf8'));

const byId = new Map(glossary.map((entry) => [entry.id, entry]));

const aliasUpdates = {
  'cloudtrail': ['Amazon CloudTrail'],
  'ec2-auto-scaling': ['Amazon EC2 Auto Scaling', 'AWS Auto Scaling'],
  'ecr': ['Amazon ECR (Elastic Container Registry)'],
  'ecs': ['Amazon ECS (Elastic Container Service)'],
  'iam': ['AWS IAM (Identity and Access Management)'],
  'kms': ['AWS Key Management Service (KMS)'],
  'sns': ['Amazon SNS (Simple Notification Service)'],
  'step-functions': ['AWS Step Functions'],
  'secrets-manager': ['AWS Secrets Manager'],
  'control-tower': ['AWS Control Tower'],
  'organizations': ['AWS Organizations'],
  'waf': ['AWS WAF'],
  'lambda': ['AWS Lambda'],
  'cloudwatch': ['Amazon CloudWatch'],
  'cloudfront': ['Amazon CloudFront'],
  'codebuild': ['AWS CodeBuild'],
  'codecommit': ['AWS CodeCommit'],
  'codedeploy': ['AWS CodeDeploy'],
  'codepipeline': ['AWS CodePipeline'],
  'config': ['AWS Config'],
  'dynamodb': ['Amazon DynamoDB'],
  'route53': ['Amazon Route 53'],
  's3': ['Amazon S3'],
  'rds': ['Amazon RDS'],
  'guardduty': ['Amazon GuardDuty']
};

for (const [id, aliases] of Object.entries(aliasUpdates)) {
  const entry = byId.get(id);
  if (!entry) continue;
  const merged = new Set([...(entry.aliases || []), ...aliases]);
  entry.aliases = [...merged];
  byId.set(id, entry);
}

const additions = [
  ['appconfig', 'Amazon AppConfig', ['AppConfig', 'Amazon AppConfig'], 'Servicio para despliegue controlado y validacion de configuracion de aplicaciones.', ['Gana cuando la pista es configuracion runtime, feature flags o cambios de config sin redeploy completo.'], ['operations', 'service']],
  ['appflow', 'Amazon AppFlow', ['AppFlow', 'Amazon AppFlow'], 'Servicio de integracion administrada para mover datos entre SaaS y AWS.', ['Suele aparecer cuando el problema es ingestion/integracion sin construir pipelines custom.'], ['data', 'service']],
  ['app-runner', 'Amazon App Runner', ['App Runner', 'Amazon App Runner'], 'Servicio para desplegar aplicaciones web y APIs desde codigo o contenedores sin administrar infraestructura.', ['No es lo mismo que ECS/EKS; abstrae mas infraestructura.'], ['service', 'containers']],
  ['appstream-2', 'Amazon AppStream 2.0', ['AppStream 2.0', 'Amazon AppStream 2.0'], 'Servicio de streaming de aplicaciones de escritorio hacia usuarios finales.', ['Suele aparecer en virtualizacion de aplicaciones, no en CI/CD comun.'], ['service']],
  ['amplify', 'AWS Amplify', ['Amplify', 'AWS Amplify'], 'Conjunto de herramientas y hosting para aplicaciones web y moviles full-stack.', ['Aparece con frontends, hosting, autenticacion y despliegue rapido.'], ['service']],
  ['artifact', 'AWS Artifact', ['Artifact', 'AWS Artifact'], 'Portal para descargar reportes de compliance y acuerdos de AWS.', ['No es un servicio de runtime; se usa para evidencia y cumplimiento.'], ['security', 'service']],
  ['audit-manager', 'AWS Audit Manager', ['Audit Manager', 'AWS Audit Manager'], 'Servicio para recopilar evidencia y automatizar evaluaciones de auditoria.', ['Gana con marcos de auditoria y evidencia continua, no con metricas operativas.'], ['security', 'compliance', 'service']],
  ['backup', 'AWS Backup', ['AWS Backup', 'Backup'], 'Servicio administrado para centralizar y automatizar backups de multiples servicios AWS.', ['Gana cuando la pista es politicas de backup centralizadas o multi-cuenta.'], ['resilience', 'service']],
  ['batch', 'AWS Batch', ['Batch', 'AWS Batch'], 'Servicio para ejecutar trabajos por lotes a gran escala sobre capacidad administrada.', ['No es lo mismo que Step Functions ni Lambda.'], ['service']],
  ['braket', 'Amazon Braket', ['Braket', 'Amazon Braket'], 'Servicio para explorar computacion cuantica.', ['Fuera del centro del examen, pero debe ubicarse como servicio especializado.'], ['service']],
  ['codeartifact', 'AWS CodeArtifact', ['CodeArtifact', 'AWS CodeArtifact'], 'Servicio de repositorios de paquetes para dependencias de software.', ['Suele aparecer con Maven, npm, pip y gestion de paquetes en pipelines.'], ['ci-cd', 'service']],
  ['codestar', 'AWS CodeStar', ['CodeStar', 'AWS CodeStar'], 'Servicio historico para experiencia unificada de desarrollo y proyectos AWS.', ['Suele aparecer como distractor o por legado frente a servicios mas especificos.'], ['ci-cd', 'service']],
  ['cost-explorer', 'AWS Cost Explorer', ['Cost Explorer', 'AWS Cost Explorer'], 'Herramienta para analizar costos y uso en AWS.', ['No sustituye Budgets ni Trusted Advisor, pero sirve para analisis de gasto.'], ['operations', 'service']],
  ['data-exchange', 'AWS Data Exchange', ['Data Exchange', 'AWS Data Exchange'], 'Servicio para encontrar, suscribirse y consumir datasets de terceros.', ['No es una base de datos ni un ETL general.'], ['data', 'service']],
  ['data-pipeline', 'AWS Data Pipeline', ['Data Pipeline', 'AWS Data Pipeline'], 'Servicio historico para mover y transformar datos entre servicios y recursos de computo.', ['Suele aparecer como servicio legado o distractor frente a Glue/Step Functions/EventBridge.'], ['data', 'service']],
  ['detective', 'Amazon Detective', ['Detective', 'Amazon Detective'], 'Servicio para investigar y analizar hallazgos de seguridad usando datos relacionados.', ['Complementa GuardDuty; no lo reemplaza.'], ['security', 'service']],
  ['device-farm', 'AWS Device Farm', ['Device Farm', 'AWS Device Farm'], 'Servicio para probar apps en dispositivos reales o emulados.', ['Aparece en pipelines de pruebas de apps moviles.'], ['ci-cd', 'service']],
  ['ec2', 'Amazon EC2', ['EC2', 'Amazon EC2'], 'Servicio de computo con instancias virtuales.', ['Base de muchas preguntas de ASG, CodeDeploy, logs y sistemas legacy.'], ['service']],
  ['efs', 'Amazon EFS', ['EFS', 'Amazon EFS', 'Amazon EFS (Elastic File System)'], 'Sistema de archivos NFS administrado y elastico para Linux.', ['Suele aparecer con comparticion de archivos entre instancias o contenedores.'], ['storage', 'service']],
  ['eks', 'Amazon EKS', ['EKS', 'Amazon EKS', 'Amazon EKS (Elastic Kubernetes Service)'], 'Servicio administrado para ejecutar Kubernetes.', ['En examen aparecen mucho cross-account, aws-auth, IAM y despliegues desde CodeBuild.'], ['containers', 'service']],
  ['elasticache', 'Amazon ElastiCache', ['ElastiCache', 'Amazon ElastiCache'], 'Servicio administrado de cache en memoria compatible con Redis y Memcached.', ['No es una base relacional ni un almacén persistente principal.'], ['data', 'service']],
  ['emr', 'Amazon EMR', ['EMR', 'Amazon EMR'], 'Plataforma administrada para big data y procesamiento distribuido.', ['Aparece con Spark, Hadoop y pipelines de datos.'], ['data', 'service']],
  ['end-user-messaging', 'AWS End User Messaging', ['AWS End User Messaging'], 'Familia de mensajeria para comunicarte con usuarios finales.', ['No es un servicio central de DOP-C02, pero conviene ubicarlo como mensajeria para usuario final.'], ['service']],
  ['fargate', 'AWS Fargate', ['Fargate', 'AWS Fargate'], 'Motor serverless para ejecutar contenedores en ECS o EKS sin administrar hosts.', ['No es un orquestador por si solo; corre tareas/Pods para ECS o EKS.'], ['containers', 'service']],
  ['finspace', 'Amazon FinSpace', ['FinSpace', 'Amazon FinSpace'], 'Servicio especializado para datos y analitica financiera.', ['Fuera del centro del examen; tratalo como servicio vertical.'], ['service']],
  ['gamelift', 'Amazon GameLift', ['GameLift', 'Amazon GameLift'], 'Servicio para backend y hosting de juegos multijugador.', ['Fuera del centro del examen; ubicalo como servicio especializado.'], ['service']],
  ['health', 'AWS Health', ['Health', 'AWS Health'], 'Servicio que informa eventos de salud de AWS y su impacto en tus recursos.', ['Puede aparecer en incident response y operacion.'], ['operations', 'service']],
  ['honeycode', 'Amazon Honeycode', ['Honeycode', 'Amazon Honeycode'], 'Servicio para crear apps sencillas sin mucho codigo.', ['Fuera del centro del examen; ubicalo como no-code/low-code.'], ['service']],
  ['iot-core', 'AWS IoT Core', ['IoT Core', 'AWS IoT Core'], 'Servicio para conectar y administrar dispositivos IoT de forma segura.', ['Aparece en mensajeria de dispositivos y telemetria.'], ['service']],
  ['iot-greengrass', 'AWS IoT Greengrass', ['IoT Greengrass', 'AWS IoT Greengrass'], 'Extiende servicios AWS a dispositivos edge y gateways locales.', ['No es lo mismo que IoT Core; se enfoca en edge runtime.'], ['service', 'edge']],
  ['kendra', 'Amazon Kendra', ['Kendra', 'Amazon Kendra'], 'Servicio de busqueda inteligente empresarial.', ['Fuera del centro del examen; ubicalo como search/AI.'], ['service']],
  ['lex', 'Amazon Lex', ['Lex', 'Amazon Lex'], 'Servicio para construir interfaces conversacionales por voz o texto.', ['No es servicio de orquestacion ni de colas.'], ['service']],
  ['lightsail', 'Amazon Lightsail', ['Lightsail', 'Amazon Lightsail'], 'Plataforma simplificada para apps, sitios y VPS sencillos.', ['Fuera del centro del examen, pero conviene distinguirlo de EC2 puro.'], ['service']],
  ['location-service', 'Amazon Location Service', ['Location Service', 'Amazon Location Service'], 'Servicio para mapas, geocodificacion y rastreo de ubicacion.', ['Fuera del centro del examen; ubicalo como servicio geoespacial.'], ['service']],
  ['macie', 'Amazon Macie', ['Macie', 'Amazon Macie'], 'Servicio para descubrir y proteger datos sensibles en S3.', ['Gana cuando la pregunta habla de PII o datos sensibles en buckets S3.'], ['security', 'service']],
  ['managed-blockchain', 'Amazon Managed Blockchain', ['Managed Blockchain', 'Amazon Managed Blockchain'], 'Servicio administrado para redes blockchain.', ['Fuera del centro del examen; tratalo como servicio especializado.'], ['service']],
  ['marketplace', 'AWS Marketplace', ['Marketplace', 'AWS Marketplace'], 'Catalogo para adquirir software, datos y servicios de terceros en AWS.', ['No es servicio de runtime ni de deploy por si solo.'], ['service']],
  ['memorydb', 'Amazon MemoryDB', ['MemoryDB', 'Amazon MemoryDB'], 'Base de datos en memoria compatible con Redis y durable.', ['No es igual a ElastiCache; tiene objetivo de base de datos principal de baja latencia.'], ['data', 'service']],
  ['neptune', 'Amazon Neptune', ['Neptune', 'Amazon Neptune'], 'Base de datos de grafos administrada.', ['Fuera del centro del examen, pero conviene ubicarla como graph DB.'], ['data', 'service']],
  ['opsworks', 'AWS OpsWorks', ['OpsWorks', 'AWS OpsWorks'], 'Servicio legacy de gestion de configuracion y despliegue.', ['En DOP-C02 suele aparecer como distractor o por compatibilidad heredada.'], ['operations', 'service']],
  ['pinpoint', 'Amazon Pinpoint', ['Pinpoint', 'Amazon Pinpoint'], 'Servicio de engagement y comunicacion multicanal con usuarios.', ['No es SNS/SQS; se orienta a mensajeria hacia clientes finales.'], ['service']],
  ['proton', 'AWS Proton', ['Proton', 'AWS Proton'], 'Servicio para estandarizar y desplegar plataformas y plantillas para microservicios.', ['Aparece en platform engineering e infraestructura estandarizada.'], ['service']],
  ['amazon-q', 'Amazon Q', ['Amazon Q', 'Amazon Q (AI assistant)'], 'Asistente de IA generativa de AWS para desarrollo y negocio.', ['Fuera del nucleo del examen, pero conviene ubicarlo como asistente/AI.'], ['service']],
  ['redshift', 'Amazon Redshift', ['Redshift', 'Amazon Redshift'], 'Data warehouse administrado para analitica a gran escala.', ['No es RDS ni Athena; se usa para almacenamiento analitico persistente.'], ['data', 'service']],
  ['ram', 'AWS Resource Access Manager', ['RAM', 'AWS Resource Access Manager', 'AWS Resource Access Manager (RAM)'], 'Servicio para compartir recursos AWS entre cuentas.', ['Aparece con Organizations y multi-cuenta.'], ['organizations', 'service']],
  ['robomaker', 'AWS RoboMaker', ['RoboMaker', 'AWS RoboMaker'], 'Servicio para desarrollo, simulacion y despliegue de aplicaciones roboticas.', ['Fuera del centro del examen; ubicalo como servicio especializado.'], ['service']],
  ['sagemaker', 'Amazon SageMaker', ['SageMaker', 'Amazon SageMaker'], 'Servicio para construir, entrenar y desplegar modelos de ML.', ['Fuera del nucleo del examen, pero conviene distinguirlo de Glue o Kendra.'], ['service']],
  ['security-hub', 'AWS Security Hub', ['Security Hub', 'AWS Security Hub'], 'Servicio para agregar y priorizar hallazgos de seguridad y posture management.', ['No reemplaza GuardDuty, Inspector o Config; los centraliza.'], ['security', 'service']],
  ['ses', 'Amazon SES', ['SES', 'Amazon SES', 'Amazon SES (Simple Email Service)'], 'Servicio de envio y recepcion de correo electronico.', ['No es SNS; se enfoca en correo.'], ['service']],
  ['sqs', 'Amazon SQS', ['SQS', 'Amazon SQS', 'Amazon SQS (Simple Queue Service)'], 'Servicio de colas para desacoplar componentes.', ['Distingue colas de notificaciones: SQS guarda; SNS distribuye.'], ['operations', 'service']],
  ['systems-manager', 'AWS Systems Manager', ['Systems Manager', 'AWS Systems Manager'], 'Familia de capacidades para operar nodos, automatizar tareas, parchear, inventariar y administrar parametros.', ['Automation, Patch Manager, State Manager y Parameter Store viven aqui.'], ['operations', 'service']],
  ['textract', 'AWS Textract', ['Textract', 'AWS Textract'], 'Servicio para extraer texto, formularios y tablas de documentos.', ['Fuera del nucleo del examen; ubicalo como OCR/document AI.'], ['service']],
  ['transfer-family', 'AWS Transfer Family', ['Transfer Family', 'AWS Transfer Family'], 'Servicio administrado para SFTP, FTPS y FTP sobre AWS.', ['Aparece cuando el requisito es integracion de transferencia de archivos tradicional.'], ['service']],
  ['vpc', 'Amazon VPC', ['VPC', 'Amazon VPC'], 'Red virtual aislada para recursos AWS.', ['Base de networking; aparece con subnets, rutas, endpoints y TGW.'], ['networking', 'service']],
  ['well-architected-tool', 'AWS Well-Architected Tool', ['Well-Architected Tool', 'AWS Well-Architected Tool'], 'Herramienta para revisar workloads frente al marco Well-Architected.', ['No es enforcement automatico; es revision guiada y mejora continua.'], ['operations', 'service']],
  ['workspaces', 'Amazon WorkSpaces', ['WorkSpaces', 'Amazon WorkSpaces'], 'Servicio de escritorios virtuales administrados.', ['Fuera del nucleo del examen; ubicalo como EUC/VDI.'], ['service']],
  ['managed-vs-custom', 'Managed vs custom', ['managed vs custom', 'managed', 'custom'], 'Regla mental de examen: si AWS ya trae una capacidad administrada que cumple exacto, suele ganar sobre la version custom.', ['No construyas con Lambda lo que AWS ya resuelve de forma nativa si la pregunta pide menor esfuerzo.'], ['exam', 'concept']],
  ['filter-layer', 'Filter layer', ['filter layer', 'capa del filtro', 'event filtering'], 'Regla mental de examen: filtra lo antes posible en la capa correcta.', ['EventBridge filtra y SNS distribuye; Config evalua y EventBridge reacciona.'], ['exam', 'concept']],
  ['image-tag', 'Image tag', ['image tag', 'tag de imagen', 'tag vs digest', 'tag'], 'Etiqueta mutable asociada a una imagen de contenedor.', ['Un tag puede moverse; no identifica de forma inmutable el artefacto exacto.'], ['containers', 'concept']],
  ['image-digest', 'Image digest', ['image digest', 'digest de imagen', 'tag vs digest', 'digest'], 'Identificador inmutable de una imagen de contenedor.', ['Gana cuando la pregunta pide consistencia exacta del artefacto entre despliegues.'], ['containers', 'concept']],
  ['low-operational-overhead', 'Menor esfuerzo operacional', ['menos piezas', 'menor esfuerzo', 'low operational overhead'], 'Regla de examen: si una solucion nativa cumple, suele ganar la opcion con menos piezas y menos operacion.', ['No significa siempre la opcion mas corta; significa la menos sobreingenierizada que cumple exacto el requisito.'], ['exam', 'concept']]
];

for (const [id, title, aliases, summary, details, tags] of additions) {
  if (!byId.has(id)) {
    byId.set(id, { id, title, aliases, summary, details, tags });
  }
}

function sortKey(title) {
  return title
    .replace(/^(Amazon|AWS)\s+/i, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9 ]/g, ' ')
    .replace(/\s+/g, '')
    .trim()
    .toLowerCase();
}

const sorted = [...byId.values()].sort((a, b) =>
  sortKey(a.title).localeCompare(sortKey(b.title), 'es', { sensitivity: 'base' })
);

fs.writeFileSync(glossaryPath, `${JSON.stringify(sorted, null, 2)}\n`, 'utf8');
console.log(`Glossary completed: ${sorted.length} entries`);
