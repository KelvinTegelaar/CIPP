# Shadow AI Discovery

This page will allow you to view AI tools in use in a tenant for the purpose of discovering unapproved tools known as shadow AI.

## Action Buttons

<details>

<summary>Executive Shadow AI Report</summary>

This will allow you to generate an executive summary of the shadow AI in the tenant for ease of sharing with client management. Optionally select the sections you wish to include before clicking the download PDF button

</details>

<details>

<summary>Sync data</summary>

Allows you to queue a refresh of the cached data present in the page.

</details>

## Overview

The overview contains several information cards that you can use to get a view of the tenant's shadow IT.

### Info Cards

* AI Tools Detected: The number of distinct AI tools found in the tenant.&#x20;
* Device Installs: The number of device installs for AI tools. This is total installs across the Intune fleet so one app can be installed multiple times.
* AI Apps in Entra: The number of AI applications seen in Entra.
* High-Risk AI Tools: The number of high-risk AI tools found in the tenant.

### Data Cards

#### AI Tools by Category

This will show you the tools by category. The categories are:

* **AI Assistant** — general-purpose chat (ChatGPT, Claude, Gemini, Copilot, Perplexity, DeepSeek, Grok). The "paste anything into a box" tools.
* **AI Coding** — assistants and agentic editors (Copilot, Cursor, Cline, Devin, Replit, v0, Bolt, Lovable, Aider).
* **AI Agent & Automation** — autonomous agents and LLM-wired workflow platforms (AutoGPT, CrewAI, Manus, Lindy, n8n, Zapier, Make). Often carry standing OAuth grants into mailboxes/CRMs.
* **AI Image & Design** — generation/editing (Midjourney, Stable Diffusion, DALL-E, Firefly, Canva, ComfyUI, Remove.bg).
* **AI Video & Audio** — video, TTS, and voice cloning (Sora, Synthesia, HeyGen, Runway, Descript, ElevenLabs, CapCut, Suno).
* **AI Meeting Notetaker** — recorders/transcribers with auto-join bots (Otter, Fireflies, Fathom, tl;dv, Granola). Heavy recording-consent angle.
* **AI Writing & Translation** — writing aids, paraphrasers, translation (Grammarly, Jasper, QuillBot, Wordtune, DeepL, Writer).
* **AI Email** — AI email clients/assistants that take mailbox access (Fyxer, Superhuman, Shortwave, Lavender).
* **AI Search & Research** — answer engines and document Q\&A (NotebookLM, Glean, Phind, ChatPDF, AskYourPDF).
* **AI Presentation & Productivity** — deck/note builders plus AI browser sidebar extensions (Gamma, Tome, Notion, Mem, Monica, Sider, Merlin, MaxAI).
* **Local AI Runtime** — locally-run/self-hosted model tooling (Ollama, LM Studio, GPT4All, Jan, Open WebUI, LocalAI). On-device data but ungoverned.
* **AI Platform & API** — model providers, API aggregators, dev frameworks, cloud ML (Azure OpenAI, Vertex, Bedrock, Hugging Face, OpenRouter, Groq, LangChain).
* **AI Business Apps** — vertical SaaS with embedded AI for sales/HR/legal/support/data (Gong, Apollo, Harvey, Spellbook, HireVue, Julius, Chatbase).
* **AI Companion Chatbot** — persona/roleplay/adult chat (Character.AI, Candy.AI, Janitor AI, Crushon, FlowGPT). No business use; these are HR/policy findings.
* **AI-Capable Editor** — not AI itself, listed for visibility as the host for AI extensions (VS Code, JetBrains AI).

#### Top AI Tools

This chart shows you the top AI tools in use. There are two ways to view this chart:

* By installations: The summed Intune device count per tool
* By users: The summed 7-day sign-in activity count per tool

#### AI Tool Risk Distribution

This pie chart will show you the risk distribution of the AI tools in the tenant.

{% hint style="info" %}
Note that this risk distribution is adjusted for sanctioning. See the sanctioning action in the [#ai-application-in-entra-table](shadow-ai.md#ai-application-in-entra-table "mention")
{% endhint %}

Risk Categorization:

* **High** (red, 36 tools): Default/common usage exfiltrates sensitive data with no contractual protection or is inherently disqualifying. Four rough sub-patterns: consumer accounts that train on input (ChatGPT free/Plus, Grok); foreign-jurisdiction data residency (DeepSeek, Qwen, Kimi, CapCut, Manus — China); autonomous agents with broad standing access (AutoGPT, Devin, CrewAI, Lindy, Fyxer's full-mailbox grant); exfiltration-as-the-product or policy violations (ChatPDF, Julius, Chatbase, Otter/Fireflies meeting bots, Character.AI and other companion chatbots, public-by-default builders like Replit/Lovable/Bolt/v0, and broad page-reading extensions like Monica/Sider/Merlin/MaxAI).
* **Medium** (amber, 118 tools): The default bucket. Legitimate tools that are fine on business/enterprise tiers but land here because discovery typically finds the free/personal-account version, sending data to a vendor cloud under consumer terms without the catastrophic exposure of the High patterns. Most coding assistants, notetakers, creative tools, and API platforms sit here.
* **Low** (blue, 12 tools): contractually safe by design:. Enterprise services governed by the org's own tenant/subscription/terms (Azure OpenAI, Vertex, Microsoft Copilot with commercial data protection, NotebookLM under Workspace, Adobe Firefly, JetBrains AI, Writer, Hugging Face, Moveworks, Jan). Worth visibility, low data risk.
* **Informational** (green, 8 tools in-catalog, plus any sanctioned): not really shadow AI: mainstream business software listed only because it has embedded AI (Canva, Notion, Coda, Databricks, Salesforce Einstein, ServiceNow Now Assist, Atlassian Rovo), AI-capable editors (VS Code), and anything you've marked Company Sanctioned for the tenant, since that override forces this level.

## AI Software on Managed Devices (Intune) Table

Lists AI-related software installed on the tenant's Intune-managed devices. Each row is a detected application whose name and publisher matched the AI catalog, showing which tool it maps to, its category and risk, and the devices it's installed on. This is the device-installed view of Shadow AI: what's physically running on endpoints. It draws from the cached Intune detected-apps data, so it's empty when no installed software matches the catalog or the Intune cache hasn't been synced.

### Table Details

| Column          | Description                                                                                                                                                                  |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Application     | The installed app's display name exactly as Intune reports it (raw `displayName`), before tool-level normalization.                                                          |
| AI Tool         | The normalized catalog tool name the app matched to (e.g. "Cursor (User)" → `Cursor`). This is the dedup key used across the rest of the page.                               |
| Category        | The catalog category of the matched tool (e.g. AI Coding, AI Assistant, AI Meeting Notetaker).                                                                               |
| Risk            | The effective, sanction-aware risk level. Shows the catalog risk normally, or `Informational` when the tool is Company Sanctioned for the tenant.                            |
| Status          | `Sanctioned` or `Unsanctioned`, driven by the per-tenant `ShadowAIConfig` sanction table.                                                                                    |
| Publisher       | The software publisher string reported by Intune; also one of the two fields fed into the catalog match.                                                                     |
| Platform        | The OS/platform Intune reported, defaulting to `Unknown` when blank.                                                                                                         |
| Version         | The detected application version string from Intune.                                                                                                                         |
| Managed Devices | The devices backing the install; each entry carries `deviceName`, `userPrincipalName`, `platform`, and `osVersion`. Renders as the device list and feeds the row drill-down. |

### Table Actions

<table><thead><tr><th>Action</th><th>Description</th><th data-type="checkbox">Bulk Action Available</th></tr></thead><tbody><tr><td>Mark as Company Sanctioned</td><td>Shown when the row's <code>status</code> is not <code>Sanctioned</code>. Marks the tool sanctioned for the tenant so <code>risk</code> reports as <code>Informational</code> and <code>status</code> becomes <code>Sanctioned</code>. Refetches the report so cards, charts, and both tables update.</td><td>true</td></tr><tr><td>Remove Company Sanctioned Status</td><td>Shown when the row's <code>status</code> is <code>Sanctioned</code>. Removes the sanction so the catalog risk level applies again and <code>status</code> returns to <code>Unsanctioned</code>. Refetches the report so cards, charts, and both tables update.</td><td>true</td></tr></tbody></table>

## AI Application in Entra Table

Lists AI-related applications that have been consented into the tenant in Entra ID. Each row is a matched service principal, showing the tool it maps to, its category and risk, the OAuth permissions it was granted, and recent sign-in activity. This is the identity/consent view of Shadow AI: what's been authorized to access tenant data via OAuth, independent of any device install. It draws from the cached service principal and OAuth grant data, with a best-effort 7-day sign-in enrichment that requires Entra ID P1.

### Table Details

| Column                   | Description                                                                                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `application`            | The Entra service principal's display name — the enterprise application as it appears consented in the tenant.                                    |
| `aiTool`                 | The normalized catalog tool name matched from the service principal's display name. Shared dedup key with the rest of the page.                   |
| `category`               | The catalog category of the matched tool (e.g. AI Assistant, AI Agent & Automation, AI Email).                                                    |
| `risk`                   | The effective, sanction-aware risk level. Shows the catalog risk normally, or `Informational` when the tool is Company Sanctioned for the tenant. |
| `status`                 | `Sanctioned` or `Unsanctioned`, driven by the per-tenant `ShadowAIConfig` sanction table.                                                         |
| `applicationId`          | The application's `appId` (client ID) from the service principal.                                                                                 |
| `approvedPermissions`    | The individual delegated OAuth scopes granted to the app, derived from the tenant's OAuth2 permission grants and rendered as chips.               |
| `signInsLast7Days`       | Count of sign-ins to the app over the last 7 days. Best-effort enrichment that requires Entra ID P1; reports `0` when unavailable.                |
| `activeUsersLast7Days`   | Distinct users who signed in to the app over the last 7 days. Same P1 dependency; reports `0` when unavailable.                                   |
| `firstConsentedDateTime` | When the service principal was created in the tenant, used as a proxy for first consent (the OAuth grant start time is unreliable).               |

### Table Actions

<table><thead><tr><th>Action</th><th>Description</th><th data-type="checkbox">Bulk Action Available</th></tr></thead><tbody><tr><td>Mark as Company Sanctioned</td><td>Shown when the row's <code>status</code> is not <code>Sanctioned</code>. Marks the tool sanctioned for the tenant so <code>risk</code> reports as <code>Informational</code> and <code>status</code> becomes <code>Sanctioned</code>. Refetches the report so cards, charts, and both tables update.</td><td>true</td></tr><tr><td>Remove Company Sanctioned Status</td><td>Shown when the row's <code>status</code> is <code>Sanctioned</code>. Removes the sanction so the catalog risk level applies again and <code>status</code> returns to <code>Unsanctioned</code>. Refetches the report.</td><td>true</td></tr><tr><td>Application Users</td><td>Opens a side drawer listing the app's per-user sign-in activity over the last 7 days (<code>userPrincipalName</code>, <code>userDisplayName</code>, sign-in count, and last sign-in time). The data depends on the same P1 sign-in enrichment.</td><td>true</td></tr><tr><td>More Info</td><td>Opens the Extended Info flyout</td><td>false</td></tr></tbody></table>

***

{% include "../../.gitbook/includes/feature-request.md" %}
