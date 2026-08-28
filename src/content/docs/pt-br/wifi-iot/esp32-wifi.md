---
title: WiFi ESP32 no simulador
description: Conecte-se a uma rede a partir de um ESP32 simulado, transmita seu próprio SSID, capture o tráfego como PCAP e alcance sua LAN real.
sidebar:
  order: 2
---

As placas ESP32 no Velxio vêm com **WiFi funcional**. O rádio emulado escaneia,
associa, obtém um endereço IP via DHCP e alcança a internet através do
gateway NAT do emulador. É a pilha WiFi real do SDK do fornecedor rodando
em um rádio emulado, não um stub: o mesmo sketch, sem alterações, roda no
chip físico.

Esta página vai de uma primeira conexão às suas próprias redes, capturas de
pacotes e sua LAN real.

## Sua primeira conexão

1. Abra o exemplo da galeria **Connect to WiFi**
   ([`/example/esp32-wifi-connect`](/example/esp32-wifi-connect)), ou arraste qualquer
   placa ESP32 para o canvas e cole o sketch abaixo.
2. Pressione **Run** (Executar). A primeira compilação de uma sessão demora mais; as seguintes
   são armazenadas em cache.
3. Abra o monitor **Serial** na barra de ferramentas abaixo do canvas.
4. Observe a associação: as mensagens de inicialização do próprio SDK e, em seguida, a concessão de DHCP.

```cpp
#include <WiFi.h>

const char* WIFI_SSID = "Velxio-GUEST";  // rede integrada e aberta

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

O monitor serial mostra a associação e o endereço que o servidor DHCP emulado
distribuiu:

![Monitor serial: Connecting to Espressif, depois Connected with IP 10.13.37.42, o endereço MAC e a intensidade do sinal](../../../../assets/docs/wifi-iot/serial-wifi.png)

Uma coisa surpreende a todos na primeira vez: o log diz
`Connecting to Espressif` mesmo que o sketch nomeie `Velxio-GUEST`. Isso
é a reescrita de SSID fazendo seu trabalho, e a próxima seção explica isso.

O IP é real dentro da simulação: sockets, clientes HTTP e bibliotecas
MQTT funcionam a partir daqui. Veja [MQTT e HTTP](/docs/pt-br/wifi-iot/mqtt-http/)
para projetos completos.

## As redes integradas

Sem nenhuma parte de ponto de acesso no canvas, o rádio transmite quatro redes
de demonstração. Uma estação associa-se a exatamente uma delas:

| SSID            | Canal | Sinal   | Autenticação |
| --------------- | ----- | ------- | ------------ |
| `Velxio-GUEST`  | 6     | -20 dBm | Aberta       |
| `PICSimLabWifi` | 1     | -25 dBm | WPA2-PSK     |
| `Espressif`     | 5     | -30 dBm | WPA2-PSK     |
| `MasseyWifi`    | 10    | -40 dBm | WPA2-PSK     |

### O SSID no seu sketch não importa

Enquanto o projeto não tiver uma parte de ponto de acesso, o nome da rede que você escreve
**não** é aquele ao qual a placa se associa. No caminho para o emulador, o compilador
reescreve todo literal de SSID para `Espressif` e apaga todo literal de senha,
seja uma variável, um array, um `#define` ou um campo de struct:

```cpp
const char* ssid = "MyHomeNetwork";   // compilado como "Espressif"
#define WIFI_PASS "hunter2"           // compilado como ""
```

É por isso que um sketch copiado de qualquer tutorial conecta-se aqui sem ser
editado, por que passar uma senha errada nunca falha e por que o log serial
nomeia uma rede que você não digitou. Nada está errado quando isso acontece.

Duas consequências que vale a pena conhecer:

- **Adicionar uma parte de ponto de acesso desativa a reescrita.** A partir de então, o
  projeto define seu próprio espaço aéreo, então o que você digita é o que existe e o
  SSID precisa corresponder a uma parte.
- **Firmware que chega já compilado nunca passa pela reescrita.**
  Ele procura pelo SSID gravado no binário, e é por isso que um `.bin`
  aparentemente funcional pode ficar ali sem conseguir associar. Recompile-o
  nomeando uma das quatro redes acima, ou transmita o SSID que ele espera
  com uma parte de ponto de acesso.

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

`sta.scan()` retorna as mesmas redes que a API Arduino vê, como
tuplas `(ssid, bssid, channel, rssi, authmode, hidden)`.

## Suas próprias redes

Com um plano Maker, você não está limitado às redes de demonstração. Uma parte
**WiFi Access Point** faz o rádio emulado transmitir **seu** SSID.

1. Clique em **Add Component** na barra de ferramentas do canvas.
2. Pesquise por `WiFi Access Point` e coloque-o. Ele não precisa de fiação: não tem
   pinos, é espaço aéreo.
3. Selecione a parte e defina **ssid** para a rede que você deseja, por exemplo
   `HomeNet`.
4. Aponte o sketch para esse nome e pressione **Run**.

```cpp
WiFi.begin("HomeNet");   // o SSID na sua parte Access Point
```

![Uma parte WiFi Access Point no canvas ao lado de uma placa ESP32, transmitindo HomeNet no canal 6](../../../../assets/docs/wifi-iot/access-point-part.png)

**Assim que um projeto contém uma parte de ponto de acesso, as redes integradas
ficam silenciosas.** Uma varredura então vê exatamente o que o canvas define, o que
torna o código de seleção de rede testável.

### Propriedades da parte

| Propriedade | Padrão      | O que faz                                                                                  |
| ----------- | ----------- | ------------------------------------------------------------------------------------------ |
| `ssid`      | `MyNetwork` | O nome da rede à qual seu sketch se conecta.                                                |
| `password`  | vazio       | Armazenada e mostrada no cartão. A rede ainda transmite autenticação aberta até que WPA2 seja implementado, então sketches que passam uma senha conectam-se mesmo assim. |
| `channel`   | `6`         | Canal WiFi, de 1 a 13. Relatado pelas varreduras.                                           |
| `rssi`      | `-50`       | Intensidade do sinal em dBm como a placa o vê, de -90 a -20. Varreduras repetidas variam alguns dB como as reais. |
| `internet`  | ligado      | Desligado torna a rede isolada: a placa associa e obtém um IP, mas nada é roteado para fora. |
| `bssid`     | vazio       | Endereço MAC do AP. Vazio significa um estável gerado a partir do SSID.                     |

Experimente com um clique: **Connect to your own WiFi network**
([`/example/esp32-custom-wifi-ap`](/example/esp32-custom-wifi-ap)) abre com
a parte já colocada. Executá-lo faz uma varredura, encontra exatamente a sua rede e
entra nela:

![Monitor serial: a varredura lista apenas HomeNet, depois a placa conecta e obtém um IP](../../../../assets/docs/wifi-iot/custom-ap-serial.png)

### Várias redes ao mesmo tempo

Adicione uma parte por rede para exercitar um seletor ou uma política de "mais forte primeiro".
Cada uma carrega seu próprio canal e sinal, então uma varredura retorna ordenada como uma
real retornaria:

```cpp
int n = WiFi.scanNetworks();
for (int i = 0; i < n; i++) {
  Serial.printf("%2d: %-16s ch %2d  %d dBm\n",
                i + 1, WiFi.SSID(i).c_str(), WiFi.channel(i), WiFi.RSSI(i));
}
```

**Scan several WiFi networks**
([`/example/esp32-wifi-scan-multi`](/example/esp32-wifi-scan-multi)) vem com
três partes: `HomeNet` a -40 dBm, `Office_5G` a -62 dBm e `CoffeeShop` a
-78 dBm.

### Portais cativos e provisionamento

Desligue **internet** em uma parte e a rede se torna isolada. A placa
associa e obtém uma concessão de DHCP, mas nenhum tráfego sai. Esse é o
cenário de provisionamento: o dispositivo inicia, não encontra saída e serve sua
própria página de configuração.

**Captive portal on an isolated network**
([`/example/esp32-wifi-captive-portal`](/example/esp32-wifi-captive-portal))
configura isso com um AP chamado `SetupAP`.

## O painel WiFi

Um selo WiFi aparece na barra de ferramentas do canvas **quando você pressiona Run**,
e desaparece no Stop: ele pertence à simulação em execução, então não há nada para abrir
antes de iniciar uma. Ele fica cinza enquanto a pilha inicializa e verde assim que a
placa tem um endereço.

O selo é um botão dividido. O ícone mantém sua ação de um clique: com um IP,
ele abre o servidor web da placa através do gateway IoT. O cursor ao lado dele
abre o **WiFi panel**:

![O painel WiFi mostrando as redes no ar para este projeto, Download PCAP e a seção do gateway local](../../../../assets/docs/wifi-iot/wifi-panel.png)

O painel mostra:

- **Networks on the air**, com canal e sinal. O título diz
  *this project* quando partes de ponto de acesso as definem, e *built-in* quando as
  quatro redes de demonstração estão no ar:

  ![O painel WiFi listando as quatro redes integradas com seus canais e intensidades de sinal](../../../../assets/docs/wifi-iot/wifi-panel-builtin.png)

- o estado de associação da placa e seu IP assim que o DHCP é concluído;
- **Download PCAP**, o tráfego 802.11 da execução como um arquivo de captura;
- a seção [local network gateway](/docs/pt-br/wifi-iot/local-gateway/). Em um
  plano Maker, ela contém o campo de pareamento; no plano gratuito, ela explica o que
  o gateway faz e fornece links para os planos.

### Capture o tráfego e abra-o no Wireshark

1. Pressione **Run** e deixe o sketch fazer seu trabalho de rede.
2. Abra o painel WiFi e clique em **Download PCAP**.
3. Abra o arquivo no Wireshark.

A captura contém quadros de gerenciamento, DHCP, DNS e TCP, com carimbos de
tempo simulados, então `dhcp` ou `dns` como filtro de exibição isola o handshake que você está
depurando. O arquivo é produzido no seu navegador: nada é enviado.

## Alcançando sua própria máquina

As redes acima roteiam para a internet pública. Para alcançar o broker MQTT,
Home Assistant ou servidor de desenvolvimento rodando na **sua** máquina, execute o
gateway local: veja [Local network gateway](/docs/pt-br/wifi-iot/local-gateway/). Os sketches
então alcançam sua máquina como `host.velxio.internal`.

## Exemplos prontos

| Exemplo                                                                     | O que mostra                                        |
| --------------------------------------------------------------------------- | --------------------------------------------------- |
| [Connect to WiFi](/example/esp32-wifi-connect)                               | A associação mínima a uma rede integrada            |
| [Scan WiFi networks](/example/esp32-wifi-scan)                               | `scanNetworks()` contra o conjunto integrado        |
| [Connect to your own WiFi network](/example/esp32-custom-wifi-ap)            | Uma parte de ponto de acesso, varredura e associação|
| [Scan several WiFi networks](/example/esp32-wifi-scan-multi)                 | Três redes com canais e sinais diferentes           |
| [Captive portal on an isolated network](/example/esp32-wifi-captive-portal)  | `internet` desligado, fluxo de provisionamento      |
| [NTP clock over your WiFi](/example/esp32-wifi-ntp-clock)                    | UDP para um servidor de tempo real                  |
| [Fetch JSON from a web API](/example/esp32-wifi-http-json)                   | HTTPClient contra uma API REST real                 |
| [Reach a service on your own network](/example/esp32-wifi-local-http)        | `host.velxio.internal` através do gateway local     |
| [MQTT](/example/esp32-wifi-mqtt)                                             | Publicar e assinar em um broker público             |

## Solução de problemas

| Sintoma                                             | Causa                                                                     | Correção                                                                   |
| --------------------------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Firmware enviado nunca associa                       | Seu SSID está gravado, então o compilador não pôde reescrevê-lo            | Nomeie uma rede integrada ou adicione uma parte de ponto de acesso com esse SSID |
| Uma varredura retorna apenas suas redes              | Funcionando como esperado: uma parte de ponto de acesso silencia o conjunto integrado | Remova as partes para ter as redes de demonstração de volta                 |
| Associa e obtém um IP, mas nada é roteado para fora  | A parte tem **internet** desligada                                         | Ligue-a, a menos que esteja testando um portal cativo                       |
| Uma senha não é rejeitada                            | A emulação WPA2 ainda não existe, a rede transmite autenticação aberta     | Esperado por enquanto; a senha é armazenada na parte                        |
| `host.velxio.internal` não resolve                   | Nenhum gateway local pareado                                               | Veja [Local network gateway](/docs/pt-br/wifi-iot/local-gateway/)                 |

## Quais placas

O WiFi está disponível em toda a família ESP32 simulada: as placas ESP32
clássicas, ESP32-S3, ESP32-C3, ESP32-C6 e ESP32-C5, além de suas variantes XIAO, Nano e
M5Stack. O Raspberry Pi Pico W tem sua própria
[emulação CYW43](/docs/pt-br/boards/pico/). O estado de publicidade Bluetooth também é
relatado para sketches que inicializam BLE.
