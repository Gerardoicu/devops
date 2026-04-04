# Uso en red local

## Levantar la app en LAN

Desde WebStorm:

- usa la configuracion `Study App LAN Dev Server`

Desde terminal:

```powershell
cd C:\Users\gerardo\OneDrive\Documents\agente-aws-devops\study-app
npm.cmd run start:lan
```

Esto hace que Angular escuche en `0.0.0.0:4200` y no solo en `localhost`.

## Abrirla desde el celular

1. Asegurate de que la laptop y el celular esten en la misma red Wi-Fi.
2. Saca la IP local de tu laptop:

```powershell
ipconfig
```

3. Busca la direccion IPv4 de tu adaptador Wi-Fi. Sera algo como:

```text
192.168.1.25
```

4. En el celular abre:

```text
http://192.168.1.25:4200
```

## Si no abre

- revisa que ambos dispositivos esten en la misma red
- revisa que Windows Firewall permita conexiones al puerto `4200`
- vuelve a correr el servidor con `start:lan`

## Sin internet

La app funciona dentro de tu red local aunque no haya internet externo, siempre que:

- la laptop ya tenga dependencias instaladas
- el servidor local este levantado
- el celular pueda ver la IP local de la laptop

No necesita backend ni servicios en la nube para funcionar.
