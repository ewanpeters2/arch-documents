# ADR-024: Implement a PUSH solution for the front-end to replace POLLING for gamestate

## Status
Draft <!-- Draft | Proposed | Accepted | Deprecated | Superseded -->

## Date
2026-05-14

## Owner
Ewan Peters

## Category
Other <!-- Infrastructure | Data | Security | Integration | API | Other -->

## Priority
High <!-- High | Medium | Low -->

## Context
<!-- What is the issue that we're seeing that is motivating this decision or change? -->
We are trying to improve the speed which scores are updated to the front end

## Decision
<!-- What is the change that we're proposing and/or doing? -->
None yet

## Architecture Diagram
<!-- Visualise the architecture using Mermaid C4 syntax -->
```mermaid
C4Context
    title System Context - Implement a PUSH solution for the frontend to replace POLLING for gamestate

    Person(user, "User", "Web/Mobile user")
    System(frontend, "Frontend", "Client application")
    System(push, "Push Service", "Real-time delivery")
    System(backend, "Backend", "Business logic")
    SystemDb(db, "Database", "Data persistence")

    Rel(user, frontend, "Uses", "HTTPS")
    Rel(frontend, push, "Subscribes", "WebSocket")
    Rel(push, frontend, "Pushes", "Real-time")
    Rel(backend, push, "Publishes", "Events")
    Rel(backend, db, "Reads/Writes", "SQL")
```

## Principles Alignment
<!-- How does this decision align with our architecture principles? -->
| Principle | Alignment | Notes |
|-----------|-----------|-------|
| Cloud-First | ✅ |  |
| API-First | ✅ |  |
| Security by Design | ✅ |  |
| Observability | ⚠️ | Review needed |
| Resilience | ⚠️ | Review needed |
| Cost Efficiency | ✅ |  |
| Technology Standards | ✅ |  |
| Data Management | ✅ |  |

## Impacts
<!-- What areas will be impacted by this decision? -->

### Teams Impacted
- Frontend Team
- Backend Team
- Mobile Team

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
| Connection scalability | Medium | High | Load testing, auto-scaling |
| Mobile network issues | Medium | Medium | Reconnection logic, fallback |

## Consequences
<!-- What becomes easier or more difficult to do because of this change? -->

### Positive
- ✅ Good, because real-time bidirectional communication
- ✅ Good, because low latency
- ✅ Good, because efficient bandwidth

### Negative
- ❌ Bad, because connection management complexity
- ❌ Bad, because stateful connections
- ❌ Bad, because firewall issues
- ❌ Bad, because scaling challenges
- ❌ Bad, because fallback needed

## Alternatives Considered
<!-- What other options were considered? -->
WebSockets, AWS AppSync, Firebase, Build own solution with AppSync

## Related Decisions
<!-- List any related ADRs -->
None

## Related Repositories
<!-- GitHub repositories relevant to this decision for code review and context -->
| Repository | Purpose | Key Files/Folders |
|------------|---------|-------------------|
| None specified | - | - |

## References
<!-- Links to relevant documentation, diagrams, etc. -->

