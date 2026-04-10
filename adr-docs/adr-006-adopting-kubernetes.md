# ADR-006: Adopting Kubernetes

## Status
Draft <!-- Draft | Proposed | Accepted | Deprecated | Superseded -->

## Date
2026-04-10

## Owner
Ewan Peters

## Context
<!-- What is the issue that we're seeing that is motivating this decision or change? -->
We need a container orchestration platform to manage deployment, scaling, and operations of our containerised microservices.

## Decision
<!-- What is the change that we're proposing and/or doing? -->
Adopt Kubernetes as our container orchestration platform.

## Consequences
<!-- What becomes easier or more difficult to do because of this change? -->

### Positive
Automated scaling, self-healing, declarative configuration, cloud-agnostic portability

### Negative
Steep learning curve, operational complexity, resource overhead

## Alternatives Considered
<!-- What other options were considered? -->
Docker Swarm, AWS ECS, HashiCorp Nomad

## Related Decisions
<!-- List any related ADRs -->
ADR-003

## References
<!-- Links to relevant documentation, diagrams, etc. -->
https://kubernetes.io/docs/