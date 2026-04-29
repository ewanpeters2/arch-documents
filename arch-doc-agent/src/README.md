# Architecture Document Agent

A VS Code extension that helps create Architecture Decision Records (ADRs) and Tech Assessments (TAs) with AI assistance.

## Features

- **@adr** - Create and manage Architecture Decision Records
- **@ta** - Create and manage Tech Assessments

## ADR Commands

| Command | Description |
|---------|-------------|
| `@adr /new` | Start guided ADR interview (6 steps) |
| `@adr /quick [title]` | Quick ADR creation with prompts |
| `@adr /list` | List existing ADRs |
| `@adr /review` | Review open ADR against principles |
| `@adr /suggest [topic]` | Get AI suggestions for ADR content |

## TA Commands

| Command | Description |
|---------|-------------|
| `@ta /new` | Start guided TA interview (6 steps) |
| `@ta /quick [title]` | Quick TA creation with prompts |
| `@ta /list` | List existing Tech Assessments |
| `@ta /repos` | Show repository catalog |

## Repository Catalog

Create `doc-templates/repos.md` to maintain a list of repos that will be suggested during interviews.
