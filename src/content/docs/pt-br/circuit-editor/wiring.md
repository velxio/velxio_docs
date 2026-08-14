---
title: Fiação
description: Conecte pinos com fios, roteie-os e codifique por cores como um kit de jumpers real.
sidebar:
  order: 3
---

## Fazendo uma conexão

Clique em um **pino** em qualquer componente — um fio começa a seguir o cursor. Clique
no pino de destino para finalizá-lo. Os fios são roteados ortogonalmente (curvas
em ângulo reto), da forma que esquemáticos e fotos de protoboard ficam melhores.

- Pressione **Escape** para cancelar um fio que você começou.
- Clique em um fio para selecioná-lo; **Delete** o remove.
- Você também pode começar a fiação pelo [inspetor de componentes](/docs/pt-br/circuit-editor/part-inspector/):
  clique com o botão direito em um componente e "toque em um pino para conectar".

## Cores dos fios

Enquanto um fio está em andamento (ou com um fio selecionado), pressione uma tecla para definir
sua cor — a mesma convenção de paleta que os usuários do Wokwi conhecem:

| Tecla | Cor      | Tecla                       | Cor                                     |
| ----- | -------- | --------------------------- | --------------------------------------- |
| `0`   | Preto    | `6`                         | Azul                                    |
| `1`   | Marrom   | `7`                         | Violeta                                 |
| `2`   | Vermelho | `8`                         | Cinza                                   |
| `3`   | Laranja  | `9`                         | Branco                                  |
| `4`   | Dourado  | `c` / `l` / `m` / `p` / `y` | Ciano / Lima / Magenta / Roxo / Amarelo |
| `5`   | Verde    |                             |                                         |

Novos fios recebem coloração automática de kit de jumpers: fios vizinhos escolhem
cores visivelmente diferentes, com vermelho e preto reservados para trilhas de alimentação.

## Protoboards

Quando os pinos de um componente estão em furos da protoboard, **pontos verdes** aparecem nos
pinos assentados — "conectado e ligado" é visível de relance, sem
passar o mouse. As trilhas internas da protoboard (linhas e faixas de alimentação) conduzem
exatamente como o componente real.

## Realidade elétrica

Os fios não são apenas desenhos: o motor analógico resolve o circuito que você
realmente conectou. Um resistor de série ausente, um curto-circuito, uma entrada flutuante — tudo
se comporta (e se comporta mal) como na bancada. Se uma conexão queimaria um
componente no modo elétrico, o verificador de circuito avisa antes do **Run**.
----- END PAGE -----
