const fs = require('fs');
const path = require('path');

const glossaryPath = path.join(__dirname, '..', 'public', 'assets', 'glossary.json');
const glossary = JSON.parse(fs.readFileSync(glossaryPath, 'utf8'));

const additions = [
  {
    id: 'alb',
    title: 'Application Load Balancer',
    aliases: ['Application Load Balancer', 'ALB'],
    summary: 'Balanceador L7 para HTTP/HTTPS con reglas, health checks y target groups.',
    details: [
      'En despliegues suele aparecer con health checks, traffic shifting y target groups.',
      'No confundas un problema de ruteo interno del ALB con uno de DNS.'
    ],
    tags: ['networking', 'resilience', 'service']
  },
  {
    id: 'api-gateway',
    title: 'Amazon API Gateway',
    aliases: ['API Gateway', 'Amazon API Gateway'],
    summary: 'Servicio administrado para crear, publicar y proteger APIs.',
    details: [
      'Suele aparecer con Lambda, Cognito y despliegues serverless.',
      'No reemplaza Step Functions si el problema real es orquestacion con estado.'
    ],
    tags: ['serverless', 'service']
  },
  {
    id: 'athena',
    title: 'Amazon Athena',
    aliases: ['Athena', 'Amazon Athena'],
    summary: 'Servicio de consulta SQL sobre datos en S3.',
    details: [
      'Gana cuando la pregunta habla de logs en S3 y consultas ad hoc sin infraestructura propia.',
      'No consulta directamente CloudWatch Logs.'
    ],
    tags: ['observability', 'service']
  },
  {
    id: 'aurora',
    title: 'Amazon Aurora',
    aliases: ['Aurora', 'Amazon Aurora'],
    summary: 'Motor relacional compatible con MySQL/PostgreSQL diseñado para alta disponibilidad y escalado.',
    details: [
      'En examen debes separar writer endpoint, reader endpoint, replicas y failover.',
      'No es lo mismo que una instancia RDS tradicional.'
    ],
    tags: ['resilience', 'data', 'service']
  },
  {
    id: 'aurora-reader-endpoint',
    title: 'Aurora reader endpoint',
    aliases: ['reader endpoint', 'Aurora reader endpoint'],
    summary: 'Endpoint de Aurora para balancear conexiones de lectura entre replicas.',
    details: [
      'Gana cuando la pista dice consultas de solo lectura o repartir carga de lectura.',
      'Balancea conexiones, no queries individuales.'
    ],
    tags: ['data', 'concept']
  },
  {
    id: 'cloudfront',
    title: 'Amazon CloudFront',
    aliases: ['CloudFront', 'Amazon CloudFront'],
    summary: 'CDN de AWS para distribuir contenido con cache en edge locations.',
    details: [
      'Suele aparecer con contenido estatico, cache, invalidaciones y baja latencia global.'
    ],
    tags: ['edge', 'service']
  },
  {
    id: 'cloudfront-invalidation',
    title: 'CloudFront invalidation',
    aliases: ['CloudFront invalidation', 'invalidation'],
    summary: 'Operacion para invalidar objetos cacheados y forzar que CloudFront recargue contenido.',
    details: [
      'Gana cuando el problema inmediato es que usuarios siguen viendo contenido viejo.'
    ],
    tags: ['edge', 'concept']
  },
  {
    id: 'cloudtrail-organization-trails',
    title: 'CloudTrail organization trails',
    aliases: ['organization trails', 'CloudTrail organization trails'],
    summary: 'Trails de CloudTrail aplicados a toda la organizacion para auditoria centralizada.',
    details: [
      'Ganan cuando la pista es auditoria de API para todas las cuentas de Organizations.'
    ],
    tags: ['security', 'organizations', 'concept']
  },
  {
    id: 'cdk',
    title: 'AWS CDK',
    aliases: ['CDK', 'AWS CDK'],
    summary: 'Framework para definir infraestructura con lenguajes de programacion y sintetizar a CloudFormation.',
    details: [
      'No reemplaza CloudFormation; lo genera.'
    ],
    tags: ['iac', 'service']
  },
  {
    id: 'cognito',
    title: 'Amazon Cognito',
    aliases: ['Cognito', 'Amazon Cognito'],
    summary: 'Servicio de identidad para autenticacion de usuarios y federacion.',
    details: [
      'Suele aparecer con API Gateway, apps serverless y control de acceso de usuarios finales.'
    ],
    tags: ['security', 'service']
  },
  {
    id: 'control-tower',
    title: 'AWS Control Tower',
    aliases: ['Control Tower', 'AWS Control Tower'],
    summary: 'Capa de orquestacion y gobernanza para entornos multi-cuenta basada en mejores practicas.',
    details: [
      'Se apoya en Organizations, Service Catalog e IAM Identity Center.',
      'Gana cuando la pista es landing zone, Account Factory o controles de gobernanza.'
    ],
    tags: ['governance', 'organizations', 'service']
  },
  {
    id: 'contributor-insights',
    title: 'CloudWatch Contributor Insights',
    aliases: ['Contributor Insights', 'CloudWatch Contributor Insights'],
    summary: 'Analisis para encontrar top contributors y patrones agregados en logs o metrics.',
    details: [
      'Gana cuando necesitas identificar top talkers o patrones agregados rapidamente.'
    ],
    tags: ['observability', 'service']
  },
  {
    id: 'dynamodb',
    title: 'Amazon DynamoDB',
    aliases: ['DynamoDB', 'Amazon DynamoDB'],
    summary: 'Base de datos NoSQL clave-valor/documento de baja latencia.',
    details: [
      'En el banco aparece con indices, metadata, estados de pipeline y Global Tables.'
    ],
    tags: ['data', 'service']
  },
  {
    id: 'dynamodb-global-tables',
    title: 'DynamoDB Global Tables',
    aliases: ['Global Tables', 'DynamoDB Global Tables'],
    summary: 'Replicacion multi-region activa para tablas DynamoDB.',
    details: [
      'Suele aparecer con requisitos globales de baja latencia y resiliencia regional.'
    ],
    tags: ['data', 'resilience', 'concept']
  },
  {
    id: 'ecr',
    title: 'Amazon ECR',
    aliases: ['ECR', 'Amazon ECR', 'Elastic Container Registry'],
    summary: 'Registro administrado de imagenes de contenedor seguro y escalable.',
    details: [
      'Debes separar tags movibles de digests inmutables.'
    ],
    tags: ['containers', 'service']
  },
  {
    id: 'ecs',
    title: 'Amazon ECS',
    aliases: ['ECS', 'Amazon ECS', 'Elastic Container Service'],
    summary: 'Servicio administrado de orquestacion de contenedores.',
    details: [
      'Suele aparecer con blue/green via CodeDeploy, task definitions y despliegues de servicios.'
    ],
    tags: ['containers', 'service']
  },
  {
    id: 'ecr-image-digest',
    title: 'ECR image digest',
    aliases: ['image digest', 'digest de imagen', 'ECR digest'],
    summary: 'Identificador inmutable de una imagen de contenedor.',
    details: [
      'Gana cuando la pregunta busca consistencia exacta de artefacto entre despliegues.'
    ],
    tags: ['containers', 'concept']
  },
  {
    id: 'firewall-manager',
    title: 'AWS Firewall Manager',
    aliases: ['Firewall Manager', 'AWS Firewall Manager'],
    summary: 'Servicio para administrar politicas de seguridad de red a escala en multiples cuentas.',
    details: [
      'Suele aparecer con WAF, Shield Advanced y Security Groups en organizaciones.'
    ],
    tags: ['security', 'organizations', 'service']
  },
  {
    id: 'glue',
    title: 'AWS Glue',
    aliases: ['Glue', 'AWS Glue'],
    summary: 'Servicio administrado de integracion de datos, catalogo y ETL.',
    details: [
      'En examen puede aparecer con workflows, retries y eventos de fallas.'
    ],
    tags: ['data', 'service']
  },
  {
    id: 'kinesis',
    title: 'Amazon Kinesis Data Streams',
    aliases: ['Kinesis', 'Kinesis Data Streams', 'Amazon Kinesis'],
    summary: 'Servicio para ingestión y procesamiento de datos en streaming.',
    details: [
      'Fijate en retencion, consumidores y metricas como MillisBehindLatest.'
    ],
    tags: ['streaming', 'service']
  },
  {
    id: 'metric-math',
    title: 'CloudWatch metric math',
    aliases: ['metric math', 'CloudWatch metric math'],
    summary: 'Capacidad para combinar o transformar metricas en expresiones matematicas.',
    details: [
      'Gana cuando necesitas alertar o visualizar derivaciones de varias metricas.'
    ],
    tags: ['observability', 'concept']
  },
  {
    id: 'organizations',
    title: 'AWS Organizations',
    aliases: ['Organizations', 'AWS Organizations'],
    summary: 'Servicio para administrar cuentas AWS en conjunto, aplicar politicas y gobernanza centralizada.',
    details: [
      'Gana con multi-cuenta, OUs, SCPs, trails organizacionales y despliegue centralizado.',
      'Estar en la misma organizacion no elimina la necesidad de trust policy o permisos cross-account.'
    ],
    tags: ['organizations', 'governance', 'service']
  },
  {
    id: 'ou',
    title: 'Organizational Unit (OU)',
    aliases: ['OU', 'Organizational Unit', 'Organizational Units'],
    summary: 'Grupo logico de cuentas dentro de AWS Organizations.',
    details: [
      'Permite aplicar politicas y despliegues a un subconjunto de cuentas.'
    ],
    tags: ['organizations', 'concept']
  },
  {
    id: 'rds',
    title: 'Amazon RDS',
    aliases: ['RDS', 'Amazon RDS'],
    summary: 'Servicio administrado de bases de datos relacionales.',
    details: [
      'En examen suele aparecer con read replicas, backups, Multi-AZ y DR.',
      'No es lo mismo que Aurora, que usa endpoints de cluster propios.'
    ],
    tags: ['data', 'service']
  },
  {
    id: 'read-replica',
    title: 'Read replica',
    aliases: ['read replica', 'Read replica'],
    summary: 'Replica asincrona para descarga de lecturas o estrategias de DR.',
    details: [
      'Gana cuando la pregunta pide mejorar RPO/RTO mejor que backup/restore puro.'
    ],
    tags: ['data', 'concept']
  },
  {
    id: 's3',
    title: 'Amazon S3',
    aliases: ['S3', 'Amazon S3'],
    summary: 'Servicio de almacenamiento de objetos altamente durable y escalable.',
    details: [
      'Suele aparecer con logging, versionado, eventos, artefactos y sitios estaticos.'
    ],
    tags: ['storage', 'service']
  },
  {
    id: 's3objectversion',
    title: 'S3ObjectVersion',
    aliases: ['S3ObjectVersion'],
    summary: 'Propiedad comunmente usada para forzar actualizaciones de codigo empaquetado en CloudFormation.',
    details: [
      'Muy util para que Lambda o otros artefactos se actualicen cuando el objeto cambia.'
    ],
    tags: ['storage', 'concept']
  },
  {
    id: 'service-catalog',
    title: 'AWS Service Catalog',
    aliases: ['Service Catalog', 'AWS Service Catalog'],
    summary: 'Servicio para publicar y gobernar productos aprobados de infraestructura y software.',
    details: [
      'Aparece con Control Tower, Account Factory y gobernanza multi-cuenta.'
    ],
    tags: ['governance', 'service']
  },
  {
    id: 'spot-instances',
    title: 'Spot Instances',
    aliases: ['Spot', 'Spot Instances'],
    summary: 'Capacidad EC2 con descuento que puede ser interrumpida por AWS.',
    details: [
      'No es lo mismo que On-Demand y cambia la logica de ASG en mixed instances.'
    ],
    tags: ['resilience', 'concept']
  },
  {
    id: 'on-demand-instances',
    title: 'On-Demand Instances',
    aliases: ['On-Demand', 'On-Demand Instances'],
    summary: 'Capacidad EC2 de precio estable y sin interrupcion por recuperacion de capacidad de AWS.',
    details: [
      'Suele compararse con Spot en costos y comportamiento de interrupcion.'
    ],
    tags: ['resilience', 'concept']
  },
  {
    id: 'transit-gateway',
    title: 'AWS Transit Gateway',
    aliases: ['Transit Gateway', 'AWS Transit Gateway', 'TGW'],
    summary: 'Hub de red para interconectar VPCs, cuentas y redes on-premises.',
    details: [
      'No confundas logs de trafico/red con logs del appliance de firewall.'
    ],
    tags: ['networking', 'service']
  },
  {
    id: 'waf',
    title: 'AWS WAF',
    aliases: ['WAF', 'AWS WAF'],
    summary: 'Firewall de aplicaciones web para filtrar trafico HTTP/HTTPS.',
    details: [
      'Aparece con CloudFront, ALB y Firewall Manager.'
    ],
    tags: ['security', 'service']
  }
];

const byId = new Map(glossary.map((entry) => [entry.id, entry]));
for (const entry of additions) {
  byId.set(entry.id, entry);
}

const sorted = [...byId.values()].sort((a, b) => a.title.localeCompare(b.title, 'es', { sensitivity: 'base' }));

fs.writeFileSync(glossaryPath, `${JSON.stringify(sorted, null, 2)}\n`, 'utf8');
console.log(`Glossary expanded and sorted: ${sorted.length} entries`);
