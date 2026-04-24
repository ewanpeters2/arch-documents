#!/bin/bash
# filepath: /Users/ewan.peters2/Documents/GitHub/arch-diagrams/scripts/prep-adr.sh

ADR_DIR="adr-docs"

LAST_NUM=$(ls -1 "$ADR_DIR"/adr-*.md 2>/dev/null | sed 's/.*adr-\([0-9]*\).*/\1/' | sort -n | tail -1)
NEXT_NUM=$(printf "%03d" $((10#${LAST_NUM:-0} + 1)))

echo "Enter ADR title:"
read TITLE

KEBAB_TITLE=$(echo "$TITLE" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd '[:alnum:]-')
FILENAME="adr-${NEXT_NUM}-${KEBAB_TITLE}.md"

touch "$ADR_DIR/$FILENAME"
code "$ADR_DIR/$FILENAME"

echo "✅ File ready: $ADR_DIR/$FILENAME"
echo ""
echo "Now in Copilot Chat, type:"
echo "Fill this ADR about: $TITLE"