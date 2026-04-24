"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
var vscode = require("vscode");
var fs = require("fs");
var path = require("path");
var ADR_TEMPLATE = "# ADR-{{NUMBER}}: {{TITLE}}\n\n## Status\n{{STATUS}} <!-- Draft | Proposed | Accepted | Deprecated | Superseded -->\n\n## Date\n{{DATE}}\n\n## Owner\n{{OWNER}}\n\n## Category\n{{CATEGORY}} <!-- Infrastructure | Data | Security | Integration | API | Other -->\n\n## Priority\n{{PRIORITY}} <!-- High | Medium | Low -->\n\n## Context\n<!-- What is the issue that we're seeing that is motivating this decision or change? -->\n{{CONTEXT}}\n\n## Decision\n<!-- What is the change that we're proposing and/or doing? -->\n{{DECISION}}\n\n## Consequences\n<!-- What becomes easier or more difficult to do because of this change? -->\n\n### Positive\n{{POSITIVE}}\n\n### Negative\n{{NEGATIVE}}\n\n## Alternatives Considered\n<!-- What other options were considered? -->\n{{ALTERNATIVES}}\n\n## Related Decisions\n<!-- List any related ADRs -->\n{{RELATED}}\n\n## References\n<!-- Links to relevant documentation, diagrams, etc. -->\n{{REFERENCES}}\n";
var AI_PROMPTS = {
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
    var _this = this;
    var handler = function (request, chatContext, stream, token) { return __awaiter(_this, void 0, void 0, function () {
        var workspaceFolder, adrDir, title, nextNum, topic, category, priority, contextInput, decisionInput, positiveConsequences, suggested, selected, customPositive, negativeConsequences, suggested, selected, customNegative, alternatives, suggested, selected, customAlt, date, owner, kebabTitle, filename, filepath, content, doc, topic, suggestions, files;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    workspaceFolder = (_b = (_a = vscode.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.uri.fsPath;
                    if (!workspaceFolder) {
                        stream.markdown('❌ Please open a workspace folder first.');
                        return [2 /*return*/];
                    }
                    adrDir = path.join(workspaceFolder, 'adr-docs');
                    if (!(request.command === 'new')) return [3 /*break*/, 16];
                    title = request.prompt || 'Untitled';
                    nextNum = getNextAdrNumber(adrDir);
                    topic = detectTopic(title);
                    return [4 /*yield*/, vscode.window.showQuickPick(['Infrastructure', 'Data', 'Security', 'Integration', 'API', 'Other'], { placeHolder: '📁 Select category' })];
                case 1:
                    category = _c.sent();
                    if (!category) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, vscode.window.showQuickPick(['High', 'Medium', 'Low'], { placeHolder: '🎯 Select priority' })];
                case 2:
                    priority = _c.sent();
                    if (!priority) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, vscode.window.showInputBox({
                            prompt: '📝 Enter context (why is this decision needed?)',
                            placeHolder: 'e.g., We need to improve scalability...'
                        })];
                case 3:
                    contextInput = _c.sent();
                    return [4 /*yield*/, vscode.window.showInputBox({
                            prompt: '✅ Enter decision (what did you decide?)',
                            placeHolder: 'e.g., Use Kubernetes for container orchestration'
                        })];
                case 4:
                    decisionInput = _c.sent();
                    positiveConsequences = [];
                    if (!(topic && AI_PROMPTS[topic])) return [3 /*break*/, 6];
                    suggested = AI_PROMPTS[topic].positive;
                    return [4 /*yield*/, vscode.window.showQuickPick(suggested.map(function (s) { return ({ label: s, picked: true }); }), {
                            placeHolder: '👍 Select positive consequences (AI suggestions)',
                            canPickMany: true
                        })];
                case 5:
                    selected = _c.sent();
                    positiveConsequences = (selected === null || selected === void 0 ? void 0 : selected.map(function (s) { return s.label; })) || [];
                    _c.label = 6;
                case 6: return [4 /*yield*/, vscode.window.showInputBox({
                        prompt: '➕ Add custom positive consequence (or leave blank)'
                    })];
                case 7:
                    customPositive = _c.sent();
                    if (customPositive) {
                        positiveConsequences.push(customPositive);
                    }
                    negativeConsequences = [];
                    if (!(topic && AI_PROMPTS[topic])) return [3 /*break*/, 9];
                    suggested = AI_PROMPTS[topic].negative;
                    return [4 /*yield*/, vscode.window.showQuickPick(suggested.map(function (s) { return ({ label: s, picked: true }); }), {
                            placeHolder: '👎 Select negative consequences (AI suggestions)',
                            canPickMany: true
                        })];
                case 8:
                    selected = _c.sent();
                    negativeConsequences = (selected === null || selected === void 0 ? void 0 : selected.map(function (s) { return s.label; })) || [];
                    _c.label = 9;
                case 9: return [4 /*yield*/, vscode.window.showInputBox({
                        prompt: '➖ Add custom negative consequence (or leave blank)'
                    })];
                case 10:
                    customNegative = _c.sent();
                    if (customNegative) {
                        negativeConsequences.push(customNegative);
                    }
                    alternatives = [];
                    if (!(topic && AI_PROMPTS[topic])) return [3 /*break*/, 12];
                    suggested = AI_PROMPTS[topic].alternatives;
                    return [4 /*yield*/, vscode.window.showQuickPick(suggested.map(function (s) { return ({ label: s, picked: false }); }), {
                            placeHolder: '🔄 Select alternatives considered (AI suggestions)',
                            canPickMany: true
                        })];
                case 11:
                    selected = _c.sent();
                    alternatives = (selected === null || selected === void 0 ? void 0 : selected.map(function (s) { return s.label; })) || [];
                    _c.label = 12;
                case 12: return [4 /*yield*/, vscode.window.showInputBox({
                        prompt: '🔀 Add custom alternative (or leave blank)'
                    })];
                case 13:
                    customAlt = _c.sent();
                    if (customAlt) {
                        alternatives.push(customAlt);
                    }
                    date = new Date().toISOString().split('T')[0];
                    owner = 'Ewan Peters';
                    kebabTitle = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                    filename = "adr-".concat(nextNum, "-").concat(kebabTitle, ".md");
                    filepath = path.join(adrDir, filename);
                    content = ADR_TEMPLATE
                        .replace('{{NUMBER}}', nextNum)
                        .replace('{{TITLE}}', title)
                        .replace('{{DATE}}', date)
                        .replace('{{OWNER}}', owner)
                        .replace('{{STATUS}}', 'Draft')
                        .replace('{{CATEGORY}}', category)
                        .replace('{{PRIORITY}}', priority)
                        .replace('{{CONTEXT}}', contextInput || 'To be defined')
                        .replace('{{DECISION}}', decisionInput || 'To be defined')
                        .replace('{{POSITIVE}}', positiveConsequences.map(function (p) { return "- ".concat(p); }).join('\n') || '')
                        .replace('{{NEGATIVE}}', negativeConsequences.map(function (n) { return "- ".concat(n); }).join('\n') || '')
                        .replace('{{ALTERNATIVES}}', alternatives.length ? alternatives.join(', ') : 'None identified yet')
                        .replace('{{RELATED}}', 'None')
                        .replace('{{REFERENCES}}', '');
                    // Create directory and file
                    if (!fs.existsSync(adrDir)) {
                        fs.mkdirSync(adrDir, { recursive: true });
                    }
                    fs.writeFileSync(filepath, content);
                    return [4 /*yield*/, vscode.workspace.openTextDocument(filepath)];
                case 14:
                    doc = _c.sent();
                    return [4 /*yield*/, vscode.window.showTextDocument(doc)];
                case 15:
                    _c.sent();
                    stream.markdown("\u2705 **Created:** `".concat(filename, "`\n\n| Field | Value |\n|-------|-------|\n| Category | ").concat(category, " |\n| Priority | ").concat(priority, " |\n| Positive | ").concat(positiveConsequences.length, " items |\n| Negative | ").concat(negativeConsequences.length, " items |\n| Alternatives | ").concat(alternatives.length, " items |\n"));
                    return [2 /*return*/];
                case 16:
                    // Handle /adr suggest command
                    if (request.command === 'suggest') {
                        topic = detectTopic(request.prompt || '');
                        if (topic && AI_PROMPTS[topic]) {
                            suggestions = AI_PROMPTS[topic];
                            stream.markdown("## \uD83D\uDCA1 Suggestions for ".concat(topic.toUpperCase(), " ADR\n\n### Positive Consequences\n").concat(suggestions.positive.map(function (p) { return "- ".concat(p); }).join('\n'), "\n\n### Negative Consequences\n").concat(suggestions.negative.map(function (n) { return "- ".concat(n); }).join('\n'), "\n\n### Alternatives\n").concat(suggestions.alternatives.map(function (a) { return "- ".concat(a); }).join('\n'), "\n"));
                            return [2 /*return*/];
                        }
                        stream.markdown("## \uD83D\uDCDA Available Topics\n\n| Topic | Command |\n|-------|---------|\n| Microservices | `@adr /suggest microservices` |\n| Kafka | `@adr /suggest kafka` |\n| Kubernetes | `@adr /suggest kubernetes` |\n| Redis | `@adr /suggest redis` |\n| API Gateway | `@adr /suggest api gateway` |\n| Lambda | `@adr /suggest lambda` |\n");
                        return [2 /*return*/];
                    }
                    // Handle /adr list command
                    if (request.command === 'list') {
                        if (!fs.existsSync(adrDir)) {
                            stream.markdown('📭 No ADRs found. Create one with `@adr /new [title]`');
                            return [2 /*return*/];
                        }
                        files = fs.readdirSync(adrDir)
                            .filter(function (f) { return f.startsWith('adr-') && f.endsWith('.md'); })
                            .sort();
                        stream.markdown("## \uD83D\uDCCB Existing ADRs\n\n".concat(files.map(function (f) { return "- `".concat(f, "`"); }).join('\n'), "\n\n**Total:** ").concat(files.length, " ADRs\n"));
                        return [2 /*return*/];
                    }
                    // Default: show help
                    stream.markdown("## \uD83C\uDFD7\uFE0F ADR Agent\n\n| Command | Description |\n|---------|-------------|\n| `@adr /new [title]` | Create a new ADR with prompts |\n| `@adr /suggest [topic]` | Get AI suggestions |\n| `@adr /list` | List existing ADRs |\n\n### Examples\n```\n@adr /new Adopting Microservices\n@adr /suggest kafka\n@adr /list\n```\n");
                    return [2 /*return*/];
            }
        });
    }); };
    var participant = vscode.chat.createChatParticipant('adr-agent.adr', handler);
    context.subscriptions.push(participant);
}
function getNextAdrNumber(adrDir) {
    if (!fs.existsSync(adrDir)) {
        return '001';
    }
    var files = fs.readdirSync(adrDir);
    var numbers = files
        .filter(function (f) { return f.match(/^adr-\d{3}/); })
        .map(function (f) { var _a; return parseInt(((_a = f.match(/^adr-(\d{3})/)) === null || _a === void 0 ? void 0 : _a[1]) || '0', 10); });
    var max = Math.max.apply(Math, __spreadArray([0], numbers, false));
    return String(max + 1).padStart(3, '0');
}
function detectTopic(title) {
    var lower = title.toLowerCase();
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
