# ADR-011: PUSH Solution for Front-End Gamestate

## Status
Draft <!-- Draft | Proposed | Accepted | Deprecated | Superseded -->

## Date
2026-04-10

## Owner
Ewan Peters

## Context
<!-- What is the issue that we're seeing that is motivating this decision or change? -->
The front-end currently polls the backend for gamestate updates, causing unnecessary load and latency. We need a real-time push mechanism to deliver gamestate changes to clients instantly.

## Decision
<!-- What is the change that we're proposing and/or doing? -->
Implement WebSocket-based push notifications to deliver gamestate updates to front-end clients in real-time.

## Consequences
<!-- What becomes easier or more difficult to do because of this change? -->

### Positive
- Real-time updates with minimal latency
- Reduced server load (no polling)
- Better user experience
- Efficient bandwidth usage

### Negative
- Connection management complexity
- Need for fallback mechanisms
- Stateful connections require sticky sessions or pub/sub

## Alternatives Considered
<!-- What other options were considered? -->
Server-Sent Events (SSE), Long Polling, GraphQL Subscriptions, Firebase Realtime Database

## Related Decisions
<!-- List any related ADRs -->
None

## References
<!-- Links to relevant documentation, diagrams, etc. -->