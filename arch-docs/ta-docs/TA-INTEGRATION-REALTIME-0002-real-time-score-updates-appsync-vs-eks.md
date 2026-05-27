# TA-INTEGRATION-REALTIME-0002: Real-Time Score and Football Event Updates — AWS AppSync vs EKS Self-Hosted WebSocket

## Metadata

| Field | Value |
|-------|-------|
| **Status** | Draft |
| **Date** | 2026-05-27 |
| **Owner** | Ewan Peters |
| **Category** | Integration, Infrastructure |
| **Priority** | High |

---

## Problem Statement

The platform currently delivers score and football event updates (goals, red cards) to customers via **polling**. This approach is insufficient for the following reasons:

- Polling introduces latency that is incompatible with a sub-second update requirement for live match events.
- At scale (~60k concurrent connections during peak), polling generates unnecessary load on backend services regardless of whether new data is available.
- The user experience degrades during high-volume events (e.g. a Saturday 3pm Premier League kick-off window with multiple simultaneous matches).

This assessment evaluates two candidate solutions to replace polling with a real-time push mechanism:

1. **AWS AppSync** — a fully managed GraphQL service with native real-time subscription support.
2. **Self-hosted WebSocket service on EKS** — a custom-built push service deployed on the existing EKS platform.

The primary concerns driving this assessment are **cost at scale** and **operational complexity**. While AppSync offers significant operational benefits, the per-message and per-connection-minute pricing model requires careful evaluation before committing. The EKS self-build path leverages existing platform investment and expertise but carries greater engineering overhead.

Events originate from the existing **Kafka gamestate feed** and must be delivered to all connected clients (web and native iOS/Android) with sub-second latency.

---

## Assumptions

| Assumption | Impact |
|------------|--------|
| Peak concurrent connections are approximately 60,000 (e.g. during a Saturday 3pm Premier League kick-off window). This figure may grow as the customer base scales. | Directly drives cost modelling and infrastructure sizing for both options. If the figure is materially higher, AppSync costs and EKS node requirements both increase. |
| In-scope event types are, at minimum, score updates and red cards. Additional event types (e.g. kick-offs, full-time, substitutions) may be added incrementally. | Message volume estimates in the cost model are based on a conservative event count. Adding event types increases message throughput and cost. |
| The EKS option would use a WebSocket-based implementation (e.g. custom service or an established library). It would not use GraphQL subscriptions. | The two options have different client integration patterns. EKS avoids Amplify/GraphQL dependency but requires a bespoke client SDK or protocol agreement. |
| An existing EKS platform and internal expertise are available. No net-new EKS cluster provisioning is required for the self-build option. | Reduces infrastructure lead time and risk for the EKS path. Effort estimate reflects integration into an existing platform rather than a greenfield build. |
| The existing Kafka gamestate feed is the authoritative source for all score and event data. No changes to upstream data production are in scope. | Both options must implement a Kafka consumer that bridges events to the push layer. This is a shared concern regardless of the chosen solution. |
| The existing polling infrastructure will remain in place until the replacement solution is fully validated and production-ready. | Running both systems in parallel temporarily increases operational cost and complexity. A decommission plan for polling is out of scope for this TA but must follow. |
| Sub-second end-to-end latency (from event on Kafka to delivery at client) is a firm requirement. | This constrains the architecture of both options and rules out solutions that introduce significant buffering or batching. |

---

## Risks and Challenges

| Risk | Description | Mitigation Plan |
|------|-------------|-----------------|
| AppSync cost unpredictability at scale | AppSync pricing is based on connection-minutes and messages delivered. At 60k concurrent connections with frequent event bursts (goals, red cards), costs can spike sharply and are difficult to cap. See cost model in the High Level Analysis section. | Conduct a detailed cost analysis before committing. Set up AWS Cost Anomaly Detection and billing alerts. Run a time-boxed PoC to measure actual message throughput under realistic load. |
| AppSync service quotas and soft limits | AWS imposes default limits on concurrent WebSocket connections and subscription resolver throughput per region. These limits may be insufficient for 60k connections without a prior limit increase request. | Review AWS AppSync service quotas early. Raise a support case with AWS to confirm limits and obtain increases ahead of any PoC or production rollout. |
| Fan-out spike on high-profile events | A single high-impact event (e.g. a goal in a high-viewership match) triggers a simultaneous push to all 60k+ connected clients. This creates a sharp throughput spike that both AppSync and a self-hosted solution must absorb. | Model peak fan-out in the PoC. For AppSync, validate auto-scaling behaviour. For EKS, validate horizontal pod autoscaling and connection distribution across nodes. |
| EKS operational overhead | Building and operating a production-grade WebSocket service on EKS requires investment in connection lifecycle management, graceful scaling, session affinity, health checks, and observability. This is non-trivial even on an existing platform. | Assess whether a well-supported open-source WebSocket framework (e.g. Centrifugo, Soketi) can reduce build effort. Ensure the platform team is formally engaged as a dependency early. |
| Vendor lock-in (AppSync) | Adopting AppSync ties the real-time architecture to the AWS GraphQL subscription model. Client SDKs (Amplify) and resolver patterns are AWS-specific and would require significant rework to migrate away from. | Accept as a known trade-off if AppSync is chosen. Document the lock-in explicitly in the resulting ADR so future teams have clear context (see ADR-014). |
| Client-side integration complexity | Integrating GraphQL subscriptions (AppSync) across web, iOS, and Android clients adds complexity, particularly if teams have limited GraphQL or Amplify experience. EKS WebSocket integration is more familiar but requires a consistent client protocol to be agreed and maintained. | Plan a cross-tribe integration spike covering both web and native clients. Define the client contract (schema or protocol) before implementation begins. |
| Polling decommission risk | Removing polling before the push solution is fully proven in production creates a reliability gap. Customers could miss critical live updates during a transition incident. | Run both systems in parallel during rollout. Use feature flags to control the cutover per client type. Define clear rollback criteria before decommissioning polling. |

---

## High Level Analysis

### Overview

Both options share a common upstream integration pattern: a **Kafka consumer** reads from the gamestate feed and forwards events to the push layer. The architectural divergence is in how that push layer is implemented and operated.

```
Kafka Gamestate Feed
        │
        ▼
  [Kafka Consumer / Event Bridge]
        │
        ├──► AWS AppSync (Option 1)
        │         │
        │         ▼
        │   GraphQL Subscriptions
        │         │
        │         ▼
        │   Web / iOS / Android Clients
        │
        └──► EKS WebSocket Service (Option 2)
                  │
                  ▼
            WebSocket Connections
                  │
                  ▼
            Web / iOS / Android Clients
```

---

### Option 1 — AWS AppSync

AppSync provides managed GraphQL subscriptions over WebSocket (MQTT over WSS). Clients subscribe to a GraphQL subscription and receive push updates when a mutation is published.

**How it would work:**
- A Kafka consumer (Lambda or ECS service) reads gamestate events and publishes them as AppSync mutations.
- AppSync fans out the mutation to all subscribed clients in real time.
- Web clients use the Amplify JS library. Native clients use Amplify for iOS/Android.

**✅ Good, because** it eliminates WebSocket infrastructure management entirely — connection handling, scaling, and failover are all managed by AWS.

**✅ Good, because** it integrates with existing AWS observability tooling (CloudWatch, X-Ray) out of the box.

**✅ Good, because** it supports multiple authentication modes (Cognito, IAM, API key), which aligns with the existing AWS security posture.

**❌ Bad, because** the cost model is consumption-based and can scale unexpectedly with connection volume and message frequency (see cost model below).

**❌ Bad, because** it introduces a dependency on GraphQL and the Amplify SDK across all client teams, which adds cross-tribe complexity.

**❌ Bad, because** it creates vendor lock-in that would be costly to reverse (as noted in ADR-014).

#### Indicative Cost Model — Premier League Gameweek

The following is an indicative estimate based on AWS AppSync real-time pricing. Figures should be validated with AWS before commitment.

**AWS AppSync real-time pricing (approximate):**
- Connection-minutes: ~$0.08 per 1 million connection-minutes
- Messages delivered to clients: ~$1.14 per 1 million messages

**Assumptions for a standard Premier League gameweek (10 matches):**

| Parameter | Value |
|-----------|-------|
| Peak matches (Saturday 3pm, simultaneous) | 5 matches |
| Peak concurrent connections (total across all matches) | 60,000 |
| Off-peak matches (remaining 5 matches, spread across weekend) | 5 matches |
| Off-peak average concurrent connections | 15,000 |
| Average match duration | 105 minutes |
| Estimated significant events per match (goals, red cards, key moments) | 30 events |

**Connection-minute cost:**

| Slot | Connections | Duration (min) | Connection-minutes |
|------|-------------|----------------|--------------------|
| Saturday 3pm peak | 60,000 | 105 | 6,300,000 |
| Off-peak (5 matches) | 15,000 | 105 | 7,875,000 |
| **Total** | | | **14,175,000** |

Cost: 14,175,000 ÷ 1,000,000 × $0.08 = **~$1.13 per gameweek**

**Message delivery cost:**

| Slot | Connections | Events | Messages |
|------|-------------|--------|----------|
| Saturday 3pm (5 matches × 60k ÷ 5 per match × 30 events) | 12,000 per match | 30 | 1,800,000 |
| Off-peak (5 matches × 15k ÷ 5 per match × 30 events) | 3,000 per match | 30 | 450,000 |
| **Total messages** | | | **~2,250,000** |

Cost: 2,250,000 ÷ 1,000,000 × $1.14 = **~$2.57 per gameweek**

**Estimated total per gameweek: ~$3.70**
**Estimated monthly cost (2.5 gameweeks per month, 38-week season): ~$9.25/month for AppSync message costs alone**

> ⚠️ **Important caveats:** This estimate is based on a conservative event count of 30 per match. If the scope expands to include all gamestate events (substitutions, yellow cards, match clock updates, possession changes), message volume could increase by an order of magnitude. Additionally, if connections grow beyond 60k or messages are sent more frequently (e.g. every 10 seconds as a heartbeat), costs will scale proportionally. This model should be re-run with actual message frequency data from the Kafka feed before a decision is made. AWS AppSync also charges for query and mutation operations separately, which are not included here.

---

### Option 2 — Self-Hosted WebSocket Service on EKS

A custom WebSocket service deployed on the existing EKS platform. The service maintains persistent connections with clients and fans out events received from Kafka.

**How it would work:**
- A WebSocket service (potentially using an open-source framework such as Centrifugo or Soketi, or a fully custom implementation) is deployed as a Kubernetes workload.
- A Kafka consumer within the service or as a sidecar reads gamestate events and publishes them to connected clients.
- Clients connect via standard WebSocket (or a thin client library). No GraphQL or Amplify dependency.

**✅ Good, because** it avoids AppSync's consumption-based pricing. At steady-state scale, EKS node costs are more predictable and typically lower than per-message AppSync charges at high message volume.

**✅ Good, because** the team has existing EKS platform expertise, reducing infrastructure risk.

**✅ Good, because** it avoids GraphQL and Amplify dependency on clients, keeping the client integration simpler and more portable.

**❌ Bad, because** it requires the team to own connection lifecycle management, graceful scaling, and failover — operational concerns that AppSync handles automatically.

**❌ Bad, because** observability (connection counts, fan-out latency, error rates) must be built or configured explicitly. This is non-trivial for stateful WebSocket services.

**❌ Bad, because** scaling WebSocket connections on Kubernetes requires careful tuning of session affinity, load balancer configuration, and horizontal pod autoscaling based on connection count rather than CPU/memory.

---

### Cross-Tribe Impact

This initiative requires coordinated effort across multiple tribes:

| Team | Involvement |
|------|-------------|
| Backend / Gamestate team | Kafka consumer implementation, event bridging to push layer |
| BFF team | Potential BFF-layer changes depending on how clients initiate subscriptions or connections |
| Web front-end team | Client integration (Amplify JS for AppSync, or WebSocket client for EKS option) |
| Native app team (iOS/Android) | Client integration (Amplify for iOS/Android, or WebSocket client) |
| Platform / Infrastructure team | EKS deployment and scaling (if EKS option is chosen), AWS account limits and AppSync quota management (if AppSync is chosen) |

A cross-tribe kick-off is recommended as a next step regardless of which option is selected.

---

## Effort Estimation

| Component | Option | Estimate | Notes |
|-----------|--------|----------|-------|
| Kafka consumer and event bridge to push layer | Both | M | Shared concern. Reads from Kafka gamestate feed and forwards events. |
| AppSync schema, resolvers, and publisher integration | AppSync | L | New technology. Includes GraphQL schema design, resolver implementation, and Kafka-to-AppSync publisher. |
| EKS WebSocket service build and deployment | EKS | M | Leverages existing platform. Includes service build, Kubernetes manifests, autoscaling config, and load balancer setup. |
| Web client integration | AppSync | M | Amplify JS integration across web clients. Requires cross-tribe coordination. |
| Web client integration | EKS | S | Standard WebSocket client integration. Simpler if a well-supported library is used. |
| Native client integration (iOS/Android) | AppSync | M | Amplify SDK integration on both platforms. |
| Native client integration (iOS/Android) | EKS | S | WebSocket client libraries are well established on both platforms. |
| Observability and alerting | AppSync | S | CloudWatch and X-Ray are available out of the box. |
| Observability and alerting | EKS | M | Custom metrics and dashboards required for connection count, fan-out latency, and error rates. |
| Load and cost validation PoC | Both | S | Time-boxed spike to validate behaviour at 60k connections and measure actual costs. |

**Overall effort rating:**
- AppSync option: **L** (new technology, cross-tribe Amplify integration, GraphQL learning curve)
- EKS self-build option: **M** (familiar platform, higher operational ownership, simpler client integration)

---

## Summary

The platform requires a real-time push mechanism to replace polling for live score and football event updates across ~60k concurrent connections. Two options have been assessed: **AWS AppSync** and a **self-hosted WebSocket service on EKS**.

Based on the indicative cost modelling, AppSync costs for a standard Premier League gameweek are likely to be modest (in the order of a few dollars per gameweek at the assumed event frequency). However, this estimate is sensitive to actual message throughput from the Kafka feed, and costs could increase significantly if the scope of events expands or connection volume grows. A validated cost model based on real message frequency data is essential before a decision is made.

From an effort perspective, AppSync is rated **L** primarily due to the GraphQL and Amplify learning curve and the cross-tribe client integration complexity. The EKS self-build is rated **M**, benefiting from existing platform expertise, though it carries greater long-term operational ownership.

Neither option is a clear winner without further evidence. **The recommended immediate next step is a time-boxed PoC using AppSync at representative load, combined with a detailed cost analysis using actual Kafka message frequency data.** This will provide the cost and performance evidence needed to make a confident decision. The EKS option should be kept as an active alternative until that evidence is available.

This TA should be reviewed alongside ADR-014 (AppSync for gamestate push), ADR-019 (AppSync for native notifications), and ADR-020 (real-time gamestate updates), all of which carry related unresolved questions.

---

## References

- [ADR-014: Changing Push to Use AWS AppSync](../adr-docs/tech-decisions/architecture-decision-records/adr-014-changing-push-to-use-aws-appsync.md)
- [ADR-019: Implementing AWS AppSync for Native Notifications](../adr-docs/tech-decisions/architecture-decision-records/adr-019-implementing-aws-appsync-for-native-notifications.md)
- [ADR-020: Use Real-Time Updates for Gamestate](../adr-docs/tech-decisions/architecture-decision-records/adr-020-use-real-time-updates-for-gamestate.md)
- [ADR-021: Replace Polling with Push for Prices](../adr-docs/tech-decisions/architecture-decision-records/adr-021-replace-polling-with-push-for-prices.md)
- [AWS AppSync Pricing](https://aws.amazon.com/appsync/pricing/)
- [AWS AppSync Service Quotas](https://docs.aws.amazon.com/appsync/latest/devguide/service-quotas.html)
- SCA Repository
