# TA-INTEGRATION-FOE-0001: Third Party Integration with FOE Service — Gaps and Concerns

## Metadata

| Field | Value |
|-------|-------|
| **Status** | Draft |
| **Date** | 19 May 2026 |
| **Owner** | Ewan Peters |
| **Category** | Integration, Front-End |
| **Priority** | High |

## Problem Statement

Third party partners (currently Checkd and Monterosa) integrate with the FOE service via direct API calls to retrieve sports catalogue and pricing data, which is then displayed within iFrames on their platforms. Customer credentials are not passed as part of these API calls.

The primary concern is around **Country Specific Pricing (CSP)** — pricing is currently resolved based on the affiliate's registered jurisdiction in FOE, rather than the jurisdiction of the end customer viewing the iFrame. This means a customer located in a different country to the registered affiliate may be shown incorrect pricing.

FOE does apply geo-IP checks today, however this is not sufficient to fully address the gap. An affiliate could be registered in one jurisdiction while their end customers are located in another, meaning geo-IP at the affiliate level does not reflect the customer's actual location.

This introduces two key concerns:
1. **Regulatory compliance** — serving jurisdiction-incorrect pricing may breach local gambling and pricing regulations.
2. **Price experimentation** — FOE calls a downstream pricing service to retrieve prices. If a customer is in a different jurisdiction, they may receive prices that do not align with any active pricing experiments intended for their region.

## Assumptions

| Assumption | Impact |
|------------|--------|
| Third parties are registered as affiliates in FOE and API calls are resolved against the affiliate's registered jurisdiction | Customers in a different jurisdiction to the affiliate will receive incorrect CSP pricing |
| No customer credentials or session context is passed in API calls to FOE | FOE has no direct mechanism to infer the customer's jurisdiction from the request |
| CSP is resolved at the affiliate registration level, not at the customer level | Jurisdiction-aware pricing cannot be enforced without a change to how FOE handles third-party requests |
| Checkd and Monterosa are currently the only known third parties using this integration pattern | Scope is contained for now, but the pattern may exist for future third parties |
| SBG does not control how third parties render the pricing and catalogue data returned by FOE | Incorrect pricing displayed in iFrames is outside SBG's direct control once data is returned |
| Geo-IP checks are already applied by FOE | This provides a partial mitigation but is insufficient where affiliate and customer jurisdictions differ |
| Passing customer credentials to a third party and onwards to FOE is not acceptable | Any solution must resolve jurisdiction without relying on customer credential passing |
| Price experimentation is managed by a separate downstream service that FOE calls | Jurisdiction mismatches will propagate through to experimentation pricing |

## Risks and Challenges

| Risk | Description | Mitigation Plan |
|------|-------------|-----------------|
| Incorrect pricing shown to customers | Customers in a different jurisdiction to the registered affiliate are served pricing based on the affiliate's jurisdiction, not their own | FOE changes to support jurisdiction-aware responses for third-party API calls |
| Regulatory non-compliance | Serving jurisdiction-incorrect pricing may breach local gambling and pricing regulations | Stakeholder review to assess regulatory exposure and determine acceptable risk; FOE changes to enforce correct CSP |
| Price experimentation integrity | Customers accessing content via third-party iFrames may be shown incorrect experimental prices or bypass experiments entirely | Ensure jurisdiction resolution in FOE propagates correctly to downstream pricing service calls |
| Geo-IP insufficient for jurisdiction resolution | Geo-IP is already in use but does not account for affiliate vs customer jurisdiction mismatch | FOE to explore passing or inferring customer jurisdiction context without requiring customer credentials |
| Uncontrolled rendering by third parties | SBG has no visibility or control over how Checkd, Monterosa or future third parties render pricing data | Third-party integration documentation and contracts to be reviewed to ensure obligations around correct display |

## High Level Analysis

The core gap in the current integration is that FOE resolves Country Specific Pricing (CSP) based on the affiliate's registered jurisdiction rather than the jurisdiction of the end customer. Geo-IP checks are in place today but are applied at the affiliate request level and do not bridge the gap when a customer is physically located in a different jurisdiction to the affiliate.

The primary area of change required is **within the FOE service itself**. FOE would need to support a mechanism by which jurisdiction-aware pricing can be applied per request, without requiring customer credentials to be passed. Options may include passing a jurisdiction hint (e.g. an anonymised country code) as part of the API request, or enhancing FOE's geo-IP handling to better infer end customer location.

As FOE makes downstream calls to a separate pricing service to retrieve prices, any jurisdiction resolution changes in FOE will need to propagate correctly to those downstream calls to ensure price experimentation integrity is maintained.

No cross-tribe coordination is anticipated. There is no expected impact on BFF, UI components, or CI/CD pipelines for the third-party integrations.

## Effort Estimation

| Component | Estimate | Notes |
|-----------|----------|-------|
| FOE Service — jurisdiction-aware CSP for third-party API calls | L | Requires investigation into how jurisdiction can be resolved without customer credentials; downstream pricing service call impact to be included in scope |

## Summary

This TA identifies a gap in the current third-party integration pattern with the FOE service, specifically used by Checkd and Monterosa to retrieve sports catalogue and pricing data for display in iFrames. The core concern is that Country Specific Pricing (CSP) is resolved at the affiliate's registered jurisdiction level, not at the end customer's jurisdiction. Geo-IP checks are present but insufficient to fully address this gap.

This creates both a regulatory risk — where customers may be served jurisdiction-incorrect pricing — and a price experimentation risk, where active experiments may not be correctly applied to customers accessing content via third-party iFrames.

The recommended path forward is to make changes within FOE to support jurisdiction-aware pricing for third-party API requests, without passing customer credentials. Stakeholder review is required to assess which risks can be accepted and to agree the approach before development begins. Effort is estimated at **L**.

## References

- Checkd third-party integration with FOE service
- Monterosa third-party integration with FOE service
- FOE Service API documentation
