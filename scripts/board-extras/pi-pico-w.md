## About this board

The Pico W is the [Pico](/docs/boards/reference/raspberry-pi-pico/) with the
CYW43439 radio, and the radio is emulated rather than stubbed — the wireless
stack really associates and your firmware sees a link come up.

Two levels, worth knowing before you plan a project:

- **Joining a network runs in the browser and is free.** The association, the
  driver handshake and the link state all work on any plan.
- **Reaching the real internet is a paid feature.** DNS, TCP and UDP out to
  actual hosts, and the inbound IoT gateway, are gated at run time — see
  [plans](/docs/getting-started/plans/).

Two Pico Ws can also talk to each other on one canvas; the gallery has
handshake, GPIO mirror and UART passthrough projects built that way.

## Start here

No separate starter: open
[New Raspberry Pi Pico project](https://velxio.dev/example/pico-blink) and swap
the board, or place it from **Add Component**.
