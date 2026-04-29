# ADR-{{NUMBER}}: {{TITLE}}

## Metadata

| Field | Value |
|-------|-------|
| **Status** | {{STATUS}} <!-- Draft | Proposed | Accepted | Deprecated | Superseded --> |
| **Date** | {{DATE}} |
| **Owner** | {{OWNER}} |
| **Category** | {{CATEGORY}} <!-- Infrastructure | Data | Security | Integration | API | Other --> |
| **Priority** | {{PRIORITY}} <!-- High | Medium | Low --> |

## Context
<!-- What is the issue that we're seeing that is motivating this decision or change? -->
{{CONTEXT}}

## Decision
<!-- What is the change that we're proposing and/or doing? -->
{{DECISION}}

## Architecture Diagram
<!-- Visualise the architecture using Mermaid syntax -->
```mermaid
{{DIAGRAM}}
```

## Principles Alignment
<!-- How does this decision align with our architecture principles? -->
| Principle | Alignment | Notes |
|-----------|-----------|-------|
| Cloud-First | ✅ / ⚠️ / ❌ | |
| API-First | ✅ / ⚠️ / ❌ | |
| Security by Design | ✅ / ⚠️ / ❌ | |
| Observability | ✅ / ⚠️ / ❌ | |
| Resilience | ✅ / ⚠️ / ❌ | |
| Cost Efficiency | ✅ / ⚠️ / ❌ | |
| Technology Standards | ✅ / ⚠️ / ❌ | |
| Data Management | ✅ / ⚠️ / ❌ | |

## Impacts
<!-- What areas will be impacted by this decision? -->

### Teams Impacted
{{TEAMS_IMPACTED}}

### Systems Impacted
{{SYSTEMS_IMPACTED}}

### Timeline
| Phase | Description | Duration |
|-------|-------------|----------|
| {{PHASE_1}} | {{PHASE_1_DESC}} | {{PHASE_1_DURATION}} |
| {{PHASE_2}} | {{PHASE_2_DESC}} | {{PHASE_2_DURATION}} |
| {{PHASE_3}} | {{PHASE_3_DESC}} | {{PHASE_3_DURATION}} |

### Risks
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| {{RISK_1}} | High/Medium/Low | High/Medium/Low | {{MITIGATION_1}} |
| {{RISK_2}} | High/Medium/Low | High/Medium/Low | {{MITIGATION_2}} |

## Consequences
<!-- What becomes easier or more difficult to do because of this change? -->

### Positive
{{POSITIVE_CONSEQUENCES}}

### Negative
{{NEGATIVE_CONSEQUENCES}}

## Alternatives Considered
<!-- What other options were considered? -->
{{ALTERNATIVES}}

## Related Decisions
<!-- List any related ADRs - add links to relevant decisions -->

| ADR | Title | Link |
|-----|-------|------|
| ADR-004 | Using Redis for Session Caching | [adr-004](../adr-docs/adr-004-using-redis-for-session-caching.md) |
| ADR-005 | New PUSH Service | [adr-005](../adr-docs/adr-005-New%20PUSH%20Service.md) |
| ADR-007 | API Gateway Selection | [adr-007](../adr-docs/adr-007-api-gateway-selection.md) |
| ADR-008 | API Versioning | [adr-008](../adr-docs/adr-008-api-versioning.md) |
| ADR-009 | API Versioning | [adr-009](../adr-docs/adr-009-api-versioning.md) |
| ADR-011 | PUSH Solution for Front-End Gamestate | [adr-011](../adr-docs/adr-011-push-solution-for-front-end-gamestate.md) |
| ADR-012 | Serverless Microservice | [adr-012](../adr-docs/adr-012-serverless-microservice.md) |
| ADR-013 | PUSH Notifications for Gamestate Updates | [adr-013](../adr-docs/adr-013-push-notifications-for-gamestate-updates.md) |
| ADR-014 | Changing PUSH to use AWS AppSync | [adr-014](../adr-docs/adr-014-changing-push-to-use-aws-appsync.md) |
| ADR-015 | Changing Kafka to SQS | [adr-015](../adr-docs/adr-015-changing-kafka-to-sqs.md) |
| ADR-016 | Changing from REST to GraphQL for React App Updates | [adr-016](../adr-docs/adr-016-changing-from-rest-to-graphql-for-react-app-updates.md) |
| ADR-017 | Implementing Event Sourcing for Audit Logs | [adr-017](../adr-docs/adr-017-implementing-event-sourcing-for-audit-logs.md) |
| ADR-018 | Replace Polling with PUSH Solution | [adr-018](../adr-docs/adr-018-replace-polling-with-push-solution.md) |
| ADR-019 | Implementing AWS AppSync for Native Notifications | [adr-019](../adr-docs/adr-019-implementing-aws-appsync-for-native-notifications.md) |
| ADR-020 | Use Real-time Updates for Gamestate | [adr-020](../adr-docs/adr-020-use-real-time-updates-for-gamestate.md) |
| ADR-021 | Replace Polling with Push for Prices | [adr-021](../adr-docs/adr-021-replace-polling-with-push-for-prices.md) |

<!-- Delete rows that are not relevant to this ADR -->

## Related Repositories
<!-- GitHub repositories relevant to this decision for code review and context -->
| Repository | Purpose | Key Files/Folders |
|------------|---------|-------------------|
| {{REPO_1}} | {{REPO_PURPOSE_1}} | {{KEY_FILES_1}} |
| {{REPO_2}} | {{REPO_PURPOSE_2}} | {{KEY_FILES_2}} |

## References
<!-- Links to relevant documentation, diagrams, etc. -->
{{REFERENCES}}