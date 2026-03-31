# preguntas

1. Una empresa multinacional con cientos de cuentas AWS ha adoptado gradualmente AWS Organizations con todas las funciones habilitadas.
    
    La empresa también ha configurado algunas Organizational Units (OUs) para cumplir con sus objetivos de negocio. La empresa tiene algunos roles de IAM que deben configurarse en cada nueva cuenta AWS que se cree. Además, la política de seguridad exige habilitar AWS CloudTrail en todas las cuentas AWS. La empresa busca una solución automatizada que pueda:
    
- Agregar los roles IAM obligatorios
- Configurar CloudTrail
- Aplicarlo automáticamente a todas las cuentas nuevas
- Eliminar los recursos/configuraciones cuando una cuenta salga de la organización
- Sin intervención manual

Pregunta:

¿Qué debería hacer un DevOps engineer para cumplir estos requisitos con el menor overhead operativo?

### Desde la cuenta de administración de AWS Organizations, crear un AWS CloudFormation StackSet para habilitar AWS Config y desplegar los roles IAM centralizados. Configurar el StackSet para que se despliegue automáticamente cuando se cree una cuenta a través de AWS Organizations.

### Ejecutar automatización en múltiples cuentas utilizando AWS Systems Manager Automation. Crear un AWS resource group desde la cuenta de administración (o desde una cuenta centralizada) y nombrarlo exactamente igual para todas las cuentas y OUs, agregando el ID de la cuenta o OU como prefijo según el estándar de nombres. Incluir la configuración de CloudTrail y el rol IAM que debe crearse.

### Desde la cuenta de administración de AWS Organizations, crear una regla de Amazon EventBridge que se active cuando se ejecute la API de creación de cuentas de AWS. Configurar una función AWS Lambda para: habilitar el registro de CloudTrail, adjuntar los roles IAM necesarios a la cuenta

1. Desde la cuenta de administración de AWS Organizations, habilitar los logs de AWS CloudTrail para todas las cuentas miembro.De manera similar, crear un rol IAM y compartirlo entre cuentas y OUs de la organización AWS.

✅ Respuesta correcta A

# ***Explicación (traducida)***

*Desde la **cuenta de administración de AWS Organizations**, crea un **AWS CloudFormation StackSet** para habilitar **AWS Config** y desplegar tus **roles centralizados de AWS Identity and Access Management (IAM)**. Configura el StackSet para que **se despliegue automáticamente cuando se cree una cuenta a través de AWS Organizations**.*

*Puedes **orquestar centralmente cualquier servicio compatible con AWS CloudFormation** a través de **múltiples cuentas y regiones de AWS**. Por ejemplo, puedes desplegar:*

- *roles centralizados de **IAM***
- *instancias de **Amazon EC2***
- *funciones de **AWS Lambda***

*a través de **múltiples regiones y cuentas dentro de tu organización**. Los **CloudFormation StackSets** simplifican la configuración de **permisos entre cuentas** y permiten la **creación y eliminación automática de recursos** cuando las cuentas **se agregan o se eliminan de tu organización**. Para comenzar, puedes **habilitar el intercambio de datos entre CloudFormation y Organizations desde la consola de StackSets**. Una vez hecho esto, podrás usar **StackSets desde la cuenta maestra de AWS Organizations** para desplegar stacks en:*

- ***todas las cuentas de la organización**, o*
- ***unidades organizativas específicas (OUs)**.*

*Con estos StackSets está disponible un nuevo modelo de permisos llamado **Service-managed permissions**.*

*Cuando eliges **Service-managed permissions**, StackSets **configura automáticamente los permisos IAM necesarios** para desplegar el stack en las cuentas de tu organización. Además de configurar los permisos, **CloudFormation StackSets permite crear o eliminar automáticamente stacks** cuando una **nueva cuenta se une o abandona la organización**. Esto significa que:*

- ***no necesitas conectarte manualmente a cada cuenta nueva para desplegar infraestructura común***
- ***tampoco necesitas eliminar manualmente la infraestructura cuando una cuenta se elimina de la organización***

*Cuando una cuenta abandona la organización, el stack **se elimina de la administración de StackSets**.*

*Sin embargo, puedes elegir si deseas:*

- ***eliminar los recursos**, o*
- ***mantener los recursos existentes***

*que estaban siendo gestionados por ese stack.Finalmente, puedes elegir si deseas desplegar un stack en:*

- ***toda la organización**, o*
- ***una o varias Organizational Units (OU)**.*

*También puedes configurar opciones de despliegue como:*

- ***cuántas cuentas se desplegarán en paralelo***
- ***cuántos fallos se toleran antes de detener todo el despliegue***

# ***Opciones incorrectas (traducidas)***

### ***Opción incorrecta***

*Crear una **regla de Amazon EventBridge** que se active cuando se ejecute la API de creación de cuentas y configurar una **función Lambda** para habilitar CloudTrail y adjuntar roles IAM.*

*❌ Esta opción utiliza **demasiados servicios**, lo que **aumenta innecesariamente la complejidad y el costo de la solución**.*

### ***Opción incorrecta***

*Ejecutar automatización entre múltiples cuentas utilizando **AWS Systems Manager Automation** y crear un **grupo de recursos** en la cuenta de administración con nombres estandarizados.*

*❌ Aunque **AWS Systems Manager puede automatizar tareas en múltiples cuentas**, los demás detalles descritos **no son relevantes para el caso de uso planteado**.*

*Cuando ejecutas automatización en múltiples cuentas y regiones, debes **dirigir los recursos usando etiquetas o el nombre de un grupo de recursos**.*

*Ese grupo de recursos debe:*

- *existir en **cada cuenta***
- *existir en **cada región***
- *tener **exactamente el mismo nombre***

*La automatización **fallará en los recursos que no tengan la etiqueta especificada o que no pertenezcan al grupo de recursos indicado**.*

### ***Opción incorrecta***

*Habilitar **CloudTrail desde la cuenta de administración** para todas las cuentas y crear un **rol IAM compartido entre todas las cuentas**.*

*❌ Aunque es posible habilitar **CloudTrail organizacional**, su objetivo es **centralizar el registro de eventos**.*

*Además, **crear un rol IAM en la cuenta de administración y compartirlo con todas las cuentas requiere trabajo manual**, por lo que **no cumple con el requisito de automatización del caso de uso**.*

**2.**Un **stack de CloudFormation** consta de los siguientes recursos de AWS:

- un **bucket de Amazon Simple Storage Service (Amazon S3)**
- una **instancia de Amazon Elastic Compute Cloud (Amazon EC2)**
- un **volumen de Amazon EBS**

Debido a un **problema de seguridad de alto impacto**, se le ha pedido al equipo DevOps **renombrar el stack de AWS CloudFormation**.

Sin embargo, **los recursos creados por el stack no pueden eliminarse por razones de negocio**.

**¿Qué pasos tomarías para renombrar el stack de CloudFormation sin eliminar los recursos creados?**

### **A).** Lanzar un nuevo **stack de CloudFormation** que despliegue todos los recursos del stack. Lanzar otro stack de CloudFormation que despliegue todos los recursos del stack con **un nuevo nombre**. En el segundo stack de CloudFormation, usar el atributo **DependsOn** para crear una dependencia de recursos con el primer stack. Eliminar ambos stacks **manteniendo los recursos**.

### **B)** Lanzar un stack de CloudFormation que despliegue todos los recursos del stack. Agregar un atributo **Retain** a la **política de eliminación (DeletionPolicy)** de cada uno de estos recursos. Eliminar el stack original. Crear un nuevo stack con **un nombre diferente** e **importar los recursos que fueron retenidos del stack original**. Eliminar el atributo **Retain** del stack para volver a la plantilla original.

### **C)** Usar el **registro de CloudFormation (CloudFormation registry)** para crear **hooks personalizados** para todos los recursos del stack de CloudFormation. Luego eliminar el stack original de CloudFormation y crear uno nuevo con el **nombre actualizado**.

Usando los hooks creados anteriormente, **importar los recursos nuevamente en el stack recién creado**.

### **D)** Lanzar un stack de CloudFormation que despliegue todos los recursos del stack. Agregar un atributo **Retain** a la política de eliminación del **bucket de S3 y de la instancia EC2**. Agregar un atributo **Snapshot** a la política de eliminación del **volumen de Amazon EBS**. Eliminar el stack original. Crear un nuevo stack con un nombre diferente e **importar los recursos que fueron retenidos del stack original**. Eliminar los atributos **Retain** y **Snapshot** del stack para volver a la plantilla original.

# **Respuesta correcta:** **B**

# ***Explicación general***

## ***Opción correcta***

*Lanzar un **stack de CloudFormation** que despliegue todos los recursos del stack.
Agregar un atributo **Retain** a la **política de eliminación (DeletionPolicy)** de cada uno de estos recursos.*

*Eliminar el stack original.*

*Crear un **nuevo stack con un nombre diferente** e **importar los recursos que fueron retenidos del stack original**.*

*Eliminar el atributo **Retain** del stack para **volver a la plantilla original**.*

# ***Explicación***

*Con el atributo **DeletionPolicy**, puedes **conservar** y, en algunos casos, **respaldar un recurso cuando su stack es eliminado**.*

*Debes especificar un atributo **DeletionPolicy** para cada recurso cuyo comportamiento quieras controlar.*

*Si un recurso **no tiene un atributo DeletionPolicy**, AWS CloudFormation **elimina el recurso por defecto**.*

*Para **mantener un recurso cuando se elimina el stack**, debes especificar:*

*DeletionPolicy: Retain*

*para ese recurso.*

*Puedes usar **Retain** con **cualquier tipo de recurso**.*

*Para los recursos que **admiten snapshots**, como **AWS::EC2::Volume**, puedes especificar:*

*DeletionPolicy: Snapshot*

*para que CloudFormation **cree un snapshot antes de eliminar el recurso**.*

# ***Pasos que deben seguirse***

1. *Lanzar un **stack de CloudFormation** que despliegue los recursos necesarios.*
2. *Agregar el atributo **Retain** a la **política de eliminación de todos los recursos** desplegados por el stack.*
3. *Eliminar el stack y **verificar que los recursos se mantengan**.*
4. *Crear un **nuevo stack** e **importar los recursos que fueron retenidos del stack original**. Este nuevo stack se crea **con un nombre diferente**.*
5. *Eliminar el atributo **Retain** del stack para **volver a la plantilla original**.*

# ***Opciones incorrectas***

### ***Opción incorrecta***

*Agregar **Retain** al bucket S3 y a la instancia EC2, y **Snapshot** al volumen EBS.*

*Esto es incorrecto porque el atributo **Snapshot elimina el recurso después de crear el snapshot**.
Por lo tanto, **el recurso original no se conserva**, lo cual **no cumple con el requisito del problema**.*

### ***Opción incorrecta***

*Usar **CloudFormation Registry** para crear **hooks personalizados**.*

*Un **hook** es una lógica personalizada ejecutable que **inspecciona recursos antes de que se aprovisionen**.*

*Los hooks pueden analizar los recursos que CloudFormation está a punto de crear.
Si detectan recursos que **no cumplen con las políticas de la organización**, pueden **detener el proceso de aprovisionamiento**.*

*Sin embargo, **los hooks no sirven para este caso de uso**, por lo que esta opción es incorrecta.*

### ***Opción incorrecta***

*Crear dos stacks y usar **DependsOn**.*

*Esta opción **solo funciona como distractor**, ya que **no resuelve el problema de renombrar el stack manteniendo los recursos**.*

# ***Fuentes***

*AWS CloudFormation – DeletionPolicy[https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-attribute-deletionpolicy.html](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-attribute-deletionpolicy.html)*

*AWS Blog – Renaming a CloudFormation Stack While Keeping Resources[https://aws.amazon.com/blogs/infrastructure-and-automation/keep-your-aws-resources-when-you-rename-an-aws-cloudformation-stack/](https://aws.amazon.com/blogs/infrastructure-and-automation/keep-your-aws-resources-when-you-rename-an-aws-cloudformation-stack/)*

*AWS CloudFormation Hooks Documentation[https://docs.aws.amazon.com/cloudformation-cli/latest/userguide/hooks.html](https://docs.aws.amazon.com/cloudformation-cli/latest/userguide/hooks.html)*

# 3. Una empresa quiere **imponer regulaciones para evitar inicios de sesión frecuentes** de los ingenieros DevOps en las **instancias de Amazon EC2**. Además, existe la condición adicional de que **se debe enviar una notificación inmediata al equipo de seguridad si ocurre cualquier inicio de sesión**.

**¿Qué solución sugerirías para cumplir con estos requisitos?**

### Configurar el **Amazon CloudWatch Agent** en cada instancia **Amazon EC2** con la configuración para **enviar todos los logs a Amazon CloudWatch Logs**. Crear un **CloudWatch metric filter** para detectar **inicios de sesión de usuarios**. Usar **Amazon SNS** para notificar al equipo de seguridad cuando se detecte un inicio de sesión.

### Configurar **AWS CloudTrail** para rastrear **llamadas a la API de AWS** y registrarlas en **Amazon CloudWatch Logs**. Suscribir **CloudWatch Logs a Amazon Kinesis**. Configurar una **función AWS Lambda** como consumidor del **stream de Kinesis** para procesar los logs y detectar inicios de sesión. Usar **Amazon SNS** para enviar notificaciones al equipo de seguridad cuando se detecte un evento de inicio de sesión.

### Configurar el **Amazon Inspector Agent** en cada instancia EC2 para enviar todos los logs a **CloudWatch Logs**. Crear un **CloudWatch metric filter** para detectar inicios de sesión de usuarios. Usar **Amazon SNS** para notificar al equipo de seguridad cuando se detecte un inicio de sesión.

### Configurar el **Amazon CloudWatch Agent** en cada instancia EC2 para enviar todos los logs a **CloudWatch Logs**. Crear un **CloudWatch subscription filter** para detectar inicios de sesión de usuarios. Usar **Amazon SNS** para notificar al equipo de seguridad cuando se detecte un inicio de sesión.

# **Respuesta correcta:** **A**

# ***Explicación general (traducción)***

## ***Opción correcta***

*Configurar el **Amazon CloudWatch Agent** en cada instancia **Amazon EC2** con la configuración para **enviar todos los logs a Amazon CloudWatch Logs**.*

*Crear un **CloudWatch metric filter** para detectar **inicios de sesión de usuarios**.*

*Usar **Amazon SNS** para notificar al equipo de seguridad cuando se detecte un inicio de sesión.*

## ***Explicación***

*El **Amazon CloudWatch Agent** puede instalarse en instancias **EC2** para **recopilar y enviar datos de logs a CloudWatch Logs**.*

*Al configurar un **metric filter dentro de CloudWatch Logs**, es posible **buscar patrones específicos**, como por ejemplo **eventos de inicio de sesión de usuarios**.*

*Si se encuentra un inicio de sesión en los datos de logs, **Amazon SNS se utiliza para enviar una notificación inmediata al equipo de seguridad**.*

*Puedes usar **CloudWatch Logs** para monitorear aplicaciones y sistemas utilizando datos de logs **casi en tiempo real**.*

*Por ejemplo, **CloudWatch Logs puede rastrear el número de errores que ocurren en los logs de tu aplicación** y enviarte una notificación cuando **la tasa de errores supere un umbral que hayas definido**.*

*El **CloudWatch Logs Agent envía datos de logs cada cinco segundos por defecto**, y este comportamiento puede ser **configurado por el usuario**.*

*Puedes monitorear eventos de logs a medida que se envían a CloudWatch Logs **creando Metric Filters**.*

*Los **Metric Filters convierten datos de logs en métricas de Amazon CloudWatch**, que pueden usarse para:*

- *generar **gráficas***
- *crear **alarmas***

*Fuente:[https://aws.amazon.com/cloudwatch/faqs/](https://aws.amazon.com/cloudwatch/faqs/)*

# ***Opciones incorrectas***

## ***Opción incorrecta***

*Configurar el **CloudWatch Agent** en cada instancia EC2 para enviar logs a **CloudWatch Logs**, crear un **subscription filter** para detectar logins y usar **SNS** para notificaciones.*

*Las **subscriptions** se usan para **obtener un flujo en tiempo real de eventos de logs desde CloudWatch Logs** y enviarlos a otros servicios como:*

- ***Amazon Kinesis***
- ***Amazon Kinesis Data Firehose***
- ***AWS Lambda***

*para procesamiento personalizado, análisis o carga en otros sistemas.*

*Un **subscription filter** define:*

- *el patrón de filtro*
- *el destino al que se enviarán los eventos coincidentes*

*Sin embargo, para **convertir datos de logs en métricas de CloudWatch que permitan crear gráficos o alarmas**, se deben usar **Metric Filters**, no **Subscription Filters**.*

*Por lo tanto, esta opción es incorrecta.*

## ***Opción incorrecta***

*Configurar **AWS CloudTrail** para registrar llamadas a la **API de AWS** y enviarlas a **CloudWatch Logs**, luego procesarlas con **Kinesis y Lambda**.*

***AWS CloudTrail registra llamadas a la API de AWS**, incluyendo eventos de inicio de sesión.*

*Sin embargo, **CloudTrail suele entregar los logs con un retraso promedio de aproximadamente 5 minutos después de la llamada a la API**, y este tiempo **no está garantizado**.*

*Por lo tanto, **no cumple con el requisito de notificación inmediata**, y esta opción es incorrecta.*

## ***Opción incorrecta***

*Configurar el **Amazon Inspector Agent** para enviar logs a CloudWatch Logs y detectar logins.*

***Amazon Inspector** es un servicio de **gestión de vulnerabilidades** que analiza continuamente cargas de trabajo de AWS en busca de:*

- ***vulnerabilidades de software***
- ***exposición de red no intencionada***

*Inspector puede analizar:*

- *instancias **EC2***
- *imágenes de contenedor en **Amazon ECR***
- *funciones **AWS Lambda***

*Pero **no puede utilizarse para detectar eventos de inicio de sesión de usuarios en tiempo real**.*

*Por lo tanto, esta opción es incorrecta.*

# ***Fuentes***

*Amazon CloudWatch FAQs[https://aws.amazon.com/cloudwatch/faqs/](https://aws.amazon.com/cloudwatch/faqs/)*

*CloudWatch Features[https://aws.amazon.com/cloudwatch/features/#CloudWatch_Logs](https://aws.amazon.com/cloudwatch/features/#CloudWatch_Logs)*

*AWS CloudTrail Documentation[https://docs.aws.amazon.com/awscloudtrail/latest/userguide/how-cloudtrail-works.html](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/how-cloudtrail-works.html)*

*4.* Una empresa de comercio electrónico está desplegando su aplicación principal en instancias de Amazon EC2.

El equipo DevOps necesita una solución para consultar (query) tanto los logs de la aplicación como la actividad de la API de la cuenta AWS.

Como AWS Certified DevOps Engineer – Professional, ¿qué solución recomendarías para cumplir con estos requisitos?

### Configurar **AWS CloudTrail** para entregar los **logs de API a Amazon S3**. Usar **Amazon CloudWatch Agent** para enviar los **logs desde las instancias EC2 a Amazon CloudWatch Logs**. Usar **Amazon Athena** para consultar **ambos conjuntos de logs**.

### Configurar **AWS CloudTrail** para entregar los **logs de API a CloudWatch Logs**. Usar **Amazon CloudWatch Agent** para enviar los **logs desde las instancias EC2 a Amazon CloudWatch Logs**. Usar **CloudWatch Logs Insights** para consultar **ambos conjuntos de logs**.

### Configurar **AWS CloudTrail** para entregar los **logs de API a Amazon S3**. Usar **Amazon CloudWatch Agent** para enviar los **logs desde las instancias EC2 a Amazon S3**. Usar **Amazon Athena** para consultar **ambos conjuntos de logs**.

### Configurar **AWS CloudTrail** para entregar los **logs de API a Kinesis Data Streams**. Usar **Amazon CloudWatch Agent** para enviar los **logs desde las instancias EC2 a Kinesis Data Streams**. Enviar ambos streams a **Kinesis Data Analytics** para ejecutar consultas casi en tiempo real.

# **Respuesta correcta:** **B**

*EXPLICACIÓN GENERAL*

*OPCIÓN CORRECTA*

*Configurar **AWS CloudTrail** para entregar los **logs de API a CloudWatch Logs**.
Utilizar **Amazon CloudWatch Agent** para enviar los logs desde las **instancias EC2 a Amazon CloudWatch Logs**.
Utilizar **CloudWatch Logs Insights** para consultar ambos conjuntos de logs.*

*EXPLICACIÓN*

*CloudTrail está habilitado por defecto para tu cuenta de AWS. Puedes usar **Event history** en la consola de CloudTrail para **ver, buscar, descargar, archivar, analizar y responder a la actividad de la cuenta** en toda tu infraestructura de AWS. Esto incluye actividad realizada a través de:*

- *AWS Management Console*
- *AWS Command Line Interface (CLI)*
- *AWS SDKs y APIs*

*Para mantener un registro continuo de eventos en tu cuenta de AWS, puedes crear un **trail**. Un trail permite que CloudTrail entregue archivos de logs a un **bucket de Amazon S3**.*

*Por defecto, cuando creas un trail en la consola:*

- *el trail se aplica a **todas las regiones de AWS***
- *registra eventos de todas las regiones dentro de la partición de AWS*
- *entrega los archivos de logs al **bucket de Amazon S3 que especifiques***

*Además, puedes configurar otros servicios de AWS para **analizar o actuar sobre los datos de eventos recopilados en los logs de CloudTrail**.*

*También puedes configurar **CloudTrail con CloudWatch Logs** para monitorear los logs de API del trail y recibir notificaciones cuando ocurra actividad específica.*

*Cuando configuras tu trail para enviar eventos a **CloudWatch Logs**, CloudTrail envía **solo los eventos que coinciden con la configuración del trail**.*

*Por ejemplo, si configuras tu trail para registrar **solo eventos de datos**, el trail enviará únicamente **eventos de datos al grupo de logs de CloudWatch Logs**.*

*CloudTrail admite enviar los siguientes tipos de eventos a CloudWatch Logs:*

- *eventos de datos (data events)*
- *eventos de Insights*
- *eventos de administración (management events)*

*Puedes recopilar **métricas y logs** de:*

- *instancias **Amazon EC2***
- *servidores **on-premises***

*utilizando el **CloudWatch agent**.*

*Las métricas recopiladas por el CloudWatch agent pueden almacenarse y visualizarse en **CloudWatch**, igual que cualquier otra métrica de CloudWatch.*

*El **namespace predeterminado** para las métricas recopiladas por el CloudWatch agent es:*

*CWAgent*

*Sin embargo, puedes especificar un namespace diferente cuando configures el agente.*

*Los logs recopilados por el **CloudWatch unified agent** se procesan y almacenan en **Amazon CloudWatch Logs**.*

*Para este caso de uso, puedes hacer que **AWS CloudTrail** y **Amazon CloudWatch Agent** envíen sus respectivos logs a **CloudWatch Logs**. Luego puedes usar **CloudWatch Logs Insights** para consultar ambos conjuntos de logs.*

*OPCIONES INCORRECTAS*

*Configurar AWS CloudTrail para entregar los logs de API a **Amazon S3**, usar el **CloudWatch Agent** para enviar logs desde EC2 a **Amazon S3**, y usar **Amazon Athena** para consultar ambos conjuntos de logs.*

*No es posible usar **Amazon CloudWatch Agent para enviar logs desde instancias EC2 directamente a Amazon S3**, por lo tanto esta opción es incorrecta.*

*Configurar AWS CloudTrail para entregar los logs de API a **Kinesis Data Streams** y usar el **CloudWatch Agent** para enviar logs desde EC2 a **Kinesis Data Streams**, luego dirigir ambos streams a **Kinesis Data Analytics** para ejecutar consultas casi en tiempo real.*

*No es posible entregar logs de API de **CloudTrail directamente a Kinesis Data Streams**.
Tampoco es posible enviar logs desde EC2 a **Kinesis Data Streams usando CloudWatch Agent**.
Por lo tanto, esta opción es incorrecta.*

*Configurar AWS CloudTrail para entregar los logs de API a **Amazon S3**, usar el **CloudWatch Agent** para enviar logs desde EC2 a **CloudWatch Logs**, y usar **Amazon Athena** para consultar ambos conjuntos de logs.*

*No es posible usar **Amazon Athena para consultar logs que están en CloudWatch Logs**, por lo tanto esta opción es incorrecta.*

*REFERENCIAS*

[*https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-getting-started.html*](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-getting-started.html)

[*https://docs.aws.amazon.com/awscloudtrail/latest/userguide/send-cloudtrail-events-to-cloudwatch-logs.html*](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/send-cloudtrail-events-to-cloudwatch-logs.html)

*5.* Una aplicación web está alojada en instancias Amazon EC2 detrás de un Application Load Balancer (ALB).

Mientras se usa CodeDeploy Blue/Green deployment para desplegar una nueva versión, el despliegue falló durante el evento de ciclo de vida AllowTraffic.

El equipo DevOps no encontró errores en los logs del despliegue.

¿Cuál de las siguientes identificarías como la causa raíz del fallo del despliegue?

1. Un evento de scale-in o cualquier otro evento de terminación, durante un despliegue en progreso, provoca que la instancia se desasocie del grupo Auto Scaling de Amazon EC2 y la instancia falle en el evento de ciclo de vida AllowTraffic.
2. Las health checks configuradas incorrectamente en el Application Load Balancer (ALB) son responsables de este problema.
3. La causa del fallo podría ser un script del último despliegue exitoso que nunca se ejecuta correctamente.
    
    Crear un nuevo despliegue y especificar que los fallos de ApplicationStop, BeforeBlockTraffic y AfterBlockTraffic deben ignorarse.
    
4. Si una instancia es terminada entre eventos de ciclo de vida o antes de que comience el primer paso del evento de ciclo de vida, entonces el evento AllowTraffic falla sin generar logs.

RESPUESTA CORRECTA B

EXPLICACIÓN GENERAL

OPCIÓN CORRECTA

Una **configuración incorrecta de los health checks en el Application Load Balancer (ALB)** es responsable de este problema.

En algunos casos, un **Blue/Green deployment falla durante el evento de ciclo de vida AllowTraffic**, pero los **logs del despliegue no indican la causa del fallo**.

Este fallo generalmente se debe a **health checks mal configurados en Elastic Load Balancing**, ya sea para:

- **Classic Load Balancer**
- **Application Load Balancer**
- **Network Load Balancer**

que se utilizan para **gestionar el tráfico del deployment group**.

Para resolver el problema, se deben **revisar y corregir los errores en la configuración de health checks del load balancer**.

OPCIONES INCORRECTAS

La causa del fallo podría ser un **script del último despliegue exitoso que nunca se ejecuta correctamente**. Crear un nuevo despliegue y especificar que los fallos de **ApplicationStop, BeforeBlockTraffic y AfterBlockTraffic** deben ignorarse.

Durante un despliegue, el **CodeDeploy agent ejecuta los scripts especificados para ApplicationStop, BeforeBlockTraffic y AfterBlockTraffic en el archivo AppSpec del último despliegue exitoso**.

(Todos los demás scripts se ejecutan desde el **AppSpec del despliegue actual**).

Si alguno de estos scripts contiene un error y **no se ejecuta correctamente**, el despliegue puede fallar.

Este tipo de fallo **genera logs**, y **no falla específicamente en el evento AllowTraffic**.

Si una instancia es **terminada entre eventos de lifecycle o antes de que comience el primer paso del lifecycle event**, entonces el evento **AllowTraffic falla sin generar logs**.

Esta afirmación es **incorrecta**.

Los despliegues **no fallan durante hasta una hora** cuando una instancia es terminada durante un despliegue.

Un evento de **scale-in o cualquier evento de terminación durante un despliegue en progreso** provoca que la instancia se **desasocie del Amazon EC2 Auto Scaling group** y la instancia falle en el evento **AllowTraffic**.

Durante un despliegue en progreso, un **evento de scale-in o cualquier evento de terminación provoca que la instancia se desasocie del Auto Scaling Group (ASG) y luego se termine**.

Como el despliegue no puede completarse, **este falla**.

Sin embargo, este error es **específico de los Auto Scaling Groups (ASG)** y **no está relacionado con el problema descrito en la pregunta**.

REFERENCIAS

[https://docs.aws.amazon.com/codedeploy/latest/userguide/troubleshooting-deployments.html](https://docs.aws.amazon.com/codedeploy/latest/userguide/troubleshooting-deployments.html)

[https://docs.aws.amazon.com/codedeploy/latest/userguide/troubleshooting-ec2-instances.html](https://docs.aws.amazon.com/codedeploy/latest/userguide/troubleshooting-ec2-instances.html)

6. Una empresa utiliza una arquitectura de aplicación sin servidor para procesar miles de solicitudes usando AWS Lambda con Amazon DynamoDB como base de datos.Se utiliza una Amazon API Gateway REST API para invocar una función AWS Lambda que carga una gran cantidad de datos desde la base de datos Amazon DynamoDB. Esto da como resultado latencias de arranque en frío (cold start) de 7 a 10 segundos. Las tablas de DynamoDB ya han sido configuradas con DynamoDB Accelerator (DAX) para reducir la latencia. Sin embargo, los clientes siguen reportando latencia de la aplicación, especialmente durante las horas pico. La aplicación recibe tráfico máximo entre las 2 PM y 5 PM todos los días y luego se reduce gradualmente, reportando un tráfico mínimo después de las 8 PM. ¿Cómo debería un ingeniero DevOps configurar la función AWS Lambda para reducir su latencia en todo momento?

1. Configurar la función AWS Lambda para usar provisioned concurrency.
    
    Configurar Application Auto Scaling en la función Lambda con valores de provisioned concurrency de 1 (mínimo) y 100 (máximo) respectivamente.
    
2. Configurar el entorno de ejecución de la función Lambda para usar hasta 10,240 MB de almacenamiento efímero.
    
    Este caché transitorio de datos entre invocaciones puede ser accedido desde el código de la función Lambda mediante el espacio /tmp.
    
3. Configurar la función AWS Lambda para usar reserved concurrency.
    
    Configurar Application Auto Scaling en la función Lambda con reserved concurrency como la mitad de las instancias de la función Lambda invocadas durante las horas de tráfico pico.
    
4. Usar las capas de la función Lambda (Lambda layers) para el procesamiento en paralelo de solicitudes del entorno de ejecución de Lambda.
    
    Desplegar la función Lambda como un archivo .zip para utilizar la funcionalidad de Lambda layer.
    

Respuesta: A

EXPLICACIÓN GENERAL

OPCIÓN CORRECTA

Configurar la función **AWS Lambda** para usar **provisioned concurrency**.

Configurar **Application Auto Scaling** en la función Lambda con valores de **provisioned concurrency de 1 (mínimo) y 100 (máximo)** respectivamente.

EXPLICACIÓN

Para una función **Lambda**, la **concurrencia** es el número de solicitudes en curso que tu función está manejando al mismo tiempo.

**Provisioned concurrency** es el número de **entornos de ejecución preinicializados** que deseas asignar a tu función.

Estos entornos de ejecución están preparados para **responder inmediatamente a las solicitudes entrantes de la función**.

Configurar **provisioned concurrency** genera cargos en tu cuenta de AWS.

ESTIMACIÓN DE LA CONCURRENCIA PROVISIONADA NECESARIA

Si tu función ya está recibiendo tráfico, puedes ver fácilmente sus métricas de concurrencia usando **CloudWatch metrics**.

En particular, la métrica:

ConcurrentExecutions

muestra el número de **invocaciones concurrentes para cada función en tu cuenta**.

Cuando trabajas con **provisioned concurrency**, AWS Lambda recomienda **incluir un buffer del 10 % adicional** sobre la concurrencia que tu función normalmente necesita.

Por ejemplo:

Si tu función suele alcanzar un pico de **200 solicitudes concurrentes**, deberías configurar:

220 de provisioned concurrency

(200 solicitudes concurrentes + 10 % = 220 provisioned concurrency)

Puedes **mitigar los problemas de cold start** configurando la cantidad óptima de **provisioned concurrency** para la función Lambda.

OPTIMIZACIÓN DE LATENCIA CON PROVISIONED CONCURRENCY

[https://docs.aws.amazon.com/lambda/latest/dg/provisioned-concurrency.html](https://docs.aws.amazon.com/lambda/latest/dg/provisioned-concurrency.html)

ESTIMACIÓN PRECISA DE PROVISIONED CONCURRENCY

[https://docs.aws.amazon.com/lambda/latest/dg/provisioned-concurrency.html](https://docs.aws.amazon.com/lambda/latest/dg/provisioned-concurrency.html)

OPCIONES INCORRECTAS

Configurar la función **AWS Lambda** para usar **Reserved concurrency**.

Configurar **Application Auto Scaling** en la función Lambda con **reserved concurrency como la mitad de las instancias invocadas durante las horas pico**.

**Reserved concurrency** es el número **máximo de instancias concurrentes que deseas asignar a tu función**.

Cuando una función tiene reserved concurrency, **ninguna otra función puede utilizar esa concurrencia**.

Reserved concurrency es más adecuado para **casos de uso donde el tráfico es constante y predecible durante el día**.

Configurar el entorno de ejecución de la función Lambda para usar hasta **10,240 MB de almacenamiento efímero**.

Este caché transitorio de datos entre invocaciones puede ser accedido desde el código de la función Lambda mediante el espacio **/tmp**.

Para aplicaciones intensivas en datos como:

- inferencia de machine learning
- cálculos financieros

los clientes a menudo necesitan leer y escribir grandes cantidades de datos en almacenamiento efímero.

El entorno de ejecución de Lambda proporciona un **sistema de archivos efímero accesible mediante /tmp**, que se conserva durante la vida útil del entorno de ejecución y puede servir como **caché temporal entre invocaciones**.

Esta opción actúa **solo como distractor**.

Usar **Lambda layers** para el procesamiento paralelo de solicitudes del runtime de Lambda.

Desplegar la función Lambda como un **archivo .zip** para utilizar la funcionalidad de Lambda layer.

Una **Lambda layer** es un archivo **.zip** que puede contener **código o datos adicionales**.

Una layer puede contener:

- librerías
- un runtime personalizado
- datos
- archivos de configuración

Las layers promueven **compartición de código y separación de responsabilidades**, lo que permite iterar más rápido en la lógica de negocio.

Esta opción **no es relevante para el caso de uso dado**.

REFERENCIAS

[https://docs.aws.amazon.com/lambda/latest/dg/lambda-concurrency.html#calculating-concurrency](https://docs.aws.amazon.com/lambda/latest/dg/lambda-concurrency.html#calculating-concurrency)

[https://docs.aws.amazon.com/lambda/latest/dg/provisioned-concurrency.html](https://docs.aws.amazon.com/lambda/latest/dg/provisioned-concurrency.html)

[https://aws.amazon.com/about-aws/whats-new/2022/03/aws-lambda-configure-ephemeral-storage/](https://aws.amazon.com/about-aws/whats-new/2022/03/aws-lambda-configure-ephemeral-storage/)

7. Una empresa de medios utiliza ampliamente buckets de Amazon S3 para almacenar archivos de imágenes, documentos y otros datos específicos del negocio. La empresa ha ordenado habilitar logging para todos los buckets de Amazon S3. El equipo de auditoría publica reportes de todos los recursos de AWS que no cumplen con los estándares de seguridad de la empresa. Hasta hace poco, el equipo de seguridad tomaba la lista de auditoría de buckets S3 no conformes y ejecutaba acciones de remediación manualmente para cada recurso. Este proceso no solo consume mucho tiempo, sino que también deja los recursos no conformes vulnerables durante un largo período. ¿Qué combinación de pasos debería tomar un DevOps Engineer para cumplir con estos requisitos utilizando una solución automatizada?

(Seleccione dos)

1. Configurar AWS Config Auto Remediation para la regla de AWS Config s3-bucket-logging-enabled.
    
    Desde la lista de acciones de remediación elegir AWS Lambda para implementar una función personalizada que habilite el logging de S3 para el ID del bucket S3 recibido como parámetro.
    
2. El AutomationAssumeRole en los parámetros de la acción de remediación debe poder ser asumido por SSM.
    
    El usuario debe tener permisos pass-role para ese rol cuando cree la acción de remediación en AWS Config.
    
3. Mientras se configura la acción de remediación, pasar el ID del recurso de los recursos no conformes a la acción de remediación.
    
    Esta configuración es obligatoria para que la auto-remediation funcione.
    
4. Configurar AWS Config Auto Remediation para la regla de AWS Config s3-bucket-logging-enabled.
    
    Desde la lista de acciones de remediación elegir AWS-ConfigureS3BucketLogging.
    
5. Configurar AWS Config Auto Remediation para la regla de AWS Config s3-logging-enabled.
    
    Crear tu propia acción de remediación personalizada usando AWS Systems Manager Automation documents para habilitar logging en el bucket S3.
    

***RESPUESTA CORRECTA: B y D***

*EXPLICACIÓN GENERAL*

*AWS Config **Auto Remediation** permite **remediar automáticamente recursos no conformes evaluados por reglas de AWS Config**. Puedes asociar **acciones de remediación con reglas de AWS Config** y configurarlas para que se ejecuten automáticamente sin intervención manual.*

*AWS Config permite:*

- *Elegir una **acción de remediación desde una lista predefinida**.*
- *Crear **acciones de remediación personalizadas usando AWS Systems Manager Automation documents**.*
- *Reintentar la auto-remediación si el recurso continúa **no conforme después del primer intento**.*

*Para este caso:*

1. *Debes tener **AWS Config habilitado en la cuenta**.*
2. *El parámetro **AutomationAssumeRole** debe ser **asumible por AWS Systems Manager (SSM)**.*
3. *El usuario que configure la remediación debe tener permisos **iam:PassRole**.*
4. *Ese rol debe tener los permisos necesarios para ejecutar el **documento de automatización de SSM**.*

*La regla **s3-bucket-logging-enabled** ya tiene una acción de remediación administrada por AWS:*

*AWS-ConfigureS3BucketLogging*

*Por lo tanto, **no es necesario crear código personalizado**.*

*OPCIONES INCORRECTAS*

***A.** Aunque se puede usar **AWS Lambda para remediación personalizada**, en este caso **no es necesario**, porque AWS Config ya tiene una acción predefinida para habilitar el logging de S3.*

***C.** El **Resource ID parameter** puede usarse para pasar el ID del recurso no conforme a la acción de remediación.*

*Sin embargo, **no es obligatorio para que Auto Remediation funcione**.*

***E.** La regla correcta de AWS Config es:*

*s3-bucket-logging-enabled*

*No **s3-logging-enabled**, por lo que esta opción es incorrecta.*

*FUENTE*

*AWS Config Auto Remediation for S3 Compliance[https://aws.amazon.com/blogs/mt/aws-config-auto-remediation-s3-compliance/](https://aws.amazon.com/blogs/mt/aws-config-auto-remediation-s3-compliance/)*

8. Un equipo de soporte quiere ser notificado mediante una notificación de Amazon Simple Notification Service (Amazon SNS) cuando un AWS Glue Job falle después de un reintento. Como DevOps Engineer, ¿cómo implementarías este requerimiento?

A. Configurar eventos de Amazon EventBridge para AWS Glue. Configurar una notificación de Amazon Simple Notification Service (Amazon SNS) cuando el Glue job falle después de un reintento.

B. Revisar el AWS Personal Health Dashboard para detectar AWS Glue jobs fallidos. Programar una función AWS Lambda para recoger el evento fallido desde el service health dashboard y activar una notificación de Amazon Simple Notification Service (Amazon SNS) cuando falle un reintento.

C. Amazon Simple Notification Service (Amazon SNS) no puede reintentar fallos; usar Amazon Simple Queue Service (Amazon SQS) con dead-letter queues para reintentar los Glue jobs fallidos.

D. Configurar eventos de Amazon EventBridge para AWS Glue. Definir una función AWS Lambda como destino de EventBridge. La función Lambda tendrá la lógica para procesar los eventos y filtrar el evento de reintento del Glue job. Publicar un mensaje a Amazon Simple Notification Service (Amazon SNS) si se detecta dicho evento.

**RESPUESTA CORRECTA: D**

## ***EXPLICACIÓN GENERAL***

*La solución correcta es **usar Amazon EventBridge para capturar eventos de AWS Glue**, enviar esos eventos a **AWS Lambda**, y que **Lambda filtre específicamente el evento cuando un Glue Job falla después de un retry**. Si se detecta ese evento, la función **publica un mensaje en Amazon SNS** para notificar al equipo de soporte.*

***Arquitectura:***

1. ***AWS Glue** genera eventos de estado del job.*
2. ***Amazon EventBridge** captura esos eventos.*
3. ***AWS Lambda** procesa el evento y verifica si corresponde a **job retry failure**.*
4. *Si coincide, **Lambda publica un mensaje en Amazon SNS**.*
5. ***SNS envía la notificación** al equipo de soporte.*

*Esto es necesario porque **EventBridge por sí solo no puede filtrar con suficiente lógica para detectar específicamente el fallo después del retry**, por lo que **Lambda implementa esa lógica de filtrado**.*

*Pasos:*

1. *Crear un **SNS Topic**.*
2. *Crear una **función Lambda** que:*
    - *reciba eventos de EventBridge*
    - *verifique el evento de **retry failure***
    - *publique un mensaje en SNS.*
3. *Crear una **regla de EventBridge para AWS Glue** que invoque la Lambda.*

*Referencia:[https://repost.aws/knowledge-center/glue-job-fail-retry-lambda-sns-alerts](https://repost.aws/knowledge-center/glue-job-fail-retry-lambda-sns-alerts)*

## ***OPCIONES INCORRECTAS***

### ***A.***

*Configurar EventBridge para AWS Glue y enviar directamente una notificación SNS cuando el Glue job falle en un retry.*

***Por qué parece correcta:** EventBridge puede enviar eventos directamente a SNS.*

***Por qué es incorrecta:** El requisito es **notificar solo cuando el job falle después de un retry**.
EventBridge **no tiene lógica suficiente para filtrar este escenario específico**, por lo que se necesita **Lambda para procesar el evento y aplicar la lógica de filtrado**.*

### ***B.***

*Revisar AWS Personal Health Dashboard y usar Lambda para detectar fallos.*

***Por qué parece correcta:** El Personal Health Dashboard puede generar eventos relacionados con servicios AWS.*

***Por qué es incorrecta:** El **AWS Personal Health Dashboard** solo proporciona notificaciones sobre **eventos de infraestructura AWS o mantenimiento**, no sobre **fallos de jobs específicos de Glue**.
Por lo tanto, **no es relevante para este caso de uso**.*

### ***C.***

*SNS no puede reintentar fallos, usar SQS DLQ para reintentar los Glue jobs.*

***Por qué parece correcta:** Las **Dead-Letter Queues (DLQ)** se usan comúnmente para manejar fallos y reintentos.*

***Por qué es incorrecta:** El requisito **no es reintentar el job**, sino **notificar cuando el retry falle**.
Por lo tanto, **SQS DLQ no resuelve el problema**.*

## ***FUENTE***

*AWS re:Post[https://repost.aws/knowledge-center/glue-job-fail-retry-lambda-sns-alerts](https://repost.aws/knowledge-center/glue-job-fail-retry-lambda-sns-alerts)*

9. Una regla administrada **cloudformation-stack-drift-detection-check** de **AWS Config** está definida para detectar **drift en recursos de AWS CloudFormation**. El equipo DevOps enfrenta dos problemas:

a) Cómo detectar **drifts de recursos personalizados (custom resources)** de CloudFormation.

b) El estado del stack aparece como **IN_SYNC** en la consola de **CloudFormation**, pero el siguiente error aparece en la detección de drift:

*"While AWS CloudFormation failed to detect drift, defaulting to NON_COMPLIANT. Re-evaluate the rule and try again. If the problem persists contact AWS CloudFormation support"*

Como **DevOps Engineer**, ¿qué pasos deberías combinar para solucionar los problemas mencionados?

(**Seleccione dos**)

A. Recibes el error cuando el **rol de AWS Identity and Access Management (IAM)** para el parámetro requerido **cloudformationRoleArn** no tiene suficientes permisos de servicio.

B. La regla de **AWS Config** depende de la disponibilidad de la acción **DetectStackDrift** de la API de **CloudFormation**. AWS Config establece el estado de la regla como **NON_COMPLIANT** cuando ocurre **throttling**.

C. **AWS CloudFormation** no soporta **drift detection para custom resources**.

D. Este error es un **false positive** y puede ignorarse en este escenario.

E. **AWS CloudFormation** solo determina drift para **valores de propiedades que están explícitamente definidos**. Define explícitamente los valores de propiedades para tu **custom resource** para que se incluyan en la detección de drift.

**RESPUESTA CORRECTA:
B y C**

## **EXPLICACIÓN GENERAL**

La regla administrada de **AWS Config cloudformation-stack-drift-detection-check** verifica si la **configuración real de un stack de CloudFormation difiere de la configuración esperada definida en el template**.

Un stack se considera:

- **COMPLIANT** → cuando el estado de drift es **IN_SYNC**
- **NON_COMPLIANT** → cuando el estado es **DRIFTED**

**AWS CloudFormation Drift Detection** permite detectar cambios no gestionados en los recursos del stack. Esto permite tomar acciones correctivas para **volver a sincronizar los recursos con el template de CloudFormation**.

Para el escenario del problema existen dos puntos clave:

**1️⃣ Dependencia de la API DetectStackDrift**

La regla de **AWS Config** depende de la acción **DetectStackDrift** de la API de **CloudFormation**.

Si ocurre **throttling o “Rate Exceeded”**, AWS Config **marca la regla automáticamente como NON_COMPLIANT**, generando el error observado.

**2️⃣ Limitación con Custom Resources**

Actualmente **AWS CloudFormation NO soporta drift detection para custom resources**.

El drift detection solo funciona con **tipos de recursos soportados por CloudFormation**.

Por lo tanto:

- No es posible detectar drift en **custom resources**
- Esto explica el comportamiento observado en el escenario.

## **OPCIONES INCORRECTAS**

### **A.**

Recibes el error cuando el rol IAM para cloudformationRoleArn no tiene permisos suficientes.

**Por qué parece correcta:** Los errores de permisos son comunes al ejecutar operaciones de CloudFormation.

**Por qué es incorrecta:** Un error de permisos generaría un mensaje diferente, por ejemplo:

*"Your stack drift detection operation for the specific stack has failed. Check your existing AWS CloudFormation role permissions and add the missing permissions."*

El error mostrado **no corresponde a un problema de IAM**.

### **D.**

Este error es un **false positive** y puede ignorarse.

**Por qué parece correcta:** A veces AWS Config puede marcar recursos incorrectamente como NON_COMPLIANT.

**Por qué es incorrecta:** El error tiene una causa técnica clara:

- **throttling de DetectStackDrift**
- **falta de soporte para custom resources**

Por lo tanto **no debe ignorarse**.

### **E.**

CloudFormation solo detecta drift para propiedades explícitamente definidas.

**Por qué parece correcta:** Es cierto que CloudFormation detecta drift solo para propiedades explícitamente definidas en el template o parámetros.

**Por qué es incorrecta:** Aunque esto es cierto, **no aplica a custom resources**, porque **estos recursos no están soportados para drift detection**.

## **FUENTES**

[https://docs.aws.amazon.com/config/latest/developerguide/cloudformation-stack-drift-detection-check.html](https://docs.aws.amazon.com/config/latest/developerguide/cloudformation-stack-drift-detection-check.html)

[https://repost.aws/knowledge-center/config-cloudformation-drift-detection](https://repost.aws/knowledge-center/config-cloudformation-drift-detection)

[https://repost.aws/questions/QUolH-EWnHRNGDbnUiu3chXw/how-to-detect-drifts-of-cloudformation-custom-resource](https://repost.aws/questions/QUolH-EWnHRNGDbnUiu3chXw/how-to-detect-drifts-of-cloudformation-custom-resource)

**10.** Una empresa de e-commerce tiene una aplicación serverless que consiste en CloudFront, API Gateway y funciones Lambda. La empresa te ha contratado para mejorar el proceso actual de despliegue, el cual crea una nueva versión de la función Lambda y luego ejecuta un script de AWS CLI para realizar el despliegue. Si la nueva versión genera errores, otro script de CLI se ejecuta para desplegar la versión anterior funcional de la función Lambda.

La empresa ha solicitado reducir el tiempo necesario para desplegar nuevas versiones de las funciones Lambda y también reducir el tiempo necesario para detectar y hacer rollback cuando se identifican errores.

¿Qué solución sugerirías para este caso de uso?

A. Usar Serverless Application Model (SAM) y aprovechar la funcionalidad integrada de traffic shifting de SAM para desplegar la nueva versión de Lambda mediante CodeDeploy, y usar funciones de prueba pre-traffic y post-traffic para verificar el código. Realizar rollback si se activan alarmas de CloudWatch.

B. Configurar y desplegar stacks anidados de CloudFormation con la distribución CloudFront y API Gateway en el stack padre. Crear y desplegar un stack hijo que contenga las funciones Lambda. Para gestionar cambios en Lambda, crear un CloudFormation change set y desplegarlo. Si la función Lambda falla, revertir el change set a la versión anterior.

C. Configurar y desplegar stacks anidados de CloudFormation con la distribución CloudFront y API Gateway en el stack padre. Crear y desplegar un stack hijo que contenga las funciones Lambda. Para cambios en Lambda, crear un CloudFormation change set y desplegarlo. Usar funciones de prueba pre-traffic y post-traffic del change set para verificar el despliegue. Realizar rollback si se activan alarmas de CloudWatch.

D. Configurar y desplegar un stack de CloudFormation que contenga un nuevo endpoint de API Gateway que apunte a la nueva versión de Lambda. Probar el origen de CloudFront actualizado que apunta a este nuevo endpoint de API Gateway y, si se detectan errores, revertir el origen de CloudFront al endpoint anterior de API Gateway que funcionaba correctamente.

**RESPUESTA CORRECTA: A**

## **EXPLICACIÓN GENERAL**

La mejor solución es utilizar **AWS Serverless Application Model (SAM)** junto con **AWS CodeDeploy** para implementar **despliegues seguros de AWS Lambda mediante traffic shifting**.

**AWS SAM** es un framework open-source para construir aplicaciones **serverless**. Permite definir recursos como **Lambda, API Gateway y DynamoDB** con una sintaxis simplificada en **YAML**. Durante el despliegue, **SAM transforma la plantilla en CloudFormation**, que finalmente aprovisiona los recursos.

Para este caso de uso, **SAM incluye integración nativa con CodeDeploy para despliegues graduales de Lambda**, lo que permite:

- **Publicar una nueva versión de Lambda sin enviar tráfico inmediatamente**
- Ejecutar una **prueba PreTraffic** para validar la nueva versión
- **Desplazar el tráfico gradualmente** hacia la nueva versión (traffic shifting)
- Ejecutar **validaciones PostTraffic**
- **Rollback automático si se activan alarmas de CloudWatch**

Esto permite:

- **Reducir el tiempo para detectar errores**
- **Reducir el tiempo de rollback**
- Evitar enviar **100% del tráfico inmediatamente a una versión nueva**

Flujo de despliegue:

1. SAM despliega una **nueva versión de Lambda**
2. **CodeDeploy ejecuta la prueba PreTraffic**
3. Si la prueba es exitosa, **CodeDeploy mueve tráfico gradualmente**
4. **CloudWatch monitorea errores**
5. Si una alarma se activa → **rollback automático**

Referencia:

[https://aws.amazon.com/blogs/compute/implementing-safe-aws-lambda-deployments-with-aws-codedeploy/](https://aws.amazon.com/blogs/compute/implementing-safe-aws-lambda-deployments-with-aws-codedeploy/)

## **OPCIONES INCORRECTAS**

### **B.**

Usar **nested stacks de CloudFormation y change sets**.

**Por qué parece correcta:** Los **CloudFormation change sets** permiten revisar cambios antes de desplegarlos.

**Por qué es incorrecta:** Los change sets **no ayudan a detectar errores rápidamente**, porque el fallo solo se detecta **después de ejecutar el despliegue**.
No hay **traffic shifting ni validaciones automáticas**.

Referencia:

[https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-changesets.html](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-changesets.html)

### **C.**

Usar change sets con **pre-traffic y post-traffic tests**.

**Por qué parece correcta:** Los términos **pre-traffic y post-traffic** son comunes en despliegues de CodeDeploy.

**Por qué es incorrecta:
CloudFormation change sets NO tienen funciones pre-traffic ni post-traffic.** Esto es una característica de **CodeDeploy para Lambda**, no de CloudFormation.

### **D.**

Crear un nuevo endpoint de API Gateway y cambiar el origen de CloudFront.

**Por qué parece correcta:** Podría permitir probar una nueva versión antes de redirigir tráfico.

**Por qué es incorrecta:** No reduce el tiempo para detectar errores ni automatiza el rollback.
El cambio de endpoint requiere **operación manual y cambios de infraestructura**, lo cual **incrementa el overhead operativo**.

## **FUENTES**

[https://aws.amazon.com/blogs/compute/implementing-safe-aws-lambda-deployments-with-aws-codedeploy/](https://aws.amazon.com/blogs/compute/implementing-safe-aws-lambda-deployments-with-aws-codedeploy/)

[https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/automating-updates-to-serverless-apps.html](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/automating-updates-to-serverless-apps.html)

[https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-changesets.html](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-changesets.html)

**11.** Un entorno de **producción** tiene instancias **Amazon EC2** configuradas para registrar todos los logs de aplicación/sistema mediante el **CloudWatch Logs agent**, el cual está configurado en todas las instancias.

La empresa ha introducido recientemente una **política de seguridad** que exige **terminar cualquier instancia EC2 de producción a la que se acceda manualmente por un usuario que no sea un administrador en menos de una hora**.

Todas las instancias de producción están configuradas con **Auto Scaling Groups**.

Como **DevOps Engineer**, ¿cómo automatizarías este proceso?

A. Configurar una **alarma de Amazon CloudWatch** que se active por los datos de eventos de login y que invoque una **función AWS Lambda**. Configurar la función Lambda para añadir una **etiqueta de decommission** a la instancia EC2 que generó el evento de login. Programar una **regla de Amazon EventBridge** para invocar la función Lambda cada hora y terminar todas las instancias EC2 con la etiqueta **decommission**.

B. Crear una **alarma de Amazon CloudWatch** que se active por los datos del evento de login. Crear una acción de alarma que notifique a los administradores del sistema mediante un mensaje usando **Amazon Simple Notification Service (SNS)**. Los administradores del sistema terminarán manualmente la instancia.

C. Crear una **suscripción de CloudWatch Logs** a una **AWS Step Function** que se coordine con **AWS Lambda** y **Amazon EventBridge** para crear una solución automatizada serverless. Configurar una función Lambda para añadir una etiqueta de **decommission** a la instancia EC2 que produjo el evento de login. Crear una regla de **Amazon EventBridge** para invocar una segunda función Lambda cada hora, la cual terminará todas las instancias con esa etiqueta.

D. Crear una **suscripción de CloudWatch Logs** para enviar los datos de eventos de login de las instancias EC2 a una **función AWS Lambda**. Configurar la Lambda para añadir una **etiqueta de decommission** a la instancia EC2 que generó el evento de login. Programar una **regla de Amazon EventBridge** para invocar otra función Lambda cada hora que terminará todas las instancias EC2 con la etiqueta **decommission**.

**RESPUESTA CORRECTA:
D**

## **EXPLICACIÓN GENERAL**

La solución correcta es **usar una suscripción de CloudWatch Logs para enviar los eventos de login a una función AWS Lambda**.

**CloudWatch Logs Subscriptions** permiten recibir **un flujo en tiempo real de eventos de log** y enviarlos a otros servicios como:

- **AWS Lambda**
- **Amazon Kinesis**
- **Kinesis Data Firehose**

En este caso:

1️⃣ Los **logs de login** generados en las instancias EC2 se envían a **CloudWatch Logs** mediante el **CloudWatch Logs agent**.

2️⃣ Una **suscripción de CloudWatch Logs** envía esos eventos a **Lambda**.

3️⃣ La **Lambda analiza el evento de login** y añade una etiqueta:

decommission=true

a la instancia EC2 que generó el acceso no autorizado.

4️⃣ Se configura una **regla programada de Amazon EventBridge** (por ejemplo cada hora).

5️⃣ Esta regla ejecuta **otra función Lambda** que:

- busca instancias EC2 con la etiqueta **decommission**
- **termina dichas instancias automáticamente**

Esto cumple todos los requisitos:

✔ Automatización completa

✔ Reacción basada en logs en tiempo real

✔ Terminación dentro de una hora

✔ Compatible con Auto Scaling Groups (las instancias serán reemplazadas automáticamente)

## **OPCIONES INCORRECTAS**

### **A.**

Usar una **CloudWatch Alarm** para invocar Lambda.

**Por qué parece correcta:** CloudWatch puede reaccionar a métricas o eventos.

**Por qué es incorrecta:** Las **CloudWatch Alarms no pueden invocar Lambda directamente como acción de alarma**.
Se necesitaría **SNS como intermediario**.

Referencia:

[https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html)

### **B.**

Enviar una notificación a administradores usando **SNS**.

**Por qué parece correcta:** SNS se usa comúnmente para alertas operativas.

**Por qué es incorrecta:** El requisito pide **automatización completa**.
Esta opción requiere **terminación manual de instancias**.

### **C.**

Usar **CloudWatch Logs + Step Functions + Lambda + EventBridge**.

**Por qué parece correcta:** Step Functions puede orquestar workflows serverless.

**Por qué es incorrecta:** Es **innecesariamente complejo (overkill)** para este caso.
Una simple **Lambda activada por CloudWatch Logs subscription** es suficiente.

Referencia:

[https://docs.aws.amazon.com/step-functions/latest/dg/welcome.html](https://docs.aws.amazon.com/step-functions/latest/dg/welcome.html)

## **FUENTES**

[https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/Subscriptions.html](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/Subscriptions.html)

[https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-create-rule-schedule.html](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-create-rule-schedule.html)

[https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html)

[https://docs.aws.amazon.com/step-functions/latest/dg/welcome.html](https://docs.aws.amazon.com/step-functions/latest/dg/welcome.html)

**Pregunta 12**

Una empresa de data analytics quiere mover todos sus clientes que pertenecen a industrias reguladas y sensibles a la seguridad, como servicios financieros y healthcare, a la AWS Cloud, ya que ofrece capacidades de seguridad listas para usar proporcionadas por AWS.

El equipo DevOps está desarrollando un framework para validar la adopción de las mejores prácticas de AWS y estándares de cumplimiento reconocidos por la industria.

La AWS Management Console es el método preferido por los equipos internos para aprovisionar recursos.

¿Qué estrategias adoptarías para cumplir estos requisitos de negocio para evaluar, auditar y monitorear continuamente las configuraciones de los recursos de AWS?

(Seleccione dos)

A. Utilizar el CloudWatch Logs agent para recopilar todos los logs de AWS SDK. Buscar los datos de logs usando un conjunto predefinido de patrones de filtro que coincidan con llamadas de API mutating. Usar CloudWatch alarms para enviar notificaciones en SNS cuando se realicen cambios no intencionados. Archivar los logs exportándolos en batch a Amazon S3 y analizarlos con Amazon Athena.

B. Utilizar AWS Config rules para auditar cambios en los recursos de AWS y monitorear el cumplimiento de las configuraciones ejecutando evaluaciones de las reglas a una frecuencia que elijas. Desarrollar reglas personalizadas de AWS Config para establecer un enfoque de desarrollo test-driven activando la evaluación cuando cualquier recurso dentro del alcance de la regla cambie su configuración.

C. Utilizar la integración de CloudTrail con SNS para notificar automáticamente actividades de API no autorizadas. Asegurar que CloudTrail esté habilitado para todas las cuentas y servicios disponibles de AWS. Usar funciones Lambda para revertir automáticamente cambios no autorizados en los recursos de AWS.

D. Habilitar CloudTrail trails y configurar eventos de CloudTrail para revisar y monitorear actividades de gestión de todas las cuentas de AWS registrando estas actividades en CloudWatch Logs usando una clave KMS. Asegurar que CloudTrail esté habilitado para todas las cuentas y servicios disponibles de AWS.

E. Utilizar eventos de EventBridge para aprovechar capacidades en tiempo casi real para monitorear patrones de eventos del sistema y activar funciones Lambda para revertir automáticamente cambios no autorizados en recursos de AWS. Enviar notificaciones mediante SNS topics para mejorar el tiempo de respuesta ante incidentes.

## **EXPLICACIÓN GENERAL**

Para **evaluar, auditar y monitorear continuamente las configuraciones de los recursos en AWS**, los servicios clave son **AWS Config** y **AWS CloudTrail**.

### **1️⃣ AWS Config – Evaluación de cumplimiento de configuraciones**

**AWS Config** permite **evaluar, auditar y revisar continuamente las configuraciones de los recursos de AWS**.

Con **AWS Config Rules** puedes definir configuraciones esperadas (compliance policies).

AWS Config detecta cuando un recurso **viola esas reglas** y lo marca como **NON_COMPLIANT**.

Capacidades clave:

- Registrar **historial de configuraciones de recursos**
- Detectar **cambios de configuración**
- Evaluar **cumplimiento frente a reglas**
- Usar **managed rules o custom rules**

Tipos de evaluación de reglas:

**Configuration Change Trigger**

- Se ejecuta cuando **cambia la configuración de un recurso**
- Ideal para **compliance continuo**

**Periodic Trigger**

- Evaluación a intervalos (por ejemplo cada **24 horas**)

Esto permite implementar **frameworks de compliance automatizados**.

Referencia:

[https://aws.amazon.com/config/](https://aws.amazon.com/config/)

### **2️⃣ AWS CloudTrail – Auditoría de actividades**

**AWS CloudTrail** registra todas las **acciones realizadas en una cuenta AWS**, incluyendo:

- AWS Management Console
- AWS CLI
- AWS SDK
- Otros servicios AWS

Cada acción genera un **evento CloudTrail**, que permite:

- Auditoría
- Gobernanza
- Compliance
- Análisis de actividad

Los eventos pueden enviarse a:

- **CloudWatch Logs**
- **Amazon S3**

En este caso, se recomienda **enviar los eventos a CloudWatch Logs protegidos con KMS** para auditoría centralizada.

CloudTrail registra:

- **Management Events** → operaciones de control (crear recursos, modificar políticas, etc.)
- **Data Events** → operaciones de datos (S3 object access, Lambda invocation, etc.)

Los **management events** se almacenan gratuitamente durante **90 días** en el historial de eventos.

Referencia:

[https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-concepts.html](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-concepts.html)

## **OPCIONES INCORRECTAS**

### **A.**

Usar **CloudWatch Logs agent para recopilar logs del AWS SDK**.

**Por qué parece correcta:** CloudWatch Logs permite analizar logs y detectar cambios mediante filtros.

**Por qué es incorrecta:** El escenario indica que **los recursos se aprovisionan desde la AWS Management Console**, no necesariamente desde **SDK o API calls**.
Además, **AWS Config y CloudTrail están diseñados específicamente para auditoría y compliance**.

### **C.**

Usar **CloudTrail + SNS + Lambda para revertir cambios no autorizados**.

**Por qué parece correcta:** Permite detectar actividades y reaccionar automáticamente.

**Por qué es incorrecta:** El requisito es **evaluar, auditar y monitorear configuraciones**, **no revertir cambios automáticamente**.

### **E.**

Usar **EventBridge + Lambda para revertir cambios no autorizados**.

**Por qué parece correcta:** EventBridge puede reaccionar a eventos en tiempo casi real.

**Por qué es incorrecta:** De nuevo, el requisito es **auditoría y monitoreo**, no **remediación automática**.

## **FUENTES**

[https://aws.amazon.com/config/](https://aws.amazon.com/config/)

[https://docs.aws.amazon.com/config/latest/developerguide/evaluate-config_manage-rules.html](https://docs.aws.amazon.com/config/latest/developerguide/evaluate-config_manage-rules.html)

[https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-concepts.html#cloudtrail-concepts-management-events](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-concepts.html#cloudtrail-concepts-management-events)

Pregunta 13

Un DevOps Engineer está trabajando en múltiples aplicaciones que necesitan configurarse para Application Auto Scaling, sin embargo, existen algunas restricciones de aplicación que deben considerarse:

a) Una aplicación serverless está construida en AWS Lambda con el siguiente patrón de tráfico: el tráfico comienza a incrementarse los miércoles, alcanza su punto máximo el jueves, y empieza a disminuir el viernes.

b) Otra aplicación crítica se ejecuta en Spot Fleet. La utilización de CPU del fleet debe mantenerse alrededor del 50% cuando cambia la carga de la aplicación.

¿Qué soluciones permitirían cumplir estos requisitos?

(Seleccione dos)

A. Usar una política de Auto Scaling programado (Scheduled scaling) y crear una acción programada con AWS Lambda como scalable target. Especificar la capacidad mínima y máxima según los requisitos. Se puede usar AWS CLI, SDKs o CloudFormation para configurar el escalado programado.

B. Crear una métrica de Amazon CloudWatch para rastrear una utilización promedio de CPU del 50% para el Spot Fleet. Crear una política de auto scaling de seguimiento (tracking auto-scaling policy) con una alarma de CloudWatch basada en la métrica creada desde la consola de AWS.

C. Usar una política de Auto Scaling programado (Scheduled scaling) y crear una acción programada con instancias Spot como scalable target. Especificar la capacidad mínima y máxima según los requisitos.

D. Crear una política de auto scaling de seguimiento de objetivo (target tracking) que apunte a una utilización promedio de CPU del 50% para una aplicación que se ejecuta en Spot Fleet. Se puede crear y administrar la política de seguimiento utilizando AWS CLI, SDKs o CloudFormation.

E. Crear una métrica de Amazon CloudWatch para rastrear la utilización de la función AWS Lambda. Configurar una política de step scaling estableciendo el límite superior, límite inferior y valores de umbral para la función Lambda.

**RESPUESTA CORRECTA:
A y D**

## **EXPLICACIÓN GENERAL**

El escenario tiene **dos tipos distintos de auto scaling**, por lo que se necesitan **dos estrategias diferentes**:

### **1️⃣ AWS Lambda – Tráfico predecible (Miércoles → Viernes)**

El tráfico sigue un **patrón predecible semanal**, por lo que la mejor solución es **Scheduled Scaling**.

**Scheduled Scaling** permite definir acciones de escalado en **horarios específicos**, por ejemplo:

- Incrementar capacidad **miércoles**
- Mantener capacidad **jueves**
- Reducir capacidad **viernes**

Con **Application Auto Scaling** puedes definir:

- **Scalable target** → función Lambda
- **Min capacity**
- **Max capacity**
- **Schedule (cron o rate)**

Esto permite preparar capacidad antes de los picos de tráfico.

Referencia:

[https://docs.aws.amazon.com/autoscaling/application/userguide/application-auto-scaling-scheduled-scaling.html](https://docs.aws.amazon.com/autoscaling/application/userguide/application-auto-scaling-scheduled-scaling.html)

### **2️⃣ Spot Fleet – CPU objetivo 50%**

Cuando el requisito es **mantener una métrica cerca de un valor específico**, la mejor opción es **Target Tracking Auto Scaling**.

En este caso:

- Métrica → **Average CPU Utilization**
- Target → **50%**

Application Auto Scaling:

- escala **out** cuando CPU > 50%
- escala **in** cuando CPU < 50%

Esto mantiene capacidad suficiente sin sobreaprovisionar recursos.

Referencia:

[https://docs.aws.amazon.com/autoscaling/application/userguide/application-auto-scaling-target-tracking.html](https://docs.aws.amazon.com/autoscaling/application/userguide/application-auto-scaling-target-tracking.html)

## **OPCIONES INCORRECTAS**

### **B.**

Crear métrica CloudWatch y alarma manual para Target Tracking.

**Por qué parece correcta:** Target tracking usa métricas CloudWatch.

**Por qué es incorrecta:** Cuando usas **Target Tracking**, **Application Auto Scaling crea y gestiona automáticamente las alarmas de CloudWatch**.
No debes crearlas manualmente.

### **C.**

Scheduled scaling para **Spot Instances**.

**Por qué parece correcta:** Scheduled scaling funciona con muchos servicios.

**Por qué es incorrecta:** El requisito es **mantener CPU en 50% dinámicamente**, no escalar en horarios fijos.
Esto requiere **Target Tracking**, no scheduled scaling.

### **E.**

Step scaling para Lambda.

**Por qué parece correcta:** Step scaling usa métricas y umbrales.

**Por qué es incorrecta:
Step scaling no es compatible con AWS Lambda** en Application Auto Scaling.

Servicios no soportados incluyen:

- Lambda
- DynamoDB
- Amazon MSK
- Amazon Keyspaces
- Neptune
- ElastiCache

Referencia:

[https://docs.aws.amazon.com/autoscaling/application/userguide/application-auto-scaling-step-scaling-policies.html](https://docs.aws.amazon.com/autoscaling/application/userguide/application-auto-scaling-step-scaling-policies.html)

## **FUENTES**

[https://docs.aws.amazon.com/autoscaling/application/userguide/application-auto-scaling-target-tracking.html](https://docs.aws.amazon.com/autoscaling/application/userguide/application-auto-scaling-target-tracking.html)

[https://docs.aws.amazon.com/autoscaling/application/userguide/application-auto-scaling-scheduled-scaling.html](https://docs.aws.amazon.com/autoscaling/application/userguide/application-auto-scaling-scheduled-scaling.html)

[https://docs.aws.amazon.com/autoscaling/application/userguide/application-auto-scaling-step-scaling-policies.html](https://docs.aws.amazon.com/autoscaling/application/userguide/application-auto-scaling-step-scaling-policies.html)

**Pregunta 14**

Una aplicación se ejecuta en un conjunto de instancias Amazon EC2 configuradas con un Auto Scaling Group (ASG). Tanto instancias Spot como On-Demand se utilizan según la configuración del ASG. En general, el ASG parece estar funcionando como se espera. Sin embargo, el equipo DevOps ha identificado algunos problemas:

a) Durante una actividad de scale-in, el ASG ha terminado una instancia en la Availability Zone (AZ) que ya tenía menos instancias que la otra AZ.

b) En algunos casos, el ASG ha superado la capacidad máxima especificada del grupo.

¿Qué razones pueden explicar este comportamiento?

(Seleccione dos)

A. Amazon EC2 Auto Scaling puede exceder temporalmente la capacidad máxima especificada del grupo hasta en un 10% (o al menos una instancia, lo que sea mayor) durante una actividad de rebalancing.

B. Cuando un Auto Scaling group con una política de instancias mixtas (mixed instances policy) reduce capacidad (scale-in), Amazon EC2 Auto Scaling primero identifica cuál tipo de instancia (Spot u On-Demand) debe terminarse. Esto puede causar temporalmente un desequilibrio entre las AZs.

C. Puedes especificar solo una función Lambda en las termination policies de un Auto Scaling group. Si se configuran más de una función Lambda, el ASG se comportará de forma ambigua.

D. La instancia lanzada con la plantilla de lanzamiento o launch configuration más antigua se termina primero. Esto puede provocar temporalmente un grupo desbalanceado.

E. Con la política de terminación por defecto, las instancias que están más cerca de la siguiente hora de facturación se terminan primero. Esto puede causar temporalmente un desequilibrio en la distribución de instancias entre las AZs.

RESPUESTA CORRECTA: A y B

## 

## **EXPLICACIÓN GENERAL**

El comportamiento observado se explica por **dos características internas de Amazon EC2 Auto Scaling**.

### **1️⃣ Rebalancing puede exceder temporalmente el máximo del ASG**

Durante actividades de **rebalancing**, **Amazon EC2 Auto Scaling puede exceder temporalmente el max capacity del grupo**.

El sistema puede superar el máximo por:

- **10% del tamaño del grupo**
- **o al menos 1 instancia (lo que sea mayor)**

Esto ocurre porque **Auto Scaling primero lanza nuevas instancias antes de terminar las antiguas** para evitar afectar la **disponibilidad o el rendimiento de la aplicación**.

Ejemplo:

Max capacity = 10

Durante rebalanceo → puede llegar a **11 instancias temporalmente**

Una vez completado el rebalanceo, el grupo vuelve a su tamaño normal.

### **2️⃣ Mixed Instances Policy puede causar desbalance temporal**

Cuando un **Auto Scaling Group usa una Mixed Instances Policy (Spot + On-Demand)** y ocurre un **scale-in**, el proceso es:

1. ASG primero decide **qué tipo de instancia terminar**
    - Spot
    - On-Demand
2. Luego aplica las **termination policies dentro de cada AZ**

Este proceso puede **generar temporalmente un desbalance entre Availability Zones**, porque la decisión inicial se basa en **tipo de instancia**, no en **balance de AZ**.

Referencia:

[https://docs.aws.amazon.com/autoscaling/ec2/userguide/ec2-auto-scaling-termination-policies.html#default-termination-policy-mixed-instances-groups](https://docs.aws.amazon.com/autoscaling/ec2/userguide/ec2-auto-scaling-termination-policies.html#default-termination-policy-mixed-instances-groups)

## **OPCIONES INCORRECTAS**

### **C.**

Solo se puede configurar una función Lambda en termination policies.

**Por qué parece correcta:** ASG permite **termination policies personalizadas**.

**Por qué es incorrecta:** No se pueden configurar **múltiples funciones Lambda**, y además **no está relacionado con el problema descrito**.

### **D.**

Se termina primero la instancia con el launch template más antiguo.

**Por qué parece correcta:** Existe una política relacionada con **launch template / launch configuration**.

**Por qué es incorrecta:
Auto Scaling primero intenta balancear las AZs**, independientemente de la política de terminación.
Por eso este criterio **no causaría el desbalance observado**.

### **E.**

Se terminan instancias cercanas a la siguiente hora de facturación.

**Por qué parece correcta:** En el pasado AWS optimizaba costos por hora de facturación.

**Por qué es incorrecta:** La **Default Termination Policy usa múltiples criterios**, no solo el ciclo de facturación.
Además, **el balance entre AZs tiene prioridad**.

## **FUENTES**

[https://docs.aws.amazon.com/autoscaling/ec2/userguide/ec2-auto-scaling-termination-policies.html](https://docs.aws.amazon.com/autoscaling/ec2/userguide/ec2-auto-scaling-termination-policies.html)

[https://docs.aws.amazon.com/autoscaling/ec2/userguide/as-instance-termination.html](https://docs.aws.amazon.com/autoscaling/ec2/userguide/as-instance-termination.html)

**Pregunta 15**

Como buena práctica de seguridad, una empresa ha decidido respaldar todos sus volúmenes de Amazon Elastic Block Store (Amazon EBS) cada semana. Para implementar este cambio, los desarrolladores deben etiquetar todos los volúmenes EBS con una etiqueta personalizada. Esta etiqueta indica la frecuencia de backup (por ejemplo: weekly) y una solución automatizada lee esa etiqueta para programar los respaldos de cada volumen.

Sin embargo, una auditoría reciente detectó que algunos volúmenes EBS no fueron respaldados porque no tenían la etiqueta personalizada requerida.

Como DevOps Engineer, ¿qué solución elegirías para garantizar que todos los volúmenes EBS de la cuenta tengan la etiqueta de backup?

A. Crear una regla de Amazon EventBridge que responda a un evento CreateVolume de EBS en AWS CloudTrail Logs. Configurar un runbook de AWS Systems Manager Automation personalizado para aplicar la etiqueta personalizada con el valor semanal por defecto. Especificar este runbook como destino de la regla de EventBridge.

B. Configurar AWS Config en la cuenta de AWS. Usar una regla administrada para el tipo de recurso EC2::Instance que devuelva un fallo de cumplimiento si la etiqueta personalizada no está aplicada a los volúmenes EBS adjuntos a la instancia. Configurar una acción de remediación que use AWS Systems Manager Automation para aplicar la etiqueta con frecuencia de backup a todos los volúmenes no conformes.

C. Crear una regla de Amazon EventBridge que responda a un evento EBS VolumeBackup check desde AWS Trusted Advisor. Configurar un runbook personalizado de AWS Systems Manager Automation para aplicar la etiqueta personalizada con el valor semanal por defecto. Especificar este runbook como destino de la regla de EventBridge.

D. Configurar AWS Config en la cuenta de AWS. Usar una regla administrada para el tipo de recurso EC2::Volume que devuelva un fallo de cumplimiento si la etiqueta personalizada no está aplicada al volumen EBS. Configurar una acción de remediación que use AWS Systems Manager Automation para aplicar la etiqueta con frecuencia de backup a todos los volúmenes no conformes.

**RESPUESTA CORRECTA: D**

## **EXPLICACIÓN GENERAL**

La mejor solución es utilizar **AWS Config** para **auditar continuamente los recursos** y detectar si **los volúmenes EBS no tienen la etiqueta requerida para el backup**.

AWS Config permite:

- Evaluar configuraciones de recursos
- Detectar **recursos no conformes**
- Aplicar **remediación automática**

Para este caso:

1️⃣ **Configurar AWS Config en la cuenta**

2️⃣ Usar la **regla administrada required-tags**

Esta regla permite verificar si los recursos tienen **las etiquetas obligatorias definidas por la empresa**.

En este caso:

- Resource Type → **AWS::EC2::Volume**
- Tag requerido → **backup-frequency**

3️⃣ Si un volumen **no tiene la etiqueta**, AWS Config lo marca como:

NON_COMPLIANT

4️⃣ Configurar **Auto Remediation**

Usando **AWS Systems Manager Automation Runbooks**, se puede:

- aplicar automáticamente la etiqueta
- definir el valor por defecto → **weekly**

Arquitectura:

EBS Volume

↓

AWS Config rule (required-tags)

↓

NON_COMPLIANT

↓

SSM Automation Runbook

↓

Apply backup tag automatically

Esto garantiza **compliance continuo**, incluso si alguien **elimina la etiqueta después de crear el volumen**.

Referencia:

[https://docs.aws.amazon.com/config/latest/developerguide/required-tags.html](https://docs.aws.amazon.com/config/latest/developerguide/required-tags.html)

## **OPCIONES INCORRECTAS**

### **A.**

Usar **EventBridge con CreateVolume event**

**Por qué parece correcta:** Puede detectar cuando se crea un volumen.

**Por qué es incorrecta:** Solo detecta **la creación del volumen**.
Si alguien **elimina la etiqueta después**, el sistema **no detectará la no conformidad**.

AWS Config permite **evaluación continua**, no solo eventos iniciales.

### **B.**

AWS Config con **Resource Type EC2::Instance**

**Por qué parece correcta:** Las instancias EC2 pueden tener volúmenes EBS.

**Por qué es incorrecta:** El recurso que debe auditarse es **EBS Volume**, no la **instancia EC2**.

El tipo correcto es:

AWS::EC2::Volume

### **C.**

Trusted Advisor + EventBridge

**Por qué parece correcta:** Trusted Advisor revisa **best practices**.

**Por qué es incorrecta:** Trusted Advisor **no permite remediación automática** ni enforcement de tags.

Solo **proporciona recomendaciones**.

## **FUENTES**

AWS Config required-tags rule

[https://docs.aws.amazon.com/config/latest/developerguide/required-tags.html](https://docs.aws.amazon.com/config/latest/developerguide/required-tags.html)

AWS Config Auto Remediation with Systems Manager

[https://aws.amazon.com/blogs/mt/remediate-noncompliant-aws-config-rules-with-aws-systems-manager-automation-runbooks/](https://aws.amazon.com/blogs/mt/remediate-noncompliant-aws-config-rules-with-aws-systems-manager-automation-runbooks/)

**Pregunta 16**

Una empresa usa **múltiples cuentas AWS** para aislar y gestionar aplicaciones de negocio. Este entorno multi-cuenta consiste en un **AWS Transit Gateway** que enruta todo el tráfico saliente desde una cuenta de red. Un **appliance de firewall** inspecciona todo el tráfico antes de que sea reenviado a un **internet gateway**.

El firewall está configurado para enviar **logs a Amazon CloudWatch Logs** para todos los eventos generados.

Recientemente, el equipo de seguridad ha indicado posibles **fugas de recursos**. Como **DevOps Engineer**, se te ha pedido configurar una **alerta al equipo de seguridad si el firewall genera un evento de severidad Critical**.

¿Cómo debería configurar el DevOps Engineer este requerimiento?

A. Crear un **metric filter en Amazon CloudWatch** filtrando los logs para coincidir con el término **Critical**. Publicar una **métrica personalizada** para el hallazgo. Usar **CloudWatch Lambda Insights** para filtrar los eventos Critical y enviar una notificación usando **Amazon Simple Notification Service (Amazon SNS)**. Suscribir el correo del equipo de seguridad al topic SNS.

B. Crear un **metric filter en Amazon CloudWatch** filtrando los logs para coincidir con el término **Critical**. Configurar un **metric stream hacia Amazon Kinesis Data Firehose** con **AWS Lambda** como destino. Procesar el stream con Lambda y enviar una notificación a **Amazon SNS** si se detecta un evento crítico. Suscribir el correo del equipo de seguridad al topic SNS.

C. Crear un **Transit Gateway Flow Log** para capturar toda la información enviada por el firewall. Publicar los logs en **Amazon CloudWatch Logs**. Crear un **metric filter en CloudWatch** filtrando los logs para coincidir con el término **Critical**. Publicar una métrica personalizada y configurar una **CloudWatch alarm** para enviar una notificación a **Amazon SNS**. Suscribir el correo del equipo de seguridad al topic SNS.

D. Crear un **metric filter en Amazon CloudWatch** filtrando los logs para coincidir con el término **Critical** en los logs. Publicar una **métrica personalizada** para el hallazgo y configurar una **CloudWatch alarm** para publicar una notificación a un **Amazon SNS topic**. Suscribir el correo del equipo de seguridad al topic SNS.

**RESPUESTA CORRECTA: D**

## **EXPLICACIÓN GENERAL**

La solución correcta utiliza **CloudWatch Logs Metric Filters + CloudWatch Alarms + Amazon SNS**, que es el patrón estándar en AWS para **generar alertas basadas en logs**.

### **Flujo de la solución**

1️⃣ El **firewall appliance envía logs a CloudWatch Logs**.

2️⃣ Se crea un **CloudWatch Logs Metric Filter** que busca el término:

Critical

en los eventos de log.

3️⃣ Este filtro convierte los eventos detectados en una **métrica personalizada de CloudWatch**.

4️⃣ Se crea una **CloudWatch Alarm** sobre esa métrica.

5️⃣ Cuando la métrica supera el umbral (por ejemplo ≥1 evento), la alarma ejecuta una acción:

➡ **Publicar una notificación en un Amazon SNS Topic**

6️⃣ El **equipo de seguridad se suscribe al SNS Topic** (email, Slack, etc.).

Arquitectura:

Firewall Logs

↓

CloudWatch Logs

↓

Metric Filter ("Critical")

↓

Custom CloudWatch Metric

↓

CloudWatch Alarm

↓

SNS Topic

↓

Security Team Email

Este enfoque es:

- **Simple**
- **Nativo de AWS**
- **Near real-time**
- **Sin infraestructura adicional**

Referencia:

[https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch_architecture.html](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch_architecture.html)

## **OPCIONES INCORRECTAS**

### **A.**

Usar **CloudWatch Lambda Insights**.

**Por qué parece correcta:** CloudWatch tiene integraciones con Lambda.

**Por qué es incorrecta:
Lambda Insights es para monitoreo de funciones Lambda**, no para analizar logs de firewall.

### **B.**

Usar **Metric Streams + Kinesis Data Firehose + Lambda**.

**Por qué parece correcta:** Permite procesar métricas en tiempo real.

**Por qué es incorrecta:**

- **Metric Streams no soporta Kinesis Data Firehose como destino**
- Es **innecesariamente complejo** para una alerta simple.

### **C.**

Usar **Transit Gateway Flow Logs**.

**Por qué parece correcta:** Los Flow Logs registran tráfico de red.

**Por qué es incorrecta:** El requisito es **analizar logs del firewall**, no tráfico IP del **Transit Gateway**.

## **FUENTES**

CloudWatch Logs Metric Filters

[https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/MonitoringLogData.html](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/MonitoringLogData.html)

CloudWatch Metric Streams

[https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch-Metric-Streams.html](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch-Metric-Streams.html)

CloudWatch Lambda Insights

[https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Lambda-Insights.html](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Lambda-Insights.html)

Transit Gateway Flow Logs

[https://docs.aws.amazon.com/vpc/latest/tgw/tgw-flow-logs.html](https://docs.aws.amazon.com/vpc/latest/tgw/tgw-flow-logs.html)

**Pregunta 17**

Un DevOps Engineer debe diseñar un plan de Disaster Recovery (DR) para un workload en producción.

Arquitectura actual:

- La aplicación corre en Amazon EC2 detrás de un Application Load Balancer (ALB)
- Las instancias EC2 están en un Auto Scaling Group distribuido en múltiples Availability Zones
- Amazon Route 53 usa un alias record para apuntar al ALB
- La base de datos es Amazon RDS for PostgreSQL DB Instance

Requisitos del plan DR:

- RTO ≈ 3 horas
- RPO ≈ 15 minutos
- Solución costo-efectiva

¿Qué estrategia de Disaster Recovery debería elegir el DevOps Engineer?

A. Configurar el workload para ejecutarse simultáneamente en múltiples regiones AWS como una estrategia multi-site active/active. Replicar toda la carga de trabajo en otra región AWS. Usar replicación asíncrona de datos entre regiones para lograr near-zero RPO. Configurar Route 53 con latency-based routing para elegir entre endpoints regionales activos.

B. Usar una estrategia Pilot Light DR. Aprovisionar una copia de la infraestructura principal en otra región AWS. Crear una read replica de RDS en la nueva región y configurar el entorno para usar esta base de datos. Configurar Route 53 health checks para iniciar automáticamente DNS failover a la nueva región en caso de desastre. Promover la read replica.

C. Usar una estrategia Pilot Light DR. Aprovisionar una copia de toda la infraestructura en otra región AWS. Si ocurre un desastre, aplicar el backup incremental al RDS en la nueva región. Configurar Route 53 health checks para iniciar el failover DNS.

D. Usar una estrategia Warm Standby asegurando una copia reducida pero completamente funcional del entorno de producción en otra región AWS. Luego desplegar recursos suficientes para manejar el tráfico inicial y usar Auto Scaling para aumentar capacidad conforme crezca la carga.

**RESPUESTA CORRECTA: B**

## **EXPLICACIÓN GENERAL**

La estrategia de **Disaster Recovery más adecuada y costo-efectiva** para los requisitos dados es **Pilot Light**.

Requisitos del escenario:

- **RTO = 3 horas**
- **RPO = 15 minutos**
- **Cost-effective**

### **Qué es Pilot Light DR**

En la estrategia **Pilot Light** se mantiene **solo la infraestructura crítica activa en la región de DR**, mientras que el resto de los recursos se aprovisionan **solo cuando ocurre el desastre**.

Infraestructura siempre activa:

- **Base de datos replicada**
- **Datos sincronizados**
- **Configuración del entorno**

Infraestructura activada durante el desastre:

- EC2
- ALB
- Auto Scaling
- Servicios de aplicación

### **Arquitectura propuesta**

1️⃣ **Región primaria**

- EC2 + ALB
- RDS PostgreSQL primary

2️⃣ **Región de DR**

- **RDS Read Replica cross-region**
- Configuración de infraestructura preparada (pero no ejecutándose completamente)

3️⃣ **Failover**

- **Route 53 Health Checks**
- **DNS failover automático**

4️⃣ Durante el desastre

- Promover **RDS Read Replica → Primary**
- Lanzar **instancias EC2**
- Activar **Auto Scaling**
- Route 53 redirige tráfico

### **Por qué cumple los requisitos**

**RPO ≈ 15 minutos**

- logrado con **replicación continua de RDS**

**RTO ≈ 3 horas**

- suficiente para **levantar EC2 + ALB**

**Costo**

- Solo **DB replica siempre activa**
- EC2 no ejecutándose constantemente

## **OPCIONES INCORRECTAS**

### **A — Active/Active Multi-Region**

**Por qué parece correcta**

- Near-zero RPO
- Near-zero RTO

**Por qué es incorrecta**

- **Extremadamente costosa**
- Mantiene **infraestructura completa en ambas regiones**

No cumple el requisito **cost-effective**.

### **C — Pilot Light con backups incrementales**

**Por qué parece correcta**

- Usa backups y DR region

**Por qué es incorrecta**

- Restaurar **backups incrementales** puede tardar **horas o más**
- **No cumple RPO = 15 minutos**

Se requiere **replicación continua**, no backups.

### **D — Warm Standby**

**Por qué parece correcta**

- Baja RTO
- Sistema listo en otra región

**Por qué es incorrecta**

- Mantiene **infraestructura completa activa (aunque reducida)**
- **Más caro que Pilot Light**

Con **RTO de 3 horas**, **Pilot Light es suficiente y más barato**.

## **RESUMEN DR STRATEGIES (muy preguntado en el examen)**

| **Estrategia** | **RTO** | **RPO** | **Costo** |
| --- | --- | --- | --- |
| Backup & Restore | horas-días | horas | $ |
| **Pilot Light** | horas | minutos | $$ |
| Warm Standby | minutos | minutos | $$$ |
| Active-Active | segundos | near-zero | $$$$ |

## **FUENTES**

AWS Disaster Recovery Strategies

[https://aws.amazon.com/blogs/mt/establishing-rpo-and-rto-targets-for-cloud-applications/](https://aws.amazon.com/blogs/mt/establishing-rpo-and-rto-targets-for-cloud-applications/)

AWS DR Whitepaper

[https://aws.amazon.com/blogs/database/implementing-a-disaster-recovery-strategy-with-amazon-rds/](https://aws.amazon.com/blogs/database/implementing-a-disaster-recovery-strategy-with-amazon-rds/)

**Pregunta 18:**

Una empresa quiere crear una solución de monitoreo automatizada para generar notificaciones personalizadas en tiempo real sobre grupos de seguridad sin restricciones en la cuenta de AWS de la empresa. Las notificaciones deben contener el nombre y el ID del grupo de seguridad que no cumple con las reglas. El equipo de DevOps de la empresa ya ha activado la regla administrada de AWS Config **restricted-ssh**. El equipo también ha configurado un tema de Amazon Simple Notification Service (Amazon SNS) y ha suscrito al personal relevante a este.

¿Cuál de las siguientes opciones representa la MEJOR solución para el escenario dado?

**A.** Configurar una regla de Amazon EventBridge que coincida con un resultado de evaluación de AWS Config de tipo **ERROR** para la regla restricted-ssh. Crear un input transformer para la regla de EventBridge. Configurar la regla de EventBridge para publicar una notificación en el tema de SNS.

**B.** Configurar una regla de Amazon EventBridge que coincida con todos los resultados de evaluación de AWS Config para la regla restricted-ssh. Crear un input transformer para la regla de EventBridge. Configurar la regla de EventBridge para publicar una notificación en el tema de SNS. Configurar una política de filtro en el tema de SNS para enviar solo notificaciones que contengan el texto **NON_COMPLIANT**.

**C.** Configurar una regla de Amazon EventBridge que coincida con un resultado de evaluación de AWS Config de tipo **NON_COMPLIANT** para todas las reglas administradas de AWS Config. Crear un input transformer para la regla de EventBridge. Configurar la regla de EventBridge para publicar una notificación en el tema de SNS. Configurar una política de filtro en el tema de SNS para enviar solo notificaciones que contengan el texto **NON_COMPLIANT**.

**D.** Configurar una regla de Amazon EventBridge que coincida con un resultado de evaluación de AWS Config de tipo **NON_COMPLIANT** para la regla restricted-ssh. Crear un input transformer para la regla de EventBridge. Configurar la regla de EventBridge para publicar una notificación en el tema de SNS.

---

## ✅ **Respuesta correcta: D**

---

## **Explicación general (en modo examen)**

- AWS Config evalúa recursos → produce estados: **COMPLIANT / NON_COMPLIANT / ERROR**
- La regla **restricted-ssh** detecta SGs abiertos a `0.0.0.0/0`
- El evento que importa SIEMPRE en el examen: **NON_COMPLIANT = acción requerida**
- Patrón clave:
    
    👉 **AWS Config → EventBridge → SNS (fan-out notificaciones)**
    
    👉 EventBridge filtra → SNS distribuye
    

---

## **Por qué D es correcta**

- Filtra exactamente lo necesario:
    
    ✔ Solo la regla relevante (**restricted-ssh**)
    
    ✔ Solo el estado importante (**NON_COMPLIANT**)
    
- Minimiza ruido (principio típico del examen: *least operational overhead*)
- EventBridge hace el filtering (mejor práctica)
- SNS solo entrega, no filtra lógica compleja

---

## **Análisis de distractores (MUY importante para el examen)**

| Opción | Por qué parece correcta | Por qué es incorrecta |
| --- | --- | --- |
| A | Usa EventBridge + SNS correctamente | ❌ ERROR ≠ problema de compliance → es fallo técnico/configuración |
| B | Intenta filtrar NON_COMPLIANT | ❌ SNS filter policy va en la **suscripción**, no en el topic ❌ Procesa eventos innecesarios (ineficiente) |
| C | Usa NON_COMPLIANT | ❌ Aplica a **todas las reglas** → genera ruido ❌ Mala práctica (no scope específico) ❌ SNS filtering mal aplicado |
| D | Filtrado preciso en EventBridge | ✅ Patrón correcto: filter temprano, scope específico, mínimo overhead |

---

## 🧠 **Patrones de examen que debes memorizar**

- 🔥 **EventBridge SIEMPRE para filtrar eventos (no SNS)**
- 🔥 **NON_COMPLIANT = trigger principal en preguntas de Config**
- 🔥 **Filtrar lo más temprano posible (EventBridge > SNS)**
- 🔥 Evitar:
    - “all rules”
    - “all events”
    - filtering downstream

## **Pregunta 19**

Una empresa utiliza AWS CodeDeploy para desplegar una función AWS Lambda como el paso final de un pipeline CI/CD.

La empresa ha desarrollado la función Lambda para manejar pedidos entrantes a través de una API de procesamiento de pedidos. El equipo de DevOps ha notado fallos intermitentes en la API durante un breve periodo después de desplegar la función Lambda.

Tras investigar, el equipo sospecha que los fallos son resultado de una propagación incompleta de cambios en la base de datos antes de que la función Lambda sea invocada.

¿Qué medidas pueden ayudar a resolver este problema?

---

**A.**

Agregar un hook **ValidateService** al archivo AppSpec que valide que cualquier cambio necesario en la base de datos se ha propagado.

**B.**

Agregar un hook **AfterAllowTestTraffic** al archivo AppSpec que pruebe y espere cualquier cambio necesario en la base de datos después de permitir tráfico de prueba.

**C.**

Agregar un hook **BeforeInstall** al archivo AppSpec que pruebe y espere cualquier cambio necesario en la base de datos antes de desplegar una nueva versión de la función Lambda.

**D.**

Agregar un hook **BeforeAllowTraffic** al archivo AppSpec que pruebe y espere cualquier cambio necesario en la base de datos antes de que el tráfico fluya hacia la nueva versión de la función Lambda.

---

## ✅ **Respuesta correcta: D**

---

## **Explicación general (patrón de examen)**

- Problema clásico: **race condition entre deploy y dependencias (DB)**
- Lambda ya está deployada pero la DB no está lista
- Patrón DevOps clave:
    
    👉 **bloquear tráfico hasta que dependencias estén listas**
    
- CodeDeploy hooks controlan EXACTAMENTE este flujo

---

## 🧠 **Decisión arquitectónica clave**

👉 **BeforeAllowTraffic = último punto antes de producción**

Es el lugar ideal para:

- validaciones finales
- checks de dependencias externas (DB, APIs, etc.)
- evitar fallos en usuarios reales

---

## **Análisis de opciones (trampas típicas AWS)**

| Opción | Por qué parece correcta | Por qué es incorrecta |
| --- | --- | --- |
| A | “ValidateService” suena lógico | ❌ Hook no válido para Lambda en CodeDeploy |
| B | Usa test traffic (buena práctica) | ❌ Ocurre **después** de permitir tráfico → demasiado tarde |
| C | Antes de instalar parece seguro | ❌ DB propagation ocurre **después del deploy**, no antes |
| D | Control justo antes de tráfico real | ✅ Evita exposición a fallos → patrón correcto |

---

## 🔥 **Patrones que AWS repite mucho**

- **BeforeAllowTraffic = punto crítico de control**
- **AfterAllowTestTraffic = validación, no bloqueo**
- **Never trust external dependencies immediately after deploy**
- Pregunta típica:
    
    👉 *“failures right after deployment”* = problema de timing
    

---

## ⚡ **Resumen tipo acordeón**

- Problema → DB no lista
- Solución → retrasar tráfico
- Servicio → CodeDeploy hooks
- Hook correcto → **BeforeAllowTraffic**

## **Pregunta 20:**

En una empresa multinacional, varias cuentas de AWS se gestionan eficientemente utilizando AWS Control Tower. La empresa opera tanto aplicaciones internas como públicas en toda su infraestructura. Para optimizar las operaciones, a cada equipo de aplicación se le asigna una cuenta de AWS dedicada responsable de alojar sus respectivas aplicaciones. Estas cuentas están agrupadas bajo una organización en AWS Organizations. Además, una cuenta miembro específica de AWS Control Tower actúa como un hub centralizado de DevOps, ofreciendo pipelines de Integración Continua/Despliegue Continuo (CI/CD) que los equipos de aplicación utilizan para desplegar aplicaciones en sus cuentas de AWS designadas. Existe un rol IAM especializado para despliegue dentro de esta cuenta central de DevOps.

Actualmente, un equipo de aplicación en particular enfrenta dificultades al intentar desplegar su aplicación en un clúster de Amazon Elastic Kubernetes Service (Amazon EKS) ubicado en su cuenta de AWS específica de aplicación. Tienen un rol IAM existente para despliegue dentro de la cuenta AWS de la aplicación. El proceso de despliegue depende de un proyecto de AWS CodeBuild, configurado en la cuenta centralizada de DevOps, y utiliza un rol de servicio IAM para CodeBuild. Sin embargo, el proceso de despliegue está encontrando un error de **Unauthorized** al intentar establecer conexiones con el clúster EKS en otra cuenta (cross-account) desde el entorno de CodeBuild.

Para resolver este error y facilitar un despliegue exitoso, ¿qué solución recomendarías?

---

## **Opciones**

**A.** Establecer una relación de confianza en el rol IAM de despliegue de la cuenta de la aplicación para la cuenta centralizada de DevOps, permitiendo la acción **sts:AssumeRole**. Además, otorgar al rol IAM de despliegue de la cuenta de la aplicación el acceso necesario al clúster EKS. Adicionalmente, configurar el **ConfigMap aws-auth** del clúster EKS para mapear el rol a los permisos apropiados del sistema.

---

**B.**Establecer una relación de confianza en el rol IAM de despliegue de la cuenta de la aplicación para la cuenta centralizada de DevOps, permitiendo la acción **sts:AssumeRoleWithSAML**. Además, otorgar al rol IAM de despliegue de la cuenta centralizada de DevOps el acceso requerido a CodeBuild y al clúster EKS.

---

**C.**Establecer una relación de confianza en el rol IAM de despliegue de la cuenta centralizada de DevOps para la cuenta de la aplicación, permitiendo la acción **sts:AssumeRoleWithSAML**. Además, otorgar al rol IAM de despliegue de la cuenta centralizada de DevOps el acceso requerido a CodeBuild.

---

**D.**Establecer una relación de confianza en la cuenta centralizada de DevOps para el rol IAM de despliegue de la cuenta de la aplicación, permitiendo la acción **sts:AssumeRole**. Además, otorgar al rol IAM de despliegue de la cuenta de la aplicación el acceso necesario al clúster EKS. Adicionalmente, configurar el **ConfigMap aws-auth** del clúster EKS para mapear el rol a los permisos apropiados del sistema.

---

**RESPUESTA A**

## **Explicación general**

### **Opción correcta:**

Establecer una relación de confianza en el rol IAM de despliegue de la cuenta de la aplicación para la cuenta centralizada de DevOps, permitiendo la acción **sts:AssumeRole**. Además, otorgar al rol IAM de despliegue de la cuenta de la aplicación el acceso necesario al clúster EKS. Adicionalmente, configurar el **ConfigMap aws-auth** del clúster EKS para mapear el rol a los permisos apropiados del sistema.

Al configurar una relación de confianza en el rol IAM de despliegue de la cuenta de la aplicación para la cuenta centralizada de DevOps, utilizando la acción **sts:AssumeRole**, se permite que CodeBuild en la cuenta centralizada de DevOps asuma el rol IAM en la cuenta de la aplicación. Esto permitirá que CodeBuild acceda al clúster EKS en la cuenta de la aplicación. Además, otorgar al rol IAM de despliegue de la cuenta de la aplicación el acceso necesario al clúster EKS garantiza que tenga los permisos requeridos para realizar las tareas de despliegue. Finalmente, configurar el **ConfigMap aws-auth** del clúster EKS para mapear el rol a los permisos adecuados asegura que el rol IAM tenga los permisos necesarios dentro del clúster EKS.

---

## **Opciones incorrectas**

- Establecer una relación de confianza usando **sts:AssumeRoleWithSAML** → Esto se usa para federación con proveedores SAML, no aplica aquí.
- Establecer la relación de confianza en la cuenta equivocada →
    
    ❌ La confianza debe estar en la **cuenta destino (application account)**, no en la central.
    

---

## **Referencias:**

[https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html)

[https://docs.aws.amazon.com/eks/latest/userguide/add-user-role.html](https://docs.aws.amazon.com/eks/latest/userguide/add-user-role.html)

[https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRoleWithSAML.html](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRoleWithSAML.html)

## **Pregunta 21:**

Una empresa que tiene cientos de cuentas de AWS gestiona sus operaciones y seguridad a través de una única organización creada en AWS Organizations. Según la política de la empresa, AWS Config y AWS CloudTrail están habilitados para todas las cuentas. La política de seguridad exige configurar AWS Web Application Firewall (AWS WAF) web ACLs para todos los Application Load Balancers (ALBs) orientados a internet y las APIs de Amazon API Gateway. Sin embargo, los reportes mensuales de auditoría indican consistentemente ALBs y APIs de API Gateway sin protección.

Como ingeniero DevOps, el equipo de seguridad te ha solicitado automatizar estas configuraciones para todas las cuentas y evitar omisiones. ¿Qué pasos recomendarías?

---

## **Opciones**

**A.**Designar una de las cuentas de AWS en tu organización como administrador de Firewall Manager en AWS Organizations. Crear una política de AWS Firewall Manager para adjuntar AWS WAF web ACLs a cualquier ALB y API Gateway recién creado.

---

**B.** Crear una política de Amazon Systems Manager para adjuntar AWS WAF web ACLs a cualquier ALB y API Gateway recién creado.

---

**C.** Crear una política de Amazon GuardDuty para adjuntar AWS WAF web ACLs a cualquier ALB y API Gateway recién creado.

---

**D.** Configurar una regla administrada en AWS Config para adjuntar AWS WAF web ACLs a cualquier ALB y API Gateway recién creado.

---

**RESPUESTA A**

## **Explicación general**

### **Opción correcta:**

AWS Firewall Manager ofrece la capacidad de usar múltiples cuentas de AWS y alojar aplicaciones en cualquier región mientras se mantiene un control centralizado sobre la configuración de seguridad de la organización.

Firewall Manager está basado en políticas que contienen conjuntos de reglas de WAF y protección opcional de AWS Shield Advanced. Cada política se aplica a un conjunto específico de recursos AWS, definidos por cuenta, tipo de recurso, identificador o etiquetas. Las políticas pueden aplicarse automáticamente a todos los recursos que coincidan.

---

### **Prerrequisitos de Firewall Manager:**

- AWS Organizations habilitado
- Una cuenta designada como administrador de Firewall Manager
- AWS Config habilitado en todas las cuentas

---

### **Por qué funciona:**

Al usar AWS Firewall Manager:

- Se gestionan reglas WAF **centralmente**
- Se aplican automáticamente a nuevos recursos
- Se evita drift (problema clave del escenario)

---

## **Opciones incorrectas**

**GuardDuty:**

Es para detección de amenazas, no para gestión centralizada de seguridad.

👉 Reacciona, no previene.

**AWS Config:**

Solo audita y detecta incumplimientos.

👉 No aplica configuraciones automáticamente a escala organizacional.

**Systems Manager:**

No está diseñado para este caso. Es un distractor.

---

## **Referencias**

[https://docs.aws.amazon.com/waf/latest/developerguide/get-started-fms-create-security-policy.html](https://docs.aws.amazon.com/waf/latest/developerguide/get-started-fms-create-security-policy.html)

[https://aws.amazon.com/firewall-manager/](https://aws.amazon.com/firewall-manager/)

## **Pregunta 22:**

Un desarrollador configuró una plantilla de AWS CloudFormation para crear un recurso personalizado necesario para el proyecto. La función AWS Lambda para el recurso personalizado se ejecutó exitosamente, como se evidencia por la creación exitosa del recurso personalizado. Sin embargo, el stack de CloudFormation no está pasando del estado en progreso (**CREATE_IN_PROGRESS**) al estado completado (**CREATE_COMPLETE**).

¿Qué paso pudo haber omitido el desarrollador para completar exitosamente el stack de CloudFormation?

---

## **Opciones**

**A.**Después de ejecutar el método `send` en el módulo `cfn-response`, la función Lambda termina, por lo que cualquier cosa escrita después de este método es ignorada.

**B.** Configurar la función AWS Lambda para enviar la respuesta (**SUCCESS o FAILED**) de la creación del recurso personalizado a una URL prefirmada de Amazon S3.

**C.**El recurso de AWS CloudFormation `AWS::CloudFormation::CustomResource` debe utilizarse para especificar un recurso personalizado en la plantilla.

**D.** Si el desarrollador de la plantilla y el proveedor del recurso personalizado están configurados como la misma persona o entidad, entonces la finalización del stack de CloudFormation falla.

---

## ✅ **Respuesta correcta: B**

---

## **Explicación general**

Los **Custom Resources en CloudFormation** requieren un paso CRÍTICO:

👉 La Lambda debe **responder explícitamente a CloudFormation**

- CloudFormation envía un request a la Lambda
- La Lambda debe devolver:
    - **SUCCESS** o **FAILED**
    - a una **URL prefirmada de S3**

📌 Si NO envía esa respuesta:

👉 CloudFormation se queda en **CREATE_IN_PROGRESS** indefinidamente

---

## **Por qué ocurre el problema**

- La Lambda ejecuta bien ✔
- El recurso se crea ✔
- Pero CloudFormation **nunca recibe confirmación** ❌

👉 Resultado: stack "colgado"

---

## **Análisis de opciones**

| Opción | Por qué parece correcta | Por qué es incorrecta |
| --- | --- | --- |
| A | Menciona `cfn-response` (muy común) | ❌ No es el problema principal ❌ No siempre aplica |
| B | Describe el flujo real de CloudFormation | ✅ Requisito obligatorio del servicio |
| C | Es válido en teoría | ❌ No afecta el problema de estado |
| D | Suena a restricción de seguridad | ❌ Totalmente falso |

---

## 🔥 **Patrón de examen (MUY IMPORTANTE)**

- Si ves:
    - **Custom Resource**
    - **Stack stuck en CREATE_IN_PROGRESS**

👉 Respuesta casi automática:

**“No se envió response a pre-signed S3 URL”**

---

## ⚡ **Resumen tipo acordeón**

- Trigger → Custom Resource
- Problema → stack no termina
- Causa → falta de response
- Solución → enviar **SUCCESS/FAILED a S3 URL**

## **23. Pregunta:**

Una empresa ha configurado AWS Organizations para gestionar múltiples cuentas AWS. La empresa utiliza Amazon Elastic File System (Amazon EFS) como servicio de almacenamiento compartido, configurado en la cuenta AWS A de la empresa.

Para implementar una arquitectura serverless, la empresa ha decidido mover sus aplicaciones a AWS Lambda. Las funciones Lambda serán gestionadas a través de otra cuenta AWS (Cuenta B). Todas las funciones Lambda se desplegarán en una VPC.

El equipo de DevOps necesita seguir utilizando Amazon EFS en la Cuenta A con la función Lambda en la Cuenta B.

¿Cómo reconfigurarías el sistema de archivos EFS existente para su uso con funciones AWS Lambda? (**Selecciona dos**)

---

## **Opciones**

**A.** Actualizar los roles de ejecución de Lambda con permisos para acceder a la VPC y al sistema de archivos EFS

**B.** Configurar las funciones Lambda en la Cuenta B para asumir un rol IAM existente en la Cuenta A para la conectividad cross-region o cross-AZ entre EFS y Lambda

**C.** Lambda cobra por transferencia de datos entre VPCs. Para gestionar costos, crear un nuevo sistema de archivos EFS en la Cuenta B. Configurar AWS DataSync para transferir datos desde EFS en la Cuenta B hacia EFS en la Cuenta B

**D.** Crear una conexión VPC peering para conectar la Cuenta A con la Cuenta B. Actualizar la política del sistema de archivos EFS para proporcionar a la Cuenta B acceso para montar y escribir en el sistema de archivos EFS en la Cuenta A

**E.** Crear una conexión VPC peering para conectar la Cuenta A con la Cuenta B. Crear políticas de control de servicio (SCPs) para establecer controles de permisos para el acceso a Amazon EFS desde el rol de ejecución de Lambda

---

## ✅ **Respuestas correctas: A y D**

---

## **Explicación general**

Para que Lambda acceda a EFS en **otra cuenta**, necesitas dos cosas clave:

---

### 🔹 1. Conectividad de red (Networking)

- EFS se monta vía **NFS (puerto 2049)** dentro de una VPC
- Lambda también debe estar en una VPC que pueda alcanzar EFS

👉 Solución:

- **VPC Peering entre cuentas (A ↔ B)**

---

### 🔹 2. Permisos (IAM + EFS policy)

- El **execution role de Lambda** necesita permisos para EFS
- El **file system policy de EFS** debe permitir acceso cross-account

---

### 🧠 Patrón clave del examen

👉 **Cross-account + EFS + Lambda = Networking + IAM**

---

## **Análisis de opciones**

| Opción | Por qué parece correcta | Por qué es incorrecta |
| --- | --- | --- |
| A | Permisos necesarios para Lambda | ✅ Correcta |
| B | Usa AssumeRole (común en cross-account) | ❌ No aplica para conectividad EFS ❌ No existe cross-region/AZ para esto |
| C | Habla de costos (trampa típica) | ❌ Cambia la arquitectura ❌ No requerido |
| D | Resuelve conectividad + permisos | ✅ Correcta |
| E | Usa SCPs (confunde bastante) | ❌ SCP no otorga permisos reales |

---

## 🔥 **Patrones que debes memorizar**

- **EFS siempre requiere VPC connectivity**
- **Cross-account = VPC peering + resource policy**
- **SCP ≠ permisos efectivos**
- **AssumeRole ≠ solución para networking**

---

## ⚡ **Resumen tipo acordeón**

- Problema → Lambda en otra cuenta no puede acceder a EFS
- Solución →
    - VPC Peering
    - EFS policy + IAM role
- Respuesta → **A + D**

## **Pregunta 24:**

Una empresa implementa control de acceso creando diferentes políticas para distintas funciones laborales. Estas políticas se adjuntan a roles/grupos de IAM con los permisos mínimos necesarios para cada función. Hasta ahora, la solución ha funcionado de manera efectiva. Sin embargo, con la expansión del negocio, el administrador tiene que actualizar frecuentemente las políticas existentes para permitir acceso a nuevos recursos.

¿Cuál de las siguientes soluciones puede hacer que el control de acceso sea aplicable a todos los nuevos recursos sin necesidad de actualizar las políticas?

---

## **Opciones**

A. Configurar control de acceso basado en atributos mediante el uso de etiquetas (tags). Crear etiquetas para los roles de IAM basadas en su función. Cada vez que se cree un nuevo recurso, agregar esas etiquetas al recurso para permitir acceso inmediato al recurso creado

B. Crear una política basada en recursos en los nuevos recursos creados para agregar permisos a los roles de IAM existentes que acceden a dichos recursos

C. Crear una AWS Organization y habilitar todas las características. Adjuntar roles IAM basados en identidad para nuevos recursos y compartirlos usando políticas de control de servicio (SCPs) con todas las cuentas miembro de la organización

D. Configurar listas de control de acceso (ACLs) para permitir acceso a ciertos principales en la cuenta. Agregar las ACLs a una session policy para añadir dinámicamente permisos al rol IAM que el usuario ya tiene

---

## ✅ **Respuesta correcta: A**

---

## **Explicación general**

El problema es claro:

👉 **Escalabilidad en permisos (evitar actualizar políticas constantemente)**

---

### 🔹 Solución correcta: ABAC (Attribute-Based Access Control)

- Usa **tags como atributos**
- Define políticas tipo:
    
    👉 *“permitir si tag del recurso = tag del rol”*
    

📌 Resultado:

- Nuevos recursos heredan acceso automáticamente
- No necesitas modificar políticas

---

### 🧠 Patrón clave del examen

👉 Si ves:

- “many resources”
- “frequent updates”
- “scalability problem”

Respuesta típica:

👉 **ABAC con tags**

---

## **Análisis de opciones**

| Opción | Por qué parece correcta | Por qué es incorrecta |
| --- | --- | --- |
| A | Automatiza acceso con tags | ✅ Solución escalable real |
| B | Usa resource-based policies | ❌ No escala (igual problema) |
| C | Usa Organizations + SCP | ❌ SCP no da permisos |
| D | ACL + session policies suena dinámico | ❌ No aplicable / mal uso |

---

## 🔥 **Patrones que debes memorizar**

- **ABAC = solución para entornos dinámicos**
- **RBAC = problema de escalabilidad**
- **SCP = límites, no permisos**
- **Resource-based policies ≠ solución masiva**

---

## ⚡ **Resumen tipo acordeón**

- Problema → actualizar políticas constantemente
- Solución → **ABAC con tags**
- Beneficio → escalabilidad automática

## **Pregunta 25:**

Un equipo de soporte de producción gestiona una aplicación web que se ejecuta en un conjunto de instancias de Amazon EC2 configuradas con un Application Load Balancer (ALB). Las instancias se ejecutan en un grupo de Auto Scaling que abarca múltiples zonas de disponibilidad. Una actualización crítica debe desplegarse en la aplicación de producción. El equipo necesita una estrategia de despliegue que pueda:

a) Crear otra flota de instancias con la misma capacidad y configuración que la original.

b) Continuar accediendo a la aplicación original sin tiempo de inactividad.

c) Transferir el tráfico a la nueva flota cuando el despliegue esté completamente hecho. El equipo de producción debe probar la nueva flota durante una ventana de dos horas antes de completar el despliegue.

d) Terminar la flota original automáticamente una vez que expire la ventana de prueba.

Como ingeniero DevOps, ¿qué solución de despliegue elegirías para cumplir con todos los requisitos?

---

## **Opciones**

A. Configurar AWS Elastic Beanstalk para realizar un despliegue Blue/Green. Esto creará un nuevo entorno diferente al original para continuar sirviendo tráfico de producción. Terminar el entorno original después de dos horas y confirmar que los cambios de DNS del nuevo entorno se hayan propagado correctamente

B. Usar AWS CodeDeploy con un tipo de despliegue configurado como Blue/Green. Para terminar la flota original después de dos horas, cambiar la configuración de despliegue. Establecer “original instances” a “Terminate the original instances in the deployment group” y elegir un periodo de espera de dos horas. Configurar OneAtATime para desregistrar instancias gradualmente

C. Usar AWS CodeDeploy con un tipo de despliegue configurado como Blue/Green. Para terminar la flota original después de dos horas, cambiar la configuración de despliegue. Establecer “original instances” a “Terminate the original instances in the deployment group” y elegir un periodo de espera de dos horas

D. Configurar AWS Elastic Beanstalk para usar una política de despliegue rolling. Elastic Beanstalk divide las instancias en lotes y despliega la nueva versión progresivamente sin downtime

---

## ✅ **Respuesta correcta: C**

---

## **Explicación general (completa y fiel)**

Los despliegues tradicionales “in-place” hacen difícil validar una nueva versión en producción mientras se sigue ejecutando la versión anterior.

👉 **Blue/Green deployments** proporcionan aislamiento entre entornos:

- Ambiente **blue (actual)**
- Ambiente **green (nuevo)**

Esto permite:

- Crear un entorno paralelo sin afectar producción
- Reducir riesgo de despliegue

---

Después de desplegar el entorno green:

- Puedes validarlo usando:
    - tráfico de prueba
    - o una pequeña porción de tráfico real (**canary testing**)

Si algo falla:

👉 puedes regresar tráfico al entorno blue inmediatamente

👉 minimizas downtime y blast radius

---

### 🔥 Beneficio clave en el examen

👉 **Rollback inmediato y seguro**

---

En AWS CodeDeploy Blue/Green:

- El despliegue es exitoso cuando la app se despliega en todas las instancias
- CodeDeploy puede usar configuraciones como:
    - `CodeDeployDefault.OneAtATime` (por defecto)

---

### 🔹 Terminación de instancias originales

Si eliges:

👉 **“Terminate the original instances in the deployment group”**

Entonces:

- Después de redirigir tráfico al entorno nuevo
- Las instancias originales se eliminan
- **Después del tiempo de espera configurado (ej: 2 horas)**

---

## **Opciones incorrectas**

### Elastic Beanstalk (A y D)

- Elastic Beanstalk trabaja con **entornos completos**, no con flotas EC2 directamente
- No encaja exactamente con el control granular requerido

---

### Opción B (trampa MUY típica)

- Parece correcta pero incluye:
    
    👉 **OneAtATime para desregistrar instancias**
    

❌ Esto es incorrecto porque:

- En Blue/Green:
    - el tráfico se cambia **de golpe**
    - las instancias originales se eliminan **todas juntas**, no una por una

---

## 🔥 **Patrones de examen que debes memorizar**

- **Blue/Green = cero downtime + rollback fácil**
- **Wait time antes de terminate = requisito típico**
- **CodeDeploy = control fino sobre EC2 fleets**
- ❌ No mezclar:
    - Rolling = parcial
    - Blue/Green = ambientes paralelos

---

## ⚡ **Resumen tipo acordeón**

- Problema → deploy sin downtime + testing window
- Solución → **CodeDeploy Blue/Green**
- Feature clave → **wait before terminate (2h)**
- Respuesta → **C**

## **Pregunta 26:**

Una empresa aloja todas sus aplicaciones web en instancias de Amazon EC2. La empresa busca una solución de seguridad que detecte de forma proactiva vulnerabilidades de software y exposición de red no intencionada de las instancias. La solución también debe incluir un registro de auditoría de todas las actividades de inicio de sesión en las instancias.

¿Qué solución cumplirá con estos requisitos?

---

## **Opciones**

A. Configurar Amazon GuardDuty para detectar vulnerabilidades y amenazas en las instancias EC2. Integrarlo con un sistema de workflow para revisar hallazgos y activar una función AWS Lambda para automatizar la remediación

B. Configurar Amazon ECR image scanning para buscar vulnerabilidades en las instancias EC2. Amazon ECR envía eventos a EventBridge cuando termina un escaneo. Configurar CloudTrail para enviar datos a EventBridge

C. Configurar AWS Systems Manager (SSM) agent para recolectar vulnerabilidades de software en EC2. Configurar un runbook de Automation para parchear automáticamente

D. Configurar Amazon Inspector para detectar vulnerabilidades en instancias EC2. Instalar el agente de CloudWatch para capturar logs del sistema y registrarlos en CloudWatch Logs. Configurar CloudTrail para enviar eventos de logs a CloudWatch Logs

---

## ✅ **Respuesta correcta: D**

---

## **Explicación general (completa y fiel)**

Amazon Inspector es un servicio automatizado de gestión de vulnerabilidades que escanea continuamente instancias Amazon EC2, funciones AWS Lambda y workloads de contenedores en busca de vulnerabilidades de software y exposición de red no intencionada.

Para escanear correctamente instancias EC2:

- Amazon Inspector requiere que las instancias tengan instalado el **SSM Agent**
- Usa el SSM Agent para recopilar inventario de aplicaciones
- Puede configurarse con endpoints VPC para evitar tráfico por internet

---

Amazon CloudWatch Logs permite:

- Monitorear, almacenar y acceder a logs desde:
    - EC2
    - CloudTrail
    - Route 53
    - otros servicios

CloudWatch Logs centraliza logs en un servicio altamente escalable:

- Permite buscar errores
- Filtrar eventos
- Analizar patrones
- Archivar logs

---

Configurar CloudTrail con CloudWatch Logs permite:

- Monitorear actividad
- Tener auditoría de acciones
- Generar alertas ante eventos específicos

---

## **Por qué esta opción cumple TODO**

Requisitos del problema:

| Requisito | Servicio |
| --- | --- |
| Vulnerabilidades | Amazon Inspector |
| Exposición de red | Amazon Inspector |
| Auditoría login/activity | CloudWatch Logs + CloudTrail |

👉 Es una solución completa end-to-end

---

## **Opciones incorrectas (explicación fiel)**

### A. GuardDuty

- Es un servicio de **detección de amenazas**, no de vulnerabilidades
- Detecta comportamiento malicioso, no CVEs

---

### B. ECR scanning

- Solo aplica a **contenedores**
- No escanea EC2 directamente
- Solo analiza paquetes del OS en imágenes

---

### C. SSM

- El SSM Agent **NO detecta vulnerabilidades**
- Solo gestiona instancias (patching, automation, etc.)

---

## 🔥 **Patrones de examen que debes memorizar**

- **Inspector = vulnerabilidades (CVEs + exposición)**
- **GuardDuty = amenazas (comportamiento)**
- **CloudTrail = auditoría**
- **CloudWatch Logs = almacenamiento/consulta de logs**

---

## ⚡ **Resumen tipo acordeón**

- Problema → vulnerabilidades + auditoría
- Solución →
    - Inspector
    - CloudWatch Logs
    - CloudTrail

## **Pregunta 27:**

Un desarrollador ha subido un objeto de 100 MB a un bucket de Amazon S3 como una carga directa de una sola parte (single-part upload) usando la API REST con checksum habilitado. El checksum del objeto subido vía la API REST era el checksum de todo el objeto.

Más tarde ese mismo día, el desarrollador utilizó la consola de AWS para renombrar el objeto, copiarlo y editar sus metadatos. Posteriormente, al verificar el checksum del objeto actualizado desde la consola, el checksum ya no coincidía con el checksum del objeto completo.

Confundido por este comportamiento, el desarrollador te consulta por una posible solución.

Como AWS Certified DevOps Engineer - Professional, ¿cuál de las siguientes opciones identificarías como la razón de este comportamiento?

---

## **Opciones**

A. Se ha creado un nuevo valor de checksum para el objeto, calculado en base a los checksums de las partes individuales. Este comportamiento es esperado

B. Si un objeto es mayor a 50 MB, el checksum se calcula en base a partes individuales. El cálculo inicial del desarrollador era incorrecto

C. Al cambiar los metadatos en S3, el algoritmo de checksum cambia por defecto. Este comportamiento es esperado

D. Si un objeto es mayor a 16 MB, el checksum se calcula en base a partes individuales y el cálculo inicial del desarrollador era incorrecto

---

## ✅ **Respuesta correcta: A**

---

## **Explicación general (completa y fiel)**

Cuando realizas ciertas operaciones usando la consola de AWS, Amazon S3 utiliza **multipart upload** si el objeto es mayor a **16 MB**.

En este caso:

- El checksum **NO es un checksum directo del objeto completo**
- Es un cálculo basado en los checksums de cada parte individual

---

### 🔹 Escenario del problema

1. El desarrollador sube el objeto (100 MB) usando:
    - **REST API**
    - **single-part upload**
        
        👉 Resultado: checksum = del objeto completo
        
2. Luego usa la consola para:
    - renombrar
    - copiar
    - editar metadata

👉 La consola usa **multipart upload automáticamente**

---

### 🔹 Resultado

- S3 crea un **nuevo checksum**
- Este checksum:
    - se basa en partes
    - ya NO coincide con el original

👉 **Comportamiento esperado**

---

## **Opciones incorrectas (explicación fiel)**

### B.

- Incorrecto porque el límite es **16 MB**, no 50 MB

---

### C.

- Cambiar metadata **NO cambia el algoritmo de checksum**

---

### D.

- Aunque menciona 16 MB (correcto),
    
    ❌ dice que el cálculo original era incorrecto → esto es falso
    
    👉 El cálculo inicial era correcto
    

---

## 🔥 **Patrones de examen que debes memorizar**

- **S3 Console → usa multipart (>16 MB)**
- **Multipart checksum ≠ checksum total**
- **REST single upload → checksum completo**
- Pregunta típica:
    
    👉 *“checksum mismatch después de copiar/editar”*
    

---

## ⚡ **Resumen tipo acordeón**

- Problema → checksum cambió
- Causa → multipart upload automático
- Clave → cálculo por partes

## **Pregunta 28:**

Una aplicación de medios se ejecuta en un conjunto de instancias de Amazon EC2 detrás de un Application Load Balancer (ALB) y utiliza buckets de Amazon S3 como almacenamiento. Para mejorar la seguridad, se ha configurado AWS Web Application Firewall (AWS WAF) para monitorear las solicitudes que llegan al ALB.

El equipo de DevOps necesita enviar un reporte trimestral sobre las solicitudes web recibidas por AWS WAF, incluyendo información detallada de cada solicitud así como detalles de las reglas que coincidieron con dichas solicitudes. El equipo te ha pedido implementar los cambios necesarios para recolectar estos datos de seguridad en los próximos meses.

Como ingeniero DevOps, ¿cómo implementarías este requerimiento?

---

## **Opciones**

A. Crear un bucket de Amazon S3. Habilitar logging y proporcionar el ARN del bucket como destino de logs de WAF. Los nombres de bucket deben comenzar con **aws-waf-logs-** y pueden tener cualquier sufijo. Para mayor seguridad, agregar cifrado con claves AWS KMS administradas por AWS

B. Enviar logs a Amazon CloudWatch Logs creando un log group. Al habilitar logging en WAF, usar el ARN del log group como destino. Los nombres deben comenzar con **aws-waf-logs-** y crear métricas y alarmas

C. Crear un bucket de Amazon S3. Habilitar logging y proporcionar el ARN del bucket como destino de logs de WAF. Los nombres de bucket deben comenzar con **aws-waf-logs-** y pueden terminar con cualquier sufijo

D. Habilitar logging en AWS WAF y configurar Amazon Kinesis Data Firehose con un destino de almacenamiento. Configurar Firehose para usar un Kinesis stream como fuente. El nombre debe comenzar con **aws-waf-logs-**

---

## ✅ **Respuesta correcta: C**

---

## **Explicación general (completa y fiel)**

Puedes habilitar el logging de tráfico de AWS WAF para obtener información detallada sobre el tráfico analizado por tu web ACL.

La información registrada incluye:

- Tiempo en que AWS WAF recibió la solicitud
- Detalles de la solicitud
- Reglas que coincidieron

---

AWS WAF permite enviar logs a:

- Amazon CloudWatch Logs
- Amazon S3
- Amazon Kinesis Data Firehose

---

### 🔹 Envío de logs a S3

Para enviar logs a Amazon S3:

- Debes configurar un bucket S3
- Proporcionar el ARN del bucket al habilitar logging

Los logs:

- Se entregan cada **5 minutos**
- Cada archivo contiene registros de ese periodo

---

### 🔹 Tamaño de logs

- Máximo: **75 MB por archivo**
- Si se alcanza antes de 5 minutos:
    - Se cierra el archivo
    - Se crea uno nuevo

---

### 🔹 Requisito CRÍTICO de examen

👉 El nombre del bucket DEBE comenzar con:

**aws-waf-logs-**

Puede terminar con cualquier sufijo.

## **29. Pregunta:**

Una empresa te ha contratado como AWS Certified DevOps Engineer - Professional para proporcionar recomendaciones tras una auditoría de seguridad fallida de su proyecto principal. Se te ha pedido revisar el archivo **buildspec.yaml** de su proyecto AWS CodeBuild.

Tras investigar, notas que el archivo tiene valores hardcodeados para variables de entorno que referencian el **AWS Access Key ID**, **Secret Access Key** y la contraseña de la base de datos. Además, para realizar cambios de configuración únicos durante la fase de build, el archivo ejecuta comandos **ssh** y **scp** hacia una instancia EC2 usando una clave privada SSH almacenada en Amazon S3.

¿Qué cambios recomendarías para cumplir con las mejores prácticas de seguridad de AWS? (**Selecciona tres**)

---

## **Opciones**

A. Configurar el rol del proyecto CodeBuild con la política de permisos necesaria y luego eliminar las variables de entorno que referencian las credenciales AWS del archivo buildspec.yaml

B. Almacenar la contraseña de la base de datos como un valor SecureString en AWS Systems Manager Parameter Store y referenciarla en el buildspec. Eliminar la variable hardcodeada

C. Almacenar las variables de entorno (Access Key, Secret Key, DB password) encriptadas en S3 y cargarlas dinámicamente con un script en pre-build

D. Utilizar AWS Systems Manager Run Command para gestionar la instancia EC2 en lugar de usar ssh/scp con una clave privada en S3

E. Almacenar la contraseña de la base de datos como SecureString en AWS Secrets Manager y referenciarla en el buildspec

---

## ✅ **Respuestas correctas: A, B, D**

---

## **Explicación general (completa y fiel)**

### 🔹 Opción A

Es una mala práctica almacenar credenciales AWS hardcodeadas en código o archivos como buildspec.yaml.

AWS recomienda:

- Usar **IAM roles (CodeBuild role)**
- Otorgar permisos mediante políticas

👉 Se deben eliminar las credenciales hardcodeadas

---

### 🔹 Opción B

También es mala práctica almacenar contraseñas hardcodeadas.

AWS recomienda:

- Usar **AWS Systems Manager Parameter Store**
- Tipo **SecureString**

Esto permite:

- almacenamiento seguro
- recuperación dinámica en buildspec

Para que funcione:

- El rol de CodeBuild debe tener permiso `ssm:GetParameters`

---

### 🔹 Opción D

Es una mala práctica almacenar claves SSH privadas en S3.

AWS recomienda:

- Usar **Systems Manager Run Command**

Beneficios:

- acceso remoto seguro
- no requiere SSH
- automatización de tareas

Run Command permite:

- ejecutar comandos en EC2
- sin exposición de claves

---

## **Opciones incorrectas (explicación fiel)**

### C.

- Es mala práctica almacenar credenciales en S3
- Incluso si están cifradas
    
    👉 sigue siendo inseguro
    

---

### E.

- Dice “SecureString en Secrets Manager”
    
    ❌ Esto es incorrecto
    

👉 SecureString es de **Parameter Store**, no de Secrets Manager

---

## 🔥 **Patrones de examen que debes memorizar**

- ❌ Nunca hardcodear credenciales
- ✅ CodeBuild → usar IAM Role
- ✅ Secrets:
    - Parameter Store → SecureString
    - Secrets Manager → secrets (no SecureString)
- ❌ No usar SSH keys en S3
- ✅ Usar SSM Run Command

---

## ⚡ **Resumen tipo acordeón**

- Problema → credenciales expuestas + malas prácticas
- Solución →
    - IAM Role
    - Parameter Store
    - SSM Run Command
- Respuesta → **A, B, D**

## **Pregunta 30:**

Una empresa utiliza un pipeline de AWS CodePipeline para desplegar actualizaciones a una API varias veces al mes. Como parte de este proceso, el equipo de DevOps exporta el SDK de JavaScript para la API desde la consola de API Gateway y lo sube a un bucket de Amazon S3, que se utiliza como origen para una distribución de Amazon CloudFront.

Los clientes web acceden al SDK a través del endpoint de CloudFront. El objetivo es tener una solución automatizada que asegure que el SDK más reciente esté siempre disponible para los clientes cuando haya un nuevo despliegue de la API.

Como AWS Certified DevOps Engineer - Professional, ¿qué solución sugerirías?

---

## **Opciones**

A. Configurar una acción en CodePipeline que se ejecute inmediatamente después de la etapa de despliegue de la API. Configurar esta acción para invocar una función AWS Lambda. La función Lambda descargará el SDK desde API Gateway, lo subirá a S3 y creará una invalidación de CloudFront para la ruta del SDK

B. Configurar una acción en CodePipeline después del despliegue para usar integración nativa con API Gateway y exportar el SDK a S3. Luego llamar a la API de S3 para invalidar caché

C. Configurar una regla de EventBridge que reaccione a eventos CreateDeployment de API Gateway. Usar integración con CodePipeline para exportar SDK a S3 y luego invalidar caché usando S3 API

D. Configurar una regla de EventBridge cada 5 minutos que invoque una Lambda para descargar SDK, subirlo a S3 e invalidar CloudFront

---

## ✅ **Respuesta correcta: A**

---

## **Explicación general (completa y fiel)**

AWS CodePipeline es un servicio completamente gestionado que permite automatizar pipelines de entrega continua para actualizaciones rápidas y confiables.

Al crear una acción en CodePipeline inmediatamente después del despliegue:

- Se automatiza la exportación del SDK desde API Gateway
- Se sube automáticamente a S3
- Se invalida el caché de CloudFront

👉 Esto garantiza que los clientes siempre reciban la versión más reciente

---

### 🔹 Flujo correcto (patrón de examen)

1. Deploy API
2. Trigger acción en pipeline
3. Lambda:
    - exporta SDK
    - sube a S3
    - invalida CloudFront

---

### 🔥 Clave importante

👉 **CloudFront invalidation SOLO se hace con CloudFront API**

❌ No con S3

---

## **Opciones incorrectas (explicación fiel)**

### B y C

- Intentan invalidar caché usando **S3 API**
    
    ❌ Esto es imposible
    
    👉 CloudFront tiene su propia API
    

---

### D

- Usa EventBridge cada 5 minutos
    
    ❌ Ineficiente
    
    ❌ No event-driven
    

👉 AWS siempre prefiere:

- **event-driven > polling**

---

## 🔥 **Patrones de examen que debes memorizar**

- **Post-deploy automation → CodePipeline action + Lambda**
- **CloudFront cache → invalidation (no S3)**
- **Event-driven > scheduled polling**
- **Lambda = glue entre servicios**

---

## ⚡ **Resumen tipo acordeón**

- Problema → SDK desactualizado por caché
- Solución →
    - CodePipeline + Lambda
    - CloudFront invalidation
- Respuesta → **A**

## **Pregunta 31:**

Una empresa está implementando una arquitectura serverless en AWS con Amazon API Gateway, AWS Lambda y Amazon DynamoDB. Los usuarios actuales de la empresa se encuentran principalmente en las regiones de Europa y Asia-Pacífico.

La empresa ahora busca una solución rápida que ofrezca **alta disponibilidad y baja latencia** para una base de usuarios global, ya que sus servicios están ganando popularidad a nivel mundial.

¿Cómo implementarías este requerimiento?

---

## **Opciones**

A. Configurar Amazon Route 53 para apuntar a APIs de API Gateway en Europa y Asia-Pacífico. Usar failover routing y health checks con Application Recovery Controller. Configurar Lambda y DynamoDB global table

B. Configurar Amazon Route 53 para apuntar a APIs de API Gateway en Europa y Asia-Pacífico. Usar latency-based routing y health checks. Configurar Lambda en cada región y usar DynamoDB global table

C. Configurar Amazon Route 53 para apuntar a APIs de API Gateway en Europa y Asia-Pacífico. Usar geolocation routing y health checks. Configurar Lambda en cada región y DynamoDB global table

D. Configurar Amazon Route 53 para apuntar a AWS Global Accelerator. Usar ALB + API Gateway + Lambda + DynamoDB global table

---

## ✅ **Respuesta correcta: B**

---

## **Explicación general (completa y fiel)**

### 🔹 Route 53 (Latency-based routing)

Si tu aplicación está desplegada en múltiples regiones AWS:

- Puedes mejorar rendimiento sirviendo tráfico desde la región con menor latencia
- Route 53:
    - evalúa desde dónde viene la petición
    - selecciona la región más rápida

👉 Esto reduce latencia significativamente

---

Además:

- Puedes usar **health checks**
- Para hacer failover automático si una región falla

---

### 🔹 AWS Lambda

- Escala automáticamente
- Alta disponibilidad sin gestión adicional

---

### 🔹 DynamoDB Global Tables

- Base de datos:
    - multi-región
    - multi-activa
- Replica datos automáticamente

Beneficios:

- baja latencia de lectura/escritura
- alta disponibilidad (99.999%)
- resiliencia ante fallos regionales

---

Cuando se escribe en una región:

👉 DynamoDB replica automáticamente a otras regiones

---

## **Por qué esta opción cumple TODO**

| Requisito | Solución |
| --- | --- |
| Baja latencia | Route 53 latency-based |
| Alta disponibilidad | Multi-region + health checks |
| Datos globales | DynamoDB global tables |

---

## **Opciones incorrectas (explicación fiel)**

### C. Geolocation routing

- Basado en ubicación geográfica
- ❌ NO optimiza latencia

👉 útil para contenido localizado, no performance

---

### A. Failover routing

- Solo redirige si falla una región
- ❌ No optimiza latencia

---

### D. Global Accelerator

- Útil para IPs estáticas y networking
- ❌ No necesario aquí
- ❌ No mejora este caso específico

---

## 🔥 **Patrones de examen que debes memorizar**

- **Latency-based routing = performance global**
- **Geolocation = contenido regional**
- **Failover = resiliencia, no performance**
- **DynamoDB Global Tables = multi-region data**

---

## ⚡ **Resumen tipo acordeón**

- Problema → app global
- Requisitos → baja latencia + alta disponibilidad
- Solución →
    - Route 53 latency-based
    - Lambda multi-region
    - DynamoDB global tables
- Respuesta → **B**

## **Pregunta 32:**

Considera un entorno multi-cuenta dentro de AWS Organizations donde una empresa ejecuta una aplicación de ingesta de datos en instancias Amazon EC2 a través de varios Auto Scaling groups. Estas instancias no tienen acceso a internet debido al manejo de datos sensibles, y se han desplegado VPC endpoints en consecuencia. La aplicación opera sobre una AMI personalizada diseñada específicamente para sus necesidades.

Para gestionar y solucionar problemas de la aplicación de manera efectiva, los administradores del sistema requieren acceso automatizado y centralizado para iniciar sesión en las instancias EC2. Además, el equipo de seguridad de la empresa necesita ser notificado cada vez que se acceda a las instancias.

Como AWS Certified DevOps Engineer - Professional, ¿qué solución sugerirías para cumplir estos requisitos?

---

## **Opciones**

A. Configurar un NAT Gateway y un bastion host con acceso a internet. Permitir tráfico hacia EC2. Usar SSM Agent + lifecycle hooks + CloudWatch Logs + exportar a S3 + notificaciones

B. Utilizar EC2 Image Builder para reconstruir la AMI con SSM Agent. Configurar Auto Scaling con rol IAM. Usar EC2 Instance Connect. Loggear sesiones en S3 y notificar vía SNS

C. Utilizar EC2 Image Builder para reconstruir la AMI con SSM Agent. Configurar Auto Scaling con rol AmazonSSMManagedInstanceCore. Usar Systems Manager Session Manager para acceso centralizado. Loggear sesiones en S3 y notificar vía SNS

D. Usar Systems Manager Automation + AWS Config + SCP para acceso centralizado. Loggear sesiones en S3 y notificar vía SNS

---

## ✅ **Respuesta correcta: C**

---

## **Explicación general (completa y fiel)**

La opción correcta propone:

- Usar **EC2 Image Builder** para crear una AMI actualizada con **SSM Agent**
- Configurar el Auto Scaling group para adjuntar el rol:
    
    👉 **AmazonSSMManagedInstanceCore**
    

Esto permite:

- gestión centralizada vía Systems Manager
- permisos necesarios para funcionalidades básicas

---

### 🔹 Acceso centralizado (clave del examen)

👉 **Systems Manager Session Manager**

- Permite acceso seguro sin SSH
- No requiere:
    - IP pública
    - bastion host
    - internet

👉 Ideal para entornos **sin internet (como el escenario)**

---

### 🔹 Logging y auditoría

- Session Manager puede:
    - registrar sesiones en **Amazon S3**
- Luego:
    - S3 event notification → SNS
        
        👉 notifica al equipo de seguridad
        

---

## **Opciones incorrectas (explicación fiel)**

### A.

- Introduce NAT Gateway + bastion host
    
    ❌ rompe requisito de **no internet**
    
    ❌ innecesario
    

---

### B.

- Usa **EC2 Instance Connect**
    
    ❌ requiere conectividad de red / SSH
    
    ❌ no cumple con entorno sin internet
    

---

### D.

- Usa SCP para permisos
    
    ❌ SCP **no otorga permisos**, solo limita
    

---

## 🔥 **Patrones de examen que debes memorizar**

- **No internet → Session Manager**
- **No SSH keys → usar SSM**
- **Auto Scaling → IAM role + SSM Agent**
- **Auditoría → S3 + SNS**
- ❌ Bastion host = legacy / no recomendado si no es necesario

---

## ⚡ **Resumen tipo acordeón**

- Problema → acceso EC2 sin internet + auditoría
- Solución →
    - SSM Session Manager
    - SSM Agent + IAM Role
    - Logs en S3 + SNS
- Respuesta → **C**

## **Pregunta 33:**

La aplicación principal de una empresa está desplegada en instancias Amazon EC2 que se ejecutan detrás de un Application Load Balancer (ALB) dentro de un Auto Scaling group. Un ingeniero DevOps desea configurar un despliegue Blue/Green para esta aplicación y ya ha creado launch templates y Auto Scaling groups para ambos entornos (blue y green), cada uno desplegando al grupo objetivo (target group) correspondiente.

El ALB puede dirigir tráfico a cualquiera de los target groups de los entornos, y un registro de Route 53 apunta al ALB. El objetivo es habilitar una transición de tráfico **all-at-once** desde las instancias EC2 del entorno blue hacia las instancias EC2 recién desplegadas del entorno green.

¿Qué pasos debe seguir el ingeniero DevOps para cumplir estos requisitos?

---

## **Opciones**

A. Usar AWS CLI para actualizar el ALB y dirigir tráfico al target group del entorno green. Luego iniciar un rolling restart del Auto Scaling group del entorno green

B. Configurar un despliegue all-at-once en el entorno blue. Luego hacer un cambio DNS en Route 53 hacia el endpoint del entorno green

C. Iniciar un rolling restart del Auto Scaling group del entorno green para desplegar el nuevo software. Una vez completado, usar AWS CLI para actualizar el ALB y dirigir tráfico al target group del entorno green

D. Iniciar un rolling restart del Auto Scaling group del entorno green. Luego hacer un cambio DNS en Route 53 hacia el endpoint del entorno green

---

## ✅ **Respuesta correcta: C**

---

## **Explicación general (completa y fiel)**

Un despliegue **Blue/Green** consiste en:

- Dos entornos:
    - **Blue** → producción actual
    - **Green** → nueva versión

Beneficios:

- alta disponibilidad
- rollback fácil
- reducción de riesgo

---

### 🔹 Flujo correcto (clave del examen)

1. Preparar entorno **green**:
    - desplegar nueva versión
    - validar
2. Luego:
    - cambiar tráfico hacia green

👉 Esto se hace en el **ALB (target group switching)**

---

### 🔥 Punto crítico

👉 **Orden importa MUCHO**

- ❌ NO redirigir tráfico antes de desplegar
- ✅ Primero deploy → luego switch

---

### 🔹 En este caso

- Ya existe:
    - ALB
    - target groups (blue/green)
    - Route 53 apunta al ALB

👉 Entonces:

- NO necesitas cambiar DNS
- Solo cambiar **target group en ALB**

---

## **Opciones incorrectas (explicación fiel)**

### A.

- Cambia tráfico antes del deploy
    
    ❌ orden incorrecto
    

---

### B y D.

- Usan Route 53
    
    ❌ incorrecto porque:
    
    - solo hay **un ALB**
    - no hay endpoints distintos

👉 DNS swap NO aplica

---

## 🔥 **Patrones de examen que debes memorizar**

- **Blue/Green + ALB → cambiar target group (NO DNS)**
- **Orden: deploy → test → switch**
- **Route 53 solo si hay múltiples endpoints**
- **All-at-once = switch inmediato de tráfico**

---

## ⚡ **Resumen tipo acordeón**

- Problema → blue/green con ALB
- Requisito → all-at-once switch
- Solución →
    - deploy en green
    - cambiar target group en ALB

## **Pregunta 34:**

Durante un proceso de actualización de un stack de AWS CloudFormation, ocurrió un error en la plantilla actualizada, lo que provocó que CloudFormation iniciara automáticamente un rollback del stack. Después del intento de rollback, un ingeniero DevOps notó que la aplicación seguía no disponible y que el stack está en estado **UPDATE_ROLLBACK_FAILED**.

Para asegurar la finalización exitosa del rollback del stack, ¿qué acciones debería tomar el ingeniero DevOps? (**Selecciona dos**)

---

## **Opciones**

A. Actualizar el stack de CloudFormation usando la plantilla original

B. Ejecutar el comando **ContinueUpdateRollback** desde AWS CloudFormation

C. Corregir manualmente los recursos para que coincidan con el estado correcto del stack

D. Arreglar automáticamente el problema usando AWS CloudFormation StackSets

E. Arreglar automáticamente el problema usando CloudFormation drift detection

---

## ✅ **Respuestas correctas: B y C**

---

## **Explicación general (completa y fiel)**

Cuando una actualización de CloudFormation falla:

- CloudFormation inicia automáticamente un **rollback**
- Intenta volver al último estado estable

---

### 🔹 Problema clave

A veces el rollback también falla → estado:

👉 **UPDATE_ROLLBACK_FAILED**

Esto ocurre cuando:

- Un recurso dependiente ya no existe
- O no puede volver a su estado anterior

Ejemplo:

- Una base de datos fue eliminada manualmente fuera de CloudFormation
- CloudFormation intenta restaurarla → falla

---

### 🔹 Solución correcta

### 1. Corregir manualmente los recursos

- Ajustar el estado real para que coincida con lo esperado
- Ej: recrear recurso faltante

---

### 2. Ejecutar:

👉 **ContinueUpdateRollback**

- Indica a CloudFormation que continúe el rollback
- Permite salir del estado fallido

---

### 🔥 Flujo correcto (patrón examen)

1. Detectar error en rollback
2. Corregir recursos manualmente
3. Ejecutar **ContinueUpdateRollback**
4. Stack vuelve a estado estable

---

## **Opciones incorrectas (explicación fiel)**

### A.

- Reaplicar la plantilla original
    
    ❌ No soluciona la causa del fallo
    

---

### D. StackSets

- Usado para multi-account / multi-region
    
    ❌ No sirve para rollback fallido
    

---

### E. Drift detection

- Detecta diferencias
    
    ❌ No corrige errores de rollback
    

---

## 🔥 **Patrones de examen que debes memorizar**

- **UPDATE_ROLLBACK_FAILED → usar ContinueUpdateRollback**
- **Siempre corregir recursos antes**
- **Drift ≠ fix**
- **StackSets ≠ troubleshooting**

---

## ⚡ **Resumen tipo acordeón**

- Problema → rollback falló
- Estado → UPDATE_ROLLBACK_FAILED
- Solución →
    - fix manual
    - ContinueUpdateRollback
- Respuesta → **B y C**

## **Pregunta 35:**

Una empresa de redes sociales tiene su aplicación web alojada en instancias Amazon EC2 desplegadas en una sola región de AWS. La empresa ha expandido sus operaciones a nuevas geografías y quiere ofrecer acceso de baja latencia a la aplicación para sus clientes.

Para cumplir con diferentes regulaciones financieras en cada geografía, la aplicación debe operar en **silos**, y las instancias subyacentes en una región no deben interactuar con las instancias en otras regiones.

¿Cuál de las siguientes opciones representa la solución más óptima para automatizar el despliegue de la aplicación en diferentes regiones de AWS?

---

## **Opciones**

A. Crear un script shell que use AWS CLI para consultar el estado actual en una región y generar una plantilla CloudFormation. Luego crear stacks en otras regiones usando `--region`

B. Crear una plantilla CloudFormation con la infraestructura. Usar CloudFormation stack desde una cuenta administradora para lanzar stacks en múltiples regiones

C. Crear una plantilla CloudFormation con la infraestructura. Usar CloudFormation **change set** desde una cuenta administradora para desplegar en múltiples regiones

D. Crear una plantilla CloudFormation con la infraestructura. Crear stacks usando AWS CLI con parámetro `--regions` para múltiples regiones

---

## ✅ **Respuesta correcta: B**

---

## **Explicación general (completa y fiel)**

### 🔹 Conceptos clave de CloudFormation

**Template**

- Archivo JSON/YAML
- Define la infraestructura

**Stack**

- Unidad de despliegue
- Conjunto de recursos

**Change Set**

- Vista previa de cambios
- NO despliega en múltiples regiones

**StackSet**

- Permite desplegar stacks:
    - en múltiples cuentas
    - en múltiples regiones

---

### 🔹 Por qué StackSets es la solución

Un **StackSet** permite:

- Usar una sola plantilla
- Desplegarla automáticamente en:
    - múltiples regiones
    - múltiples cuentas

Además:

- Mantiene consistencia
- Permite control de despliegue (orden, concurrencia, tolerancia a fallos)

---

### 🔹 En este escenario

Requisitos:

- Multi-región
- Aislamiento (silos)
- Automatización

👉 StackSets cumple TODO

---

## **Opciones incorrectas (explicación fiel)**

### D.

- No existe `-regions` en CLI
    
    ❌ Solo `--region` (uno a la vez)
    

---

### A.

- Script manual
    
    ❌ No es solución óptima
    
    ❌ AWS ya tiene StackSets
    

---

### C.

- Change sets
    
    ❌ Solo sirven para preview
    
    ❌ No despliegan multi-región
    

---

## 🔥 **Patrones de examen que debes memorizar**

- **Multi-region + automatización → StackSets**
- **Change Set = preview, no deployment**
- **CLI multi-region manual = anti-pattern**
- **StackSet = estándar enterprise**

---

## ⚡ **Resumen tipo acordeón**

- Problema → deploy multi-región aislado
- Solución → **CloudFormation StackSets**
- Beneficio → consistencia + automatización
- Respuesta → **B**

## **Pregunta 36:**

Para despliegues entre cuentas AWS, una empresa de e-commerce ha decidido usar AWS CodePipeline para desplegar un stack de AWS CloudFormation desde una cuenta AWS (cuenta A) hacia otra cuenta AWS (cuenta B).

¿Qué combinación de pasos tomarías para configurar este requisito? (**Selecciona tres**)

---

## **Opciones**

A. En la cuenta A, crear un service role para CloudFormation con los permisos necesarios. En la cuenta B, actualizar CodePipeline para incluir recursos de la cuenta A

B. En la cuenta B, crear un rol IAM cross-account. En la cuenta A, agregar permisos de **AssumeRole** al rol de servicio de CodePipeline para asumir ese rol en la cuenta B

C. En la cuenta A, crear una clave KMS administrada por el cliente que otorgue permisos al rol de CodePipeline y a la cuenta B. En la cuenta B, crear un bucket S3 con política que permita acceso a la cuenta A

D. En la cuenta A, crear una clave KMS administrada por el cliente que otorgue permisos al rol de CodePipeline y a la cuenta B. También crear un bucket S3 con política que permita acceso a la cuenta B

E. En la cuenta B, crear un service role para CloudFormation con los permisos necesarios. En la cuenta A, actualizar CodePipeline para incluir recursos de la cuenta B

F. En la cuenta B, agregar permisos de **AssumeRole** al rol de CodePipeline de la cuenta A para que asuma un rol en la cuenta A

---

## ✅ **Respuestas correctas: B, D, E**

---

## **Explicación general (completa y fiel)**

Para despliegues **cross-account con CodePipeline + CloudFormation**, necesitas 3 piezas clave:

---

### 🔹 1. Acceso cross-account (IAM AssumeRole)

- En la cuenta B:
    - crear un **rol cross-account**
- En la cuenta A:
    - permitir que CodePipeline use:
        
        👉 **sts:AssumeRole**
        

👉 Esto permite que CodePipeline despliegue en otra cuenta

---

### 🔹 2. Permisos de CloudFormation en la cuenta destino

- En la cuenta B:
    - crear un **service role para CloudFormation**
    - con permisos para crear recursos
- En la cuenta A:
    - configurar pipeline para usar recursos de cuenta B

---

### 🔹 3. Artefactos y cifrado (S3 + KMS)

- En la cuenta A:
    - crear bucket S3 para artefactos
    - permitir acceso a cuenta B
- Crear una **KMS key**:
    - permitir uso a:
        - CodePipeline (cuenta A)
        - cuenta B

---

## **Opciones incorrectas (explicación fiel)**

### A.

- Roles en cuenta incorrecta
    
    ❌ CloudFormation role debe estar en cuenta destino (B)
    

---

### C.

- Bucket en cuenta incorrecta
    
    ❌ El bucket debe estar en cuenta A (pipeline)
    

---

### F.

- Dirección de AssumeRole incorrecta
    
    ❌ Debe ser A → B, no B → A
    

---

## 🔥 **Patrones de examen que debes memorizar**

- **Cross-account deploy = AssumeRole (A → B)**
- **CloudFormation role SIEMPRE en cuenta destino**
- **Artifacts bucket en cuenta pipeline**
- **KMS key compartida entre cuentas**

---

## ⚡ **Resumen tipo acordeón**

- Problema → deploy cross-account
- Solución →
    - AssumeRole
    - CloudFormation role en B
    - S3 + KMS compartido
- Respuesta → **B, D, E**

## **Pregunta 37:**

El equipo de DevOps de una empresa de e-commerce quiere implementar un plan de parcheo en AWS para una gran flota mixta de servidores Windows y Linux. El plan de parcheo debe ser auditable y debe implementarse de forma segura para cumplir con los requisitos de negocio de la empresa.

¿Cuáles de las siguientes opciones recomendarías para cumplir estos requisitos con el **MENOR esfuerzo operativo**? (**Selecciona dos**)

---

## **Opciones**

A. Configurar soporte de parcheo automático con CloudFormation para mantener el sistema operativo actualizado. Usar AWS Config para auditoría

B. Configurar el agente de Systems Manager (SSM Agent) en todas las instancias. Probar parches en pre-producción y desplegarlos mediante una maintenance window con aprobación

C. Aplicar patch baselines usando el documento SSM **AWS-RunPatchBaseline**

D. Usar herramientas nativas del sistema operativo para parcheo y AWS Config para auditoría

E. Aplicar patch baselines usando el documento SSM **AWS-ApplyPatchBaseline**

---

## ✅ **Respuestas correctas: B y C**

---

## **Explicación general (completa y fiel)**

### 🔹 Systems Manager (clave del examen)

AWS Systems Manager permite:

- gestionar infraestructura
- automatizar tareas operativas
- mantener seguridad y compliance

El **SSM Agent**:

- se instala en EC2
- permite:
    - parcheo
    - configuración
    - administración remota

---

### 🔹 Patch Manager

Permite:

- parchear:
    - sistemas operativos
    - aplicaciones (limitado en Windows)

Usa:

👉 **Patch baselines**

- definen:
    - qué parches aprobar
    - cuándo aplicarlos

---

### 🔹 Automatización con Maintenance Windows

- Permite:
    - programar parches
    - controlar despliegue
    - integrar aprobaciones

👉 Cumple requisito de:

- auditoría
- control
- bajo esfuerzo

---

### 🔹 Documento correcto: AWS-RunPatchBaseline

- Funciona para:
    - ✅ Windows
    - ✅ Linux
- Ejecuta:
    - escaneo
    - instalación de parches

---

## **Opciones incorrectas (explicación fiel)**

### A.

- CloudFormation NO gestiona patching
    
    ❌ es distractor
    

---

### D.

- OS-native tools
    
    ❌ alto esfuerzo operativo
    
    ❌ no cumple “minimal effort”
    

---

### E.

- AWS-ApplyPatchBaseline
    
    ❌ solo Windows
    
    ❌ no soporta Linux
    

---

## 🔥 **Patrones de examen que debes memorizar**

- **Patching en AWS → Systems Manager**
- **RunPatchBaseline = multi-OS**
- **ApplyPatchBaseline = solo Windows (trampa)**
- **Maintenance Windows = control + compliance**
- **Minimal effort → servicio managed (SSM)**

---

## ⚡ **Resumen tipo acordeón**

- Problema → patching multi-OS + compliance
- Solución →
    - SSM Agent
    - Patch Manager
    - RunPatchBaseline
- Respuesta → **B + C**

## **Pregunta 38:**

Un ingeniero DevOps está trabajando en un proyecto de archivado de datos donde la tarea es migrar datos on-premises a un bucket de Amazon S3. El ingeniero ha creado un script que maneja el archivado incremental, transfiriendo datos con más de 6 meses de antigüedad hacia S3. Como parte del proceso, los datos se eliminan del entorno on-premises después de transferirse exitosamente usando la operación **PutObject** de S3.

Durante una revisión de código, el ingeniero identificó un problema crítico: el script no incluye ninguna validación para confirmar que los datos copiados a S3 no tengan corrupción.

Para garantizar la integridad de los datos durante la transmisión, el ingeniero debe actualizar el script para usar checksums MD5 antes de eliminar los datos on-premises.

Considerando estos requisitos, ¿qué modificaciones o soluciones debería implementar el ingeniero? (**Selecciona dos**)

---

## **Opciones**

A. Proveer el MD5 como trailing checksum del objeto y revisar el status de la llamada a S3

B. Revisar el version ID retornado y compararlo con un Content-MD5

C. Revisar el ETag retornado y compararlo con un Content-MD5 calculado previamente

D. Proveer el MD5 en el parámetro **Content-MD5** del comando PUT y verificar el status de la llamada

E. Proveer el MD5 como metadata personalizada del objeto y verificar el status de la llamada

---

## ✅ **Respuestas correctas: C y D**

---

## **Explicación general (completa y fiel)**

### 🔹 Verificación de integridad en S3

Amazon S3 permite verificar la integridad de los datos usando **checksums**.

Una forma clave:

👉 Enviar el checksum MD5 en el header:

- **Content-MD5** en el PUT

S3:

- calcula su propio MD5
- lo compara con el enviado

👉 Si no coinciden:

- la operación falla

---

### 🔹 Validación adicional con ETag

El **ETag**:

- representa una versión del objeto
- en muchos casos (single-part upload):
    
    👉 es equivalente al MD5
    

Entonces puedes:

- comparar ETag vs MD5 calculado
    
    👉 validar integridad
    

---

### 🔥 Flujo correcto (patrón examen)

1. Calcular MD5 local
2. Enviar con **Content-MD5**
3. Validar respuesta
4. (Opcional) comparar con ETag

👉 SOLO después borrar datos origen

---

## **Opciones incorrectas (explicación fiel)**

### A.

- Trailing checksum
    
    ❌ lo calcula AWS, no tú
    

---

### B.

- Version ID
    
    ❌ no tiene relación con integridad
    

---

### E.

- Metadata custom
    
    ❌ no es usado por S3 para validación
    

---

## 🔥 **Patrones de examen que debes memorizar**

- **Content-MD5 = validación oficial**
- **ETag = puede ser MD5 (single-part)**
- ❌ Metadata ≠ validación
- ❌ Version ID ≠ integridad
- ❌ Trailing checksum ≠ control manual

---

## ⚡ **Resumen tipo acordeón**

- Problema → riesgo de corrupción de datos
- Solución →
    - Content-MD5
    - Validación con ETag
- Respuesta → **C + D**

## **Pregunta 39:**

Un proyecto tiene dos cuentas AWS: una cuenta de desarrollo y una cuenta de producción, ambas en la región us-east-1. Un ingeniero DevOps necesita desplegar artefactos desde el bucket S3 de la cuenta de desarrollo hacia el bucket S3 de la cuenta de producción usando AWS CodePipeline con una acción de despliegue en Amazon S3.

¿Qué configuraciones son obligatorias para este despliegue cross-account? (**Selecciona dos**)

---

## **Opciones**

A. Configurar un rol cross-account en la cuenta de producción. Adjuntar una política al rol de servicio de CodePipeline en la cuenta de desarrollo que le permita asumir ese rol

B. Configurar un rol cross-account en la cuenta de desarrollo. Adjuntar una política al bucket S3 en producción que permita acceso a ese rol

C. Usar una clave KMS multi-región con múltiples réplicas

D. Crear una clave en AWS Secrets Manager para usar con CodePipeline

E. Crear una clave KMS para usar con CodePipeline en la cuenta de desarrollo. Además, el bucket de entrada en desarrollo debe tener versioning habilitado

---

## ✅ **Respuestas correctas: A y E**

---

## **Explicación general (completa y fiel)**

### 🔹 1. IAM cross-account (pieza clave)

Para despliegue cross-account:

- En cuenta **producción (B)**:
    - crear un **rol cross-account**
- En cuenta **desarrollo (A)**:
    - el rol de CodePipeline debe tener permiso:
        
        👉 **sts:AssumeRole**
        

👉 Esto permite que CodePipeline despliegue en la cuenta destino

---

### 🔹 2. KMS + S3 (artefactos)

CodePipeline usa S3 para artefactos:

- Deben estar cifrados con:
    
    👉 **KMS customer-managed key**
    

Si no:

❌ el rol en la otra cuenta no podrá desencriptar

---

Además:

👉 El bucket de entrada DEBE tener:

- **versioning habilitado**
- requisito obligatorio de CodePipeline

---

## **Opciones incorrectas (explicación fiel)**

### B.

- Rol en cuenta incorrecta
    
    ❌ Debe estar en cuenta destino (producción)
    

---

### C.

- KMS multi-region
    
    ❌ Solo necesario si hay múltiples regiones
    
    👉 aquí ambas están en us-east-1
    

---

### D.

- Secrets Manager
    
    ❌ No relacionado con este caso
    

---

## 🔥 **Patrones de examen que debes memorizar**

- **Cross-account → AssumeRole (siempre)**
- **Artifacts → S3 + KMS customer-managed**
- **CodePipeline → requiere versioning en bucket**
- ❌ Default encryption NO funciona cross-account

---

## ⚡ **Resumen tipo acordeón**

- Problema → deploy cross-account con CodePipeline
- Solución →
    - AssumeRole
    - KMS CMK
    - S3 versioning
- Respuesta → **A + E**

## **Pregunta 40:**

Un ingeniero DevOps necesita usar AWS CloudFormation para desplegar una aplicación. Sin embargo, el ingeniero no tiene los permisos necesarios para aprovisionar los recursos especificados en la plantilla de CloudFormation.

¿Qué solución permitirá al ingeniero desplegar el stack proporcionando el **menor nivel de privilegios posible**?

---

## **Opciones**

A. Crear un service role de CloudFormation con permisos necesarios y usar condición `aws:SourceIp` para restringir IPs. Asociar el rol al stack y dar permisos `iam:PassRole` al desarrollador

B. Crear un service role de CloudFormation con los permisos requeridos y asociarlo al stack. Otorgar al desarrollador permisos `iam:PassRole` para pasar el rol. Usar este rol en los despliegues

C. Crear un service role de CloudFormation con permisos completos. Asociarlo al stack y restringir uso con ResourceTag en `iam:PassRole`

D. Crear un service role de CloudFormation con permisos requeridos y asociarlo al stack. Usarlo en despliegues (sin `PassRole`)

---

## ✅ **Respuesta correcta: B**

---

## **Explicación general (completa y fiel)**

### 🔹 Concepto clave: CloudFormation Service Role

Un **service role** permite que CloudFormation:

- ejecute acciones en tu nombre
- cree/modifique recursos

Por defecto:

- CloudFormation usa permisos del usuario
    
    ❌ problema: el usuario no tiene permisos suficientes
    

👉 Solución:

- crear un **service role con permisos específicos**

---

### 🔹 Principio clave: Least Privilege

- El rol debe tener:
    - SOLO los permisos necesarios
        
        ❌ NO full access
        

---

### 🔹 iam:PassRole (CRÍTICO en examen)

Para que el desarrollador use ese rol:

👉 necesita permiso:

- **iam:PassRole**

Esto permite:

- pasar el rol a CloudFormation
- sin darle permisos directos sobre recursos

---

### 🔥 Flujo correcto

1. Crear service role (permisos mínimos)
2. Asociarlo al stack
3. Dar `iam:PassRole` al developer
4. CloudFormation usa ese rol

---

## **Opciones incorrectas (explicación fiel)**

### A.

- Usa `aws:SourceIp`
    
    ❌ incorrecto porque:
    
    - CloudFormation usa su propia IP

---

### C.

- Da permisos completos
    
    ❌ viola least privilege
    
- Usa ResourceTag en PassRole
    
    ❌ no recomendado / no válido
    

---

### D.

- Falta `iam:PassRole`
    
    ❌ el developer no puede usar el rol
    

---

## 🔥 **Patrones de examen que debes memorizar**

- **CloudFormation + permisos → Service Role**
- **Usuarios → NO necesitan permisos directos**
- **iam:PassRole = obligatorio**
- **Least privilege siempre gana**

---

## ⚡ **Resumen tipo acordeón**

- Problema → user sin permisos
- Solución →
    - Service Role
    - iam:PassRole
- Clave → least privilege
- Respuesta → **B**

## **Pregunta 41:**

Un clúster de Aurora está configurado con una sola instancia de base de datos para una aplicación web. La aplicación utiliza el **endpoint de la instancia** para leer y escribir datos en la base de datos. El equipo de operaciones ha programado una actualización del clúster durante la próxima ventana de mantenimiento. El equipo de soporte ha solicitado asegurar acceso ininterrumpido a la aplicación durante esta ventana.

¿Qué paso debería tomar un ingeniero DevOps para que los usuarios experimenten la **menor interrupción posible** durante la ventana de mantenimiento?

---

## **Opciones**

A. Activar Multi-AZ en el clúster Aurora y usar el endpoint Multi-AZ para lecturas/escrituras

B. Activar Multi-AZ para escrituras y usar el cluster endpoint para writes

C. Agregar una instancia reader al clúster. Configurar la aplicación para usar el **cluster endpoint** para escrituras y el **reader endpoint** para lecturas

D. Agregar una instancia reader y usar custom endpoints para separar read/write

---

## ✅ **Respuesta correcta: C**

---

## **Explicación general (completa y fiel)**

### 🔹 Problema clave

Actualmente:

- Solo hay **1 instancia (single point of failure)**
- La app usa:
    
    ❌ **instance endpoint**
    

👉 Esto es malo porque:

- no hay failover automático
- mantenimiento = downtime

---

### 🔹 Solución correcta

👉 **Agregar reader instance (Aurora Replica)**

Beneficios:

- sirve tráfico de lectura
- reduce carga en primary
- mejora disponibilidad

---

### 🔹 Uso correcto de endpoints (MUY IMPORTANTE)

**Cluster endpoint (writer endpoint)**

- siempre apunta al primary
- soporta failover automático
- usado para writes

**Reader endpoint**

- balancea lecturas entre réplicas
- mejora escalabilidad

---

### 🔥 Punto crítico del examen

👉 **Nunca usar instance endpoint en producción**

Siempre:

- write → cluster endpoint
- read → reader endpoint

---

### 🔹 Alta disponibilidad

Si el primary falla:

- Aurora promueve una réplica
- cluster endpoint cambia automáticamente

👉 mínima interrupción

---

## **Opciones incorrectas (explicación fiel)**

### A y B.

- No puedes convertir Aurora a Multi-AZ “clásico”
    
    ❌ ya usa otro modelo
    

---

### D.

- Custom endpoints
    
    ❌ overkill
    
    ❌ no necesario para este caso
    

---

## 🔥 **Patrones de examen que debes memorizar**

- **Aurora = cluster endpoint + reader endpoint**
- **Instance endpoint = anti-pattern**
- **Reader replica = HA + scaling**
- **Failover automático via cluster endpoint**

---

## ⚡ **Resumen tipo acordeón**

- Problema → single instance + downtime
- Solución →
    - agregar reader
    - usar endpoints correctos
- Respuesta → **C**

## **Pregunta 42:**

Una aplicación se ejecuta en un conjunto de instancias Amazon EC2 Windows configuradas con un Auto Scaling group (ASG). Cuando ocurre un **scale-in**, las instancias se terminan sin notificación.

El equipo de la aplicación quiere crear una AMI y remover la instancia EC2 Windows de su dominio **antes de que las instancias sean terminadas**.

Como ingeniero DevOps, ¿qué combinación de pasos elegirías para implementar este requisito? (**Selecciona dos**)

---

## **Opciones**

A. Configurar una Maintenance Window de Systems Manager para ejecutar un script PowerShell y crear una AMI

B. Configurar Patch Manager como target de CloudWatch para ejecutar script y crear AMI

C. Agregar un lifecycle hook que ponga la instancia en estado **Terminating:Wait** y configurar un evento de CloudWatch para monitorear ese estado

D. Agregar un documento de Automation de Systems Manager como target de CloudWatch. El documento ejecuta un script PowerShell para remover la instancia del dominio y crear una AMI

E. Agregar un lifecycle hook con estado **Terminating:Pending** y monitorear con CloudWatch

---

## ✅ **Respuestas correctas: C y D**

---

## **Explicación general (completa y fiel)**

### 🔹 Problema clave

Cuando una instancia en ASG termina:

- se elimina inmediatamente
    
    ❌ no hay tiempo para ejecutar lógica custom
    

---

### 🔹 Solución: Lifecycle Hook

👉 Permite **pausar la terminación**

Estado clave:

- **Terminating:Wait**

Esto:

- detiene temporalmente la terminación
- permite ejecutar acciones antes

---

### 🔹 Trigger con CloudWatch Events

- Detecta estado:
    
    👉 **Terminating:Wait**
    
- Dispara:
    
    👉 acción automatizada
    

---

### 🔹 Ejecución con Systems Manager Automation

- Ejecuta:
    - script PowerShell
    - remover del dominio
    - crear AMI

👉 Todo sin intervención manual

---

### 🔥 Flujo completo (patrón examen)

1. ASG inicia terminación
2. Lifecycle hook → **Terminating:Wait**
3. CloudWatch detecta evento
4. Systems Manager Automation ejecuta script
5. Se completa terminación

---

## **Opciones incorrectas (explicación fiel)**

### A.

- Maintenance Window
    
    ❌ basado en tiempo
    
    ❌ no evento real-time
    

---

### B.

- Patch Manager
    
    ❌ solo para patching
    
    ❌ no lógica custom
    

---

### E.

- Terminating:Pending
    
    ❌ estado no válido
    

---

## 🔥 **Patrones de examen que debes memorizar**

- **ASG lifecycle hook = ejecutar lógica antes de terminate**
- **Estado clave → Terminating:Wait**
- **Automation → ejecutar scripts**
- **Event-driven → CloudWatch Events**
- ❌ Maintenance Window = no sirve para eventos inmediatos

---

## ⚡ **Resumen tipo acordeón**

- Problema → ejecutar lógica antes de terminate
- Solución →
    - Lifecycle hook
    - SSM Automation
- Trigger → CloudWatch Events
- Respuesta → **C + D**

## **Pregunta 43:**

La política de seguridad de una empresa exige cifrar todas las AMIs que se comparten entre sus cuentas AWS.

Una cuenta AWS (Cuenta A) tiene una AMI personalizada que **no está cifrada**. Esta AMI debe compartirse con otra cuenta AWS (Cuenta B).

La Cuenta B tiene instancias EC2 configuradas con un Auto Scaling group que usará esta AMI.

La Cuenta A ya tiene una clave de AWS KMS.

Como ingeniero DevOps, ¿qué combinación de pasos tomarías para compartir la AMI con la Cuenta B cumpliendo con la política de seguridad? (**Selecciona dos**)

---

## **Opciones**

A. En la Cuenta A, crear una AMI cifrada usando una clave administrada por AWS y compartirla

B. En la Cuenta A, crear una AMI cifrada y solo modificar permisos del AMI para compartirla

C. En la Cuenta A, cifrar snapshots y compartir AMI sin configurar KMS correctamente

D. En la Cuenta B, crear un **KMS grant** que delegue permisos al service-linked role del Auto Scaling group

E. En la Cuenta A, crear una AMI cifrada especificando una clave KMS en el copy. Modificar la policy de la clave para permitir a la Cuenta B crear grants. Compartir la AMI cifrada

---

## ✅ **Respuestas correctas: D y E**

---

## **Explicación general (completa y fiel)**

### 🔹 Problema clave

- La AMI está **sin cifrar** ❌
- Debe compartirse entre cuentas
- Auto Scaling en otra cuenta la usará

👉 Requisito:

- cifrado obligatorio
- acceso cross-account

---

### 🔹 Paso 1: Cifrar la AMI (Cuenta A)

Debes:

- copiar la AMI
- **especificar una KMS key (customer-managed)**

⚠️ Importante:

- ❌ No puedes usar AWS-managed keys para compartir AMIs
- ✔️ Debe ser **customer-managed KMS key**

---

### 🔹 Paso 2: Permitir acceso cross-account a la KMS key

Modificar **key policy** para:

- permitir a Cuenta B crear **grants**

👉 Esto NO da acceso directo

👉 solo permite delegarlo

---

### 🔹 Paso 3: Crear KMS Grant (Cuenta B)

En Cuenta B:

- crear un **grant**
- delegar permisos al:
    
    👉 **service-linked role del Auto Scaling**
    

Esto permite:

- usar la clave
- lanzar instancias desde la AMI cifrada

---

### 🔥 Punto CRÍTICO del examen

👉 **Cross-account + KMS = SIEMPRE 2 pasos**

1. Key policy (Account A)
2. Grant (Account B)

---

### 🔹 Service-linked role

Auto Scaling usa:

- roles predefinidos
- NO tienen acceso automático a CMK

👉 necesitas grant explícito

---

## **Opciones incorrectas (explicación fiel)**

### A.

- usa AWS-managed key
    
    ❌ no permite sharing cross-account
    

---

### B.

- solo permisos de AMI
    
    ❌ falta KMS access
    

---

### C.

- no configura acceso KMS correctamente
    
    ❌ incompleto
    

---

## 🔥 **Patrones de examen que debes memorizar**

- **AMI cifrada + cross-account → CMK obligatoria**
- **KMS sharing = key policy + grant**
- **Auto Scaling usa service-linked role**
- ❌ AWS-managed keys NO sirven cross-account

---

## ⚡ **Resumen tipo acordeón**

- Problema → compartir AMI cifrada
- Solución →
    - cifrar con CMK
    - policy + grant
- Respuesta → **D + E**

## **Pregunta 44:**

Una empresa tiene cientos de cuentas AWS y ha creado una organización en AWS Organizations para administrarlas. La empresa quiere un dashboard que permita **buscar, visualizar y analizar métricas de CloudWatch, logs y trazas (AWS X-Ray)** desde todas las cuentas vinculadas hacia una **única cuenta central de seguridad y operaciones**.

La solución también debe **incorporar automáticamente nuevas cuentas AWS** que se creen en la organización en el futuro.

Como ingeniero DevOps, ¿qué solución propondrías para cumplir estos requisitos?

---

## **Opciones**

A. Usar CloudWatch cross-account observability configurando una cuenta central de monitoreo y vincularla con las demás cuentas usando AWS Organizations

B. Usar CloudWatch cross-account observability conectando cuentas manualmente desde la consola

C. Usar Metric Streams + Firehose + S3 + Athena para dashboards

D. Usar CloudWatch alarms + EventBridge + S3 + Athena para dashboards

---

## ✅ **Respuesta correcta: A**

---

## **Explicación general (completa y fiel)**

### 🔹 Requisito clave

- Centralizar:
    - métricas
    - logs
    - trazas (X-Ray)
- Desde múltiples cuentas
- En una sola cuenta
- Con onboarding automático

---

### 🔹 Solución: CloudWatch Cross-Account Observability

Permite:

- monitorear múltiples cuentas
- desde una cuenta central (**monitoring account**)
- sin límites entre cuentas

---

### 🔹 Conceptos clave

**Monitoring account**

- cuenta central
- visualiza todo

**Source accounts**

- cuentas que generan datos

---

### 🔹 Tipos de datos soportados

- CloudWatch Metrics
- CloudWatch Logs
- AWS X-Ray traces

---

### 🔥 Requisito crítico del escenario

👉 **Auto-onboarding de nuevas cuentas**

✔ Solución:

- usar **AWS Organizations**

Esto permite:

- agregar automáticamente nuevas cuentas
- sin configuración manual

---

### 🔥 Punto clave de examen

👉 **Si ves:**

- múltiples cuentas
- centralización
- logs + métricas + trazas

👉 Respuesta casi siempre:

➡️ **CloudWatch cross-account observability + Organizations**

---

## **Opciones incorrectas (explicación fiel)**

### B.

- conexión manual
    
    ❌ no escala
    
    ❌ no cumple auto-onboarding
    

---

### C.

- Metric Streams + Firehose
    
    ❌ orientado a streaming
    
    ❌ no necesario aquí
    

---

### D.

- EventBridge → S3
    
    ❌ arquitectura incorrecta
    
    ❌ EventBridge no envía directo a S3
    

---

## 🔥 **Patrones de examen que debes memorizar**

- **Multi-account observability → CloudWatch cross-account**
- **Auto-onboarding → AWS Organizations**
- **Monitoring account + Source accounts**
- ❌ soluciones custom = distractores

---

## ⚡ **Resumen tipo acordeón**

- Problema → visibilidad multi-cuenta
- Requisito → auto-onboarding
- Solución →
    - CloudWatch cross-account
    - AWS Organizations
- Respuesta → **A**

## **Pregunta 45:**

Una aplicación de compartición de videos almacena sus archivos en un bucket de Amazon S3. Durante el último año, el tráfico de usuarios ha crecido miles de veces y la empresa planea introducir servicios de suscripción.

La empresa necesita conocer los **patrones de acceso de los archivos de video** para identificar los videos más vistos y descargados.

¿Cuál de las siguientes opciones es la solución **MÁS rentable (cost-effective)** que se puede implementar lo antes posible?

---

## **Opciones**

A. Usar métricas de S3 en CloudWatch + Lambda + QuickSight

B. Habilitar access logging + Lambda + Firehose + OpenSearch

C. Habilitar server access logging en S3 + usar Athena para consultar los logs

D. Habilitar server access logging + usar Redshift Spectrum

---

## ✅ **Respuesta correcta: C**

---

## **Explicación general (completa y fiel)**

### 🔹 Solución recomendada

👉 **S3 Server Access Logging + Amazon Athena**

---

### 🔹 ¿Por qué funciona?

**Server access logging**:

- registra todas las solicitudes:
    - GET
    - PUT
    - DELETE
- guarda logs en S3

Esto permite:

- saber qué archivos se acceden
- cuántas veces
- desde dónde

---

### 🔹 Uso de Athena

Amazon Athena:

- servicio serverless
- consultas SQL sobre datos en S3
- sin infraestructura

Permite:

- analizar logs directamente
- sin ETL
- bajo costo

---

### 🔹 Cómo funciona técnicamente

1. Habilitas logging en S3
2. Logs se guardan en otro bucket
3. Creas tabla externa en Athena
4. Ejecutas queries SQL

Ejemplo:

- archivos más descargados
- patrones de acceso
- análisis de usuarios

---

### 🔥 Punto clave del examen

👉 **"Cost-effective + rápido" = Athena**

✔ serverless

✔ sin infraestructura

✔ pago por consulta

---

## **Opciones incorrectas (explicación fiel)**

### A.

- CloudWatch metrics
    
    ❌ solo métricas agregadas
    
    ❌ no detalle por objeto
    

---

### B.

- Lambda + Firehose + OpenSearch
    
    ❌ arquitectura compleja
    
    ❌ costosa
    
    ❌ overkill
    

---

### D.

- Redshift Spectrum
    
    ❌ requiere cluster
    
    ❌ costoso
    
    ❌ no necesario
    

---

## 🔥 **Patrones de examen que debes memorizar**

- **Logs en S3 + análisis → Athena**
- **Cost-effective → serverless primero**
- **OpenSearch = real-time / caro**
- **Redshift = heavy analytics / caro**
- **CloudWatch metrics ≠ access logs**

---

## ⚡ **Resumen tipo acordeón**

- Problema → analizar accesos a archivos
- Solución →
    - S3 access logs
    - Athena
- Clave → barato + rápido
- Respuesta → **C**