# ADR-004: Using Redis for Session Caching

## Status
Draft <!-- Draft | Proposed | Accepted | Deprecated | Superseded -->

## Date
2026-04-10

## Context
<!-- What is the issue that we're seeing that is motivating this decision or change? -->
User sessions are currently stored in the database, causing performance issues at scale

## Decision
<!-- What is the change that we're proposing" and/or doing? -->
Implement Redis as a distributed session cache

## Consequences
<!-- What becomes easier or more difficult to do because of this change? -->

### Positive
Sub-millisecond latency, horizontal scaling, reduced database load

### Negative
Additional infrastructure, cache invalidation complexity

## Alternatives Considered
<!-- What other options were considered? -->
Memcached, Database optimization, Sticky sessions

## Related Decisions
<!-- List any related ADRs -->
ADR-003

## References
<!-- Links to relevant documentation, diagrams, etc. -->
https://redis.io/docs