import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

// =============================================================================
// INTERVIEW STATE MANAGEMENT
// =============================================================================

interface InterviewState {
  step: number;
  title: string;
  problemStatement: string;
  currentState: string;
  statusQuoConsequences: string;
  scope: string;
  systemsAffected: string[];
  drivers: string[];
  options: string[];
  selectedOption: string;
  positive: string[];
  negative: string[];
  recommendation: string;
  priority: string;
  category: string;
  repos: Array<{ repo: string; purpose: string; keyFiles: string }>;
}

// Store interview state per workspace
const interviewStates: Map<string, InterviewState> = new Map();

function getInterviewState(workspaceFolder: string): InterviewState | undefined {
  return interviewStates.get(workspaceFolder);
}

function setInterviewState(workspaceFolder: string, state: InterviewState): void {
  interviewStates.set(workspaceFolder, state);
}

function clearInterviewState(workspaceFolder: string): void {
  interviewStates.delete(workspaceFolder);
}

function createEmptyInterviewState(): InterviewState {
  return {
    step: 1,
    title: '',
    problemStatement: '',
    currentState: '',
    statusQuoConsequences: '',
    scope: '',
    systemsAffected: [],
    drivers: [],
    options: [],
    selectedOption: '',
    positive: [],
    negative: [],
    recommendation: '',
    priority: 'Medium',
    category: 'Other',
    repos: []
  };
}

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

## Related Repositories
<!-- GitHub repositories relevant to this decision for code review and context -->
| Repository | Purpose | Key Files/Folders |
|------------|---------|-------------------|
{{REPOS}}

## References
<!-- Links to relevant documentation, diagrams, etc. -->
{{REFERENCES}}
`;

// =============================================================================
// TOPIC SUGGESTIONS - AI suggestions for different topics
// =============================================================================

interface TopicSuggestions {
  drivers: string[];
  options: string[];
  positive: string[];
  negative: string[];
  risks: Array<{ risk: string; likelihood: string; impact: string; mitigation: string }>;
  teams: string[];
}

const TOPIC_SUGGESTIONS: Record<string, TopicSuggestions> = {
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

function getNextAdrNumber(adrDir: string): string {
  if (!fs.existsSync(adrDir)) {
    return '001';
  }
  const files = fs.readdirSync(adrDir);
  const numbers = files
    .filter((f: string) => f.match(/^adr-\d{3}/))
    .map((f: string) => parseInt(f.match(/^adr-(\d{3})/)?.[1] || '0', 10));
  const max = Math.max(0, ...numbers);
  return String(max + 1).padStart(3, '0');
}

function detectTopic(title: string): string | null {
  const lower = title.toLowerCase();
  if (lower.includes('api') || lower.includes('rest') || lower.includes('graphql') || lower.includes('grpc')) return 'api';
  if (lower.includes('database') || lower.includes('postgres') || lower.includes('mongo') || lower.includes('dynamo')) return 'database';
  if (lower.includes('kafka') || lower.includes('sqs') || lower.includes('messaging') || lower.includes('queue') || lower.includes('event')) return 'messaging';
  if (lower.includes('kubernetes') || lower.includes('lambda') || lower.includes('container') || lower.includes('serverless') || lower.includes('infrastructure') || lower.includes('ecs')) return 'infrastructure';
  if (lower.includes('auth') || lower.includes('security') || lower.includes('oauth') || lower.includes('jwt') || lower.includes('iam')) return 'security';
  if (lower.includes('websocket') || lower.includes('push') || lower.includes('realtime') || lower.includes('real-time') || lower.includes('appsync') || lower.includes('notification')) return 'websocket';
  if (lower.includes('microservice')) return 'microservices';
  return null;
}

function detectCategory(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes('api') || lower.includes('rest') || lower.includes('graphql')) return 'API';
  if (lower.includes('database') || lower.includes('data') || lower.includes('storage')) return 'Data';
  if (lower.includes('security') || lower.includes('auth') || lower.includes('encrypt')) return 'Security';
  if (lower.includes('kafka') || lower.includes('integration') || lower.includes('messaging')) return 'Integration';
  if (lower.includes('kubernetes') || lower.includes('infrastructure') || lower.includes('cloud') || lower.includes('aws')) return 'Infrastructure';
  return 'Other';
}

function generateDiagram(topic: string | null, title: string): string {
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

interface PrincipleReview {
  name: string;
  status: string;
  notes: string;
  recommendation: string;
}

function reviewAgainstPrinciples(content: string): PrincipleReview[] {
  const principles: PrincipleReview[] = [];
  
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

export function activate(context: vscode.ExtensionContext) {
  
  const handler: vscode.ChatRequestHandler = async (
    request: vscode.ChatRequest,
    chatContext: vscode.ChatContext,
    stream: vscode.ChatResponseStream,
    token: vscode.CancellationToken
  ) => {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceFolder) {
      stream.markdown('❌ Please open a workspace folder first.');
      return;
    }

    const adrDir = path.join(workspaceFolder, 'adr-docs');

    // =========================================================================
    // Check for active interview and handle follow-up responses
    // =========================================================================
    const currentState = getInterviewState(workspaceFolder);
    
    // If there's an active interview and no command, process the response
    if (currentState && !request.command && request.prompt) {
      await handleInterviewResponse(currentState, request.prompt, workspaceFolder, adrDir, stream);
      return;
    }

    // =========================================================================
    // COMMAND: /new - Start Guided Interview
    // =========================================================================
    if (request.command === 'new') {
      // Initialize new interview state
      const newState = createEmptyInterviewState();
      
      // If a title was provided, use it
      if (request.prompt) {
        newState.title = request.prompt;
        const topic = detectTopic(request.prompt);
        newState.category = detectCategory(request.prompt);
      }
      
      setInterviewState(workspaceFolder, newState);
      
      stream.markdown(`## 🏗️ New ADR - Guided Interview

I'll guide you through creating an Architecture Decision Record step by step.

---

### [1/6] Problem Statement

Please provide the following information:

1. **What problem are you trying to solve?**
2. **What is the current state?** (What exists today and why is it insufficient?)
3. **What happens if no decision is made?** (Status quo consequences)

*Just type your answers naturally, and I'll extract the key information.*

---

💡 **Tips:**
- Type \`@adr /cancel\` to cancel the interview
- Type \`@adr /quick [title]\` for faster ADR creation
`);
      return;
    }

    // =========================================================================
    // COMMAND: /cancel - Cancel Interview
    // =========================================================================
    if (request.command === 'cancel') {
      clearInterviewState(workspaceFolder);
      stream.markdown('🛑 **Interview cancelled.** Start a new one with `@adr /new`');
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
      const priority = await vscode.window.showQuickPick(
        ['High', 'Medium', 'Low'],
        { placeHolder: '🎯 Select priority' }
      );
      if (!priority) return;

      const problemStatement = await vscode.window.showInputBox({
        prompt: '📝 What problem are you trying to solve?',
        placeHolder: 'e.g., We need to reduce API latency...'
      });

      const decision = await vscode.window.showInputBox({
        prompt: '✅ What is your decision/recommendation?',
        placeHolder: 'e.g., Adopt GraphQL for client-facing APIs'
      });

      // Positive consequences
      let positiveConsequences: string[] = [];
      if (topic && TOPIC_SUGGESTIONS[topic]) {
        const suggested = TOPIC_SUGGESTIONS[topic].positive;
        const selected = await vscode.window.showQuickPick(
          suggested.map((s: string) => ({ label: s, picked: false })),
          { placeHolder: '✅ Select positive consequences', canPickMany: true }
        );
        positiveConsequences = selected?.map((s: vscode.QuickPickItem) => s.label) || [];
      }
      const customPositive = await vscode.window.showInputBox({
        prompt: '➕ Add custom positive consequence (or leave blank)'
      });
      if (customPositive) positiveConsequences.push(customPositive);

      // Negative consequences
      let negativeConsequences: string[] = [];
      if (topic && TOPIC_SUGGESTIONS[topic]) {
        const suggested = TOPIC_SUGGESTIONS[topic].negative;
        const selected = await vscode.window.showQuickPick(
          suggested.map((s: string) => ({ label: s, picked: false })),
          { placeHolder: '❌ Select negative consequences', canPickMany: true }
        );
        negativeConsequences = selected?.map((s: vscode.QuickPickItem) => s.label) || [];
      }
      const customNegative = await vscode.window.showInputBox({
        prompt: '➖ Add custom negative consequence (or leave blank)'
      });
      if (customNegative) negativeConsequences.push(customNegative);

      // Options considered
      let options: string[] = [];
      if (topic && TOPIC_SUGGESTIONS[topic]) {
        const suggested = TOPIC_SUGGESTIONS[topic].options;
        const selected = await vscode.window.showQuickPick(
          suggested.map((s: string) => ({ label: s, picked: false })),
          { placeHolder: '🔄 Select alternatives considered', canPickMany: true }
        );
        options = selected?.map((s: vscode.QuickPickItem) => s.label) || [];
      }
      const customOption = await vscode.window.showInputBox({
        prompt: '🔀 Add custom alternative (or leave blank)'
      });
      if (customOption) options.push(customOption);

      // Generate ADR
      await generateAndSaveADR({
        title,
        problemStatement: problemStatement || 'To be defined',
        decision: decision || 'To be defined',
        category,
        priority,
        positive: positiveConsequences,
        negative: negativeConsequences,
        alternatives: options,
        topic
      }, adrDir, stream);
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
        .filter((f: string) => f.startsWith('adr-') && f.endsWith('.md'))
        .sort();
      
      const adrList = files.map((f: string) => {
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
${adrList.map((a: { file: string; title: string; status: string }, i: number) => 
  `| ${i + 1} | ${a.title} | ${a.status} |`).join('\n')}

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
${principles.map((p: PrincipleReview) => `| ${p.name} | ${p.status} | ${p.notes} |`).join('\n')}

### Recommendations

${principles.filter((p: PrincipleReview) => p.status === '⚠️').map((p: PrincipleReview) => 
  `- **${p.name}**: ${p.recommendation}`).join('\n') || '✅ All principles are well-aligned!'}
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
${suggestions.drivers.map((d: string) => `- ${d}`).join('\n')}

### Common Options
${suggestions.options.map((o: string) => `- ${o}`).join('\n')}

### Typical Pros
${suggestions.positive.map((p: string) => `- ✅ Good, because ${p.toLowerCase()}`).join('\n')}

### Typical Cons
${suggestions.negative.map((c: string) => `- ❌ Bad, because ${c.toLowerCase()}`).join('\n')}

### Common Risks
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
${suggestions.risks.map((r: { risk: string; likelihood: string; impact: string; mitigation: string }) => 
  `| ${r.risk} | ${r.likelihood} | ${r.impact} | ${r.mitigation} |`).join('\n')}

### Teams Typically Impacted
${suggestions.teams.map((t: string) => `- ${t}`).join('\n')}
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

  const participant = vscode.chat.createChatParticipant('arch-doc-agent.adr', handler);
  context.subscriptions.push(participant);

  // Register TA Chat Participant
  const taHandler = createTAHandler();
  const taParticipant = vscode.chat.createChatParticipant('arch-doc-agent.ta', taHandler);
  context.subscriptions.push(taParticipant);
}

// =============================================================================
// INTERVIEW RESPONSE HANDLER
// =============================================================================

async function handleInterviewResponse(
  state: InterviewState,
  response: string,
  workspaceFolder: string,
  adrDir: string,
  stream: vscode.ChatResponseStream
): Promise<void> {
  
  switch (state.step) {
    case 1: // Problem Statement
      // Extract information from response
      state.problemStatement = response;
      
      // Try to extract a title if not set
      if (!state.title) {
        // Extract first meaningful phrase as title
        const firstLine = response.split('\n')[0].substring(0, 100);
        state.title = extractTitle(firstLine);
        state.category = detectCategory(state.title);
      }
      
      state.step = 2;
      setInterviewState(workspaceFolder, state);
      
      stream.markdown(`✅ **Problem captured!**

---

### [2/6] Scope and Domain

Now let's define the scope:

1. **What systems or components are affected?** (e.g., frontend, backend, database, APIs)
2. **What teams need to be involved?**
3. **What is the boundary of this decision?** (What's in scope vs out of scope?)

*Type your response to continue...*
`);
      break;

    case 2: // Scope
      state.scope = response;
      state.systemsAffected = extractListItems(response);
      state.step = 3;
      setInterviewState(workspaceFolder, state);
      
      // Get topic suggestions
      const topic = detectTopic(state.title + ' ' + state.problemStatement);
      const suggestions = topic ? TOPIC_SUGGESTIONS[topic] : null;
      
      stream.markdown(`✅ **Scope defined!**

---

### [3/6] Decision Drivers

What constraints or factors are driving this decision?

${suggestions ? `**Suggested drivers for ${topic} decisions:**
${suggestions.drivers.map((d: string) => `- ${d}`).join('\n')}

` : ''}Consider factors like:
- Performance requirements
- Cost constraints
- Team expertise
- Timeline
- Compliance needs

*List the key drivers for your decision...*
`);
      break;

    case 3: // Drivers
      state.drivers = extractListItems(response);
      state.step = 4;
      setInterviewState(workspaceFolder, state);
      
      const topicForOptions = detectTopic(state.title + ' ' + state.problemStatement);
      const optionSuggestions = topicForOptions ? TOPIC_SUGGESTIONS[topicForOptions] : null;
      
      stream.markdown(`✅ **Drivers captured!**

---

### [4/6] Options Considered

What alternatives are you considering?

${optionSuggestions ? `**Common options for ${topicForOptions} decisions:**
${optionSuggestions.options.map((o: string) => `- ${o}`).join('\n')}

` : ''}For each option, briefly describe what it involves.

*List the options you're evaluating...*
`);
      break;

    case 4: // Options
      state.options = extractListItems(response);
      state.step = 5;
      setInterviewState(workspaceFolder, state);
      
      const topicForPros = detectTopic(state.title + ' ' + state.problemStatement);
      const proConSuggestions = topicForPros ? TOPIC_SUGGESTIONS[topicForPros] : null;
      
      stream.markdown(`✅ **Options captured!**

---

### [5/6] Pros and Cons

For your **recommended option**, what are the trade-offs?

${proConSuggestions ? `**Typical pros for ${topicForPros} decisions:**
${proConSuggestions.positive.slice(0, 3).map((p: string) => `- ✅ ${p}`).join('\n')}

**Typical cons:**
${proConSuggestions.negative.slice(0, 3).map((n: string) => `- ❌ ${n}`).join('\n')}

` : ''}List:
1. **Positive consequences** (what becomes easier/better)
2. **Negative consequences** (what becomes harder/risks)

*Describe the trade-offs...*
`);
      break;

    case 5: // Pros and Cons
      const { positive, negative } = extractProsAndCons(response);
      state.positive = positive;
      state.negative = negative;
      state.step = 6;
      setInterviewState(workspaceFolder, state);
      
      stream.markdown(`✅ **Trade-offs captured!**

---

### [6/6] Final Recommendation

Almost done! Now provide:

1. **Your recommendation** - What do you recommend and why?
2. **Priority** - High, Medium, or Low?

*Type your final recommendation...*
`);
      break;

    case 6: // Recommendation
      state.recommendation = response;
      state.selectedOption = extractRecommendation(response);
      
      // Detect priority from response
      if (response.toLowerCase().includes('high')) {
        state.priority = 'High';
      } else if (response.toLowerCase().includes('low')) {
        state.priority = 'Low';
      } else {
        state.priority = 'Medium';
      }
      
      // Clear interview state
      clearInterviewState(workspaceFolder);
      
      // Generate ADR
      const detectedTopic = detectTopic(state.title + ' ' + state.problemStatement);
      
      await generateAndSaveADR({
        title: state.title,
        problemStatement: state.problemStatement + '\n\n' + state.scope,
        decision: state.recommendation,
        category: state.category,
        priority: state.priority,
        positive: state.positive,
        negative: state.negative,
        alternatives: state.options,
        drivers: state.drivers,
        topic: detectedTopic
      }, adrDir, stream);
      
      stream.markdown(`

---

🎉 **Interview complete!** Your ADR has been generated and opened in the editor.

Review the document and fill in any remaining details like the Architecture Diagram and Principles Alignment table.
`);
      break;

    default:
      clearInterviewState(workspaceFolder);
      stream.markdown('❓ Interview state unclear. Starting fresh with `@adr /new`');
  }
}

// =============================================================================
// HELPER: Extract title from text
// =============================================================================

function extractTitle(text: string): string {
  // Remove common prefixes
  let title = text
    .replace(/^(we need to|we want to|i want to|the problem is|problem:|issue:)/i, '')
    .trim();
  
  // Capitalize first letter
  title = title.charAt(0).toUpperCase() + title.slice(1);
  
  // Truncate if too long
  if (title.length > 60) {
    title = title.substring(0, 57) + '...';
  }
  
  return title || 'Untitled Decision';
}

// =============================================================================
// HELPER: Extract list items from text
// =============================================================================

function extractListItems(text: string): string[] {
  const items: string[] = [];
  
  // Split by newlines, bullets, numbers, or commas
  const lines = text.split(/[\n,]|(?:^|\s)[-•*]\s|(?:^|\s)\d+\.\s/);
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length > 2) {
      items.push(trimmed);
    }
  }
  
  return items.length > 0 ? items : [text.trim()];
}

// =============================================================================
// HELPER: Extract pros and cons from text
// =============================================================================

function extractProsAndCons(text: string): { positive: string[]; negative: string[] } {
  const positive: string[] = [];
  const negative: string[] = [];
  
  const lines = text.split('\n');
  let currentSection: 'positive' | 'negative' | 'unknown' = 'unknown';
  
  for (const line of lines) {
    const lower = line.toLowerCase();
    const trimmed = line.trim();
    
    // Detect section headers
    if (lower.includes('positive') || lower.includes('pro') || lower.includes('benefit') || lower.includes('advantage') || lower.includes('good')) {
      currentSection = 'positive';
      continue;
    }
    if (lower.includes('negative') || lower.includes('con') || lower.includes('risk') || lower.includes('disadvantage') || lower.includes('bad') || lower.includes('downside')) {
      currentSection = 'negative';
      continue;
    }
    
    // Detect by symbols
    if (trimmed.startsWith('+') || trimmed.startsWith('✅') || lower.startsWith('pro:')) {
      positive.push(trimmed.replace(/^[+✅]\s*|^pro:\s*/i, ''));
      continue;
    }
    if (trimmed.startsWith('-') || trimmed.startsWith('❌') || lower.startsWith('con:')) {
      negative.push(trimmed.replace(/^[-❌]\s*|^con:\s*/i, ''));
      continue;
    }
    
    // Add to current section
    if (trimmed.length > 2) {
      if (currentSection === 'positive') {
        positive.push(trimmed.replace(/^[-•*]\s*/, ''));
      } else if (currentSection === 'negative') {
        negative.push(trimmed.replace(/^[-•*]\s*/, ''));
      }
    }
  }
  
  // If no clear sections, try to infer
  if (positive.length === 0 && negative.length === 0) {
    const items = extractListItems(text);
    // Put first half in positive, second half in negative
    const mid = Math.ceil(items.length / 2);
    positive.push(...items.slice(0, mid));
    negative.push(...items.slice(mid));
  }
  
  return { positive, negative };
}

// =============================================================================
// HELPER: Extract recommendation from text
// =============================================================================

function extractRecommendation(text: string): string {
  // Look for "recommend", "suggest", "propose", "decision"
  const match = text.match(/(?:recommend|suggest|propose|decision|chose|choose|selected|select|go with|using|use|adopt)[:\s]+([^.]+)/i);
  if (match) {
    return match[1].trim();
  }
  return text.split('\n')[0].substring(0, 100);
}

// =============================================================================
// HELPER: Generate and save ADR
// =============================================================================

interface ADRInput {
  title: string;
  problemStatement: string;
  decision: string;
  category: string;
  priority: string;
  positive: string[];
  negative: string[];
  alternatives: string[];
  drivers?: string[];
  topic: string | null;
  repos?: Array<{ repo: string; purpose: string; keyFiles: string }>;
}

async function generateAndSaveADR(
  input: ADRInput,
  adrDir: string,
  stream: vscode.ChatResponseStream
): Promise<void> {
  const nextNum = getNextAdrNumber(adrDir);
  const date = new Date().toISOString().split('T')[0];
  const owner = 'Ewan Peters';
  const kebabTitle = input.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const filename = `adr-${nextNum}-${kebabTitle}.md`;
  const filepath = path.join(adrDir, filename);

  // Get topic-specific data
  const topicData = input.topic ? TOPIC_SUGGESTIONS[input.topic] : null;
  const teams = topicData?.teams || ['Engineering Team', 'Platform Team'];
  const risks = topicData?.risks || [
    { risk: 'Implementation complexity', likelihood: 'Medium', impact: 'Medium', mitigation: 'Spike/POC first' }
  ];

  const content = ADR_TEMPLATE
    .replace('{{NUMBER}}', nextNum)
    .replace('{{TITLE}}', input.title)
    .replace('{{STATUS}}', 'Draft')
    .replace('{{DATE}}', date)
    .replace('{{OWNER}}', owner)
    .replace('{{CATEGORY}}', input.category)
    .replace('{{PRIORITY}}', input.priority)
    .replace('{{CONTEXT}}', input.problemStatement)
    .replace('{{DECISION}}', input.decision)
    .replace('{{DIAGRAM}}', generateDiagram(input.topic, input.title))
    .replace('{{CLOUD_FIRST}}', '✅').replace('{{CLOUD_FIRST_NOTES}}', '')
    .replace('{{API_FIRST}}', '✅').replace('{{API_FIRST_NOTES}}', '')
    .replace('{{SECURITY}}', '✅').replace('{{SECURITY_NOTES}}', '')
    .replace('{{OBSERVABILITY}}', '⚠️').replace('{{OBSERVABILITY_NOTES}}', 'Review needed')
    .replace('{{RESILIENCE}}', '⚠️').replace('{{RESILIENCE_NOTES}}', 'Review needed')
    .replace('{{COST}}', '✅').replace('{{COST_NOTES}}', '')
    .replace('{{TECH_STANDARDS}}', '✅').replace('{{TECH_STANDARDS_NOTES}}', '')
    .replace('{{DATA_MGMT}}', '✅').replace('{{DATA_MGMT_NOTES}}', '')
    .replace('{{TEAMS_IMPACTED}}', teams.map((t: string) => `- ${t}`).join('\n'))
    .replace('{{SYSTEMS_IMPACTED}}', '- To be identified')
    .replace('{{TIMELINE}}', '| Design | Architecture and planning | 1-2 weeks |\n| Implementation | Development and testing | 2-4 weeks |\n| Rollout | Staged deployment | 1-2 weeks |')
    .replace('{{RISKS}}', risks.map((r: { risk: string; likelihood: string; impact: string; mitigation: string }) => 
      `| ${r.risk} | ${r.likelihood} | ${r.impact} | ${r.mitigation} |`).join('\n'))
    .replace('{{POSITIVE}}', input.positive.length > 0 
      ? input.positive.map((p: string) => `- ✅ Good, because ${p.toLowerCase()}`).join('\n') 
      : '- To be defined')
    .replace('{{NEGATIVE}}', input.negative.length > 0 
      ? input.negative.map((n: string) => `- ❌ Bad, because ${n.toLowerCase()}`).join('\n') 
      : '- To be defined')
    .replace('{{ALTERNATIVES}}', input.alternatives.length > 0 ? input.alternatives.join(', ') : 'None identified yet')
    .replace('{{RELATED}}', 'None')
    .replace('{{REPOS}}', input.repos && input.repos.length > 0
      ? input.repos.map((r: { repo: string; purpose: string; keyFiles: string }) => 
          `| [${r.repo}](https://github.com/${r.repo}) | ${r.purpose} | ${r.keyFiles} |`).join('\n')
      : '| None specified | - | - |')
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
| Category | ${input.category} |
| Priority | ${input.priority} |
| Positive | ${input.positive.length} items |
| Negative | ${input.negative.length} items |
| Alternatives | ${input.alternatives.length} items |

The file is now open in the editor.
`);
}

// =============================================================================
// TA TEMPLATE
// =============================================================================

const TA_TEMPLATE = `# TA-{{NUMBER}}: {{TITLE}}

## Metadata

| Field | Value |
|-------|-------|
| **Status** | {{STATUS}} |
| **Date** | {{DATE}} |
| **Owner** | {{OWNER}} |
| **Category** | {{CATEGORY}} |
| **Priority** | {{PRIORITY}} |

## Problem Description
{{PROBLEM_DESCRIPTION}}

## Assumptions
| Assumption | Impact |
|------------|--------|
{{ASSUMPTIONS}}

## High Level Analysis
| What | Details |
|------|---------|
| Current State | {{CURRENT_STATE}} |
| Proposed Solution | {{PROPOSED_SOLUTION}} |
| Technical Approach | {{TECHNICAL_APPROACH}} |
| Dependencies | {{DEPENDENCIES}} |
| Constraints | {{CONSTRAINTS}} |

## Identified Impacts
| Component | Impact | Description |
|-----------|--------|-------------|
{{IMPACTS}}

## Risks and Challenges
| Risk | Description | Mitigation Plan |
|------|-------------|-----------------|
{{RISKS}}

## Effort Estimation
| Phase | Estimate | Notes |
|-------|----------|-------|
| Analysis | {{ANALYSIS_ESTIMATE}} | |
| Development | {{DEV_ESTIMATE}} | |
| Testing | {{TEST_ESTIMATE}} | |
| Deployment | {{DEPLOY_ESTIMATE}} | |
| **Total** | {{TOTAL_ESTIMATE}} | |

## Next Steps
{{NEXT_STEPS}}

## Related Repositories
<!-- GitHub repositories relevant to this assessment for code review and context -->
| Repository | Purpose | Key Files/Folders |
|------------|---------|-------------------|
{{REPOS}}

## References
{{REFERENCES}}
`;

// =============================================================================
// TA INTERVIEW STATE MANAGEMENT
// =============================================================================

interface TAInterviewState {
  step: number;
  title: string;
  problemDescription: string;
  assumptions: string[];
  currentState: string;
  proposedSolution: string;
  technicalApproach: string;
  dependencies: string;
  constraints: string;
  impacts: Array<{ component: string; impact: string; description: string }>;
  risks: Array<{ risk: string; description: string; mitigation: string }>;
  priority: string;
  category: string;
  repos: Array<{ repo: string; purpose: string; keyFiles: string }>;
}

const taInterviewStates: Map<string, TAInterviewState> = new Map();

function getTAInterviewState(workspaceFolder: string): TAInterviewState | undefined {
  return taInterviewStates.get(workspaceFolder);
}

function setTAInterviewState(workspaceFolder: string, state: TAInterviewState): void {
  taInterviewStates.set(workspaceFolder, state);
}

function clearTAInterviewState(workspaceFolder: string): void {
  taInterviewStates.delete(workspaceFolder);
}

function createEmptyTAInterviewState(): TAInterviewState {
  return {
    step: 1,
    title: '',
    problemDescription: '',
    assumptions: [],
    currentState: '',
    proposedSolution: '',
    technicalApproach: '',
    dependencies: '',
    constraints: '',
    impacts: [],
    risks: [],
    priority: 'Medium',
    category: 'Other',
    repos: []
  };
}

// =============================================================================
// TA HELPER FUNCTIONS
// =============================================================================

function getNextTANumber(taDir: string): string {
  if (!fs.existsSync(taDir)) {
    return '001';
  }
  const files = fs.readdirSync(taDir);
  const numbers = files
    .filter((f: string) => f.match(/^ta-\d{3}/))
    .map((f: string) => parseInt(f.match(/^ta-(\d{3})/)?.[1] || '0', 10));
  const max = Math.max(0, ...numbers);
  return String(max + 1).padStart(3, '0');
}

// =============================================================================
// REPOS CATALOG - Read repos from repos.md file
// =============================================================================

interface RepoCatalogEntry {
  repo: string;
  purpose: string;
  keyFiles: string;
  category: string;
}

function loadReposCatalog(workspaceFolder: string): RepoCatalogEntry[] {
  const reposFile = path.join(workspaceFolder, 'doc-templates', 'repos.md');
  
  if (!fs.existsSync(reposFile)) {
    return [];
  }
  
  const content = fs.readFileSync(reposFile, 'utf-8');
  const repos: RepoCatalogEntry[] = [];
  let currentCategory = 'General';
  
  const lines = content.split('\n');
  
  for (const line of lines) {
    // Detect category headers (## Category Name)
    const categoryMatch = line.match(/^##\s+(.+)$/);
    if (categoryMatch && !categoryMatch[1].includes('Format') && !categoryMatch[1].includes('How to')) {
      currentCategory = categoryMatch[1].trim();
      continue;
    }
    
    // Parse table rows: | owner/repo | purpose | key files |
    const tableMatch = line.match(/^\|\s*([a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|/);
    if (tableMatch) {
      repos.push({
        repo: tableMatch[1].trim(),
        purpose: tableMatch[2].trim(),
        keyFiles: tableMatch[3].trim().replace(/`/g, ''),
        category: currentCategory
      });
    }
  }
  
  return repos;
}

function formatReposCatalogForDisplay(repos: RepoCatalogEntry[]): string {
  if (repos.length === 0) {
    return 'No repos.md catalog found.';
  }
  
  const byCategory: Record<string, RepoCatalogEntry[]> = {};
  for (const repo of repos) {
    if (!byCategory[repo.category]) {
      byCategory[repo.category] = [];
    }
    byCategory[repo.category].push(repo);
  }
  
  let output = '';
  for (const [category, categoryRepos] of Object.entries(byCategory)) {
    output += `\n**${category}**\n`;
    for (const r of categoryRepos) {
      output += `- \`${r.repo}\` - ${r.purpose}\n`;
    }
  }
  
  return output;
}

// =============================================================================
// TA CHAT PARTICIPANT HANDLER
// =============================================================================

function createTAHandler(): vscode.ChatRequestHandler {
  return async (
    request: vscode.ChatRequest,
    chatContext: vscode.ChatContext,
    stream: vscode.ChatResponseStream,
    token: vscode.CancellationToken
  ) => {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceFolder) {
      stream.markdown('❌ Please open a workspace folder first.');
      return;
    }

    const taDir = path.join(workspaceFolder, 'ta-docs');

    // Check for active interview and handle follow-up responses
    const currentState = getTAInterviewState(workspaceFolder);
    
    if (currentState && !request.command && request.prompt) {
      await handleTAInterviewResponse(currentState, request.prompt, workspaceFolder, taDir, stream);
      return;
    }

    // COMMAND: /new - Start Guided TA Interview
    if (request.command === 'new') {
      const newState = createEmptyTAInterviewState();
      
      if (request.prompt) {
        newState.title = request.prompt;
        newState.category = detectCategory(request.prompt);
      }
      
      setTAInterviewState(workspaceFolder, newState);
      
      stream.markdown(`## 📋 New Tech Assessment - Guided Interview

I'll guide you through creating a Tech Assessment step by step.

---

### [1/6] Problem Description

Please describe:

1. **What is the problem or opportunity?**
2. **Why does this need to be assessed now?**
3. **What is the business impact?**

*Just type your answers naturally, and I'll extract the key information.*

---

💡 **Tips:**
- Type \`@ta /cancel\` to cancel the interview
- Type \`@ta /quick [title]\` for faster TA creation
`);
      return;
    }

    // COMMAND: /cancel - Cancel Interview
    if (request.command === 'cancel') {
      clearTAInterviewState(workspaceFolder);
      stream.markdown('🛑 **Interview cancelled.** Start a new one with `@ta /new`');
      return;
    }

    // COMMAND: /quick - Quick TA Creation
    if (request.command === 'quick') {
      const title = request.prompt || 'Untitled Assessment';
      const category = detectCategory(title);
      
      const priority = await vscode.window.showQuickPick(
        ['High', 'Medium', 'Low'],
        { placeHolder: '🎯 Select priority' }
      );
      if (!priority) return;

      const problemDescription = await vscode.window.showInputBox({
        prompt: '📝 What is the problem or opportunity?',
        placeHolder: 'e.g., We need to evaluate options for...'
      });

      const proposedSolution = await vscode.window.showInputBox({
        prompt: '💡 What is the proposed solution?',
        placeHolder: 'e.g., Implement a new caching layer...'
      });

      await generateAndSaveTA({
        title,
        problemDescription: problemDescription || 'To be defined',
        proposedSolution: proposedSolution || 'To be defined',
        category,
        priority,
        assumptions: [],
        impacts: [],
        risks: []
      }, taDir, stream);
      return;
    }

    // COMMAND: /list - List TAs
    if (request.command === 'list') {
      if (!fs.existsSync(taDir)) {
        stream.markdown('📭 No Tech Assessments found. Create one with `@ta /new` or `@ta /quick [title]`');
        return;
      }
      
      const files = fs.readdirSync(taDir)
        .filter((f: string) => f.startsWith('ta-') && f.endsWith('.md'))
        .sort();
      
      const taList = files.map((f: string) => {
        const content = fs.readFileSync(path.join(taDir, f), 'utf-8');
        const titleMatch = content.match(/^# TA-\d+: (.+)$/m);
        const statusMatch = content.match(/\*\*Status\*\*\s*\|\s*([^|]+)/);
        return {
          file: f,
          title: titleMatch?.[1] || f,
          status: statusMatch?.[1]?.trim() || 'Unknown'
        };
      });

      stream.markdown(`## 📋 Existing Tech Assessments

| # | Title | Status |
|---|-------|--------|
${taList.map((t: { file: string; title: string; status: string }, i: number) => 
  `| ${i + 1} | ${t.title} | ${t.status} |`).join('\n')}

**Total:** ${files.length} TAs
`);
      return;
    }

    // COMMAND: /repos - Show repos catalog
    if (request.command === 'repos') {
      const catalog = loadReposCatalog(workspaceFolder);
      
      if (catalog.length === 0) {
        stream.markdown(`## 📚 Repository Catalog

No \`repos.md\` file found. Create one at:

\`doc-templates/repos.md\`

**Example format:**
\`\`\`markdown
## Core Services

| Repository | Purpose | Key Files/Folders |
|------------|---------|-------------------|
| myorg/backend-api | Main API service | \`src/services/\` |
| myorg/frontend-app | React frontend | \`src/components/\` |
\`\`\`

This catalog will be offered as suggestions when adding repos to TAs and ADRs.
`);
        return;
      }
      
      // Group by category
      const byCategory: Record<string, typeof catalog> = {};
      for (const repo of catalog) {
        if (!byCategory[repo.category]) {
          byCategory[repo.category] = [];
        }
        byCategory[repo.category].push(repo);
      }
      
      let output = `## 📚 Repository Catalog

**Source:** \`doc-templates/repos.md\`

`;
      for (const [category, repos] of Object.entries(byCategory)) {
        output += `### ${category}\n`;
        output += `| Repository | Purpose | Key Files |\n`;
        output += `|------------|---------|----------|\n`;
        for (const r of repos) {
          output += `| [\`${r.repo}\`](https://github.com/${r.repo}) | ${r.purpose} | \`${r.keyFiles}\` |\n`;
        }
        output += '\n';
      }
      
      output += `\n**Total:** ${catalog.length} repos in catalog\n`;
      output += `\n💡 During TA/ADR interviews, type \`all\` to include all repos, or reference specific repos by name.`;
      
      stream.markdown(output);
      return;
    }

    // DEFAULT: Show help
    stream.markdown(`## 📋 TA Agent

| Command | Description |
|---------|-------------|
| \`@ta /new\` | Start guided TA interview (6 steps) |
| \`@ta /quick [title]\` | Quick TA creation with prompts |
| \`@ta /cancel\` | Cancel current interview |
| \`@ta /list\` | List existing Tech Assessments |
| \`@ta /repos\` | Show repository catalog |

### Examples
\`\`\`
@ta /new
@ta /quick Evaluate New Caching Solution
@ta /repos
@ta /list
\`\`\`

### Guided Interview Flow

The \`/new\` command guides you through:
1. **[1/6] Problem Description** - What needs to be assessed?
2. **[2/6] High Level Analysis** - Current state and proposed solution
3. **[3/6] Identified Impacts** - What components are affected?
4. **[4/6] Risks and Challenges** - What could go wrong?
5. **[5/6] Related Repositories** - GitHub repos for code review (from catalog)
6. **[6/6] Priority and Next Steps** - How urgent and what's next?

### Repository Catalog

Create \`doc-templates/repos.md\` to maintain a list of repos that will be suggested during interviews.
`);
  };
}

// =============================================================================
// TA INTERVIEW RESPONSE HANDLER
// =============================================================================

async function handleTAInterviewResponse(
  state: TAInterviewState,
  response: string,
  workspaceFolder: string,
  taDir: string,
  stream: vscode.ChatResponseStream
): Promise<void> {
  
  switch (state.step) {
    case 1: // Problem Description
      state.problemDescription = response;
      
      if (!state.title) {
        const firstLine = response.split('\n')[0].substring(0, 100);
        state.title = extractTitle(firstLine);
        state.category = detectCategory(state.title);
      }
      
      state.step = 2;
      setTAInterviewState(workspaceFolder, state);
      
      stream.markdown(`✅ **Problem captured!**

---

### [2/6] High Level Analysis

Please describe:

1. **Current State** - What exists today?
2. **Proposed Solution** - What do you recommend?
3. **Technical Approach** - How would it be implemented?
4. **Dependencies** - What does this depend on?
5. **Constraints** - What limitations exist?

*Type your analysis...*
`);
      break;

    case 2: // High Level Analysis
      // Extract analysis components
      state.currentState = response;
      state.proposedSolution = response;
      state.technicalApproach = response;
      
      state.step = 3;
      setTAInterviewState(workspaceFolder, state);
      
      stream.markdown(`✅ **Analysis captured!**

---

### [3/6] Identified Impacts

What components or systems will be affected?

For each impact, describe:
- **Component** (e.g., Frontend, Backend, Database)
- **Impact level** (High, Medium, Low)
- **Description** of the impact

*List the impacts...*
`);
      break;

    case 3: // Impacts
      state.impacts = extractImpacts(response);
      state.step = 4;
      setTAInterviewState(workspaceFolder, state);
      
      stream.markdown(`✅ **Impacts captured!**

---

### [4/6] Risks and Challenges

What could go wrong? For each risk:

- **Risk** - What is the risk?
- **Description** - More details
- **Mitigation Plan** - How to address it

*List the risks...*
`);
      break;

    case 4: // Risks
      state.risks = extractRisks(response);
      state.step = 5;
      setTAInterviewState(workspaceFolder, state);
      
      // Load repos catalog
      const reposCatalog = loadReposCatalog(workspaceFolder);
      const catalogDisplay = reposCatalog.length > 0 
        ? `\n📚 **Available from repos.md catalog:**\n${formatReposCatalogForDisplay(reposCatalog)}\n`
        : '';
      
      stream.markdown(`✅ **Risks captured!**

---

### [5/6] Related Repositories

List any GitHub repositories that should be reviewed for context.
${catalogDisplay}
**To add repos, either:**
- Type repo names from the catalog above (e.g., \`ewanpeters2/backend-api\`)
- Add new repos in format: \`owner/repo\` - purpose - key files
- Type \`all\` to include all repos from the catalog
- Type \`none\` to skip

*List the repos...*
`);
      break;

    case 5: // Related Repositories
      const catalog = loadReposCatalog(workspaceFolder);
      
      if (response.toLowerCase().trim() === 'all' && catalog.length > 0) {
        // Use all repos from catalog
        state.repos = catalog.map(r => ({
          repo: r.repo,
          purpose: r.purpose,
          keyFiles: r.keyFiles
        }));
      } else if (!response.toLowerCase().includes('none') && response.trim().length > 0) {
        // Check if response references catalog repos by name
        const mentionedRepos: Array<{ repo: string; purpose: string; keyFiles: string }> = [];
        
        for (const catalogRepo of catalog) {
          if (response.toLowerCase().includes(catalogRepo.repo.toLowerCase())) {
            mentionedRepos.push({
              repo: catalogRepo.repo,
              purpose: catalogRepo.purpose,
              keyFiles: catalogRepo.keyFiles
            });
          }
        }
        
        // Also extract any manually specified repos
        const manualRepos = extractRepos(response);
        
        // Merge, avoiding duplicates
        const allRepos = [...mentionedRepos];
        for (const manual of manualRepos) {
          if (!allRepos.find(r => r.repo.toLowerCase() === manual.repo.toLowerCase())) {
            allRepos.push(manual);
          }
        }
        
        state.repos = allRepos.length > 0 ? allRepos : [];
      }
      state.step = 6;
      setTAInterviewState(workspaceFolder, state);
      
      stream.markdown(`✅ **Repos captured!** (${state.repos.length} repos)

---

### [6/6] Priority and Next Steps

Almost done! Please provide:

1. **Priority** - High, Medium, or Low?
2. **Next Steps** - What should happen next?

*Type your response...*
`);
      break;

    case 6: // Priority and Next Steps
      if (response.toLowerCase().includes('high')) {
        state.priority = 'High';
      } else if (response.toLowerCase().includes('low')) {
        state.priority = 'Low';
      } else {
        state.priority = 'Medium';
      }
      
      clearTAInterviewState(workspaceFolder);
      
      await generateAndSaveTA({
        title: state.title,
        problemDescription: state.problemDescription,
        proposedSolution: state.proposedSolution,
        category: state.category,
        priority: state.priority,
        assumptions: state.assumptions,
        impacts: state.impacts,
        risks: state.risks,
        currentState: state.currentState,
        technicalApproach: state.technicalApproach,
        dependencies: state.dependencies,
        constraints: state.constraints,
        nextSteps: response,
        repos: state.repos
      }, taDir, stream);
      
      stream.markdown(`

---

🎉 **Interview complete!** Your Tech Assessment has been generated and opened in the editor.

Review the document and fill in any remaining details.
`);
      break;

    default:
      clearTAInterviewState(workspaceFolder);
      stream.markdown('❓ Interview state unclear. Starting fresh with `@ta /new`');
  }
}

// =============================================================================
// HELPER: Extract impacts from text
// =============================================================================

function extractImpacts(text: string): Array<{ component: string; impact: string; description: string }> {
  const impacts: Array<{ component: string; impact: string; description: string }> = [];
  const lines = text.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length > 2) {
      // Try to extract component, impact level, description
      const parts = trimmed.replace(/^[-•*]\s*/, '').split(/[,:|]/).map(p => p.trim());
      if (parts.length >= 2) {
        impacts.push({
          component: parts[0] || 'Component',
          impact: parts[1]?.match(/high|medium|low/i)?.[0] || 'Medium',
          description: parts.slice(2).join(', ') || parts[1] || ''
        });
      } else {
        impacts.push({
          component: trimmed,
          impact: 'Medium',
          description: ''
        });
      }
    }
  }
  
  return impacts.length > 0 ? impacts : [{ component: 'To be identified', impact: 'Medium', description: '' }];
}

// =============================================================================
// HELPER: Extract risks from text
// =============================================================================

function extractRisks(text: string): Array<{ risk: string; description: string; mitigation: string }> {
  const risks: Array<{ risk: string; description: string; mitigation: string }> = [];
  const lines = text.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length > 2) {
      const parts = trimmed.replace(/^[-•*]\s*/, '').split(/[,:|]/).map(p => p.trim());
      risks.push({
        risk: parts[0] || 'Risk',
        description: parts[1] || '',
        mitigation: parts[2] || 'To be defined'
      });
    }
  }
  
  return risks.length > 0 ? risks : [{ risk: 'To be identified', description: '', mitigation: 'To be defined' }];
}

// =============================================================================
// HELPER: Extract repos from text
// =============================================================================

function extractRepos(text: string): Array<{ repo: string; purpose: string; keyFiles: string }> {
  const repos: Array<{ repo: string; purpose: string; keyFiles: string }> = [];
  const lines = text.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length > 2) {
      // Try to extract owner/repo format
      const repoMatch = trimmed.match(/([a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+)/);
      if (repoMatch) {
        const parts = trimmed.replace(/^[-•*]\s*/, '').split(/[,:|]/).map(p => p.trim());
        repos.push({
          repo: repoMatch[1],
          purpose: parts[1] || 'Code review',
          keyFiles: parts[2] || 'src/'
        });
      } else if (trimmed.includes('/')) {
        // Fallback for other formats
        const parts = trimmed.replace(/^[-•*]\s*/, '').split(/[,:|]/).map(p => p.trim());
        repos.push({
          repo: parts[0] || trimmed,
          purpose: parts[1] || 'Code review',
          keyFiles: parts[2] || 'src/'
        });
      }
    }
  }
  
  return repos;
}

// =============================================================================
// HELPER: Generate and save TA
// =============================================================================

interface TAInput {
  title: string;
  problemDescription: string;
  proposedSolution: string;
  category: string;
  priority: string;
  assumptions: string[];
  impacts: Array<{ component: string; impact: string; description: string }>;
  risks: Array<{ risk: string; description: string; mitigation: string }>;
  currentState?: string;
  technicalApproach?: string;
  dependencies?: string;
  constraints?: string;
  nextSteps?: string;
  repos?: Array<{ repo: string; purpose: string; keyFiles: string }>;
}

async function generateAndSaveTA(
  input: TAInput,
  taDir: string,
  stream: vscode.ChatResponseStream
): Promise<void> {
  const nextNum = getNextTANumber(taDir);
  const date = new Date().toISOString().split('T')[0];
  const owner = 'Ewan Peters';
  const kebabTitle = input.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const filename = `ta-${nextNum}-${kebabTitle}.md`;
  const filepath = path.join(taDir, filename);

  const content = TA_TEMPLATE
    .replace('{{NUMBER}}', nextNum)
    .replace('{{TITLE}}', input.title)
    .replace('{{STATUS}}', 'Draft')
    .replace('{{DATE}}', date)
    .replace('{{OWNER}}', owner)
    .replace('{{CATEGORY}}', input.category)
    .replace('{{PRIORITY}}', input.priority)
    .replace('{{PROBLEM_DESCRIPTION}}', input.problemDescription)
    .replace('{{ASSUMPTIONS}}', input.assumptions.length > 0 
      ? input.assumptions.map(a => `| ${a} | To be assessed |`).join('\n')
      : '| To be defined | To be assessed |')
    .replace('{{CURRENT_STATE}}', input.currentState || 'To be defined')
    .replace('{{PROPOSED_SOLUTION}}', input.proposedSolution)
    .replace('{{TECHNICAL_APPROACH}}', input.technicalApproach || 'To be defined')
    .replace('{{DEPENDENCIES}}', input.dependencies || 'To be identified')
    .replace('{{CONSTRAINTS}}', input.constraints || 'To be identified')
    .replace('{{IMPACTS}}', input.impacts.map(i => 
      `| ${i.component} | ${i.impact} | ${i.description} |`).join('\n'))
    .replace('{{RISKS}}', input.risks.map(r => 
      `| ${r.risk} | ${r.description} | ${r.mitigation} |`).join('\n'))
    .replace('{{ANALYSIS_ESTIMATE}}', 'TBD')
    .replace('{{DEV_ESTIMATE}}', 'TBD')
    .replace('{{TEST_ESTIMATE}}', 'TBD')
    .replace('{{DEPLOY_ESTIMATE}}', 'TBD')
    .replace('{{TOTAL_ESTIMATE}}', 'TBD')
    .replace('{{NEXT_STEPS}}', input.nextSteps 
      ? input.nextSteps.split('\n').map(s => `- [ ] ${s.trim()}`).join('\n')
      : '- [ ] To be defined')
    .replace('{{REPOS}}', input.repos && input.repos.length > 0
      ? input.repos.map(r => 
          `| [${r.repo}](https://github.com/${r.repo}) | ${r.purpose} | ${r.keyFiles} |`).join('\n')
      : '| None specified | - | - |')
    .replace('{{REFERENCES}}', '- To be added');

  // Create directory and file
  if (!fs.existsSync(taDir)) {
    fs.mkdirSync(taDir, { recursive: true });
  }
  fs.writeFileSync(filepath, content);

  // Open the file
  const doc = await vscode.workspace.openTextDocument(filepath);
  await vscode.window.showTextDocument(doc);

  stream.markdown(`✅ **Created:** \`${filename}\`

| Field | Value |
|-------|-------|
| Category | ${input.category} |
| Priority | ${input.priority} |
| Impacts | ${input.impacts.length} items |
| Risks | ${input.risks.length} items |

The file is now open in the editor.
`);
}

export function deactivate() {}
