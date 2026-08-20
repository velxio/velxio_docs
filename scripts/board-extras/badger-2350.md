## About this board

Pimoroni's RP2350 e-paper badge, and the deepest emulation in the partner
catalog: it boots the **complete BadgeOS factory firmware**. You navigate the
launcher with A/B/C and the UP/DOWN keys and open the apps, exactly as you
would on the badge in your hand.

The e-paper is emulated as e-paper, not as an LCD pretending — a full refresh
flashes and takes its time, and partial refresh is visibly different. That is
the point of the panel and the reason a badge project is written the way it is.

Only four pins reach the outside world, so this board's projects are about
what is already on it rather than about wiring.

## Start here

- [BadgeOS factory firmware](https://velxio.dev/example/badger-2350-badgeos) —
  the whole launcher, the closest thing to holding one.
- [E-paper badge](https://velxio.dev/example/badger-2350-badge) — the classic
  name badge, the simplest sketch to read.
- [Hydration counter](https://velxio.dev/example/badger-2350-hydrate) — shows
  partial refresh, which is what makes a counter usable on e-paper.
- [To-do list](https://velxio.dev/example/badger-2350-list),
  [RTC alarm clock](https://velxio.dev/example/badger-2350-alarm),
  [I2C scanner](https://velxio.dev/example/badger-2350-i2c) and a
  [MicroPython REPL](https://velxio.dev/example/badger-2350-micropython).
