#!/bin/bash

# Navigate to the git repository
cd /Users/jameschadwick/Desktop/CODING/p2 || exit 1

# Output file
OUTPUT_FILE="/Users/jameschadwick/Desktop/CODING/p2/docs/logging/branch.txt"

# Get current branch name
CURRENT_BRANCH=$(git branch --show-current)

{
    echo "# Git Branch Changes Export"
    echo "Generated: $(date)"
    echo "Current Branch: $CURRENT_BRANCH"
    echo "Comparing: $CURRENT_BRANCH vs main"
    echo "========================================\n"
    
    echo "## BRANCH SUMMARY"
    echo "Total commits on this branch:"
    git rev-list --count main..$CURRENT_BRANCH 2>/dev/null || echo "Unable to count (main may not exist)"
    
    echo "\n## BRANCH COMMITS"
    git log --oneline main..$CURRENT_BRANCH 2>/dev/null || echo "No commits or main branch not found"
    
    echo "\n## FILES CHANGED"
    git diff --name-status main...$CURRENT_BRANCH 2>/dev/null || git diff --name-status $CURRENT_BRANCH
    
    echo "\n## DETAILED CHANGES"
    echo "All changes in this branch:\n"
    git diff main...$CURRENT_BRANCH 2>/dev/null || git diff $CURRENT_BRANCH
    
} > "$OUTPUT_FILE"

echo "Branch changes exported to: $OUTPUT_FILE"