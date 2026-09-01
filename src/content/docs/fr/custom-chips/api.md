---
title: Référence de l'API Chips
description: L'API velxio-chip.h — broches, attributs, I2C, SPI, UART, temporisateurs, framebuffer, ROM.
sidebar:
  order: 6
---

Tout ce qu'une puce peut faire est déclaré dans **`velxio-chip.h`**. L'hôte
appelle votre `chip_setup()` exporté une fois par instance ; c'est là que vous
enregistrez les broches et périphériques et que vous accrochez les callbacks. Toute
l'exécution ultérieure se fait dans ces callbacks.

## Broches

```c
vx_pin vx_pin_register(const char* name, vx_pin_mode mode);
int    vx_pin_read(vx_pin p);
void   vx_pin_write(vx_pin p, int value);          // VX_LOW / VX_HIGH
double vx_pin_read_analog(vx_pin p);               // volts
void   vx_pin_dac_write(vx_pin p, double voltage); // sortie analogique
void   vx_pin_set_mode(vx_pin p, vx_pin_mode mode);
```

Modes : `VX_INPUT`, `VX_OUTPUT`, `VX_INPUT_PULLUP`, `VX_INPUT_PULLDOWN`,
`VX_ANALOG`, plus `VX_OUTPUT_LOW` / `VX_OUTPUT_HIGH` pour démarrer en
conduisant déjà un niveau connu (pas de glitch entre l'enregistrement et la
première écriture).

Surveillez les fronts :

```c
void vx_pin_watch(vx_pin p, vx_edge edge,
                  void (*cb)(void* ud, vx_pin pin, int value), void* ud);
void vx_pin_watch_stop(vx_pin p);
```

avec `VX_EDGE_RISING`, `VX_EDGE_FALLING` ou `VX_EDGE_BOTH`.

## Attributs

Paramètres modifiables par l'utilisateur. Les valeurs par défaut se trouvent dans
l'inspecteur de composant ; déclarez une section `controls` dans `chip.json` et
chacune d'elles reçoit un **curseur en direct pendant la simulation** (voir
[Senseurs programmables](/docs/fr/custom-chips/programmable-sensors/)) :

```c
vx_attr vx_attr_register(const char* name, double default_val);
double  vx_attr_read(vx_attr a);   // relire dans les callbacks — les curseurs le déplacent en direct

// Attributs de chaîne (un identifiant d'appareil, un SSID, un nom de préréglage) :
vx_attr  vx_attr_register_string(const char* name, const char* default_val);
uint32_t vx_attr_string_len(vx_attr a);
uint32_t vx_attr_string_read(vx_attr a, char* buf, uint32_t cap);
```

Déclarez-les aussi dans `chip.json` pour que l'éditeur puisse les afficher.

## Esclave I2C

```c
vx_i2c vx_i2c_attach(const vx_i2c_config* cfg);
```

La configuration contient l'adresse 7 bits `address`, les broches `scl`/`sda` et
quatre callbacks : `on_connect(addr, is_read)`, `on_read()` (retourne l'octet
suivant), `on_write(byte)` (ack/nack), `on_stop()`. Suffisant pour implémenter
tout périphérique I2C de type registre — voir les exemples PCF8574 et DS3231.

## UART

```c
vx_uart vx_uart_attach(const vx_uart_config* cfg); // rx, tx, baud_rate
bool    vx_uart_write(vx_uart u, const uint8_t* buf, uint32_t count);
```

`on_rx_byte` se déclenche pour chaque octet reçu ; `on_tx_done` lorsque votre
tampon est parti.

## Esclave SPI

```c
vx_spi vx_spi_attach(const vx_spi_config* cfg);
void   vx_spi_start(vx_spi s, uint8_t* buffer, uint32_t count);
void   vx_spi_stop(vx_spi s);
```

Échangez les tampons pendant que la sélection de puce est active — l'exemple
MCP3008 montre toute la danse requête/réponse.

## Temps et temporisateurs

```c
uint64_t vx_sim_now_nanos(void);
vx_timer vx_timer_create(void (*cb)(void* ud), void* ud);
void     vx_timer_start(vx_timer t, uint64_t period_nanos, bool repeat);
void     vx_timer_stop(vx_timer t);
```

Les temporisateurs fonctionnent sur le **temps de simulation**, donc votre puce
reste cohérente en cycles avec les cartes qui l'entourent.

## Framebuffer

```c
vx_buffer vx_framebuffer_init(uint32_t* out_width, uint32_t* out_height);
void      vx_buffer_write(vx_buffer b, uint32_t offset,
                          const void* data, uint32_t len);
void      vx_buffer_read(vx_buffer b, uint32_t offset,
                         void* data, uint32_t len);
```

Pour les puces qui _sont_ des écrans : écrivez des pixels RGBA et le composant
les rend sur le canevas.

## Blobs ROM et journalisation

```c
uint32_t vx_rom_size(void);
void     vx_rom_read(uint32_t offset, uint8_t* dst, uint32_t len);
void     vx_log(const char* msg);   // apparaît dans la console du navigateur
```

La ROM permet à une puce de transporter des données externes (ROM de caractères,
microcode) injectées par l'hôte avant `chip_setup()`.

## L'apparence de la puce

Le corps est dessiné à partir de `chip.json` : la liste des broches place les
pastilles et leurs étiquettes, et une section optionnelle `display: { width, height }`
réserve une zone framebuffer. Une puce peut aussi porter une **image** — un PNG,
JPEG ou SVG ajouté à sa section de fichiers sous le nom `chip.png` / `chip.jpg` /
`chip.svg` — qui recouvre le corps sans déplacer aucune broche. Voir
[Donner un visage à la puce](/docs/fr/custom-chips/getting-started/#giving-the-chip-a-face).

## Le manifeste (`chip.json`)

```json
{
  "schema": "velxio-chip/v1",
  "name": "My Chip",
  "author": "you",
  "description": "What it does",
  "pins": ["IN", "OUT", "GND", "VCC"],
  "attributes": []
}
```

`pins` définit l'ordre physique de l'empreinte ; les noms doivent correspondre à
ce que le source C enregistre. Sections optionnelles : `attributes` (valeurs
réglables), `controls` (curseurs/boutons en direct pendant la simulation),
`display` (`{"width", "height"}` pour les puces framebuffer) et
`programTargets` (puces rétro-CPU qui exécutent un programme utilisateur).
