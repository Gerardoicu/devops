# AWS DOP-C02 Study Workspace

Proyecto base para administrar un banco de preguntas de `AWS Certified DevOps Engineer - Professional (DOP-C02)` con persistencia local.

## Estructura

- `prompts/devops.md`: prompt operativo principal del mentor/agente.
- `prompts/preguntas.md`: banco fuente en Markdown.
- `data/question_bank.json`: banco de preguntas normalizado.
- `data/study_state.json`: estado de progreso, repaso y patrones de aprendizaje.
- `data/session_history.json`: historial resumido de sesiones.
- `data/error_patterns_catalog.json`: catálogo inicial de trampas/patrones frecuentes.
- `notes/conceptos-clave-dop-c02.md`: glosario corto de conceptos y trampas de alto valor para el examen.
- `schemas/question.schema.json`: contrato JSON para preguntas.
- `schemas/study_state.schema.json`: contrato JSON para estado de estudio.

## Convención de trabajo

1. Las preguntas nuevas se convierten primero a JSON.
2. Se propone rango de IDs antes de cargar.
3. El progreso se actualiza sin reiniciar el banco.
4. Las repeticiones ocurren solo por repaso útil o petición explícita.
5. En modo estudio, las opciones pueden mostrarse en orden aleatorio, pero cada letra y respuesta correcta interna se mantiene intacta.

## Cómo empezar cada sesión

Usa uno de estos mensajes al abrir el agente:

- `reanuda desde la última sesión`
- `hazme la siguiente`
- `repasemos solo las falladas`
- `muéstrame mis patrones de error`
- `simulador de 10 preguntas`

## Formato recomendado al responder

Para que el agente aprenda mejor de ti, responde así cuando puedas:

- `B`
- `A y D`
- `Creo que C, confianza 2/5`
- `B, tardé 40s`
- `A y E, confianza 4/5`

## Flujo mínimo recomendado

1. Empieza con `reanuda desde la última sesión`.
2. Responde una pregunta por turno.
3. Si dudaste, indica confianza.
4. Si una explicación te ayudó o no, dilo.
5. Cierra con `muéstrame mis debilidades actuales`.
