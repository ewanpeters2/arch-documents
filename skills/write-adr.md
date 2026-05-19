# Skill: /write-adr

You are helping the user write an Architecture Decision Record (ADR). Follow the interview-then-draft flow below. Do not generate the ADR until the interview is complete.

---

## Step 1 — Load context before the interview

Before asking the user anything, silently do all of the following:

1. Read the ADR template at `doc-templates/adr-template.md`.
2. List and skim all existing ADRs under `adr-docs/` and any PDF filenames under `.arch-artifacts/` — note titles, domains, and decision outcomes. You will use these to spot overlap and suggest options the user may not have considered.
3. Skim any RFCs under `tech-decisions/requests-for-comments/` and TAs under `tech-decisions/technical-assessments/` — these often contain unresolved questions that ADRs are meant to close.

Keep all of this in context. Do not narrate the loading step.

---

## Step 2 — Exhaustive interview

Work through the interview below in order. Ask one group of questions at a time; wait for the user's answers before moving on. Mark each group clearly (e.g. **[1/6] Problem description**). Never skip a group, but you may skip individual questions within a group if the user has already answered them.

### [1/6] Problem description

- What problem are you trying to solve? Describe it in plain language.
- What is the current state — what is in place today, and why is it insufficient?
- What happens if no decision is made? (status quo consequences)

### [2/6] Scope and domain

- Which domain, initiative, or product area does this decision belong to?
- What systems or services are directly in scope?
- Are there related RFCs, TAs, or prior ADRs that provide context? (cross-reference what you found in Step 1 and ask the user to confirm or add more)

### [3/6] Decision drivers

- What are the primary constraints or forces shaping this decision? (e.g. latency, cost, team ownership, compliance, delivery timeline, scalability)
- Are there non-negotiable constraints — things that would make an option invalid regardless of its other merits?
- What does success look like? How would you know the right option was chosen?

### [4/6] Options

- What options have you already identified?
- For each option: what is your current understanding of its trade-offs?
- For each option: who are the key actors (users, operators, external parties) and which external systems or services does the option interact with? (This will be used to generate a C4 System Context diagram per option.)
- Do you already have a leaning or recommended option? If so, what is driving that preference?

At this point, cross-reference the options against what you found in existing ADRs, RFCs, and TAs. Suggest any options the user has not mentioned that appear relevant based on:
- patterns used to solve similar problems in other decisions in this repo
- standard architectural patterns that fit the decision drivers named above

Present these as: *"Based on [existing ADR/RFC title], one option worth considering is X — would you like to include it?"*

### [5/6] Pros and cons

For each confirmed option (user-provided + any accepted suggestions):
- Ask the user to confirm or correct your initial read on the pros and cons.

### [6/6] Recommendation and consequences

- Is there a clear recommended option at this point, or is the ADR meant to leave it open?
- What are the direct consequences of choosing the recommended option? (positive and negative)
- What is the current status? (Proposed / Rejected / Signed Off)
- Using a T-Shirt Size approach (S,M,L) , in terms of effort, what size would you apply to each component of the work. How long do you think that this will take ? The output of this should be used to complete the Timeline section of the adr-template

---

## Step 3 — Confirm before drafting

Summarise your understanding of the decision back to the user in a short paragraph. Ask: *"Does this capture it correctly? Anything to add or correct before I draft the ADR?"*

Wait for confirmation.

---

## Step 4 — Draft the ADR

Generate the ADR using the template structure below. Populate every section; never leave placeholder text in the output.

### Naming convention

Use the format: `ADR-{DOMAIN}-{INITIATIVE}-{SEQUENCE}-{Kebab-Title}.md`

Infer the sequence number from existing ADRs in the repo (increment from the highest number found). If no ADRs exist, start at `0001`.

### Template structure to follow

Refer to the template at `doc-templates/adr-template.md` and populate it with the information gathered in the interview.

When generating the ADR:
- Produce one `## Alternatives Considered` sub-section per option (including any options not chosen).
- For each option, generate a Mermaid `C4Context` diagram showing: the system in scope, key user/operator personas, and the external systems it interacts with in that option. Label all relationships with the interaction type.
- Keep all C4 diagrams at **Level 1 (System Context)**. Do not go into container or component level unless explicitly requested.
- The `## Architecture Diagram (Chosen Option)` section should contain a C4 System Context diagram for the selected option only.


### Tone and style

- Write like the existing documents in this repo: direct, precise, technical. No filler.
- Pros and cons use "✅ Good, because..." and "❌ Bad, because..." — not bare statements.
- The recommendation rationale should name the decision drivers explicitly. It should read as a logical conclusion, not a preference.
- If the ADR references another decision in the repo (an ADR, RFC, or TA), link it by name.
- Avoid using `-` (hyphens), prefer parentheses and commas for clarity. For example, write "The message format has not yet been decided (see xxx)" instead of "The message format has not yet been decided - see xxx".

---

## Step 5 — Offer to save

After presenting the draft, ask the user:

1. *"Any changes before I save this?"* Apply edits if needed.
2. save it to `tech-decisions/architecture-decision-records/{filename}.md` as the default. Wait for confirmation before writing the file.