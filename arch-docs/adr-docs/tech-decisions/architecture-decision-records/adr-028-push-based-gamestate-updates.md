# ADR-028: Push-Based Game State Updates to the Frontend

## Status
Proposed <!-- Draft | Proposed | Accepted | Deprecated | Superseded -->

## Date
2026-05-15

## Domain
Sports

## Context

The current implementation for delivering game state updates to the frontend relies on a polling mechanism that fires every 5 seconds. Each poll triggers a full page reload, resulting in poor user experience, unnecessary network overhead, and significant rendering cost on the client. This is particularly acute during high-traffic periods such as Saturday Premier League fixtures where multiple concurrent users are receiving frequent updates.

Game state updates originate from the **Sports Content API (SCA)**, the internal service responsible for providing sports content and score updates. SCA is the canonical source of truth for live game state and any push-based solution must integrate with it as the upstream event source.

The data flow is **unidirectional**: SCA pushes state updates to the backend, which must forward them to connected frontend clients. There is no requirement for clients to send messages back to the server over the same channel.

The decision to move to a push-based model is driven by the need to:

- Eliminate full page reloads on game state updates
- Reduce perceived latency between a game state change in SCA and its appearance in the browser
- Reduce unnecessary compute and network cost from polling
- Establish a scalable pattern that can be extended to other brands

## Decision Drivers

- **Cost** — the solution must remain cost-effective at peak load (concurrent users during Saturday Premier League fixtures receiving frequent SCA updates). This is the primary constraint.
- **Operational simplicity** — the solution must not become a support or maintenance burden. Preference is for managed or low-complexity infrastructure.
- **Scalability** — the solution must be extensible to support additional brands without fundamental rework.
- **Performance** — success is defined as the elimination of full page reloads on game state updates and a measurable improvement in frontend responsiveness.

## Decision

**Adopt Server-Sent Events (SSE) via API Gateway as the push mechanism for game state updates from SCA to the frontend.**

SSE is the option that best satisfies all stated decision drivers. It eliminates full page reloads (performance driver), is materially cheaper than AppSync at the concurrent user volumes expected during peak fixtures (cost driver), introduces lower build and operational complexity than a custom WebSocket solution (operational simplicity driver), and can be extended to additional brands without rework (scalability driver). The unidirectional constraint of SSE is not a limitation given the server-to-client only data flow required by this use case.

AppSync was discounted primarily on cost grounds at peak load. A custom WebSocket solution was discounted on operational complexity grounds, which conflicts with the non-negotiable constraint on operational burden. The baseline option was discounted as it does not address the root problem.

## Consequences

### Positive
- Full page reloads on game state updates are eliminated
- Frontend receives game state updates in near real-time from SCA, replacing the 5-second polling cycle
- Infrastructure cost is lower and more predictable than an AppSync-based solution at peak load
- The pattern is reusable across brands

### Negative
- SSE is unidirectional. Any future requirement for client-to-server messaging over the same channel would require a migration to a WebSocket-based solution
- Long-lived HTTP connections in a serverless context require careful design, particularly around API Gateway and Lambda timeout limits
- The integration between SCA and the SSE event stream needs to be designed and validated

## Alternatives Considered

### Option 1 — AWS AppSync (GraphQL Subscriptions over WebSocket)

AWS AppSync is a fully managed GraphQL service that provides native subscription support, allowing clients to receive real-time updates over a managed WebSocket connection.

**✅ Good, because** it is fully managed and reduces operational overhead for infrastructure and scaling.

**✅ Good, because** GraphQL subscriptions are well-suited to partial state updates, allowing only changed fields to be pushed rather than full state payloads.

**✅ Good, because** it scales automatically without manual intervention.

**❌ Bad, because** AppSync pricing is based on both connection minutes and message count. At peak load (many concurrent users receiving frequent SCA updates across Saturday fixtures) this cost can become significant and unpredictable.

**❌ Bad, because** GraphQL introduces additional complexity if the team is not already using it, and may be over-engineered for a server-to-client state broadcast use case.

**❌ Bad, because** cost optimisation levers are limited compared to a self-managed solution.

---

### Option 2 — Custom WebSocket Solution (API Gateway WebSockets + Lambda)

A custom WebSocket implementation using AWS API Gateway WebSocket APIs and Lambda functions to manage connections, route messages, and fan out SCA updates to connected clients.

**✅ Good, because** it provides full control over connection management, fan-out logic, and SCA integration.

**✅ Good, because** cost is more predictable and controllable at scale compared to AppSync.

**✅ Good, because** it is scalable and can be extended to support additional brands.

**❌ Bad, because** it carries significant build complexity. The team owns connection state management, reconnection handling, message routing, and SCA integration end-to-end.

**❌ Bad, because** it introduces higher operational overhead in terms of monitoring, failure handling, and ongoing maintenance, which conflicts with the non-negotiable constraint on operational burden.

---

### Option 3 — Server-Sent Events (SSE) via API Gateway ✅ RECOMMENDED

Server-Sent Events (SSE) is a standard HTTP-based protocol that allows a server to push a stream of events to a client over a persistent HTTP connection. The browser handles reconnection natively. The connection is unidirectional (server to client), which matches the data flow requirements of this use case exactly.

**✅ Good, because** it is simpler to implement and operate than a full WebSocket solution, with no requirement to manage bidirectional connection state.

**✅ Good, because** it has native browser support with no additional client-side library required, and automatic reconnection is handled by the browser.

**✅ Good, because** it is significantly cheaper than AppSync at scale. Pricing is based on standard API Gateway HTTP connections rather than AppSync's per-connection-minute and per-message model.

**✅ Good, because** the unidirectional constraint is not a limitation for this use case — game state flows from SCA to the client only.

**✅ Good, because** the pattern is extendable to other brands without fundamental rework, supporting the scalability driver.

**❌ Bad, because** SSE is unidirectional. If a future use case requires client-to-server messaging over the same channel, SSE would be insufficient and a migration to WebSockets would be required.

**❌ Bad, because** long-lived HTTP connections in a serverless architecture (Lambda + API Gateway) require careful design to avoid timeout constraints and connection management issues.

---

### Option 4 — Fix Full Page Reload Without Changing Transport (Baseline)

Decouple the UX problem from the transport layer. If the full page reload is caused by how the poll response is handled in the frontend rather than polling itself, this could be resolved without replacing the polling mechanism.

**✅ Good, because** it requires no infrastructure change and carries zero additional cost or operational risk.

**❌ Bad, because** polling every 5 seconds remains in place. The underlying latency problem and unnecessary network overhead are not addressed.

**❌ Bad, because** it does not achieve the stated success criteria of improved frontend performance and reduced page loads at a transport level.

**❌ Bad, because** it is not a scalable long-term solution as user expectations and product requirements grow.

## Notes and Open Questions

- How does SCA currently emit game state updates? (e.g. webhooks, SNS, EventBridge, direct API call) — this will determine the integration design for the SSE event source.
- API Gateway HTTP integration with Lambda has a 29-second timeout limit for responses. For long-lived SSE connections this will need to be addressed, potentially via a different compute layer (e.g. ECS, App Runner) or a streaming-capable Lambda integration.
- The message format and payload structure for SSE events from SCA has not yet been defined.
- Connection limits and back-pressure handling under peak load (Saturday fixtures) should be load tested before production rollout.

## Related Decisions

N/A

## References

- Sports Content API (SCA) — internal service providing sports content and score updates
- [AWS API Gateway HTTP API documentation](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api.html)
- [AWS AppSync Pricing](https://aws.amazon.com/appsync/pricing/)
- [MDN: Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
