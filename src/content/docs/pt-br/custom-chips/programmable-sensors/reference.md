---
title: "referência de controles"
description: "Cada campo da seção de controles em chip.json, o fallback automático de slider, como os valores são armazenados e o que verificar quando um controle não faz nada."
sidebar:
  order: 6
---

O array `controls` em `chip.json` descreve o que o painel mostra enquanto
a simulação é executada. Cada entrada controla o atributo cujo `name`
corresponde ao `id` da entrada.

## Campos da entrada

| Campo | Aplica-se a | Significado |
| --- | --- | --- |
| `id` | todos | **Obrigatório.** O atributo que este controle aciona. Uma entrada sem `id` é ignorada |
| `type` | todos | `"range"` para um slider, `"button"` para um gatilho momentâneo. Qualquer outro valor é ignorado e a entrada não produz nada |
| `label` | todos | Texto ao lado do controle. Usa como fallback o `label` do atributo e, em seguida, o `id` |
| `min` | range | Limite inferior. Usa como fallback o `min` do atributo e, em seguida, `0` |
| `max` | range | Limite superior. Usa como fallback o `max` do atributo e, em seguida, `100` |
| `step` | range | Incremento. Usa como fallback o `step` do atributo e, em seguida, `1` quando a faixa for maior que 20, caso contrário `0.01` |
| `unit` | range | Exibido após o valor, por exemplo `ppm` ou `%`. Vazio por padrão |
| `scale` | range | `"log"` fornece um slider logarítmico. Ignorado quando `min` é negativo, pois a curva é indefinida nesse caso |

A **posição inicial** de um slider não é obtida do controle. Ela vem do
`default` do atributo, com fallback para `min`. Mantenha o `default` do
atributo dentro do intervalo do controle, caso contrário o painel abre
com o controle preso em uma das extremidades.

## O título do painel

Obtido do `name` do chip. Um chip sem `name` exibe "Custom Chip".

## O fallback automático

Você não precisa escrever `controls` de forma alguma.

**Qualquer atributo que declare tanto `min` quanto `max` e que não seja
reivindicado por um controle explícito recebe um slider.** Seu rótulo vem
do `label` do atributo, seu passo do `step` do atributo ou é inferido:
`1` para `type: "int"`, caso contrário `1` quando a faixa for maior que
20 e `0.01` quando não for. Ele não recebe unidade.

Portanto, `controls` só é necessário para renomear um slider, adicionar
uma unidade, torná-lo logarítmico ou declarar um botão. Duas
consequências práticas:

- Chips escritos antes da existência de controles ao vivo geralmente já
  são ajustáveis, sem nenhuma edição.
- Um chip cujos atributos não têm `min`/`max` e nenhuma seção `controls`
  não mostra **nenhum painel**. Essa é a razão usual para clicar em um
  chip parecer não fazer nada.

## Botões

Uma entrada `"button"` renderiza um gatilho momentâneo para linhas de
reset, eventos do tipo "simular movimento" e qualquer outra coisa que
seja uma borda em vez de um nível:

![Um controle de botão e um slider de tempo de espera no painel do sensor de movimento](../../../../../assets/docs/custom-chips/motion-button-panel.png) Pressioná-lo leva o atributo para `1` e de volta para `0` cerca de
150 ms depois, portanto seu chip deve tratar uma leitura diferente de
zero como "o evento aconteceu" em vez de tentar capturar um instante
específico.

## Onde os valores são armazenados

As posições do slider são espelhadas nas propriedades salvas do
componente (em `attrs`) cerca de 250 ms após você parar de movê-las, com
os valores pendentes mesclados. É por isso que arrastar um slider não
grava no projeto a cada pixel e por que a posição ainda sobrevive a um
salvar e recarregar.

O espelho é uma *cópia*. O valor que o chip em execução lê é o valor ao
vivo, aplicado no momento em que o controle se move.

## Motores

| Motor | Como o valor chega |
| --- | --- |
| AVR, RP2040, ESP32 no navegador | Gravado diretamente no armazenamento de atributos que o WebAssembly lê em cada `vx_attr_read` |
| ESP32 no backend QEMU | Encaminhado para o worker e aplicado ao armazenamento de atributos do runtime do chip lá |

Ambos são ao vivo: sem recompilação, sem reinicialização, sem botão
"aplicar". A única latência é a frequência com que seu próprio código
chama `vx_attr_read`.

## Plano

Os controles ao vivo são **gratuitos**, em todos os planos, assim como
escrever, compilar e executar o chip que os declara. Dois recursos
vizinhos são pagos: fazer com que a IA crie um chip ou sensor para você
(Maker e superior) e a biblioteca [My Chips](/docs/pt-br/custom-chips/my-chips/)
que mantém um chip no servidor para reutilização entre projetos (Pro).

## Quando um controle não faz nada

| Sintoma | Causa |
| --- | --- |
| Clicar no chip não abre painel | Nenhuma entrada `controls` e nenhum atributo com `min` e `max`, ou a simulação está parada |
| Uma entrada específica está faltando no painel | Seu `type` não é `range` nem `button`, ou não tem `id` |
| O slider se move, mas nada muda | O chip armazenou em cache `vx_attr_read` em vez de chamá-lo onde o valor é usado |
| O slider começa na extremidade errada | O `default` do atributo está fora do `min`/`max` do controle |
| O valor salta em números inteiros | `step` foi inferido como `1` porque a faixa é maior que 20; defina `step` explicitamente |
| Um slider logarítmico é linear | `scale: "log"` é ignorado quando `min` é negativo |

## Veja também

- [Tutorial: um sensor de CO2 analógico](/docs/pt-br/custom-chips/programmable-sensors/co2-analog/)
- [Tutorial: temperatura e umidade via I2C](/docs/pt-br/custom-chips/programmable-sensors/i2c-env/)
- [Referência da API de chip personalizado](/docs/pt-br/custom-chips/api/)
- Exemplos em execução de cada campo aqui: o
  [botão](https://velxio.dev/example/motion-sensor-sim-button), o
  [slider log](https://velxio.dev/example/night-light-log-slider), um
  sensor [SPI](https://velxio.dev/example/spi-thermometer-live-slider) e
  um sensor [UART](https://velxio.dev/example/uart-air-sensor-live-slider)
-----
