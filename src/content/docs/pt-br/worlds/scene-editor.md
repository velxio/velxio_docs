---
title: Construir uma cena
description: Adicione robôs, pistas, rampas e obstáculos com o mouse, conecte-os aos seus motores e sensores, e leia o formato da cena.
sidebar:
  order: 2
---

Um World feito com o kit de cena do Velxio (todo World que **Create a world for
this circuit** cria, e a [arena Devastator](/docs/pt-br/worlds/example-devastator-tank/))
pode ser editado com o mouse. As alterações são salvas em `world.html`, então elas
vão para onde o projeto for.

![O editor de cena na arena Devastator](../../../../assets/docs/worlds/editor.png)

## Modo de edição

Pressione **Edit** (o lápis) na barra de ferramentas do World.

- **Add** coloca um novo objeto no tapete:

  | Grupo     | Objetos                                                                       |
  | --------- | ----------------------------------------------------------------------------- |
  | Robots    | Robot 2WD, Robot 4WD, Robot tank (Devastator), Robot arm                      |
  | Tracks    | Loop, oval, figure 8, straight (fita preta no tapete)                         |
  | Obstacles | Box, wall, cylinder                                                           |
  | Terrain   | Ramp, bridge, hill                                                            |

- **Clique** em um objeto para selecioná-lo e abrir suas propriedades.
- **Arraste** para movê-lo no tapete. **Q** e **E** o rotacionam, **Shift** rotaciona
  em passos de 15 graus, **Delete** o remove.
- **Ctrl+Z** e **Ctrl+Y** desfazem e refazem.
- **Mat settings** define o tamanho, a cor e a grade do tapete.

Funciona da mesma forma na visualização 3D e na 2D. Pressione Edit novamente para voltar ao
modo de reprodução.

## Conectar um robô ao circuito

Um robô se move apenas com os motores que você lhe der, e alimenta apenas os sensores que você
lhe der. Selecione o robô e escolha, entre as peças na sua tela:

| Campo                     | O que escolher                                                                                                     |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Motors: Left / Right**  | Um ou dois motores por lado. A velocidade de um lado segue a média de acionamento dos seus motores.                |
| **Reverse left / right**  | Marque um lado cujo "para frente" é um acionamento negativo (seu motor está ligado ou montado ao contrário).      |
| **Line**                  | Rastreadores de linha, da esquerda para a direita na frente (até cinco, com 18 mm de distância).                   |
| **Sonar**                 | Um sensor de distância no para-choque dianteiro (URM09, URM37 ou HC-SR04).                                         |
| **Sonar servo**           | Um servo que gira o sonar: 0 graus olha para a direita, 90 para frente, 180 para a esquerda.                       |
| **IMU**                   | Um MPU6050 no chassi.                                                                                              |

Um braço robótico usa quatro servos: base, ombro, cotovelo e garra.

## Robôs

| Preset | Corpo          | Velocidade em acionamento total | Sobe   | Como                                   |
| ------ | -------------- | ------------------------------- | ------ | -------------------------------------- |
| 2WD    | 15 x 10,5 cm   | 0,55 m/s                        | 1 cm   | o clássico carrinho de duas rodas      |
| 4WD    | 20 x 11,5 cm   | 0,61 m/s                        | 1,5 cm | um carro de quatro rodas com direção por skid |
| Tank   | 22,5 x 22 cm   | 0,36 m/s                        | 3 cm   | o DFRobot Devastator, com esteiras     |

Os robôs param contra caixas, paredes, cilindros e a borda do tapete, e
passam por cima de qualquer coisa que não seja mais alta que sua altura de subida. Em uma rampa eles sobem
a inclinação e se inclinam com ela, um pouco mais devagar na subida.

## O formato da cena

Por trás do editor, a cena é um bloco JSON em `world.html`:

```html
<!doctype html>
<html><body>
<script type="application/json" id="velxio-scene">
{ "version": 1, "view": "3d", "floor": { "w": 2.4, "h": 1.6, "grid": true },
  "objects": [
    { "id": "track1", "type": "track", "shape": "loop", "x": 0, "y": 0, "w": 2.1, "h": 0.9, "tape": 0.022 },
    { "id": "robot1", "type": "robot", "preset": "diff2", "x": -0.3, "y": -0.439, "rot": 0,
      "bind": { "left": ["motorL"], "right": ["motorR"], "line": ["lineL", "lineC", "lineR"] } },
    { "id": "box1", "type": "box", "x": 0.7, "y": 0.05, "w": 0.15, "d": 0.15, "h": 0.15, "color": "#c0392b" }
  ] }
</script>
<script>velxio.kit.start();</script>
</body></html>
```

- As unidades são metros e graus. O tapete (`floor`, `w` por `h`) é centralizado na
  origem: x para a direita, y para longe de você, `rot` no sentido anti-horário a partir de +x.
- Todo objeto tem um `id` único, uma posição `x`, `y`, e opcionalmente `rot`,
  `color` e `label`.
- `robot`: `preset` é `diff2`, `diff4` ou `tank`. `bind` contém `left`,
  `right` (listas de ids de motores), `invertLeft`, `invertRight`, `line` (ids de sensores,
  da esquerda para a direita), `sonar`, `sonarServo` e `imu`.
- `track`: `shape` é `loop`, `oval`, `figure8` ou `line`, com `w`, `h` e
  `tape` (a largura da fita, de 0,019 a 0,025 m). `w` e `h` são a borda externa
  da fita, então sua linha central corre meia largura de fita para dentro. Para iniciar um seguidor
  de linha na fita de um loop centrado na origem, coloque-o na reta
  inferior seguindo +x: `x: -0.3, y: -(h/2 - tape/2), rot: 0` (-0,439 para um
  loop de 0,9 m com fita de 22 mm).
- `box` e `wall`: `w`, `d`, `h`. `cylinder`: `r`, `h`.
- `ramp`: `profile` é `wedge` (sobe em direção a +x, depois uma face vertical),
  `bridge` (sobe, plano, desce) ou `hill` (uma elevação suave, atravessável de qualquer lado),
  com `w`, `d`, `h`. O sonar vê faces verticais de 3 cm ou mais, nunca
  inclinações.
- `arm`: `bind` contém os ids dos servos `base`, `shoulder`, `elbow` e `gripper`.

Ids em `bind` que o circuito não possui são ignorados, então uma cena nunca
quebra o projeto. A [página do Devastator](/docs/pt-br/worlds/example-devastator-tank/)
mostra uma arena completa.
