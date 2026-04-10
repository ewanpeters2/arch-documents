#!/bin/bash

ADR_DIR="adr-docs"

LAST_NUM=$(ls -1 "$ADR_DIR"/adr-*.md 2>/dev/null | sed 's/.*adr-\([0-9]*\).*/\1/' | sort -n | tail -1)
NEXT_NUM=$(printf "%03d" $((10#${LAST_NUM:-0} + 1)))

echo "Enter ADR title:"
read TITLE

KEBAB_TITLE=$(echo "$TITLE" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd '[:alnum:]-')
FILENAME="adr-${NEXT_NUM}-${KEBAB_TITLE}.md"

OWNER=$(git config user.name)
DATE=$(date +%Y-%m-%d)

cat > "$ADR_DIR/$FILENAME" << TEMPLATE
# ADR-${NEXT_NUM}: ${TITLE}

## Status
Draft <!-- Draft | Proposed | Accepted | Deprecated | Superseded -->

## Date
${DATE}

## Owner
${OWNER}

## Context
<!-- What is the issue that we're seeing that is motivating this decision or change? -->
To be defined

## Decision
<!-- What is the change that we're proposing and/or doing? -->
To be defined

## Consequences
<!-- What becomes easier or more difficult to do because of this change? -->

### Positive


### Negative


## Alternatives Considered
<!-- What other options were considered? -->
None identified yet

## Related Decisions
<!-- List any related ADRs -->
None

## References
<!-- Links to relevant documentation, diagrams, etc. -->

TEMPLATE

echo "✅ Created: $ADR_DIR/$FILENAME"
code "$ADR_DIR/$FILENAME"
