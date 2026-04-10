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

## Minimal Prompt Support

If the user provides only a title (e.g., "New ADR: Redis Caching"):
- Context: "To be defined"
- Decision: "To be defined"
- Positive/Negative: Leave blank
- Alternatives: "None identified yet"
- Related: "None"
- References: Leave blank

## File Naming

Use kebab-case:
- "Redis Caching" → `adr-007-redis-caching.md`
