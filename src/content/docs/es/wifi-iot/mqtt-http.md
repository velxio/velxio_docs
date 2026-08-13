---
title: Proyectos MQTT y HTTP
description: Habla con brokers y APIs reales desde tu placa simulada.
sidebar:
  order: 3
---

Con [WiFi conectado](/docs/es/wifi-iot/esp32-wifi/), tu ESP32 simulado
puede ejecutar cargas de trabajo IoT reales. La galería de ejemplos tiene
una categoría completa **ESP32 MQTT** lista para abrir y ejecutar.

## MQTT

El flujo clásico de PubSubClient funciona sin cambios: únete a `Velxio-GUEST`,
conéctate a un broker público, publica y suscríbete. Abre los ejemplos de
MQTT de la galería para ver:

- publicación de lecturas de sensores en un temporizador,
- suscripción a un tema y control de una salida a partir de mensajes recibidos,
- un intercambio completo de panel bidireccional contra un broker público.

Debido a que el broker es real, puedes ver los mensajes de tu placa simulada
llegar a tu teléfono o portátil con cualquier cliente MQTT — y publicar de
vuelta a él.

## HTTP

`HTTPClient` (Arduino) y `urequests` (MicroPython) funcionan contra
endpoints reales: obtén una API REST, descarga un archivo, envía un webhook.
Mantén las cargas útiles razonables — el chip emulado tiene los mismos
límites de RAM que el real.

## Notas y límites

- El AP es **abierto** (sin contraseña) y proporciona acceso a Internet
  mediante NAT — no hay acceso entrante a tu placa simulada desde Internet.
- DNS, TCP, UDP y TLS se comportan como en el hardware; los apretones de
  manos TLS pesados consumen tiempo real de CPU emulada, así que espera
  que tarden un momento.
- Si una conexión falla, revisa primero el monitor serie — las líneas de
  registro de la pila WiFi (`wifi:connected`, `got ip`) te indican qué
  paso no ocurrió.
