# AWS DevOps DOP-C02 Study Workspace

Workspace privado para preparar `AWS Certified DevOps Engineer - Professional (DOP-C02)` con:

- banco de preguntas verificado
- notas de estudio curadas
- app Angular de microaprendizaje
- simulador completo de examen

## Que incluye

### 1. Banco de estudio

- [data/question_bank.json](data/question_bank.json)
  Banco principal normalizado. Es la fuente del simulador verificado.

### 2. Notas de estudio

- [1. Conceptos-clave.md](notes/1.%20Conceptos-clave.md)
- [2. Matriz-decision-dop-c02.md](notes/2.%20Matriz-decision-dop-c02.md)
- [3. Patrones-y-trampas-del-examen.md](notes/3.%20Patrones-y-trampas-del-examen.md)
- [huecos-temario-oficial.md](notes/huecos-temario-oficial.md)

Estas notas son la base del material didáctico de la app.

### 3. App de estudio

- [study-app](study-app)

Incluye:

- microcards de conceptos, decisiones y trampas
- mini quiz
- repaso de errores
- lectura de notas dentro de la app
- links oficiales de apoyo
- simulador completo de examen AWS DevOps

## Estructura del repo

- `data/`
  Banco de preguntas y datos fuente.
- `notes/`
  Material de estudio consolidado.
- `prompts/`
  Prompts de apoyo para agentes y mantenimiento.
- `study-app/`
  Aplicación Angular para estudiar y simular examen.
- `.run/`
  Configuraciones compartidas para WebStorm.

## Como arrancar la app

Desde `study-app/`:

```powershell
npm install
npm run start
```

Abrir en:

```text
http://localhost:4200
```

## Como exponerla en tu red local

```powershell
cd study-app
npm run start:lan
```

Luego abrir desde otro dispositivo en la misma red:

```text
http://TU_IP_LOCAL:4200
```

Guia corta:

- [LOCAL-NETWORK.md](study-app/LOCAL-NETWORK.md)

## Modos de estudio de la app

- `Solo aprender`
  Feed corto para asimilar conceptos y comparaciones.
- `Sesion rapida`
  Mezcla aprendizaje y respuesta.
- `Mini quiz`
  Solo cards de evaluacion.
- `Repasar errores`
  Prioriza cards marcadas a repaso.
- `Examen completo`
  Simulador cronometrado de 75 preguntas.

## Bancos del simulador

### Banco verificado

Generado desde:

- [question_bank.json](data/question_bank.json)

Asset resultante:

- [simulator-bank.json](study-app/public/assets/simulator-bank.json)

### Banco publico suplementario

- [simulator-bank-public.json](study-app/public/assets/simulator-bank-public.json)

Es un banco adicional para practicar mas. No sustituye al verificado.

## Scripts utiles

Desde `study-app/`:

```powershell
npm run build
node .\scripts\audit-simulator-banks.js
node .\scripts\sync-notes-assets.js
```

## Criterio del proyecto

- priorizar calidad del material sobre features
- evitar sobreingenieria
- estudiar con formato de atencion corta
- mantener el simulador alineado al banco principal
- no mezclar progreso real con medicion engañosa

## Estado

`v1` utilizable para estudio diario serio.
