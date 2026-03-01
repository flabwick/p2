#!/bin/bash

# Navigate to the git repository
cd /Users/jameschadwick/Desktop/CODING/p2 || exit 1

# Output file
OUTPUT_FILE="/Users/jameschadwick/Desktop/CODING/p2/docs/logging/commit.txt"

{
    echo "# Git Uncommitted Changes Export"
    echo "Generated: $(date)"
    echo "========================================\n"
    
    echo "## CURRENT STATUS"
    git status
    
    echo "\n## STAGED CHANGES (ready to commit)"
    if git diff --cached --quiet; then
        echo "No staged changes"
    else
        echo "\n### Files staged:"
        git diff --cached --name-status
        echo "\n### Detailed staged changes:"
        git diff --cached
    fi
    
    echo "\n## UNSTAGED CHANGES (working directory)"
    if git diff --quiet; then
        echo "No unstaged changes"
    else
        echo "\n### Files modified but not staged:"
        git diff --name-status
        echo "\n### Detailed unstaged changes:"
        git diff
    fi
    
    echo "\n## UNTRACKED FILES"
    UNTRACKED=$(git ls-files --others --exclude-standard)
    if [ -z "$UNTRACKED" ]; then
        echo "No untracked files"
    else
        echo "$UNTRACKED"
    fi
    
    echo "\n## CHANGES VS LAST COMMIT (everything)"
    echo "All changes since last commit:\n"
    git diff HEAD
    
    echo "\n## CHANGES VS PUSHED (if applicable)"
    # Try to find upstream branch
    UPSTREAM=$(git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null)
    if [ $? -eq 0 ]; then
        echo "Comparing to upstream: $UPSTREAM"
        git diff $UPSTREAM..HEAD
    else
        echo "No upstream branch configured or cannot compare"
    fi
    
} > "$OUTPUT_FILE"

echo "Uncommitted changes exported to: $OUTPUT_FILE"