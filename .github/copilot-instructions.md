# Copilot Instructions

## ADR Generation Rules

When asked to create an Architecture Decision Record (ADR):

1. **Template**: Use exactly `doc-templates/adr-template.md`
2. **Output Location**: Save to `adr-docs/adr-XXX-kebab-case-title.md`
3. **Auto-fill**:
   - `{{NUMBER}}` → Next sequential number (check existing files in adr-docs/)
   - `{{DATE}}` → Current date (YYYY-MM-DD)
   - `{{STATUS}}` → Draft
   - `{{OWNER}}` → Ewan Peters
4. **Preserve**: Keep all HTML comments from the template
5. **No extras**: Do not add sections or formatting not in the template
6. **IMPORTANT**: Always include the filepath comment at the top of the code block

## Prompt Formats Supported

| Prompt | Action |
|--------|--------|
| `New ADR: [Title]` | Generate ADR content |
| `Fill this ADR about: [Title]` | Fill open file with ADR content |
| `Create and fill ADR: [Title]` | Generate ADR with filepath for Apply |

## Minimal Prompt Support

If the user provides only a title:
- Context: "To be defined"
- Decision: "To be defined"
- Positive/Negative: Leave blank
- Alternatives: "None identified yet"
- Related: "None"
- References: Leave blank
```
