"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
// =============================================================================
// ADR TEMPLATE - Full template with all sections
// =============================================================================
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

## Architecture Diagram
<!-- Visualise the architecture using Mermaid C4 syntax -->
\`\`\`mermaid
{{DIAGRAM}}
\`\`\`

## Principles Alignment
<!-- How does this decision align with our architecture principles? -->
| Principle | Alignment | Notes |
|-----------|-----------|-------|
| Cloud-First | {{CLOUD_FIRST}} | {{CLOUD_FIRST_NOTES}} |
| API-First | {{API_FIRST}} | {{API_FIRST_NOTES}} |
| Security by Design | {{SECURITY}} | {{SECURITY_NOTES}} |
| Observability | {{OBSERVABILITY}} | {{OBSERVABILITY_NOTES}} |
| Resilience | {{RESILIENCE}} | {{RESILIENCE_NOTES}} |
| Cost Efficiency | {{COST}} | {{COST_NOTES}} |
| Technology Standards | {{TECH_STANDARDS}} | {{TECH_STANDARDS_NOTES}} |
| Data Management | {{DATA_MGMT}} | {{DATA_MGMT_NOTES}} |

## Impacts
<!-- What areas will be impacted by this decision? -->

### Teams Impacted
{{TEAMS_IMPACTED}}

### Systems Impacted
{{SYSTEMS_IMPACTED}}

### Timeline
| Phase | Description | Duration |
|-------|-------------|----------|
{{TIMELINE}}

### Risks
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
{{RISKS}}

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
const TOPIC_SUGGESTIONS = {
    api: {
        drivers: ['Developer experience', 'Performance', 'Versioning strategy', 'Documentation', 'Client compatibility'],
        options: ['REST', 'GraphQL', 'gRPC', 'WebSocket', 'Server-Sent Events'],
        positive: ['Wide adoption and tooling', 'Strong typing', 'Efficient bandwidth', 'Real-time capabilities', 'Good documentation'],
        negative: ['Over-fetching/under-fetching', 'Learning curve', 'Browser support', 'Caching complexity', 'Versioning challenges'],
        risks: [
            { risk: 'Breaking changes for clients', likelihood: 'Medium', impact: 'High', mitigation: 'API versioning strategy' },
            { risk: 'Performance degradation', likelihood: 'Low', impact: 'Medium', mitigation: 'Load testing, caching' }
        ],
        teams: ['Frontend Team', 'Backend Team', 'Mobile Team']
    },
    database: {
        drivers: ['Query patterns', 'Scalability', 'Consistency requirements', 'Cost', 'Team expertise'],
        options: ['PostgreSQL', 'MongoDB', 'DynamoDB', 'Redis', 'Cassandra'],
        positive: ['ACID compliance', 'Flexible schema', 'Managed service', 'High performance', 'Strong consistency'],
        negative: ['Scaling limitations', 'Operational overhead', 'Vendor lock-in', 'Cost at scale', 'Migration complexity'],
        risks: [
            { risk: 'Data migration issues', likelihood: 'Medium', impact: 'High', mitigation: 'Phased migration, backups' },
            { risk: 'Performance degradation', likelihood: 'Medium', impact: 'Medium', mitigation: 'Index optimization, caching' }
        ],
        teams: ['Backend Team', 'Data Engineering Team', 'DBA Team']
    },
    messaging: {
        drivers: ['Throughput', 'Ordering guarantees', 'Durability', 'Latency', 'Operational complexity'],
        options: ['Kafka', 'SQS', 'RabbitMQ', 'Redis Pub/Sub', 'Kinesis'],
        positive: ['High throughput', 'Managed service', 'Replay capability', 'Decoupled systems', 'Durability'],
        negative: ['Operational complexity', 'Cost', 'Ordering limitations', 'Message size limits', 'Learning curve'],
        risks: [
            { risk: 'Message loss', likelihood: 'Low', impact: 'High', mitigation: 'DLQ, retries, monitoring' },
            { risk: 'Consumer lag', likelihood: 'Medium', impact: 'Medium', mitigation: 'Auto-scaling, alerting' }
        ],
        teams: ['Backend Team', 'Platform Team', 'DevOps Team']
    },
    infrastructure: {
        drivers: ['Scalability', 'Cost', 'Team expertise', 'Vendor strategy', 'Compliance'],
        options: ['Kubernetes', 'ECS', 'Lambda', 'EC2', 'App Runner'],
        positive: ['Auto-scaling', 'Managed service', 'Cost efficiency', 'Flexibility', 'High availability'],
        negative: ['Complexity', 'Cold starts', 'Vendor lock-in', 'Learning curve', 'Debugging difficulty'],
        risks: [
            { risk: 'Downtime during migration', likelihood: 'Medium', impact: 'High', mitigation: 'Blue-green deployment' },
            { risk: 'Cost overrun', likelihood: 'Medium', impact: 'Medium', mitigation: 'Budget alerts, right-sizing' }
        ],
        teams: ['Platform Team', 'DevOps Team', 'SRE Team']
    },
    security: {
        drivers: ['Compliance requirements', 'User experience', 'Integration needs', 'Cost'],
        options: ['OAuth2/OIDC', 'JWT', 'API Keys', 'mTLS', 'AWS IAM'],
        positive: ['Industry standard', 'Stateless', 'Simple implementation', 'Strong security', 'Audit trail'],
        negative: ['Token management', 'Revocation complexity', 'Key rotation', 'Certificate management', 'Implementation complexity'],
        risks: [
            { risk: 'Credential exposure', likelihood: 'Low', impact: 'Critical', mitigation: 'Secrets management, rotation' },
            { risk: 'Authentication bypass', likelihood: 'Low', impact: 'Critical', mitigation: 'Security testing, WAF' }
        ],
        teams: ['Security Team', 'Backend Team', 'Compliance Team']
    },
    websocket: {
        drivers: ['Real-time requirements', 'Latency', 'Scalability', 'Mobile support'],
        options: ['WebSockets', 'Server-Sent Events', 'AWS AppSync', 'Firebase', 'Socket.io'],
        positive: ['Real-time bidirectional communication', 'Low latency', 'Reduced server load', 'Native browser support', 'Efficient bandwidth'],
        negative: ['Connection management complexity', 'Stateful connections', 'Firewall issues', 'Scaling challenges', 'Fallback needed'],
        risks: [
            { risk: 'Connection scalability', likelihood: 'Medium', impact: 'High', mitigation: 'Load testing, auto-scaling' },
            { risk: 'Mobile network issues', likelihood: 'Medium', impact: 'Medium', mitigation: 'Reconnection logic, fallback' }
        ],
        teams: ['Frontend Team', 'Backend Team', 'Mobile Team']
    },
    microservices: {
        drivers: ['Team scalability', 'Deployment independence', 'Technology flexibility', 'Fault isolation'],
        options: ['Microservices', 'Modular monolith', 'Serverless', 'SOA'],
        positive: ['Independent deployability', 'Technology flexibility', 'Fault isolation', 'Team autonomy', 'Scalability'],
        negative: ['Operational complexity', 'Network latency', 'Data consistency', 'Higher costs', 'Debugging difficulty'],
        risks: [
            { risk: 'Service proliferation', likelihood: 'Medium', impact: 'Medium', mitigation: 'Service ownership, governance' },
            { risk: 'Integration failures', likelihood: 'Medium', impact: 'High', mitigation: 'Contract testing, circuit breakers' }
        ],
        teams: ['Backend Team', 'Platform Team', 'DevOps Team']
    },
    kafka: {
        drivers: ['Throughput', 'Ordering', 'Durability', 'Replay', 'Cost'],
        options: ['Kafka', 'SQS', 'RabbitMQ', 'Kinesis', 'Pulsar'],
        positive: ['High throughput', 'Durability', 'Replay capability', 'Partitioning', 'Strong ecosystem'],
        negative: ['Operational complexity', 'Learning curve', 'Cost', 'Eventual consistency', 'Resource intensive'],
        risks: [
            { risk: 'Consumer lag', likelihood: 'Medium', impact: 'Medium', mitigation: 'Monitoring, auto-scaling' },
            { risk: 'Data loss', likelihood: 'Low', impact: 'High', mitigation: 'Replication, backups' }
        ],
        teams: ['Backend Team', 'Platform Team', 'Data Engineering Team']
    }
};
// =============================================================================
// HELPER FUNCTIONS
// =============================================================================
function getNextAdrNumber(adrDir) {
    if (!fs.existsSync(adrDir)) {
        return '001';
    }
    const files = fs.readdirSync(adrDir);
    const numbers = files
        .filter((f) => f.match(/^adr-\d{3}/))
        .map((f) => parseInt(f.match(/^adr-(\d{3})/)?.[1] || '0', 10));
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
    if (lower.includes('kubernetes') || lower.includes('lambda') || lower.includes('container') || lower.includes('serverless') || lower.includes('infrastructure') || lower.includes('ecs'))
        return 'infrastructure';
    if (lower.includes('auth') || lower.includes('security') || lower.includes('oauth') || lower.includes('jwt') || lower.includes('iam'))
        return 'security';
    if (lower.includes('websocket') || lower.includes('push') || lower.includes('realtime') || lower.includes('real-time') || lower.includes('appsync') || lower.includes('notification'))
        return 'websocket';
    if (lower.includes('microservice'))
        return 'microservices';
    return null;
}
function detectCategory(title) {
    const lower = title.toLowerCase();
    if (lower.includes('api') || lower.includes('rest') || lower.includes('graphql'))
        return 'API';
    if (lower.includes('database') || lower.includes('data') || lower.includes('storage'))
        return 'Data';
    if (lower.includes('security') || lower.includes('auth') || lower.includes('encrypt'))
        return 'Security';
    if (lower.includes('kafka') || lower.includes('integration') || lower.includes('messaging'))
        return 'Integration';
    if (lower.includes('kubernetes') || lower.includes('infrastructure') || lower.includes('cloud') || lower.includes('aws'))
        return 'Infrastructure';
    return 'Other';
}
function generateDiagram(topic, title) {
    const safeTitle = title.replace(/[^a-zA-Z0-9 ]/g, '');
    if (topic === 'api') {
        return `C4Context
    title System Context - ${safeTitle}

    Person(user, "User", "API consumer")
    System(api, "API Layer", "Handles requests")
    System(backend, "Backend Services", "Business logic")
    SystemDb(db, "Database", "Data persistence")

    Rel(user, api, "Uses", "HTTPS")
    Rel(api, backend, "Calls", "Internal")
    Rel(backend, db, "Reads/Writes", "SQL")`;
    }
    if (topic === 'messaging' || topic === 'kafka') {
        return `C4Context
    title System Context - ${safeTitle}

    System(producer, "Producer", "Emits events")
    System(broker, "Message Broker", "Event streaming")
    System(consumer, "Consumer", "Processes events")
    SystemDb(db, "Database", "Data persistence")

    Rel(producer, broker, "Publishes", "Events")
    Rel(broker, consumer, "Delivers", "Events")
    Rel(consumer, db, "Writes", "SQL")`;
    }
    if (topic === 'websocket') {
        return `C4Context
    title System Context - ${safeTitle}

    Person(user, "User", "Web/Mobile user")
    System(frontend, "Frontend", "Client application")
    System(push, "Push Service", "Real-time delivery")
    System(backend, "Backend", "Business logic")
    SystemDb(db, "Database", "Data persistence")

    Rel(user, frontend, "Uses", "HTTPS")
    Rel(frontend, push, "Subscribes", "WebSocket")
    Rel(push, frontend, "Pushes", "Real-time")
    Rel(backend, push, "Publishes", "Events")
    Rel(backend, db, "Reads/Writes", "SQL")`;
    }
    if (topic === 'infrastructure' || topic === 'microservices') {
        return `C4Context
    title System Context - ${safeTitle}

    Person(user, "User", "End user")
    System(lb, "Load Balancer", "Traffic distribution")
    System(app, "Application", "Business logic")
    System(cache, "Cache", "Performance")
    SystemDb(db, "Database", "Data persistence")

    Rel(user, lb, "Requests", "HTTPS")
    Rel(lb, app, "Routes", "Internal")
    Rel(app, cache, "Reads/Writes", "Redis")
    Rel(app, db, "Reads/Writes", "SQL")`;
    }
    // Default
    return `C4Context
    title System Context - ${safeTitle}

    Person(user, "User", "End user")
    System(system, "System", "The system")
    SystemDb(db, "Database", "Data persistence")

    Rel(user, system, "Uses", "HTTPS")
    Rel(system, db, "Reads/Writes", "SQL")`;
}
function reviewAgainstPrinciples(content) {
    const principles = [];
    principles.push({
        name: 'Cloud-First',
        status: /aws|azure|gcp|managed|serverless|cloud/i.test(content) ? '✅' : '⚠️',
        notes: /aws|azure|gcp|managed|serverless|cloud/i.test(content) ? 'Uses cloud services' : 'Cloud approach unclear',
        recommendation: 'Evaluate managed cloud services'
    });
    principles.push({
        name: 'API-First',
        status: /api|rest|graphql|grpc|openapi/i.test(content) ? '✅' : '⚠️',
        notes: /api|rest|graphql|grpc|openapi/i.test(content) ? 'API strategy included' : 'API approach unclear',
        recommendation: 'Document API contracts'
    });
    principles.push({
        name: 'Security by Design',
        status: /security|auth|encrypt|tls|iam|oauth|cognito/i.test(content) ? '✅' : '⚠️',
        notes: /security|auth|encrypt|tls|iam|oauth|cognito/i.test(content) ? 'Security addressed' : 'Security not mentioned',
        recommendation: 'Add security considerations'
    });
    principles.push({
        name: 'Observability',
        status: /log|metric|trace|monitor|cloudwatch|datadog|x-ray/i.test(content) ? '✅' : '⚠️',
        notes: /log|metric|trace|monitor|cloudwatch|datadog|x-ray/i.test(content) ? 'Observability included' : 'Monitoring unclear',
        recommendation: 'Define logging and metrics strategy'
    });
    principles.push({
        name: 'Resilience',
        status: /resilience|retry|circuit|failover|redundan|backup|fallback/i.test(content) ? '✅' : '⚠️',
        notes: /resilience|retry|circuit|failover|redundan|backup|fallback/i.test(content) ? 'Resilience addressed' : 'Failure handling unclear',
        recommendation: 'Add failure scenarios and mitigations'
    });
    principles.push({
        name: 'Cost Efficiency',
        status: /cost|pricing|budget|pay-per|serverless|right-siz/i.test(content) ? '✅' : '⚠️',
        notes: /cost|pricing|budget|pay-per|serverless|right-siz/i.test(content) ? 'Cost considered' : 'Cost implications unclear',
        recommendation: 'Add cost analysis'
    });
    principles.push({
        name: 'Technology Standards',
        status: /node|python|go|react|swift|kotlin|postgres|redis|kafka/i.test(content) ? '✅' : '⚠️',
        notes: /node|python|go|react|swift|kotlin|postgres|redis|kafka/i.test(content) ? 'Uses approved tech' : 'Tech alignment unclear',
        recommendation: 'Verify technology alignment'
    });
    principles.push({
        name: 'Data Management',
        status: /gdpr|retention|backup|privacy|pii|compliance/i.test(content) ? '✅' : '⚠️',
        notes: /gdpr|retention|backup|privacy|pii|compliance/i.test(content) ? 'Data governance addressed' : 'Data governance unclear',
        recommendation: 'Add data retention and privacy considerations'
    });
    return principles;
}
// =============================================================================
// MAIN EXTENSION
// =============================================================================
function activate(context) {
    const handler = async (request, chatContext, stream, token) => {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!workspaceFolder) {
            stream.markdown('❌ Please open a workspace folder first.');
            return;
        }
        const adrDir = path.join(workspaceFolder, 'adr-docs');
        // =========================================================================
        // COMMAND: /new - Guided Interview
        // =========================================================================
        if (request.command === 'new') {
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

💡 **Tip:** You can also use \`@adr /quick [title]\` for faster ADR creation with minimal prompts.
`);
            return;
        }
        // =========================================================================
        // COMMAND: /quick - Quick ADR Creation
        // =========================================================================
        if (request.command === 'quick') {
            const title = request.prompt || 'Untitled Decision';
            const topic = detectTopic(title);
            const category = detectCategory(title);
            // Get user inputs via VS Code UI
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
                const suggested = TOPIC_SUGGESTIONS[topic].positive;
                const selected = await vscode.window.showQuickPick(suggested.map((s) => ({ label: s, picked: false })), { placeHolder: '✅ Select positive consequences', canPickMany: true });
                positiveConsequences = selected?.map((s) => s.label) || [];
            }
            const customPositive = await vscode.window.showInputBox({
                prompt: '➕ Add custom positive consequence (or leave blank)'
            });
            if (customPositive)
                positiveConsequences.push(customPositive);
            // Negative consequences
            let negativeConsequences = [];
            if (topic && TOPIC_SUGGESTIONS[topic]) {
                const suggested = TOPIC_SUGGESTIONS[topic].negative;
                const selected = await vscode.window.showQuickPick(suggested.map((s) => ({ label: s, picked: false })), { placeHolder: '❌ Select negative consequences', canPickMany: true });
                negativeConsequences = selected?.map((s) => s.label) || [];
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
                const selected = await vscode.window.showQuickPick(suggested.map((s) => ({ label: s, picked: false })), { placeHolder: '🔄 Select alternatives considered', canPickMany: true });
                options = selected?.map((s) => s.label) || [];
            }
            const customOption = await vscode.window.showInputBox({
                prompt: '🔀 Add custom alternative (or leave blank)'
            });
            if (customOption)
                options.push(customOption);
            // Generate ADR content
            const nextNum = getNextAdrNumber(adrDir);
            const date = new Date().toISOString().split('T')[0];
            const owner = 'Ewan Peters';
            const kebabTitle = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            const filename = `adr-${nextNum}-${kebabTitle}.md`;
            const filepath = path.join(adrDir, filename);
            // Get topic-specific data
            const topicData = topic ? TOPIC_SUGGESTIONS[topic] : null;
            const teams = topicData?.teams || ['Engineering Team', 'Platform Team'];
            const risks = topicData?.risks || [
                { risk: 'Implementation complexity', likelihood: 'Medium', impact: 'Medium', mitigation: 'Spike/POC first' }
            ];
            const content = ADR_TEMPLATE
                .replace('{{NUMBER}}', nextNum)
                .replace('{{TITLE}}', title)
                .replace('{{STATUS}}', 'Draft')
                .replace('{{DATE}}', date)
                .replace('{{OWNER}}', owner)
                .replace('{{CATEGORY}}', category)
                .replace('{{PRIORITY}}', priority)
                .replace('{{CONTEXT}}', problemStatement || 'To be defined')
                .replace('{{DECISION}}', decision || 'To be defined')
                .replace('{{DIAGRAM}}', generateDiagram(topic, title))
                .replace('{{CLOUD_FIRST}}', '✅').replace('{{CLOUD_FIRST_NOTES}}', '')
                .replace('{{API_FIRST}}', '✅').replace('{{API_FIRST_NOTES}}', '')
                .replace('{{SECURITY}}', '✅').replace('{{SECURITY_NOTES}}', '')
                .replace('{{OBSERVABILITY}}', '⚠️').replace('{{OBSERVABILITY_NOTES}}', 'Review needed')
                .replace('{{RESILIENCE}}', '⚠️').replace('{{RESILIENCE_NOTES}}', 'Review needed')
                .replace('{{COST}}', '✅').replace('{{COST_NOTES}}', '')
                .replace('{{TECH_STANDARDS}}', '✅').replace('{{TECH_STANDARDS_NOTES}}', '')
                .replace('{{DATA_MGMT}}', '✅').replace('{{DATA_MGMT_NOTES}}', '')
                .replace('{{TEAMS_IMPACTED}}', teams.map((t) => `- ${t}`).join('\n'))
                .replace('{{SYSTEMS_IMPACTED}}', '- To be identified')
                .replace('{{TIMELINE}}', '| Design | Architecture and planning | 1-2 weeks |\n| Implementation | Development and testing | 2-4 weeks |\n| Rollout | Staged deployment | 1-2 weeks |')
                .replace('{{RISKS}}', risks.map((r) => `| ${r.risk} | ${r.likelihood} | ${r.impact} | ${r.mitigation} |`).join('\n'))
                .replace('{{POSITIVE}}', positiveConsequences.map((p) => `- ✅ Good, because ${p.toLowerCase()}`).join('\n') || '- To be defined')
                .replace('{{NEGATIVE}}', negativeConsequences.map((n) => `- ❌ Bad, because ${n.toLowerCase()}`).join('\n') || '- To be defined')
                .replace('{{ALTERNATIVES}}', options.length > 0 ? options.join(', ') : 'None identified yet')
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
| Alternatives | ${options.length} items |

The file is now open in the editor.
`);
            return;
        }
        // =========================================================================
        // COMMAND: /list - List ADRs
        // =========================================================================
        if (request.command === 'list') {
            if (!fs.existsSync(adrDir)) {
                stream.markdown('📭 No ADRs found. Create one with `@adr /new` or `@adr /quick [title]`');
                return;
            }
            const files = fs.readdirSync(adrDir)
                .filter((f) => f.startsWith('adr-') && f.endsWith('.md'))
                .sort();
            const adrList = files.map((f) => {
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
${adrList.map((a, i) => `| ${i + 1} | ${a.title} | ${a.status} |`).join('\n')}

**Total:** ${files.length} ADRs
`);
            return;
        }
        // =========================================================================
        // COMMAND: /review - Review ADR against principles
        // =========================================================================
        if (request.command === 'review') {
            const activeEditor = vscode.window.activeTextEditor;
            if (!activeEditor || !activeEditor.document.fileName.endsWith('.md')) {
                stream.markdown('❌ Please open an ADR markdown file first, then run `@adr /review`');
                return;
            }
            const content = activeEditor.document.getText();
            const principles = reviewAgainstPrinciples(content);
            stream.markdown(`## 🔍 ADR Review

### Principles Alignment

| Principle | Status | Notes |
|-----------|--------|-------|
${principles.map((p) => `| ${p.name} | ${p.status} | ${p.notes} |`).join('\n')}

### Recommendations

${principles.filter((p) => p.status === '⚠️').map((p) => `- **${p.name}**: ${p.recommendation}`).join('\n') || '✅ All principles are well-aligned!'}
`);
            return;
        }
        // =========================================================================
        // COMMAND: /suggest - Get topic suggestions
        // =========================================================================
        if (request.command === 'suggest') {
            const topic = detectTopic(request.prompt || '');
            if (topic && TOPIC_SUGGESTIONS[topic]) {
                const suggestions = TOPIC_SUGGESTIONS[topic];
                stream.markdown(`## 💡 Suggestions for ${topic.toUpperCase()} ADR

### Decision Drivers
${suggestions.drivers.map((d) => `- ${d}`).join('\n')}

### Common Options
${suggestions.options.map((o) => `- ${o}`).join('\n')}

### Typical Pros
${suggestions.positive.map((p) => `- ✅ Good, because ${p.toLowerCase()}`).join('\n')}

### Typical Cons
${suggestions.negative.map((c) => `- ❌ Bad, because ${c.toLowerCase()}`).join('\n')}

### Common Risks
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
${suggestions.risks.map((r) => `| ${r.risk} | ${r.likelihood} | ${r.impact} | ${r.mitigation} |`).join('\n')}

### Teams Typically Impacted
${suggestions.teams.map((t) => `- ${t}`).join('\n')}
`);
                return;
            }
            stream.markdown(`## 📚 Available Topics

| Topic | Command |
|-------|---------|
| API Design | \`@adr /suggest api\` |
| Database | \`@adr /suggest database\` |
| Messaging/Kafka | \`@adr /suggest messaging\` |
| Infrastructure | \`@adr /suggest infrastructure\` |
| Security | \`@adr /suggest security\` |
| WebSocket/Push | \`@adr /suggest websocket\` |
| Microservices | \`@adr /suggest microservices\` |
`);
            return;
        }
        // =========================================================================
        // DEFAULT: Show help
        // =========================================================================
        stream.markdown(`## 🏗️ ADR Agent

| Command | Description |
|---------|-------------|
| \`@adr /new\` | Start guided ADR interview (6 steps) |
| \`@adr /quick [title]\` | Quick ADR creation with prompts |
| \`@adr /list\` | List existing ADRs with status |
| \`@adr /review\` | Review open ADR against principles |
| \`@adr /suggest [topic]\` | Get AI suggestions for ADR content |

### Examples
\`\`\`
@adr /new
@adr /quick Adopting GraphQL for APIs
@adr /suggest messaging
@adr /review
@adr /list
\`\`\`

### Guided Interview Flow

The \`/new\` command guides you through:
1. **[1/6] Problem Statement** - What problem are you solving?
2. **[2/6] Scope and Domain** - Which systems are affected?
3. **[3/6] Decision Drivers** - What constraints shape the decision?
4. **[4/6] Options** - What alternatives are being considered?
5. **[5/6] Pros and Cons** - Trade-offs for each option
6. **[6/6] Recommendation** - Final decision and consequences
`);
    };
    const participant = vscode.chat.createChatParticipant('adr-agent.adr', handler);
    context.subscriptions.push(participant);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map