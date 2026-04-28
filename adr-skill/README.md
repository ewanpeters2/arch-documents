# ADR Skill

A VS Code extension that helps create Architecture Decision Records (ADRs) with a guided interview flow.

## Commands

| Command | Description |
|---------|-------------|
| `@write-adr /new` | Start guided ADR interview |
| `@write-adr /quick [title]` | Quick ADR creation with minimal prompts |
| `@write-adr /list` | List existing ADRs |
| `@write-adr /review` | Review open ADR against architecture principles |
| `@write-adr /suggest [topic]` | Get suggestions for ADR content |

## Interview Flow

The `/new` command guides you through a structured interview:

1. **[1/6] Problem Statement** - What problem are you solving?
2. **[2/6] Scope and Domain** - Which systems are affected?
3. **[3/6] Decision Drivers** - What constraints shape the decision?
4. **[4/6] Options** - What alternatives are being considered?
5. **[5/6] Pros and Cons** - Trade-offs for each option
6. **[6/6] Recommendation** - Final decision and consequences

## Quick ADR Creation

For faster ADR creation, use:

```
@write-adr /quick Adopting GraphQL for Client APIs
```

This prompts you for essential information and generates a complete ADR.

## Topic Suggestions

Get suggestions for common architectural topics:

```
@write-adr /suggest api
@write-adr /suggest database
@write-adr /suggest messaging
@write-adr /suggest infrastructure
@write-adr /suggest security
```

## Review Against Principles

Open an ADR file and run:

```
@write-adr /review
```

This checks the ADR against architecture principles:
- Cloud-First
- API-First
- Security by Design
- Observability
- Resilience
- Cost Efficiency
- Technology Standards
- Data Management

## Installation

1. Build the extension:
   ```bash
   cd adr-skill
   npm install
   npm run compile
   npx vsce package --allow-missing-repository
   ```

2. Install in VS Code:
   ```bash
   code --install-extension adr-skill-0.0.1.vsix
   ```

3. Reload VS Code and use `@write-adr` in Copilot Chat.
