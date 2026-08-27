---
title: Puerta de enlace de red local
description: Ejecuta velxiogw en tu máquina y la placa simulada se une a tu red real — LAN, localhost y todo lo demás.
sidebar:
  order: 3
---

Por defecto, una placa simulada llega a internet a través de la puerta de
enlace en la nube de Velxio — pero no a tu red local. La **puerta de enlace
de red local** (`velxiogw`) elimina ese límite: un pequeño programa que
ejecutas en tu propia máquina, y el tráfico de la placa sale desde allí.
Tu broker MQTT, tu Home Assistant, la API que estás desarrollando en
`localhost` — todo accesible desde el sketch. Un plan Maker habilita el
emparejamiento.

## Configuración

1. Descarga la puerta de enlace para tu plataforma desde la
   [última versión](https://github.com/velxio/velxiogw/releases/latest)
   y ejecútala:

   ```
   $ ./velxiogw
   velxiogw 0.1.2 — Velxio IoT Network Gateway
     listening on   ws://127.0.0.1:9013
     pairing code   493028
     reach scope    your LAN + localhost + internet
     host alias     host.velxio.internal -> this machine
   ```

2. En el editor, abre el panel **WiFi** (el cursor junto al icono de
   WiFi). El panel detecta la puerta de enlace en ejecución por sí solo.

3. Escribe el **código de emparejamiento** que imprimió la puerta de
   enlace y haz clic en **Connect**. Desde la próxima ejecución, la placa
   estará en tu red.

La primera vez, Chrome pide permiso para que la página se comunique con un
dispositivo en tu red local — haz clic en **Allow**. (Safari actualmente
no lo soporta; usa Chrome, Edge o Firefox.)

## Llegar a tu propia máquina

Dentro de un sketch, el nombre de host `host.velxio.internal` siempre se
resuelve a la máquina donde se ejecuta la puerta de enlace:

```cpp
#include <HTTPClient.h>

HTTPClient http;
http.begin("http://host.velxio.internal:8000/api/reading");
int status = http.GET();
```

Cualquier otra cosa en tu LAN es accesible por su IP normal o nombre de
host sin mDNS, exactamente como desde una placa real en tu WiFi.

## Notas

- La puerta de enlace se vincula solo a tu loopback y rechaza conexiones
  sin el código de emparejamiento, por lo que nada más en tu red — ni
  ninguna otra página web — puede usarla.
- El tráfico a través de la puerta de enlace local nunca toca los
  servidores de Velxio, y suele ser más rápido al evitar el viaje de ida y
  vuelta.
- El código fuente es público en
  [github.com/velxio/velxiogw](https://github.com/velxio/velxiogw); los
  binarios son gratuitos para descargar, y el flujo de emparejamiento en
  el editor es la función del plan Maker.
- En la aplicación de escritorio Velxio Desktop nada de esto es necesario:
  la simulación ya se ejecuta en tu máquina, por lo que la placa está en
  tu red por construcción.
