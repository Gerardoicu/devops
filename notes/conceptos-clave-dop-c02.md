# Conceptos Clave DOP-C02

Lista corta de conceptos que deben estar claros para responder preguntas de examen con criterio arquitectonico y evitar confusiones entre servicios parecidos.

## Prioridad Alta

### CNAME swap en Elastic Beanstalk
- Que es: intercambio del nombre DNS canonico entre dos entornos de Beanstalk.
- Para que sirve: redirigir trafico del entorno blue al entorno green sin redeplegar en el mismo entorno.
- Patron correcto: dos entornos separados, desplegar en green, validar, hacer `CNAME swap`.
- Trampa comun: confundirlo con `immutable deployment` o asumir que `CloudFormation` hace ese swap de forma nativa.

### Elastic Beanstalk Blue/Green vs Immutable
- Blue/Green: dos entornos distintos y cambio de trafico via `CNAME swap`.
- Immutable: mismo entorno logico, nuevas instancias dentro del despliegue; mejora seguridad del release pero no es Blue/Green real.
- Regla mental: si la pregunta exige cambio de trafico entre entornos, piensa Blue/Green; si exige despliegue mas seguro dentro del mismo entorno, piensa immutable.

### Elastic Beanstalk Blue/Green vs CodeDeploy Blue/Green
- Beanstalk Blue/Green: se modela con dos entornos Beanstalk y `CNAME swap`.
- CodeDeploy Blue/Green: se modela con deployment groups, load balancer y control de trafico del despliegue.
- Trampa comun: ver "Blue/Green" y saltar a `CodeDeploy` aunque la aplicacion este en Beanstalk.

### CodeDeploy rollback con CloudWatch
- CodeDeploy no hace rollback automatico por una metrica directa.
- Necesita una `CloudWatch alarm`.
- Regla mental: `metric -> alarm -> CodeDeploy rollback`.

### Elastic Beanstalk Worker Tier
- Se modela como un entorno worker separado del web tier.
- Usa `SQS` para desacoplar trabajo asincrono.
- Si el payload excede limites practicos de mensajeria, se guarda en `S3` y se manda una referencia por `SQS`.
- Trampa comun: creer que web tier y worker tier viven como "subtiers" dentro del mismo entorno.

### CodePipeline por ramas y entornos
- Si produccion debe desplegar solo desde la rama `production`, necesitas un pipeline que observe esa rama.
- Una aprobacion manual al final de un pipeline disparado por `master` no cambia el origen del artefacto.
- Regla mental: la rama que dispara el pipeline define el codigo que termina desplegado.

## Prioridad Media

### Stage failure vs Pipeline failure en CodePipeline
- No son equivalentes para eventos y automatizaciones.
- Varias preguntas dependen de leer exactamente si el evento es a nivel stage o a nivel pipeline.

### Pull Request automation en CodeCommit
- Distinguir entre eventos de PR, merge a rama objetivo y resultado de `CodeBuild`.
- Muchas opciones incorrectas mezclan bien el patron event-driven pero fallan en el evento exacto.

## Uso

- Revisar esta lista antes de simulador o bloque de repaso.
- Agregar aqui cada nuevo concepto que produzca errores repetidos o baja confianza.
- Si un concepto deja de fallarse consistentemente, puede bajar de prioridad pero no borrarse.
