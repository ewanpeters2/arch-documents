"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const ADR_TEMPLATE = `# ADR-{{NUMBER}}: {{TITLE}}

## Status
{{STATUS}} <!-- Draft | Proposed | Accepted | Deprecated | Superseded -->

## Date
{{DATE}}

## Owner
{{OWNER}}

## Category
{{CATEGORY}} <!-- Infrastructure | Data | Security | Integration | API | Other -->

## Priority
{{PRIORITY}} <!-- High | Medium | Low -->

## Context
<!-- What is the issue that we're seeing that is motivating this decision or change? -->
{{CONTEXT}}

## Decision
<!-- What is the change that we're proposing and/or doing? -->
{{DECISION}}

## Consequences
<!-- What becomes easier or more difficult to do because of this change? -->

### Positive
{{POSITIVE}}

### Negative
{{NEGATIVE}}

## Alternatives Considered
<!-- What other options were considered? -->
{{ALTERNATIVES}}

## Related Decisions
<!-- List any related ADRs -->
{{RELATED}}

## References
<!-- Links to relevant documentation, diagrams, etc. -->
{{REFERENCES}}
`;
const AI_PROMPTS = {
    microservices: {
        positive: [
            'Independent deployability and scaling',
            'Technology flexibility per service',
            'Improved fault isolation',
            'Smaller, focused codebases',
            'Team autonomy and ownership'
        ],
        negative: [
            'Increased operational complexity',
            'Network latency between services',
            'Distributed system challenges',
            'Data consistency complexity',
            'Higher infrastructure costs'
        ],
        alternatives: [
            'Modular monolith',
            'Serverless functions',
            'Service-oriented architecture (SOA)'
        ]
    },
    kafka: {
        positive: [
            'High throughput and scalability',
            'Durable message storage',
            'Decoupled producers and consumers',
            'Replay capability',
            'Strong ecosystem support'
        ],
        negative: [
            'Operational complexity',
            'Learning curve',
            'Eventual consistency challenges',
            'Resource intensive'
        ],
        alternatives: [
            'RabbitMQ',
            'AWS SQS/SNS',
            'Redis Pub/Sub',
            'Apache Pulsar'
        ]
    },
    kubernetes: {
        positive: [
            'Automated scaling and self-healing',
            'Declarative configuration',
            'Cloud-agnostic portability',
            'Strong ecosystem and community',
            'GitOps support'
        ],
        negative: [
            'Steep learning curve',
            'Operational complexity',
            'Resource overhead',
            'Security configuration complexity'
        ],
        alternatives: [
            'Docker Swarm',
            'AWS ECS',
            'HashiCorp Nomad',
            'AWS App Runner'
        ]
    },
    redis: {
        positive: [
            'Sub-millisecond latency',
            'Horizontal scaling',
            'Rich data structures',
            'Pub/Sub support',
            'Persistence options'
        ],
        negative: [
            'Memory intensive',
            'Cache invalidation complexity',
            'Additional infrastructure',
            'Data size limitations'
        ],
        alternatives: [
            'Memcached',
            'Hazelcast',
            'Database caching',
            'CDN caching'
        ]
    },
    api_gateway: {
        positive: [
            'Unified entry point',
            'Centralised authentication',
            'Rate limiting and throttling',
            'Request/response transformation',
            'API versioning support'
        ],
        negative: [
            'Single point of failure',
            'Additional latency',
            'Configuration complexity',
            'Vendor lock-in risk'
        ],
        alternatives: [
            'Service mesh (Istio)',
            'Load balancer with routing',
            'Direct service calls',
            'BFF pattern'
        ]
    },
    lambda: {
        positive: [
            'No server management',
            'Pay per execution',
            'Auto-scaling',
            'Quick deployment',
            'Event-driven architecture support'
        ],
        negative: [
            'Cold start latency',
            'Execution time limits',
            'Vendor lock-in',
            'Debugging complexity',
            'State management challenges'
        ],
        alternatives: [
            'Containers (ECS/Kubernetes)',
            'EC2 instances',
            'Azure Functions',
            'Google Cloud Functions'
        ]
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
        // Handle /adr new command
        if (request.command === 'new') {
            const title = request.prompt || 'Untitled';
            const nextNum = getNextAdrNumber(adrDir);
            const topic = detectTopic(title);
            // Category selection
            const category = await vscode.window.showQuickPick(['Infrastructure', 'Data', 'Security', 'Integration', 'API', 'Other'], { placeHolder: '📁 Select category' });
            if (!category) {
                return;
            }
            // Priority selection
            const priority = await vscode.window.showQuickPick(['High', 'Medium', 'Low'], { placeHolder: '🎯 Select priority' });
            if (!priority) {
                return;
            }
            // Context input
            const contextInput = await vscode.window.showInputBox({
                prompt: '📝 Enter context (why is this decision needed?)',
                placeHolder: 'e.g., We need to improve scalability...'
            });
            // Decision input
            const decisionInput = await vscode.window.showInputBox({
                prompt: '✅ Enter decision (what did you decide?)',
                placeHolder: 'e.g., Use Kubernetes for container orchestration'
            });
            // Positive consequences
            let positiveConsequences = [];
            if (topic && AI_PROMPTS[topic]) {
                const suggested = AI_PROMPTS[topic].positive;
                const selected = await vscode.window.showQuickPick(suggested.map(s => ({ label: s, picked: true })), {
                    placeHolder: '👍 Select positive consequences (AI suggestions)',
                    canPickMany: true
                });
                positiveConsequences = selected?.map(s => s.label) || [];
            }
            const customPositive = await vscode.window.showInputBox({
                prompt: '➕ Add custom positive consequence (or leave blank)'
            });
            if (customPositive) {
                positiveConsequences.push(customPositive);
            }
            // Negative consequences
            let negativeConsequences = [];
            if (topic && AI_PROMPTS[topic]) {
                const suggested = AI_PROMPTS[topic].negative;
                const selected = await vscode.window.showQuickPick(suggested.map(s => ({ label: s, picked: true })), {
                    placeHolder: '👎 Select negative consequences (AI suggestions)',
                    canPickMany: true
                });
                negativeConsequences = selected?.map(s => s.label) || [];
            }
            const customNegative = await vscode.window.showInputBox({
                prompt: '➖ Add custom negative consequence (or leave blank)'
            });
            if (customNegative) {
                negativeConsequences.push(customNegative);
            }
            // Alternatives
            let alternatives = [];
            if (topic && AI_PROMPTS[topic]) {
                const suggested = AI_PROMPTS[topic].alternatives;
                const selected = await vscode.window.showQuickPick(suggested.map(s => ({ label: s, picked: false })), {
                    placeHolder: '🔄 Select alternatives considered (AI suggestions)',
                    canPickMany: true
                });
                alternatives = selected?.map(s => s.label) || [];
            }
            const customAlt = await vscode.window.showInputBox({
                prompt: '🔀 Add custom alternative (or leave blank)'
            });
            if (customAlt) {
                alternatives.push(customAlt);
            }
            // Generate file
            const date = new Date().toISOString().split('T')[0];
            const owner = 'Ewan Peters';
            const kebabTitle = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            const filename = `adr-${nextNum}-${kebabTitle}.md`;
            const filepath = path.join(adrDir, filename);
            const content = ADR_TEMPLATE
                .replace('{{NUMBER}}', nextNum)
                .replace('{{TITLE}}', title)
                .replace('{{DATE}}', date)
                .replace('{{OWNER}}', owner)
                .replace('{{STATUS}}', 'Draft')
                .replace('{{CATEGORY}}', category)
                .replace('{{PRIORITY}}', priority)
                .replace('{{CONTEXT}}', contextInput || 'To be defined')
                .replace('{{DECISION}}', decisionInput || 'To be defined')
                .replace('{{POSITIVE}}', positiveConsequences.map(p => `- ${p}`).join('\n') || '')
                .replace('{{NEGATIVE}}', negativeConsequences.map(n => `- ${n}`).join('\n') || '')
                .replace('{{ALTERNATIVES}}', alternatives.length ? alternatives.join(', ') : 'None identified yet')
                .replace('{{RELATED}}', 'None')
                .replace('{{REFERENCES}}', '');
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
| Category | ${category} |
| Priority | ${priority} |
| Positive | ${positiveConsequences.length} items |
| Negative | ${negativeConsequences.length} items |
| Alternatives | ${alternatives.length} items |
`);
            return;
        }
        // Handle /adr suggest command
        if (request.command === 'suggest') {
            const topic = detectTopic(request.prompt || '');
            if (topic && AI_PROMPTS[topic]) {
                const suggestions = AI_PROMPTS[topic];
                stream.markdown(`## 💡 Suggestions for ${topic.toUpperCase()} ADR

### Positive Consequences
${suggestions.positive.map(p => `- ${p}`).join('\n')}

### Negative Consequences
${suggestions.negative.map(n => `- ${n}`).join('\n')}

### Alternatives
${suggestions.alternatives.map(a => `- ${a}`).join('\n')}
`);
                return;
            }
            stream.markdown(`## 📚 Available Topics

| Topic | Command |
|-------|---------|
| Microservices | \`@adr /suggest microservices\` |
| Kafka | \`@adr /suggest kafka\` |
| Kubernetes | \`@adr /suggest kubernetes\` |
| Redis | \`@adr /suggest redis\` |
| API Gateway | \`@adr /suggest api gateway\` |
| Lambda | \`@adr /suggest lambda\` |
`);
            return;
        }
        // Handle /adr list command
        if (request.command === 'list') {
            if (!fs.existsSync(adrDir)) {
                stream.markdown('📭 No ADRs found. Create one with `@adr /new [title]`');
                return;
            }
            const files = fs.readdirSync(adrDir)
                .filter(f => f.startsWith('adr-') && f.endsWith('.md'))
                .sort();
            stream.markdown(`## 📋 Existing ADRs

${files.map(f => `- \`${f}\``).join('\n')}

**Total:** ${files.length} ADRs
`);
            return;
        }
        // Default: show help
        stream.markdown(`## 🏗️ ADR Agent

| Command | Description |
|---------|-------------|
| \`@adr /new [title]\` | Create a new ADR with prompts |
| \`@adr /suggest [topic]\` | Get AI suggestions |
| \`@adr /list\` | List existing ADRs |

### Examples
\`\`\`
@adr /new Adopting Microservices
@adr /suggest kafka
@adr /list
\`\`\`
`);
    };
    const participant = vscode.chat.createChatParticipant('adr-agent.adr', handler);
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
    if (lower.includes('microservice')) {
        return 'microservices';
    }
    if (lower.includes('kafka')) {
        return 'kafka';
    }
    if (lower.includes('kubernetes') || lower.includes('k8s')) {
        return 'kubernetes';
    }
    if (lower.includes('redis') || lower.includes('cache')) {
        return 'redis';
    }
    if (lower.includes('api gateway') || lower.includes('gateway')) {
        return 'api_gateway';
    }
    if (lower.includes('lambda') || lower.includes('serverless')) {
        return 'lambda';
    }
    return null;
}
function deactivate() { }
//# sourceMappingURL=extension.js.map