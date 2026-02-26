#!/usr/bin/env python3
"""
Compiles PROJECT_CONTEXT.md, all decision docs, and all initial planning docs
into LIVE_ALL.md and copies the result to the clipboard.
"""
import os
import glob
import sys

DOCS_DIR = os.path.dirname(os.path.abspath(__file__))
CONTEXT_FILE = os.path.join(DOCS_DIR, "PROJECT_CONTEXT.md")
DECISIONS_DIR = os.path.join(DOCS_DIR, "decisions")
INITIAL_PLANNING_DIR = os.path.join(DOCS_DIR, "initial-planning")
LIVE_ALL_FILE = os.path.join(DOCS_DIR, "LIVE_ALL.md")


def read_file(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def write_file(path, content):
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)


def copy_to_clipboard(text):
    """Cross-platform clipboard copy."""
    # Try pyperclip first (works on most systems)
    try:
        import pyperclip
        pyperclip.copy(text)
        return True
    except ImportError:
        pass

    # Fallback: tkinter (available in standard Python)
    try:
        import tkinter
        root = tkinter.Tk()
        root.withdraw()
        root.clipboard_clear()
        root.clipboard_append(text)
        root.update()
        root.destroy()
        return True
    except Exception:
        pass

    return False


def main():
    # Read PROJECT_CONTEXT.md
    context_content = read_file(CONTEXT_FILE)

    # Read all .md files from decisions/ (sorted for consistency)
    decisions_files = sorted(glob.glob(os.path.join(DECISIONS_DIR, "*.md")))
    decisions_content = []
    for filepath in decisions_files:
        decisions_content.append(read_file(filepath))

    # Read all .md files from initial-planning/ (sorted for consistency)
    planning_files = sorted(glob.glob(os.path.join(INITIAL_PLANNING_DIR, "*.md")))
    planning_content = []
    for filepath in planning_files:
        planning_content.append(read_file(filepath))

    # Combine everything
    combined = f"{context_content}\n\n"
    combined += "---\n\n"
    combined += "# Decisions\n\n"
    combined += "\n\n---\n\n".join(decisions_content)
    combined += "\n\n---\n\n"
    combined += "# Initial Planning\n\n"
    combined += "\n\n---\n\n".join(planning_content)

    # Write to LIVE_ALL.md
    write_file(LIVE_ALL_FILE, combined)
    print(f"Written to {LIVE_ALL_FILE}")

    # Copy to clipboard
    if copy_to_clipboard(combined):
        print("Copied to clipboard!")
    else:
        print("Warning: Could not copy to clipboard (no suitable library found)")
        print("You can manually copy the content from LIVE_ALL.md")
        sys.exit(1)


if __name__ == "__main__":
    main()