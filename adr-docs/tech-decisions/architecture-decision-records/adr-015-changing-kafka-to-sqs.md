# ADR-015: Changing Kafka to SQS

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
Our current Kafka infrastructure requires significant operational overhead for cluster management, scaling, and monitoring. For our messaging use cases, we need a simpler, fully managed solution that reduces complexity while maintaining reliability.

## Decision
<!-- What is the change that we're proposing and/or doing? -->
Migrate from Apache Kafka to AWS SQS (Simple Queue Service) for asynchronous messaging between services. Use SQS Standard queues for high-throughput scenarios and SQS FIFO queues where message ordering is required.

## Principles Alignment
<!-- How does this decision align with our architecture principles? -->
| Principle | Alignment | Notes |
|-----------|-----------|-------|
| Cloud-First | ✅ | Fully managed AWS service, no cluster management |
| API-First | ✅ | Standard AWS SDK integration |
| Security by Design | ✅ | IAM policies, encryption at rest and in transit |
| Observability | ✅ | CloudWatch metrics, dead-letter queues for failures |
| Resilience | ✅ | Multi-AZ, automatic retries, DLQ support |
| Cost Efficiency | ✅ | Pay-per-message, no idle infrastructure costs |
| Technology Standards | ⚠️ | Moving away from Kafka (approved tech) to SQS |
| Data Management | ✅ | Configurable retention, no PII in messages |

## Consequences
<!-- What becomes easier or more difficult to do because of this change? -->

### Positive
- Fully managed service eliminates operational overhead
- Pay-per-use pricing reduces costs for variable workloads
- Built-in dead-letter queues for error handling
- Native integration with Lambda and other AWS services
- Simpler consumer implementation
- No cluster management or broker maintenance

### Negative
- Loss of Kafka's log-based replay capability
- Maximum message size of 256KB (vs Kafka's configurable limit)
- FIFO queues have throughput limits (3,000 msg/sec)
- Vendor lock-in to AWS
- No built-in stream processing (would need Kinesis)
- Message retention limited to 14 days

## Alternatives Considered
<!-- What other options were considered? -->
Amazon MSK (Managed Kafka), Amazon Kinesis, RabbitMQ on Amazon MQ, Redis Streams, Keep existing Kafka with improved automation

## Related Decisions
<!-- List any related ADRs -->
ADR-003: Adopting Event-Driven Architecture

## References
<!-- Links to relevant documentation, diagrams, etc. -->
- https://aws.amazon.com/sqs/
- https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/welcome.html
