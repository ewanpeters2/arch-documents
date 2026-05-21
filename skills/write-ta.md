# Skill: /write-ta

You are helping the user write a Technical Assessment (TA). Follow the interview-then-draft flow below. Do not generate the TA until the interview is complete. 

---

## Step 1 — Load context before the interview

Before asking the user anything, silently do all of the following:

1. Read the TA template at `doc-templates/ta-template.md`
2. List and skim all existing ADRs under `adr-docs/` and TAs under`ta-docs` any PDF filenames under `.arch-artifacts/` — note titles, domains, and decision outcomes. You will use these to spot overlap and suggest options the user may not have considered.
3. Skim any RFCs under `tech-decisions/requests-for-comments/` and TAs under `tech-decisions/technical-assessments/` — these often contain unresolved questions that ADRs are meant to close.

Keep all of this in context. Do not narrate the loading step.

---

## Step 2 — Exhaustive interview

Work through the interview below in order. Ask one group of questions at a time; wait for the user's answers before moving on. Mark each group clearly (e.g. **[1/6] Problem statement**). Never skip a group, but you may skip individual questions within a group if the user has already answered them.

### [1/6] Metadata
- Gather some metadata about the TA.
- The aim is to find out the Status. This should automatically be set to Draft when the TA is created
- Automatically add the date the TA is created
- Automatically add the owner as the person who creates the TA
- What is the Category ? This could be for example, Front-End, Back-End
- WHat is the priority, this can be either; High, Medium or Low

### [2/6] Problem statement

- What problem are you trying to solve? Describe it in plain language.
- Why are we making this assessment ? What problem and opportunity are we addressing
- What is the current state — what is in place today, and why is it insufficient?
- What are the forces and constraints that we need to be aware of ?

### [3/6] Assumptions

- Within the context of this TA. What are the assumptions that we are making ?
- For each assumption, explain what the assumption is and explain what the impact / status of the assumption is.
- The aim is to ve able to present these clearly to the reader
- Are there any which are related to other RFC, TAs or ADRs that help provide context (cross-reference what you found in Step 1 and ask the user to confirm or add more)

### [4/6] Risks and Challenges

- Within the context of this TA what are the risks and challenges that there will be ?
- For each risk or challenge provide a description and where possible a mitigation

### [5/6] High Level Analysis

- Within the context of the solution which is being analysed give some commentary with regards to how feasible it will be
- Describe the impacted areas and components. Will there be a cross-tribe requirement for work to be completed ?

### [6/6] Effort, next steps, and repositories

- For each impacted component, what is the estimated effort (use T-shirt sizing: S, M, L, XL)?
- What are the immediate next steps once this assessment is complete?
- Are there any specific GitHub repositories that are relevant to this work?
- Will there be any impacts on front-end capabilities (BFF, UI components, app, CMS, CI/CD pipelines)? If so, describe them.

### [6/7] Summary
- Use the context of the TA to present a summary. This should be an output from the questions which have been asked



## Step 3 — Confirm before drafting

Summarise your understanding of the assessment back to the user in a short paragraph. Ask: *"Does this capture it correctly? Anything to add or correct before I draft the TA?"*

Wait for confirmation.

---

## Step 4 — Draft the TA

Generate the TA using the template structure below. Populate every section; never leave placeholder text in the output.

### Naming convention

Use the format: `TA-{DOMAIN}-{INITIATIVE}-{SEQUENCE}-{Kebab-Title}.md`

Infer the sequence number from existing TAs in the repo '/ta-docs' (increment from the highest number found). If no TA exist, start at `0001`.

### Template structure to follow

Refer to the template at `doc-templates/ta-template.md` and populate it with the information gathered in the interview.

Based on the context of the TA, if there are related documents add document links to the References section

### Tone and style

- Write like the existing documents in this repo: direct, precise, technical. No filler.
- Pros and cons use "✅ Good, because..." and "❌ Bad, because..." — not bare statements.
- The recommendation rationale should name the decision drivers explicitly. It should read as a logical conclusion, not a preference.
- If the TA references another decision in the repo (an ADR, RFC, or TA), link it by name.
- Avoid using `-` (hyphens), prefer parentheses and commas for clarity. For example, write "The message format has not yet been decided (see xxx)" instead of "The message format has not yet been decided - see xxx".

---

## Step 5 — Offer to save

After presenting the draft, ask the user:

1. *"Any changes before I save this?"* Apply edits if needed.
2. Save it to `ta-docs/{filename}.md` as the default. Wait for confirmation