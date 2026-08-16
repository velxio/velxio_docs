---
title: Free and paid plans
description: Exactly what Free, Maker and Pro include — AI credits, board access, run-time limits, sharing, libraries and billing.
sidebar:
  order: 8
---

Velxio is free to use, and the free tier is not a demo. The circuit
editor, the code editor, the component catalog, the examples gallery and
unlimited public projects cost nothing, and no board is hidden from you.

Paid plans exist for the two things that cost real money to run — **the
AI assistant**, where every prompt is a model call, and **server-side
emulation**, where STM32 and Raspberry Pi boards run as real QEMU
processes on Velxio's machines — plus the features aimed at people who
use Velxio for work: private projects, exports, integrations and the
offline desktop app.

Tiers are additive: **Pro includes everything in Maker, which includes
everything in Free.**

## The three plans

| | Free | Maker | Pro |
| --- | --- | --- | --- |
| Price | $0 | $7 / month | $19 / month |
| Paid yearly | — | $69 / year | $189 / year |
| AI credits per day | 20 | 500 | 2,000 |
| AI credit ceiling per month | 600 | 15,000 | 60,000 |
| Agent and Tutor modes | No | Yes | Yes |
| STM32 and Raspberry Pi emulation | No | Yes | Yes |
| Project visibility | Public | Public, unlisted | Public, unlisted, private |
| Library storage | 100 MB | 500 MB | 2 GB |

Paying yearly costs about two months less than paying the same plan
monthly. Both cadences are available at checkout with card (Stripe) or
PayPal.

## The AI assistant

The assistant has three modes, and they are not all gated the same way.

| Mode | What it does | Plans |
| --- | --- | --- |
| **Basic** | Answers questions with your project as context — "why doesn't my LED light up?", "what does this compiler error mean?" It reads the canvas and the code but does not change them. | Every plan, including Free |
| **Agent** | Acts on the project: adds and wires components, writes and fixes code, runs the simulation to check its own work. | Maker and Pro |
| **Tutor** | Teaches step by step over your own circuit — proposes exercises, checks what you built, explains the theory. | Maker and Pro |

Basic mode on the free tier has its **own pool of 50 messages per day**
that does not touch your AI credits. So a free account is not limited to
20 AI interactions a day — it gets 50 Basic chat messages plus 20 credits.

### How AI credits are counted

Credits (shown as the counter at the bottom of the chat panel) meter the
work Agent and Tutor mode do:

- A normal request costs **1 credit**.
- A large request — one that pushes more than about 30,000 tokens of
  context, such as a long conversation over a big sketch — costs
  proportionally more, so one heavy prompt can spend several credits.
- The daily counter **resets at midnight UTC**. Unused credits do not
  roll over.
- The monthly ceiling is a second, independent limit on top of the daily
  one.
- Inline code completions in the editor are metered separately and never
  spend agent credits.

See the [AI assistant section](/docs/ai/overview/) for what each mode can
actually do.

## Boards and simulation

**Every board in the catalog is visible and editable on every plan**, and
most of them also *run* on every plan. Two families are the exception,
because they are the expensive ones to host:

| Board family | Where it runs | Free | Paid |
| --- | --- | --- | --- |
| Arduino / AVR, RP2040 / RP2350 (Pico, Badger 2350) | Your browser | Yes, no time limit | Yes |
| ESP32 family (classic, S3, C3, C6), M5Stack, XIAO | Velxio's servers | Yes, 1 hour per run | Yes, no per-run limit |
| **STM32** (Blue Pill, Black Pill, F4 Discovery…) | Velxio's servers | No | Yes |
| **Raspberry Pi Linux** (Zero, 1, 2, 3, 4, 5, UNIHIKER) | Velxio's servers | No | Yes |

The boards that need a paid plan are exactly the STM32 family and the
Raspberry Pi Linux family — they carry a **PRO badge** in the component
picker. Branded boards like the M5Stack Cardputer, the Pimoroni Badger
2350 or the XIAO family are **not** paywalled, even though they are part
of the hosted catalog.

Two limits apply to everyone, paid included:

- A simulation left **idle for 2 hours** stops automatically.
- A Raspberry Pi session has a **2-hour hard ceiling** per session.

A few individual features also need a paid plan: Pico W WiFi emulation,
uploading files to a simulated microSD card, the private IoT gateway, and
a small set of premium components (they show the PRO badge in the picker).

## Projects and sharing

| | Free | Maker | Pro |
| --- | --- | --- | --- |
| Public projects (listed in the gallery) | Unlimited | Unlimited | Unlimited |
| Unlisted projects (link only, hidden from the gallery) | No | Yes | Yes |
| Private projects (only you) | No | No | Yes |
| Embed without the "Powered by Velxio" badge | No | No | Yes |
| Simulation history and replay | No | No | Yes |

If a paid plan lapses, **nothing is deleted**. Projects that are already
private or unlisted keep that visibility — you simply cannot create new
ones or change a project's visibility until you subscribe again.

## Libraries and compiling

Compiling with `arduino-cli` and installing libraries through the Library
Manager works on every plan. What changes is storage and how libraries get
in:

| | Free | Maker | Pro |
| --- | --- | --- | --- |
| Library Manager + compile | Yes | Yes | Yes |
| Storage for installed and uploaded libraries | 100 MB | 500 MB | 2 GB |
| Upload your own library as a `.zip` | No | Yes | Yes |
| Priority compile queue at peak times | No | Yes | Yes |

See [Libraries](/docs/programming/libraries/) for how the quota is
counted.

## Desktop, exports and integrations

| | Free | Maker | Pro |
| --- | --- | --- | --- |
| Velxio Desktop, offline (Linux, Windows, macOS) | No | Yes | Yes |
| Private IoT gateway | No | Yes | Yes |
| AI custom-part builder — program your own simulatable chips | No | No | Yes |
| BOM export (CSV, ready for Mouser or Digi-Key) | No | No | Yes |
| Schematic export (PNG) | No | No | Yes |
| [GitHub Sync](/docs/getting-started/github-sync/) | No | No | Yes |
| Direct support from the maintainer | No | No | Yes |

## Free trial

You can try Agent and Tutor mode **free for 7 days**, with no card. The
trial runs at 500 credits per day — the same daily allowance as Maker —
and unlocks the Pro feature set so you can evaluate everything. One trial
per account; start it from the [pricing page](https://velxio.dev/pricing).

## Billing

- **Payment methods**: card through Stripe Checkout, or PayPal. Both
  support monthly and yearly billing.
- **Cancel anytime**, from the subscription portal in your account menu.
  Cancelling stops the next renewal; you keep access until the end of the
  period you already paid for.
- **Refunds**: within 14 days of the most recent charge, no questions
  asked. Email davidmonterocrespo24@gmail.com.
- **Switching tiers**: cancel the current subscription first, then
  subscribe to the other one.

Step-by-step instructions live in
[Subscription and billing](/docs/account/subscription/).

## Classrooms and institutions

[Velxio for Classroom](https://velxio.dev/for-schools) gives every student
in a course full Pro access under one institutional contract, from
$40 per student per year with volume discounts.

## Self-hosting

Velxio is open-source under the AGPLv3, and the hosted app at velxio.dev
is built from that same source. You can run it yourself for free — the
paid plans fund the hosted service, the emulation servers and the AI
providers behind it.

For current prices and checkout, see the
[pricing page](https://velxio.dev/pricing).
