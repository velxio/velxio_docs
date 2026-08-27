---
title: WiFi do ESP32 no simulador
description: Conecte-se à rede integrada Velxio-GUEST e alcance a internet real a partir de um ESP32 simulado.
sidebar:
  order: 2
---

As placas ESP32 no Velxio vêm com **WiFi funcional**: o rádio emulado vê
um ponto de acesso aberto chamado **`Velxio-GUEST`**, associa-se, obtém um
endereço IP via DHCP e alcança a internet através do gateway NAT do
emulador. O mesmo sketch exato roda no chip físico.

## Arduino

```cpp
#include <WiFi.h>

const char* WIFI_SSID = "Velxio-GUEST";  // open AP, no password

void setup() {
  Serial.begin(115200);
  WiFi.begin(WIFI_SSID);
  while (WiFi.status() != WL_CONNECTED) { delay(250); Serial.print("."); }
  Serial.printf("\nConnected! IP: %s\n", WiFi.localIP().toString().c_str());
}
```

O monitor serial mostra o familiar bate-papo de inicialização `wifi:connected` e
a concessão DHCP — porque _é_ a pilha WiFi real em execução:

![Monitor serial durante uma conexão WiFi](../../../../assets/docs/wifi-iot/serial-wifi.png)

## MicroPython

```python
import network

WIFI_SSID = "Velxio-GUEST"

sta = network.WLAN(network.STA_IF)
sta.active(True)
sta.connect(WIFI_SSID)
while not sta.isconnected():
    pass
print("Connected, IP:", sta.ifconfig()[0])
```

## Suas próprias redes: pontos de acesso personalizados

Com um plano Maker, você não está limitado às redes de demonstração integradas: adicione
uma parte **WiFi Access Point** à tela (pesquise "WiFi Access Point" no
seletor de partes) e o rádio emulado transmite **seu SSID** em vez disso. O
sketch então se conecta à rede que ele realmente nomeia:

```cpp
WiFi.begin("HomeNet", "");   // the SSID on your Access Point part
```

![Uma parte WiFi Access Point na tela ao lado de um ESP32, transmitindo HomeNet no canal 6](../../../../assets/docs/wifi-iot/access-point-part.png)

A parte não tem pinos — não é um componente elétrico, é espaço aéreo.
Assim que um projeto contém pelo menos uma parte de ponto de acesso, as redes
integradas ficam silenciosas: uma varredura vê exatamente o que a tela define. Adicione
várias partes para exercitar uma interface de seleção de rede; cada uma carrega seu próprio
canal e intensidade de sinal, e varreduras repetidas variam alguns dB da mesma forma
que as reais fazem.

Duas propriedades valem a pena conhecer:

- **Internet** — desligue e a rede fica isolada: a placa
  associa e obtém um IP via DHCP, mas nada é roteado para fora. Esse é o
  cenário de provisionamento / portal cativo, agora testável no simulador.
- **Password** — armazenada com a parte e mostrada em seu cartão, mas a
  rede ainda transmite autenticação aberta até que a emulação WPA2 chegue.
  Sketches que passam uma senha conectam-se mesmo assim.

O firmware enviado também se beneficia: um binário construído em outro lugar conecta-se a
qualquer rede que ele nomeie, desde que uma parte de ponto de acesso transmita esse
SSID — sem necessidade de recompilação.

Quando executa, a varredura encontra exatamente sua rede e a placa se junta a ela:

![Monitor serial: a varredura lista apenas HomeNet, então a placa conecta e obtém IP 10.13.37.42](../../../../assets/docs/wifi-iot/custom-ap-serial.png)

Experimente com um clique: o exemplo da galeria **Connect to your own WiFi
network** abre com a parte já na tela.

## O painel WiFi

O ícone WiFi na barra de ferramentas é um botão dividido. O ícone em si mantém sua
ação de um clique — com um IP, ele abre o servidor web da placa através do
gateway IoT. A pequena seta ao lado abre o **painel WiFi**:

![O painel WiFi: redes no ar com canal e sinal, associação da placa e IP, Download PCAP e o pareamento do gateway local](../../../../assets/docs/wifi-iot/wifi-panel.png)

- as redes atualmente no ar (seus pontos de acesso, ou o conjunto
  integrado), com a associada marcada;
- o estado de conexão e o IP da placa;
- **Download PCAP** — o tráfego 802.11 da execução como um arquivo de captura que
  o Wireshark abre diretamente (quadros de gerenciamento, DHCP, DNS, TCP, com
  carimbos de tempo simulados). Nada é enviado; o arquivo é produzido em
  seu navegador;
- o pareamento do [gateway de rede local](/docs/pt-br/wifi-iot/local-gateway/).

## O que você pode alcançar

Uma vez conectado, soquetes TCP/UDP padrão, clientes HTTP e bibliotecas MQTT
funcionam contra **servidores reais na internet** — brokers MQTT públicos, APIs
REST, NTP. Veja [MQTT e HTTP](/docs/pt-br/wifi-iot/mqtt-http/) para projetos
completos.

## Quais placas

O WiFi está disponível em toda a família ESP32 simulada — as placas ESP32
clássicas, ESP32-S3, ESP32-C3, ESP32-C6 e ESP32-C5 (e suas variantes XIAO / Nano /
M5Stack). O estado de publicidade Bluetooth também é relatado para
sketches que inicializam BLE.

----- END PAGE -----
