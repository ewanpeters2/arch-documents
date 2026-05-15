# ADR-026: Real time gamestate solution

## Status
Draft <!-- Draft | Proposed | Accepted | Deprecated | Superseded -->

## Date
2026-05-15

## Owner
Ewan Peters

## Category
Other <!-- Infrastructure | Data | Security | Integration | API | Other -->

## Priority
Medium <!-- High | Medium | Low -->

## Context
<!-- What is the issue that we're seeing that is motivating this decision or change? -->
Real time gamestate solution

Front end and back end

## Decision
<!-- What is the change that we're proposing and/or doing? -->
Use AppSync

## Architecture Diagram
<!-- Visualise the architecture using Mermaid C4 syntax -->
```mermaid
C4Context
    title System Context - Real time gamestate solution

    Person(user, "User", "End user")
    System(system, "System", "The system")
    SystemDb(db, "Database", "Data persistence")

    Rel(user, system, "Uses", "HTTPS")
    Rel(system, db, "Reads/Writes", "SQL")
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
- Engineering Team
- Platform Team

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

## Consequences
<!-- What becomes easier or more difficult to do because of this change? -->

### Positive
- ✅ Good, because more work

### Negative
- To be defined

## Alternatives Considered
<!-- What other options were considered? -->
None

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

