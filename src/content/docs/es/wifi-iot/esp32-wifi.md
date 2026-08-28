---
title: WiFi ESP32 en el simulador
description: "Conéctate a una red desde un ESP32 simulado, transmite tu propio SSID, captura el tráfico como PCAP y llega a tu LAN real."
sidebar:
  order: 2
---

Las placas ESP32 en Velxio vienen con **WiFi funcional**. La radio emulada
escanea, se asocia, obtiene una dirección IP por DHCP y llega a internet a
través de la puerta de enlace NAT del emulador. Es la pila WiFi real del SDK
del proveedor ejecutándose en una radio emulada, no un simulacro: el mismo
sketch, sin cambios, se ejecuta en el chip físico.

Esta página va desde una primera conexión hasta tus propias redes, capturas
de paquetes y tu LAN real.

## Tu primera conexión

1. Abre el ejemplo de la galería **Connect to WiFi**
   ([`/example/esp32-wifi-connect`](/example/esp32-wifi-connect)), o coloca
   cualquier placa ESP32 en el lienzo y pega el siguiente sketch.
2. Pulsa **Run**. La primera compilación de una sesión tarda más; las
   siguientes se almacenan en caché.
3. Abre el monitor **Serial** desde la barra de herramientas bajo el lienzo.
4. Observa la conexión: el propio mensaje de arranque del SDK y luego la
   concesión DHCP.

```cpp
#include <WiFi.h>

const char* WIFI_SSID = "Velxio-GUEST";  // red integrada, abierta

void setup() {
  Serial.begin(115200);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID);

  Serial.print("Connecting");
  while (WiFi.status() != WL_CONNECTED) {
    delay(250);
    Serial.print(".");
  }

  Serial.printf("\nConnected. IP: %s\n", WiFi.localIP().toString().c_str());
  Serial.printf("Gateway:      %s\n", WiFi.gatewayIP().toString().c_str());
  Serial.printf("RSSI:         %d dBm\n", WiFi.RSSI());
}

void loop() {}
```

El monitor serie muestra la conexión y la dirección que el servidor DHCP
emulado ha asignado:

![Monitor serie: Conectando a Espressif, luego Conectado con IP 10.13.37.42, la dirección MAC y la intensidad de la señal](../../../../assets/docs/wifi-iot/serial-wifi.png)

Hay algo que sorprende a todo el mundo la primera vez: el registro dice
`Connecting to Espressif` aunque el sketch nombre a `Velxio-GUEST`. Eso
es el reescritor de SSID haciendo su trabajo, y la siguiente sección lo
explica.

La IP es real dentro de la simulación: los sockets, los clientes HTTP y las
bibliotecas MQTT funcionan a partir de aquí. Consulta [MQTT y HTTP](/docs/es/wifi-iot/mqtt-http/)
para ver proyectos completos.

## Las redes integradas

Sin ninguna parte de punto de acceso en el lienzo, la radio emite balizas de
cuatro redes de demostración. Una estación se asocia con exactamente una de
ellas:

| SSID            | Canal | Señal   | Autenticación |
| --------------- | ----- | ------- | ------------- |
| `Velxio-GUEST`  | 6     | -20 dBm | Abierta       |
| `PICSimLabWifi` | 1     | -25 dBm | WPA2-PSK      |
| `Espressif`     | 5     | -30 dBm | WPA2-PSK      |
| `MasseyWifi`    | 10    | -40 dBm | WPA2-PSK      |

### El SSID en tu sketch no importa

Mientras el proyecto no tenga una parte de punto de acceso, el nombre de red
que escribes **no** es al que se une la placa. De camino al emulador, el
compilador reescribe cada literal de SSID a `Espressif` y vacía cada literal
de contraseña, ya sea una variable, un array, un `#define` o un campo de
estructura:

```cpp
const char* ssid = "MyHomeNetwork";   // compilado como "Espressif"
#define WIFI_PASS "hunter2"           // compilado como ""
```

Por eso un sketch copiado de cualquier tutorial se conecta aquí sin ser
editado, por qué pasar una contraseña incorrecta nunca falla, y por qué el
registro serie nombra una red que no has escrito. No pasa nada malo cuando
eso ocurre.

Dos consecuencias que vale la pena conocer:

- **Añadir una parte de punto de acceso desactiva el reescritor.** A partir
  de entonces, el proyecto define su propio espacio radioeléctrico, así que
  lo que escribes es lo que existe y el SSID tiene que coincidir con una
  parte.
- **El firmware que llega ya compilado nunca pasa por el reescritor.**
  Busca el SSID incrustado en el binario, por lo que un `.bin` que por lo
  demás funciona puede quedarse ahí sin asociarse. O bien recompílalo
  nombrando una de las cuatro redes anteriores, o bien emite el SSID que
  espera con una parte de punto de acceso.

## MicroPython

```python
import network
import time

WIFI_SSID = "Velxio-GUEST"

sta = network.WLAN(network.STA_IF)
sta.active(True)
sta.connect(WIFI_SSID)

while not sta.isconnected():
    time.sleep(0.25)

print("Connected. ifconfig:", sta.ifconfig())
```

`sta.scan()` devuelve las mismas redes que ve la API de Arduino, como
tuplas `(ssid, bssid, channel, rssi, authmode, hidden)`.

## Tus propias redes

Con un plan Maker no estás limitado a las redes de demostración. Una parte
**WiFi Access Point** hace que la radio emulada emita **tu** SSID.

1. Haz clic en **Add Component** en la barra de herramientas del lienzo.
2. Busca `WiFi Access Point` y colócalo. No necesita cableado: no tiene
   pines, es espacio radioeléctrico.
3. Selecciona la parte y establece **ssid** a la red que quieras, por
   ejemplo `HomeNet`.
4. Apunta el sketch a ese nombre y pulsa **Run**.

```cpp
WiFi.begin("HomeNet");   // el SSID en tu parte de Access Point
```

![Una parte de WiFi Access Point en el lienzo junto a una placa ESP32, emitiendo HomeNet en el canal 6](../../../../assets/docs/wifi-iot/access-point-part.png)

**En cuanto un proyecto contiene una parte de punto de acceso, las redes
integradas se silencian.** Un escaneo entonces ve exactamente lo que define
el lienzo, que es lo que hace comprobable el código de selección de red.

### Propiedades de la parte

| Propiedad | Valor por defecto | Qué hace                                                                                  |
| --------- | ----------------- | ----------------------------------------------------------------------------------------- |
| `ssid`    | `MyNetwork`       | El nombre de red al que se conecta tu sketch.                                              |
| `password`| vacío             | Se almacena y se muestra en la tarjeta. La red sigue emitiendo autenticación abierta hasta que llegue WPA2, así que los sketches que pasan una contraseña se conectan de todos modos. |
| `channel` | `6`               | Canal WiFi, del 1 al 13. Lo informan los escaneos.                                         |
| `rssi`    | `-50`             | Intensidad de la señal en dBm tal como la ve la placa, de -90 a -20. Los escaneos repetidos varían unos pocos dB como lo hacen los reales. |
| `internet`| activado          | Desactivado hace que la red esté aislada: la placa se asocia y obtiene una IP, pero nada sale. |
| `bssid`   | vacío             | Dirección MAC del AP. Vacío significa una estable generada a partir del SSID.              |

Pruébalo con un clic: **Connect to your own WiFi network**
([`/example/esp32-custom-wifi-ap`](/example/esp32-custom-wifi-ap)) se abre
con la parte ya colocada. Al ejecutarlo, escanea, encuentra exactamente tu
red y se une a ella:

![Monitor serie: el escaneo lista solo HomeNet, luego la placa se conecta y obtiene una IP](../../../../assets/docs/wifi-iot/custom-ap-serial.png)

### Varias redes a la vez

Añade una parte por red para probar un selector o una política de "la más
fuerte primero". Cada una lleva su propio canal y señal, así que un escaneo
vuelve ordenado como lo haría uno real:

```cpp
int n = WiFi.scanNetworks();
for (int i = 0; i < n; i++) {
  Serial.printf("%2d: %-16s ch %2d  %d dBm\n",
                i + 1, WiFi.SSID(i).c_str(), WiFi.channel(i), WiFi.RSSI(i));
}
```

**Scan several WiFi networks**
([`/example/esp32-wifi-scan-multi`](/example/esp32-wifi-scan-multi)) incluye
tres partes: `HomeNet` a -40 dBm, `Office_5G` a -62 dBm y `CoffeeShop` a
-78 dBm.

### Portales cautivos y aprovisionamiento

Desactiva **internet** en una parte y la red se vuelve aislada. La placa se
asocia y obtiene una concesión DHCP, pero ningún tráfico sale. Ese es el
escenario de aprovisionamiento: el dispositivo se inicia, no encuentra
salida y sirve su propia página de configuración.

**Captive portal on an isolated network**
([`/example/esp32-wifi-captive-portal`](/example/esp32-wifi-captive-portal))
configura esto con un AP llamado `SetupAP`.

## El panel WiFi

Aparece una insignia WiFi en la barra de herramientas del lienzo **cuando
pulsas Run**, y desaparece al pulsar Stop: pertenece a la simulación en
ejecución, así que no hay nada que abrir antes de iniciar una. Es gris
mientras la pila arranca y verde una vez que la placa tiene una dirección.

La insignia es un botón dividido. El icono mantiene su acción de un clic:
con una IP, abre el servidor web de la placa a través de la puerta de enlace
IoT. El cursor junto a él abre el **panel WiFi**:

![El panel WiFi mostrando las redes en el aire para este proyecto, Download PCAP y la sección de puerta de enlace local](../../../../assets/docs/wifi-iot/wifi-panel.png)

El panel muestra:

- **Redes en el aire**, con canal y señal. El encabezado dice
  *este proyecto* cuando las partes de punto de acceso las definen, y
  *integradas* cuando las cuatro redes de demostración están en el aire:

  ![El panel WiFi listando las cuatro redes integradas con sus canales e intensidades de señal](../../../../assets/docs/wifi-iot/wifi-panel-builtin.png)

- el estado de asociación de la placa y su IP una vez que DHCP completa;
- **Download PCAP**, el tráfico 802.11 de la ejecución como archivo de
  captura;
- la sección de [puerta de enlace de red local](/docs/es/wifi-iot/local-gateway/).
  En un plan Maker contiene el campo de emparejamiento; en el plan gratuito
  explica qué hace la puerta de enlace y enlaza a los planes.

### Captura el tráfico y ábrelo en Wireshark

1. Pulsa **Run** y deja que el sketch haga su trabajo de red.
2. Abre el panel WiFi y haz clic en **Download PCAP**.
3. Abre el archivo en Wireshark.

La captura contiene tramas de gestión, DHCP, DNS y TCP, con marcas de tiempo
simuladas, así que `dhcp` o `dns` como filtro de visualización aísla el
apretón de manos que estás depurando. El archivo se produce en tu navegador:
no se sube nada.

## Llegar a tu propia máquina

Las redes anteriores enrutan a internet público. Para llegar al broker MQTT,
Home Assistant o servidor de desarrollo que se ejecuta en **tu** máquina,
ejecuta la puerta de enlace local: consulta [Puerta de enlace de red local](/docs/es/wifi-iot/local-gateway/).
Los sketches entonces llegan a tu máquina como `host.velxio.internal`.

## Ejemplos listos para usar

| Ejemplo                                                                     | Qué muestra                                        |
| --------------------------------------------------------------------------- | -------------------------------------------------- |
| [Connect to WiFi](/example/esp32-wifi-connect)                              | La conexión mínima a una red integrada             |
| [Scan WiFi networks](/example/esp32-wifi-scan)                              | `scanNetworks()` contra el conjunto integrado      |
| [Connect to your own WiFi network](/example/esp32-custom-wifi-ap)           | Una parte de punto de acceso, escaneo y conexión   |
| [Scan several WiFi networks](/example/esp32-wifi-scan-multi)                | Tres redes con diferentes canales y señal          |
| [Captive portal on an isolated network](/example/esp32-wifi-captive-portal) | `internet` desactivado, flujo de aprovisionamiento |
| [NTP clock over your WiFi](/example/esp32-wifi-ntp-clock)                   | UDP saliente a un servidor de tiempo real          |
| [Fetch JSON from a web API](/example/esp32-wifi-http-json)                  | HTTPClient contra una API REST real                |
| [Reach a service on your own network](/example/esp32-wifi-local-http)       | `host.velxio.internal` a través de la puerta de enlace local |
| [MQTT](/example/esp32-wifi-mqtt)                                            | Publicar y suscribirse en un broker público        |

## Solución de problemas

| Síntoma                                             | Causa                                                                     | Solución                                                                   |
| --------------------------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| El firmware subido nunca se asocia                   | Su SSID está incrustado, así que el compilador no pudo reescribirlo        | Nombra una red integrada, o añade una parte de punto de acceso con ese SSID |
| Un escaneo devuelve solo tus redes                   | Funciona como se espera: una parte de punto de acceso silencia el conjunto integrado | Elimina las partes para recuperar las redes de demostración                |
| Se asocia y obtiene una IP, pero nada sale           | La parte tiene **internet** desactivado                                    | Actívalo, a menos que estés probando un portal cautivo                      |
| Una contraseña no es rechazada                       | La emulación WPA2 aún no está, la red emite autenticación abierta          | Esperado por ahora; la contraseña se almacena en la parte                   |
| `host.velxio.internal` no se resuelve                | No hay puerta de enlace local emparejada                                   | Consulta [Puerta de enlace de red local](/docs/es/wifi-iot/local-gateway/)     |

## Qué placas

WiFi está disponible en toda la familia ESP32 simulada: las placas ESP32
clásicas, ESP32-S3, ESP32-C3, ESP32-C6 y ESP32-C5, además de sus variantes
XIAO, Nano y M5Stack. La Raspberry Pi Pico W tiene su propia
[emulación CYW43](/docs/es/boards/pico/). El estado de publicidad Bluetooth
también se informa para sketches que inicializan BLE.
