## Status
Draft <!-- Draft | Proposed | Accepted | Deprecated | Superseded -->

## Date
2026-04-24

## Owner
Ewan Peters

## Category
Infrastructure <!-- Infrastructure | Data | Security | Integration | API | Other -->

## Priority
High <!-- High | Medium | Low -->

## Context
<!-- What is the issue that we're seeing that is motivating this decision or change? -->
We need a managed real-time push solution for delivering gamestate updates to front-end clients. Our current approach requires significant operational overhead for WebSocket connection management, scaling, and failover. AWS AppSync provides a fully managed GraphQL service with built-in real-time subscriptions.

## Decision
<!-- What is the change that we're proposing and/or doing? -->
Adopt AWS AppSync as the push notification mechanism for gamestate updates. AppSync will handle real-time subscriptions via GraphQL, replacing custom WebSocket infrastructure.

## Principles Alignment
<!-- How does this decision align with our architecture principles? -->
| Principle | Alignment | Notes |
|-----------|-----------|-------|
| Cloud-First | ✅ | Fully managed AWS service, auto-scaling |
| API-First | ✅ | GraphQL API with schema documentation |
| Security by Design | ✅ | IAM, Cognito, API key authentication supported |
| Observability | ✅ | CloudWatch metrics, X-Ray tracing integration |
| Resilience | ✅ | Multi-AZ, automatic failover, offline support |
| Cost Efficiency | ✅ | Pay-per-request, no idle infrastructure |
| Technology Standards | ✅ | Supported by React, Swift, Kotlin via Amplify |
| Data Management | ✅ | No PII in gamestate, configurable caching |

## Consequences
<!-- What becomes easier or more difficult to do because of this change? -->

### Positive
- Fully managed service reduces operational overhead
- Built-in real-time subscriptions via GraphQL
- Native offline support with Amplify client libraries
- Automatic scaling and high availability
- Integrated authentication (Cognito, IAM, API keys)
- CloudWatch and X-Ray observability out of the box

### Negative
- Vendor lock-in to AWS ecosystem
- Learning curve for GraphQL if team is unfamiliar
- Cost can increase with high message volume
- Less flexibility than custom WebSocket implementation
- Requires Amplify SDK integration on clients

## Alternatives Considered
<!-- What other options were considered? -->
AWS API Gateway WebSockets, Azure SignalR, Firebase Realtime Database, Custom WebSocket with Redis Pub/Sub, Pusher

## Related Decisions
<!-- List any related ADRs -->
ADR-011: PUSH Solution for Front-End Gamestate

## References
<!-- Links to relevant documentation, diagrams, etc. -->
- https://aws.amazon.com/appsync/
- https://docs.amplify.aws/lib/graphqlapi/subscribe-data/q/platform/js/