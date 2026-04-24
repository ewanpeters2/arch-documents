# ADR-014: PUSH Notifications for Gamestate Updates

## Status
Draft <!-- Draft | Proposed | Accepted | Deprecated | Superseded -->

## Date
2026-04-24

## Owner
Ewan Peters

## Category
Integration <!-- Infrastructure | Data | Security | Integration | API | Other -->

## Priority
High <!-- High | Medium | Low -->

## Context
<!-- What is the issue that we're seeing that is motivating this decision or change? -->
The front-end currently polls the backend for gamestate updates, causing unnecessary load, increased latency, and poor user experience during real-time gameplay. We need a push-based mechanism to deliver gamestate changes to clients instantly.

## Decision
<!-- What is the change that we're proposing and/or doing? -->
Implement WebSocket-based push notifications to deliver gamestate updates to front-end clients in real-time. Use a managed WebSocket service (e.g., AWS API Gateway WebSockets, Azure SignalR) to reduce operational overhead.

## Principles Alignment
<!-- How does this decision align with our architecture principles? -->
| Principle | Alignment | Notes |
|-----------|-----------|-------|
| Cloud-First | ✅ | Using managed WebSocket service |
| API-First | ✅ | WebSocket API with documented message formats |
| Security by Design | ✅ | TLS encryption, token-based auth for connections |
| Observability | ✅ | Connection metrics, message delivery tracking |
| Resilience | ⚠️ | Need fallback to polling if WebSocket fails |
| Cost Efficiency | ✅ | Pay-per-connection model, reduces polling load |
| Technology Standards | ✅ | WebSockets supported by React, Swift, Kotlin |
| Data Management | ✅ | No PII in gamestate messages |

## Consequences
<!-- What becomes easier or more difficult to do because of this change? -->

### Positive
- Real-time updates with minimal latency
- Reduced server load (no polling)
- Better user experience during gameplay
- Efficient bandwidth usage
- Native browser and mobile support

### Negative
- Connection management complexity
- Stateful connections require sticky sessions or pub/sub
- Need fallback mechanism for unreliable networks
- Additional infrastructure component

## Alternatives Considered
<!-- What other options were considered? -->
Server-Sent Events (SSE), Long Polling, GraphQL Subscriptions, Firebase Realtime Database

## Related Decisions
<!-- List any related ADRs -->
ADR-011: PUSH Solution for Front-End Gamestate

## References
<!-- Links to relevant documentation, diagrams, etc. --