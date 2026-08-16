---
title: Planes gratuitos y de pago
description: "Exactamente qué incluyen Free, Maker y Pro: créditos de IA, acceso a placas, límites de tiempo de ejecución, uso compartido, bibliotecas y facturación."
sidebar:
  order: 8
---

Velxio es gratuito y el nivel gratuito no es una demo. El editor de
circuitos, el editor de código, el catálogo de componentes, la galería de
ejemplos y los proyectos públicos ilimitados no cuestan nada, y ninguna
placa está oculta para ti.

Los planes de pago existen para las dos cosas que cuestan dinero real de
ejecutar: **el asistente de IA**, donde cada mensaje es una llamada de
modelo, y **la emulación del lado del servidor**, donde las placas STM32 y
Raspberry Pi se ejecutan como procesos QEMU reales en las máquinas de
Velxio — además de las funciones dirigidas a personas que usan Velxio
para trabajar: proyectos privados, exportaciones, integraciones y la
aplicación de escritorio sin conexión.

Los niveles son aditivos: **Pro incluye todo lo de Maker, que incluye
todo lo de Free.**

## Los tres planes

| | Free | Maker | Pro |
| --- | --- | --- | --- |
| Precio | $0 | $7 / mes | $19 / mes |
| Pago anual | — | $69 / año | $189 / año |
| Créditos de IA por día | 20 | 500 | 2,000 |
| Tope de créditos de IA por mes | 600 | 15,000 | 60,000 |
| Modos Agent y Tutor | No | Sí | Sí |
| Emulación STM32 y Raspberry Pi | No | Sí | Sí |
| Visibilidad del proyecto | Público | Público, no listado | Público, no listado, privado |
| Almacenamiento de bibliotecas | 100 MB | 500 MB | 2 GB |

Pagar anualmente cuesta aproximadamente dos meses menos que pagar el
mismo plan mensualmente. Ambas modalidades están disponibles al finalizar
la compra con tarjeta (Stripe) o PayPal.

## El asistente de IA

El asistente tiene tres modos, y no todos están restringidos de la misma
manera.

| Modo | Qué hace | Planes |
| --- | --- | --- |
| **Basic** | Responde preguntas con tu proyecto como contexto — "¿por qué no se enciende mi LED?", "¿qué significa este error del compilador?" Lee el lienzo y el código pero no los modifica. | Todos los planes, incluido Free |
| **Agent** | Actúa sobre el proyecto: añade y conecta componentes, escribe y corrige código, ejecuta la simulación para comprobar su propio trabajo. | Maker y Pro |
| **Tutor** | Enseña paso a paso sobre tu propio circuito — propone ejercicios, comprueba lo que has construido, explica la teoría. | Maker y Pro |

El modo Basic en el nivel gratuito tiene su **propio grupo de 50 mensajes
por día** que no toca tus créditos de IA. Así que una cuenta gratuita no
se limita a 20 interacciones de IA al día — obtiene 50 mensajes de chat
Basic más 20 créditos.

### Cómo se cuentan los créditos de IA

Los créditos (que se muestran como el contador en la parte inferior del
panel de chat) miden el trabajo que hacen los modos Agent y Tutor:

- Una solicitud normal cuesta **1 crédito**.
- Una solicitud grande — una que supera aproximadamente 30,000 tokens de
  contexto, como una conversación larga sobre un sketch grande — cuesta
  proporcionalmente más, por lo que un solo mensaje pesado puede gastar
  varios créditos.
- El contador diario **se restablece a medianoche UTC**. Los créditos no
  utilizados no se acumulan.
- El tope mensual es un segundo límite independiente además del diario.
- Las finalizaciones de código en línea en el editor se miden por
  separado y nunca gastan créditos de agente.

Consulta la [sección del asistente de IA](/docs/es/ai/overview/) para saber
qué puede hacer realmente cada modo.

## Placas y simulación

**Cada placa del catálogo es visible y editable en todos los planes**, y
la mayoría de ellas también *se ejecutan* en todos los planes. Dos
familias son la excepción, porque son las más caras de alojar:

| Familia de placas | Dónde se ejecuta | Free | De pago |
| --- | --- | --- | --- |
| Arduino / AVR, RP2040 / RP2350 (Pico, Badger 2350) | Tu navegador | Sí, sin límite de tiempo | Sí |
| Familia ESP32 (clásico, S3, C3, C6), M5Stack, XIAO | Servidores de Velxio | Sí, 1 hora por ejecución | Sí, sin límite por ejecución |
| **STM32** (Blue Pill, Black Pill, F4 Discovery…) | Servidores de Velxio | No | Sí |
| **Raspberry Pi Linux** (Zero, 1, 2, 3, 4, 5, UNIHIKER) | Servidores de Velxio | No | Sí |

Las placas que necesitan un plan de pago son exactamente la familia STM32
y la familia Raspberry Pi Linux — llevan una **insignia PRO** en el
selector de componentes. Las placas de marca como la M5Stack Cardputer, la
Pimoroni Badger 2350 o la familia XIAO **no** están sujetas a pago,
aunque formen parte del catálogo alojado.

Dos límites se aplican a todos, incluidos los de pago:

- Una simulación que permanece **inactiva durante 2 horas** se detiene
  automáticamente.
- Una sesión de Raspberry Pi tiene un **tope máximo de 2 horas** por
  sesión.

Algunas funciones individuales también necesitan un plan de pago:
emulación WiFi de Pico W, carga de archivos a una tarjeta microSD
simulada, la puerta de enlace IoT privada y un pequeño conjunto de
componentes premium (muestran la insignia PRO en el selector).

## Proyectos y uso compartido

| | Free | Maker | Pro |
| --- | --- | --- | --- |
| Proyectos públicos (listados en la galería) | Ilimitados | Ilimitados | Ilimitados |
| Proyectos no listados (solo enlace, ocultos de la galería) | No | Sí | Sí |
| Proyectos privados (solo tú) | No | No | Sí |
| Incrustar sin la insignia "Powered by Velxio" | No | No | Sí |
| Historial y reproducción de simulación | No | No | Sí |

Si un plan de pago caduca, **no se elimina nada**. Los proyectos que ya
son privados o no listados mantienen esa visibilidad — simplemente no
puedes crear nuevos ni cambiar la visibilidad de un proyecto hasta que te
suscribas de nuevo.

## Bibliotecas y compilación

Compilar con `arduino-cli` e instalar bibliotecas a través del Library
Manager funciona en todos los planes. Lo que cambia es el almacenamiento
y cómo se incorporan las bibliotecas:

| | Free | Maker | Pro |
| --- | --- | --- | --- |
| Library Manager + compilación | Sí | Sí | Sí |
| Almacenamiento para bibliotecas instaladas y cargadas | 100 MB | 500 MB | 2 GB |
| Cargar tu propia biblioteca como `.zip` | No | Sí | Sí |
| Cola de compilación prioritaria en horas punta | No | Sí | Sí |

Consulta [Bibliotecas](/docs/es/programming/libraries/) para saber cómo se
calcula la cuota.

## Escritorio, exportaciones e integraciones

| | Free | Maker | Pro |
| --- | --- | --- | --- |
| Velxio Desktop, sin conexión (Linux, Windows, macOS) | No | Sí | Sí |
| Puerta de enlace IoT privada | No | Sí | Sí |
| Constructor de piezas personalizadas con IA — programa tus propios chips simulables | No | No | Sí |
| Exportación de lista de materiales (CSV, lista para Mouser o Digi-Key) | No | No | Sí |
| Exportación de esquemático (PNG) | No | No | Sí |
| [Sincronización con GitHub](/docs/es/getting-started/github-sync/) | No | No | Sí |
| Soporte directo del mantenedor | No | No | Sí |

## Prueba gratuita

Puedes probar los modos Agent y Tutor **gratis durante 7 días**, sin
tarjeta. La prueba se ejecuta con 500 créditos por día — la misma
asignación diaria que Maker — y desbloquea el conjunto de funciones de Pro
para que puedas evaluarlo todo. Una prueba por cuenta; actívala desde la
[página de precios](https://velxio.dev/pricing).

## Facturación

- **Métodos de pago**: tarjeta a través de Stripe Checkout, o PayPal.
  Ambos admiten facturación mensual y anual.
- **Cancela cuando quieras**, desde el portal de suscripción en el menú
  de tu cuenta. Cancelar detiene la próxima renovación; conservas el
  acceso hasta el final del período que ya pagaste.
- **Reembolsos**: dentro de los 14 días posteriores al cargo más reciente,
  sin hacer preguntas. Envía un correo a davidmonterocrespo24@gmail.com.
- **Cambio de nivel**: cancela la suscripción actual primero y luego
  suscríbete a la otra.

Las instrucciones paso a paso están en
[Suscripción y facturación](/docs/es/account/subscription/).

## Aulas e instituciones

[Velxio for Classroom](https://velxio.dev/for-schools) ofrece a cada
estudiante de un curso acceso completo a Pro bajo un contrato
institucional, desde $40 por estudiante al año con descuentos por volumen.

## Autoalojamiento

Velxio es de código abierto bajo AGPLv3, y la aplicación alojada en
velxio.dev se construye a partir de esa misma fuente. Puedes ejecutarlo tú
mismo gratis — los planes de pago financian el servicio alojado, los
servidores de emulación y los proveedores de IA que hay detrás.

Para ver los precios actuales y finalizar la compra, consulta la
[página de precios](https://velxio.dev/pricing).
