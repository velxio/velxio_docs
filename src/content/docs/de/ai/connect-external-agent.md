---
title: Claude Code oder Codex verbinden
description: Steuern Sie ein gespeichertes Projekt von Ihrem eigenen KI-Agenten (Claude Code / Codex) über MCP – er baut die Schaltung und schreibt die Firmware live auf Ihrer Arbeitsfläche.
sidebar:
  order: 5
  badge:
    text: Pro
    variant: tip
---

Der integrierte [Agentenmodus](/docs/de/ai/agent-mode/) von Velxio führt den
Assistenten _innerhalb_ der App aus. **Connect AI agent** macht das Gegenteil:
Es ermöglicht Ihrem eigenen Agenten – **Claude Code** oder **OpenAI Codex** in
Ihrem Terminal –, auf ein gespeichertes Velxio-Projekt zuzugreifen und es für
Sie zu erstellen. Die Schaltung und der Code erscheinen innerhalb weniger
Sekunden auf Ihrer Arbeitsfläche, genau als hätte der In-App-Agent es getan.

Dies funktioniert über [MCP](https://modelcontextprotocol.io) (das Model Context
Protocol): Velxio stellt seine Schaltungs- und Code-Tools als MCP-Server bereit,
und Sie weisen Ihren Agenten mit einem projektspezifischen Token darauf hin.

![Das Connect AI agent Modal mit den Claude Code / Codex-Registerkarten, dem Setup-Befehl und der aktiven Verbindung](../../../../assets/docs/ai/connect-agent.png)

:::note
Das Verbinden eines externen Agenten ist eine **Pro**-Funktion. Kostenlose und
Maker-Tarife nutzen stattdessen die In-App-Modi [Agent](/docs/de/ai/agent-mode/)
und [Tutor](/docs/de/ai/tutor-mode/). Siehe [Tarife](/docs/de/getting-started/plans/).
:::

## Der schnellste Weg: das Claude-Code-Plugin

Wenn Sie Claude Code verwenden, installieren Sie das Plugin – es bringt die
Tools, einen `/velxio:build`-Befehl und das Verdrahtungswissen in einem Schritt:

```
/plugin marketplace add velxio/velxio-plugin
/plugin install velxio@velxio
```

Generieren Sie dann ein Token (Schritte unten), exportieren Sie es und starten
Sie Claude Code neu:

```bash
export VELXIO_MCP_TOKEN="vlxmcp_...your token..."
```

Jetzt erledigt `/velxio:build an HC-SR04 that prints distance over serial` die
ganze Arbeit. `/velxio:check` validiert und kompiliert, was bereits vorhanden
ist.

## Manuell verbinden, in drei Schritten

1. **Speichern Sie zuerst das Projekt.** Der Agent verbindet sich mit einem
   gespeicherten Projekt. Geben Sie ihm also einen Namen und speichern Sie es,
   falls Sie das noch nicht getan haben.
2. **Öffnen Sie den Verbindungsdialog.** Gehen Sie im Editor zu **Datei →
   Connect AI agent (Claude/Codex)**, wählen Sie die Registerkarte **Claude
   Code** oder **Codex CLI** und klicken Sie auf **Generate connection token**.
3. **Führen Sie den angezeigten Einzeiler** in Ihrem Terminal aus:

   **Claude Code**

   ```bash
   claude mcp add --transport http velxio https://velxio.dev/api/pro/mcp \
     --header "Authorization: Bearer vlxmcp_your_token_here"
   ```

   **Codex** – fügen Sie zu `~/.codex/config.toml` hinzu:

   ```toml
   [mcp_servers.velxio]
   url = "https://velxio.dev/api/pro/mcp"
   http_headers = { "Authorization" = "Bearer vlxmcp_your_token_here" }
   ```

Das war's. Starten Sie `claude` (oder `codex`) und bitten Sie es, etwas zu
bauen:

> _"Using the velxio tools, wire an HC-SR04 to the board and write the
> firmware that prints the distance over serial."_

Die Statuszeile im Modal wechselt auf **Connected**, sobald Ihr Agent seinen
ersten Aufruf tätigt, und die Bauteile, Drähte und der Code erscheinen live auf
Ihrer Arbeitsfläche.

## Was der Agent tun kann

Ihr Agent erhält dieselbe Tool-Ausstattung wie der In-App-Agent: Er kann das
Projekt lesen, Komponenten hinzufügen und verdrahten, Boards hinzufügen, Teile
auf einem Breadboard platzieren, den Sketch schreiben und bearbeiten und die
Schaltung validieren. Er verfügt außerdem über Velxios komponentenspezifische
**Skills** – exakte Pin-Namen, Verdrahtungsrezepte und Simulator-Fallstricke –
sodass er ein SSD1306 oder ein DHT22 korrekt verdrahtet, anstatt zu raten.

Er kann auch **kompilieren**: `compile_sketch` erstellt die Firmware auf dem
Velxio-Server und übergibt dem Agenten die Compiler-Ausgabe, sodass er seine
eigenen Fehler beheben kann, anstatt Ihnen Code zu nennen, der nicht baut. Das
Ausführen der Simulation und das Lesen des seriellen Monitors erfordern
weiterhin den Live-Emulator in Ihrem Tab – wenn der Build grün ist, drücken Sie
**Run** in Velxio.

## Anmelden ohne Token

Clients, die OAuth unterstützen (darunter Claude Code), können sich mit Ihrem
Velxio-Konto verbinden, anstatt ein eingefügtes Token zu verwenden: Weisen Sie
sie auf `https://velxio.dev/api/pro/mcp` ohne Anmeldedaten hin, und sie erkennen
den Anmeldeablauf, öffnen einen Browser und bitten Sie um Genehmigung. Der
Zustimmungsbildschirm nennt den Client und das Konto, und das empfangene
Zugriffstoken ist ausschließlich an den MCP-Endpunkt von Velxio gebunden.

Tokens bleiben der einfachste Weg, und an ihnen ändert sich nichts.

## Sicherheit

Das Verbindungstoken ist eine **eng begrenzte, projektspezifische
Berechtigung**, die dafür ausgelegt ist, in ein Drittanbieter-CLI eingefügt zu
werden:

- **Auf ein Projekt beschränkt.** Ein Token berührt immer nur das einzelne
  Projekt, für das es erstellt wurde – niemals Ihre anderen Projekte oder Ihr
  Konto.
- **Gehasht gespeichert, einmal angezeigt.** Velxio speichert nur einen Hash des
  Tokens; der Klartext wird nur einmal bei der Generierung angezeigt.
- **Widerrufbar.** Das Modal listet jede aktive Verbindung mit einer
  **Revoke**-Schaltfläche auf, und eine **Revoke all**-Aktion beendet alle auf
  einmal. Der Widerruf wird sofort wirksam.
- **Läuft ab.** Jedes Token funktioniert nach 90 Tagen nicht mehr; generieren
  Sie ein neues, um fortzufahren.

Wenn Sie ein Token jemals an einer unpassenden Stelle einfügen, öffnen Sie das
Modal und klicken Sie auf **Revoke** – das alte Token ist in dem Moment tot, in
dem Sie dies tun.

## Hinweise und Grenzen

- Die Bearbeitungen des Agenten werden wie jede andere Änderung in Ihrem Projekt
  gespeichert, sodass Ihr normaler Verlauf zum Rückgängigmachen und die
  Autospeicherung weiterhin gelten.
- Wenn das Projekt mit [GitHub Sync](/docs/de/getting-started/github-sync/)
  verknüpft ist, werden Agentenbearbeitungen auch in Ihr Repository gespiegelt
  (gebündelt, sodass ein Ausbruch von Bearbeitungen keine Commit-Flut
  verursacht).
- Kompilieren, Ausführen und Lesen des seriellen Monitors erfolgen im Browser.
  Halten Sie den Velxio-Tab also geöffnet, während Sie das Projekt von Ihrem
  Agenten aus steuern.

----- END PAGE -----
