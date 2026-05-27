# Architecture Documents Workspace

A VS Code workspace for creating and managing architecture documentation with AI assistance via GitHub Copilot. The workspace provides a set of **skills** — structured prompts that guide Copilot through an interview-then-draft flow to produce consistently formatted, high-quality architecture documents.

---

## 📁 Workspace Structure

```
arch-docs/          # Published architecture documents
  adr-docs/         # Architecture Decision Records
  arch-validation/  # Architecture Validation reports
  ta-docs/          # Technical Assessments
doc-templates/      # Source templates for each document type
skills/             # Skill definitions used by GitHub Copilot
related-services/   # Service registry for cross-referencing repos
```

---

## 🛠️ Skills

Each skill follows a consistent flow: **load context → interview → confirm → draft → save**.

Copilot will ask questions one group at a time, cross-reference existing documents in the repo, and only generate the document once the interview is complete.

---

### ✍️ `/write-adr` — Write an Architecture Decision Record

Guides you through capturing a technology or design decision. Copilot will interview you about the problem, decision drivers, options considered, and recommendation — then generate a fully populated ADR.

**Example prompts:**
```
/write-adr
```
```
I need to write an ADR about replacing our polling mechanism with a push-based solution for real-time score updates.
```
```
Help me document the decision to adopt GraphQL for our React frontend.
```

---

### 📋 `/write-ta` — Write a Technical Assessment

Guides you through producing a Technical Assessment for a proposed change or integration. Copilot will interview you about the problem statement, assumptions, risks, effort, and impacted components.

**Example prompts:**
```
/write-ta
```
```
I need a technical assessment for migrating our in-memory market cache to Redis.
```
```
Write a TA comparing AWS AppSync vs a self-hosted WebSocket solution for real-time game state.
```

---

### 🔍 `/arch-validation` — Validate an Existing Architecture

Analyses an existing service or system and produces a structured architecture validation report. Copilot will assess architectural quality, integration patterns, risks, anti-patterns, and produce a set of prioritised recommendations with a proposed target architecture.

**Example prompts:**
```
/arch-validation
```
```
Validate the architecture of the FOE service — the repo is at /path/to/foe-service.
```
```
Review the current push notification architecture and identify any risks or anti-patterns.
```

---

## � Document Templates

Templates for each document type are in [`doc-templates/`](doc-templates/). These are used by the skills automatically — you do not need to edit them directly.

| Template | Purpose |
|----------|---------|
| [`adr-template.md`](doc-templates/adr-template.md) | Architecture Decision Record |
| [`ta-template.md`](doc-templates/ta-template.md) | Technical Assessment |
| [`arch-validation-template.md`](doc-templates/arch-validation-template.md) | Architecture Validation |
| [`architecture-principles.md`](doc-templates/architecture-principles.md) | Reference principles used during validation |

---

## 🚀 Getting Started

1. Open this workspace in VS Code.
2. Open GitHub Copilot Chat.
3. Use one of the example prompts above to launch a skill.
4. Answer the interview questions — Copilot will guide you through each section.
5. Review the draft and confirm before saving.
