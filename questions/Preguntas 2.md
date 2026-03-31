# Preguntas 2

#### Pregunta 1:

Una empresa de servicios financieros está usando una AMI reforzada de seguridad debido a estrictos requisitos de cumplimiento regulatorio. La empresa debe poder verificar todos los días las vulnerabilidades de la AMI con base en las vulnerabilidades recién divulgadas a través del programa Common Vulnerabilities and Exposures (CVEs). Actualmente, todas las instancias se lanzan mediante un grupo de Auto Scaling (ASG) aprovechando la AMI reforzada de seguridad más reciente.

Como Ingeniero DevOps, ¿cómo puede implementar esto minimizando el costo y la interrupción de la aplicación?

A. Crear un evento de CloudWatch con una programación diaria. Invocar una función Lambda que iniciará una ejecución de AWS Inspector directamente desde la referencia de la AMI en la llamada a la API. AWS Inspector lanzará automáticamente una instancia y la terminará al completar la evaluación

B. Crear un evento de CloudWatch con una programación diaria, siendo el objetivo una función Lambda. Etiquetar todas las instancias en su ASG con CheckVulnerabilities: True. La función Lambda debe iniciar una evaluación en AWS Inspector apuntando a todas las instancias que tengan la etiqueta

C. Crear un evento de CloudWatch con una programación diaria, siendo el objetivo una Step Function. La Step Function debe lanzar una instancia EC2 desde la AMI y etiquetarla con CheckVulnerabilities: True. La Step Function luego inicia una plantilla de evaluación de AMI usando AWS Inspector y la etiqueta anterior. Terminar la instancia después

D. Crear un evento de CloudWatch con una programación diaria. Hacer que el objetivo de la regla sea AWS Inspector y pasar algunos datos extra en la regla usando el ID de la AMI a inspeccionar. AWS Inspector lanzará automáticamente una instancia y la terminará al completar la evaluación

**La respuesta:**

**C**

Explicación general

Correct option:

Crear un evento de CloudWatch con una programación diaria, siendo el objetivo una Step Function. La Step Function debe lanzar una instancia EC2 desde la AMI y etiquetarla con CheckVulnerabilities: True. La Step Function luego inicia una plantilla de evaluación de AMI usando AWS Inspector y la etiqueta anterior. Terminar la instancia después

AWS Step Functions es un servicio totalmente administrado que facilita coordinar los componentes de aplicaciones distribuidas y microservicios usando flujos de trabajo visuales.

Una golden AMI es una AMI que contiene los parches de seguridad más recientes, software, configuración y agentes de software que necesita instalar para logging, mantenimiento de seguridad y monitoreo de rendimiento. Una mejor práctica de seguridad es realizar evaluaciones rutinarias de vulnerabilidades de sus golden AMIs para identificar si las vulnerabilidades recién encontradas les aplican. Si identifica una vulnerabilidad, puede actualizar sus golden AMIs con los parches de seguridad apropiados, probar las AMIs y desplegar las AMIs parchadas en su entorno.

Puede crear una instancia EC2 a partir de la golden AMI y luego ejecutar una evaluación de seguridad de Amazon Inspector sobre la instancia creada. Amazon Inspector realiza evaluaciones de seguridad de instancias Amazon EC2 usando paquetes de reglas administradas por AWS, como el paquete Common Vulnerabilities and Exposures (CVEs).

vía - [https://aws.amazon.com/blogs/security/how-to-set-up-continuous-golden-ami-vulnerability-assessments-with-amazon-inspector/](https://aws.amazon.com/blogs/security/how-to-set-up-continuous-golden-ami-vulnerability-assessments-with-amazon-inspector/)

Entonces, para resumir, la manera más rentable y la menos disruptiva de hacer una evaluación es crear una instancia EC2 a partir de una AMI específicamente para ese propósito, ejecutar la evaluación y finalmente terminar la instancia. Step Functions es perfecto para orquestar ese flujo de trabajo apuntando a las instancias etiquetadas con CheckVulnerabilities: True.

Incorrect options:

Crear un evento de CloudWatch con una programación diaria. Invocar una función Lambda que iniciará una ejecución de AWS Inspector directamente desde la referencia de la AMI en la llamada a la API. AWS Inspector lanzará automáticamente una instancia y la terminará al completar la evaluación - AWS Inspector no puede ejecutar una evaluación directamente sobre una AMI, no lanzará una instancia EC2 por usted. Por lo tanto, necesita asegurarse de que una instancia EC2 sea creada por adelantado a partir de esa AMI, con la etiqueta adecuada en la instancia EC2 para coincidir con el objetivo de evaluación.

Crear un evento de CloudWatch con una programación diaria. Hacer que el objetivo de la regla sea AWS Inspector y pasar algunos datos extra en la regla usando el ID de la AMI a inspeccionar. AWS Inspector lanzará automáticamente una instancia y la terminará al completar la evaluación - AWS Inspector no puede ejecutar una evaluación directamente sobre una AMI, no lanzará una instancia EC2 por usted. Por lo tanto, necesita asegurarse de que una instancia EC2 sea creada por adelantado a partir de esa AMI, con la etiqueta adecuada en la instancia EC2 para coincidir con el objetivo de evaluación.

Crear un evento de CloudWatch con una programación diaria, siendo el objetivo una función Lambda. Etiquetar todas las instancias en su ASG con CheckVulnerabilities: True. La función Lambda debe iniciar una evaluación en AWS Inspector apuntando a todas las instancias que tengan la etiqueta - Si lanza una evaluación sobre todas las instancias en un ASG, será problemático desde una perspectiva de costos ya que estará probando la misma AMI para tantas instancias como formen parte del ASG. Esto también incurrirá en cargos extra de AWS Inspector.

References:

[https://aws.amazon.com/blogs/security/how-to-set-up-continuous-golden-ami-vulnerability-assessments-with-amazon-inspector/](https://aws.amazon.com/blogs/security/how-to-set-up-continuous-golden-ami-vulnerability-assessments-with-amazon-inspector/)

[https://aws.amazon.com/step-functions/faqs/](https://aws.amazon.com/step-functions/faqs/)

[https://docs.aws.amazon.com/inspector/latest/userguide/inspector_cves.html](https://docs.aws.amazon.com/inspector/latest/userguide/inspector_cves.html)

**Temática**

Domain 6: Security and Compliance

#### Pregunta 2:

Una empresa de electrodomésticos industriales desea aprovechar AWS Systems Manager para gestionar sus instancias on-premise y sus instancias EC2. Esto les permitirá ejecutar algunos comandos SSM RunCommand a través de su flota híbrida. La empresa también desea gestionar eficazmente el tamaño de la flota. La empresa te ha contratado como AWS Certified DevOps Engineer Professional para construir una solución que cubra este requerimiento.

¿Cómo configurarías el servidor on-premise para lograr este objetivo?

A. Crear un IAM Service Role para las instancias para poder llamar a la operación AssumeRole en el servicio SSM. Generar un código de activación y un ID de activación para tus servidores on-premise. Usar estas credenciales para registrar tus servidores on-premise. Aparecerán con el prefijo "mi-" en tu consola de SSM

B. Crear un IAM Service Role para cada instancia para poder llamar a la operación AssumeRole en el servicio SSM. Generar un código de activación único y un ID de activación para cada servidor on-premise. Usar estas credenciales para registrar tus servidores on-premise. Aparecerán con el prefijo "i-" en tu consola de SSM

C. Crear un IAM User para cada servidor on-premise para poder llamar a la operación AssumeRole en el servicio SSM. Usando el Access Key ID y el Secret Access Key ID, usar el AWS CLI para registrar tus servidores on-premise. Aparecerán con el prefijo "mi-" en tu consola de SSM

D. Crear un IAM User para todos los servidores on-premise para poder llamar a la operación AssumeRole en el servicio SSM. Usando el Access Key ID y el Secret Access Key ID, usar el AWS CLI para registrar tus servidores on-premise. Aparecerán con el prefijo "i-" en tu consola de SSM

**La respuesta:**

**A**

Explicación general

Correct option:

Crear un IAM Service Role para las instancias para poder llamar a la operación AssumeRole en el servicio SSM. Generar un código de activación y un ID de activación para tus servidores on-premise. Usar estas credenciales para registrar tus servidores on-premise. Aparecerán con el prefijo "mi-" en tu consola de SSM

AWS Systems Manager permite centralizar datos operativos de múltiples servicios de AWS y automatizar tareas en tus recursos de AWS. Puedes crear grupos lógicos de recursos como aplicaciones, diferentes capas de una pila de aplicaciones, o entornos de producción versus desarrollo. Con Systems Manager, puedes seleccionar un grupo de recursos y ver su actividad reciente de API, cambios de configuración de recursos, notificaciones relacionadas, alertas operativas, inventario de software y estado de cumplimiento de parches.

Cómo funciona Systems Manager:  vía - [https://aws.amazon.com/systems-manager/](https://aws.amazon.com/systems-manager/)

Los servidores y máquinas virtuales (VMs) en un entorno híbrido requieren un rol de IAM para comunicarse con el servicio Systems Manager. El rol otorga confianza de AssumeRole al servicio Systems Manager. Solo necesitas crear un service role para un entorno híbrido una vez por cada cuenta de AWS.

Para configurar servidores y máquinas virtuales (VMs) en tu entorno híbrido como instancias gestionadas, necesitas crear una activación de managed-instance. Después de completar la activación, recibes inmediatamente un Activation Code y un Activation ID. Especificas esta combinación Code/ID cuando instalas los agentes SSM en servidores y VMs en tu entorno híbrido. El Code/ID proporciona acceso seguro al servicio Systems Manager desde tus instancias gestionadas.

En el campo Instance limit, especifica el número total de servidores on-premise o VMs que deseas registrar con AWS como parte de la activación. Esto significa que no necesitas crear un Code/ID de activación único para cada instancia gestionada.

Después de terminar de configurar tus servidores y VMs para Systems Manager, tus máquinas híbridas se listan en la consola de AWS Management Console y se describen como managed instances. Las instancias Amazon EC2 configuradas para Systems Manager también se describen como managed instances. En la consola, sin embargo, los IDs de tus instancias híbridas se distinguen de las instancias Amazon EC2 con el prefijo "mi-". Los IDs de instancias Amazon EC2 usan el prefijo "i-".

vía - [https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-managedinstances.html](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-managedinstances.html)

Incorrect options:

Crear un IAM Service Role para cada instancia para poder llamar a la operación AssumeRole en el servicio SSM. Generar un código de activación único y un ID de activación para cada servidor on-premise. Usar estas credenciales para registrar tus servidores on-premise. Aparecerán con el prefijo "i-" en tu consola de SSM - Como se mencionó en la explicación anterior, las instancias on-premise usan el prefijo "mi-" mientras que los IDs de instancias Amazon EC2 usan el prefijo "i-".

Crear un IAM User para cada servidor on-premise para poder llamar a la operación AssumeRole en el servicio SSM. Usando el Access Key ID y el Secret Access Key ID, usar el AWS CLI para registrar tus servidores on-premise. Aparecerán con el prefijo "mi-" en tu consola de SSM

Crear un IAM User para todos los servidores on-premise para poder llamar a la operación AssumeRole en el servicio SSM. Usando el Access Key ID y el Secret Access Key ID, usar el AWS CLI para registrar tus servidores on-premise. Aparecerán con el prefijo "i-" en tu consola de SSM

Ambas opciones sugieren usar Access Key ID y Secret Access Key ID para registrar tus servidores on-premise, lo cual se considera una mala práctica desde el punto de vista de seguridad. En su lugar, debes usar un IAM Service Role para instancias que puedan llamar a la operación AssumeRole en el servicio SSM.

References:

[https://docs.aws.amazon.com/systems-manager/latest/userguide/sysman-managed-instance-activation.html](https://docs.aws.amazon.com/systems-manager/latest/userguide/sysman-managed-instance-activation.html)

[https://docs.aws.amazon.com/systems-manager/latest/userguide/sysman-service-role.html](https://docs.aws.amazon.com/systems-manager/latest/userguide/sysman-service-role.html)

**Temática**

Domain 6: Security and Compliance

#### **Pregunta 3:**

Una empresa de movilidad conecta personas con conductores de taxi y el equipo DevOps de la empresa usa CodeCommit como servicio de respaldo y recuperación ante desastres para varios de sus procesos DevOps. El equipo está creando un pipeline de CI/CD para que tu código en la rama master de CodeCommit se empaquete automáticamente como un contenedor Docker y se publique en ECR. Luego, el equipo quiere que esa imagen se despliegue automáticamente a un clúster ECS usando una estrategia Blue/Green.

Como AWS Certified DevOps Engineer, ¿cuál de las siguientes opciones recomendarías como la solución más eficiente para cumplir con los requisitos dados?

A. Crear un CodePipeline que invoque una etapa de CodeBuild. La etapa de CodeBuild debe obtener credenciales de ECR usando los CLI helpers, construir la imagen y luego subirla a ECR. Crear una regla de CloudWatch Event que reaccione a los pushes a ECR e invoque CodeDeploy, cuyo objetivo debe ser el clúster ECS

B. Crear un CodePipeline que invoque una etapa de CodeBuild. La etapa de CodeBuild debe obtener credenciales de ECR usando los CLI helpers, construir la imagen y luego subirla a ECR. Al éxito de esa etapa de CodeBuild, crear una nueva definición de tarea automáticamente usando CodeCommit y aplicar esa definición de tarea al servicio ECS usando una acción de CloudFormation

C. Crear un CodePipeline que invoque una etapa de CodeBuild. La etapa de CodeBuild debe obtener credenciales de ECR usando los CLI helpers, construir la imagen y luego subirla a ECR. Al éxito de esa etapa de CodeBuild, iniciar una etapa de CodeDeploy con el objetivo siendo tu servicio ECS

D. Crear un CodePipeline que invoque una etapa de CodeBuild. La etapa de CodeBuild debe obtener credenciales de ECR usando las variables de entorno AWS_ACCESS_KEY_ID y AWS_SECRET_ACCESS_KEY pasadas mediante la configuración de CodeBuild, siendo los valores los de tu usuario. Al éxito de esa etapa de CodeBuild, crear una nueva definición de tarea automáticamente usando CodePipeline y aplicar esa definición de tarea al servicio ECS usando una acción de CloudFormation

**La respuesta:**

**C**

Explicación general

Correct option:

Crear un CodePipeline que invoque una etapa de CodeBuild. La etapa de CodeBuild debe obtener credenciales de ECR usando los CLI helpers, construir la imagen y luego subirla a ECR. Al éxito de esa etapa de CodeBuild, iniciar una etapa de CodeDeploy con el objetivo siendo tu servicio ECS

AWS CodePipeline es un servicio de entrega continua que te permite modelar, visualizar y automatizar los pasos necesarios para liberar tu software. Con AWS CodePipeline, modelas el proceso completo de liberación para construir tu código, desplegar en entornos de preproducción, probar tu aplicación y liberarla a producción.

CodeBuild es un servicio de integración continua totalmente administrado en la nube. CodeBuild compila el código fuente, ejecuta pruebas y produce paquetes listos para desplegar. CodeBuild elimina la necesidad de aprovisionar, gestionar y escalar tus propios servidores de build. Un buildspec es una colección de comandos de build y configuraciones relacionadas, en formato YAML, que CodeBuild utiliza para ejecutar una compilación. Puedes incluir un buildspec como parte del código fuente o definirlo al crear un proyecto de build.

Puedes usar CodeBuild para obtener credenciales de ECR usando los CLI helpers, construir la imagen y luego subirla a ECR. Debes tener en cuenta que la obtención de credenciales de ECR debe hacerse usando roles IAM y CLI helpers en CodeBuild, no variables de entorno, especialmente no mediante tu access key y secret key de usuario.

vía - [https://docs.aws.amazon.com/codebuild/latest/userguide/sample-docker.html](https://docs.aws.amazon.com/codebuild/latest/userguide/sample-docker.html)

Incorrect options:

Crear un CodePipeline que invoque una etapa de CodeBuild. La etapa de CodeBuild debe obtener credenciales de ECR usando los CLI helpers, construir la imagen y luego subirla a ECR. Al éxito de esa etapa de CodeBuild, crear una nueva definición de tarea automáticamente usando CodeCommit y aplicar esa definición de tarea al servicio ECS usando una acción de CloudFormation - Debes tener en cuenta que tanto CodeDeploy como CloudFormation pueden soportar despliegues blue/green para ECS. Sin embargo, no puedes crear una nueva definición de tarea usando CodeCommit, por lo que esta opción es incorrecta.

vía - [https://docs.aws.amazon.com/AmazonECS/latest/developerguide/deployment-type-bluegreen.html](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/deployment-type-bluegreen.html)

Crear un CodePipeline que invoque una etapa de CodeBuild. La etapa de CodeBuild debe obtener credenciales de ECR usando los CLI helpers, construir la imagen y luego subirla a ECR. Crear una regla de CloudWatch Event que reaccione a los pushes a ECR e invoque CodeDeploy, cuyo objetivo debe ser el clúster ECS - CloudWatch Event Rule no soporta CodeDeploy como objetivo, por lo tanto CodeDeploy debe ser invocado desde tu CodePipeline.

Crear un CodePipeline que invoque una etapa de CodeBuild. La etapa de CodeBuild debe obtener credenciales de ECR usando las variables de entorno AWS_ACCESS_KEY_ID y AWS_SECRET_ACCESS_KEY pasadas mediante la configuración de CodeBuild, siendo los valores los de tu usuario. Al éxito de esa etapa de CodeBuild, crear una nueva definición de tarea automáticamente usando CodePipeline y aplicar esa definición de tarea al servicio ECS usando una acción de CloudFormation - Como se mencionó en la explicación anterior, las credenciales de ECR deben obtenerse usando roles IAM y CLI helpers en CodeBuild, no variables de entorno, especialmente no mediante access keys y secret keys.

References:

[https://docs.aws.amazon.com/codebuild/latest/userguide/sample-docker.html](https://docs.aws.amazon.com/codebuild/latest/userguide/sample-docker.html)

[https://docs.aws.amazon.com/AmazonECS/latest/developerguide/deployment-type-bluegreen.html](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/deployment-type-bluegreen.html)

[https://aws.amazon.com/codepipeline/faqs/](https://aws.amazon.com/codepipeline/faqs/)

[https://aws.amazon.com/about-aws/whats-new/2020/05/aws-cloudformation-now-supports-blue-green-deployments-for-amazon-ecs/](https://aws.amazon.com/about-aws/whats-new/2020/05/aws-cloudformation-now-supports-blue-green-deployments-for-amazon-ecs/)

**Temática**

Domain 1: SDLC Automation

#### Pregunta 4:

El equipo DevOps de una empresa de redes sociales ha creado un pipeline de CodePipeline y el paso final es usar CodeDeploy para actualizar una función AWS Lambda. Como líder de ingeniería DevOps en la empresa, has decidido que en cada despliegue, la nueva función Lambda debe mantener una pequeña cantidad de tráfico durante 10 minutos y luego cambiar todo el tráfico a la nueva función. También se ha decidido que se debe implementar seguridad para hacer rollback automático si la función Lambda experimenta demasiados fallos.

¿Cuáles de las siguientes recomendaciones proporcionarías para abordar el caso de uso dado? (Selecciona dos)

A. Crear una CloudWatch Alarm sobre las métricas de Lambda en CloudWatch y asociarla con el despliegue de CodeDeploy

B. Crear un CloudWatch Event para el monitoreo del despliegue de Lambda y asociarlo con el despliegue de CodeDeploy

C. Elegir una configuración de despliegue de LambdaCanary10Percent10Minutes

D. Elegir una configuración de despliegue de LambdaAllAtOnce

E. Elegir una configuración de despliegue de LambdaLinear10PercentEvery10Minutes

**La respuesta:**

**A**

**C**

Explicación general

Correct options:

Crear una CloudWatch Alarm sobre las métricas de Lambda en CloudWatch y asociarla con el despliegue de CodeDeploy

Puedes monitorear y reaccionar automáticamente a cambios en tus despliegues de AWS CodeDeploy usando alarmas de Amazon CloudWatch. Usando CloudWatch con CodeDeploy, puedes monitorear métricas para instancias Amazon EC2 o grupos Auto Scaling gestionados por CodeDeploy y luego invocar una acción si la métrica que estás rastreando cruza cierto umbral durante un periodo definido. Puedes monitorear métricas como la utilización de CPU de las instancias. Si la alarma se activa, CloudWatch inicia acciones como enviar una notificación a Amazon Simple Notification Service, detener un despliegue de CodeDeploy o cambiar el estado de una instancia (por ejemplo, reiniciar, terminar, recuperar). También puedes hacer rollback automático de un despliegue cuando este falla o cuando una alarma de CloudWatch se activa.

Para el caso dado, el despliegue de CodeDeploy debe asociarse con una CloudWatch Alarm para rollbacks automáticos.

vía - [https://docs.aws.amazon.com/codedeploy/latest/userguide/monitoring-create-alarms.html](https://docs.aws.amazon.com/codedeploy/latest/userguide/monitoring-create-alarms.html)

Configurar opciones avanzadas para un grupo de despliegue:  vía - [https://docs.aws.amazon.com/codedeploy/latest/userguide/deployment-groups-configure-advanced-options.html](https://docs.aws.amazon.com/codedeploy/latest/userguide/deployment-groups-configure-advanced-options.html)

Elegir una configuración de despliegue de LambdaCanary10Percent10Minutes

Una configuración de despliegue es un conjunto de reglas y condiciones de éxito y fallo que usa CodeDeploy durante un despliegue. Cuando despliegas en una plataforma de cómputo AWS Lambda, la configuración de despliegue especifica la forma en que el tráfico se cambia hacia las nuevas versiones de la función Lambda en tu aplicación.

vía - [https://docs.aws.amazon.com/codedeploy/latest/userguide/deployment-configurations.html](https://docs.aws.amazon.com/codedeploy/latest/userguide/deployment-configurations.html)

Para despliegues canary, el tráfico se cambia en dos incrementos. Puedes elegir entre opciones canary predefinidas que especifican el porcentaje de tráfico enviado a la versión actualizada de tu función Lambda en el primer incremento y el intervalo, en minutos, antes de que el resto del tráfico se cambie en el segundo incremento.

Un despliegue canary de LambdaCanary10Percent10Minutes significa que el tráfico es 10% hacia la nueva función durante 10 minutos, y luego todo el tráfico se cambia a la nueva versión después de que el tiempo ha transcurrido.

Incorrect options:

Elegir una configuración de despliegue de LambdaAllAtOnce - Un despliegue all at once significa que todo el tráfico se cambia a la nueva función inmediatamente y esta opción no cumple con los requisitos dados.

Elegir una configuración de despliegue de LambdaLinear10PercentEvery10Minutes - En despliegues lineales, el tráfico se cambia en incrementos iguales con el mismo intervalo de tiempo entre cada incremento. Por ejemplo, un despliegue lineal de LambdaLinear10PercentEvery10Minutes movería 10% del tráfico cada cierto tiempo hasta completar el 100%.

Crear un CloudWatch Event para el monitoreo del despliegue de Lambda y asociarlo con el despliegue de CodeDeploy - El despliegue de CodeDeploy debe asociarse con una CloudWatch Alarm y no con CloudWatch Event para que el rollback automático funcione.

References:

[https://docs.aws.amazon.com/codedeploy/latest/userguide/monitoring-create-alarms.html](https://docs.aws.amazon.com/codedeploy/latest/userguide/monitoring-create-alarms.html)

[https://docs.aws.amazon.com/codedeploy/latest/userguide/deployment-groups-configure-advanced-options.html](https://docs.aws.amazon.com/codedeploy/latest/userguide/deployment-groups-configure-advanced-options.html)

[https://docs.aws.amazon.com/codedeploy/latest/userguide/deployment-configurations.html](https://docs.aws.amazon.com/codedeploy/latest/userguide/deployment-configurations.html)

**Temática**

Domain 2: Configuration Management and IaC

#### Pregunta 5:

Una empresa de inteligencia de datos y analítica permite a los editores medir, analizar y mejorar el impacto de la publicidad a través de su gama de entregables en línea. El equipo DevOps de la empresa quiere usar CodePipeline para desplegar código desde CodeCommit con CodeDeploy. La empresa te ha contratado como AWS Certified DevOps Engineer Professional para construir una solución para este requerimiento.

¿Cómo configurarías las instancias EC2 para facilitar el despliegue?

A. Crear una instancia EC2 con un rol IAM que otorgue acceso al bucket S3 desde donde CodeDeploy está desplegando. Asegurar que la instancia EC2 también tenga el agente de CodeDeploy instalado. Etiquetar la instancia para que forme parte de un grupo de despliegue

B. Crear una instancia EC2 con credenciales de usuario IAM que otorguen acceso al repositorio CodeCommit desde donde CodeDeploy está desplegando. Asegurar que la instancia EC2 también tenga el agente de CodeDeploy instalado. Etiquetar la instancia para que forme parte de un grupo de despliegue

C. Crear una instancia EC2 con un rol IAM que otorgue acceso al repositorio CodeCommit desde donde CodeDeploy está desplegando. CodeDeploy instalará el agente en la instancia EC2

D. Crear una instancia EC2 con credenciales de usuario IAM que otorguen acceso al bucket S3 desde donde CodeDeploy está desplegando. Asegurar que la instancia EC2 también tenga el agente de CodeDeploy instalado. Etiquetar la instancia para que forme parte de un grupo de despliegue

**La respuesta:**

**A**

Explicación general

Correct option:

Crear una instancia EC2 con un rol IAM que otorgue acceso al bucket S3 desde donde CodeDeploy está desplegando. Asegurar que la instancia EC2 también tenga el agente de CodeDeploy instalado. Etiquetar la instancia para que forme parte de un grupo de despliegue

AWS CodeDeploy es un servicio que automatiza despliegues de código a cualquier instancia, incluyendo instancias Amazon EC2 e instancias on-premises. AWS CodeDeploy facilita liberar nuevas funcionalidades rápidamente, ayuda a evitar tiempo de inactividad durante despliegues y maneja la complejidad de actualizar aplicaciones.

CodeDeploy Concepts:

vía - [https://aws.amazon.com/codedeploy/faqs/](https://aws.amazon.com/codedeploy/faqs/)

El agente de CodeDeploy es un paquete de software que, cuando se instala y configura en una instancia, permite que esa instancia sea utilizada en despliegues de CodeDeploy. Un archivo de configuración se coloca en la instancia cuando se instala el agente. Este archivo se usa para especificar cómo funciona el agente. Este archivo de configuración especifica rutas de directorio y otros ajustes para que AWS CodeDeploy los use al interactuar con la instancia.

Para el caso dado, puedes hacer que CodePipeline encadene CodeCommit y CodeDeploy y tener el código fuente disponible como un archivo zip en un bucket S3 para ser usado como artefacto de CodePipeline. La instancia EC2 debe tener un rol IAM, no un usuario IAM, para obtener ese archivo desde S3. Finalmente, la instancia EC2 debe estar correctamente etiquetada para formar parte del grupo de despliegue adecuado y tener instalado el agente de CodeDeploy.

Incorrect options:

Crear una instancia EC2 con credenciales de usuario IAM que otorguen acceso al bucket S3 desde donde CodeDeploy está desplegando. Asegurar que la instancia EC2 también tenga el agente de CodeDeploy instalado. Etiquetar la instancia para que forme parte de un grupo de despliegue - Es una mejor práctica evitar usar credenciales de usuario IAM para dar acceso a la instancia EC2 al bucket S3 desde donde CodeDeploy está desplegando. Debes usar un rol IAM para facilitar este acceso a la instancia EC2.

Crear una instancia EC2 con un rol IAM que otorgue acceso al repositorio CodeCommit desde donde CodeDeploy está desplegando. CodeDeploy instalará el agente en la instancia EC2 - CodeDeploy no puede instalar automáticamente el agente en la instancia EC2. Debes asegurarte de que la instancia EC2 tenga instalado el agente de CodeDeploy. También debes etiquetar la instancia para que forme parte de un grupo de despliegue.

Crear una instancia EC2 con credenciales de usuario IAM que otorguen acceso al repositorio CodeCommit desde donde CodeDeploy está desplegando. Asegurar que la instancia EC2 también tenga el agente de CodeDeploy instalado. Etiquetar la instancia para que forme parte de un grupo de despliegue - Es una mejor práctica evitar usar credenciales de usuario IAM para dar acceso a la instancia EC2 al bucket S3 desde donde CodeDeploy está desplegando. Debes usar un rol IAM para facilitar este acceso a la instancia EC2.

References:

[https://docs.aws.amazon.com/codedeploy/latest/userguide/primary-components.html](https://docs.aws.amazon.com/codedeploy/latest/userguide/primary-components.html)

[https://docs.aws.amazon.com/codedeploy/latest/userguide/codedeploy-agent.html](https://docs.aws.amazon.com/codedeploy/latest/userguide/codedeploy-agent.html)

[https://docs.aws.amazon.com/codedeploy/latest/userguide/instances-ec2-configure.html](https://docs.aws.amazon.com/codedeploy/latest/userguide/instances-ec2-configure.html)

**Temática**

Domain 1: SDLC Automation

#### Pregunta 6:

El equipo de ingeniería en una empresa minorista multinacional está desplegando su aplicación web principal en un Auto Scaling Group (ASG) usando CodeDeploy. El equipo ha elegido una estrategia de actualización gradual (rolling update) de modo que las instancias se actualicen en pequeños lotes dentro del ASG. Al final del despliegue, el ASG tiene cinco instancias en ejecución. Parece que tres instancias están ejecutando la nueva versión de la aplicación, mientras que las otras dos están ejecutando la versión anterior. CodeDeploy está reportando un despliegue exitoso.

Como Ingeniero DevOps, ¿cuál es la razón más probable que atribuirías a este problema?

A. Una alarma de CloudWatch se ha activado durante el despliegue

B. La configuración de lanzamiento del grupo de auto scaling no ha sido actualizada

C. Se crearon dos nuevas instancias durante el despliegue debido a un evento de escalado hacia afuera (scale out) del Auto Scaling

D. Dos instancias tienen un problema de permisos IAM y no pueden descargar la nueva revisión de código desde S3

**La respuesta:**

**C**

Explicación general

Correct option:

Se crearon dos nuevas instancias durante el despliegue debido a un evento de escalado hacia afuera (scale out) del Auto Scaling

Si ocurre un evento de escalado hacia arriba (scale-up) de Amazon EC2 Auto Scaling mientras un despliegue está en curso, las nuevas instancias se actualizarán con la revisión de la aplicación que fue desplegada más recientemente, no con la revisión de la aplicación que se está desplegando actualmente. Si el despliegue tiene éxito, las instancias antiguas y las nuevas instancias creadas durante el escalado estarán ejecutando diferentes versiones de la aplicación.

vía - [https://docs.aws.amazon.com/codedeploy/latest/userguide/integrations-aws-auto-scaling.html#integrations-aws-auto-scaling-behaviors](https://docs.aws.amazon.com/codedeploy/latest/userguide/integrations-aws-auto-scaling.html#integrations-aws-auto-scaling-behaviors)

Para resolver este problema después de que ocurre, puedes redeplegar la nueva revisión de la aplicación a los grupos de despliegue afectados.

Para evitar este problema, AWS recomienda suspender los procesos de escalado hacia arriba de Amazon EC2 Auto Scaling mientras los despliegues están en curso (solo la configuración de despliegue CodeDeployDefault.OneAtATime soporta esta funcionalidad). Puedes hacer esto mediante una configuración en el script common_functions.sh que se usa para balanceo de carga con CodeDeploy. Si HANDLE_PROCS=true, los siguientes eventos de Auto Scaling se suspenden automáticamente durante el proceso de despliegue:

AZRebalance

AlarmNotification

ScheduledActions

ReplaceUnhealthy

Incorrect options:

Dos instancias tienen un problema de permisos IAM y no pueden descargar la nueva revisión de código desde S3 - Un problema de permisos IAM causaría que el estado general del despliegue fuera fallido, pero CodeDeploy reporta el estado como exitoso. Esta opción es solo un distractor.

La configuración de lanzamiento del grupo de auto scaling no ha sido actualizada - La configuración de lanzamiento afectaría a todas las instancias de la misma manera y no solo a 2 instancias. Por lo tanto, esta opción es incorrecta.

Una alarma de CloudWatch se ha activado durante el despliegue - Esta es otra opción distractora. Una alarma de CloudWatch no afecta la versión de la aplicación desplegada en las instancias.

Reference:

[https://docs.aws.amazon.com/codedeploy/latest/userguide/integrations-aws-auto-scaling.html#integrations-aws-auto-scaling-behaviors](https://docs.aws.amazon.com/codedeploy/latest/userguide/integrations-aws-auto-scaling.html#integrations-aws-auto-scaling-behaviors)

Temática

Domain 5: Incident and Event Response

#### Pregunta 7:

El equipo DevOps en una empresa de servicios financieros está desplegando la aplicación principal en modo altamente disponible usando Elastic Beanstalk, el cual ha creado un ASG y un ALB. El equipo también ha especificado un archivo .ebextensions para crear una tabla DynamoDB asociada. Como Ingeniero DevOps en el equipo, deseas realizar una actualización de la aplicación pero necesitas asegurarte de que el nombre DNS no cambie y que no se creen nuevos recursos. La aplicación debe permanecer disponible durante la actualización.

¿Cuál de las siguientes opciones sugerirías para cumplir con los requisitos dados?

A. Usar un rolling update con 20% a la vez

B. Usar immutable

C. Usar un despliegue blue/green y hacer swap de CNAMEs

D. Usar in-place

**La respuesta:**

**A**

Explicación general

Correct option:

Usar un rolling update con 20% a la vez

AWS Elastic Beanstalk proporciona varias opciones sobre cómo se procesan los despliegues, incluyendo políticas de despliegue (All at once, Rolling, Rolling with additional batch, Immutable y Traffic splitting) y opciones que te permiten configurar el tamaño del lote y el comportamiento de los health checks durante los despliegues. Por defecto, tu entorno usa despliegues all-at-once. Si creaste el entorno con EB CLI y es un entorno escalable (no especificaste la opción --single), usa despliegues rolling.

vía - [https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/using-features.deploy-existing-version.html](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/using-features.deploy-existing-version.html)

Comparación de propiedades de métodos de despliegue:  vía - [https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/using-features.deploy-existing-version.html](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/using-features.deploy-existing-version.html)

Con despliegues rolling, Elastic Beanstalk divide las instancias EC2 del entorno en lotes (para este caso, usamos un lote del 20% de las instancias) y despliega la nueva versión de la aplicación a un lote a la vez. Deja el resto de las instancias ejecutando la versión anterior de la aplicación. Durante un despliegue rolling, algunas instancias atienden solicitudes con la versión antigua, mientras que las instancias en los lotes completados atienden solicitudes con la nueva versión. Por lo tanto, para este caso, debemos usar un rolling update, que mantendrá el ASG, las instancias y permitirá que la aplicación continúe sirviendo tráfico.

vía - [https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/using-features.rolling-version-deploy.html](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/using-features.rolling-version-deploy.html)

Incorrect options:

Usar un despliegue blue/green y hacer swap de CNAMEs - En un despliegue blue/green, despliegas la nueva versión en un entorno separado y luego intercambias los CNAMEs de ambos entornos para redirigir el tráfico a la nueva versión instantáneamente. Un despliegue blue/green crearía un nuevo balanceador de carga y un nuevo ASG, por lo que no cumple con los requisitos del caso.

Usar immutable - Los despliegues immutable lanzan un conjunto completo de nuevas instancias ejecutando la nueva versión de la aplicación en un Auto Scaling group separado, junto a las instancias con la versión antigua. Por lo tanto, esta opción no cumple con los requisitos.

Usar in-place - Aunque no crea nuevos recursos, la aplicación quedaría indisponible ya que todas las instancias se actualizan al mismo tiempo.

**Temática**

Domain 2: Configuration Management and IaC

#### Pregunta 8:

Como Ingeniero DevOps en una empresa de redes sociales, has desplegado tu aplicación en un Auto Scaling Group (ASG) usando CloudFormation. Deseas actualizar el Auto Scaling Group para que todas las instancias referencien la nueva launch configuration creada, la cual actualiza el tipo de instancia. Tu ASG actualmente contiene 6 instancias y necesitas que al menos 4 instancias estén disponibles en todo momento.

¿Qué configuración deberías usar en la plantilla de CloudFormation?

A. AutoScalingRollingUpdate

B. AutoScalingReplacingUpdate

C. AutoScalingLaunchTemplateUpdate

D. AutoScalingLaunchConfigurationUpdate

**La respuesta:**

**A**

Explicación general

Correct option:

AutoScalingRollingUpdate

Para especificar cómo AWS CloudFormation maneja actualizaciones graduales (rolling updates) en un Auto Scaling group, se usa la política AutoScalingRollingUpdate. Las actualizaciones rolling te permiten especificar si CloudFormation actualiza las instancias en un Auto Scaling group en lotes o todas al mismo tiempo. AutoScalingRollingUpdate es perfecto para este caso de uso.

vía - [https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-attribute-updatepolicy.html](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-attribute-updatepolicy.html)

Incorrect options:

AutoScalingReplacingUpdate - Para especificar cómo CloudFormation maneja actualizaciones de reemplazo en un Auto Scaling group, se usa la política AutoScalingReplacingUpdate. Esta política permite reemplazar el Auto Scaling group completo o solo sus instancias. Esta opción crearía un nuevo ASG, por lo tanto no cumple con el requisito.

AutoScalingLaunchTemplateUpdate

AutoScalingLaunchConfigurationUpdate

AutoScalingLaunchTemplateUpdate y AutoScalingLaunchConfigurationUpdate no existen, por lo tanto ambas opciones son incorrectas.

Reference:

[https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-attribute-updatepolicy.html](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-attribute-updatepolicy.html)

Temática

Domain 3: Resilient Cloud Solutions

#### Pregunta 9:

Una empresa de tecnología de salud proporciona una solución Software as a Service (SaaS) a hospitales en todo Estados Unidos para usar el sistema propietario de la empresa para integrar su documentación clínica y flujos de trabajo de codificación. El equipo DevOps de la empresa quiere habilitar un pipeline de CI/CD que permita despliegues seguros a producción y la capacidad de trabajar en nuevas funcionalidades del roadmap del producto.

Como AWS Certified DevOps Engineer, ¿qué solución recomendarías para el caso de uso dado?

A. Crear un repositorio CodeCommit y configurar el pipeline de CI/CD para desplegar la rama master. Para cada nueva funcionalidad que se implemente, crear una nueva rama y crear pull requests para hacer merge hacia master. Establecer una política IAM en el grupo de desarrolladores para prevenir pushes directos a master

B. Crear un repositorio CodeCommit y configurar el pipeline de CI/CD para desplegar la rama master. Para cada nueva funcionalidad que se implemente, crear una nueva rama y crear pull requests para hacer merge hacia master. Establecer una política de acceso al repositorio para prevenir pushes directos a master

C. Crear el repositorio principal en CodeCommit y configurar el pipeline de CI/CD para desplegar la rama master. Para cada nueva funcionalidad que se implemente, crear un nuevo repositorio CodeCommit y crear pull requests para hacer merge hacia el repositorio principal. Establecer una política IAM en el grupo de desarrolladores para prevenir pushes directos al repositorio principal

D. Crear un repositorio CodeCommit y crear una rama para cada funcionalidad. Crear un pipeline de CI/CD para cada rama, y el último paso del pipeline debe ser hacer merge hacia master. Establecer una política IAM en el grupo de desarrolladores para prevenir pushes directos a master

La respuesta:

A

Explicación general

Correct option:

Crear un repositorio CodeCommit y configurar el pipeline de CI/CD para desplegar la rama master. Para cada nueva funcionalidad que se implemente, crear una nueva rama y crear pull requests para hacer merge hacia master. Establecer una política IAM en el grupo de desarrolladores para prevenir pushes directos a master

CodeCommit es un servicio de control de código fuente seguro, altamente escalable y administrado que facilita la colaboración en el código. Un pipeline de CI/CD te ayuda a automatizar los pasos en el proceso de entrega de software, como iniciar builds automáticos y luego desplegar a instancias Amazon EC2. Puedes usar AWS CodePipeline, un servicio que construye, prueba y despliega tu código cada vez que hay un cambio en el código, basado en los modelos de liberación que defines para orquestar cada paso del proceso.

vía - [https://aws.amazon.com/getting-started/projects/set-up-ci-cd-pipeline/](https://aws.amazon.com/getting-started/projects/set-up-ci-cd-pipeline/)

Es una mejor práctica trabajar con ramas en tu repositorio git para crear funcionalidades, ya que es el uso esperado de las ramas. No debes crear repositorios separados para cada funcionalidad. Para proteger la rama master necesitas establecer una política Deny en el grupo IAM al que pertenecen los desarrolladores.

vía - [https://docs.aws.amazon.com/codecommit/latest/userguide/how-to-conditional-branch.html](https://docs.aws.amazon.com/codecommit/latest/userguide/how-to-conditional-branch.html)

Incorrect options:

Crear el repositorio principal en CodeCommit y configurar el pipeline de CI/CD para desplegar la rama master. Para cada nueva funcionalidad que se implemente, crear un nuevo repositorio CodeCommit y crear pull requests para hacer merge hacia el repositorio principal. Establecer una política IAM en el grupo de desarrolladores para prevenir pushes directos al repositorio principal - No debes crear un repositorio separado para cada funcionalidad, por lo que esta opción es incorrecta.

Crear un repositorio CodeCommit y configurar el pipeline de CI/CD para desplegar la rama master. Para cada nueva funcionalidad que se implemente, crear una nueva rama y crear pull requests para hacer merge hacia master. Establecer una política de acceso al repositorio para prevenir pushes directos a master - Esta opción es un distractor ya que no existe tal cosa como una política de acceso al repositorio.

Crear un repositorio CodeCommit y crear una rama para cada funcionalidad. Crear un pipeline de CI/CD para cada rama, y el último paso del pipeline debe ser hacer merge hacia master. Establecer una política IAM en el grupo de desarrolladores para prevenir pushes directos a master - Aunque puedes crear pipelines por rama, no puedes hacer merges automáticamente de múltiples pipelines hacia master como último paso de CI/CD de esa forma, por lo que esta opción es incorrecta.

References:

[https://docs.aws.amazon.com/codecommit/latest/userguide/how-to-conditional-branch.html](https://docs.aws.amazon.com/codecommit/latest/userguide/how-to-conditional-branch.html)

[https://aws.amazon.com/codecommit/faqs/](https://aws.amazon.com/codecommit/faqs/)

[https://aws.amazon.com/getting-started/projects/set-up-ci-cd-pipeline/](https://aws.amazon.com/getting-started/projects/set-up-ci-cd-pipeline/)

Temática

Domain 1: SDLC Automation

#### Pregunta 10:

Una empresa de soluciones de Internet de las Cosas (IoT) ha decidido publicar cada aplicación como un contenedor Docker y usar ECS clásico (en EC2) como sistema de orquestación de contenedores y ECR como registro Docker. Parte de implementar un pipeline de monitoreo es asegurar que todos los logs de la aplicación puedan almacenarse en CloudWatch Logs.

La empresa te ha contratado como AWS Certified DevOps Engineer Professional para proporcionar las instrucciones más simples posibles para lograr este objetivo. ¿Cuáles son estas instrucciones?

A. Crear definiciones de tareas ECS que incluyan el driver awslogs. Establecer un IAM task role en la definición de la tarea con los permisos necesarios para escribir en CloudWatch logs

B. Crear definiciones de tareas ECS para tus aplicaciones, con un mapeo del directorio /var/log hacia el sistema de archivos local de la instancia EC2. Instalar el CloudWatch Agent en la instancia EC2 usando user-data y monitorear el directorio /var/log/containers. Crear un rol de instancia EC2 con los permisos necesarios para escribir en CloudWatch logs

C. Crear definiciones de tareas ECS que incluyan el driver awslogs. Establecer un IAM instance role en la instancia EC2 con los permisos necesarios para escribir en CloudWatch logs

D. Crear definiciones de tareas ECS para tus aplicaciones, con un contenedor sidecar que contenga el CloudWatch Agent monitoreando el directorio /var/log/containers. Mapear el directorio /var/log de la aplicación al sistema de archivos del sidecar. Establecer un IAM task role en la definición de la tarea con los permisos necesarios para escribir en CloudWatch logs

**La respuesta:**

**C**

Explicación general

Correct option:

Crear definiciones de tareas ECS que incluyan el driver awslogs. Establecer un IAM instance role en la instancia EC2 con los permisos necesarios para escribir en CloudWatch logs

Aquí pueden funcionar varias soluciones, pero se busca la más simple posible. Lo importante es recordar que las definiciones de tareas ECS pueden incluir el driver awslogs y escribir en CloudWatch Logs de forma nativa. Sin embargo, la instancia EC2 es la que realmente escribe en CloudWatch, por lo que debe tener un IAM Instance Role con los permisos adecuados para escribir en CloudWatch. Tus instancias de contenedores ECS también requieren permisos logs:CreateLogStream y logs:PutLogEvents en el rol IAM con el que lanzas las instancias.

vía - [https://docs.aws.amazon.com/AmazonECS/latest/developerguide/using_awslogs.html](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/using_awslogs.html)

Incorrect options:

Crear definiciones de tareas ECS que incluyan el driver awslogs. Establecer un IAM task role en la definición de la tarea con los permisos necesarios para escribir en CloudWatch logs - Como se mencionó anteriormente, los permisos deben otorgarse al IAM Instance Role y no al IAM task role para escribir en CloudWatch logs.

Crear definiciones de tareas ECS para tus aplicaciones, con un mapeo del directorio /var/log hacia el sistema de archivos local de la instancia EC2. Instalar el CloudWatch Agent en la instancia EC2 usando user-data y monitorear el directorio /var/log/containers. Crear un rol de instancia EC2 con los permisos necesarios para escribir en CloudWatch logs - Este es un enfoque más complejo e indirecto para enviar logs de contenedores a CloudWatch Logs, por lo que no es la mejor opción para este caso.

Crear definiciones de tareas ECS para tus aplicaciones, con un contenedor sidecar que contenga el CloudWatch Agent monitoreando el directorio /var/log/containers. Mapear el directorio /var/log de la aplicación al sistema de archivos del sidecar. Establecer un IAM task role en la definición de la tarea con los permisos necesarios para escribir en CloudWatch logs - El uso de sidecars es un patrón válido, pero en este caso es una solución más compleja de lo necesario. Además, los permisos deben asignarse al IAM Instance Role, no al task role.

References:

[https://docs.aws.amazon.com/AmazonECS/latest/developerguide/using_awslogs.html](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/using_awslogs.html)

[https://docs.aws.amazon.com/AmazonECS/latest/developerguide/using_cloudwatch_logs.html](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/using_cloudwatch_logs.html)

Temática

Domain 4: Monitoring and Logging

#### Pregunta 11:

Una empresa de diseño gráfico está experimentando con una nueva funcionalidad para una API y el objetivo es pasar el campo "color" en el payload JSON para habilitar esta funcionalidad. La nueva función Lambda debe tratar "color": "none" como una solicitud de un cliente antiguo. La empresa quiere manejar solo una función Lambda en el backend mientras soporta tanto clientes antiguos como nuevos. La API de API Gateway está actualmente desplegada en el stage v1. Los clientes incluyen aplicaciones Android que pueden tardar tiempo en actualizarse. Los requisitos técnicos indican que la solución debe soportar clientes antiguos durante años.

Como AWS Certified DevOps Engineer Professional, ¿cuál de las siguientes opciones recomendarías como la mejor para este caso?

A. Habilitar el caching de API Gateway v1 y eliminar la función Lambda v1. Desplegar un API Gateway v2 respaldado por una nueva función Lambda v2. Agregar una variable de stage en API Gateway para habilitar el valor por defecto "color": "none"

B. Crear una nueva versión de la función Lambda y liberarla. Usar documentos de mapeo de API Gateway para agregar un valor por defecto "color": "none" al JSON de la solicitud que se pasa en el stage de API Gateway

C. Crear una nueva versión de la función Lambda y liberarla como una función separada v2. Crear un nuevo stage de API Gateway y desplegarlo como v2. El stage v1 de API Gateway apunta a la función Lambda v1 y el stage v2 apunta a la función Lambda v2. Implementar redirección desde Lambda v1 hacia Lambda v2 cuando la solicitud no tenga el campo "color"

D. Crear una nueva versión de la función Lambda y liberarla. Crear un nuevo stage de API Gateway y desplegarlo como v2. Ambos usan la misma función Lambda como backend para los stages v1 y v2. Agregar un mapeo estático en la ruta v1 para agregar "color": "none" en las solicitudes

La respuesta:

D

Explicación general

Correct option:

Crear una nueva versión de la función Lambda y liberarla. Crear un nuevo stage de API Gateway y desplegarlo como v2. Ambos usan la misma función Lambda como backend para los stages v1 y v2. Agregar un mapeo estático en la ruta v1 para agregar "color": "none" en las solicitudes

Amazon API Gateway es un servicio de AWS para crear, publicar, mantener, monitorear y asegurar APIs REST, HTTP y WebSocket a cualquier escala. API Gateway maneja tareas como gestión de tráfico, autorización y control de acceso, monitoreo y versionado de APIs. Actúa como la puerta de entrada para que las aplicaciones accedan a datos, lógica de negocio o funcionalidades desde servicios backend como EC2, AWS Lambda u otros servicios web.

Para este caso, se deben usar mapping templates de API Gateway. API Gateway permite usar plantillas de mapeo para transformar el payload desde la solicitud del método hacia la solicitud de integración correspondiente, así como la respuesta. En este escenario, se debe desplegar un API v2 junto al API v1 usando la misma función Lambda. Los clientes antiguos consumirán v1, donde el mapping template agregará el campo "color": "none". Los clientes nuevos consumirán v2 enviando el campo explícitamente.

vía - [https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-override-request-response-parameters.html](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-override-request-response-parameters.html)

Incorrect options:

Crear una nueva versión de la función Lambda y liberarla como una función separada v2. Crear un nuevo stage de API Gateway y desplegarlo como v2. El stage v1 apunta a Lambda v1 y el stage v2 a Lambda v2. Implementar redirección desde Lambda v1 hacia Lambda v2 cuando la solicitud no tenga el campo "color" - Esto implicaría mantener dos funciones Lambda, lo cual va en contra del requisito de tener una sola función.

Crear una nueva versión de la función Lambda y liberarla. Usar documentos de mapeo de API Gateway para agregar un valor por defecto "color": "none" al JSON de la solicitud - Los mapping templates no soportan establecer valores por defecto dinámicos, solo valores estáticos en el contexto correcto.

Habilitar el caching de API Gateway v1 y eliminar la función Lambda v1. Desplegar un API Gateway v2 respaldado por una nueva función Lambda v2. Agregar una variable de stage en API Gateway para habilitar el valor por defecto "color": "none" - El caching no resuelve este caso y es un distractor.

References:

[https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-override-request-response-parameters.html](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-override-request-response-parameters.html)

[https://aws.amazon.com/api-gateway/](https://aws.amazon.com/api-gateway/)

Temática

Domain 2: Configuration Management and IaC

#### Pregunta 12:

Una empresa minorista está almacenando la información de los usuarios junto con su historial de compras en una tabla DynamoDB y también ha habilitado DynamoDB Streams. Se han implementado tres casos de uso para esta tabla: una función Lambda lee el stream para enviar correos electrónicos por nuevas suscripciones de usuarios, otra función Lambda envía un correo después de que un usuario realiza su primera compra y finalmente una tercera función Lambda otorga descuentos a los usuarios cada 10 compras. Cuando hay un alto volumen de datos en la tabla DynamoDB, las funciones Lambda están experimentando problemas de throttling. Planeas agregar futuras funciones Lambda para leer de ese stream, por lo que necesitas actualizar la solución existente.

Como Ingeniero DevOps, ¿cuál de las siguientes opciones recomendarías?

A. Crear una nueva función Lambda que lea del stream y pase el payload a SNS. Hacer que las otras tres y futuras funciones Lambda lean directamente del tópico SNS

B. Incrementar los RCUs en tu tabla DynamoDB para evitar problemas de throttling

C. Incrementar la memoria de la función Lambda para que tengan mayor asignación de vCPU y procesen los datos más rápido haciendo menos solicitudes a DynamoDB

D. Crear un clúster DynamoDB DAX para cachear las lecturas

**La respuesta:**

**A**

Explicación general

Correct option:

Crear una nueva función Lambda que lea del stream y pase el payload a SNS. Hacer que las otras tres y futuras funciones Lambda lean directamente del tópico SNS

DynamoDB Streams captura una secuencia ordenada en el tiempo de modificaciones a nivel de ítem en una tabla DynamoDB y almacena esta información en un log por hasta 24 horas. Las aplicaciones pueden acceder a este log y ver los ítems como estaban antes y después de ser modificados, casi en tiempo real. Un stream de DynamoDB es un flujo ordenado de información sobre cambios en los ítems de una tabla.

vía - [https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Streams.html](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Streams.html)

DynamoDB está integrado con AWS Lambda para que puedas crear triggers que reaccionen automáticamente a eventos en DynamoDB Streams. Cuando habilitas un stream en una tabla, puedes asociar el ARN del stream con una función Lambda. AWS Lambda hace polling del stream e invoca tu función cuando detecta nuevos registros.

No más de dos procesos deberían leer del mismo shard del stream al mismo tiempo. Tener más de dos lectores por shard puede causar throttling. Por lo tanto, necesitas usar un patrón de fan-out, siendo SNS una opción adecuada para distribuir los eventos a múltiples consumidores.

Incorrect options:

Incrementar los RCUs en tu tabla DynamoDB para evitar problemas de throttling - DynamoDB Streams funciona de forma asíncrona, por lo que los RCUs no afectan el problema de throttling en el stream.

Crear un clúster DynamoDB DAX para cachear las lecturas - DAX mejora lecturas sobre la tabla, no sobre el stream.

Incrementar la memoria de la función Lambda para que tengan mayor vCPU y procesen más rápido - El problema no es de procesamiento, sino de demasiados consumidores leyendo del mismo shard.

References:

[https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Streams.html](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Streams.html)

[https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Streams.Lambda.html](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Streams.Lambda.html)

Temática

Domain 5: Incident and Event Response

#### Pregunta 13:

Una startup con sede en Silicon Valley ejecuta una aplicación web de descubrimiento de noticias y usa CodeDeploy para desplegar la aplicación en un conjunto de 20 instancias EC2 detrás de un Application Load Balancer. El ALB está integrado con CodeDeploy. El equipo DevOps desea que el despliegue sea gradual y que se haga rollback automáticamente en caso de una utilización máxima de CPU inusualmente alta en las instancias EC2 mientras se está sirviendo tráfico.

¿Cómo puedes implementar esto?

A. En el hook ValidateService en appspec.yml, medir la utilización de CPU durante 5 minutos. Configurar CodeDeploy para hacer rollback en fallas de despliegue. Si el hook falla, CodeDeploy hará rollback

B. Crear una métrica de CloudWatch para la utilización máxima de CPU de tus instancias EC2. Crear un despliegue en CodeDeploy con rollback habilitado, integrado con la métrica de CloudWatch

C. Crear una métrica de CloudWatch para la utilización máxima de CPU de tus instancias EC2. Crear una alarma de CloudWatch sobre esa métrica. Crear un despliegue en CodeDeploy con rollback habilitado, integrado con la alarma de CloudWatch

D. Crear una métrica de CloudWatch para la utilización máxima de CPU de tu Application Load Balancer. Crear un despliegue en CodeDeploy con rollback habilitado, integrado con la métrica de CloudWatch

**La respuesta:**

**C**

Explicación general

Correct option:

Crear una métrica de CloudWatch para la utilización máxima de CPU de tus instancias EC2. Crear una alarma de CloudWatch sobre esa métrica. Crear un despliegue en CodeDeploy con rollback habilitado, integrado con la alarma de CloudWatch

Puedes monitorear y reaccionar automáticamente a cambios en tus despliegues de AWS CodeDeploy usando alarmas de Amazon CloudWatch. Con CloudWatch, puedes monitorear métricas de instancias EC2 o grupos Auto Scaling gestionados por CodeDeploy y ejecutar acciones si una métrica supera un umbral durante un periodo definido. Por ejemplo, puedes monitorear la utilización de CPU. Si la alarma se activa, CloudWatch puede detener el despliegue, enviar notificaciones o cambiar el estado de instancias. También puedes configurar rollback automático cuando una alarma se activa.

CodeDeploy redeplegará la última versión estable conocida cuando ocurra el rollback.

vía - [https://docs.aws.amazon.com/codedeploy/latest/userguide/monitoring-create-alarms.html](https://docs.aws.amazon.com/codedeploy/latest/userguide/monitoring-create-alarms.html)

Configurar opciones avanzadas para un grupo de despliegue:  vía - [https://docs.aws.amazon.com/codedeploy/latest/userguide/deployment-groups-configure-advanced-options.html](https://docs.aws.amazon.com/codedeploy/latest/userguide/deployment-groups-configure-advanced-options.html)

Incorrect options:

En el hook ValidateService en appspec.yml, medir la utilización de CPU durante 5 minutos. Configurar CodeDeploy para rollback en fallas - Cuando se usa ValidateService con ALB, el tráfico aún no está fluyendo completamente, por lo que no observarías una carga real de CPU.

Crear una métrica de CloudWatch para la utilización máxima de CPU de tus instancias EC2. Crear un despliegue en CodeDeploy con rollback habilitado, integrado con la métrica de CloudWatch - CodeDeploy solo soporta rollback automático mediante alarmas, no métricas directamente.

Crear una métrica de CloudWatch para la utilización máxima de CPU del Application Load Balancer. Crear un despliegue en CodeDeploy con rollback habilitado, integrado con la métrica de CloudWatch - Debes monitorear CPU de EC2, no del ALB, y nuevamente, se requieren alarmas, no métricas.

References:

[https://docs.aws.amazon.com/codedeploy/latest/userguide/monitoring-create-alarms.html](https://docs.aws.amazon.com/codedeploy/latest/userguide/monitoring-create-alarms.html)

[https://docs.aws.amazon.com/codedeploy/latest/userguide/deployment-groups-configure-advanced-options.html](https://docs.aws.amazon.com/codedeploy/latest/userguide/deployment-groups-configure-advanced-options.html)

Temática

Domain 1: SDLC Automation

#### Pregunta 14:

Como Ingeniero DevOps en una empresa de analítica de datos, estás desplegando una aplicación web en EC2 usando un Auto Scaling Group. Los datos están almacenados en RDS MySQL Multi-AZ, y existe una capa de caché usando ElastiCache. La configuración de la aplicación toma tiempo y actualmente necesita más de 20 minutos para iniciar. 10 de esos minutos se usan en instalar y configurar la aplicación web, y otros 10 minutos en calentar la caché local de la instancia.

¿Qué se puede hacer para mejorar el rendimiento de este setup?

A. Crear una AMI que contenga la aplicación web. Configurar la parte dinámica en tiempo de ejecución usando un script de User Data de EC2

B. Migrar de ElastiCache a DynamoDB. Crear una AMI que contenga la aplicación web. Configurar la parte dinámica en tiempo de ejecución usando un script de User Data de EC2

C. Crear una AMI que contenga la aplicación web. Configurar la parte dinámica en tiempo de ejecución usando un script de User Data de EC2. Usar AWS Lambda para configurar la caché local de la instancia al arranque

D. Crear una AMI que contenga la aplicación web y una copia de la caché local de datos. Configurar la parte dinámica en tiempo de ejecución usando un script de User Data de EC2

**La respuesta:**

**A**

Explicación general

Correct option:

Crear una AMI que contenga la aplicación web. Configurar la parte dinámica en tiempo de ejecución usando un script de User Data de EC2

Una golden AMI es una AMI estandarizada con configuración, parches de seguridad consistentes y endurecimiento. También puede contener agentes aprobados para logging, seguridad y monitoreo. En este caso, puedes incluir la aplicación web dentro de la AMI para evitar el tiempo de instalación y configuración en cada arranque.

Una vez que creas una golden AMI para un producto (por ejemplo, una AMI base del sistema operativo o una AMI específica de aplicación), puedes validarla y aprobarla para despliegue en distintos entornos.

About the golden AMI pipeline:  vía - [https://aws.amazon.com/blogs/awsmarketplace/announcing-the-golden-ami-pipeline/](https://aws.amazon.com/blogs/awsmarketplace/announcing-the-golden-ami-pipeline/)

Incorrect options:

Crear una AMI que contenga la aplicación web y una copia de la caché local de datos. Configurar la parte dinámica en tiempo de ejecución usando un script de User Data de EC2 - La caché local es dinámica y cambia con el tiempo, por lo que no es viable incluirla en la AMI.

Migrar de ElastiCache a DynamoDB. Crear una AMI que contenga la aplicación web. Configurar la parte dinámica en tiempo de ejecución usando un script de User Data de EC2 - DynamoDB no es un reemplazo directo de ElastiCache para este caso, ya que no es una solución de caché equivalente.

Crear una AMI que contenga la aplicación web. Configurar la parte dinámica en tiempo de ejecución usando un script de User Data de EC2. Usar AWS Lambda para configurar la caché local de la instancia al arranque - No es posible usar Lambda para configurar la caché local de una instancia en el arranque de esa forma, y la caché sigue siendo dinámica.

Reference:

[https://aws.amazon.com/blogs/awsmarketplace/announcing-the-golden-ami-pipeline/](https://aws.amazon.com/blogs/awsmarketplace/announcing-the-golden-ami-pipeline/)

Temática

Domain 3: Resilient Cloud Solutions

#### Pregunta 15:

El equipo de tecnología en un banco líder está utilizando software con un tipo de licencia que se factura basado en el número de sockets de CPU que se utilizan. El equipo desea asegurarse de que están usando el modo de lanzamiento de EC2 más apropiado y crear un dashboard de cumplimiento que resalte cualquier violación de esta decisión. La empresa te ha contratado como AWS Certified DevOps Engineer Professional para construir una solución para este requerimiento.

¿Cuál de las siguientes soluciones recomendarías como la mejor opción?

A. Lanzar las instancias EC2 en Dedicated Hosts y crear una etiqueta para la aplicación. Implementar una regla personalizada de AWS Config respaldada por una función Lambda que verifique la etiqueta de la aplicación y asegure que la instancia se lanza en el modo correcto

B. Lanzar las instancias EC2 en Reserved Instances y crear una etiqueta para la aplicación. Implementar una regla de AWS Service Catalog respaldada por una función Lambda para rastrear que la aplicación siempre se lanza en una instancia EC2 con el modo correcto

C. Lanzar las instancias EC2 en Reserved Instances y crear una etiqueta para la aplicación. Implementar una regla personalizada de AWS Config respaldada por una función Lambda que verifique la etiqueta de la aplicación y asegure que la instancia se lanza en el modo correcto

D. Lanzar las instancias EC2 en Dedicated Hosts y crear una etiqueta para la aplicación. Implementar una regla de AWS Service Catalog respaldada por una función Lambda para rastrear que la aplicación siempre se lanza en una instancia EC2 con el modo correcto

La respuesta:

A

Explicación general

Correct option:

Lanzar las instancias EC2 en Dedicated Hosts y crear una etiqueta para la aplicación. Implementar una regla personalizada de AWS Config respaldada por una función Lambda que verifique la etiqueta de la aplicación y asegure que la instancia se lanza en el modo correcto

Un Amazon EC2 Dedicated Host es un servidor físico con capacidad de instancias EC2 completamente dedicada para tu uso. Cuando utilizas tus propias licencias en Dedicated Hosts, puedes gestionar correctamente el licenciamiento basado en sockets de CPU.

vía - [https://aws.amazon.com/ec2/dedicated-hosts/faqs/](https://aws.amazon.com/ec2/dedicated-hosts/faqs/)

Para acceder a los sockets de CPU para efectos de licenciamiento, necesitas usar Dedicated Hosts. Las Reserved Instances sirven principalmente para optimización de costos, no para control de licencias por socket.

AWS Config proporciona visibilidad detallada de los recursos de tu cuenta, incluyendo su configuración, relaciones y cambios a lo largo del tiempo. Una regla de AWS Config define configuraciones deseadas y puede marcar recursos como no conformes si no cumplen con dichas reglas. Puedes respaldar estas reglas con Lambda para lógica personalizada y generar dashboards de cumplimiento.

vía - [https://docs.aws.amazon.com/config/latest/developerguide/how-does-config-work.html](https://docs.aws.amazon.com/config/latest/developerguide/how-does-config-work.html)

Incorrect options:

Lanzar las instancias EC2 en Dedicated Hosts y usar AWS Service Catalog - Service Catalog no es la herramienta adecuada para monitoreo de cumplimiento continuo.

Lanzar las instancias EC2 en Reserved Instances - No permite controlar licenciamiento por sockets de CPU.

Combinar Reserved Instances con Service Catalog - Incorrecto por ambas razones anteriores.

References:

[https://aws.amazon.com/ec2/dedicated-hosts/faqs/](https://aws.amazon.com/ec2/dedicated-hosts/faqs/)

[https://docs.aws.amazon.com/config/latest/developerguide/how-does-config-work.html](https://docs.aws.amazon.com/config/latest/developerguide/how-does-config-work.html)

[https://docs.aws.amazon.com/config/latest/developerguide/config-concepts.html](https://docs.aws.amazon.com/config/latest/developerguide/config-concepts.html)

Temática

Domain 6: Security and Compliance

#### Pregunta 16:

El equipo DevOps en una firma de auditoría ha desplegado su aplicación principal en Elastic Beanstalk que procesa facturas subidas por clientes en formato CSV. Las facturas pueden ser bastante grandes, con hasta 10MB y 1,000,000 de registros en total. El procesamiento es intensivo en CPU, lo que está ralentizando la aplicación. A los clientes se les envía un correo electrónico cuando el procesamiento termina, mediante el uso de un cron job. La firma de auditoría te ha contratado como AWS Certified DevOps Engineer Professional para construir una solución para este requerimiento.

¿Qué recomiendas para la aplicación para asegurar un buen rendimiento y cubrir los requisitos de escalabilidad?

A. Crear un entorno Beanstalk separado que sea un entorno worker y procese las facturas a través de una cola SQS. Las facturas se suben a S3 y una referencia a ellas es enviada a SQS por el web tier. El worker tier procesa estos archivos. Un cron job definido usando el archivo cron.yml enviará los correos electrónicos

B. Crear un tier Beanstalk separado dentro del mismo entorno que sea una configuración worker y procese las facturas a través de una cola SQS. Las facturas se envían directamente a SQS después de ser comprimidas por el web tier. Los workers procesan estos archivos. Un cron job definido usando el archivo cron.yml en el web tier enviará los correos electrónicos

C. Crear un entorno Beanstalk separado que sea un entorno worker y procese las facturas a través de una cola SQS. Las facturas se suben a S3 y una referencia a ellas es enviada a SQS por el web tier. El worker tier procesa estos archivos. Un cron job definido usando el archivo cron.yml en el web tier enviará los correos electrónicos

D. Crear un tier Beanstalk separado dentro del mismo entorno que sea una configuración worker y procese las facturas a través de una cola SQS. Las facturas se envían directamente a SQS después de ser comprimidas por el web tier. Los workers procesan estos archivos. Un cron job definido usando el archivo cron.yml enviará los correos electrónicos

**La respuesta:**

**A**

Explicación general

Correct option:

Crear un entorno Beanstalk separado que sea un entorno worker y procese las facturas a través de una cola SQS. Las facturas se suben a S3 y una referencia a ellas es enviada a SQS por el web tier. El worker tier procesa estos archivos. Un cron job definido usando el archivo cron.yml enviará los correos electrónicos

Con Elastic Beanstalk, puedes desplegar y gestionar aplicaciones rápidamente en la nube de AWS sin tener que aprender sobre la infraestructura que las ejecuta. Simplemente subes tu aplicación, y Elastic Beanstalk maneja automáticamente detalles como aprovisionamiento de capacidad, balanceo de carga, escalado y monitoreo de la salud de la aplicación.

AWS Elastic Beanstalk te permite gestionar todos los recursos que ejecutan tu aplicación como entornos. Un entorno es una colección de recursos de AWS que ejecutan una versión de aplicación. Cuando lanzas un entorno Elastic Beanstalk, necesitas elegir un environment tier. Una aplicación que atiende solicitudes HTTP se ejecuta en un web server environment tier. Un entorno backend que obtiene tareas desde una cola Amazon Simple Queue Service (Amazon SQS) se ejecuta en un worker environment tier.

Elastic Beanstalk Concepts:  vía - [https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/concepts.html](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/concepts.html)

Cuando creas un entorno de web server, Beanstalk aprovisiona los recursos requeridos para ejecutar tu aplicación. Los recursos de AWS creados para este tipo de entorno incluyen un elastic load balancer, un Auto Scaling group y una o más instancias Amazon Elastic Compute Cloud (Amazon EC2).

vía - [https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/concepts-webserver.html](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/concepts-webserver.html)

Los recursos de AWS creados para un worker environment tier incluyen un ASG, una o más instancias Amazon EC2 y un rol IAM. Para el worker environment tier, Beanstalk también crea y aprovisiona una cola SQS si aún no tienes una. Cuando lanzas un worker environment, Beanstalk instala los archivos de soporte necesarios para el lenguaje de programación de tu elección y un daemon en cada instancia EC2 del ASG. El daemon lee mensajes desde una cola SQS. El daemon envía los datos de cada mensaje que lee a la aplicación web que corre en el worker environment para su procesamiento.

Para el caso dado, el worker tier se usa para procesar de forma asíncrona las facturas desde una cola SQS. El límite de tamaño de SQS es 256KB y por lo tanto los archivos deben subirse a S3 y una referencia a ellos debe ser enviada a SQS por el web tier. Finalmente, el archivo cron.yml debe definirse en el worker tier. Usando esta estrategia hemos desacoplado el tier de procesamiento del web tier, y el uso de CPU disminuirá como resultado. El worker tier también podrá escalar fácilmente en caso de que se suban muchas facturas.

Elastic Beanstalk Worker environment:  vía - [https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/concepts-worker.html](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/concepts-worker.html)

Incorrect options:

Crear un tier Beanstalk separado dentro del mismo entorno que sea una configuración worker y procese las facturas a través de una cola SQS. Las facturas se envían directamente a SQS después de ser comprimidas por el web tier. Los workers procesan estos archivos. Un cron job definido usando el archivo cron.yml enviará los correos electrónicos - Como se mencionó antes, el worker tier debe ser un entorno separado del web tier, por lo que esta opción es incorrecta.

Crear un entorno Beanstalk separado que sea un entorno worker y procese las facturas a través de una cola SQS. Las facturas se suben a S3 y una referencia a ellas es enviada a SQS por el web tier. El worker tier procesa estos archivos. Un cron job definido usando el archivo cron.yml en el web tier enviará los correos electrónicos - El archivo cron.yml debe definirse en el worker tier, no es soportado por el web tier, por lo que esta opción es incorrecta.

Crear un tier Beanstalk separado dentro del mismo entorno que sea una configuración worker y procese las facturas a través de una cola SQS. Las facturas se envían directamente a SQS después de ser comprimidas por el web tier. Los workers procesan estos archivos. Un cron job definido usando el archivo cron.yml en el web tier enviará los correos electrónicos - El worker tier debe ser un entorno separado del web tier, por lo que esta opción es incorrecta.

References:

[https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/concepts.html](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/concepts.html)

[https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/concepts-webserver.html](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/concepts-webserver.html)

[https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/concepts-worker.html](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/concepts-worker.html)

#### Pregunta 17:

El equipo DevOps en una agencia de monitoreo de riesgos geológicos mantiene una aplicación que proporciona notificaciones casi en tiempo real a dispositivos Android e iOS durante temblores, erupciones volcánicas y tsunamis. El equipo ha creado un pipeline de CodePipeline, que consiste en CodeCommit y CodeBuild, y la aplicación está desplegada en Elastic Beanstalk. El equipo desea habilitar despliegues Blue/Green para Beanstalk a través de CodePipeline.

Como Ingeniero DevOps, ¿cómo implementarías una solución para este requerimiento?

A. Hacer que CodePipeline despliegue a un nuevo entorno Beanstalk. Después de esa acción de stage, crear otra acción de stage para invocar un Custom Job usando AWS Lambda, el cual realizará la llamada API para hacer el swap del CNAME de los entornos

B. Hacer que CodePipeline despliegue al entorno actual de Beanstalk usando una estrategia rolling with additional batch. Agregar una acción de CodeDeploy después para habilitar Blue/Green

C. Hacer que CodePipeline despliegue a un nuevo entorno Beanstalk. Después de esa acción de stage, crear otra acción de stage para invocar una plantilla CloudFormation que realizará el CNAME swap

D. Hacer que CodePipeline despliegue al entorno actual de Beanstalk usando una estrategia immutable. Agregar una acción de CodeStar después para habilitar Blue/Green configurado mediante template.yml

**La respuesta:**

**A**

Explicación general

Correct option:

Hacer que CodePipeline despliegue a un nuevo entorno Beanstalk. Después de esa acción de stage, crear otra acción de stage para invocar un Custom Job usando AWS Lambda, el cual realizará la llamada API para hacer el swap del CNAME de los entornos

Elastic Beanstalk permite desplegar y gestionar aplicaciones rápidamente en AWS. Para despliegues Blue/Green en Beanstalk, se requieren dos entornos idénticos: uno (blue) en producción y otro (green) como entorno temporal para despliegue.

El pipeline CI/CD crea un entorno clon (green), despliega ahí la nueva versión y luego realiza un intercambio de CNAMEs para redirigir el tráfico al nuevo entorno. Una vez validado, se puede eliminar el entorno anterior.

Para automatizar el CNAME swap dentro de CodePipeline, se requiere una acción personalizada, típicamente mediante una función Lambda que invoque la API correspondiente, ya que CloudFormation no soporta directamente esta operación.

Incorrect options:

Desplegar en el entorno actual con rolling o immutable - No cumple con Blue/Green, ya que no se usa un entorno separado.

Usar CodeDeploy o CodeStar para habilitar Blue/Green en Beanstalk - No aplica en este contexto; CodeStar no es una acción de pipeline y CodeDeploy no gestiona Blue/Green en Beanstalk de esa forma.

Usar CloudFormation para el CNAME swap - No es posible, ya que CloudFormation no soporta esa operación directamente.

References:

[https://aws-quickstart.s3.amazonaws.com/quickstart-codepipeline-bluegreen-deployment/doc/blue-green-deployments-to-aws-elastic-beanstalk-on-the-aws-cloud.pdf](https://aws-quickstart.s3.amazonaws.com/quickstart-codepipeline-bluegreen-deployment/doc/blue-green-deployments-to-aws-elastic-beanstalk-on-the-aws-cloud.pdf)

Temática

Domain 1: SDLC Automation

#### Pregunta 18:

El equipo DevOps en una empresa de ropa inspirada en yoga quiere levantar entornos de desarrollo para probar nuevas funcionalidades. El equipo desea recibir una notificación cuando un pipeline de CodePipeline falle para enviarla al canal #devops de Slack de la empresa. La empresa te ha contratado como AWS Certified DevOps Engineer Professional para construir una solución para este caso.

¿Cuáles de las siguientes opciones sugerirías? (Selecciona dos)

A. El objetivo de la regla debe ser una función Lambda que invoque un webhook de Slack de terceros

B. El objetivo de la regla debe ser un “Slack send”. Proporcionar el nombre del canal y la URL del webhook

C. Crear una regla de CloudWatch Event con el source correspondiente a

{

"source": [

"aws.codepipeline"

],

"detail-type": [

"CodePipeline Pipeline Execution State Change"

],

"detail": {

"state": [

"FAILED"

]

}

}

D. Crear una regla de CloudWatch Event con el source correspondiente a

{

"source": [

"aws.codepipeline"

],

"detail-type": [

"CodePipeline Action Execution State Change"

],

"detail": {

"state": [

"FAILED"

]

}

}

E. Crear una regla de CloudWatch Event con el source correspondiente a

{

"source": [

"aws.codepipeline"

],

"detail-type": [

"CodePipeline Stage Execution State Change"

],

"detail": {

"state": [

"FAILED"

]

}

}

**La respuesta:**

**A**

**C**

Explicación general

Correct options:

El objetivo de la regla debe ser una función Lambda que invoque un webhook de Slack de terceros

Las reglas de CloudWatch Events (EventBridge) no soportan enviar directamente a Slack como destino. Por lo tanto, necesitas una función Lambda que consuma el evento y llame al webhook de Slack.

Crear una regla de CloudWatch Event con el source correspondiente a

{

"source": [

"aws.codepipeline"

],

"detail-type": [

"CodePipeline Pipeline Execution State Change"

],

"detail": {

"state": [

"FAILED"

]

}

}

AWS CodePipeline emite eventos de estado que pueden ser capturados por CloudWatch Events/EventBridge. Para detectar fallas del pipeline completo, debes usar el tipo de evento **Pipeline Execution State Change** y filtrar por estado FAILED.

Incorrect options:

El objetivo de la regla debe ser un “Slack send” - No existe soporte nativo para Slack como target en CloudWatch Events.

CodePipeline Action Execution State Change - Esto detecta fallas a nivel acción, no del pipeline completo.

CodePipeline Stage Execution State Change - Esto detecta fallas a nivel stage, no del pipeline completo.

References:

[https://aws.amazon.com/codepipeline/faqs/](https://aws.amazon.com/codepipeline/faqs/)

[https://docs.aws.amazon.com/codepipeline/latest/userguide/detect-state-changes-cloudwatch-events.html](https://docs.aws.amazon.com/codepipeline/latest/userguide/detect-state-changes-cloudwatch-events.html)

Temática

Domain 1: SDLC Automation

#### Pregunta 19:

Como parte de tu CodePipeline, estás ejecutando múltiples suites de pruebas. Dos están empaquetadas como contenedores Docker y se ejecutan directamente en CodeBuild, mientras que otra se ejecuta como una función Lambda ejecutando código Python. Todas las suites de pruebas están basadas en solicitudes HTTP y se determina que son dependientes de red, no de CPU. Actualmente, CodePipeline tarda mucho en ejecutarse ya que estas acciones ocurren una tras otra. La empresa planea agregar más pruebas. Todo el pipeline es gestionado por CloudFormation.

Como Ingeniero DevOps, ¿cuál de las siguientes opciones recomendarías para mejorar el tiempo de finalización de tu pipeline?

A. Migrar todas las suites de pruebas a Jenkins y usar el plugin de ECS

B. Habilitar CloudFormation StackSets para ejecutar las acciones en paralelo

C. Cambiar el runOrder de tus acciones para que tengan el mismo valor

D. Incrementar el número de vCPU asignadas a los builds de CodeBuild y la RAM asignada a tu función Lambda

**La respuesta:**

**C**

Explicación general

Correct option:

Cambiar el runOrder de tus acciones para que tengan el mismo valor

AWS CodePipeline permite definir acciones dentro de stages y controlar su ejecución mediante el parámetro runOrder. Si múltiples acciones tienen el mismo valor de runOrder, se ejecutan en paralelo dentro del mismo stage.

Dado que las pruebas son network-bound (no CPU-bound), el problema no es capacidad de cómputo sino ejecución secuencial. Ejecutarlas en paralelo reduce significativamente el tiempo total del pipeline.

Incorrect options:

Incrementar vCPU o memoria - No mejora significativamente el rendimiento porque el cuello de botella es la red, no el cómputo.

CloudFormation StackSets - No sirve para paralelizar acciones dentro de CodePipeline.

Migrar a Jenkins - No resuelve el problema de ejecución secuencial.

References:

[https://docs.aws.amazon.com/codepipeline/latest/userguide/reference-pipeline-structure.html](https://docs.aws.amazon.com/codepipeline/latest/userguide/reference-pipeline-structure.html)

Temática

Domain 1: SDLC Automation

#### Pregunta 20:

Una empresa global de servicios financieros gestiona más de 100 cuentas usando AWS Organizations y recientemente se ha detectado que varias cuentas y regiones no tienen AWS CloudTrail habilitado. También quiere poder rastrear el cumplimiento de la habilitación de CloudTrail mediante un dashboard y ser alertado automáticamente en caso de problemas. La empresa te ha contratado como AWS Certified DevOps Engineer Professional para construir una solución para este requerimiento.

¿Cómo implementarías una solución para este caso?

A. Crear una plantilla CloudFormation para habilitar CloudTrail. Crear un StackSet y desplegarlo en todas las cuentas y regiones bajo la organización de AWS. Crear otro StackSet CloudFormation para habilitar AWS Config y crear una regla Config para rastrear si CloudTrail está habilitado. Crear un agregador de AWS Config para una cuenta centralizada para rastrear cumplimiento. Crear un CloudWatch Event para generar eventos cuando el cumplimiento se incumpla y suscribir una función Lambda que enviará notificaciones

B. Crear una plantilla CloudFormation para habilitar CloudTrail. Crear un StackSet y desplegarlo en todas las cuentas y regiones bajo la organización de AWS. Crear otro StackSet para habilitar AWS Config y crear una regla Config para rastrear si CloudTrail está habilitado. Crear un agregador de AWS Config para una cuenta centralizada para rastrear cumplimiento. Crear un tópico SQS para notificaciones y suscribir una función Lambda

C. Crear una plantilla CloudFormation para habilitar CloudTrail. Crear un StackSet y desplegarlo en todas las cuentas y regiones bajo la organización de AWS. Crear una plantilla CloudFormation en una cuenta centralizada para habilitar AWS Config y crear una regla Config. Crear un agregador de AWS Config. Crear un tópico SNS para notificaciones

D. Crear una plantilla CloudFormation para habilitar CloudTrail. Crear un StackSet y desplegarlo en todas las cuentas y regiones bajo la organización de AWS. Crear una plantilla CloudFormation en una cuenta centralizada para habilitar AWS Config y crear una regla Config. Crear un agregador de AWS Config. Crear un CloudWatch Event para notificaciones

**La respuesta:**

**A**

Explicación general

Correct option:

Crear una plantilla CloudFormation para habilitar CloudTrail. Crear un StackSet y desplegarlo en todas las cuentas y regiones bajo la organización de AWS. Crear otro StackSet CloudFormation para habilitar AWS Config y crear una regla Config para rastrear si CloudTrail está habilitado. Crear un agregador de AWS Config para una cuenta centralizada para rastrear cumplimiento. Crear un CloudWatch Event para generar eventos cuando el cumplimiento se incumpla y suscribir una función Lambda que enviará notificaciones

Para resolver el problema se necesitan tres cosas clave:

1. Habilitar CloudTrail en todas las cuentas y regiones → StackSets
2. Monitorear cumplimiento → AWS Config + regla + aggregator
3. Alertar automáticamente → EventBridge (CloudWatch Events) + Lambda

StackSets permite desplegar configuraciones en múltiples cuentas/regiones.

AWS Config permite evaluar cumplimiento y el aggregator centraliza la vista.

CloudWatch Events/EventBridge permite reaccionar a cambios de cumplimiento.

Incorrect options:

Uso de SQS topic → no existe (SQS usa colas, no topics)

Habilitar AWS Config solo en cuenta central → incorrecto, debe estar en todas las cuentas

Uso de SNS sin integración adecuada con eventos de Config → incompleto para automatización basada en compliance

References:

[https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/what-is-cfnstacksets.html](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/what-is-cfnstacksets.html)

[https://docs.aws.amazon.com/config/latest/developerguide/aggregate-data.html](https://docs.aws.amazon.com/config/latest/developerguide/aggregate-data.html)

Temática

Domain 4: Monitoring and Logging

#### Pregunta 21:

Como Lead DevOps Engineer en una empresa de retail, tienes una aplicación web Spring Boot ejecutándose en un Auto Scaling group y detrás de un Application Load Balancer. Debes recolectar los logs antes de que una instancia sea terminada para poder analizarlos posteriormente. También es necesario recolectar los access logs. El análisis de estos logs debe realizarse al menor costo posible y solo necesita ejecutarse de vez en cuando.

¿Cuáles de las siguientes opciones sugerirías para implementar la solución MÁS costo-efectiva para este requerimiento? (Selecciona tres)

A. Analizar los logs usando un clúster EMR

B. Analizar los logs usando AWS Athena

C. Habilitar Access Logs a nivel de Target Group

D. Habilitar Access Logs a nivel de Application Load Balancer

E. Crear un Lifecycle Hook en el Auto Scaling Group para la acción de terminación. Crear una regla de CloudWatch Event para ese hook e invocar una función Lambda. La función Lambda debe usar un SSM Run Command para extraer los logs de la aplicación y almacenarlos en S3

F. Crear un Lifecycle Hook en el Auto Scaling Group para la acción de terminación. Crear una regla de CloudWatch Event para ese hook e invocar una función Lambda. La función Lambda debe usar un SSM Run Command para instalar el CloudWatch Logs Agent y enviar los logs a S3

**La respuesta:**

**B**

**D**

**E**

Explicación general

Correct options:

Analizar los logs usando AWS Athena

Athena permite consultar datos directamente en S3 usando SQL, sin infraestructura. Es serverless y muy económico para análisis ocasional.

Habilitar Access Logs a nivel de Application Load Balancer

Los access logs se habilitan en el ALB, no en el target group, y se almacenan en S3 para su posterior análisis.

Crear un Lifecycle Hook en el Auto Scaling Group para la acción de terminación…

Los lifecycle hooks permiten pausar la terminación de instancias para ejecutar acciones personalizadas. Aquí se usa para extraer logs antes de que la instancia desaparezca, usando SSM y guardándolos en S3.

Incorrect options:

EMR - Es costoso y no serverless, no es adecuado para análisis ocasional.

Access logs en Target Group - No existe esta configuración, solo en el ALB.

Instalar CloudWatch Logs Agent en terminación - Este agente es para streaming continuo, no para extracción puntual antes de terminar.

References:

[https://docs.aws.amazon.com/autoscaling/ec2/userguide/lifecycle-hooks.html](https://docs.aws.amazon.com/autoscaling/ec2/userguide/lifecycle-hooks.html)

[https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-access-logs.html](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-access-logs.html)

[https://aws.amazon.com/athena/](https://aws.amazon.com/athena/)

Temática

Domain 3: Resilient Cloud Solutions

#### Pregunta 22:

El equipo DevOps en una empresa de analítica está desplegando un clúster Apache Kafka que contiene 6 instancias y está distribuido en 3 Availability Zones (AZs). Apache Kafka es una aplicación con estado (stateful) y necesita almacenar sus datos en volúmenes EBS. Por lo tanto, cada instancia debe tener capacidad de auto-recuperación y siempre adjuntar el volumen EBS correcto.

Como AWS Certified DevOps Engineer Professional, ¿cuál de las siguientes soluciones sugerirías para este requerimiento?

A. Crear 6 instancias EC2 usando CloudFormation con volúmenes EBS. Definir los attachments en la plantilla. Si la instancia EC2 es terminada, será recreada automáticamente por CloudFormation con el EBS correcto

B. Crear 6 instancias EC2 usando CloudFormation con volúmenes EBS. Definir los attachments en la plantilla. Si la instancia EC2 es terminada, ejecutar un drift detection en CloudFormation y luego hacer remediation

C. Crear un Auto Scaling Group en CloudFormation con capacidad min/max/deseada de 6 instancias distribuidas en 3 AZs, y 6 volúmenes EBS. Usar user data para que las instancias tomen cualquier volumen disponible en su AZ

D. Crear una plantilla CloudFormation con un ASG de capacidad min/max de 1 y un volumen EBS. Etiquetar el ASG y el volumen EBS. Crear un script de User Data que adjunte el volumen EBS correcto al arrancar. Usar una plantilla maestra de CloudFormation y referenciar esta plantilla anidada 6 veces

**La respuesta:
D**

Explicación general
Correct option:

Crear una plantilla CloudFormation con un ASG de capacidad min/max de 1 y un volumen EBS. Etiquetar el ASG y el volumen EBS. Crear un script de User Data que adjunte el volumen EBS correcto al arrancar. Usar una plantilla maestra de CloudFormation y referenciar esta plantilla anidada 6 veces

La clave del problema es que Kafka es stateful y cada nodo debe mantener su volumen específico. También se requiere auto-healing.

La solución correcta es desacoplar cada nodo en su propio ASG de tamaño 1 (uno por broker), garantizando que si la instancia muere, el ASG la recrea en la misma AZ y el script de arranque vuelve a adjuntar el volumen EBS correcto (identificado por tags).

Se usa CloudFormation nested stacks para repetir este patrón 6 veces.

Incorrect options:

Instancias EC2 simples con CloudFormation - No tienen auto-healing automático.

Drift detection - Solo detecta cambios, no los corrige automáticamente.

ASG de 6 instancias compartiendo volúmenes - Riesgo de desalineación entre instancias y volúmenes, especialmente en fallas de AZ.

References:

[https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/quickref-autoscaling.html](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/quickref-autoscaling.html)

Temática
Domain 5: Incident and Event Response

#### Pregunta 23:

Tu empresa ha adoptado CodeCommit y obliga a los desarrolladores a crear nuevas ramas y pull requests antes de hacer merge a master. El equipo de desarrollo revisa los pull requests y quiere que el sistema CI/CD construya automáticamente el Pull Request para proporcionar un badge de testing con estado pass/fail.

¿Cómo puedes implementar la validación de Pull Requests usando CodeBuild de forma eficiente?

A. Crear una regla de CloudWatch Event que reaccione a la creación y actualizaciones de Pull Requests en el repositorio. El target debe ser una función Lambda que invoque CodeBuild y espere el resultado para actualizar el Pull Request

B. Crear una regla de CloudWatch Event que reaccione a la creación y actualizaciones de Pull Requests en el repositorio. El target debe ser CodeBuild. Crear una segunda regla de CloudWatch Event para detectar éxito o fallo del build y como target invocar una Lambda que actualice el Pull Request con el resultado

C. Crear una regla de CloudWatch Event programada cada 5 minutos que invoque Lambda para revisar Pull Requests y ejecutar CodeBuild. Luego otra regla para actualizar el resultado

D. Crear una regla de CloudWatch Event programada cada 5 minutos que invoque Lambda, ejecute CodeBuild y espere el resultado para actualizar el Pull Request

**La respuesta:**

**B**

Explicación general

Correct option:

Crear una regla de CloudWatch Event que reaccione a la creación y actualizaciones de Pull Requests en el repositorio. El target debe ser CodeBuild. Crear una segunda regla de CloudWatch Event para detectar éxito o fallo del build y como target invocar una Lambda que actualice el Pull Request con el resultado

La solución eficiente es completamente event-driven:

1. Evento de Pull Request → dispara CodeBuild
2. Evento de resultado de build → dispara Lambda para actualizar el PR

Esto evita polling y evita que Lambda espere (lo cual es costoso y limitado por timeout).

Incorrect options:

Lambda esperando CodeBuild - Puede exceder el timeout (15 min) y genera costo innecesario.

Ejecución programada (polling) - Ineficiente comparado con eventos en tiempo real.

References:

[https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/WhatIsCloudWatchEvents.html](https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/WhatIsCloudWatchEvents.html)

Temática

Domain 1: SDLC Automation

#### Pregunta 24:

Tu aplicación está desplegada en Elastic Beanstalk y gestionas la configuración del stack usando una plantilla CloudFormation. Cada semana se crea una nueva AMI que contiene los últimos parches de seguridad. Has desplegado más de 100 aplicaciones usando CloudFormation y Beanstalk, y quieres asegurarte de que la AMI usada por las instancias EC2 se actualice cada semana. No hay estandarización ni convenciones de nombres entre las plantillas.

Como Ingeniero DevOps, ¿cómo implementarías una solución para este requerimiento?

A. Almacenar el ID de la Golden AMI en un parámetro de SSM Parameter Store. Crear un parámetro de CloudFormation de tipo String y pasarlo a la configuración de Beanstalk. Crear una regla de CloudWatch Event semanal que invoque una Lambda que obtenga el parámetro y actualice los stacks con UpdateStack

B. Almacenar el ID de la Golden AMI en un parámetro de SSM Parameter Store. Crear un parámetro de CloudFormation que apunte a SSM y pasarlo a Beanstalk. Crear una regla de CloudWatch Event semanal que invoque una Lambda que haga UpdateStack en todos los stacks

C. Almacenar el ID de la Golden AMI en un objeto S3 y usar un parámetro de CloudFormation apuntando a ese objeto. Usar Lambda para refrescar stacks

D. Almacenar el ID de la Golden AMI en S3 y modificar mappings en cada template usando Lambda

**La respuesta:**

**B**

Explicación general

Correct option:

Almacenar el ID de la Golden AMI en un parámetro de SSM Parameter Store. Crear un parámetro de CloudFormation que apunte a SSM y pasarlo a Beanstalk. Crear una regla de CloudWatch Event semanal que invoque una Lambda que haga UpdateStack en todos los stacks

SSM Parameter Store permite centralizar el valor del AMI.

CloudFormation puede referenciar directamente parámetros de SSM, por lo que no necesitas lógica adicional para pasar valores manualmente.

Cada vez que se actualiza el parámetro en SSM, basta con ejecutar un UpdateStack para que CloudFormation tome automáticamente el nuevo valor.

Dado que no hay estandarización en templates, esta solución evita modificar cada uno.

Incorrect options:

Pasar el valor manualmente desde Lambda (String) - No escala bien sin estandarización.

Usar S3 como fuente de parámetros - CloudFormation no soporta obtener parámetros directamente desde S3.

Modificar templates dinámicamente - Muy complejo, frágil y difícil de mantener.

References:

[https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-ssm-parameter.html](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-ssm-parameter.html)

[https://aws.amazon.com/blogs/mt/integrating-aws-cloudformation-with-aws-systems-manager-parameter-store/](https://aws.amazon.com/blogs/mt/integrating-aws-cloudformation-with-aws-systems-manager-parameter-store/)

Temática

Domain 2: Configuration Management and IaC

#### Pregunta 25:

Una empresa de servicios de salud tiene fuertes requisitos regulatorios y recientemente se ha detectado que algunos volúmenes EBS no han sido cifrados. Es necesario monitorear y auditar el cumplimiento a lo largo del tiempo y alertar a los equipos correspondientes cuando se detecten volúmenes EBS sin cifrar.

¿Cómo debería un DevOps Engineer implementar una alerta para volúmenes EBS no cifrados con el menor esfuerzo administrativo?

A. Crear una función Lambda activada por CloudWatch Events que monitoree nuevos volúmenes EBS y envíe notificaciones a SNS

B. Crear una regla administrada de AWS Config que verifique el cifrado de volúmenes EBS y conectarla directamente a SNS

C. Crear una regla personalizada de AWS Config para revisar instancias EC2 y sus volúmenes, y conectar a SNS

D. Crear una regla administrada de AWS Config que verifique el cifrado de volúmenes EBS y usar CloudWatch Events para alertas

**La respuesta:**

**D**

Explicación general

Correct option:

Crear una regla administrada de AWS Config que verifique el cifrado de volúmenes EBS y usar CloudWatch Events para alertas

AWS Config ofrece reglas administradas como **encrypted-volumes**, que permiten evaluar automáticamente si los volúmenes EBS cumplen con cifrado.

Esto cubre dos necesidades clave:

- Auditoría continua (histórico de cumplimiento)
- Evaluación automática sin código (menor overhead)

Para alertas específicas por incumplimiento, se usan eventos de CloudWatch/EventBridge que reaccionan a cambios de estado de cumplimiento y envían notificaciones (por ejemplo vía SNS o Lambda).

Incorrect options:

Lambda + CloudWatch Events - No proporciona auditoría histórica ni cumplimiento continuo.

AWS Config + SNS directo - SNS en Config envía todos los eventos, no permite filtrar fácilmente por una regla específica.

AWS Config custom rule - Innecesario, ya existe una regla administrada.

References:

[https://docs.aws.amazon.com/config/latest/developerguide/encrypted-volumes.html](https://docs.aws.amazon.com/config/latest/developerguide/encrypted-volumes.html)

[https://docs.aws.amazon.com/config/latest/developerguide/evaluate-config_use-managed-rules.html](https://docs.aws.amazon.com/config/latest/developerguide/evaluate-config_use-managed-rules.html)

Temática

Domain 6: Security and Compliance

#### Pregunta 26:

El equipo DevOps en una empresa multinacional de servicios financieros gestiona cientos de cuentas a través de AWS Organizations. Como parte de los requisitos de cumplimiento de seguridad, el equipo debe forzar el uso de una AMI endurecida en cada cuenta. Cuando se crea una nueva AMI, el equipo quiere asegurarse de que las nuevas instancias EC2 no puedan ser lanzadas desde la AMI antigua. Además, el equipo también quiere rastrear y auditar el cumplimiento del uso de la AMI en todas las cuentas.

Como AWS Certified DevOps Engineer Professional, ¿qué recomiendas? (Selecciona dos)

A. Crear un documento de AWS Automation para crear la AMI y desplegarla en todas las cuentas usando CloudFormation StackSets

B. Crear una regla personalizada de AWS Config en todas las cuentas usando CloudFormation StackSets y reportar resultados con un agregador de AWS Config

C. Crear un documento de AWS Automation para crear la AMI en una cuenta central y copiarla a otras cuentas

D. Crear un documento de AWS Automation para crear la AMI en una cuenta central y compartirla con otras cuentas. Cuando haya una nueva AMI, dejar de compartir la anterior y compartir la nueva

E. Crear una función Lambda en todas las cuentas para verificar AMIs y enviar eventos a SNS

**La respuesta:**

**B**

**D**

Explicación general

Correct options:

Crear un documento de AWS Automation para crear la AMI en una cuenta central y compartirla con otras cuentas. Cuando haya una nueva AMI, dejar de compartir la anterior y compartir la nueva

Esto garantiza control centralizado. Al compartir la AMI en lugar de copiarla, se evita proliferación y se puede invalidar fácilmente la anterior.

Crear una regla personalizada de AWS Config en todas las cuentas usando CloudFormation StackSets y reportar resultados con un agregador de AWS Config

AWS Config permite auditar cumplimiento en el tiempo. El agregador centraliza la visibilidad en múltiples cuentas.

Incorrect options:

Copiar AMIs a cada cuenta - Pierdes control central y dificulta enforcement.

Crear AMIs en cada cuenta - No escala y rompe consistencia.

Lambda + SNS - No provee auditoría histórica ni cumplimiento formal.

References:

[https://docs.aws.amazon.com/config/latest/developerguide/aggregate-data.html](https://docs.aws.amazon.com/config/latest/developerguide/aggregate-data.html)

[https://docs.aws.amazon.com/config/latest/developerguide/config-concepts.html](https://docs.aws.amazon.com/config/latest/developerguide/config-concepts.html)

Temática

Domain 3: Resilient Cloud Solutions

#### Pregunta 27:

Una empresa de retail está implementando un pipeline de CodePipeline en el que cada push a la rama master de CodeCommit se despliega a entornos de desarrollo, staging y producción basados en instancias EC2.

Para producción, el tráfico debe desplegarse primero a unas pocas instancias para recopilar métricas antes de una aprobación manual para desplegar al resto.

¿Cómo implementarías esta solución?

A. Crear 3 deployment groups (dev, staging, producción completa) y usar Canary deployment en CodeDeploy con aprobación manual

B. Crear 4 deployment groups (dev, staging, canary en producción y producción completa). Crear un solo CodePipeline y agregar una aprobación manual después del canary

C. Crear 4 deployment groups y pipelines separados por ambiente

D. Crear 3 deployment groups y pipelines separados con Canary deployment

La respuesta:

B

Explicación general

Correct option:

Crear 4 deployment groups:

- Development
- Staging
- Canary (subset de producción)
- Producción completa

Luego encadenarlos en un solo CodePipeline e introducir un paso de aprobación manual después del despliegue canary.

Esto permite:

- Validar en pocas instancias
- Tomar decisión manual antes de impactar todo producción
- Mantener control centralizado en un solo pipeline

Además, para EC2 (CodeDeploy EC2/On-Prem), no existe canary automático como en Lambda/ECS, por lo que debes modelarlo manualmente con deployment groups separados.

Incorrect options:

Uso de Canary nativo en CodeDeploy EC2 → No existe (solo Lambda/ECS)

Pipelines separados → Pierdes control del flujo y no puedes insertar correctamente el approval gate

3 deployment groups → No separa canary de producción completa

Referencia:

Temática

Domain 1: SDLC Automation

#### Pregunta 28:

Una empresa de redes sociales está ejecutando su aplicación principal mediante un Auto Scaling Group (ASG) que tiene 15 instancias EC2 distribuidas en 3 Availability Zones (AZs). Durante el tiempo fuera de pico, la utilización promedio de CPU del grupo está en 15%. Durante el horario pico, sube hasta 45%, y estos picos ocurren de forma predecible durante el horario laboral. La empresa te ha contratado como AWS Certified DevOps Engineer Professional para construir una solución para este requerimiento.

¿Cómo puedes mejorar la utilización de las instancias reduciendo costo y manteniendo la disponibilidad de la aplicación?

A. Usar una CloudFormation UpdatePolicy para definir cómo debe comportarse el Auto Scaling Group en horas pico y fuera de pico. Asegurar que el ASG invoque CloudFormation usando retransmisión de notificaciones SNS

B. Crear una función Lambda que termine 9 instancias al final del horario laboral. Crear una segunda función Lambda que cree instancias cuando empiece el horario pico. Programar ambas funciones usando CloudWatch Events

C. Crear una política de escalado que rastree la utilización de CPU con un objetivo de 75%. Crear una acción programada que aumente el número mínimo de instancias a 6 durante horarios pico y una segunda acción programada que reduzca el número mínimo de instancias a 3 en horarios fuera de pico

D. Crear una política de escalado que rastree la utilización de CPU con un objetivo de 75%. Crear una acción programada que invoque una función Lambda que terminará 9 instancias después de los horarios pico

**La respuesta:**

**C**

Explicación general

Correct option:

Crear una política de escalado que rastree la utilización de CPU con un objetivo de 75%. Crear una acción programada que aumente el número mínimo de instancias a 6 durante horarios pico y una segunda acción programada que reduzca el número mínimo de instancias a 3 en horarios fuera de pico

Con target tracking scaling policies, eliges una métrica de escalado y estableces un valor objetivo. Auto Scaling crea y administra las alarmas necesarias y ajusta la capacidad para mantener la métrica cerca del objetivo configurado.

En este caso, como los picos ocurren de forma predecible, la mejor solución es combinar:

- escalado dinámico con target tracking
- acciones programadas para ajustar la capacidad mínima según el horario

Así reduces costo fuera de pico y mantienes disponibilidad en horas pico.

Incorrect options:

Usar Lambda para terminar instancias - Si las instancias pertenecen a un ASG, el grupo las recreará si no cambias desired/min/max, por lo que no resuelve correctamente el problema.

Usar CloudFormation UpdatePolicy - No sirve para programar cambios operativos recurrentes del ASG.

Invocar Lambda para terminar instancias después del pico - Mismo problema: el ASG volverá a crearlas si la capacidad deseada no cambia.

References:

[https://docs.aws.amazon.com/autoscaling/ec2/userguide/as-scaling-target-tracking.html](https://docs.aws.amazon.com/autoscaling/ec2/userguide/as-scaling-target-tracking.html)

[https://docs.aws.amazon.com/autoscaling/ec2/userguide/schedule_time.html](https://docs.aws.amazon.com/autoscaling/ec2/userguide/schedule_time.html)

Temática

Domain 5: Incident and Event Response

#### Pregunta 29:

Como DevOps Engineer en una empresa de e-commerce, has desplegado una aplicación web en un Auto Scaling Group (ASG) detrás de un Application Load Balancer (ALB). La aplicación usa RDS Multi-AZ como backend y ha tenido problemas para conectarse a la base de datos. El health check de la aplicación actualmente devuelve un estado unhealthy si la aplicación no puede conectarse a la base de datos. La integración de health checks entre ALB y ASG está habilitada, por lo que el ASG sigue terminando instancias justo después de que terminan de arrancar.

Necesitas poder aislar una instancia para hacer troubleshooting durante un tiempo indeterminado. ¿Cómo deberías proceder?

A. Crear un lifecycle hook de Auto Scaling para terminación. Hacer troubleshooting mientras la instancia está en estado Terminating:Wait

B. Suspender el proceso Launch

C. Habilitar termination protection para EC2

D. Poner una instancia en Standby justo después de que haya arrancado

**La respuesta:**

**D**

Explicación general

Correct option:

Poner una instancia en Standby justo después de que haya arrancado

Cuando una instancia está en estado Standby dentro de un Auto Scaling Group, sigue perteneciendo al grupo, pero deja de recibir tráfico y puede ser mantenida o analizada sin participar activamente en el servicio.

Esto encaja con el requerimiento de aislar una instancia por tiempo indeterminado para troubleshooting.

Incorrect options:

Crear un lifecycle hook de terminación - Puede ayudar, pero tiene timeout y no sirve bien para un tiempo indeterminado.

Suspender Launch - Solo evita nuevos lanzamientos, no resuelve el aislamiento de una instancia ya creada.

Habilitar termination protection en EC2 - No evita que el ASG termine instancias por health checks o políticas del grupo.

References:

[https://docs.aws.amazon.com/autoscaling/ec2/userguide/as-enter-exit-standby.html](https://docs.aws.amazon.com/autoscaling/ec2/userguide/as-enter-exit-standby.html)

[https://docs.aws.amazon.com/autoscaling/ec2/userguide/as-add-elb-healthcheck.html](https://docs.aws.amazon.com/autoscaling/ec2/userguide/as-add-elb-healthcheck.html)

[https://docs.aws.amazon.com/elasticloadbalancing/latest/application/target-group-health-checks.html](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/target-group-health-checks.html)

Temática

Domain 5: Incident and Event Response

#### Pregunta 30:

Una empresa de modelado 3D quiere desplegar aplicaciones en Elastic Beanstalk con soporte para múltiples lenguajes de programación usando estrategias de despliegue predecibles y estandarizadas. Algunos lenguajes están soportados (Node.js, Java, Golang), pero otros como Rust no lo están. Te han contratado para diseñar la solución más eficiente.

¿Cuál de las siguientes opciones recomendarías?

A. Ejecutar OpsWorks sobre Elastic Beanstalk para agregar compatibilidad

B. Desplegar en Elastic Beanstalk usando configuración Multi-Docker. Empaquetar cada aplicación como contenedor Docker en ECR

C. Empaquetar cada aplicación como una AMI standalone con runtime incluido

D. Crear una plataforma custom por cada lenguaje no soportado

**La respuesta:
B**

Explicación general
Correct option:

Desplegar en Elastic Beanstalk usando una configuración Multi-Docker. Empaquetar cada aplicación como contenedor Docker en ECR

Docker permite encapsular completamente el runtime, dependencias y aplicación, eliminando la limitación de lenguajes soportados por Beanstalk.

Con Multi-container Docker (Dockerrun.aws.json):

Puedes estandarizar despliegues
Soportar cualquier lenguaje (incluyendo Rust)
Usar ECR como registry
Mantener consistencia en CI/CD

Incorrect options:

OpsWorks - No resuelve compatibilidad de runtime en Beanstalk.

AMI por aplicación - Difícil de mantener y no estandariza despliegue.

Custom platform por lenguaje - Alto costo operativo y complejidad.

References:

[https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/create_deploy_docker_ecs.html](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/create_deploy_docker_ecs.html)

Temática
Domain 2: Configuration Management and IaC

#### Pregunta 31:

Una empresa de e-commerce ha desplegado una aplicación Spring en Elastic Beanstalk sobre la plataforma Java. Como DevOps Engineer, estás referenciando una base de datos RDS PostgreSQL mediante una variable de entorno para que la aplicación la use para almacenar sus datos. Estás usando una librería para realizar una migración de base de datos en caso de cambios de esquema. Al desplegar actualizaciones a Beanstalk, has visto que la migración falla porque todas las instancias EC2 que ejecutan la nueva versión intentan correr la migración sobre la base de datos RDS.

¿Cómo puedes corregir este problema?

A. Crear un archivo .ebextensions/db-migration.config en tu repositorio y definir un bloque container_commands. Colocar ahí el comando de migración y usar el atributo leader_only: true

B. Crear un archivo .ebextensions/db-migration.config en tu repositorio y definir un bloque container_commands. Colocar ahí el comando de migración y usar el atributo lock_mode: true

C. Crear un archivo .ebextensions/db-migration.config en tu repositorio y definir un bloque commands. Colocar ahí el comando de migración y usar el atributo leader_only: true

D. Crear un archivo .ebextensions/db-migration.config en tu repositorio y definir un bloque commands. Colocar ahí el comando de migración y usar el atributo lock_mode: true

**La respuesta:
A**

Explicación general
Correct option:

Crear un archivo .ebextensions/db-migration.config en tu repositorio y definir un bloque container_commands. Colocar ahí el comando de migración y usar el atributo leader_only: true

En Elastic Beanstalk, los archivos .ebextensions permiten personalizar el entorno y ejecutar comandos durante el despliegue.

La diferencia importante es:

commands: se ejecuta en todas las instancias y no soporta leader_only
container_commands: se ejecuta después de preparar la aplicación y sí soporta leader_only

Como necesitas que la migración se ejecute una sola vez, debes ponerla en container_commands con leader_only: true.

Incorrect options:

Usar commands con leader_only - Incorrecto, porque commands no soporta ese atributo.

Usar lock_mode: true - Ese atributo no existe en este contexto.

References:

[https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/customize-containers-ec2.html](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/customize-containers-ec2.html)

[https://stackoverflow.com/questions/35788499/what-is-difference-between-commands-and-container-commands-in-elasticbean-talk/40096352#40096352](https://stackoverflow.com/questions/35788499/what-is-difference-between-commands-and-container-commands-in-elasticbean-talk/40096352#40096352)

Temática
Domain 2: Configuration Management and IaC

#### Pregunta 32

Una empresa de tecnología educativa ha creado una API de pago por uso utilizando API Gateway. Esta API está disponible en http://edtech.com/api/v1. Los archivos estáticos del sitio web se han cargado en S3 y ahora soportan una nueva ruta de API http://edtech.com/api/v1/new-feature, si está disponible. Tu equipo ha decidido primero enviar una pequeña cantidad de tráfico a esa ruta y probar si las métricas se ven correctas. Tus rutas de API Gateway están respaldadas por AWS Lambda.

Como ingeniero DevOps, ¿qué pasos debes tomar para habilitar estas pruebas?

A. Crear un nuevo Stage de API Gateway. Habilitar implementaciones Canary en el stage v1. Desplegar el nuevo stage al stage v1 y asignar una pequeña cantidad de tráfico al stage canary. Monitorear datos de métricas usando CloudWatch

B. Crear un nuevo alias de función Lambda. Habilitar implementaciones Canary en el alias de Lambda. Desplegar la nueva API al alias de Lambda y asignar una pequeña cantidad de tráfico a la versión canary de Lambda. Habilitar nueva redirección de ruta para AWS Lambda y monitorear datos de métricas usando Amazon ES

C. Crear un nuevo Stage de API Gateway. Habilitar implementaciones Canary en el stage v1. Desplegar el nuevo stage al stage v1 y asignar una pequeña cantidad de tráfico al stage canary. Monitorear datos de métricas usando Amazon ES

D. Crear un nuevo alias de función Lambda. Habilitar implementaciones Canary en el alias de Lambda. Desplegar la nueva API al alias de Lambda y asignar una pequeña cantidad de tráfico a la versión canary de Lambda. Habilitar nueva redirección de ruta para AWS Lambda y monitorear datos de métricas usando CloudWatch

La respuesta:

A

Explicación general

Correct option:

Crear un nuevo Stage de API Gateway. Habilitar implementaciones Canary en el stage v1. Desplegar el nuevo stage al stage v1 y asignar una pequeña cantidad de tráfico al stage canary. Monitorear datos de métricas usando CloudWatch

Amazon API Gateway es un servicio de AWS para crear, publicar, mantener, monitorear y asegurar APIs REST, HTTP y WebSocket a cualquier escala. API Gateway maneja tareas como gestión de tráfico, autorización y control de acceso, monitoreo y gestión de versiones de API. API Gateway actúa como una “puerta de entrada” para que las aplicaciones accedan a datos, lógica de negocio o funcionalidad desde tus servicios backend, como cargas de trabajo ejecutándose en Amazon Elastic Compute Cloud (Amazon EC2), código ejecutándose en AWS Lambda, cualquier aplicación web o aplicaciones de comunicación en tiempo real.

Cómo funciona API Gateway:

via - [https://aws.amazon.com/api-gateway/](https://aws.amazon.com/api-gateway/)

Simplemente crear y desarrollar una API en API Gateway no la hace automáticamente invocable por tus usuarios. Para hacerla invocable, debes desplegar tu API a un stage. Un stage es una referencia con nombre a un deployment, el cual es una instantánea de la API. Puedes configurar ajustes del stage para habilitar caché, personalizar throttling de solicitudes, configurar logging, definir variables de stage o adjuntar una liberación canary para pruebas. En un despliegue con liberación canary, el tráfico total de la API se separa aleatoriamente en una liberación de producción y una liberación canary con una proporción preconfigurada. Las características actualizadas de la API solo son visibles para la liberación canary. La liberación canary recibe un pequeño porcentaje del tráfico de la API y la liberación de producción recibe el resto.

via - [https://docs.aws.amazon.com/apigateway/latest/developerguide/canary-release.html](https://docs.aws.amazon.com/apigateway/latest/developerguide/canary-release.html)

Para el caso de uso dado, debes desplegar la API a un nuevo stage llamado v1, habilitar despliegue canary en este stage v1 y asignar una pequeña cantidad de tráfico a este stage canary.

Incorrect options:

Crear un nuevo Stage de API Gateway. Habilitar implementaciones Canary en el stage v1. Desplegar el nuevo stage al stage v1 y asignar una pequeña cantidad de tráfico al stage canary. Monitorear datos de métricas usando Amazon ES - API Gateway y AWS Lambda tienen integración directa con CloudWatch y NO con Amazon ES. Por lo tanto, esta opción es incorrecta.

Crear un nuevo alias de función Lambda. Habilitar implementaciones Canary en el alias de Lambda. Desplegar la nueva API al alias de Lambda y asignar una pequeña cantidad de tráfico a la versión canary de Lambda. Habilitar nueva redirección de ruta para AWS Lambda y monitorear datos de métricas usando CloudWatch - Cuando se implementa una nueva ruta de API, debes crear un nuevo stage de API Gateway y NO un alias de Lambda. Los alias de Lambda solo se utilizan para actualizar el comportamiento de una ruta existente. Recuerda que una ruta en API Gateway se mapea a una función AWS Lambda (u otro servicio).

Crear un nuevo alias de función Lambda. Habilitar implementaciones Canary en el alias de Lambda. Desplegar la nueva API al alias de Lambda y asignar una pequeña cantidad de tráfico a la versión canary de Lambda. Habilitar nueva redirección de ruta para AWS Lambda y monitorear datos de métricas usando Amazon ES - Cuando se implementa una nueva ruta de API, debes crear un nuevo stage de API Gateway y NO un alias de Lambda. Además, API Gateway y AWS Lambda tienen integración directa con CloudWatch y NO con Amazon ES.

References:

[https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html](https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html)

[https://docs.aws.amazon.com/apigateway/latest/developerguide/canary-release.html](https://docs.aws.amazon.com/apigateway/latest/developerguide/canary-release.html)

Temática

Domain 2: Configuration Management and IaC

#### Pregunta 33

Estás trabajando como ingeniero DevOps en una empresa de comercio electrónico y tienes desplegada una aplicación Node.js en Elastic Beanstalk. Te gustaría rastrear las tasas de error y específicamente necesitas asegurarte, observando los logs de la aplicación, de que no tengas más de 100 errores en un intervalo de 5 minutos. En caso de que estés recibiendo demasiados errores, te gustaría ser alertado vía email.

¿Cuál de las siguientes opciones representa la solución más eficiente en tu opinión?

A. Implementar lógica personalizada en tu aplicación Node.js para rastrear el número de errores que ha recibido en los últimos 5 minutos. En caso de que el número exceda el umbral, usar la API SetAlarmState para activar una alarma de CloudWatch. Hacer que la alarma de CloudWatch use SNS como destino. Crear una suscripción de email en SNS

B. Crear un CloudWatch Logs Metric Filter con un objetivo siendo una alarma de CloudWatch. Hacer que la alarma de CloudWatch use SNS como destino. Crear una suscripción de email en SNS

C. Usar las métricas de salud de Elastic Beanstalk para monitorear la salud de la aplicación y rastrear las tasas de error. Crear una alarma de CloudWatch sobre la métrica y usar SNS como destino. Crear una suscripción de email en SNS

D. Crear un CloudWatch Logs Metric Filter y asignar una métrica de CloudWatch. Crear una alarma de CloudWatch vinculada a la métrica y usar SNS como destino. Crear una suscripción de email en SNS

**La respuesta:**

**D**

Explicación general

Correct option:

Crear un CloudWatch Logs Metric Filter y asignar una métrica de CloudWatch. Crear una alarma de CloudWatch vinculada a la métrica y usar SNS como destino. Crear una suscripción de email en SNS

Puedes buscar y filtrar los datos de logs creando uno o más metric filters. Los metric filters definen los términos y patrones a buscar en los datos de logs a medida que son enviados a CloudWatch Logs. CloudWatch Logs usa estos metric filters para convertir datos de logs en métricas numéricas de CloudWatch que puedes graficar o sobre las cuales puedes configurar una alarma. Los filtros no filtran datos de forma retroactiva. Los filtros solo publican puntos de datos métricos para eventos que ocurren después de que el filtro fue creado.

Puedes usar metric filters para buscar y hacer coincidir términos, frases o valores en tus eventos de logs. Cuando un metric filter encuentra uno de los términos, frases o valores en tus eventos de logs, puedes incrementar el valor de una métrica de CloudWatch. Por ejemplo, puedes crear un metric filter para buscar y contar la ocurrencia de la palabra ERROR en tus eventos de logs.

CloudWatch Logs Metric Filter Concepts: via - [https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/MonitoringLogData.html](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/MonitoringLogData.html)

Para el caso de uso dado, puedes hacer que Beanstalk envíe los logs a CloudWatch Logs, y luego crear un metric filter. Esto creará una métrica para nosotros (y no una alarma), y sobre esa métrica, puedes crear una alarma de CloudWatch. Esta alarma enviará una notificación a SNS, que a su vez enviará emails.

Incorrect options:

Crear un CloudWatch Logs Metric Filter con un objetivo siendo una alarma de CloudWatch. Hacer que la alarma de CloudWatch use SNS como destino. Crear una suscripción de email en SNS - No puedes establecer directamente una alarma de CloudWatch como destino de un CloudWatch Logs Metric Filter. Primero necesitas crear un metric filter que luego puede ser usado para crear una métrica de CloudWatch que eventualmente se use en una alarma de CloudWatch.

Usar las métricas de salud de Elastic Beanstalk para monitorear la salud de la aplicación y rastrear las tasas de error. Crear una alarma de CloudWatch sobre la métrica y usar SNS como destino. Crear una suscripción de email en SNS - Las métricas de salud de Elastic Beanstalk no rastrean los errores enviados a un archivo de logs, por lo que no cumplen con los requisitos del caso de uso. Además, una alarma de CloudWatch no puede usarse directamente sobre métricas de salud de Elastic Beanstalk.

Implementar lógica personalizada en tu aplicación Node.js para rastrear el número de errores que ha recibido en los últimos 5 minutos. En caso de que el número exceda el umbral, usar la API SetAlarmState para activar una alarma de CloudWatch. Hacer que la alarma de CloudWatch use SNS como destino. Crear una suscripción de email en SNS - Implementar lógica personalizada en tu aplicación Node.js puede parecer una buena idea, pero debes recordar que tu aplicación puede estar distribuida entre múltiples servidores con Beanstalk, por lo que no será posible rastrear los "100 errores" a través de todas las instancias usando esta metodología.

References:

[https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/MonitoringLogData.html](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/MonitoringLogData.html)

[https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/FilterAndPatternSyntax.html](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/FilterAndPatternSyntax.html)

Temática

Domain 4: Monitoring and Logging

#### Pregunta 34

Una empresa global de salud tiene un sistema de archivos EFS siendo utilizado en eu-west-1. La empresa desea planificar una estrategia de recuperación ante desastres y respaldar ese sistema de archivos EFS en ap-southeast-2. Debe tener una copia activa de los datos para que las aplicaciones puedan ser redeplegadas en ap-southeast-2 con un RPO y RTO mínimos. Las VPC en cada región no están emparejadas entre sí.

¿Cómo debería un ingeniero DevOps implementar una solución para este caso de uso?

A. Crear un clúster de replicación gestionado por EC2 con Auto Scaling en eu-west-1. Escalar de acuerdo con una métrica personalizada que publicarías con la aplicación representando el retraso en las lecturas de archivos. Replicar los datos en Amazon S3 en ap-southeast-2. Crear otro clúster de replicación en ap-southeast-2 que lea desde Amazon S3 y copie los archivos a un clúster EFS en standby

B. Crear un clúster de replicación gestionado por EC2 con Auto Scaling en eu-west-1. Escalar de acuerdo con una métrica personalizada que publicarías con la aplicación representando el retraso en las lecturas de archivos. Crear un clúster EFS en standby en ap-southeast-2 y montarlo en el mismo clúster EC2. Dejar que el software de replicación realice la replicación de EFS a EFS

C. Crear una regla de CloudWatch Event por hora que dispare un clúster AWS Batch en eu-west-1 para realizar una replicación incremental. Replicar los datos en Amazon S3 en otra región. Crear una función Lambda en ap-southeast-2 para eventos PUT en Amazon S3 que dispare un comando SSM Run para copiar los archivos de S3 a EFS

D. Crear una regla de CloudWatch Event por hora que dispare un clúster AWS Batch en eu-west-1 para realizar una replicación incremental. Replicar los datos en Amazon S3 en otra región. Crear un clúster de replicación EC2 en ap-southeast-2 que lea desde Amazon S3 y copie los archivos a un clúster EFS en standby

**La respuesta:**

**A**

Explicación general

Correct option:

Crear un clúster de replicación gestionado por EC2 con Auto Scaling en eu-west-1. Escalar de acuerdo con una métrica personalizada que publicarías con la aplicación representando el retraso en las lecturas de archivos. Replicar los datos en Amazon S3 en ap-southeast-2. Crear otro clúster de replicación en ap-southeast-2 que lea desde Amazon S3 y copie los archivos a un clúster EFS en standby

Las métricas son el concepto fundamental en CloudWatch. Una métrica representa un conjunto de puntos de datos ordenados en el tiempo que se publican en CloudWatch. Piensa en una métrica como una variable a monitorear, y los puntos de datos representan los valores de esa variable a lo largo del tiempo. Puedes usar estas métricas para verificar que tu sistema está funcionando como se espera.

Using custom metrics for your Auto Scaling groups and instances: via - [https://docs.aws.amazon.com/autoscaling/ec2/userguide/as-scaling-target-tracking.html](https://docs.aws.amazon.com/autoscaling/ec2/userguide/as-scaling-target-tracking.html)

RPO and RTO explained: via - [https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/recovery-time-objective-rto-and-recovery-point-objective-rpo.html](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/recovery-time-objective-rto-and-recovery-point-objective-rpo.html)

Para el caso de uso dado, necesitamos crear una métrica personalizada vía la aplicación que capture el retraso en las lecturas de archivos y luego usarla para escalar el ASG que gestiona las instancias EC2 para replicar el clúster EFS origen hacia S3. Usar otro ASG para copiar los datos desde S3 hacia EFS en la región destino. Aquí queremos un RPO mínimo, por lo que necesitamos replicación continua, y un RTO mínimo, por lo que queremos un sistema EFS activo listo para usarse. Ten en cuenta que debido a que el RPO y RTO son bajos, el costo de la solución será muy alto.

Nota adicional (para tu conocimiento) el servicio AWS DataSync (no cubierto en el examen) puede lograr replicación EFS a EFS de una manera mucho más nativa.

Nota: Con esta solución, a medida que los archivos se copian a S3, los permisos de archivos de Linux no se replicarán.

Incorrect options:

Crear un clúster de replicación gestionado por EC2 con Auto Scaling en eu-west-1. Escalar de acuerdo con una métrica personalizada que publicarías con la aplicación representando el retraso en las lecturas de archivos. Crear un clúster EFS en standby en ap-southeast-2 y montarlo en el mismo clúster EC2. Dejar que el software de replicación realice la replicación de EFS a EFS - Como las VPC no están emparejadas, no es posible montar EFS de dos regiones diferentes en el mismo clúster EC2. Necesitamos usar S3 como intermediario para la replicación.

Crear una regla de CloudWatch Event por hora que dispare un clúster AWS Batch en eu-west-1 para realizar una replicación incremental. Replicar los datos en Amazon S3 en otra región. Crear un clúster de replicación EC2 en ap-southeast-2 que lea desde Amazon S3 y copie los archivos a un clúster EFS en standby

Crear una regla de CloudWatch Event por hora que dispare un clúster AWS Batch en eu-west-1 para realizar una replicación incremental. Replicar los datos en Amazon S3 en otra región. Crear una función Lambda en ap-southeast-2 para eventos PUT en Amazon S3 que dispare un comando SSM Run para copiar los archivos de S3 a EFS - Como el objetivo es tener una copia activa en EFS, ambas opciones se descartan ya que hay un retraso de una hora.

References:

[https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/recovery-time-objective-rto-and-recovery-point-objective-rpo.html](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/recovery-time-objective-rto-and-recovery-point-objective-rpo.html)

[https://docs.aws.amazon.com/autoscaling/ec2/userguide/as-scaling-target-tracking.html](https://docs.aws.amazon.com/autoscaling/ec2/userguide/as-scaling-target-tracking.html)

Temática

Domain 3: Resilient Cloud Solutions

#### Pregunta 35

El equipo DevOps en una empresa líder de billetera bitcoin y servicios de exchange está intentando desplegar una plantilla de CloudFormation que contiene una función Lambda, un bucket S3, un rol IAM y una tabla DynamoDB desde CodePipeline, pero el equipo está obteniendo una InsufficientCapabilitiesException.

Como AWS Certified DevOps Engineer Professional, ¿cuál de las siguientes opciones sugerirías para solucionar este problema?

A. Corregir la plantilla de CloudFormation ya que existe una dependencia circular y CloudFormation no tiene esa capacidad

B. Actualizar el rol IAM de CodePipeline para que tenga permisos para crear todos los recursos mencionados en la plantilla de CloudFormation

C. Incrementar los límites de servicio para tu bucket S3 ya que has alcanzado el límite

D. Habilitar la capacidad IAM en la configuración de CodePipeline para la acción de despliegue de CloudFormation

La respuesta:

D

Explicación general

Correct option:

Habilitar la capacidad IAM en la configuración de CodePipeline para la acción de despliegue de CloudFormation

Con AWS CloudFormation y CodePipeline, puedes usar entrega continua para construir y probar automáticamente cambios en tus plantillas de CloudFormation antes de promoverlas a stacks de producción. Por ejemplo, puedes crear un flujo de trabajo que automáticamente construya un stack de prueba cuando envías una plantilla actualizada a un repositorio de código. Después de que CloudFormation construya el stack de prueba, puedes probarlo y luego decidir si promover los cambios a un stack de producción. Usa CodePipeline para construir un flujo de entrega continua creando un pipeline para stacks de CloudFormation. CodePipeline tiene integración nativa con CloudFormation, por lo que puedes especificar acciones específicas de CloudFormation, como crear, actualizar o eliminar un stack dentro de un pipeline.

Puedes usar IAM con AWS CloudFormation para controlar qué pueden hacer los usuarios con CloudFormation, como si pueden ver plantillas de stack, crear stacks o eliminar stacks.

Para el caso de uso dado, InsufficientCapabilitiesException significa que el stack de CloudFormation está intentando crear un rol IAM pero no tiene las capacidades especificadas. Por lo tanto, debe configurarse en la configuración de CodePipeline para la acción de despliegue de CloudFormation.

via - [https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-iam-template.html](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-iam-template.html)

Incorrect options:

Actualizar el rol IAM de CodePipeline para que tenga permisos para crear todos los recursos mencionados en la plantilla de CloudFormation - La excepción dada no está relacionada con los permisos del usuario o del rol IAM de CodePipeline que ejecuta la plantilla de CloudFormation, por lo que esta opción es incorrecta.

Corregir la plantilla de CloudFormation ya que existe una dependencia circular y CloudFormation no tiene esa capacidad - Una dependencia circular, como su nombre lo indica, significa que dos recursos dependen entre sí o que un recurso depende de sí mismo.

via - [https://aws.amazon.com/blogs/infrastructure-and-automation/handling-circular-dependency-errors-in-aws-cloudformation/](https://aws.amazon.com/blogs/infrastructure-and-automation/handling-circular-dependency-errors-in-aws-cloudformation/)

Esta opción es incorrecta ya que una dependencia circular generaría otro error diferente.

Incrementar los límites de servicio para tu bucket S3 ya que has alcanzado el límite - Esta opción es un distractor ya que la excepción no tiene nada que ver con los límites de servicio de S3.

References:

[https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-iam-template.html#using-iam-capabilities](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-iam-template.html#using-iam-capabilities)

[https://aws.amazon.com/blogs/infrastructure-and-automation/handling-circular-dependency-errors-in-aws-cloudformation/](https://aws.amazon.com/blogs/infrastructure-and-automation/handling-circular-dependency-errors-in-aws-cloudformation/)

Temática

Domain 2: Configuration Management and IaC

#### Pregunta 36

Una plataforma de programación en línea desea personalizar completamente las tareas de build y ejecutar builds concurrentemente de forma automática para evitar la complejidad de gestionar entornos de build. El equipo DevOps de la empresa quiere usar CodeBuild para todas las tareas de build y desea que los artefactos creados por CodeBuild sean nombrados en función de la rama que se está probando. El equipo quiere que esta solución sea escalable a nuevas ramas con un mínimo esfuerzo adicional.

Como ingeniero DevOps, ¿cómo implementarías la solución más simple posible para este caso de uso?

A. Crear un archivo buildspec.yml único que será el mismo para cada rama y nombrará los artefactos de la misma manera. Cuando el artefacto sea cargado en S3, crear un evento de S3 que dispare una función Lambda que realizará una llamada API a CodeBuild, extraerá el nombre de la rama y renombrará el archivo en S3

B. Crear un archivo buildspec.yml que buscará la variable de entorno CODEBUILD_SOURCE_VERSION en tiempo de ejecución. Usar la variable en la sección artifacts de tu archivo buildspec.yml

C. Crear un archivo buildspec.yml que será diferente para cada rama. Crear un nuevo CodeBuild para cada rama. Al agregar una nueva rama, asegurarse de editar el archivo buildspec.yml

D. Crear un archivo buildspec.yml que buscará la variable de entorno BRANCH_NAME en tiempo de ejecución. Para cada rama existente y nueva, crear un CodeBuild separado y configurar la variable BRANCH_NAME en consecuencia. Usar la variable en la sección artifacts de tu archivo buildspec.yml

**La respuesta:**

**B**

Explicación general

Correct option:

Crear un archivo buildspec.yml que buscará la variable de entorno CODEBUILD_SOURCE_VERSION en tiempo de ejecución. Usar la variable en la sección artifacts de tu archivo buildspec.yml

AWS CodeBuild es un servicio completamente gestionado de integración continua en la nube. CodeBuild compila código fuente, ejecuta pruebas y produce paquetes listos para desplegar. CodeBuild elimina la necesidad de aprovisionar, gestionar y escalar tus propios servidores de build.

Un buildspec es una colección de comandos de build y configuraciones relacionadas, en formato YAML, que CodeBuild utiliza para ejecutar un build. Puedes incluir un buildspec como parte del código fuente o definirlo cuando creas un proyecto de build.

via - [https://docs.aws.amazon.com/codebuild/latest/userguide/build-spec-ref.html](https://docs.aws.amazon.com/codebuild/latest/userguide/build-spec-ref.html)

via - [https://docs.aws.amazon.com/codebuild/latest/userguide/build-spec-ref.html](https://docs.aws.amazon.com/codebuild/latest/userguide/build-spec-ref.html)

Para el caso de uso dado, necesitamos usar variables de entorno. La variable CODEBUILD_SOURCE_VERSION se expone en tiempo de ejecución directamente dentro de CodeBuild y representa el nombre de la rama del código que se está probando en CodeCommit. Esta es la mejor solución.

via - [https://docs.aws.amazon.com/codebuild/latest/userguide/build-env-ref-env-vars.html](https://docs.aws.amazon.com/codebuild/latest/userguide/build-env-ref-env-vars.html)

Incorrect options:

Crear un archivo buildspec.yml que buscará la variable de entorno BRANCH_NAME en tiempo de ejecución. Para cada rama existente y nueva, crear un CodeBuild separado y configurar la variable BRANCH_NAME en consecuencia. Usar la variable en la sección artifacts de tu archivo buildspec.yml - Proveer el nombre de la rama como BRANCH_NAME y crear CodeBuild separados sería muy tedioso de mantener y propenso a errores. Esta definitivamente no es la solución más simple.

Crear un archivo buildspec.yml que será diferente para cada rama. Crear un nuevo CodeBuild para cada rama. Al agregar una nueva rama, asegurarse de editar el archivo buildspec.yml - Mantener un buildspec.yml diferente para cada rama no es eficiente y es propenso a errores. Por lo tanto, esta opción es incorrecta.

Crear un archivo buildspec.yml único que será el mismo para cada rama y nombrará los artefactos de la misma manera. Cuando el artefacto sea cargado en S3, crear un evento de S3 que dispare una función Lambda que realizará una llamada API a CodeBuild, extraerá el nombre de la rama y renombrará el archivo en S3 - La opción que involucra una función Lambda funcionaría pero es altamente compleja. Esto se puede lograr directamente usando la variable de entorno CODEBUILD_SOURCE_VERSION.

References:

[https://docs.aws.amazon.com/codebuild/latest/userguide/build-spec-ref.html](https://docs.aws.amazon.com/codebuild/latest/userguide/build-spec-ref.html)

[https://docs.aws.amazon.com/codebuild/latest/userguide/build-env-ref-env-vars.html](https://docs.aws.amazon.com/codebuild/latest/userguide/build-env-ref-env-vars.html)

Temática

Domain 1: SDLC Automation

#### Pregunta 37

Una empresa minorista multinacional está planificando recuperación ante desastres y necesita que los datos se almacenen en Amazon S3 en dos regiones diferentes que estén en distintos continentes. Los datos se escriben a una alta tasa de 10000 objetos por segundo. Por razones regulatorias, los datos también deben estar encriptados en tránsito y en reposo. La empresa te ha contratado como AWS Certified DevOps Engineer Professional para construir una solución para este requerimiento.

¿Cuál de las siguientes soluciones recomendarías?

A. Crear una bucket policy para crear una condición que niegue cualquier solicitud que sea "aws:SecureTransport": "false". Encriptar los objetos en reposo usando SSE-KMS. Configurar Cross-Region Replication

B. Crear una bucket policy para crear una condición que niegue cualquier solicitud que sea "aws:SecureTransport": "true". Encriptar los objetos en reposo usando SSE-KMS. Configurar Cross-Region Replication

C. Crear una bucket policy para crear una condición que niegue cualquier solicitud que sea "aws:SecureTransport": "true". Encriptar los objetos en reposo usando SSE-S3. Configurar Cross-Region Replication

D. Crear una bucket policy para crear una condición que niegue cualquier solicitud que sea "aws:SecureTransport": "false". Encriptar los objetos en reposo usando SSE-S3. Configurar Cross-Region Replication

La respuesta:

D

Explicación general

Correct option:

Crear una bucket policy para crear una condición que niegue cualquier solicitud que sea "aws:SecureTransport": "false". Encriptar los objetos en reposo usando SSE-S3. Configurar Cross-Region Replication

Por defecto, Amazon S3 permite solicitudes tanto HTTP como HTTPS. Para cumplir con los requisitos, debes confirmar que las bucket policies nieguen explícitamente el acceso a solicitudes HTTP. Las bucket policies que permiten solicitudes HTTPS sin negar explícitamente HTTP pueden no cumplir con la regla.

Para determinar si una solicitud es HTTP o HTTPS en una bucket policy, usa una condición que verifique la clave "aws:SecureTransport". Cuando esta clave es true, significa que la solicitud se envía a través de HTTPS. Crea una bucket policy que niegue explícitamente el acceso cuando la solicitud cumpla la condición "aws:SecureTransport": "false". Esta política niega explícitamente las solicitudes HTTP.

Finalmente, si encriptamos usando KMS, podemos ser limitados (throttled) a 10000 objetos por segundo. SSE-S3 es una mejor opción en este caso.

Incorrect options:

Crear una bucket policy para crear una condición que niegue cualquier solicitud que sea "aws:SecureTransport": "true". Encriptar los objetos en reposo usando SSE-S3. Configurar Cross-Region Replication - Como se mencionó anteriormente, necesitas establecer la condición "aws:SecureTransport": "false" para que la solución funcione.

Crear una bucket policy para crear una condición que niegue cualquier solicitud que sea "aws:SecureTransport": "false". Encriptar los objetos en reposo usando SSE-KMS. Configurar Cross-Region Replication

Crear una bucket policy para crear una condición que niegue cualquier solicitud que sea "aws:SecureTransport": "true". Encriptar los objetos en reposo usando SSE-KMS. Configurar Cross-Region Replication

Si usamos KMS para encriptar, podemos ser limitados a 10000 objetos por segundo. Por lo tanto, ambas opciones son incorrectas.

References:

[https://aws.amazon.com/blogs/security/how-to-use-bucket-policies-and-apply-defense-in-depth-to-help-secure-your-amazon-s3-data/](https://aws.amazon.com/blogs/security/how-to-use-bucket-policies-and-apply-defense-in-depth-to-help-secure-your-amazon-s3-data/)

[https://docs.aws.amazon.com/kms/latest/developerguide/resource-limits.html](https://docs.aws.amazon.com/kms/latest/developerguide/resource-limits.html)

Temática

Domain 3: Resilient Cloud Solutions

#### Pregunta 38

Como parte del pipeline CI/CD, un ingeniero DevOps está realizando una prueba funcional usando una plantilla de CloudFormation que posteriormente será desplegada a producción. Esa plantilla de CloudFormation crea un bucket S3 y una función Lambda que transforma imágenes cargadas en S3 en miniaturas. Para probar la función Lambda, algunas imágenes se cargan automáticamente y se espera la salida de miniaturas desde la función Lambda en el bucket S3. Como parte de la limpieza de estas pruebas funcionales, el stack de CloudFormation se elimina, pero en este momento falla la eliminación.

¿Cuál es la razón y cómo podría solucionarse este problema?

A. El bucket S3 contiene archivos y por lo tanto no puede ser eliminado por CloudFormation. Agrega la propiedad Delete: Force a tu plantilla de CloudFormation para que el bucket S3 sea vaciado antes de eliminarse

B. Una StackPolicy impide que la plantilla de CloudFormation sea eliminada. Limpia la Stack Policy e intenta de nuevo

C. El bucket S3 contiene archivos y por lo tanto no puede ser eliminado por CloudFormation. Crear un recurso adicional Custom Resource respaldado por una función Lambda que realice la limpieza del bucket

D. La función Lambda todavía está usando el bucket S3 y CloudFormation no puede, por lo tanto, eliminar el bucket S3. Coloca una WaitCondition en la función Lambda para solucionar el problema

**La respuesta:**

**C**

Explicación general

Correct option:

El bucket S3 contiene archivos y por lo tanto no puede ser eliminado por CloudFormation. Crear un recurso adicional Custom Resource respaldado por una función Lambda que realice la limpieza del bucket

En una plantilla de CloudFormation, puedes usar el tipo de recurso AWS::CloudFormation::CustomResource o Custom::String para especificar recursos personalizados. Los recursos personalizados proporcionan una forma de escribir lógica de aprovisionamiento personalizada en la plantilla de CloudFormation y hacer que CloudFormation la ejecute durante una operación del stack, como cuando creas, actualizas o eliminas un stack.

Algunos recursos deben estar vacíos antes de poder ser eliminados. Por ejemplo, debes eliminar todos los objetos en un bucket de Amazon S3 o remover todas las instancias en un security group de Amazon EC2 antes de poder eliminar el bucket o el security group.

Para este caso de uso, el problema es que el bucket S3 no está vacío antes de ser eliminado, por lo que debes implementar un Custom Resource respaldado por Lambda que limpie el bucket por ti.

via - [https://docs.amazonaws.cn/en_us/AWSCloudFormation/latest/UserGuide/aws-resource-cfn-customresource.html](https://docs.amazonaws.cn/en_us/AWSCloudFormation/latest/UserGuide/aws-resource-cfn-customresource.html)

Incorrect options:

La función Lambda todavía está usando el bucket S3 y CloudFormation no puede, por lo tanto, eliminar el bucket S3. Coloca una WaitCondition en la función Lambda para solucionar el problema - CloudFormation puede eliminar recursos aunque estén siendo usados, y una WaitCondition puede adjuntarse a instancias EC2 y Auto Scaling Groups y NO a funciones Lambda. AWS además recomienda que para recursos de Amazon EC2 y Auto Scaling uses un atributo CreationPolicy en lugar de wait conditions. Agrega un atributo CreationPolicy a esos recursos y usa el script auxiliar cfn-signal para señalar cuando un proceso de creación de instancia ha completado exitosamente.

El bucket S3 contiene archivos y por lo tanto no puede ser eliminado por CloudFormation. Agrega la propiedad Delete: Force a tu plantilla de CloudFormation para que el bucket S3 sea vaciado antes de eliminarse - Esta opción es un distractor. No puedes usar Delete: Force ya que no es una funcionalidad de CloudFormation.

Una StackPolicy impide que la plantilla de CloudFormation sea eliminada. Limpia la Stack Policy e intenta de nuevo - Una stack policy es un documento JSON que define las acciones de actualización que pueden realizarse sobre recursos designados. Las stack policies solo se usan durante actualizaciones del stack.

References:

[https://docs.amazonaws.cn/en_us/AWSCloudFormation/latest/UserGuide/aws-resource-cfn-customresource.html](https://docs.amazonaws.cn/en_us/AWSCloudFormation/latest/UserGuide/aws-resource-cfn-customresource.html)

[https://stackoverflow.com/questions/40383470/can-i-force-cloudformation-to-delete-non-empty-s3-bucket](https://stackoverflow.com/questions/40383470/can-i-force-cloudformation-to-delete-non-empty-s3-bucket)

Temática

Domain 2: Configuration Management and IaC

#### Pregunta 39

Una empresa de comercio electrónico ha desplegado su aplicación principal en dos Auto Scaling groups (ASG) y dos Application Load Balancers (ALB). Tienen un registro de Route 53 que apunta al grupo ALB+ASG donde la aplicación ha sido desplegada más recientemente. Los despliegues van alternándose entre los dos grupos, y cada vez que ocurre un despliegue se hace sobre el grupo ALB+ASG inactivo. Finalmente, el registro de Route 53 se actualiza. Resulta que algunos de sus clientes no se están comportando correctamente respecto al registro DNS y por lo tanto están haciendo solicitudes al grupo ALB+ASG inactivo.

La empresa desea mejorar este comportamiento con un costo mínimo y también reducir la complejidad de la solución. La empresa te ha contratado como AWS Certified DevOps Engineer Professional para construir una solución para este requerimiento. ¿Cuál de las siguientes opciones sugerirías?

A. Eliminar un ALB y mantener los dos ASG. Cuando ocurran nuevos despliegues, desplegar al ASG anterior, y luego intercambiar el target group en la regla del ALB. Mantener el registro de Route53 apuntando al ALB

B. Desplegar la aplicación en Elastic Beanstalk bajo dos entornos. Para hacer un despliegue, desplegar al entorno anterior, luego realizar un CNAME swap

C. Desplegar un conjunto de proxies NGINX en cada instancia de aplicación para que si las solicitudes se hacen a través del ALB inactivo, sean reenviadas al ALB correcto

D. Cambiar el TTL de Route53 a 1 minuto antes de hacer un despliegue. Hacer el despliegue y luego incrementar el TTL nuevamente al valor anterior

**La respuesta:**

**A**

Explicación general

Correct option:

Eliminar un ALB y mantener los dos ASG. Cuando ocurran nuevos despliegues, desplegar al ASG anterior, y luego intercambiar el target group en la regla del ALB. Mantener el registro de Route53 apuntando al ALB

Un ALB distribuye el tráfico entrante de la aplicación entre múltiples destinos, como instancias EC2, en múltiples Availability Zones. Un listener verifica solicitudes de conexión de los clientes usando el protocolo y puerto que configures. Las reglas que definas para un listener determinan cómo el load balancer enruta las solicitudes hacia sus destinos registrados. Cada target group enruta solicitudes hacia uno o más destinos registrados, como instancias EC2, usando el protocolo y número de puerto que especifiques. Puedes registrar un destino con múltiples target groups.

via - [https://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html)

El problema ocurre por usar el segundo load balancer para el segundo stack de aplicación y luego cambiar la ruta DNS para dirigir el tráfico al otro stack cuando es necesario. La solución correcta es reemplazar únicamente la infraestructura detrás del load balancer. En resumen, podemos migrar a un solo ALB y luego usar solo un target group a la vez detrás de cada ASG para un enrutamiento correcto. Esto además tiene el beneficio adicional de que no necesitaremos pre-warm cada ALB en cada despliegue.

via - [https://aws.amazon.com/blogs/aws/new-application-load-balancer-simplifies-deployment-with-weighted-target-groups/](https://aws.amazon.com/blogs/aws/new-application-load-balancer-simplifies-deployment-with-weighted-target-groups/)

Incorrect options:

Desplegar un conjunto de proxies NGINX en cada instancia de aplicación para que si las solicitudes se hacen a través del ALB inactivo, sean reenviadas al ALB correcto - Desplegar un proxy NGINX funcionaría pero sería tedioso de gestionar y complicaría los despliegues.

Cambiar el TTL de Route53 a 1 minuto antes de hacer un despliegue. Hacer el despliegue y luego incrementar el TTL nuevamente al valor anterior - Cambiar el TTL no ayudará porque los clientes ya se están comportando incorrectamente respecto a cómo manejan los registros DNS.

Desplegar la aplicación en Elastic Beanstalk bajo dos entornos. Para hacer un despliegue, desplegar al entorno anterior, luego realizar un CNAME swap - Migrar a Elastic Beanstalk tampoco ayudará ya que un CNAME swap es un cambio de registro DNS y los clientes no parecen respetar las respuestas DNS.

References:

[https://aws.amazon.com/blogs/aws/new-application-load-balancer-simplifies-deployment-with-weighted-target-groups/](https://aws.amazon.com/blogs/aws/new-application-load-balancer-simplifies-deployment-with-weighted-target-groups/)

[https://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html)

Temática

Domain 3: Resilient Cloud Solutions

#### Pregunta 40

Una empresa de analítica de datos desea crear una solución automatizada para ser alertada en caso de que instancias EC2 estén subutilizadas por más de 24 horas con el fin de ahorrar costos. La solución debe requerir una intervención manual de un operador validando la evaluación antes de proceder con la terminación de la instancia.

Como ingeniero DevOps, ¿cómo implementarías una solución con el MENOR esfuerzo de desarrollo?

A. Habilitar Trusted Advisor y asegurar que la verificación de instancias EC2 subutilizadas esté activa. Conectar Trusted Advisor a un topic SNS para esa verificación y usar una función Lambda como suscriptor del topic SNS. La función Lambda debería disparar un documento SSM Automation con un paso de aprobación manual. Tras la aprobación, el documento SSM procede con la terminación de la instancia

B. Crear una regla de CloudWatch Event que se dispare cada 5 minutos y usar una función Lambda como target. La función Lambda debería hacer llamadas API a métricas de CloudWatch y almacenar la información en DynamoDB. Usar un stream de DynamoDB para detectar un evento de subutilización durante 24 horas y disparar una función Lambda. La función Lambda debería disparar un documento SSM Automation con un paso de aprobación manual. Tras la aprobación, el documento SSM procede con la terminación de la instancia

C. Crear una alarma de CloudWatch que rastree la utilización mínima de CPU entre todas tus instancias EC2. Conectar la alarma a un topic SNS y usar la función Lambda como suscriptor del topic SNS. La función Lambda debería disparar un documento SSM Automation con un paso de aprobación manual. Tras la aprobación, el documento SSM procede con la terminación de la instancia

D. Habilitar Trusted Advisor y asegurar que la verificación de instancias EC2 subutilizadas esté activa. Crear un CloudWatch Event que rastree los eventos generados por Trusted Advisor y usar una función Lambda como target para ese evento. La función Lambda debería disparar un documento SSM Automation con un paso de aprobación manual. Tras la aprobación, el documento SSM procede con la terminación de la instancia

**La respuesta:**

**D**

Explicación general

Correct option:

Habilitar Trusted Advisor y asegurar que la verificación de instancias EC2 subutilizadas esté activa. Crear un CloudWatch Event que rastree los eventos generados por Trusted Advisor y usar una función Lambda como target para ese evento. La función Lambda debería disparar un documento SSM Automation con un paso de aprobación manual. Tras la aprobación, el documento SSM procede con la terminación de la instancia

Trusted Advisor inspecciona tu infraestructura de AWS en todas las regiones y presenta un resumen de resultados de verificaciones. Recomienda detener o terminar instancias EC2 con baja utilización. También puedes elegir escalar tus instancias usando Amazon EC2 Auto Scaling.

La verificación de optimización de costos de Trusted Advisor permite revisar instancias EC2 que han estado ejecutándose en cualquier momento durante los últimos 14 días y alerta si la utilización diaria de CPU fue 10% o menos y el I/O de red fue 5 MB o menos durante 4 o más días. Las instancias en ejecución generan cargos por hora. Los ahorros mensuales estimados se calculan usando la tasa actual de instancias On-Demand y el número estimado de días en que la instancia podría estar subutilizada.

Puedes usar Amazon CloudWatch Events para detectar y reaccionar a cambios en el estado de verificaciones de Trusted Advisor. Luego, basado en las reglas que crees, CloudWatch Events invoca una o más acciones objetivo cuando el estado de la verificación cambia al valor que especifiques. Dependiendo del tipo de cambio de estado, puedes enviar notificaciones, capturar información, tomar acciones correctivas o iniciar otros eventos. Finalmente, SSM Automation puede incluir un paso de aprobación manual y proceder con la terminación de instancias.

Monitoring Trusted Advisor check results with Amazon CloudWatch Events: via - [https://docs.aws.amazon.com/awssupport/latest/user/cloudwatch-events-ta.html](https://docs.aws.amazon.com/awssupport/latest/user/cloudwatch-events-ta.html)

Incorrect options:

Habilitar Trusted Advisor y asegurar que la verificación de instancias EC2 subutilizadas esté activa. Conectar Trusted Advisor a un topic SNS para esa verificación y usar una función Lambda como suscriptor del topic SNS. La función Lambda debería disparar un documento SSM Automation con un paso de aprobación manual. Tras la aprobación, el documento SSM procede con la terminación de la instancia - Debes usar CloudWatch Events para rastrear eventos de Trusted Advisor y no SNS directamente.

Crear una regla de CloudWatch Event que se dispare cada 5 minutos y usar una función Lambda como target. La función Lambda debería hacer llamadas API a métricas de CloudWatch y almacenar la información en DynamoDB. Usar un stream de DynamoDB para detectar un evento de subutilización durante 24 horas y disparar una función Lambda. La función Lambda debería disparar un documento SSM Automation con un paso de aprobación manual. Tras la aprobación, el documento SSM procede con la terminación de la instancia - Este flujo implica mucho esfuerzo de desarrollo y usa recursos innecesarios como DynamoDB Streams.

Crear una alarma de CloudWatch que rastree la utilización mínima de CPU entre todas tus instancias EC2. Conectar la alarma a un topic SNS y usar la función Lambda como suscriptor del topic SNS. La función Lambda debería disparar un documento SSM Automation con un paso de aprobación manual. Tras la aprobación, el documento SSM procede con la terminación de la instancia - Una alarma agregada no permite evaluar correctamente cada instancia individual y crear una alarma por instancia sería costoso.

References:

[https://docs.aws.amazon.com/awssupport/latest/user/cloudwatch-events-ta.html](https://docs.aws.amazon.com/awssupport/latest/user/cloudwatch-events-ta.html)

[https://aws.amazon.com/premiumsupport/technology/trusted-advisor/best-practice-checklist/](https://aws.amazon.com/premiumsupport/technology/trusted-advisor/best-practice-checklist/)

Temática

Domain 6: Security and Compliance

#### Pregunta 41

Una empresa de soluciones de streaming multimedia ha desplegado una aplicación que permite a sus clientes ver películas en tiempo real. La aplicación se conecta a una base de datos Amazon Aurora, y todo el stack está actualmente desplegado en Estados Unidos. La empresa tiene planes de expandirse a Europa y Asia para sus operaciones. Necesita que la tabla movies sea accesible globalmente, pero las tablas users y movies_watched sean solo regionales.

Como ingeniero DevOps, ¿cómo implementarías esto con el mínimo refactor posible de la aplicación?

A. Usar una Amazon Aurora Global Database para la tabla movies y usar DynamoDB para las tablas users y movies_watched

B. Usar una DynamoDB Global Table para la tabla movies y usar DynamoDB para las tablas users y movies_watched

C. Usar una Amazon Aurora Global Database para la tabla movies y usar Amazon Aurora para las tablas users y movies_watched

D. Usar una DynamoDB Global Table para la tabla movies y usar Amazon Aurora para las tablas users y movies_watched

**La respuesta:**

**C**

Explicación general

Correct option:

Usar una Amazon Aurora Global Database para la tabla movies y usar Amazon Aurora para las tablas users y movies_watched

Amazon Aurora es una base de datos relacional compatible con MySQL y PostgreSQL construida para la nube, que combina el rendimiento y la disponibilidad de bases de datos empresariales tradicionales con la simplicidad y rentabilidad del código abierto. Amazon Aurora tiene un sistema de almacenamiento distribuido, tolerante a fallos y autorreparable que escala automáticamente hasta 64 TB por instancia de base de datos. Aurora no es una base de datos en memoria.

Amazon Aurora Global Database está diseñada para aplicaciones distribuidas globalmente, permitiendo que una sola base de datos Amazon Aurora abarque múltiples regiones AWS. Replica tus datos sin impacto en el rendimiento de la base de datos, permite lecturas locales rápidas con baja latencia en cada región y proporciona recuperación ante desastres frente a fallos regionales. Amazon Aurora Global Database es la opción correcta para este caso de uso.

Para este caso de uso, por lo tanto, necesitamos tener dos clústeres Aurora, uno para la tabla global (tabla movies) y otro para las tablas locales (users y movies_watched).

Incorrect options:

Usar una Amazon Aurora Global Database para la tabla movies y usar DynamoDB para las tablas users y movies_watched

Usar una DynamoDB Global Table para la tabla movies y usar Amazon Aurora para las tablas users y movies_watched

Usar una DynamoDB Global Table para la tabla movies y usar DynamoDB para las tablas users y movies_watched

Aquí se busca un refactor mínimo de la aplicación. DynamoDB y Aurora tienen APIs completamente diferentes, ya que Aurora es SQL y DynamoDB es NoSQL. Por lo tanto, las tres opciones son incorrectas, ya que incluyen DynamoDB como uno de los componentes.

Reference:

[https://aws.amazon.com/rds/aurora/faqs/](https://aws.amazon.com/rds/aurora/faqs/)

Temática

Domain 3: Resilient Cloud Solutions

#### Pregunta 42

Una empresa de comercio electrónico desea automatizar el parcheo de su flota híbrida y distribuir algunos parches a través de sus repositorios internos de parches cada semana. Como ingeniero DevOps en la empresa, se te ha encargado implementar esto de la forma más eficiente posible.

¿Cuál de las siguientes opciones representa la MEJOR solución para cumplir con este requerimiento?

A. Usando SSM, ejecutar un RunCommand para instalar los repositorios personalizados en los archivos de configuración internos del sistema operativo. Usar el Default Patch Baseline. Definir una Maintenance Window e incluir el Run Command RunPatchBaseline. Programar la maintenance window con recurrencia semanal

B. Administrar tus instancias con AWS OpsWorks. Definir una maintenance window y definir cookbooks personalizados de Chef para el lifecycle hook de "configure" que aplicarán parches a las instancias desde los repositorios internos de parches. Programar la ventana con recurrencia semanal

C. Usando SSM Parameter Store, configurar los repositorios personalizados en los archivos de configuración internos del sistema operativo. Usar el Default Patch Baseline. Definir una Maintenance Window e incluir el Run Command RunPatchBaseline. Programar la maintenance window con recurrencia semanal

D. Usando SSM, implementar un Custom Patch Baseline. Definir una Maintenance Window e incluir el Run Command RunPatchBaseline. Programar la maintenance window con recurrencia semanal

**La respuesta:**

**D**

Explicación general

Correct option:

Usando SSM, implementar un Custom Patch Baseline. Definir una Maintenance Window e incluir el Run Command RunPatchBaseline. Programar la maintenance window con recurrencia semanal

SSM Patch Manager automatiza el proceso de aplicar parches a instancias administradas con actualizaciones relacionadas con seguridad y otros tipos de actualizaciones. Puedes usar Patch Manager para aplicar parches tanto a sistemas operativos como a aplicaciones. Patch Manager utiliza patch baselines, que incluyen reglas para autoaprobar parches dentro de ciertos días desde su publicación, así como una lista de parches aprobados y rechazados.

via - [https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-patch.html](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-patch.html)

Patch Manager proporciona patch baselines predefinidos para cada uno de los sistemas operativos soportados por Patch Manager. Puedes usar estos baselines tal como están configurados actualmente (no puedes personalizarlos) o puedes crear tus propios custom patch baselines. Los custom patch baselines te permiten tener mayor control sobre qué parches son aprobados o rechazados en tu entorno.

Cuando usas los repositorios por defecto configurados en una instancia para operaciones de parcheo, Patch Manager escanea o instala parches relacionados con seguridad. Este es el comportamiento por defecto de Patch Manager.

Sin embargo, en sistemas Linux también puedes usar Patch Manager para instalar parches que no están relacionados con seguridad, o que provienen de un repositorio fuente distinto al configurado por defecto en la instancia. Puedes especificar repositorios alternativos de origen de parches cuando creas un custom patch baseline. En cada custom patch baseline, puedes especificar configuraciones de origen de parches para hasta 20 versiones de un sistema operativo Linux soportado. Luego puedes configurar una maintenance window semanal e incluir el Run Command RunPatchBaseline.

via - [https://docs.aws.amazon.com/systems-manager/latest/userguide/sysman-patch-baselines.html](https://docs.aws.amazon.com/systems-manager/latest/userguide/sysman-patch-baselines.html)

Incorrect options:

Usando SSM Parameter Store, configurar los repositorios personalizados en los archivos de configuración internos del sistema operativo. Usar el Default Patch Baseline. Definir una Maintenance Window e incluir el Run Command RunPatchBaseline. Programar la maintenance window con recurrencia semanal - SSM Parameter Store se usa para almacenar valores de parámetros, pero no puede escribir archivos de configuración en instancias EC2 por sí mismo.

Administrar tus instancias con AWS OpsWorks. Definir una maintenance window y definir cookbooks personalizados de Chef para el lifecycle hook de "configure" que aplicarán parches a las instancias desde los repositorios internos de parches. Programar la ventana con recurrencia semanal - Usar cookbooks de Chef mediante OpsWorks podría funcionar, pero Patch Manager de SSM es una mejor forma de lograr esto.

Usando SSM, ejecutar un RunCommand para instalar los repositorios personalizados en los archivos de configuración internos del sistema operativo. Usar el Default Patch Baseline. Definir una Maintenance Window e incluir el Run Command RunPatchBaseline. Programar la maintenance window con recurrencia semanal - Usar SSM RunCommand podría funcionar, pero Patch Manager de SSM es una mejor forma de lograr esto.

References:

[https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-patch.html](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-patch.html)

[https://docs.aws.amazon.com/systems-manager/latest/userguide/sysman-patch-baselines.html](https://docs.aws.amazon.com/systems-manager/latest/userguide/sysman-patch-baselines.html)

[https://docs.aws.amazon.com/systems-manager/latest/userguide/patch-manager-how-it-works-alt-source-repository.html](https://docs.aws.amazon.com/systems-manager/latest/userguide/patch-manager-how-it-works-alt-source-repository.html)

Temática

Domain 6: Security and Compliance

#### Pregunta 43

El departamento de cumplimiento en una firma de trading de Wall Street te ha contratado como AWS Certified DevOps Engineer Professional para ayudar con varias iniciativas estratégicas DevOps. El departamento te ha pedido que generes una lista de todos los paquetes de software instalados en las instancias EC2. La solución debe ser capaz de extenderse a futuras instancias en la cuenta AWS y enviar notificaciones si las instancias no están configuradas correctamente para rastrear su software.

¿Cuáles de las siguientes opciones son las mejores soluciones que requieren el menor esfuerzo para cumplir con los requisitos? (Selecciona dos)

A. Usar AWS Inspector para rastrear la lista de paquetes instalados en tus instancias EC2. Visualizar los metadatos directamente en la consola AWS Inspector Insights

B. Instalar el agente SSM en las instancias. Ejecutar una SSM Automation durante maintenance windows para obtener la lista de todos los paquetes usando yum list installed. Escribir la salida en Amazon S3

C. Instalar el agente SSM en las instancias. Ejecutar SSM Inventory para recolectar los metadatos y enviarlos a Amazon S3

D. Crear una regla de CloudWatch Event para disparar una función Lambda de forma horaria. Hacer una comparación de las instancias que están corriendo en EC2 y aquellas rastreadas por SSM

E. Usar un SSM Run Command para que el servicio SSM encuentre qué instancias no están siendo rastreadas actualmente por SSM

La respuesta:

C, D

Explicación general

Correct options:

Instalar el agente SSM en las instancias. Ejecutar SSM Inventory para recolectar los metadatos y enviarlos a Amazon S3

SSM Agent es un software de Amazon que puede instalarse y configurarse en una instancia EC2, un servidor on-premises o una máquina virtual. SSM Agent permite que Systems Manager actualice, administre y configure estos recursos. El agente procesa solicitudes del servicio Systems Manager en la nube de AWS y luego las ejecuta según lo especificado. Posteriormente, envía información de estado y ejecución de vuelta al servicio Systems Manager usando Amazon Message Delivery Service (prefijo de servicio: ec2messages).

SSM Inventory proporciona visibilidad sobre tu entorno de cómputo en Amazon EC2 y on-premises. Puedes usar Inventory para recolectar metadatos de tus instancias administradas. Puedes almacenar estos metadatos en un bucket central de Amazon S3 y luego usar herramientas integradas para consultar los datos y determinar rápidamente qué instancias están ejecutando el software requerido y cuáles necesitan ser actualizadas.

Sample Inventory Cards: via - [https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-inventory.html](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-inventory.html)

Crear una regla de CloudWatch Event para disparar una función Lambda de forma horaria. Hacer una comparación de las instancias que están corriendo en EC2 y aquellas rastreadas por SSM

Dado que SSM no tiene una capacidad nativa para identificar qué instancias no están siendo rastreadas, se necesita una función Lambda personalizada para comparar las instancias EC2 con las instancias administradas por SSM y enviar notificaciones si hay diferencias. Esta función puede ser disparada usando CloudWatch Events.

Incorrect options:

Usar un SSM Run Command para que el servicio SSM encuentre qué instancias no están siendo rastreadas actualmente por SSM - SSM no tiene una capacidad nativa para identificar instancias no rastreadas.

Instalar el agente SSM en las instancias. Ejecutar una SSM Automation durante maintenance windows para obtener la lista de todos los paquetes usando yum list installed. Escribir la salida en Amazon S3 - Aunque esto funcionaría, requiere más esfuerzo manual comparado con SSM Inventory.

Usar AWS Inspector para rastrear la lista de paquetes instalados en tus instancias EC2. Visualizar los metadatos directamente en la consola AWS Inspector Insights - Inspector está diseñado para encontrar vulnerabilidades de seguridad, no para listar metadatos de paquetes instalados.

References:

[https://docs.aws.amazon.com/systems-manager/latest/userguide/ssm-agent.html](https://docs.aws.amazon.com/systems-manager/latest/userguide/ssm-agent.html)

[https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-inventory.html](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-inventory.html)

[https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-automation.html](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-automation.html)

Temática

Domain 4: Monitoring and Logging

#### Pregunta 44

Una empresa de analítica está capturando métricas de sus servicios y aplicaciones en AWS usando métricas de CloudWatch. Necesita poder retroceder hasta 7 años en el tiempo para visualizar estas métricas debido a requisitos regulatorios. Como ingeniero DevOps en la empresa, se te ha encargado diseñar una solución que ayude a la empresa a cumplir con las regulaciones.

¿Cuál de las siguientes opciones requiere el menor esfuerzo de desarrollo para cumplir con los requisitos?

A. Crear un dashboard de CloudWatch sobre métricas de CloudWatch. Habilitar "Extended Retention" en métricas de CloudWatch, e implementar una regla de AWS Config que verifique esta configuración. Si AWS Config detecta incumplimiento, usar Auto Remediation para activarlo nuevamente

B. Crear un stream de métricas de CloudWatch y dirigirlo a un delivery stream de Kinesis Firehose. Enviar todos los datos de métricas a S3 usando Firehose, y crear un dashboard de QuickSight para visualizar las métricas. Usar Athena para consultar rangos de tiempo específicos

C. Crear una regla de CloudWatch Event que se dispare cada 15 minutos. El target debe ser una función Lambda que ejecute una API para exportar métricas y almacenarlas en S3. Crear un dashboard de CloudWatch sobre las métricas en S3

D. Crear una regla de CloudWatch Event que se dispare cada 15 minutos. El target debe ser una función Lambda que ejecute una API para exportar métricas y almacenarlas en Amazon ES. Crear un dashboard en Kibana para visualizar las métricas

**La respuesta:**

**B**

Explicación general

Correct option:

Crear un stream de métricas de CloudWatch y dirigirlo a un delivery stream de Kinesis Firehose. Enviar todos los datos de métricas a S3 usando Firehose, y crear un dashboard de QuickSight para visualizar las métricas. Usar Athena para consultar rangos de tiempo específicos

Puedes usar metric streams para transmitir continuamente métricas de CloudWatch hacia un destino de tu elección con entrega casi en tiempo real y baja latencia. Los destinos soportados incluyen servicios de AWS como Amazon S3 y también servicios de terceros.

Puedes crear un metric stream y dirigirlo a un delivery stream de Amazon Kinesis Data Firehose que entregue las métricas de CloudWatch a un data lake como Amazon S3. Luego puedes usar herramientas como Amazon Athena para obtener insights sobre optimización de costos, rendimiento y utilización de recursos para rangos de tiempo específicos. Además, puedes usar un dashboard de QuickSight para visualizar las métricas.

El delivery stream de Kinesis Data Firehose debe confiar en CloudWatch mediante un rol IAM que tenga permisos de escritura hacia Firehose. Estos permisos pueden limitarse al delivery stream específico que utiliza el metric stream. El rol IAM debe confiar en el principal de servicio streams.metrics.cloudwatch.amazonaws.com.

Incorrect options:

Crear una regla de CloudWatch Event que se dispare cada 15 minutos. El target debe ser una función Lambda que ejecute una API para exportar métricas y almacenarlas en Amazon ES. Crear un dashboard en Kibana para visualizar las métricas

Una métrica de CloudWatch representa un conjunto de puntos de datos ordenados en el tiempo que se publican en CloudWatch. Los puntos de datos expiran automáticamente después de 15 meses en un esquema continuo; a medida que llegan nuevos datos, los más antiguos se eliminan.

via - [https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch_concepts.html](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch_concepts.html)

Dado que las métricas de CloudWatch solo se retienen por 15 meses, necesitamos exportarlas para almacenamiento a largo plazo. Aunque esta opción funcionaría, requiere desarrollar una función Lambda personalizada, lo que implica mayor esfuerzo.

Crear un dashboard de CloudWatch sobre métricas de CloudWatch. Habilitar "Extended Retention" en métricas de CloudWatch, e implementar una regla de AWS Config que verifique esta configuración. Si AWS Config detecta incumplimiento, usar Auto Remediation para activarlo nuevamente - CloudWatch no tiene una funcionalidad de "Extended Retention".

Crear una regla de CloudWatch Event que se dispare cada 15 minutos. El target debe ser una función Lambda que ejecute una API para exportar métricas y almacenarlas en S3. Crear un dashboard de CloudWatch sobre las métricas en S3 - Los dashboards de CloudWatch solo pueden consumir métricas de CloudWatch, no datos almacenados en S3.

References:

[https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch-Metric-Streams.html](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch-Metric-Streams.html)

[https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch-metric-streams-trustpolicy.html](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch-metric-streams-trustpolicy.html)

[https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch_concepts.html](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch_concepts.html)

[https://aws.amazon.com/elasticsearch-service/](https://aws.amazon.com/elasticsearch-service/)

[https://aws.amazon.com/elasticsearch-service/the-elk-stack/](https://aws.amazon.com/elasticsearch-service/the-elk-stack/)

Temática

Domain 4: Monitoring and Logging

#### Pregunta 45

Una empresa minorista multinacional está operando una estrategia multi-cuenta usando AWS Organizations. Cada cuenta produce logs en CloudWatch Logs y la empresa desea agregar estos logs en una sola cuenta centralizada para fines de archivado. Necesita que la solución sea segura y centralizada. El destino objetivo para los logs debe requerir poco o ningún aprovisionamiento en el lado de almacenamiento.

Como ingeniero DevOps, ¿cómo implementarías una solución para cumplir con estos requisitos?

A. Crear un log destination en la cuenta centralizada, y crear una suscripción de logs hacia ese destino. Crear un Kinesis Firehose delivery stream y suscribirlo al log destination. El destino de Kinesis Firehose debe ser Amazon S3

B. Crear un log destination en la cuenta centralizada, y crear una suscripción de logs hacia ese destino. Crear un Kinesis Streams y suscribirlo al destino. Crear un Kinesis Firehose delivery stream y suscribirlo al Kinesis Stream. El destino de Firehose debe ser Amazon Redshift

C. Crear un log destination en la cuenta centralizada, y crear una suscripción de logs hacia ese destino. Crear un Kinesis Streams y suscribirlo al destino. Crear un Kinesis Firehose delivery stream y suscribirlo al Kinesis Stream. El destino de Firehose debe ser Amazon ES

D. Crear un log destination en la cuenta centralizada, y crear una suscripción de logs hacia ese destino. Crear una función Lambda en esa suscripción de logs, e implementar un script para enviar los datos a Amazon ES

La respuesta:

A

Explicación general

Correct option:

Crear un log destination en la cuenta centralizada, y crear una suscripción de logs hacia ese destino. Crear un Kinesis Firehose delivery stream y suscribirlo al log destination. El destino de Kinesis Firehose debe ser Amazon S3

Puedes usar suscripciones para obtener acceso a un flujo en tiempo real de eventos de logs desde CloudWatch Logs y enviarlos a otros servicios como Amazon Kinesis, Amazon Kinesis Data Firehose o AWS Lambda para procesamiento, análisis o carga en otros sistemas. Cuando los eventos de logs se envían al servicio receptor, están codificados en Base64 y comprimidos con gzip.

Para compartir datos de logs entre cuentas mediante suscripciones, puedes colaborar con otra cuenta AWS y recibir sus eventos de logs en tus propios recursos, como un stream de Kinesis o Kinesis Data Firehose (esto se conoce como cross-account data sharing). Por ejemplo, estos datos pueden leerse desde un stream centralizado de Kinesis o Firehose para realizar procesamiento o análisis. Por lo tanto, debemos suscribir el log destination a un Kinesis Firehose delivery stream, que a su vez tenga como destino S3.

via - [https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CrossAccountSubscriptions.html](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CrossAccountSubscriptions.html)

Incorrect options:

Crear un log destination en la cuenta centralizada, y crear una suscripción de logs hacia ese destino. Crear un Kinesis Streams y suscribirlo al destino. Crear un Kinesis Firehose delivery stream y suscribirlo al Kinesis Stream. El destino de Firehose debe ser Amazon Redshift - El problema es que Amazon Redshift no es un servicio serverless y requiere aprovisionamiento.

Crear un log destination en la cuenta centralizada, y crear una suscripción de logs hacia ese destino. Crear un Kinesis Streams y suscribirlo al destino. Crear un Kinesis Firehose delivery stream y suscribirlo al Kinesis Stream. El destino de Firehose debe ser Amazon ES - El problema es que Amazon ES no es un servicio serverless y requiere aprovisionamiento.

Crear un log destination en la cuenta centralizada, y crear una suscripción de logs hacia ese destino. Crear una función Lambda en esa suscripción de logs, e implementar un script para enviar los datos a Amazon ES - Aunque podría funcionar, Amazon ES requiere aprovisionamiento y además añade complejidad innecesaria.

References:

[https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CrossAccountSubscriptions.html](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CrossAccountSubscriptions.html)

[https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/Subscriptions.html](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/Subscriptions.html)

Temática

Domain 4: Monitoring and Logging

#### Pregunta 46

Una empresa de comercio electrónico está gestionando todo su stack de aplicación e infraestructura usando AWS OpsWorks Stacks. El equipo DevOps ha notado que muchas instancias han sido reemplazadas automáticamente en el stack y el equipo desea ser notificado vía Slack cuando estos eventos ocurran.

Como AWS Certified DevOps Engineer Professional, ¿cuál de las siguientes opciones implementarías para cumplir con este requerimiento?

A. Crear una regla de CloudWatch Events para aws.opsworks y establecer el campo initiated_by a auto-healing. Configurar como target una función Lambda que enviará notificaciones al canal de Slack

B. Crear una regla de CloudWatch Events para aws.opsworks y establecer el campo initiated_by a auto-scaling. Habilitar la integración de Slack en CloudWatch Events para enviar las notificaciones

C. Crear una regla de CloudWatch Events para aws.opsworks y establecer el campo initiated_by a auto-scaling. Configurar como target una función Lambda que enviará notificaciones al canal de Slack

D. Suscribir las notificaciones de auto-healing de OpsWorks a un topic SNS. Suscribir una función Lambda que enviará notificaciones al canal de Slack

**La respuesta:**

**A**

Explicación general

Correct option:

Crear una regla de CloudWatch Events para aws.opsworks y establecer el campo initiated_by a auto-healing. Configurar como target una función Lambda que enviará notificaciones al canal de Slack

AWS OpsWorks es un servicio de gestión de configuración que proporciona instancias administradas de Chef y Puppet. Estas plataformas permiten automatizar configuraciones de servidores usando código. OpsWorks permite automatizar cómo los servidores se configuran, despliegan y gestionan en instancias EC2 o entornos on-premises.

Un stack es la entidad de más alto nivel en OpsWorks Stacks. Representa un conjunto de instancias que se gestionan de manera conjunta. Cada stack contiene una o más capas, y cada capa representa un componente como balanceadores o servidores de aplicación. Cada capa tiene eventos de ciclo de vida asociados que ejecutan recetas automáticamente cuando ocurren eventos.

OpsWorks Stacks permite enviar cambios de estado, como instancias detenidas o despliegues fallidos, a CloudWatch Events. El campo initiated_by se llena cuando la instancia está en estados como requested, terminating o stopping. Este campo puede tomar valores como:

user - cuando un usuario inicia el cambio

auto-scaling - cuando lo inicia el escalado automático

auto-healing - cuando lo inicia la recuperación automática

Para este caso, se requiere detectar eventos de auto-healing, por lo que el valor debe ser auto-healing. CloudWatch Events no tiene integración directa con Slack, por lo que se necesita una función Lambda como destino que envíe la notificación.

via - [https://aws.amazon.com/blogs/mt/how-to-set-up-aws-opsworks-stacks-auto-healing-notifications-in-amazon-cloudwatch-events/](https://aws.amazon.com/blogs/mt/how-to-set-up-aws-opsworks-stacks-auto-healing-notifications-in-amazon-cloudwatch-events/)

Incorrect options:

Crear una regla de CloudWatch Events para aws.opsworks y establecer el campo initiated_by a auto-scaling. Configurar como target una función Lambda que enviará notificaciones al canal de Slack - auto-scaling no corresponde a eventos de auto-healing.

Suscribir las notificaciones de auto-healing de OpsWorks a un topic SNS. Suscribir una función Lambda que enviará notificaciones al canal de Slack - OpsWorks no envía directamente notificaciones de auto-healing a SNS.

Crear una regla de CloudWatch Events para aws.opsworks y establecer el campo initiated_by a auto-scaling. Habilitar la integración de Slack en CloudWatch Events para enviar las notificaciones - auto-scaling no corresponde a auto-healing y además CloudWatch Events no tiene integración directa con Slack.

References:

[https://aws.amazon.com/blogs/mt/how-to-set-up-aws-opsworks-stacks-auto-healing-notifications-in-amazon-cloudwatch-events/](https://aws.amazon.com/blogs/mt/how-to-set-up-aws-opsworks-stacks-auto-healing-notifications-in-amazon-cloudwatch-events/)

[https://docs.aws.amazon.com/opsworks/latest/userguide/workinginstances-autohealing.html](https://docs.aws.amazon.com/opsworks/latest/userguide/workinginstances-autohealing.html)

Temática

Domain 5: Incident and Event Response

#### Pregunta 47

Como Lead DevOps Engineer en una empresa de analítica, estás desplegando una aplicación global usando un pipeline CI/CD compuesto por AWS CodeCommit, CodeBuild, CodeDeploy y orquestado por AWS CodePipeline. Tu pipeline actualmente está en eu-west-1 y deseas extenderlo para desplegar tu aplicación en us-east-2. Esto requerirá crear un CodePipeline de múltiples pasos en esa región e invocarlo.

¿Cómo implementarías una solución para este caso de uso?

A. Al final del pipeline en eu-west-1, incluir un paso de CodeCommit para hacer push de los cambios al branch master de otro repositorio CodeCommit en us-east-2. Hacer que el CodePipeline en us-east-2 tome como fuente CodeCommit

B. Al final del pipeline en eu-west-1, incluir un paso de CodeDeploy para desplegar la aplicación al CodePipeline en us-east-2

C. Al final del pipeline en eu-west-1, incluir un paso de CodePipeline para invocar el CodePipeline en us-east-2. Asegurar que el CodePipeline en us-east-2 tenga permisos IAM para leer artefactos en S3 en eu-west-1

D. Al final del pipeline en eu-west-1, incluir un paso de S3 para copiar los artefactos utilizados por CodeDeploy a un bucket S3 en us-east-2. Hacer que el CodePipeline en us-east-2 tome como fuente S3

La respuesta:

D

Explicación general

Correct option:

Al final del pipeline en eu-west-1, incluir un paso de S3 para copiar los artefactos utilizados por CodeDeploy a un bucket S3 en us-east-2. Hacer que el CodePipeline en us-east-2 tome como fuente S3

AWS CodePipeline es un servicio de entrega continua que puedes usar para modelar, visualizar y automatizar los pasos necesarios para liberar tu software. Puedes configurar fácilmente las diferentes etapas de un proceso de liberación de software. CodePipeline automatiza los pasos necesarios para liberar cambios de software de forma continua.

CodePipeline Overview: via - [https://docs.aws.amazon.com/codepipeline/latest/userguide/welcome-introducing.html](https://docs.aws.amazon.com/codepipeline/latest/userguide/welcome-introducing.html)

CodePipeline Key Concepts:

via - [https://docs.aws.amazon.com/codepipeline/latest/userguide/concepts.html](https://docs.aws.amazon.com/codepipeline/latest/userguide/concepts.html)

Para este caso de uso, puedes usar un paso de despliegue a S3 para copiar los artefactos a otro bucket en otra región. Luego, el CodePipeline en la región destino reaccionará al evento y tomará los archivos desde ese bucket para iniciar el despliegue.

via - [https://docs.aws.amazon.com/codepipeline/latest/userguide/integrations-action-type.html](https://docs.aws.amazon.com/codepipeline/latest/userguide/integrations-action-type.html)

Incorrect options:

Al final del pipeline en eu-west-1, incluir un paso de CodeDeploy para desplegar la aplicación al CodePipeline en us-east-2 - CodeDeploy no puede desplegar hacia CodePipeline. Solo despliega a EC2, on-premise, Lambda o ECS.

Al final del pipeline en eu-west-1, incluir un paso de CodeCommit para hacer push de los cambios al branch master de otro repositorio CodeCommit en us-east-2. Hacer que el CodePipeline en us-east-2 tome como fuente CodeCommit - CodePipeline puede consumir CodeCommit como fuente, pero no puede hacer push a repositorios.

Al final del pipeline en eu-west-1, incluir un paso de CodePipeline para invocar el CodePipeline en us-east-2. Asegurar que el CodePipeline en us-east-2 tenga permisos IAM para leer artefactos en S3 en eu-west-1 - CodePipeline no puede invocar directamente otro CodePipeline.

References:

[https://docs.aws.amazon.com/codepipeline/latest/userguide/welcome-introducing.html](https://docs.aws.amazon.com/codepipeline/latest/userguide/welcome-introducing.html)

[https://docs.aws.amazon.com/codepipeline/latest/userguide/integrations-action-type.html](https://docs.aws.amazon.com/codepipeline/latest/userguide/integrations-action-type.html)

Temática

Domain 5: Incident and Event Response

#### Pregunta 48

El equipo DevOps en una empresa de soluciones de viajes de negocios quiere usar CodeDeploy para asegurar cero downtime durante despliegues mediante rolling updates. El equipo quiere desplegar la aplicación web principal de la empresa en un conjunto de instancias EC2 que se ejecutan detrás de un Application Load Balancer. El equipo desea que el despliegue sea gradual y que se realice rollback automáticamente en caso de un despliegue fallido, lo cual se determina si la aplicación no puede pasar los health checks.

Como ingeniero DevOps, ¿cuál de las siguientes opciones recomendarías para este caso de uso?

A. En el hook AfterInstall en appspec.yml, verificar que el servicio esté funcionando correctamente. Configurar CodeDeploy para hacer rollback en fallos de despliegue. En caso de que falle el hook, CodeDeploy hará rollback

B. Integrar CodeDeploy con el Application Load Balancer. En caso de que el Application Load Balancer falle los health checks en las instancias donde se desplegó la nueva versión, notificará a CodeDeploy. Configurar CodeDeploy para hacer rollback en fallos de despliegue

C. En el hook ValidateService en appspec.yml, verificar que el servicio esté funcionando correctamente. Configurar CodeDeploy para hacer rollback en fallos de despliegue. En caso de que falle el hook, CodeDeploy hará rollback

D. Crear una regla de CloudWatch Event sobre CodeDeploy para invocar una función Lambda en cada despliegue por instancia. La función Lambda probará el health check y, si falla, detendrá el despliegue usando StopDeployment API y luego iniciará un nuevo despliegue de la versión anterior usando CreateDeployment API

La respuesta:

C

Explicación general

Correct option:

En el hook ValidateService en appspec.yml, verificar que el servicio esté funcionando correctamente. Configurar CodeDeploy para hacer rollback en fallos de despliegue. En caso de que falle el hook, CodeDeploy hará rollback

CodeDeploy es un servicio totalmente gestionado que automatiza despliegues de software en servicios como Amazon EC2, AWS Fargate, AWS Lambda y servidores on-premises. Facilita liberar nuevas versiones, evita downtime y maneja la complejidad de actualizar aplicaciones.

El archivo AppSpec se utiliza para gestionar cada despliegue como una serie de hooks de ciclo de vida. Durante el despliegue, el agente de CodeDeploy ejecuta los hooks definidos. Si un hook falla, el despliegue falla.

El hook ValidateService es el último evento del ciclo de vida del despliegue y permite verificar que la aplicación esté funcionando correctamente después de iniciar. Puedes configurar CodeDeploy para hacer rollback automático si este hook falla.

Sample appspec file: via - [https://docs.aws.amazon.com/codedeploy/latest/userguide/reference-appspec-file.html](https://docs.aws.amazon.com/codedeploy/latest/userguide/reference-appspec-file.html)

List of Lifecycle Event hooks for EC2 deployment: via - [https://docs.aws.amazon.com/codedeploy/latest/userguide/reference-appspec-file-structure-hooks.html](https://docs.aws.amazon.com/codedeploy/latest/userguide/reference-appspec-file-structure-hooks.html)

Lifecycle Event hooks availability for EC2 deployment and rollback scenarios: via - [https://docs.aws.amazon.com/codedeploy/latest/userguide/reference-appspec-file-structure-hooks.html](https://docs.aws.amazon.com/codedeploy/latest/userguide/reference-appspec-file-structure-hooks.html)

Incorrect options:

Integrar CodeDeploy con el Application Load Balancer. En caso de que el Application Load Balancer falle los health checks en las instancias donde se desplegó la nueva versión, notificará a CodeDeploy. Configurar CodeDeploy para hacer rollback en fallos de despliegue - El ALB no dispara directamente rollback en CodeDeploy basado en health checks.

En el hook AfterInstall en appspec.yml, verificar que el servicio esté funcionando correctamente. Configurar CodeDeploy para hacer rollback en fallos de despliegue. En caso de que falle el hook, CodeDeploy hará rollback - AfterInstall ocurre antes de que la aplicación esté completamente en ejecución, por lo que no valida correctamente los health checks.

Crear una regla de CloudWatch Event sobre CodeDeploy para invocar una función Lambda en cada despliegue por instancia. La función Lambda probará el health check y, si falla, detendrá el despliegue usando StopDeployment API y luego iniciará un nuevo despliegue de la versión anterior usando CreateDeployment API - Esto añade complejidad innecesaria, ya que CodeDeploy ya soporta rollback automático.

References:

[https://docs.aws.amazon.com/codedeploy/latest/userguide/reference-appspec-file.html](https://docs.aws.amazon.com/codedeploy/latest/userguide/reference-appspec-file.html)

[https://docs.aws.amazon.com/codedeploy/latest/userguide/reference-appspec-file-structure-hooks.html](https://docs.aws.amazon.com/codedeploy/latest/userguide/reference-appspec-file-structure-hooks.html)

Temática

Domain 1: SDLC Automation

#### Pregunta 49

El equipo DevOps en una empresa líder de servicios de reservas de viajes está usando una plantilla de CloudFormation para desplegar una función Lambda. El código de la función Lambda se carga en S3 en un archivo llamado s3://my-bucket/my-lambda-code.zip por CodePipeline después de haber pasado todas las verificaciones de build requeridas. CodePipeline invoca la plantilla de CloudFormation para desplegar el nuevo código. El equipo ha encontrado que, aunque la plantilla de CloudFormation se ejecuta exitosamente, la función Lambda no se actualiza.

Como ingeniero DevOps, ¿qué puedes hacer para solucionar rápidamente este problema? (Selecciona tres)

A. Subir el código cada vez a un nuevo bucket S3

B. Agregar una pausa de 3 segundos antes de iniciar el job de CloudFormation. Esto es un problema de consistencia eventual debido a sobrescribir PUT

C. Habilitar la opción SAM Framework

D. Subir el código cada vez con un nombre de archivo diferente en el mismo bucket

E. Limpiar la caché de Lambda con un Custom Job en CodePipeline antes del paso de CloudFormation

F. Habilitar versionado en S3 y proporcionar una clave S3ObjectVersion

La respuesta:

A, D, F

Explicación general

Correct options:

Subir el código cada vez a un nuevo bucket S3

Subir el código cada vez con un nombre de archivo diferente en el mismo bucket

Habilitar versionado en S3 y proporcionar una clave S3ObjectVersion

Puedes usar CloudFormation para desplegar y actualizar recursos de cómputo, base de datos y muchos otros en un estilo declarativo que abstrae la complejidad de APIs específicas. CloudFormation está diseñado para permitir que los ciclos de vida de los recursos se gestionen de manera repetible, predecible y segura, con rollbacks automáticos, gestión de estado y administración entre cuentas y regiones.

via - [https://aws.amazon.com/cloudformation/](https://aws.amazon.com/cloudformation/)

Aquí el problema es que CloudFormation no detecta que un nuevo archivo ha sido subido a S3 a menos que cambie alguno de estos parámetros: S3Bucket, S3Key o S3ObjectVersion.

Los cambios en un paquete de despliegue en S3 no se detectan automáticamente durante actualizaciones de stack. Para actualizar el código de la función, necesitas cambiar la clave del objeto o su versión en la plantilla.

via - [https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-lambda-function-code.html](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-lambda-function-code.html)

Incorrect options:

Limpiar la caché de Lambda con un Custom Job en CodePipeline antes del paso de CloudFormation - No existe tal cosa como una caché de Lambda.

Agregar una pausa de 3 segundos antes de iniciar el job de CloudFormation. Esto es un problema de consistencia eventual debido a sobrescribir PUT - No es un problema de consistencia eventual en este contexto.

Habilitar la opción SAM Framework - AWS SAM es un framework para construir aplicaciones serverless, pero implicaría reescribir la plantilla, lo cual no es una solución rápida.

References:

[https://aws.amazon.com/cloudformation/](https://aws.amazon.com/cloudformation/)

[https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-lambda-function-code.html](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-lambda-function-code.html)

Temática

Domain 2: Configuration Management and IaC

#### Pregunta 50

Como ingeniero DevOps en una empresa de TI, has desplegado una aplicación web con un health check que actualmente verifica si la aplicación está corriendo activamente. La aplicación está ejecutándose en un ASG y la integración de health check del ALB está activada. Recientemente tu aplicación ha tenido problemas conectándose a una base de datos backend y como resultado los usuarios han experimentado problemas accediendo al sitio a través de las instancias defectuosas.

¿Cómo puedes mejorar la experiencia del usuario con el menor esfuerzo?

A. Mejorar el health check para que el código de estado de retorno corresponda a la conectividad con la base de datos

B. Mejorar el Health Check para que reporte un documento JSON que contenga el estado de salud de la conectividad a la base de datos. Ajustar el health check del ALB para buscar una cadena específica en el resultado usando una expresión regular

C. Migrar la aplicación a Elastic Beanstalk y habilitar monitoreo avanzado de salud

D. Incluir el health check en un registro de Route 53 para que los usuarios que pasan por el ALB no sean enrutados a instancias no saludables

La respuesta:

A

Explicación general

Correct option:

Mejorar el health check para que el código de estado de retorno corresponda a la conectividad con la base de datos

Configurar health checks en un Application Load Balancer es clave para asegurar que una aplicación funcione correctamente. El ALB considera una instancia saludable si responde con un código HTTP 200. Si la instancia devuelve un código fuera del rango 2XX o no responde, se marca como no saludable y deja de recibir tráfico.

El problema actual es que el health check solo valida que la aplicación esté activa, pero no valida dependencias críticas como la base de datos. Por lo tanto, se debe mejorar el endpoint de health check para que falle (por ejemplo, retorne un código distinto de 2XX) cuando no haya conectividad con la base de datos. Esto permitirá que el ALB deje de enviar tráfico a instancias defectuosas.

via - [https://docs.aws.amazon.com/elasticloadbalancing/latest/application/target-group-health-checks.html](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/target-group-health-checks.html)

Incorrect options:

Migrar la aplicación a Elastic Beanstalk y habilitar monitoreo avanzado de salud - Requiere mucho esfuerzo y no soluciona directamente el problema.

Mejorar el Health Check para que reporte un documento JSON que contenga el estado de salud de la conectividad a la base de datos. Ajustar el health check del ALB para buscar una cadena específica en el resultado usando una expresión regular - El ALB no evalúa contenido del body, solo códigos de estado HTTP.

Incluir el health check en un registro de Route 53 para que los usuarios que pasan por el ALB no sean enrutados a instancias no saludables - Route 53 no enruta a nivel de instancia detrás de un ALB.

References:

[https://docs.aws.amazon.com/elasticloadbalancing/latest/application/target-group-health-checks.html](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/target-group-health-checks.html)

[https://d1.awsstatic.com/builderslibrary/pdfs/implementing-health-checks.pdf](https://d1.awsstatic.com/builderslibrary/pdfs/implementing-health-checks.pdf)

Temática

Domain 3: Resilient Cloud Solutions

#### Pregunta 51

Como Lead DevOps Engineer en una empresa de comercio electrónico, deseas actualizar la versión mayor de tu base de datos MySQL, la cual está gestionada por CloudFormation con AWS::RDS::DBInstance y configurada en Multi-AZ.

Tienes el requisito de minimizar el downtime tanto como sea posible, ¿qué pasos deberías tomar para lograr esto?

A. Actualizar la base de datos RDS cambiando DBEngineVersion a la siguiente versión mayor, luego ejecutar una operación UpdateStack

B. Actualizar la base de datos RDS cambiando EngineVersion a la siguiente versión mayor, luego ejecutar una operación UpdateStack

C. Crear un RDS Read Replica en una plantilla de CloudFormation especificando SourceDBInstanceIdentifier y esperar a que se cree. Luego actualizar la EngineVersion del Read Replica a la siguiente versión mayor. Después promover el Read Replica y usarlo como la nueva base de datos principal

D. Crear un RDS Read Replica en una plantilla de CloudFormation especificando SourceDBInstanceIdentifier y esperar a que se cree. Luego actualizar DBEngineVersion del Read Replica a la siguiente versión mayor. Después promover el Read Replica y usarlo como la nueva base de datos principal

La respuesta:

C

Explicación general

Correct option:

Crear un RDS Read Replica en una plantilla de CloudFormation especificando SourceDBInstanceIdentifier y esperar a que se cree. Luego actualizar la EngineVersion del Read Replica a la siguiente versión mayor. Después promover el Read Replica y usarlo como la nueva base de datos principal

Puedes minimizar el downtime durante una actualización usando una estrategia tipo rolling upgrade con read replicas. Amazon RDS no automatiza completamente este proceso, pero puedes lograrlo creando un read replica, actualizando su EngineVersion, promoviéndolo y redirigiendo el tráfico hacia él.

Si deseas crear un Read Replica, debes especificar la propiedad SourceDBInstanceIdentifier, que indica que la instancia es una réplica.

via - [https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-rds-database-instance.html](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-rds-database-instance.html)

Debes considerar que Multi-AZ no elimina el downtime durante un upgrade de versión mayor. Multi-AZ está diseñado para alta disponibilidad, no para evitar downtime en upgrades, ya que operaciones como mysql_upgrade requieren interrupción.

via - [https://aws.amazon.com/blogs/database/best-practices-for-upgrading-amazon-rds-for-mysql-and-amazon-rds-for-mariadb/](https://aws.amazon.com/blogs/database/best-practices-for-upgrading-amazon-rds-for-mysql-and-amazon-rds-for-mariadb/)

Incorrect options:

Crear un RDS Read Replica en una plantilla de CloudFormation especificando SourceDBInstanceIdentifier y esperar a que se cree. Luego actualizar DBEngineVersion del Read Replica a la siguiente versión mayor. Después promover el Read Replica y usarlo como la nueva base de datos principal - La propiedad correcta es EngineVersion, no DBEngineVersion.

Actualizar la base de datos RDS cambiando EngineVersion a la siguiente versión mayor, luego ejecutar una operación UpdateStack - Al cambiar EngineVersion en CloudFormation, se crea un nuevo recurso reemplazando el existente, lo que implica downtime.

via - [https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html)

Actualizar la base de datos RDS cambiando DBEngineVersion a la siguiente versión mayor, luego ejecutar una operación UpdateStack - La propiedad DBEngineVersion no existe, por lo que es incorrecta.

References:

[https://aws.amazon.com/blogs/database/best-practices-for-upgrading-amazon-rds-for-mysql-and-amazon-rds-for-mariadb/](https://aws.amazon.com/blogs/database/best-practices-for-upgrading-amazon-rds-for-mysql-and-amazon-rds-for-mariadb/)

[https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_UpgradeDBInstance.MySQL.html#USER_UpgradeDBInstance.MySQL.ReducedDowntime](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_UpgradeDBInstance.MySQL.html#USER_UpgradeDBInstance.MySQL.ReducedDowntime)

[https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-rds-database-instance.html#cfn-rds-dbinstance-engineversion](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-rds-database-instance.html#cfn-rds-dbinstance-engineversion)

[https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-rds-database-instance.html](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-rds-database-instance.html)

[https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html)

Temática

Domain 5: Incident and Event Response

#### Pregunta 52

El equipo DevOps en tu empresa está usando CodeDeploy para desplegar nuevas versiones de una función Lambda después de que ha pasado CodeBuild vía CodePipeline. Antes de desplegar, CodePipeline tiene un paso que opcionalmente inicia una reestructuración de archivos en un bucket S3 que es compatible hacia atrás. Esta reestructuración se realiza usando una ejecución de Step Function que invoca una tarea en Fargate. La nueva función Lambda no puede funcionar hasta que la tarea de reestructuración haya sido completamente finalizada.

Como ingeniero DevOps, ¿cómo puedes asegurar que no se envíe tráfico a la nueva función Lambda hasta que la tarea esté completa?

A. Habilitar Canary Deployment en CodeDeploy para que solo una fracción del servicio sea atendida por la nueva función Lambda mientras la reestructuración ocurre

B. En tu archivo appspec.yml, incluir un hook AfterAllowTraffic que verifique la finalización de la ejecución de Step Function

C. En tu archivo appspec.yml, incluir un hook BeforeAllowTraffic que verifique la finalización de la ejecución de Step Function

D. Incluir un paso extra en la Step Function para notificar a CodeDeploy la finalización de la reestructuración y comenzar a enviar tráfico a la nueva función Lambda

La respuesta:

C

Explicación general

Correct option:

En tu archivo appspec.yml, incluir un hook BeforeAllowTraffic que verifique la finalización de la ejecución de Step Function

El archivo AppSpec se utiliza para gestionar cada despliegue como una serie de hooks de ciclo de vida. En despliegues de Lambda, CodeDeploy usa estos hooks para decidir cuándo cambiar el tráfico hacia la nueva versión.

El hook BeforeAllowTraffic se ejecuta antes de que se enrute tráfico a la nueva versión de la función Lambda. Esto permite validar condiciones externas antes de exponer la nueva versión.

Para este caso, se debe usar este hook para verificar que la ejecución de Step Functions (reestructuración en S3) haya terminado completamente antes de permitir tráfico.

via - [https://docs.aws.amazon.com/codedeploy/latest/userguide/reference-appspec-file-example.html#appspec-file-example-lambda](https://docs.aws.amazon.com/codedeploy/latest/userguide/reference-appspec-file-example.html#appspec-file-example-lambda)

via - [https://docs.aws.amazon.com/codedeploy/latest/userguide/reference-appspec-file-structure-hooks.html#appspec-hooks-lambda](https://docs.aws.amazon.com/codedeploy/latest/userguide/reference-appspec-file-structure-hooks.html#appspec-hooks-lambda)

Incorrect options:

En tu archivo appspec.yml, incluir un hook AfterAllowTraffic que verifique la finalización de la ejecución de Step Function - En este punto el tráfico ya fue redirigido, por lo que no cumple el requisito.

Habilitar Canary Deployment en CodeDeploy para que solo una fracción del servicio sea atendida por la nueva función Lambda mientras la reestructuración ocurre - Esto enviaría tráfico antes de que el proceso termine.

Incluir un paso extra en la Step Function para notificar a CodeDeploy la finalización de la reestructuración y comenzar a enviar tráfico a la nueva función Lambda - No existe un mecanismo directo para que Step Functions controle el switching de tráfico en CodeDeploy.

References:

[https://docs.aws.amazon.com/codedeploy/latest/userguide/reference-appspec-file-example.html#appspec-file-example-lambda](https://docs.aws.amazon.com/codedeploy/latest/userguide/reference-appspec-file-example.html#appspec-file-example-lambda)

[https://docs.aws.amazon.com/codedeploy/latest/userguide/reference-appspec-file-structure-hooks.html#appspec-hooks-lambda](https://docs.aws.amazon.com/codedeploy/latest/userguide/reference-appspec-file-structure-hooks.html#appspec-hooks-lambda)

Temática

Domain 1: SDLC Automation

#### Pregunta 53

Una empresa de TI está desplegando una aplicación basada en Python Flask y desea asegurarse de que tenga una AMI base que contenga el runtime necesario, así como parches del sistema operativo. Esa AMI será usada como referencia programáticamente desde todas las regiones en tu cuenta de manera escalable. La empresa te ha contratado como AWS Certified DevOps Engineer Professional para construir una solución para este requerimiento.

¿Cuáles de las siguientes opciones recomendarías para este caso de uso? (Selecciona dos)

A. Almacenar el ID de la AMI en SSM Parameter Store en una región, y tener una función Lambda que copie la AMI a todas las otras regiones, y almacene el ID correspondiente en SSM. Usar el mismo nombre de parámetro para reutilizarlo entre regiones

B. Crear un documento de SSM Automation para crear la AMI de manera repetible

C. Usar AWS Inspector para crear una AMI parchada usando la última AMI funcional

D. Usar AWS Lambda para crear una AMI parchada usando la última AMI funcional

E. Almacenar el ID de la AMI en SSM Parameter Store en una región, y crear una Step Function que copie el valor del ID de la AMI a otras regiones. Usar el mismo nombre de parámetro para reutilizarlo entre regiones

**La respuesta:**

**A, B**

Explicación general

Correct options:

Crear un documento de SSM Automation para crear la AMI de manera repetible

Un documento de SSM Automation define las acciones que Systems Manager ejecuta sobre instancias administradas y otros recursos AWS cuando se ejecuta una automatización. Contiene pasos secuenciales que permiten construir workflows repetibles.

Puedes usar Systems Manager junto con maintenance windows para automatizar la creación de AMIs de forma periódica y consistente tanto para Windows como Linux.

via - [https://aws.amazon.com/premiumsupport/knowledge-center/ec2-systems-manager-ami-automation/](https://aws.amazon.com/premiumsupport/knowledge-center/ec2-systems-manager-ami-automation/)

Almacenar el ID de la AMI en SSM Parameter Store en una región, y tener una función Lambda que copie la AMI a todas las otras regiones, y almacene el ID correspondiente en SSM. Usar el mismo nombre de parámetro para reutilizarlo entre regiones

El ID de una AMI es específico por región, por lo que la AMI debe copiarse entre regiones. Cada región tendrá un ID distinto, pero puedes usar el mismo nombre de parámetro en SSM Parameter Store para facilitar su consumo programático.

Incorrect options:

Almacenar el ID de la AMI en SSM Parameter Store en una región, y crear una Step Function que copie el valor del ID de la AMI a otras regiones. Usar el mismo nombre de parámetro para reutilizarlo entre regiones - Esto solo copia el ID, pero no la AMI. La AMI seguiría existiendo en una sola región.

Usar AWS Inspector para crear una AMI parchada usando la última AMI funcional - Inspector se usa para análisis de vulnerabilidades, no para crear AMIs.

Usar AWS Lambda para crear una AMI parchada usando la última AMI funcional - Lambda no se usa para crear AMIs de esta forma.

References:

[https://docs.aws.amazon.com/systems-manager/latest/userguide/automation-documents.html](https://docs.aws.amazon.com/systems-manager/latest/userguide/automation-documents.html)

[https://aws.amazon.com/premiumsupport/knowledge-center/ec2-systems-manager-ami-automation/](https://aws.amazon.com/premiumsupport/knowledge-center/ec2-systems-manager-ami-automation/)

Temática

Domain 6: Security and Compliance

#### Pregunta 54

Una empresa minorista está finalizando su migración a AWS y se da cuenta de que mientras algunos empleados han aprobado la certificación AWS Certified DevOps Engineer Professional y conocen bien AWS, otros aún están comenzando y ni siquiera han obtenido certificaciones de nivel Associate. La empresa ha establecido reglas arquitectónicas y de etiquetado específicas para recursos internos y desea minimizar el riesgo de que empleados principiantes creen recursos no conformes.

Como ingeniero DevOps, ¿cómo implementarías este requerimiento permitiendo al mismo tiempo que los empleados creen los recursos que necesitan?

A. Colocar a los usuarios IAM principiantes en un grupo y crear una política IAM que requiera aprobaciones condicionales de ingenieros DevOps senior al crear recursos. Conectar un SNS topic al canal de aprobación IAM

B. Definir arquitecturas comunes como plantillas de CloudFormation. Colocar a los usuarios IAM en un grupo de principiantes y permitir que solo lancen stacks desde esas plantillas de CloudFormation, restringiendo cualquier acceso de escritura a otros servicios

C. Definir arquitecturas comunes como plantillas de CloudFormation. Crear stacks de Service Catalog a partir de estas plantillas y asegurar que el etiquetado esté correctamente configurado. Colocar a los usuarios IAM en un grupo de principiantes y permitir que solo lancen stacks desde Service Catalog, restringiendo cualquier acceso de escritura a otros servicios

D. Crear reglas personalizadas de AWS Config que verifiquen el cumplimiento de los recursos de la empresa mediante una función Lambda. Actualizar la función Lambda con el tiempo mientras la empresa mejora sus reglas. Dar a los usuarios IAM acceso completo a AWS

**La respuesta:**

**C**

Explicación general

Correct option:

Definir arquitecturas comunes como plantillas de CloudFormation. Crear stacks de Service Catalog a partir de estas plantillas y asegurar que el etiquetado esté correctamente configurado. Colocar a los usuarios IAM en un grupo de principiantes y permitir que solo lancen stacks desde Service Catalog, restringiendo cualquier acceso de escritura a otros servicios

AWS Service Catalog permite a los administradores crear, gestionar y distribuir catálogos de productos aprobados a los usuarios finales. Estos usuarios pueden lanzar recursos de forma controlada usando plantillas predefinidas que cumplen con políticas organizacionales.

Un producto en Service Catalog es una aplicación o servicio definido generalmente mediante plantillas de CloudFormation. Los administradores controlan qué usuarios pueden lanzar estos productos, asegurando cumplimiento de estándares de arquitectura y etiquetado.

Para este caso, Service Catalog es la solución adecuada porque permite restringir a los usuarios principiantes a lanzar únicamente configuraciones aprobadas sin darles acceso directo a crear recursos arbitrarios.

via - [https://docs.aws.amazon.com/servicecatalog/latest/adminguide/introduction.html](https://docs.aws.amazon.com/servicecatalog/latest/adminguide/introduction.html)

Incorrect options:

Definir arquitecturas comunes como plantillas de CloudFormation. Colocar a los usuarios IAM en un grupo de principiantes y permitir que solo lancen stacks desde esas plantillas de CloudFormation, restringiendo cualquier acceso de escritura a otros servicios - CloudFormation no permite restringir qué plantillas pueden usar los usuarios mediante IAM.

Crear reglas personalizadas de AWS Config que verifiquen el cumplimiento de los recursos de la empresa mediante una función Lambda. Actualizar la función Lambda con el tiempo mientras la empresa mejora sus reglas. Dar a los usuarios IAM acceso completo a AWS - AWS Config solo detecta incumplimiento, no lo previene.

Colocar a los usuarios IAM principiantes en un grupo y crear una política IAM que requiera aprobaciones condicionales de ingenieros DevOps senior al crear recursos. Conectar un SNS topic al canal de aprobación IAM - IAM no soporta flujos de aprobación condicionales.

References:

[https://aws.amazon.com/servicecatalog/faqs/](https://aws.amazon.com/servicecatalog/faqs/)

[https://docs.aws.amazon.com/servicecatalog/latest/adminguide/introduction.html](https://docs.aws.amazon.com/servicecatalog/latest/adminguide/introduction.html)

[https://aws.amazon.com/blogs/mt/how-to-launch-secure-and-governed-aws-resources-with-aws-cloudformation-and-aws-service-catalog/](https://aws.amazon.com/blogs/mt/how-to-launch-secure-and-governed-aws-resources-with-aws-cloudformation-and-aws-service-catalog/)

Temática

Domain 6: Security and Compliance

#### Pregunta 55

Una empresa de gaming desea poder recibir notificaciones casi en tiempo real cuando la llamada API DeleteTable es invocada en DynamoDB.

Como ingeniero DevOps en la empresa, ¿cómo implementarías esto al menor costo posible?

A. Enviar logs de CloudTrail a CloudWatch Logs y usar una función Lambda que se dispare con un filtro de métricas de CloudWatch Logs. Usar la función Lambda para enviar una notificación SNS

B. Habilitar CloudTrail. Crear una regla de CloudWatch Event para rastrear una llamada API de AWS vía CloudTrail y usar SNS como target

C. Crear un filtro de eventos de CloudTrail y conectarlo a una función Lambda. Usar la función Lambda para enviar una notificación SNS

D. Habilitar DynamoDB Streams y usar una función Lambda consumiendo el stream. Enviar alertas a SNS cuando se elimine un registro

**La respuesta:**

**B**

Explicación general

Correct option:

Habilitar CloudTrail. Crear una regla de CloudWatch Event para rastrear una llamada API de AWS vía CloudTrail y usar SNS como target

CloudTrail proporciona visibilidad sobre la actividad en tu cuenta AWS registrando las acciones realizadas. Incluye información como quién hizo la solicitud, qué servicio se usó, qué acción se ejecutó y sus parámetros.

Para detectar llamadas API específicas como DeleteTable, puedes usar CloudWatch Events (EventBridge) con el patrón "AWS API Call via CloudTrail". Esto permite reaccionar en tiempo casi real a eventos registrados por CloudTrail y enviar notificaciones directamente a SNS.

via - [https://aws.amazon.com/cloudtrail/](https://aws.amazon.com/cloudtrail/)

Incorrect options:

Habilitar DynamoDB Streams y usar una función Lambda consumiendo el stream. Enviar alertas a SNS cuando se elimine un registro - DynamoDB Streams solo captura cambios a nivel de ítems, no llamadas API como DeleteTable.

Enviar logs de CloudTrail a CloudWatch Logs y usar una función Lambda que se dispare con un filtro de métricas de CloudWatch Logs. Usar la función Lambda para enviar una notificación SNS - Funciona pero implica mayor costo y complejidad al procesar todos los logs.

Crear un filtro de eventos de CloudTrail y conectarlo a una función Lambda. Usar la función Lambda para enviar una notificación SNS - CloudTrail no permite conectar directamente eventos filtrados a Lambda.

References:

[https://aws.amazon.com/cloudtrail/](https://aws.amazon.com/cloudtrail/)

[https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/Create-CloudWatch-Events-CloudTrail-Rule.html](https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/Create-CloudWatch-Events-CloudTrail-Rule.html)

Temática

Domain 4: Monitoring and Logging

#### Pregunta 56

Una empresa minorista usa Jenkins open-source en su infraestructura on-premise para realizar CI/CD. Ha decidido migrar a AWS y aprovechar las propiedades de elasticidad del cloud para tener cargas de trabajo más eficientes. Necesita asegurar que la configuración de Jenkins sea altamente disponible, tolerante a fallos y también elástica para ejecutar builds. La empresa te ha contratado como AWS Certified DevOps Engineer Professional para construir la solución más costo-efectiva para este requerimiento.

¿Cuál de las siguientes soluciones recomendarías?

A. Desplegar Jenkins como una configuración multi-master en múltiples AZ. Habilitar el plugin de CodeBuild para Jenkins para que los builds se ejecuten como builds de CodeBuild

B. Desplegar Jenkins como una configuración multi-master en una sola AZ, gestionado por un Auto Scaling Group. Habilitar el plugin de CodeBuild para Jenkins para que los builds se ejecuten como builds de CodeBuild

C. Desplegar Jenkins como una configuración multi-master en múltiples AZ. Crear un Auto Scaling Group de instancias EC2 que actúen como slaves de Jenkins. Configurar Jenkins para ejecutar builds en estos slaves

D. Desplegar Jenkins como una configuración multi-master en una sola AZ, gestionado por un Auto Scaling Group. Configurar Jenkins para ejecutar builds en estos slaves

**La respuesta:**

**A**

Explicación general

Correct option:

Desplegar Jenkins como una configuración multi-master en múltiples AZ. Habilitar el plugin de CodeBuild para Jenkins para que los builds se ejecuten como builds de CodeBuild

En AWS, una aplicación como Jenkins debe diseñarse para alta disponibilidad distribuyendo instancias en múltiples AZ y usando un balanceador de carga. Esto asegura tolerancia a fallos.

El uso del plugin de AWS CodeBuild permite que los jobs de Jenkins se ejecuten en CodeBuild en lugar de nodos propios. Esto elimina la necesidad de administrar infraestructura para builds, proporcionando elasticidad total y optimizando costos, ya que solo se paga por el tiempo de ejecución.

via - [https://aws.amazon.com/blogs/devops/setting-up-a-ci-cd-pipeline-by-integrating-jenkins-with-aws-codebuild-and-aws-codedeploy/](https://aws.amazon.com/blogs/devops/setting-up-a-ci-cd-pipeline-by-integrating-jenkins-with-aws-codebuild-and-aws-codedeploy/)

Incorrect options:

Desplegar Jenkins como una configuración multi-master en una sola AZ, gestionado por un Auto Scaling Group. Habilitar el plugin de CodeBuild para Jenkins para que los builds se ejecuten como builds de CodeBuild - No cumple con alta disponibilidad al estar en una sola AZ.

Desplegar Jenkins como una configuración multi-master en múltiples AZ. Crear un Auto Scaling Group de instancias EC2 que actúen como slaves de Jenkins. Configurar Jenkins para ejecutar builds en estos slaves - Esto requiere administrar infraestructura de builds, aumentando costos y complejidad.

Desplegar Jenkins como una configuración multi-master en una sola AZ, gestionado por un Auto Scaling Group. Configurar Jenkins para ejecutar builds en estos slaves - No es altamente disponible y además implica administrar infraestructura de builds.

References:

[https://aws.amazon.com/blogs/devops/setting-up-a-ci-cd-pipeline-by-integrating-jenkins-with-aws-codebuild-and-aws-codedeploy/](https://aws.amazon.com/blogs/devops/setting-up-a-ci-cd-pipeline-by-integrating-jenkins-with-aws-codebuild-and-aws-codedeploy/)

[https://docs.aws.amazon.com/codebuild/latest/userguide/jenkins-plugin.html](https://docs.aws.amazon.com/codebuild/latest/userguide/jenkins-plugin.html)

[https://d1.awsstatic.com/whitepapers/DevOps/Jenkins_on_AWS.pdf](https://d1.awsstatic.com/whitepapers/DevOps/Jenkins_on_AWS.pdf)

Temática

Domain 1: SDLC Automation

#### Pregunta 58

Una empresa multinacional ha definido lineamientos y estándares de etiquetado para todos sus recursos en AWS y desea crear un dashboard para visualizar el cumplimiento de todos los recursos con la capacidad de encontrar los recursos no conformes. La empresa te ha contratado como AWS Certified DevOps Engineer Professional para desarrollar una solución para este requerimiento.

¿Cuál de las siguientes opciones sugerirías para resolver este caso de uso?

A. Usar SSM para rastrear grupos de recursos sin etiquetas. Exportar esos datos usando SSM Inventory a S3 y construir un dashboard en QuickSight
B. Usar AWS Service Catalog para obtener un inventario de todos los recursos en tu cuenta. Usar el dashboard integrado para rastrear cumplimiento
C. Usar AWS Config para rastrear recursos en tu cuenta. Usar SNS para enviar cambios a una función Lambda que escriba en S3. Crear un dashboard en QuickSight sobre esos datos
D. Rastrear todos los recursos con AWS CloudTrail. Exportar los datos a S3 y crear un dashboard en QuickSight

La respuesta:
C

Explicación general

Correct option:

Usar AWS Config para rastrear recursos en tu cuenta. Usar SNS para enviar cambios a una función Lambda que escriba en S3. Crear un dashboard en QuickSight sobre esos datos

AWS Config es un servicio completamente administrado que proporciona inventario de recursos, historial de configuraciones y notificaciones de cambios. Permite evaluar cumplimiento mediante reglas, incluyendo validaciones de tagging.

Puedes usar reglas administradas como required-tags para validar etiquetas. Los cambios en configuración se pueden enviar a SNS y procesar con Lambda para almacenarlos en S3 y luego visualizarlos en QuickSight.

via - [https://aws.amazon.com/config/](https://aws.amazon.com/config/)

Incorrect options:

Usar AWS Service Catalog para obtener un inventario de todos los recursos en tu cuenta. Usar el dashboard integrado para rastrear cumplimiento - Service Catalog no proporciona inventario completo de recursos.

Usar SSM para rastrear grupos de recursos sin etiquetas. Exportar esos datos usando SSM Inventory a S3 y construir un dashboard en QuickSight - SSM Inventory está enfocado en instancias y no en todos los recursos.

Rastrear todos los recursos con AWS CloudTrail. Exportar los datos a S3 y crear un dashboard en QuickSight - CloudTrail registra llamadas API, no inventario de recursos.

References:

[https://docs.aws.amazon.com/config/latest/developerguide/tagging.html](https://docs.aws.amazon.com/config/latest/developerguide/tagging.html)

[https://aws.amazon.com/blogs/devops/aws-config-checking-for-compliance-with-new-managed-rule-options/](https://aws.amazon.com/blogs/devops/aws-config-checking-for-compliance-with-new-managed-rule-options/)

Temática
Domain 4: Monitoring and Logging

#### PREGUNTA 59.

Una empresa de redes sociales tiene múltiples instancias EC2 que están detrás de un Auto Scaling group (ASG) y te gustaría recuperar todos los archivos de log dentro de estas instancias antes de que sean terminadas. También te gustaría construir un índice de metadatos de todos los archivos de log para que puedas encontrarlos eficientemente por instance id y rango de fechas.

Como DevOps Engineer, ¿cuál de las siguientes opciones recomendarías para abordar los requisitos dados? (Selecciona tres)

OPCIONES

A. Crear un termination hook para tu ASG y crear una regla de CloudWatch Events para activar una función AWS Lambda. La función Lambda debe invocar un SSM Run Command para enviar los archivos de log desde la instancia EC2 a CloudWatch Logs. Crear una suscripción de logs para enviarlos a Firehose y luego a S3

B. Crear una tabla de DynamoDB con una clave primaria de instance-id y una clave de orden (sort key) de datetime

C. Crear un termination hook para tu ASG y crear una regla de CloudWatch Events para activar una función AWS Lambda. La función Lambda debe invocar un SSM Run Command para enviar los archivos de log desde la instancia EC2 a S3

D. Crear una función Lambda que sea activada por eventos de S3 para operaciones PUT. Escribir en la tabla de DynamoDB

E. Crear una función Lambda que sea activada por CloudWatch Events para operaciones PUT. Escribir en la tabla de DynamoDB

F. Crear una tabla de DynamoDB con una clave primaria de datetime y una clave de orden (sort key) de instance-id

RESPUESTA

La respuesta:

B, C, D

EXPLICACIÓN

Explicación general

Correct options:

Crear un termination hook para tu ASG y crear una regla de CloudWatch Events para activar una función AWS Lambda. La función Lambda debe invocar un SSM Run Command para enviar los archivos de log desde la instancia EC2 a S3

Los lifecycle hooks te permiten realizar acciones personalizadas al pausar instancias mientras un ASG las lanza o termina. Por ejemplo, cuando ocurre un evento de scale-in, la instancia que va a terminarse primero es desregistrada del load balancer (si el Auto Scaling group se está usando con Elastic Load Balancing). Luego, un lifecycle hook pausa la instancia antes de que sea terminada. Mientras la instancia está en estado de espera, puedes, por ejemplo, conectarte a la instancia y descargar logs u otros datos antes de que la instancia sea completamente terminada.

via - [https://docs.aws.amazon.com/autoscaling/ec2/userguide/lifecycle-hooks.html](https://docs.aws.amazon.com/autoscaling/ec2/userguide/lifecycle-hooks.html?utm_source=chatgpt.com)

Puedes usar una regla de CloudWatch Events para invocar una función Lambda cuando ocurre una acción de lifecycle. La función Lambda es invocada cuando Amazon EC2 Auto Scaling envía un evento para una acción de lifecycle a CloudWatch Events. El evento contiene información sobre la instancia que se está lanzando o terminando y un token que puedes usar para controlar la acción de lifecycle. Finalmente, la función Lambda puede invocar un SSM Run Command para enviar los archivos de log desde la instancia EC2 a S3. SSM Run Command te permite administrar remotamente y de forma segura la configuración de tus instancias administradas.

Crear una función Lambda que sea activada por eventos de S3 para operaciones PUT. Escribir en la tabla de DynamoDB

Puedes usar Lambda para procesar notificaciones de eventos de Amazon Simple Storage Service. Amazon S3 puede enviar un evento a una función Lambda cuando un objeto es creado o eliminado. Amazon S3 invoca tu función de manera asíncrona con un evento que contiene detalles sobre el objeto. La Lambda posteriormente escribirá la información del evento en la tabla de DynamoDB.

Crear una tabla de DynamoDB con una clave primaria de instance-id y una clave de orden (sort key) de datetime

Cuando creas una tabla de DynamoDB, además del nombre de la tabla, debes especificar la clave primaria. La clave primaria identifica de manera única cada ítem en la tabla, de modo que no puede haber dos ítems con la misma clave. Para el caso de uso dado, necesitas establecer la clave primaria como una combinación de partition key de instance-id y una sort key de datetime, ya que estamos buscando un instance id específico y un rango de fechas.

via - [https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.CoreComponents.html#HowItWorks.CoreComponents.PrimaryKey](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.CoreComponents.html#HowItWorks.CoreComponents.PrimaryKey)

Incorrect options:

Crear un termination hook para tu ASG y crear una regla de CloudWatch Events para activar una función AWS Lambda. La función Lambda debe invocar un SSM Run Command para enviar los archivos de log desde la instancia EC2 a CloudWatch Logs. Crear una suscripción de logs para enviarlos a Firehose y luego a S3 - Debemos enviar los archivos de log a S3 directamente desde la instancia EC2 en lugar de hacerlo a través de CloudWatch, ya que estamos haciendo una exportación única de ellos. CloudWatch Logs es una buena solución para transmitir logs a medida que se generan.

Crear una función Lambda que sea activada por CloudWatch Events para operaciones PUT. Escribir en la tabla de DynamoDB - Necesitamos que la función Lambda sea activada por eventos de S3 en lugar de CloudWatch Events, ya que para CloudWatch Events necesitaríamos también tener un trail de CloudTrail registrando acciones en el bucket específico de S3.

Crear una tabla de DynamoDB con una clave primaria de datetime y una clave de orden (sort key) de instance-id - Como se mencionó anteriormente, dado que el caso de uso requiere buscar por un instance id específico y un rango de fechas, se debe usar instance-id como Partition Key y datetime como Sort Key. Por lo tanto, esta opción es incorrecta.

REFERENCIAS

[https://docs.aws.amazon.com/autoscaling/ec2/userguide/lifecycle-hooks.html](https://docs.aws.amazon.com/autoscaling/ec2/userguide/lifecycle-hooks.html?utm_source=chatgpt.com)

[https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.CoreComponents.html#HowItWorks.CoreComponents.PrimaryKey](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.CoreComponents.html#HowItWorks.CoreComponents.PrimaryKey)

Temática

Domain 4: Monitoring and Logging

#### PREGUNTA 60.

Una empresa de analítica de Big Data está operando un clúster distribuido de Cassandra en EC2. Cada instancia en el clúster debe tener una lista de las IPs de todas las demás instancias para funcionar correctamente, almacenada en un archivo de configuración. Como DevOps Engineer en la empresa, te gustaría que la solución se adapte automáticamente cuando nuevas instancias EC2 se unan al clúster, o cuando algunas instancias EC2 sean terminadas.

¿Cuál de las siguientes soluciones recomendarías para el requisito dado?

OPCIONES

A. Administrar las instancias EC2 usando un Auto Scaling Group. Incluir un lifecycle hook para el estado pending y termination de la instancia que activará un script de user-data en la instancia EC2. El script ejecuta una llamada a la API EC2 DescribeInstances y actualiza el archivo de configuración localmente

B. Administrar las instancias EC2 usando OpsWorks. Incluir un cookbook de Chef en el evento de lifecycle configure que actualizará el archivo de configuración en consecuencia

C. Administrar las instancias EC2 usando un Auto Scaling Group. Incluir un lifecycle hook para el estado pending y termination de la instancia que activará una función AWS Lambda. La función Lambda emitirá una llamada a la API EC2 DescribeInstances y actualizará el archivo de configuración a través de SSH

D. Administrar las instancias EC2 usando OpsWorks. Incluir un cookbook de Chef en el evento de lifecycle setup que actualizará el archivo de configuración en consecuencia

RESPUESTA

La respuesta:

B

EXPLICACIÓN

Explicación general

Correct option:

Administrar las instancias EC2 usando OpsWorks. Incluir un cookbook de Chef en el evento de lifecycle configure que actualizará el archivo de configuración en consecuencia

AWS OpsWorks es un servicio de gestión de configuración que proporciona instancias administradas de Chef y Puppet. Chef y Puppet son plataformas de automatización que permiten usar código para automatizar las configuraciones de tus servidores. OpsWorks te permite usar Chef y Puppet para automatizar cómo los servidores son configurados, desplegados y administrados a través de tus instancias de Amazon EC2 o entornos de cómputo on-premises.

Un stack es la entidad de más alto nivel en AWS OpsWorks Stacks. Representa un conjunto de instancias que deseas administrar colectivamente, típicamente porque tienen un propósito común como servir aplicaciones PHP. Además de servir como contenedor, un stack maneja tareas que aplican al grupo de instancias en su conjunto, como la gestión de aplicaciones y cookbooks.

Cada stack contiene una o más capas (layers), cada una de las cuales representa un componente del stack, como un load balancer o un conjunto de servidores de aplicación. Cada capa tiene un conjunto de cinco eventos de lifecycle, cada uno con un conjunto asociado de recetas específicas de la capa. Cuando ocurre un evento en una instancia de la capa, AWS OpsWorks Stacks ejecuta automáticamente el conjunto apropiado de recetas.

El lifecycle hook que se ejecuta en TODAS las instancias, cada vez que una instancia se levanta o otra se apaga, es el hook configure. Por lo tanto, esta opción es la mejor para el caso de uso dado.

via - [https://docs.aws.amazon.com/opsworks/latest/userguide/workingcookbook-events.html](https://docs.aws.amazon.com/opsworks/latest/userguide/workingcookbook-events.html)

Incorrect options:

Administrar las instancias EC2 usando OpsWorks. Incluir un cookbook de Chef en el evento de lifecycle setup que actualizará el archivo de configuración en consecuencia - Como se mencionó anteriormente en la explicación, el hook setup solo se utiliza cuando una instancia es creada por primera vez, por lo tanto esta opción es incorrecta.

Administrar las instancias EC2 usando un Auto Scaling Group. Incluir un lifecycle hook para el estado pending y termination de la instancia que activará una función AWS Lambda. La función Lambda emitirá una llamada a la API EC2 DescribeInstances y actualizará el archivo de configuración a través de SSH - Los lifecycle hooks en Auto Scaling Groups pueden parecer una buena idea al inicio, pero usar AWS Lambda para esta solución no es práctico, ya que hacer SSH hacia la instancia desde Lambda no funcionará.

Administrar las instancias EC2 usando un Auto Scaling Group. Incluir un lifecycle hook para el estado pending y termination de la instancia que activará un script de user-data en las instancias EC2. El script ejecuta una llamada a la API EC2 DescribeInstances y actualiza el archivo de configuración localmente - Los scripts de user-data en EC2 solo se ejecutan en el primer arranque de la instancia, por lo que esta opción actúa solo como distractor.

REFERENCIAS

[https://docs.aws.amazon.com/opsworks/latest/userguide/workingcookbook-events.html](https://docs.aws.amazon.com/opsworks/latest/userguide/workingcookbook-events.html)

[https://aws.amazon.com/opsworks/](https://aws.amazon.com/opsworks/)

Temática

Domain 2: Configuration Management and IaC

#### Pregunta 61:

El equipo de desarrollo en una empresa de redes sociales está usando AWS CodeCommit para almacenar código. Como Lead DevOps Engineer en la empresa, has definido una regla a nivel compañía de que el equipo no debe poder hacer push a la rama master. Has agregado a todos los desarrolladores en un grupo IAM developers y adjuntado la política administrada por AWS arn:aws:iam::aws:policy/AWSCodeCommitPowerUser al grupo. Esta política proporciona acceso completo a los repositorios de AWS CodeCommit pero no permite la eliminación de repositorios, sin embargo, tus desarrolladores aún pueden hacer push a la rama master.

¿Cómo deberías evitar que los desarrolladores hagan push a la rama master?

OPCIONES

A. Modificar la política IAM administrada por AWS adjunta al grupo para Deny codecommit:GitPush con una condición en la rama master

B. Agregar una nueva política IAM adjunta al grupo para Deny codecommit:GitPush con una condición en la rama master

C. Incluir un pre-hook de git commit que invoque una función Lambda y verifique si el push se realiza a master

D. Incluir una política de repositorio de CodeCommit en cada repositorio con un Deny explícito para codecommit:GitPush

RESPUESTA

La respuesta:

B

EXPLICACIÓN

Explicación general

Correct option:

Agregar una nueva política IAM adjunta al grupo para Deny codecommit:GitPush con una condición en la rama master

Cualquier usuario de un repositorio CodeCommit que tenga permisos suficientes para hacer push al repositorio puede contribuir a cualquier rama en ese repositorio. Puedes configurar una rama para que solo algunos usuarios del repositorio puedan hacer push o merge de código a esa rama. Por ejemplo, podrías querer configurar una rama usada para código de producción para que solo un subconjunto de desarrolladores senior puedan hacer push o merge de cambios a esa rama. Otros desarrolladores aún pueden hacer pull desde la rama, crear sus propias ramas y crear pull requests, pero no pueden hacer push o merge de cambios a esa rama. Puedes configurar este acceso creando una política condicional que use una clave de contexto para una o más ramas en IAM.

Para el caso de uso dado, necesitas agregar una política adicional con un Deny explícito. Ten en cuenta que un Explicit Deny siempre tiene prioridad sobre cualquier otra cosa.

Limit pushes and merges to branches in AWS CodeCommit:  via - [https://docs.aws.amazon.com/codecommit/latest/userguide/how-to-conditional-branch.html](https://docs.aws.amazon.com/codecommit/latest/userguide/how-to-conditional-branch.html)

Incorrect options:

Incluir una política de repositorio de CodeCommit en cada repositorio con un Deny explícito para codecommit:GitPush - Esta opción ha sido agregada como distractor ya que las políticas de repositorio de CodeCommit no existen.

Modificar la política IAM administrada por AWS adjunta al grupo para Deny codecommit:GitPush con una condición en la rama master - No puedes modificar una política IAM administrada por AWS, por lo tanto esta opción es incorrecta.

Incluir un pre-hook de git commit que invoque una función Lambda y verifique si el push se realiza a master - Aunque sería interesante, CodeCommit aún no tiene una funcionalidad de pre-hook para integrarse con Lambda.

REFERENCIAS

[https://docs.aws.amazon.com/codecommit/latest/userguide/how-to-conditional-branch.html](https://docs.aws.amazon.com/codecommit/latest/userguide/how-to-conditional-branch.html)

Temática

Domain 5: Incident and Event Response

#### Pregunta 62:

Como DevOps Engineer en una empresa de redes sociales, has implementado un pipeline de CI/CD que toma código de un repositorio CodeCommit, lo construye usando CodeBuild gracias a las instrucciones en un Dockerfile local, y luego lo empuja a ECR en 123456789.dkr.ecr.region.amazonaws.com/my-web-app. El último paso de tu pipeline de CI/CD es desplegar la aplicación a tu clúster ECS. Parece que, mientras haces esto, la aplicación solo se actualiza parcialmente en algunas instancias ECS que están ejecutando una versión anterior de tu imagen. Has encontrado que terminar la instancia o limpiar la caché local de Docker soluciona el problema, pero te gustaría implementar algo más robusto que proporcione visibilidad e identificación para rastrear dónde se despliegan las imágenes de contenedor.

¿Cómo deberías implementar una solución para abordar este problema?

OPCIONES

A. Al crear una nueva task definition para tu servicio ECS, asegúrate de agregar la etiqueta latest en el nombre completo de la imagen para que ECS obtenga la imagen correcta cada vez

B. Al crear una nueva task definition para tu servicio ECS, asegúrate de agregar el hash sha256 en el nombre completo de la imagen para que ECS obtenga la imagen correcta cada vez

C. Después de que el paso de despliegue en CodePipeline termine, incluir un Custom Step usando una función Lambda que active un SSM Run Command. Ese comando limpiará la caché local de Docker y detendrá la tarea

D. Después de que el paso de despliegue en CodePipeline termine, incluir un Custom Step usando una función Lambda que active una función AWS Lambda. Esa función hará SSH a tus instancias ECS y limpiará la caché local de Docker y detendrá la tarea

RESPUESTA

La respuesta:

B

EXPLICACIÓN

Explicación general

Correct option:

Al crear una nueva task definition para tu servicio ECS, asegúrate de agregar el hash sha256 en el nombre completo de la imagen para que ECS obtenga la imagen correcta cada vez

Amazon ECS SHA Tracking proporciona visibilidad e identificación para rastrear dónde se despliegan las imágenes de contenedor utilizando eventos de cambio de estado de tareas emitidos a CloudWatch Events. SHA Tracking está integrado con Amazon ECR, ECS, Fargate y CloudWatch Events para soportar operaciones del ciclo de vida de la aplicación. Puedes usar la propiedad IMAGEID, que es el digest SHA para la imagen Docker usada para iniciar el contenedor.

via - [https://docs.aws.amazon.com/AmazonECS/latest/developerguide/container-metadata.html](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/container-metadata.html)

El problema aquí es que las instancias ECS no detectan que una versión más nueva de la imagen está disponible, porque el nombre 123456789.dkr.ecr.region.amazonaws.com/my-web-app se reutiliza. Por lo tanto, al especificar el sha256 por ejemplo: aws_account_id.dkr.ecr.region.amazonaws.com/my-web-app@sha256:94afd1f2e64d908bc90dbca0035a5b567EXAMPLE, tenemos la certeza de que las versiones más nuevas de la imagen Docker tendrán un valor hash diferente y, por lo tanto, el clúster ECS siempre obtendrá la imagen más nueva al final de nuestro pipeline de CI/CD.

Incorrect options:

Después de que el paso de despliegue en CodePipeline termine, incluir un Custom Step usando una función Lambda que active un SSM Run Command. Ese comando limpiará la caché local de Docker y detendrá la tarea - SSM Run Command te permite administrar remotamente y de forma segura la configuración de tus instancias administradas. Una instancia administrada es cualquier instancia EC2 o máquina on-premises en tu entorno híbrido que ha sido configurada para Systems Manager. SSM Run Command podría funcionar, pero no es una solución elegante.

Después de que el paso de despliegue en CodePipeline termine, incluir un Custom Step usando una función Lambda que active una función AWS Lambda. Esa función hará SSH a tus instancias ECS y limpiará la caché local de Docker y detendrá la tarea - Las funciones Lambda no pueden hacer SSH a instancias EC2, por lo tanto esta opción es incorrecta.

Al crear una nueva task definition para tu servicio ECS, asegúrate de agregar la etiqueta latest en el nombre completo de la imagen para que ECS obtenga la imagen correcta cada vez - Agregar la etiqueta latest no ayudará porque 123456789.dkr.ecr.region.amazonaws.com/my-web-app es lo mismo que 123456789.dkr.ecr.region.amazonaws.com/my-web-app:latest. La etiqueta latest no puede proporcionar visibilidad e identificación para rastrear dónde se despliegan las imágenes de contenedor.

REFERENCIAS

[https://aws.amazon.com/about-aws/whats-new/2019/10/amazon-ecs-now-supports-ecs-image-sha-tracking/](https://aws.amazon.com/about-aws/whats-new/2019/10/amazon-ecs-now-supports-ecs-image-sha-tracking/)

[https://docs.aws.amazon.com/AmazonECS/latest/developerguide/container-metadata.html](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/container-metadata.html)

Temática

Domain 2: Configuration Management and IaC

#### Pregunta 63:

Una empresa de servicios financieros tiene una solución implementada para rastrear todas las llamadas API realizadas por usuarios, aplicaciones y dentro de la cuenta AWS. Recientemente, ha experimentado un hack y pudo encontrar entre los logs que se realizaron algunas llamadas API comprometidas. La empresa quiere saber con 100% de certeza que los archivos de logs representan la secuencia correcta de eventos y que no han sido alterados. La empresa te ha contratado como un AWS Certified DevOps Engineer Professional para construir una solución para este requerimiento.

¿Cuál de las siguientes opciones sugerirías como la solución más efectiva?

OPCIONES

A. Activar el seguimiento de configuración de la cuenta AWS usando AWS Config. Entregar los logs en un bucket S3 y elegir una política de ciclo de vida que archive los archivos inmediatamente en Glacier. Implementar una política Glacier Vault Lock

B. Activar el logging de llamadas API usando AWS CloudTrail. Entregar los logs en un bucket S3 y elegir una política de ciclo de vida que archive los archivos inmediatamente en Glacier. Implementar una política Glacier Vault Lock

C. Activar el logging de llamadas API usando AWS CloudTrail. Entregar los logs en un bucket S3, y usar la llamada API de verificación de integridad de logs para verificar el archivo de log

D. Activar el seguimiento de configuración de la cuenta AWS usando AWS Config. Entregar los logs de configuración en S3 y usar la API de verificación de integridad de logs para verificar los archivos de log

RESPUESTA

La respuesta:

C

EXPLICACIÓN

Explicación general

Correct option:

Activar el logging de llamadas API usando AWS CloudTrail. Entregar los logs en un bucket S3, y usar la llamada API de verificación de integridad de logs para verificar el archivo de log

CloudTrail proporciona visibilidad sobre la actividad de los usuarios registrando las acciones realizadas en tu cuenta. CloudTrail registra información importante sobre cada acción, incluyendo quién realizó la solicitud, los servicios utilizados, las acciones ejecutadas, los parámetros de las acciones y los elementos de respuesta devueltos por el servicio de AWS. Esta información te ayuda a rastrear cambios realizados en tus recursos de AWS y a solucionar problemas operativos.

How CloudTrail Works:  via - [https://aws.amazon.com/cloudtrail/](https://aws.amazon.com/cloudtrail/)

Para determinar si un archivo de log fue modificado, eliminado o permanece sin cambios después de que CloudTrail lo entregó, puedes usar la validación de integridad de archivos de log de CloudTrail. Esta funcionalidad está construida usando algoritmos estándar de la industria: SHA-256 para hashing y SHA-256 con RSA para firma digital.

via - [https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-log-file-validation-intro.html](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-log-file-validation-intro.html)

Para el caso de uso dado, para rastrear llamadas API realizadas dentro de tu cuenta, necesitas usar AWS CloudTrail. Luego, la forma correcta de verificar la integridad de los logs es usar el comando validate-logs de CloudTrail.

via - [https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-log-file-validation-cli.html](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-log-file-validation-cli.html)

Incorrect options:

Activar el logging de llamadas API usando AWS CloudTrail. Entregar los logs en un bucket S3 y elegir una política de ciclo de vida que archive los archivos inmediatamente en Glacier. Implementar una política Glacier Vault Lock - S3 Glacier Vault Lock te permite implementar y hacer cumplir controles de cumplimiento para bóvedas individuales de S3 Glacier mediante una política de bloqueo de bóveda. Puedes especificar controles como “write once read many” (WORM) en una política de bloqueo de bóveda y bloquear la política contra futuras ediciones. Una vez bloqueada, la política ya no puede ser modificada. Ten en cuenta que aunque tener una política Glacier Vault Lock puede ayudar a garantizar que los archivos no puedan ser alterados, no nos proporciona la garantía end-to-end de que CloudTrail realmente produjo esos archivos ni permite compararlos contra un hash para asegurar que permanecen sin cambios.

Activar el seguimiento de configuración de la cuenta AWS usando AWS Config. Entregar los logs de configuración en S3 y usar la API de verificación de integridad de logs para verificar los archivos de log - AWS Config se utiliza para rastrear la configuración de recursos a lo largo del tiempo. Aunque Config tiene integración con CloudTrail para mostrar quién realizó llamadas API, Config por sí solo no nos dará la información sobre quién realizó las llamadas API.

Activar el seguimiento de configuración de la cuenta AWS usando AWS Config. Entregar los logs en un bucket S3 y elegir una política de ciclo de vida que archive los archivos inmediatamente en Glacier. Implementar una política Glacier Vault Lock - AWS Config se utiliza para rastrear la configuración de recursos a lo largo del tiempo. Aunque Config tiene integración con CloudTrail para mostrar quién realizó llamadas API, Config por sí solo no nos dará la información de quién realizó las llamadas API. Ten en cuenta que aunque tener una política Glacier Vault Lock puede ayudar a garantizar que los archivos no puedan ser alterados, no proporciona la garantía end-to-end de que CloudTrail realmente produjo esos archivos ni permite compararlos contra un hash para asegurar que permanecen sin cambios.

REFERENCIAS

[https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-log-file-validation-intro.html](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-log-file-validation-intro.html)

[https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-log-file-validation-cli.html](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-log-file-validation-cli.html)

[https://aws.amazon.com/cloudtrail/faqs/](https://aws.amazon.com/cloudtrail/faqs/)

Temática

Domain 4: Monitoring and Logging

#### Pregunta 64:

Una empresa minorista multinacional está en proceso de capturar toda su infraestructura como código utilizando CloudFormation. El inventario de infraestructura es grande y contendrá un stack de red, un stack de aplicación, un stack de datos, y así sucesivamente. Algunos equipos están listos para avanzar con el proceso mientras otros están rezagados, y existe el deseo de mantener toda la infraestructura controlada por versión.

La empresa te ha contratado como AWS Certified DevOps Engineer Professional para construir una solución para este caso de uso. ¿Cómo lo implementarías?

OPCIONES

A. Crear una plantilla por elemento lógico de tu infraestructura. Crear un master stack que contenga todos los demás stacks como una plantilla anidada. Desplegar la plantilla maestra usando CloudFormation cada vez que una plantilla de stack anidado sea actualizada en control de versiones

B. Crear una plantilla maestra que contenga todos los stacks en tu infraestructura. Colaborar en esa plantilla usando pull requests y merges hacia la rama master en tu repositorio de código. Desplegar la plantilla maestra cada vez que sea actualizada

C. Crear una plantilla por elemento lógico de tu infraestructura. Desplegarlas usando CloudFormation conforme estén listas. Usar outputs y exports para referenciar valores en los stacks. Mantener cada archivo por separado en un repositorio con control de versiones

D. Crear una plantilla por elemento lógico de tu infraestructura. Crear un master stack que contenga todos los demás stacks como plantillas anidadas. Desplegar la plantilla maestra una vez usando CloudFormation y luego actualizar los stacks anidados individualmente conforme se cree nuevo código de CloudFormation

RESPUESTA

**La respuesta:**

**C**

EXPLICACIÓN

Explicación general

Correct option:

Crear una plantilla por elemento lógico de tu infraestructura. Desplegarlas usando CloudFormation conforme estén listas. Usar outputs y exports para referenciar valores en los stacks. Mantener cada archivo por separado en un repositorio con control de versiones

Al usar CloudFormation, trabajas con plantillas y stacks. Creas plantillas para describir tus recursos de AWS y sus propiedades. Cuando usas AWS CloudFormation, gestionas recursos relacionados como una sola unidad llamada stack. Creas, actualizas y eliminas una colección de recursos creando, actualizando y eliminando stacks. Todos los recursos en un stack están definidos por la plantilla de CloudFormation del stack.

En CloudFormation, la mejor práctica es separar los stacks en componentes lógicos individuales y separados que tienen dependencias entre sí. Para enlazar estas dependencias, lo mejor es usar Exports e Imports. Cada plantilla individual de CloudFormation debe ser un archivo separado.

CloudFormation best practices:  via - [https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/best-practices.html#cross-stack](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/best-practices.html#cross-stack)

Incorrect options:

Crear una plantilla por elemento lógico de tu infraestructura. Crear un master stack que contenga todos los demás stacks como una plantilla anidada. Desplegar la plantilla maestra usando CloudFormation cada vez que una plantilla de stack anidado sea actualizada en control de versiones

Crear una plantilla por elemento lógico de tu infraestructura. Crear un master stack que contenga todos los demás stacks como una plantilla anidada. Desplegar la plantilla maestra una vez usando CloudFormation y luego actualizar los stacks anidados individualmente conforme se cree nuevo código de CloudFormation

El problema con ambas opciones es que diferentes equipos están trabajando en diferentes partes de la infraestructura con sus propios tiempos, por lo que es difícil combinar todos los elementos de la infraestructura en una sola plantilla maestra. Es mucho mejor tener una plantilla por elemento lógico de la infraestructura que sea propiedad del equipo correspondiente y luego usar outputs y exports para referenciar valores en los stacks. Los Nested Stacks pueden ser útiles si una configuración de componente (como un Load Balancer) puede ser reutilizada en muchos stacks.

Crear una plantilla maestra que contenga todos los stacks en tu infraestructura. Colaborar en esa plantilla usando pull requests y merges hacia la rama master en tu repositorio de código. Desplegar la plantilla maestra cada vez que sea actualizada - Usar outputs y exports para plantillas individuales es mucho mejor que colaborar mediante pull requests a nivel de repositorio de código. Usar plantillas individuales da propiedad al equipo contribuyente para asegurar que las plantillas de CloudFormation siempre estén funcionales y listas para ser referenciadas en otros stacks.

REFERENCIAS

[https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/cfn-whatis-concepts.html](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/cfn-whatis-concepts.html)

[https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/best-practices.html#cross-stack](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/best-practices.html#cross-stack)

Temática

Domain 2: Configuration Management and IaC

#### Pregunta 65:

Una empresa de ciberseguridad ha detectado una posible exposición de sus propias credenciales de cuenta AWS siendo publicadas en repositorios públicos de GitHub. La empresa quiere implementar un flujo de trabajo para ser alertada en caso de que las credenciales se filtren, generar un reporte de todas las llamadas API realizadas recientemente usando esas credenciales, y desactivar las credenciales. Toda la ejecución del flujo de trabajo debe ser auditable.

La empresa te ha contratado como AWS Certified DevOps Engineer Professional para construir una solución robusta para este requerimiento. ¿Cuál de las siguientes opciones implementarías?

OPCIONES

A. Crear un CloudWatch Event que verifique AWS_RISK_CREDENTIALS_EXPOSED en el servicio Health. Disparar una función Lambda que emitirá llamadas API a IAM, CloudTrail y SNS para lograr los requisitos deseados

B. Crear un CloudWatch Event que verifique AWS_RISK_CREDENTIALS_EXPOSED en el servicio CloudTrail. Disparar un flujo de trabajo de Step Function que emitirá llamadas API a IAM, CloudTrail y SNS para lograr los requisitos deseados

C. Crear un CloudWatch Event que verifique AWS_RISK_CREDENTIALS_EXPOSED en el servicio Health. Disparar un flujo de trabajo de Step Function que emitirá llamadas API a IAM, CloudTrail y SNS para lograr los requisitos deseados

D. Crear un CloudWatch Event que verifique AWS_RISK_CREDENTIALS_EXPOSED en el servicio CloudTrail. Disparar un flujo de trabajo de Lambda que emitirá llamadas API a IAM, CloudTrail y SNS para lograr los requisitos deseados

RESPUESTA

La respuesta:

C

EXPLICACIÓN

Explicación general

Correct option:

Crear un CloudWatch Event que verifique AWS_RISK_CREDENTIALS_EXPOSED en el servicio Health. Disparar un flujo de trabajo de Step Function que emitirá llamadas API a IAM, CloudTrail y SNS para lograr los requisitos deseados

Step Functions es un servicio completamente administrado que facilita coordinar los componentes de aplicaciones distribuidas y microservicios usando flujos de trabajo visuales.

How Step Functions Work:  via - [https://aws.amazon.com/step-functions/](https://aws.amazon.com/step-functions/)

AWS monitorea sitios populares de repositorios de código en busca de claves de acceso IAM que han sido expuestas públicamente. AWS Health genera un evento AWS_RISK_CREDENTIALS_EXPOSED cuando una clave de acceso IAM ha sido expuesta públicamente en GitHub. Una regla de CloudWatch Events detecta este evento e invoca una Step Function que orquesta el flujo de trabajo automatizado para eliminar la clave de acceso IAM expuesta y resumir la actividad reciente de API para esa clave. El flujo de trabajo también emitirá llamadas API a IAM, CloudTrail y SNS. El evento AWS_RISK_CREDENTIALS_EXPOSED es expuesto por el servicio Personal Health Dashboard.

Mitigating security events using AWS Health and CloudTrail:  via - [https://aws.amazon.com/blogs/compute/automate-your-it-operations-using-aws-step-functions-and-amazon-cloudwatch-events/](https://aws.amazon.com/blogs/compute/automate-your-it-operations-using-aws-step-functions-and-amazon-cloudwatch-events/)

Incorrect options:

Crear un CloudWatch Event que verifique AWS_RISK_CREDENTIALS_EXPOSED en el servicio Health. Disparar una función Lambda que emitirá llamadas API a IAM, CloudTrail y SNS para lograr los requisitos deseados - Dado que la forma de reaccionar a este evento es compleja y puede requerir reintentos, y se desea tener un rastro completo de auditoría de cada flujo de trabajo, se debe usar Step Functions en lugar de una función Lambda. Por lo tanto, esta opción es incorrecta.

Crear un CloudWatch Event que verifique AWS_RISK_CREDENTIALS_EXPOSED en el servicio CloudTrail. Disparar un flujo de trabajo de Lambda que emitirá llamadas API a IAM, CloudTrail y SNS para lograr los requisitos deseados - La forma de reaccionar a este evento es compleja y puede requerir reintentos, y se desea tener un rastro completo de auditoría de cada flujo de trabajo, por lo que se debe usar Step Functions en lugar de Lambda. Además, el evento AWS_RISK_CREDENTIALS_EXPOSED es generado por AWS Health y no por CloudTrail, por lo tanto esta opción es incorrecta.

Crear un CloudWatch Event que verifique AWS_RISK_CREDENTIALS_EXPOSED en el servicio CloudTrail. Disparar un flujo de trabajo de Step Function que emitirá llamadas API a IAM, CloudTrail y SNS para lograr los requisitos deseados - El evento AWS_RISK_CREDENTIALS_EXPOSED es generado por el servicio AWS Health y NO por CloudTrail, por lo tanto esta opción es incorrecta.

REFERENCIAS

[https://aws.amazon.com/blogs/compute/automate-your-it-operations-using-aws-step-functions-and-amazon-cloudwatch-events/](https://aws.amazon.com/blogs/compute/automate-your-it-operations-using-aws-step-functions-and-amazon-cloudwatch-events/)

[https://docs.aws.amazon.com/health/latest/ug/getting-started-phd.html](https://docs.aws.amazon.com/health/latest/ug/getting-started-phd.html)

Temática

Domain 5: Incident and Event Response

#### Pregunta 66:

El equipo DevOps en una empresa de software de presentaciones está desplegando su aplicación principal usando Elastic Beanstalk. La aplicación se despliega usando una etapa Deploy en un pipeline de CodePipeline. Los requerimientos técnicos exigen cambiar la configuración del Application Load Balancer asociado a Elastic Beanstalk agregando una regla de redirección de HTTP a HTTPS.

Como DevOps Engineer, no tienes permisos para editar directamente el entorno de Elastic Beanstalk, ¿cómo puedes proceder?

OPCIONES

A. Crear un archivo llamado .ebextensions/alb.config en tu repositorio de código y agregar un bloque container_commands en el cual especificarás un comando que se ejecutará en modo leader_only. La instancia EC2 emitirá una llamada API al Load Balancer para agregar la regla de redirección

B. Usando el EB CLI, crear un archivo .elasticbeanstalk/saved_configs/config.yml, y especificar las reglas para la clave aws:elbv2:listener:default. Ejecutar un deploy usando el EB CLI desde tu computadora hacia el entorno Elastic Beanstalk

C. Usando el EB CLI, crear un archivo .elasticbeanstalk/saved_configs/config.yml, y especificar las reglas para la clave aws:elbv2:listener:default. Configurar CodePipeline para desplegar a Elastic Beanstalk usando el EB CLI y hacer push del código

D. Crear un archivo llamado .ebextensions/alb.config en tu repositorio de código y agregar un bloque option_settings en el cual especificarás las reglas para la clave aws:elbv2:listener:default. Hacer push de tu código y dejar que CodePipeline se ejecute

RESPUESTA

La respuesta:

D

EXPLICACIÓN

Explicación general

Correct option:

Crear un archivo llamado .ebextensions/alb.config en tu repositorio de código y agregar un bloque option_settings en el cual especificarás las reglas para la clave aws:elbv2:listener:default. Hacer push de tu código y dejar que CodePipeline se ejecute

Puedes usar archivos de configuración de Elastic Beanstalk (.ebextensions) junto con el código fuente de tu aplicación web para configurar tu entorno y personalizar los recursos AWS que contiene. Los archivos de configuración son documentos en formato YAML o JSON con extensión .config que colocas en una carpeta llamada .ebextensions y despliegas en el bundle de tu aplicación. Puedes usar la clave option_settings para modificar la configuración del entorno. Puedes elegir entre opciones generales para todos los entornos y opciones específicas de la plataforma.

via - [https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/ebextensions.html](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/ebextensions.html)

Nota: Los valores recomendados se aplican cuando creas o actualizas un entorno en la API de Elastic Beanstalk mediante un cliente. Por ejemplo, el cliente puede ser la consola de administración de AWS, Elastic Beanstalk Command Line Interface (EB CLI), AWS Command Line Interface (AWS CLI), o SDKs. Los valores recomendados se establecen directamente a nivel de API y tienen la mayor precedencia. La configuración aplicada a nivel de API no puede cambiarse usando option_settings, ya que la API tiene la mayor precedencia.

via - [https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/command-options.html](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/command-options.html)

Los cambios de configuración realizados directamente en el entorno de Elastic Beanstalk no persistirán si utilizas los siguientes métodos:

Configurar un recurso de Elastic Beanstalk directamente desde la consola de un servicio AWS específico.

Instalar un paquete, crear un archivo o ejecutar un comando directamente desde tu instancia EC2.

Para el caso de uso dado, usar un archivo .ebextensions y configurar las reglas en el bloque option_settings es la opción correcta.

Incorrect options:

Usando el EB CLI, crear un archivo .elasticbeanstalk/saved_configs/config.yml, y especificar las reglas para la clave aws:elbv2:listener:default. Configurar CodePipeline para desplegar a Elastic Beanstalk usando el EB CLI y hacer push del código - Esta opción ha sido agregada como distractor ya que no puedes configurar CodePipeline para desplegar usando el EB CLI.

Usando el EB CLI, crear un archivo .elasticbeanstalk/saved_configs/config.yml, y especificar las reglas para la clave aws:elbv2:listener:default. Ejecutar un deploy usando el EB CLI desde tu computadora hacia el entorno Elastic Beanstalk - Usar el EB CLI desde tu computadora normalmente funcionaría, pero la pregunta especifica que no tienes los permisos necesarios para hacer cambios directos en el entorno Beanstalk. Por lo tanto, debemos usar CodePipeline.

Crear un archivo llamado .ebextensions/alb.config en tu repositorio de código y agregar un bloque container_commands en el cual especificarás un comando que se ejecutará en modo leader_only. La instancia EC2 emitirá una llamada API al Load Balancer para agregar la regla de redirección - Usar container_commands podría funcionar, pero no es una buena práctica ya que la instancia EC2 emitiría un comando hacia el ALB y, por lo tanto, la configuración sería diferente a la especificada por Beanstalk, y la instancia EC2 puede no tener los permisos suficientes a través de su rol IAM para ejecutar ese comando. Por lo tanto, esta opción es incorrecta.

REFERENCIAS

[https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/ebextensions.html](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/ebextensions.html)

[https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/command-options.html](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/command-options.html)

Temática

Domain 2: Configuration Management and IaC

#### Pregunta 67:

El equipo DevOps en una empresa minorista ha desplegado su aplicación principal en instancias EC2 usando CodeDeploy y una base de datos RDS PostgreSQL para almacenar los datos, mientras que usa DynamoDB para almacenar las sesiones de usuario. Como Lead DevOps Engineer en la empresa, te gustaría que la aplicación acceda de forma segura a RDS y DynamoDB.

¿Cómo puedes hacer esto de la manera más segura?

OPCIONES

A. Almacenar las credenciales de RDS y credenciales de DynamoDB en Secrets Manager y crear un rol IAM de instancia para EC2 para acceder a Secrets Manager

B. Almacenar las credenciales de RDS en una tabla DynamoDB y crear un rol IAM de instancia para EC2 para acceder a DynamoDB

C. Almacenar credenciales de usuario IAM y credenciales de RDS en Secrets Manager y crear un rol IAM de instancia para EC2 para acceder a Secrets Manager

D. Almacenar las credenciales de RDS en Secrets Manager y crear un rol IAM de instancia para EC2 para acceder a Secrets Manager y DynamoDB

RESPUESTA

La respuesta:

D

EXPLICACIÓN

Explicación general

Correct option:

Almacenar las credenciales de RDS en Secrets Manager y crear un rol IAM de instancia para EC2 para acceder a Secrets Manager y DynamoDB

AWS Secrets Manager es un servicio de gestión de secretos que te ayuda a proteger el acceso a tus aplicaciones, servicios y recursos de TI. Este servicio te permite rotar, gestionar y recuperar fácilmente credenciales de bases de datos, claves API y otros secretos a lo largo de su ciclo de vida.

Puedes usar Secrets Manager para rotar de forma nativa credenciales para Amazon Relational Database Service (RDS), Amazon DocumentDB y Amazon Redshift. Puedes extender Secrets Manager para rotar otros secretos, como credenciales para bases de datos Oracle alojadas en EC2 o tokens de refresco OAuth, modificando funciones Lambda de ejemplo disponibles en la documentación de Secrets Manager.

Para acceder a PostgreSQL, puedes usar credenciales de base de datos y es mejor almacenarlas en Secrets Manager desde una perspectiva de mejores prácticas de seguridad. El acceso a Secrets Manager se regula mediante un rol IAM con la política correspondiente. Debes escribir esta política IAM permitiendo que tu aplicación en instancias EC2 acceda a secretos específicos. Luego, en el código de la aplicación, puedes reemplazar secretos en texto plano con código que recupere estos secretos programáticamente usando las APIs de Secrets Manager. Para acceder a la tabla DynamoDB, también debes agregar la política apropiada a este rol IAM.

Incorrect options:

Almacenar las credenciales de RDS y credenciales de DynamoDB en Secrets Manager y crear un rol IAM de instancia para EC2 para acceder a Secrets Manager - Como se menciona en la explicación anterior, Secrets Manager NO soporta DynamoDB, por lo tanto esta opción es incorrecta.

Almacenar las credenciales de RDS en una tabla DynamoDB y crear un rol IAM de instancia para EC2 para acceder a DynamoDB - No se recomienda almacenar credenciales de RDS en DynamoDB, ya que puede ser accedido por cualquiera que tenga acceso a la tabla subyacente. Esto constituye una seria amenaza de seguridad.

Almacenar credenciales de usuario IAM y credenciales de RDS en Secrets Manager y crear un rol IAM de instancia para EC2 para acceder a Secrets Manager - Almacenar credenciales de usuario IAM en Secrets Manager es un distractor, ya que no se requieren credenciales de usuario IAM para construir una solución para este caso de uso. Puedes usar directamente un rol IAM de instancia para EC2 para acceder a Secrets Manager.

REFERENCIAS

[https://aws.amazon.com/secrets-manager/faqs/](https://aws.amazon.com/secrets-manager/faqs/)

Temática

Domain 6: Security and Compliance

#### Pregunta 68:

Como parte del pipeline de CI/CD, el equipo DevOps en una empresa minorista quiere desplegar el código más reciente de la aplicación a un entorno de staging y el equipo también quiere ejecutar un conjunto automatizado de pruebas funcionales antes de desplegar a producción. El código es gestionado vía CodeCommit. Usualmente, el conjunto de pruebas funcionales se ejecuta por más de dos horas. La empresa te ha contratado como AWS Certified DevOps Engineer Professional para construir una solución para este requerimiento.

¿Cómo crearías el pipeline de CI/CD para ejecutar el conjunto de pruebas de la manera más eficiente?

OPCIONES

A. Crear un CodePipeline apuntando a la rama master de tu repositorio CodeCommit y como primera etapa ejecutar un build de CodeBuild que ejecutará el conjunto de pruebas contra el entorno de staging. Al pasar, desplegar a staging usando CodeDeploy y si tiene éxito, desplegar a producción

B. Crear un CodePipeline apuntando a la rama master de tu repositorio CodeCommit y automáticamente desplegar a un entorno de staging usando CodeDeploy. Después de esa etapa, invocar un build de CodeBuild que ejecutará el conjunto de pruebas. Si la etapa no falla, la última etapa desplegará la aplicación a producción

C. Crear un CodePipeline apuntando a la rama master de tu repositorio CodeCommit y automáticamente desplegar a un entorno de staging usando CodeDeploy. Después de esa etapa, invocar una etapa personalizada usando una función Lambda que ejecutará el conjunto de pruebas. Si la etapa no falla, la última etapa desplegará la aplicación a producción

D. Crear un CodePipeline apuntando a la rama master de tu repositorio CodeCommit y automáticamente desplegar a un entorno de staging usando CodeDeploy. Después de esa etapa, invocar una etapa personalizada usando una función Lambda que invocará una ejecución de Step Function. La Step Function ejecutará el conjunto de pruebas. Crear una regla de CloudWatch Event sobre la terminación de la ejecución de tu Step Function para invocar una función Lambda y señalar a CodePipeline el éxito o fallo. Si la etapa no falla, la última etapa desplegará la aplicación a producción

RESPUESTA

La respuesta:

B

EXPLICACIÓN

Explicación general

Correct option:

Crear un CodePipeline apuntando a la rama master de tu repositorio CodeCommit y automáticamente desplegar a un entorno de staging usando CodeDeploy. Después de esa etapa, invocar un build de CodeBuild que ejecutará el conjunto de pruebas. Si la etapa no falla, la última etapa desplegará la aplicación a producción

CodeCommit es un servicio de control de código fuente seguro, altamente escalable y administrado que facilita a los equipos colaborar en el código. Un pipeline de CI/CD te ayuda a automatizar los pasos en tu proceso de entrega de software, como iniciar builds automáticos y luego desplegar en instancias Amazon EC2. Puedes usar AWS CodePipeline, un servicio que construye, prueba y despliega tu código cada vez que hay un cambio, basado en los modelos de proceso de liberación que defines para orquestar cada paso en tu proceso de liberación.

Sample AWS CodePipeline pipeline architecture:

Highly recommend reading this excellent reference AWS DevOps blog on using CodePipeline with CodeBuild to automate testing - [https://aws.amazon.com/blogs/devops/automating-your-api-testing-with-aws-codebuild-aws-codepipeline-and-postman/](https://aws.amazon.com/blogs/devops/automating-your-api-testing-with-aws-codebuild-aws-codepipeline-and-postman/)

AWS CodeBuild es un servicio de integración continua completamente administrado en la nube. CodeBuild compila código fuente, ejecuta pruebas y produce paquetes listos para desplegar. CodeBuild elimina la necesidad de aprovisionar, administrar y escalar tus propios servidores de build. CodeBuild escala automáticamente hacia arriba y hacia abajo y procesa múltiples builds concurrentemente, por lo que tus builds no tienen que esperar en una cola. CodeBuild recientemente anunció el lanzamiento de una nueva funcionalidad llamada Reports. Esta funcionalidad te permite ver reportes generados por pruebas funcionales o de integración. Los reportes pueden estar en formato JUnit XML o Cucumber JSON. Puedes ver métricas como porcentaje de éxito, duración de ejecución de pruebas, y número de casos exitosos versus fallidos/error en un solo lugar.

AWS CodeBuild Test Reports:  via - [https://aws.amazon.com/blogs/devops/test-reports-with-aws-codebuild/](https://aws.amazon.com/blogs/devops/test-reports-with-aws-codebuild/)

Para el caso de uso dado, necesitas usar un build de CodeBuild para ejecutar el conjunto de pruebas, pero primero debes desplegar a staging antes de ejecutar CodeBuild. Es común en el examen que se muestren los mismos pasos en diferente orden, por lo que debes tener cuidado.

Incorrect options:

Crear un CodePipeline apuntando a la rama master de tu repositorio CodeCommit y como primera etapa ejecutar un build de CodeBuild que ejecutará el conjunto de pruebas contra el entorno de staging. Al pasar, desplegar a staging usando CodeDeploy y si tiene éxito, desplegar a producción - Como se mencionó anteriormente en la explicación, no puedes tener la etapa de pruebas de CodeBuild antes de desplegar en el entorno de staging, por lo tanto esta opción es incorrecta.

Crear un CodePipeline apuntando a la rama master de tu repositorio CodeCommit y automáticamente desplegar a un entorno de staging usando CodeDeploy. Después de esa etapa, invocar una etapa personalizada usando una función Lambda que ejecutará el conjunto de pruebas. Si la etapa no falla, la última etapa desplegará la aplicación a producción - Lambda debe descartarse para ejecutar el conjunto de pruebas ya que el tiempo máximo de ejecución de una función Lambda es de 15 minutos, por lo que no soportará este caso de uso ya que el conjunto de pruebas funcionales se ejecuta por más de dos horas.

Crear un CodePipeline apuntando a la rama master de tu repositorio CodeCommit y automáticamente desplegar a un entorno de staging usando CodeDeploy. Después de esa etapa, invocar una etapa personalizada usando una función Lambda que invocará una ejecución de Step Function. La Step Function ejecutará el conjunto de pruebas. Crear una regla de CloudWatch Event sobre la terminación de la ejecución de tu Step Function para invocar una función Lambda y señalar a CodePipeline el éxito o fallo. Si la etapa no falla, la última etapa desplegará la aplicación a producción - AWS Step Functions es un servicio completamente administrado que facilita coordinar los componentes de aplicaciones distribuidas y microservicios usando flujos de trabajo visuales. Aunque la solución con Step Functions funcionaría, es extremadamente compleja y no es la solución más eficiente.

How Step Functions Work:  via - [https://aws.amazon.com/step-functions/](https://aws.amazon.com/step-functions/)

REFERENCIAS

[https://aws.amazon.com/blogs/devops/automating-your-api-testing-with-aws-codebuild-aws-codepipeline-and-postman/](https://aws.amazon.com/blogs/devops/automating-your-api-testing-with-aws-codebuild-aws-codepipeline-and-postman/)

[https://docs.aws.amazon.com/codebuild/latest/userguide/how-to-create-pipeline.html](https://docs.aws.amazon.com/codebuild/latest/userguide/how-to-create-pipeline.html)

[https://aws.amazon.com/codebuild/faqs/](https://aws.amazon.com/codebuild/faqs/)

[https://aws.amazon.com/blogs/devops/test-reports-with-aws-codebuild/](https://aws.amazon.com/blogs/devops/test-reports-with-aws-codebuild/)

[https://aws.amazon.com/step-functions/](https://aws.amazon.com/step-functions/)

Temática

Domain 1: SDLC Automation

#### Pregunta 69:

Una empresa de planificación financiera ejecuta una aplicación de optimización de impuestos que permite a las personas ingresar su información financiera personal y obtener recomendaciones. La empresa está comprometida con la máxima seguridad para la información de identificación personal (PII) almacenada en buckets S3, y como parte de los requisitos de cumplimiento, necesita implementar una solución para ser alertada en caso de nueva PII y su acceso en S3.

Como AWS Certified DevOps Engineer, ¿qué solución recomendarías de tal forma que requiera MÍNIMO esfuerzo de desarrollo?

OPCIONES

A. Habilitar Amazon Macie en los buckets S3 seleccionados. Configurar alertas usando CloudWatch Events

B. Crear una función Amazon Lambda que esté integrada con Amazon SageMaker para detectar datos PII. Integrar la función Lambda con eventos S3 para solicitudes PUT

C. Configurar una política de bucket S3 que filtre solicitudes que contengan datos PII usando una declaración condicional

D. Habilitar Amazon GuardDuty en los buckets S3 seleccionados. Configurar alertas usando CloudWatch Alarms

RESPUESTA

La respuesta:

A

EXPLICACIÓN

Explicación general

Correct option:

Habilitar Amazon Macie en los buckets S3 seleccionados. Configurar alertas usando CloudWatch Events

Amazon Macie es un servicio de seguridad que utiliza machine learning para descubrir, clasificar y proteger automáticamente datos sensibles en AWS. Macie detecta automáticamente una lista amplia y en crecimiento de tipos de datos sensibles, incluyendo información de identificación personal (PII) como nombres, direcciones y números de tarjetas de crédito. También proporciona visibilidad continua sobre la seguridad y privacidad de los datos almacenados en Amazon S3.

How Macie Works:  via - [https://aws.amazon.com/macie/](https://aws.amazon.com/macie/)

Para el caso de uso dado, puedes habilitar Macie en buckets S3 específicos y luego configurar notificaciones SNS mediante eventos de CloudWatch para las alertas de Macie.

Para un análisis más profundo sobre cómo consultar datos PII usando Macie, consulta este excelente blog: [https://aws.amazon.com/blogs/security/how-to-query-personally-identifiable-information-with-amazon-macie/](https://aws.amazon.com/blogs/security/how-to-query-personally-identifiable-information-with-amazon-macie/)

Incorrect options:

Habilitar Amazon GuardDuty en los buckets S3 seleccionados. Configurar alertas usando CloudWatch Alarms - Amazon GuardDuty es un servicio de detección de amenazas que monitorea continuamente actividad maliciosa y comportamiento no autorizado para proteger tus cuentas y cargas de trabajo en AWS.

How GuardDuty Works:  via - [https://aws.amazon.com/guardduty/](https://aws.amazon.com/guardduty/)

Crear una función Amazon Lambda que esté integrada con Amazon SageMaker para detectar datos PII. Integrar la función Lambda con eventos S3 para solicitudes PUT - Amazon Lambda + SageMaker podría funcionar pero requiere un esfuerzo significativo de desarrollo y probablemente no ofrecerá resultados óptimos.

Configurar una política de bucket S3 que filtre solicitudes que contengan datos PII usando una declaración condicional - Las políticas de bucket S3 no pueden analizar el contenido de los datos en una solicitud. Esta opción ha sido agregada como distractor.

REFERENCIAS

[https://aws.amazon.com/blogs/security/how-to-query-personally-identifiable-information-with-amazon-macie/](https://aws.amazon.com/blogs/security/how-to-query-personally-identifiable-information-with-amazon-macie/)

[https://aws.amazon.com/macie/](https://aws.amazon.com/macie/)

[https://aws.amazon.com/guardduty/](https://aws.amazon.com/guardduty/)

Temática

Domain 5: Incident and Event Response

#### Pregunta 70:

Una empresa de TI está creando un sistema de reservas en línea para hoteles. El flujo de reservas que la empresa ha implementado puede tardar más de 3 horas en completarse ya que se requiere un paso de verificación manual por un proveedor externo para asegurar que las transacciones no sean fraudulentas.

Como DevOps Engineer, necesitas exponer esto como una API segura para los clientes finales. El sitio web debe ser capaz de soportar 5000 solicitudes al mismo tiempo. ¿Cómo deberías implementar esto de la forma más simple posible?

OPCIONES

A. Crear el flujo de reservas en Step Functions. Crear un stage de API Gateway usando una integración de servicio con Step Functions. Asegurar tu API usando Cognito

B. Crear el flujo de reservas en AWS Lambda. Crear un stage de API Gateway usando una integración de servicio con AWS Lambda. La función Lambda esperará la respuesta del proveedor de servicios y luego devolverá el estado a API Gateway. Asegurar tu API usando Cognito

C. Crear el flujo de reservas en AWS Lambda. Habilitar invocaciones públicas de las funciones Lambda para que los clientes puedan iniciar el proceso de reserva. La función Lambda esperará la respuesta del proveedor de servicios y luego devolverá el estado al cliente. Asegurar las llamadas usando IAM

D. Crear el flujo de reservas en Step Functions. Crear un stage de API Gateway usando una integración de servicio con AWS Lambda, la cual, a su vez, invocará el flujo de trabajo de Step Functions. Asegurar tu API usando Cognito

**RESPUESTA**

**La respuesta:**

**A**

EXPLICACIÓN

Explicación general

Correct option:

Crear el flujo de reservas en Step Functions. Crear un stage de API Gateway usando una integración de servicio con Step Functions. Asegurar tu API usando Cognito

Las APIs de API Gateway pueden invocar directamente un servicio AWS y pasarle un payload. Es una forma común de proporcionar una API pública y segura para los servicios AWS seleccionados.

Amazon API Gateway se integra con AWS Step Functions, permitiéndote llamar Step Functions mediante APIs que creas para simplificar y personalizar interfaces hacia tus aplicaciones. Step Functions facilita coordinar los componentes de aplicaciones distribuidas y microservicios como una serie de pasos en un flujo de trabajo visual. Puedes crear state machines en la consola de Step Functions o mediante la API de Step Functions para especificar y ejecutar los pasos de tu aplicación a escala. API Gateway es un servicio completamente administrado que facilita a los desarrolladores publicar, mantener, monitorear y asegurar APIs a cualquier escala.

How API Gateway Works:  via - [https://aws.amazon.com/api-gateway/](https://aws.amazon.com/api-gateway/)

How Step Functions Work:  via - [https://aws.amazon.com/step-functions/](https://aws.amazon.com/step-functions/)

Para el caso de uso dado, necesitas implementar el flujo de reservas usando Step Functions. Una razón clave es que AWS Lambda tiene un tiempo máximo de ejecución de 15 minutos, mientras que el flujo requiere más de 3 horas. Además, API Gateway puede manejar miles de solicitudes concurrentes y al integrarlo directamente con Step Functions evitas limitaciones de concurrencia de Lambda.

Incorrect options:

Crear el flujo de reservas en Step Functions. Crear un stage de API Gateway usando una integración de servicio con AWS Lambda, la cual, a su vez, invocará el flujo de trabajo de Step Functions. Asegurar tu API usando Cognito - AWS Lambda tiene un límite de ejecución y de concurrencia, y usarlo como intermediario no es necesario cuando API Gateway puede integrarse directamente con Step Functions.

Crear el flujo de reservas en AWS Lambda. Crear un stage de API Gateway usando una integración de servicio con AWS Lambda. La función Lambda esperará la respuesta del proveedor de servicios y luego devolverá el estado a API Gateway. Asegurar tu API usando Cognito

Crear el flujo de reservas en AWS Lambda. Habilitar invocaciones públicas de las funciones Lambda para que los clientes puedan iniciar el proceso de reserva. La función Lambda esperará la respuesta del proveedor de servicios y luego devolverá el estado al cliente. Asegurar las llamadas usando IAM

Las funciones Lambda no pueden manejar este flujo porque puede tardar más de 3 horas, lo cual excede el límite máximo de 15 minutos de ejecución.

REFERENCIAS

[https://docs.aws.amazon.com/step-functions/latest/dg/tutorial-api-gateway.html](https://docs.aws.amazon.com/step-functions/latest/dg/tutorial-api-gateway.html)

[https://aws.amazon.com/step-functions/faqs/](https://aws.amazon.com/step-functions/faqs/)

Temática

Domain 2: Configuration Management and IaC

#### Pregunta 71:

El equipo de tecnología en una empresa de soluciones de salud ha desarrollado una API REST que está desplegada en un Auto Scaling Group detrás de un Application Load Balancer. La API almacena la carga útil de datos en DynamoDB y el contenido estático se sirve a través de S3. Al realizar algunos análisis, se ha encontrado que el 85% de las solicitudes de lectura son compartidas entre los usuarios.

Como DevOps Engineer, ¿cómo puedes mejorar el rendimiento de la aplicación mientras reduces el costo?

OPCIONES

A. Habilitar ElastiCache Redis para DynamoDB y ElastiCache Memcached para S3

B. Habilitar DAX para DynamoDB y ElastiCache Memcached para S3

C. Habilitar DynamoDB Accelerator (DAX) para DynamoDB y CloudFront para S3

D. Habilitar ElastiCache Redis para DynamoDB y CloudFront para S3

RESPUESTA

La respuesta:

C

EXPLICACIÓN

Explicación general

Correct option:

Habilitar DynamoDB Accelerator (DAX) para DynamoDB y CloudFront para S3

DynamoDB Accelerator (DAX) es un caché en memoria completamente administrado y altamente disponible para Amazon DynamoDB que ofrece hasta 10 veces mejora en el rendimiento—de milisegundos a microsegundos—incluso con millones de solicitudes por segundo.

DAX está estrechamente integrado con DynamoDB—simplemente aprovisionas un clúster DAX, usas el SDK cliente de DAX para apuntar tus llamadas existentes de API de DynamoDB hacia el clúster DAX, y dejas que DAX maneje el resto. Debido a que DAX es compatible a nivel de API con DynamoDB, no tienes que hacer cambios funcionales en el código de tu aplicación. DAX se usa para cachear de forma nativa las lecturas de DynamoDB.

CloudFront es un servicio CDN (Content Delivery Network) que entrega contenido web estático y dinámico, streams de video y APIs alrededor del mundo, de forma segura y a gran escala. Por diseño, entregar datos desde CloudFront puede ser más rentable que entregarlos directamente desde S3 a los usuarios.

Cuando un usuario solicita contenido servido con CloudFront, la solicitud se enruta a una Edge Location cercana. Si CloudFront tiene una copia en caché del archivo solicitado, lo entrega al usuario proporcionando una respuesta rápida (baja latencia). Si el archivo no está en caché, CloudFront lo obtiene del origen, por ejemplo, el bucket S3 donde está almacenado el contenido.

Por lo tanto, puedes usar CloudFront para mejorar el rendimiento de la aplicación al servir contenido estático desde S3.

Incorrect options:

Habilitar ElastiCache Redis para DynamoDB y CloudFront para S3

Amazon ElastiCache para Redis es un almacén de datos en memoria extremadamente rápido que proporciona latencia de submilisegundos para aplicaciones en tiempo real a escala de internet. Es una excelente opción para casos como caching, mensajería, gaming, leaderboards, geoespacial, machine learning, streaming de medios, colas y analítica en tiempo real.

ElastiCache for Redis Overview:  via - [https://aws.amazon.com/elasticache/redis/](https://aws.amazon.com/elasticache/redis/)

Aunque puedes integrar Redis con DynamoDB, es mucho más complejo que usar DAX, el cual es una mejor opción en este caso.

Habilitar DAX para DynamoDB y ElastiCache Memcached para S3

Habilitar ElastiCache Redis para DynamoDB y ElastiCache Memcached para S3

Amazon ElastiCache para Memcached es un servicio de almacenamiento clave-valor en memoria compatible con Memcached que puede usarse como caché o datastore. Es útil para reducir latencia, aumentar throughput y aliviar carga de bases de datos.

ElastiCache no puede usarse para cachear contenido estático proveniente de S3, por lo tanto estas opciones son incorrectas.

REFERENCIAS

[https://aws.amazon.com/dynamodb/dax/](https://aws.amazon.com/dynamodb/dax/)

[https://aws.amazon.com/blogs/networking-and-content-delivery/amazon-s3-amazon-cloudfront-a-match-made-in-the-cloud/](https://aws.amazon.com/blogs/networking-and-content-delivery/amazon-s3-amazon-cloudfront-a-match-made-in-the-cloud/)

[https://aws.amazon.com/elasticache/redis/](https://aws.amazon.com/elasticache/redis/)

Temática

Domain 3: Resilient Cloud Solutions

#### Pregunta 72:

Como DevOps Engineer en una empresa de TI, estás buscando crear un flujo de trabajo diario de respaldo de EBS. Ese flujo de trabajo debe tomar un volumen EBS y crear un snapshot a partir de él. Cuando el snapshot sea creado, debe copiarse a otra región. En caso de que la otra región no esté disponible debido a un desastre, ese respaldo debe copiarse a una tercera región. Una dirección de correo electrónico debe ser notificada del resultado final. Existe un requerimiento de mantener un rastro de auditoría de todas las ejecuciones también.

¿Cómo puedes implementar esto de manera eficiente y de forma tolerante a fallos?

OPCIONES

A. Crear una AWS Step Function. Implementar cada paso como una función Lambda y agregar lógica de fallo entre los pasos para manejar casos condicionales

B. Crear una instancia EC2 en la región donde está el volumen EBS. Crear un script CRON que invoque un script Python que realice todos los pasos y lógica descritos anteriormente. Por cada paso completado, escribir metadatos en una tabla DynamoDB

C. Crear una regla de CloudWatch Event que se ejecute diariamente. Esta dispara una función Lambda escrita en Python que realiza todos los pasos y lógica descritos anteriormente. Analizar el historial de ejecución usando AWS Config

D. Crear una automatización de SSM que realizará cada acción. Agregar lógica de fallo entre pasos para manejar casos condicionales

**RESPUESTA**

**La respuesta:**

**A**

EXPLICACIÓN

Explicación general

Correct option:

Crear una AWS Step Function. Implementar cada paso como una función Lambda y agregar lógica de fallo entre los pasos para manejar casos condicionales

Step Functions es un servicio completamente administrado que facilita coordinar los componentes de aplicaciones distribuidas y microservicios usando flujos de trabajo visuales.

How Step Functions Work:  via - [https://aws.amazon.com/step-functions/](https://aws.amazon.com/step-functions/)

Para el caso de uso dado, necesitas combinar Step Functions, Lambda y CloudWatch Events en una solución coherente. Puedes usar Step Functions para coordinar la lógica de negocio para automatizar el flujo de gestión de snapshots con manejo de errores, lógica de reintentos y flujo de ejecución definidos dentro de la definición de Step Functions. CloudWatch Events se integra con Step Functions y Lambda para permitir ejecutar código personalizado cuando ocurren eventos relevantes.

via - [https://aws.amazon.com/blogs/compute/automating-amazon-ebs-snapshot-management-with-aws-step-functions-and-amazon-cloudwatch-events/](https://aws.amazon.com/blogs/compute/automating-amazon-ebs-snapshot-management-with-aws-step-functions-and-amazon-cloudwatch-events/)

Para un análisis más profundo de esta solución, se recomienda revisar el siguiente material de referencia: [https://aws.amazon.com/blogs/compute/automating-amazon-ebs-snapshot-management-with-aws-step-functions-and-amazon-cloudwatch-events/](https://aws.amazon.com/blogs/compute/automating-amazon-ebs-snapshot-management-with-aws-step-functions-and-amazon-cloudwatch-events/)

Incorrect options:

Crear una instancia EC2 en la región donde está el volumen EBS. Crear un script CRON que invoque un script Python que realice todos los pasos y lógica descritos anteriormente. Por cada paso completado, escribir metadatos en una tabla DynamoDB - Crear una instancia EC2 podría funcionar, pero si se termina tendrías que recrearla. Los escenarios de fallo serían difíciles de analizar y mantener un rastro de auditoría en DynamoDB probablemente no sería fácil de usar.

Crear una regla de CloudWatch Event que se ejecute diariamente. Esta dispara una función Lambda escrita en Python que realiza todos los pasos y lógica descritos anteriormente. Analizar el historial de ejecución usando AWS Config - Crear una regla de CloudWatch Event + Lambda podría funcionar, pero la función Lambda puede tener problemas de timeout si el respaldo tarda más de 15 minutos, y AWS Config no puede almacenar el historial de ejecución. AWS Config solo proporciona una vista detallada de los recursos asociados a tu cuenta AWS, incluyendo cómo están configurados, cómo se relacionan entre sí y cómo han cambiado esas configuraciones con el tiempo.

Crear una automatización de SSM que realizará cada acción. Agregar lógica de fallo entre pasos para manejar casos condicionales - Una automatización de SSM no puede contener lógica compleja para manejar fallos, aunque proporcionaría un historial de ejecución.

Un documento de automatización de SSM define las acciones que Systems Manager ejecuta en tus instancias administradas y otros recursos AWS cuando se ejecuta una automatización. Un documento contiene uno o más pasos que se ejecutan en orden secuencial. Cada paso está construido alrededor de una sola acción. La salida de un paso puede ser usada como entrada en un paso posterior. El proceso de ejecutar estas acciones y sus pasos se denomina flujo de automatización.

REFERENCIAS

[https://aws.amazon.com/blogs/compute/automating-amazon-ebs-snapshot-management-with-aws-step-functions-and-amazon-cloudwatch-events/](https://aws.amazon.com/blogs/compute/automating-amazon-ebs-snapshot-management-with-aws-step-functions-and-amazon-cloudwatch-events/)

Temática

Domain 5: Incident and Event Response

#### Pregunta 73:

El equipo DevOps en una empresa de e-commerce está trabajando con el equipo interno de seguridad para mejorar el flujo de seguridad del proceso de liberación de código. El equipo DevOps quiere iniciar una herramienta de análisis de vulnerabilidades de código de un tercero cada vez que se suba código a su repositorio CodeCommit. El código debe ser enviado vía una API externa.

Como AWS Certified DevOps Engineer, ¿cómo implementarías esto de la manera más eficiente?

OPCIONES

A. Crear un CodeCommit hook en una instancia EC2 que transmita los cambios desde CodeCommit al sistema de archivos local. Un cron job en la instancia EC2 comprimirá el código y lo enviará a la API del tercero cuando se detecten cambios

B. Crear una regla de CloudWatch Event con un cron de 5 minutos que dispare una función Lambda que verificará nuevos commits en tu repositorio CodeCommit. Si se detectan nuevos commits, descargar y comprimir el código y luego enviarlo a la API del tercero

C. Crear una regla de CloudWatch Event en tu repositorio CodeCommit que reaccione a pushes. Como target, elegir una función AWS Lambda que solicitará el código desde CodeCommit, lo comprimirá y lo enviará a la API del tercero

D. Crear una regla de CloudWatch Event en tu repositorio CodeCommit que reaccione a pushes. Como target, elegir un bucket S3 para que el código sea automáticamente comprimido en S3. Crear una regla de evento S3 para disparar una función Lambda que recuperará el código comprimido desde S3 y lo enviará a la API del tercero

RESPUESTA

La respuesta:

C

EXPLICACIÓN

Explicación general

Correct option:

Crear una regla de CloudWatch Event en tu repositorio CodeCommit que reaccione a pushes. Como target, elegir una función AWS Lambda que solicitará el código desde CodeCommit, lo comprimirá y lo enviará a la API del tercero

Amazon CloudWatch Events entrega un flujo casi en tiempo real de eventos del sistema que describen cambios en los recursos de AWS. Usando reglas simples que puedes configurar rápidamente, puedes hacer match de eventos y enrutar esos eventos a una o más funciones o streams de destino. Puedes generar eventos personalizados a nivel aplicación y publicarlos en CloudWatch Events. También puedes configurar eventos programados que se generan de forma periódica. Una regla hace match con eventos entrantes y los enruta a targets para su procesamiento.

CloudWatch Events Overview:  via - [https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/WhatIsCloudWatchEvents.html](https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/WhatIsCloudWatchEvents.html)

Para el caso de uso dado, puedes configurar una regla de CloudWatch Event para cada push al repositorio CodeCommit que dispare la función Lambda configurada como target. La función Lambda, a su vez, solicitará el código desde CodeCommit, lo comprimirá y lo enviará a la API del tercero.

Incorrect options:

Crear una regla de CloudWatch Event en tu repositorio CodeCommit que reaccione a pushes. Como target, elegir un bucket S3 para que el código sea automáticamente comprimido en S3. Crear una regla de evento S3 para disparar una función Lambda que recuperará el código comprimido desde S3 y lo enviará a la API del tercero - Las reglas de CloudWatch Event no pueden tener buckets S3 como target. Aunque puedes usar un trigger S3, eventualmente necesitarías invocar Lambda para procesar el código vía la API. Por lo tanto, es más eficiente invocar directamente la función Lambda desde la regla de CloudWatch Event.

Crear una regla de CloudWatch Event con un cron de 5 minutos que dispare una función Lambda que verificará nuevos commits en tu repositorio CodeCommit. Si se detectan nuevos commits, descargar y comprimir el código y luego enviarlo a la API del tercero - Las reglas programadas introducirían latencia y serían ineficientes.

Crear un CodeCommit hook en una instancia EC2 que transmita los cambios desde CodeCommit al sistema de archivos local. Un cron job en la instancia EC2 comprimirá el código y lo enviará a la API del tercero cuando se detecten cambios - El hook de CodeCommit en EC2 es un distractor y no existe.

REFERENCIAS

[https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/WhatIsCloudWatchEvents.html](https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/WhatIsCloudWatchEvents.html)

Temática

Domain 1: SDLC Automation

#### Pregunta 74:

Una empresa de informática forense cibernética quiere asegurarse de que CloudTrail siempre esté habilitado en su cuenta AWS. También necesita tener un rastro de auditoría del estado de CloudTrail. En caso de incumplimientos de cumplimiento, la empresa querría resolverlos automáticamente.

Como DevOps Engineer, ¿cómo puedes implementar una solución para este requerimiento?

OPCIONES

A. Colocar todos tus usuarios IAM de AWS bajo un grupo IAM llamado 'everyone'. Crear una política IAM de denegación sobre ese grupo para evitar que los usuarios usen la API DeleteTrail. Crear una regla de AWS Config que rastree si cada usuario está en ese grupo IAM. Crear una regla de CloudWatch Event para ser alertado en caso de incumplimientos, y disparar una función Lambda que agregará usuarios al grupo 'everyone' automáticamente

B. Crear una regla de AWS Config para rastrear si CloudTrail está habilitado. Crear una regla de CloudWatch Event para ser alertado en caso de incumplimientos, y disparar una función Lambda que volverá a habilitar CloudTrail

C. Colocar todos tus usuarios IAM de AWS bajo un grupo IAM llamado 'everyone'. Crear una política IAM de denegación sobre ese grupo para evitar que los usuarios usen la API DeleteTrail. Crear una regla de CloudWatch Event que disparará una función Lambda cada 5 minutos. Esa función Lambda verificará si CloudTrail está habilitado usando una llamada API y lo volverá a habilitar si es necesario

D. Crear una regla de CloudWatch Event que disparará una función Lambda cada 5 minutos. Esa función Lambda verificará si CloudTrail está habilitado usando una llamada API y lo volverá a habilitar si es necesario

**RESPUESTA**

**La respuesta:**

**B**

EXPLICACIÓN

Explicación general

Correct option:

Crear una regla de AWS Config para rastrear si CloudTrail está habilitado. Crear una regla de CloudWatch Event para ser alertado en caso de incumplimientos, y disparar una función Lambda que volverá a habilitar CloudTrail

CloudTrail proporciona visibilidad sobre la actividad de los usuarios registrando acciones realizadas en tu cuenta. CloudTrail registra información importante sobre cada acción, incluyendo quién hizo la solicitud, los servicios utilizados, las acciones realizadas, los parámetros de las acciones y los elementos de respuesta devueltos por el servicio AWS. Esta información ayuda a rastrear cambios realizados en tus recursos AWS y a solucionar problemas operativos.

via - [https://aws.amazon.com/cloudtrail/](https://aws.amazon.com/cloudtrail/)

AWS Config es un servicio completamente administrado que te proporciona un inventario de recursos AWS, historial de configuración y notificaciones de cambios de configuración para habilitar seguridad y gobernanza. Con AWS Config puedes descubrir recursos AWS existentes, exportar un inventario completo de tus recursos AWS con todos los detalles de configuración y determinar cómo un recurso estaba configurado en cualquier momento dado.

via - [https://aws.amazon.com/config/](https://aws.amazon.com/config/)

via - [https://aws.amazon.com/config/faq/](https://aws.amazon.com/config/faq/)

Necesitas tener una regla de AWS Config para mantener auditabilidad y rastrear cumplimiento a lo largo del tiempo. Puedes usar la regla administrada de Config cloudtrail-enabled para verificar si AWS CloudTrail está habilitado en tu cuenta AWS. Puedes usar las reglas administradas de Config cloudtrail-security-trail-enabled para verificar que exista al menos un trail de AWS CloudTrail definido con mejores prácticas de seguridad. Para ser alertado de problemas de cumplimiento, usa una regla de CloudWatch Event y luego conéctala a una función Lambda que volverá a habilitar CloudTrail automáticamente.

via - [https://docs.aws.amazon.com/config/latest/developerguide/cloudtrail-enabled.html](https://docs.aws.amazon.com/config/latest/developerguide/cloudtrail-enabled.html)

via - [https://docs.aws.amazon.com/config/latest/developerguide/cloudtrail-security-trail-enabled.html](https://docs.aws.amazon.com/config/latest/developerguide/cloudtrail-security-trail-enabled.html)

Incorrect options:

Colocar todos tus usuarios IAM de AWS bajo un grupo IAM llamado 'everyone'. Crear una política IAM de denegación sobre ese grupo para evitar que los usuarios usen la API DeleteTrail. Crear una regla de AWS Config que rastree si cada usuario está en ese grupo IAM. Crear una regla de CloudWatch Event para ser alertado en caso de incumplimientos, y disparar una función Lambda que agregará usuarios al grupo 'everyone' automáticamente

Colocar todos tus usuarios IAM de AWS bajo un grupo IAM llamado 'everyone'. Crear una política IAM de denegación sobre ese grupo para evitar que los usuarios usen la API DeleteTrail. Crear una regla de CloudWatch Event que disparará una función Lambda cada 5 minutos. Esa función Lambda verificará si CloudTrail está habilitado usando una llamada API y lo volverá a habilitar si es necesario

Los usuarios IAM dentro de un grupo con una política de denegación suenan como una gran idea al inicio, pero debes recordar que puedes crear roles IAM, y no tendrán esa restricción, y así podrás asumir esos roles y luego emitir llamadas API sobre CloudTrail para desactivarlo. Esta solución no funcionará y por lo tanto ambas opciones son incorrectas.

Crear una regla de CloudWatch Event que disparará una función Lambda cada 5 minutos. Esa función Lambda verificará si CloudTrail está habilitado usando una llamada API y lo volverá a habilitar si es necesario - Necesitas tener una regla de AWS Config para mantener auditabilidad y rastrear cumplimiento a lo largo del tiempo, ya que usar una función Lambda para disparar una llamada API solo te diría el estado de CloudTrail en ese momento puntual.

REFERENCIAS

[https://aws.amazon.com/cloudtrail/faqs/](https://aws.amazon.com/cloudtrail/faqs/)

[https://aws.amazon.com/config/faq/](https://aws.amazon.com/config/faq/)

[https://docs.aws.amazon.com/config/latest/developerguide/cloudtrail-enabled.html](https://docs.aws.amazon.com/config/latest/developerguide/cloudtrail-enabled.html)

[https://docs.aws.amazon.com/config/latest/developerguide/cloudtrail-security-trail-enabled.html](https://docs.aws.amazon.com/config/latest/developerguide/cloudtrail-security-trail-enabled.html)

Temática

Domain 4: Monitoring and Logging

#### Pregunta 75:

Tu empresa ha adoptado una tecnología de repositorio git para almacenar y tener control de versiones sobre el código de la aplicación. Tu empresa quiere asegurarse de que la rama de producción del código sea desplegada al entorno de producción, pero también le gustaría habilitar que otras versiones del código sean desplegadas a los entornos de desarrollo y staging para realizar varias clases de pruebas de aceptación de usuario.

Como DevOps Engineer, ¿qué solución implementarías para el requerimiento dado?

OPCIONES

A. Crear un repositorio CodeCommit para el código de desarrollo y crear un pipeline de CodePipeline que desplegará cualquier cambio en la rama master a los entornos de desarrollo y staging. Crear un segundo repositorio CodeCommit y pipeline de CodePipeline que desplegará cambios desde la rama de producción al entorno de producción después de que haya ocurrido una aprobación manual en el primer CodePipeline

B. Crear un repositorio CodeCommit y crear un pipeline de CodePipeline que desplegará cualquier cambio en la rama master a los entornos de desarrollo y staging. Crear un segundo pipeline de CodePipeline que desplegará cambios a la rama de producción al entorno de producción después de que el código sea fusionado mediante un pull request

C. Crear un repositorio CodeCommit para el código de desarrollo y crear un pipeline de CodePipeline que desplegará cualquier cambio en la rama master a los entornos de desarrollo y staging. Crear un segundo repositorio CodeCommit y pipeline de CodePipeline que desplegará cambios desde la rama de producción al entorno de producción después de que el código sea fusionado mediante un pull request

D. Crear un repositorio CodeCommit y crear un pipeline de CodePipeline que desplegará cualquier cambio en la rama master a los entornos de desarrollo y staging. Crear un paso de aprobación manual después del despliegue a staging para asegurar que la aplicación sea revisada antes de ser desplegada a producción en la última etapa del pipeline

RESPUESTA

La respuesta:

B

EXPLICACIÓN

Explicación general

Correct option:

Crear un repositorio CodeCommit y crear un pipeline de CodePipeline que desplegará cualquier cambio en la rama master a los entornos de desarrollo y staging. Crear un segundo pipeline de CodePipeline que desplegará cambios a la rama de producción al entorno de producción después de que el código sea fusionado mediante un pull request

CodeCommit es un servicio de control de código fuente seguro, altamente escalable y administrado que facilita a los equipos colaborar en el código. Un pipeline de CI/CD te ayuda a automatizar pasos en tu proceso de entrega de software, como iniciar builds automáticos y luego desplegar a instancias Amazon EC2. Puedes usar AWS CodePipeline, un servicio que construye, prueba y despliega tu código cada vez que hay un cambio en el código, basado en los modelos de proceso de liberación que defines para orquestar cada paso en tu proceso de liberación.

via - [https://aws.amazon.com/getting-started/projects/set-up-ci-cd-pipeline/](https://aws.amazon.com/getting-started/projects/set-up-ci-cd-pipeline/)

Aquí solo necesitas un repositorio git y crear una rama de producción para los despliegues a producción. El otro requerimiento clave del caso de uso dado es que dos versiones del código necesitan ser desplegadas a diferentes entornos. Como tal, necesitarás dos CodePipelines. Si tuvieras uno con un paso de aprobación manual al final, entonces el código desplegado a producción vendría de la rama master en lugar de la rama de producción. Aquí, específicamente necesitamos que el código en la rama de producción se despliegue a producción, por lo tanto, necesitamos un segundo CodePipeline y fusionar código desde master hacia producción mediante Pull Requests.

Code Pipeline Overview:  via - [https://aws.amazon.com/codepipeline/faqs/](https://aws.amazon.com/codepipeline/faqs/)

Incorrect options:

Crear un repositorio CodeCommit y crear un pipeline de CodePipeline que desplegará cualquier cambio en la rama master a los entornos de desarrollo y staging. Crear un paso de aprobación manual después del despliegue a staging para asegurar que la aplicación sea revisada antes de ser desplegada a producción en la última etapa del pipeline - Como se mencionó en la explicación anterior, un requerimiento clave es que dos versiones del código necesitan ser desplegadas a diferentes entornos. Si usas un paso de aprobación manual después del despliegue a staging, entonces la misma versión del código de la rama master también sería desplegada al entorno de producción. En cambio, necesitas mantener una rama de producción del código que pueda ser desplegada al entorno de producción.

Crear un repositorio CodeCommit para el código de desarrollo y crear un pipeline de CodePipeline que desplegará cualquier cambio en la rama master a los entornos de desarrollo y staging. Crear un segundo repositorio CodeCommit y pipeline de CodePipeline que desplegará cambios desde la rama de producción al entorno de producción después de que el código sea fusionado mediante un pull request - Es una mejor práctica trabajar con ramas en tu repositorio git para crear features, ya que ese es el uso previsto de las ramas. No crees repositorios separados para features. No deberías mantener repositorios separados para administrar dos versiones del código que necesitan ser desplegadas a diferentes entornos. La referencia a fusionar mediante un pull request ha sido agregada como distractor.

Crear un repositorio CodeCommit para el código de desarrollo y crear un pipeline de CodePipeline que desplegará cualquier cambio en la rama master a los entornos de desarrollo y staging. Crear un segundo repositorio CodeCommit y pipeline de CodePipeline que desplegará cambios desde la rama de producción al entorno de producción después de que haya ocurrido un paso de aprobación manual en el primer CodePipeline - Es una mejor práctica trabajar con ramas en tu repositorio git para crear features, ya que ese es el uso previsto de las ramas. No crees repositorios separados para features. No deberías mantener repositorios separados para administrar dos versiones del código que necesitan ser desplegadas a diferentes entornos. La referencia al paso de aprobación manual ha sido agregada como distractor.

REFERENCIAS

[https://aws.amazon.com/codecommit/faqs/](https://aws.amazon.com/codecommit/faqs/)

[https://aws.amazon.com/getting-started/projects/set-up-ci-cd-pipeline/](https://aws.amazon.com/getting-started/projects/set-up-ci-cd-pipeline/)

[https://aws.amazon.com/codepipeline/faqs/](https://aws.amazon.com/codepipeline/faqs/)

Temática

Domain 1: SDLC Automation