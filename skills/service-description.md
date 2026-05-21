# Skill: /service-description

You are helping the user to create a description of a service from an architectural view-point. Follow the interview flow below. Do not generate the service description until the interveiw is complete.

## Step 1 — Load the service context

Before asking the user anything, silently do all of the following:

1. For each service that is listed within the /service-description/service-list.md check that the repo can be read ok
2. Keep the repo in context

## Step 2 — Complete Service Template

Work through the template that is under 'doc-templates/service-description.md' using the service repo that is in context

## Step 3 — Draft the Service Description

Generate the service description using the template. Populate every section

### Naming convention

Use the format: `Service-{service-name}.md`

### Tone and style

- Write like the existing documents in this repo: direct, precise, technical. No filler.
- Pros and cons use "✅ Good, because..." and "❌ Bad, because..." — not bare statements.
- The recommendation rationale should name the decision drivers explicitly. It should read as a logical conclusion, not a preference.
- If the TA references another decision in the repo (an ADR, RFC, or TA), link it by name.
- Avoid using `-` (hyphens), prefer parentheses and commas for clarity. For example, write "The message format has not yet been decided (see xxx)" instead of "The message format has not yet been decided - see xxx".

## Step 5 — Offer to save

After presenting the draft, ask the user:

1. *"Any changes before I save this?"* Apply edits if needed.
2. Save it to `ta-docs/{filename}.md` as the default. Wait for confirmation