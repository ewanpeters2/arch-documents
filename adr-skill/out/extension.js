"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Store interview state per session
const interviewSessions = new Map();
const TOPIC_SUGGESTIONS = {
    api: {
        drivers: ['Developer experience', 'Performance', 'Versioning strategy', 'Documentation', 'Client compatibility'],
        options: ['REST', 'GraphQL', 'gRPC', 'WebSocket', 'Server-Sent Events'],
        pros: ['Wide adoption and tooling', 'Strong typing', 'Efficient bandwidth', 'Real-time capabilities'],
        cons: ['Over-fetching/under-fetching', 'Learning curve', 'Browser support', 'Caching complexity']
    },
    database: {
        drivers: ['Query patterns', 'Scalability', 'Consistency requirements', 'Cost', 'Team expertise'],
        options: ['PostgreSQL', 'MongoDB', 'DynamoDB', 'Redis', 'Cassandra'],
        pros: ['ACID compliance', 'Flexible schema', 'Managed service', 'High performance'],
        cons: ['Scaling limitations', 'Operational overhead', 'Vendor lock-in', 'Cost at scale']
    },
    messaging: {
        drivers: ['Throughput', 'Ordering guarantees', 'Durability', 'Latency', 'Operational complexity'],
        options: ['Kafka', 'SQS', 'RabbitMQ', 'Redis Pub/Sub', 'Kinesis'],
        pros: ['High throughput', 'Managed service', 'Replay capability', 'Simple API'],
        cons: ['Operational complexity', 'Cost', 'Ordering limitations', 'Message size limits']
    },
    infrastructure: {
        drivers: ['Scalability', 'Cost', 'Team expertise', 'Vendor strategy', 'Compliance'],
        options: ['Kubernetes', 'ECS', 'Lambda', 'EC2', 'App Runner'],
        pros: ['Auto-scaling', 'Managed service', 'Cost efficiency', 'Flexibility'],
        cons: ['Complexity', 'Cold starts', 'Vendor lock-in', 'Learning curve']
    },
    security: {
        drivers: ['Compliance requirements', 'User experience', 'Integration needs', 'Cost'],
        options: ['OAuth2/OIDC', 'JWT', 'API Keys', 'mTLS', 'AWS IAM'],
        pros: ['Industry standard', 'Stateless', 'Simple implementation', 'Strong security'],
        cons: ['Token management', 'Revocation complexity', 'Key rotation', 'Certificate management']
    }
};
function activate(context) {
    const handler = async (request, chatContext, stream, token) => {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!workspaceFolder) {
            stream.markdown('❌ Please open a workspace folder first.');
            return;
        }
        const adrDir = path.join(workspaceFolder, 'adr-docs');
        const templatePath = path.join(workspaceFolder, 'doc-templates', 'adr-template.md');
        // Handle /write-adr new command - Guided Interview
        if (request.command === 'new') {
            const sessionId = Date.now().toString();
            interviewSessions.set(sessionId, { step: 1 });
            stream.markdown(`## 🏗️ New ADR - Guided Interview

I'll guide you through creating an Architecture Decision Record. Let's start!

---

### [1/6] Problem Statement

Please answer the following:

1. **What problem are you trying to solve?** Describe it in plain language.
2. **What is the current state?** What is in place today, and why is it insufficient?
3. **What happens if no decision is made?** (status quo consequences)

*Reply with your answers, then I'll continue to the next section.*

---

💡 **Tip:** You can also use \`@write-adr /quick [title]\` for faster ADR creation with minimal prompts.
`);
            return;
        }
        // Handle /write-adr quick command - Quick ADR Creation
        if (request.command === 'quick') {
            const title = request.prompt || 'Untitled Decision';
            const topic = detectTopic(title);
            // Get user inputs via VS Code UI
            const domain = await vscode.window.showQuickPick(['Infrastructure', 'Data', 'Security', 'Integration', 'API', 'Other'], { placeHolder: '📁 Select domain/category' });
            if (!domain)
                return;
            const priority = await vscode.window.showQuickPick(['High', 'Medium', 'Low'], { placeHolder: '🎯 Select priority' });
            if (!priority)
                return;
            const problemStatement = await vscode.window.showInputBox({
                prompt: '📝 What problem are you trying to solve?',
                placeHolder: 'e.g., We need to reduce API latency...'
            });
            const decision = await vscode.window.showInputBox({
                prompt: '✅ What is your decision/recommendation?',
                placeHolder: 'e.g., Adopt GraphQL for client-facing APIs'
            });
            // Positive consequences
            let positiveConsequences = [];
            if (topic && TOPIC_SUGGESTIONS[topic]) {
                const suggested = TOPIC_SUGGESTIONS[topic].pros;
                const selected = await vscode.window.showQuickPick(suggested.map(s => ({ label: s, picked: false })), { placeHolder: '✅ Select positive consequences', canPickMany: true });
                positiveConsequences = selected?.map(s => s.label) || [];
            }
            const customPositive = await vscode.window.showInputBox({
                prompt: '➕ Add custom positive consequence (or leave blank)'
            });
            if (customPositive)
                positiveConsequences.push(customPositive);
            // Negative consequences
            let negativeConsequences = [];
            if (topic && TOPIC_SUGGESTIONS[topic]) {
                const suggested = TOPIC_SUGGESTIONS[topic].cons;
                const selected = await vscode.window.showQuickPick(suggested.map(s => ({ label: s, picked: false })), { placeHolder: '❌ Select negative consequences', canPickMany: true });
                negativeConsequences = selected?.map(s => s.label) || [];
            }
            const customNegative = await vscode.window.showInputBox({
                prompt: '➖ Add custom negative consequence (or leave blank)'
            });
            if (customNegative)
                negativeConsequences.push(customNegative);
            // Options considered
            let options = [];
            if (topic && TOPIC_SUGGESTIONS[topic]) {
                const suggested = TOPIC_SUGGESTIONS[topic].options;
                const selected = await vscode.window.showQuickPick(suggested.map(s => ({ label: s, picked: false })), { placeHolder: '🔄 Select alternatives considered', canPickMany: true });
                options = selected?.map(s => s.label) || [];
            }
            const customOption = await vscode.window.showInputBox({
                prompt: '🔀 Add custom alternative (or leave blank)'
            });
            if (customOption)
                options.push(customOption);
            // Generate ADR
            const nextNum = getNextAdrNumber(adrDir);
            const date = new Date().toISOString().split('T')[0];
            const owner = 'Ewan Peters';
            const kebabTitle = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            const filename = `adr-${nextNum}-${kebabTitle}.md`;
            const filepath = path.join(adrDir, filename);
            const content = generateAdrContent({
                number: nextNum,
                title,
                date,
                owner,
                category: domain,
                priority: priority || 'Medium',
                context: problemStatement || 'To be defined',
                decision: decision || 'To be defined',
                positiveConsequences,
                negativeConsequences,
                alternatives: options,
                topic
            });
            // Create directory and file
            if (!fs.existsSync(adrDir)) {
                fs.mkdirSync(adrDir, { recursive: true });
            }
            fs.writeFileSync(filepath, content);
            // Open the file
            const doc = await vscode.workspace.openTextDocument(filepath);
            await vscode.window.showTextDocument(doc);
            stream.markdown(`✅ **Created:** \`${filename}\`

| Field | Value |
|-------|-------|
| Domain | ${domain} |
| Priority | ${priority} |
| Positive | ${positiveConsequences.length} items |
| Negative | ${negativeConsequences.length} items |
| Alternatives | ${options.length} items |

The file is now open in the editor. Review and edit as needed.
`);
            return;
        }
        // Handle /write-adr list command
        if (request.command === 'list') {
            if (!fs.existsSync(adrDir)) {
                stream.markdown('📭 No ADRs found. Create one with `@write-adr /new` or `@write-adr /quick [title]`');
                return;
            }
            const files = fs.readdirSync(adrDir)
                .filter(f => f.startsWith('adr-') && f.endsWith('.md'))
                .sort();
            // Read each file to extract title and status
            const adrList = files.map(f => {
                const content = fs.readFileSync(path.join(adrDir, f), 'utf-8');
                const titleMatch = content.match(/^# ADR-\d+: (.+)$/m);
                const statusMatch = content.match(/^## Status\s*\n([^\n]+)/m);
                return {
                    file: f,
                    title: titleMatch?.[1] || f,
                    status: statusMatch?.[1]?.replace(/<!--.*?-->/g, '').trim() || 'Unknown'
                };
            });
            stream.markdown(`## 📋 Existing ADRs

| # | Title | Status |
|---|-------|--------|
${adrList.map((a, i) => `| ${i + 1} | [${a.title}](${a.file}) | ${a.status} |`).join('\n')}

**Total:** ${files.length} ADRs
`);
            return;
        }
        // Handle /write-adr review command
        if (request.command === 'review') {
            const activeEditor = vscode.window.activeTextEditor;
            if (!activeEditor || !activeEditor.document.fileName.endsWith('.md')) {
                stream.markdown('❌ Please open an ADR markdown file first, then run `@write-adr /review`');
                return;
            }
            const content = activeEditor.document.getText();
            const principles = reviewAgainstPrinciples(content);
            stream.markdown(`## 🔍 ADR Review

### Principles Alignment

| Principle | Status | Notes |
|-----------|--------|-------|
${principles.map(p => `| ${p.name} | ${p.status} | ${p.notes} |`).join('\n')}

### Recommendations

${principles.filter(p => p.status === '⚠️' || p.status === '❌').map(p => `- **${p.name}**: ${p.recommendation}`).join('\n') || '✅ All principles are well-aligned!'}
`);
            return;
        }
        // Handle /write-adr suggest command
        if (request.command === 'suggest') {
            const topic = detectTopic(request.prompt || '');
            if (topic && TOPIC_SUGGESTIONS[topic]) {
                const suggestions = TOPIC_SUGGESTIONS[topic];
                stream.markdown(`## 💡 Suggestions for ${topic.toUpperCase()} ADR

### Decision Drivers to Consider
${suggestions.drivers.map(d => `- ${d}`).join('\n')}

### Common Options
${suggestions.options.map(o => `- ${o}`).join('\n')}

### Typical Pros
${suggestions.pros.map(p => `- ✅ Good, because ${p.toLowerCase()}`).join('\n')}

### Typical Cons
${suggestions.cons.map(c => `- ❌ Bad, because ${c.toLowerCase()}`).join('\n')}
`);
                return;
            }
            stream.markdown(`## 📚 Available Topics for Suggestions

| Topic | Command |
|-------|---------|
| API Design | \`@write-adr /suggest api\` |
| Database | \`@write-adr /suggest database\` |
| Messaging | \`@write-adr /suggest messaging\` |
| Infrastructure | \`@write-adr /suggest infrastructure\` |
| Security | \`@write-adr /suggest security\` |
`);
            return;
        }
        // Default: show help
        stream.markdown(`## 🏗️ ADR Skill - Write Architecture Decision Records

| Command | Description |
|---------|-------------|
| \`@write-adr /new\` | Start guided ADR interview |
| \`@write-adr /quick [title]\` | Quick ADR creation |
| \`@write-adr /list\` | List existing ADRs |
| \`@write-adr /review\` | Review open ADR against principles |
| \`@write-adr /suggest [topic]\` | Get suggestions for ADR content |

### Examples
\`\`\`
@write-adr /new
@write-adr /quick Adopting GraphQL for Client APIs
@write-adr /suggest messaging
@write-adr /review
\`\`\`

### Interview Flow

The \`/new\` command guides you through:
1. **Problem Statement** - What problem are you solving?
2. **Scope and Domain** - Which systems are affected?
3. **Decision Drivers** - What constraints shape the decision?
4. **Options** - What alternatives are being considered?
5. **Pros and Cons** - Trade-offs for each option
6. **Recommendation** - Final decision and consequences
`);
    };
    const participant = vscode.chat.createChatParticipant('adr-skill.write-adr', handler);
    context.subscriptions.push(participant);
}
function getNextAdrNumber(adrDir) {
    if (!fs.existsSync(adrDir)) {
        return '001';
    }
    const files = fs.readdirSync(adrDir);
    const numbers = files
        .filter(f => f.match(/^adr-\d{3}/))
        .map(f => parseInt(f.match(/^adr-(\d{3})/)?.[1] || '0', 10));
    const max = Math.max(0, ...numbers);
    return String(max + 1).padStart(3, '0');
}
function detectTopic(title) {
    const lower = title.toLowerCase();
    if (lower.includes('api') || lower.includes('rest') || lower.includes('graphql') || lower.includes('grpc'))
        return 'api';
    if (lower.includes('database') || lower.includes('postgres') || lower.includes('mongo') || lower.includes('dynamo'))
        return 'database';
    if (lower.includes('kafka') || lower.includes('sqs') || lower.includes('messaging') || lower.includes('queue') || lower.includes('event'))
        return 'messaging';
    if (lower.includes('kubernetes') || lower.includes('lambda') || lower.includes('container') || lower.includes('serverless') || lower.includes('infrastructure'))
        return 'infrastructure';
    if (lower.includes('auth') || lower.includes('security') || lower.includes('oauth') || lower.includes('jwt'))
        return 'security';
    return null;
}
function generateAdrContent(adr) {
    const diagram = generateDiagram(adr.topic, adr.title);
    return `# ADR-${adr.number}: ${adr.title}

## Status
Draft <!-- Draft | Proposed | Accepted | Deprecated | Superseded -->

## Date
${adr.date}

## Owner
${adr.owner}

## Category
${adr.category} <!-- Infrastructure | Data | Security | Integration | API | Other -->

## Priority
${adr.priority} <!-- High | Medium | Low -->

## Context
<!-- What is the issue that we're seeing that is motivating this decision or change? -->
${adr.context}

## Decision
<!-- What is the change that we're proposing and/or doing? -->
${adr.decision}

## Architecture Diagram
<!-- Visualise the architecture using Mermaid C4 syntax -->
\`\`\`mermaid
${diagram}
\`\`\`

## Principles Alignment
<!-- How does this decision align with our architecture principles? -->
| Principle | Alignment | Notes |
|-----------|-----------|-------|
| Cloud-First | ✅ | |
| API-First | ✅ | |
| Security by Design | ✅ | |
| Observability | ✅ | |
| Resilience | ⚠️ | Review needed |
| Cost Efficiency | ✅ | |
| Technology Standards | ✅ | |
| Data Management | ✅ | |

## Impacts
<!-- What areas will be impacted by this decision? -->

### Teams Impacted
- Engineering Team
- Platform Team
- DevOps Team

### Systems Impacted
- To be identified

### Timeline
| Phase | Description | Duration |
|-------|-------------|----------|
| Design | Architecture and planning | 1-2 weeks |
| Implementation | Development and testing | 2-4 weeks |
| Rollout | Staged deployment | 1-2 weeks |

### Risks
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Implementation complexity | Medium | Medium | Spike/POC first |
| Integration issues | Low | High | Thorough testing |

## Consequences
<!-- What becomes easier or more difficult to do because of this change? -->

### Positive
${adr.positiveConsequences.map(p => `- ✅ Good, because ${p.toLowerCase()}`).join('\n') || '- To be defined'}

### Negative
${adr.negativeConsequences.map(n => `- ❌ Bad, because ${n.toLowerCase()}`).join('\n') || '- To be defined'}

## Alternatives Considered
<!-- What other options were considered? -->
${adr.alternatives.length > 0 ? adr.alternatives.join(', ') : 'None identified yet'}

## Related Decisions
<!-- List any related ADRs -->
None

## References
<!-- Links to relevant documentation, diagrams, etc. -->

`;
}
function generateDiagram(topic, title) {
    const baseTitle = `System Context Diagram - ${title}`;
    if (topic === 'api') {
        return `C4Context
    title ${baseTitle}

    Person(user, "User", "End user or client application")
    
    System(api, "API Layer", "Handles client requests")
    System(backend, "Backend Services", "Business logic")
    
    SystemDb(db, "Database", "Data persistence")

    Rel(user, api, "Uses", "HTTPS")
    Rel(api, backend, "Calls", "Internal")
    Rel(backend, db, "Reads/Writes", "SQL")`;
    }
    if (topic === 'messaging') {
        return `C4Context
    title ${baseTitle}

    System(producer, "Producer Service", "Emits events")
    System(broker, "Message Broker", "Event streaming")
    System(consumer, "Consumer Service", "Processes events")
    
    SystemDb(db, "Database", "Data persistence")

    Rel(producer, broker, "Publishes", "Events")
    Rel(broker, consumer, "Delivers", "Events")
    Rel(consumer, db, "Writes", "SQL")`;
    }
    if (topic === 'infrastructure') {
        return `C4Context
    title ${baseTitle}

    Person(user, "User", "End user")
    
    System(lb, "Load Balancer", "Traffic distribution")
    System(app, "Application", "Business logic")
    System(cache, "Cache", "Performance optimization")
    
    SystemDb(db, "Database", "Data persistence")

    Rel(user, lb, "Requests", "HTTPS")
    Rel(lb, app, "Routes", "Internal")
    Rel(app, cache, "Reads/Writes", "Redis")
    Rel(app, db, "Reads/Writes", "SQL")`;
    }
    // Default diagram
    return `C4Context
    title ${baseTitle}

    Person(user, "User", "End user")
    
    System(system, "System", "The system being designed")
    
    SystemDb(db, "Database", "Data persistence")

    Rel(user, system, "Uses", "HTTPS")
    Rel(system, db, "Reads/Writes", "SQL")`;
}
function reviewAgainstPrinciples(content) {
    const principles = [];
    // Cloud-First
    const hasCloudService = /aws|azure|gcp|managed|serverless/i.test(content);
    principles.push({
        name: 'Cloud-First',
        status: hasCloudService ? '✅' : '⚠️',
        notes: hasCloudService ? 'Uses cloud services' : 'Consider managed alternatives',
        recommendation: 'Evaluate managed cloud services to reduce operational overhead'
    });
    // API-First
    const hasApiMention = /api|rest|graphql|grpc|openapi/i.test(content);
    principles.push({
        name: 'API-First',
        status: hasApiMention ? '✅' : '⚠️',
        notes: hasApiMention ? 'API considerations included' : 'API strategy not mentioned',
        recommendation: 'Document API contracts and versioning strategy'
    });
    // Security by Design
    const hasSecurity = /security|auth|encrypt|tls|iam|oauth/i.test(content);
    principles.push({
        name: 'Security by Design',
        status: hasSecurity ? '✅' : '⚠️',
        notes: hasSecurity ? 'Security addressed' : 'Security not explicitly mentioned',
        recommendation: 'Add security considerations (authentication, encryption, access control)'
    });
    // Observability
    const hasObservability = /log|metric|trace|monitor|cloudwatch|datadog/i.test(content);
    principles.push({
        name: 'Observability',
        status: hasObservability ? '✅' : '⚠️',
        notes: hasObservability ? 'Observability considered' : 'Monitoring not mentioned',
        recommendation: 'Define logging, metrics, and tracing strategy'
    });
    // Resilience
    const hasResilience = /resilience|retry|circuit|failover|redundan|backup/i.test(content);
    principles.push({
        name: 'Resilience',
        status: hasResilience ? '✅' : '⚠️',
        notes: hasResilience ? 'Resilience addressed' : 'Failure handling not mentioned',
        recommendation: 'Add failure scenarios and mitigation strategies'
    });
    // Cost Efficiency
    const hasCost = /cost|pricing|budget|pay-per|serverless/i.test(content);
    principles.push({
        name: 'Cost Efficiency',
        status: hasCost ? '✅' : '⚠️',
        notes: hasCost ? 'Cost considered' : 'Cost implications not mentioned',
        recommendation: 'Add cost analysis and optimization considerations'
    });
    // Technology Standards
    const hasStandards = /node|python|go|react|postgres|redis|kafka/i.test(content);
    principles.push({
        name: 'Technology Standards',
        status: hasStandards ? '✅' : '⚠️',
        notes: hasStandards ? 'Uses approved technologies' : 'Technology alignment unclear',
        recommendation: 'Verify alignment with approved technology stack'
    });
    // Data Management
    const hasDataMgmt = /gdpr|retention|backup|privacy|pii/i.test(content);
    principles.push({
        name: 'Data Management',
        status: hasDataMgmt ? '✅' : '⚠️',
        notes: hasDataMgmt ? 'Data management addressed' : 'Data governance not mentioned',
        recommendation: 'Add data retention, privacy, and compliance considerations'
    });
    return principles;
}
function deactivate() { }
//# sourceMappingURL=extension.js.map