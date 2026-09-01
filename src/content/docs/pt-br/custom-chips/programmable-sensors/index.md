---
title: Sensores programáveis
description: Construa um sensor cuja leitura você altera com um controle deslizante enquanto a simulação roda e entenda exatamente como o controle deslizante chega ao seu chip em execução.
sidebar:
  order: 3
---

Um **sensor programável** é um chip personalizado comum cujas leituras você
controla a partir de um controle deslizante *enquanto a simulação roda*. Um sensor de CO2 cujo ppm
você varre para testar um limite de alarme. Uma sonda de temperatura que você empurra acima de
85 °C para ver o que o firmware faz. Um sensor de luz que você diminui manualmente.

Nada no chip muda: é o mesmo componente WebAssembly
descrito em [Introdução](/docs/pt-br/custom-chips/getting-started/). O que
esta página adiciona é o fio que transporta um valor de controle deslizante para um chip que já está
em execução, sem recompilar ou reiniciar nada.

## O contrato, em três partes

Todo sensor programável é estas três peças e nada mais.

**1. Um atributo** armazena o valor ajustável.

```c
S.ppm = vx_attr_register("ppm", 1000);
```

**2. Uma entrada `controls`** em `chip.json` coloca um controle deslizante na tela. Ela
endereça o atributo **pelo mesmo id**:

```json
"controls": [
  { "id": "ppm", "label": "CO2 (ppm)", "type": "range",
    "min": 400, "max": 5000, "step": 10, "unit": "ppm" }
]
```

**3. Seu código relê o atributo** toda vez que precisar do valor:

```c
double ppm = vx_attr_read(S.ppm);   /* o valor do controle deslizante agora */
```

Pressione **Run** (Executar), clique no chip, e isto abre:

![O painel de controle ao vivo de um chip sensor de CO2 em execução: um controle deslizante de 400 a 5000 ppm](../../../../../assets/docs/custom-chips/sensor-slider-panel.png)

Esse terceiro ponto é o que confunde as pessoas. Leia o atributo uma vez
em `chip_setup()` e armazene-o em cache em uma variável, e o controle deslizante aparecerá,
se moverá e não fará absolutamente nada. `vx_attr_read` é barato; chame-o dentro
do seu callback de temporizador, do seu manipulador de leitura I2C, onde quer que o valor seja
realmente necessário.

:::tip[Você pode já ter controles deslizantes]
Se você pular a seção `controls` completamente, **qualquer atributo que declare
tanto `min` quanto `max` ainda ganha um controle deslizante**. Chips que você escreveu antes disso
existir geralmente já são ajustáveis. `controls` é como você renomeia um controle deslizante,
dá a ele uma unidade, torna-o logarítmico ou o transforma em um botão.
:::

## Como o valor chega ao seu chip

Vale a pena entender, porque os dois mecanismos de simulação usam
rotas diferentes e os modos de falha diferem.

| Etapa | O que acontece |
| --- | --- |
| Você arrasta o controle deslizante | O painel grava no registro de atualização do sensor, identificado por esta instância do chip |
| Mecanismo do navegador (AVR, RP2040, ESP32 no navegador) | O valor é escrito diretamente no mapa de atributos que o WebAssembly em execução lê a cada `vx_attr_read`. Sem passagem de mensagens, sem reinicialização |
| ESP32 sob QEMU | O chip vive em um worker, então o valor é encaminhado a ele como uma atualização de atributo e aplicado lá |
| A cada 250 ms de inatividade | Os últimos valores são espelhados nas propriedades salvas do componente, para que a posição do controle deslizante sobreviva a um salvar e recarregar |

Duas consequências que valem a pena conhecer:

- **Não há etapa de "aplicar".** A próxima chamada `vx_attr_read` retorna o novo
  valor. Se o seu chip só lê o atributo uma vez por segundo, é quanto tempo
  o controle deslizante leva para fazer algo visivelmente.
- **O painel é por instância.** Duas cópias do mesmo chip em uma única tela
  têm controles deslizantes independentes, porque os controles são sintetizados a partir do
  manifesto de cada instância.

## Padrões de tempo de design versus valores ao vivo

São superfícies diferentes e as pessoas as confundem:

- **Parado**: clique com o botão direito no chip para abrir o inspetor de peças. O que você
  define lá é o padrão salvo do atributo, o valor com o qual o chip
  inicia.
- **Em execução**: clique no chip. O painel de controle deslizante abre. O que você define lá
  é o valor ao vivo, aplicado imediatamente.

## Experimente um primeiro

Todo padrão tem um circuito executável na galeria. Pressione Run (Executar), depois
clique no chip:

| Exemplo | O que ensina |
| --- | --- |
| [Sensor de CO2 (controle deslizante ao vivo)](https://velxio.dev/example/co2-sensor-live-slider) | A receita analógica: controle deslizante para tensão para `analogRead` |
| [Sensor Ambiental I2C (controles deslizantes ao vivo)](https://velxio.dev/example/i2c-env-sensor-live-sliders) | Dois controles deslizantes atrás de um mapa de registros em `0x44` |
| [Sensor de Movimento (botão de simulação)](https://velxio.dev/example/motion-sensor-sim-button) | O controle `button`: gatilho momentâneo mais um controle deslizante de retenção |
| [Luz Noturna (controle deslizante de lux log)](https://velxio.dev/example/night-light-log-slider) | `scale: "log"`: cinco décadas de lux em um controle deslizante, lâmpada dispara abaixo de 50 lx |
| [Termômetro SPI (controle deslizante ao vivo)](https://velxio.dev/example/spi-thermometer-live-slider) | Temporização de escravo SPI: trava na borda de descida do CS |
| [Sensor de Ar UART (controle deslizante ao vivo)](https://velxio.dev/example/uart-air-sensor-live-slider) | Sensor serial estilo push para SoftwareSerial |

## Onde ir a seguir

- [Tutorial: um sensor de CO2 analógico](/docs/pt-br/custom-chips/programmable-sensors/co2-analog/)
  — o exemplo completo mais curto, de chip vazio a `analogRead` rastreando
  um controle deslizante.
- [Tutorial: temperatura e umidade via I2C](/docs/pt-br/custom-chips/programmable-sensors/i2c-env/)
  — o padrão para qualquer sensor de protocolo digital, com dois controles deslizantes e um
  mapa de registros.
- [Referência de `controls`](/docs/pt-br/custom-chips/programmable-sensors/reference/)
  — todos os campos, as regras automáticas de fallback e o que verificar quando um
  controle deslizante não faz nada.

:::note[Grátis]
Tudo nesta página é grátis, em todos os planos: escrever um chip, compilá-lo,
executá-lo e arrastar seus controles deslizantes. O que é pago é ter a IA
escrevendo um chip para você (Maker e superior) e a
biblioteca do lado do servidor [My Chips](/docs/pt-br/custom-chips/my-chips/) (Pro).
:::
