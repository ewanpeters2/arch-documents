# Architecture Decision Records (ADR) Workspace

A VS Code workspace for creating and managing Architecture Decision Records with AI assistance using the **ADR Agent** extension.

## 🚀 Quick Start

### Prerequisites

- [Visual Studio Code](https://code.visualstudio.com/) (1.90.0 or later)
- [GitHub Copilot](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot) extension installed and active

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ewanpeters2/arch-documents.git
   cd arch-documents
   ```

2. **Install the ADR Agent extension:**
   ```bash
   code --install-extension adr-agent/adr-agent-0.0.2.vsix
   ```

   Or manually:
   - Open VS Code
   - Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
   - Type "Install from VSIX"
   - Select `adr-agent/adr-agent-0.0.2.vsix`

3. **Reload VS Code:**
   - Press `Cmd+Shift+P` → "Reload Window"

## 📋 Using the ADR Agent

Open GitHub Copilot Chat (`Cmd+Shift+I` or click the Copilot icon) and use the `@adr` commands:

### Available Commands

| Command | Description |
|---------|-------------|
| `@adr /new` | Start a guided 6-step interview to create an ADR |
| `@adr /quick [title]` | Quick ADR creation with interactive prompts |
| `@adr /list` | List all existing ADRs with their status |
| `@adr /review` | Review the open ADR against architecture principles |
| `@adr /suggest [topic]` | Get AI suggestions for ADR content |

### Sample Prompts

#### Create a new ADR with guided interview:
```
@adr /new
```
This walks you through 6 steps: Problem Statement → Scope → Drivers → Options → Pros/Cons → Recommendation

#### Quick ADR creation:
```
@adr /quick Adopting GraphQL for Client APIs
@adr /quick Migrating from Kafka to SQS
@adr /quick Implementing Redis for Session Caching
@adr /quick Using AWS AppSync for Real-time Notifications
```

#### Get AI suggestions for specific topics:
```
@adr /suggest api
@adr /suggest database
@adr /suggest messaging
@adr /suggest infrastructure
@adr /suggest security
@adr /suggest websocket
@adr /suggest microservices
```

#### Review an ADR against principles:
```
@adr /review
```
(Open an ADR file first, then run this command)

#### List all ADRs:
```
@adr /list
```

## 🏗️ What Gets Generated

Each ADR includes:

- **Metadata**: Status, Date, Owner, Category, Priority
- **Context & Decision**: Problem statement and chosen solution
- **Architecture Diagram**: Auto-generated Mermaid C4 diagram
- **Principles Alignment**: Evaluation against 8 architecture principles
- **Impacts**: Teams, Systems, Timeline, and Risks
- **Consequences**: Positive and negative outcomes
- **Alternatives**: Other options considered

### Architecture Principles

ADRs are evaluated against these principles:

| Principle | Description |
|-----------|-------------|
| Cloud-First | Prefer managed services, design for scale |
| API-First | Expose APIs, use OpenAPI, version APIs |
| Security by Design | Encrypt data, least privilege, no secrets in code |
| Observability | Logs, metrics, traces, health checks |
| Resilience | Circuit breakers, no SPOF, graceful degradation |
| Cost Efficiency | Right-size, auto-scale, prefer serverless |
| Technology Standards | Node.js, Python, Go, React, Swift, Kotlin, PostgreSQL, Redis, Kafka |
| Data Management | GDPR, retention policies, backup procedures |

## 📁 Project Structure

```
arch-documents/
├── adr-agent/              # VS Code extension source
│   ├── src/extension.ts    # Extension code
│   ├── package.json        # Extension manifest
│   └── adr-agent-0.0.2.vsix # Packaged extension
├── adr-docs/               # Generated ADRs
│   ├── adr-001-*.md
│   ├── adr-002-*.md
│   └── ...
├── doc-templates/          # Templates
│   ├── adr-template.md     # ADR template
│   └── architecture-principles.md
├── .github/
│   └── copilot-instructions.md  # Copilot auto-fill rules
└── README.md
```

## 🔧 Development

### Building the Extension

```bash
cd adr-agent
npm install
npm run compile
npx vsce package
```

### Rebuilding After Changes

```bash
cd adr-agent
npm run compile
npx vsce package
code --install-extension adr-agent-0.0.2.vsix --force
```

## 📝 Using Copilot Chat (Alternative)

You can also create ADRs using natural language prompts in Copilot Chat:

```
New ADR: Adopting Microservices Architecture
```

```
Fill this ADR about: Switching from REST to GraphQL
```

The `.github/copilot-instructions.md` file configures Copilot to auto-fill ADR fields.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.
