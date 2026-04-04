# Study App

Aplicacion Angular para estudiar `AWS DevOps Engineer Professional (DOP-C02)`.

## Que hace

- microcards de aprendizaje
- mini quiz
- repaso de errores
- lectura de notas dentro de la app
- links oficiales de apoyo
- simulador completo de examen

## Arranque

```powershell
npm install
npm run start
```

Abrir en:

```text
http://localhost:4200
```

## Red local

```powershell
npm run start:lan
```

Luego abre:

```text
http://TU_IP_LOCAL:4200
```

Mas detalle:

- [LOCAL-NETWORK.md](LOCAL-NETWORK.md)

## Build

```powershell
npm run build
```

## Auditoria de simuladores

```powershell
node .\scripts\audit-simulator-banks.js
```

## Assets principales

- `public/assets/cards.json`
- `public/assets/simulator-bank.json`
- `public/assets/simulator-bank-public.json`
- `public/assets/notes-index.json`
- `public/assets/official-links.json`
