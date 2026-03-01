#!/usr/bin/env python3
"""
Compiles PROJECT_CONTEXT.md, all decision docs, all initial planning docs,
and the full file-tree into LIVE_ALL.md and copies the result to the clipboard.
"""
import os
import glob
import sys
import fnmatch
import re

DOCS_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(DOCS_DIR)  # p2/ is parent of p2/docs/
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


def find_gitignore_files(root_dir):
    """Find all .gitignore files in the project."""
    gitignore_files = []
    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Don't descend into .git directories
        if '.git' in dirnames:
            dirnames.remove('.git')
        if '.gitignore' in filenames:
            gitignore_files.append(os.path.join(dirpath, '.gitignore'))
    return gitignore_files


def parse_gitignore_patterns(gitignore_path, base_dir):
    """Parse a .gitignore file and return list of (pattern, is_negation) tuples."""
    patterns = []
    gitignore_dir = os.path.dirname(gitignore_path)
    
    try:
        with open(gitignore_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                # Skip empty lines and comments
                if not line or line.startswith('#'):
                    continue
                
                is_negation = line.startswith('!')
                if is_negation:
                    line = line[1:]
                
                # Handle directory traversal patterns
                if line.startswith('/'):
                    # Anchored to gitignore file's directory
                    pattern = line[1:]
                    relative_to = gitignore_dir
                else:
                    pattern = line
                    relative_to = gitignore_dir
                
                patterns.append((pattern, is_negation, relative_to))
    except (IOError, OSError):
        pass
    
    return patterns


def match_gitignore_patterns(filepath, patterns):
    """Check if a filepath matches any gitignore pattern."""
    # Get relative path from project root
    rel_path = os.path.relpath(filepath, PROJECT_ROOT)
    # Normalize path separators
    rel_path = rel_path.replace(os.sep, '/')
    
    # Get the directory of the file for directory patterns
    filepath_dir = os.path.dirname(rel_path)
    
    for pattern, is_negation, pattern_base in patterns:
        # Convert pattern to regex
        # Handle ** for directory matching
        regex_pattern = pattern.replace('**', '.*')
        regex_pattern = regex_pattern.replace('*', '[^/]*')
        regex_pattern = regex_pattern.replace('?', '[^/]')
        regex_pattern = '^' + regex_pattern + '$'
        
        try:
            regex = re.compile(regex_pattern)
        except re.error:
            continue
        
        # Match against the full relative path
        if regex.match(rel_path):
            return not is_negation  # True = ignored, False = explicitly included
        
        # Match against just the filename
        filename = os.path.basename(rel_path)
        if regex.match(filename):
            return not is_negation
        
        # For directory patterns (ending with /), check if file is in that directory
        if pattern.endswith('/'):
            dir_pattern = pattern.rstrip('/')
            dir_regex_pattern = '^' + dir_pattern.replace('*', '[^/]*') + '(/.*)?$'
            try:
                dir_regex = re.compile(dir_regex_pattern)
                if dir_regex.match(rel_path):
                    return not is_negation
            except re.error:
                continue
    
    return False  # Not matched by any pattern = not ignored


def is_ignored(filepath):
    """Check if a file should be ignored based on all .gitignore patterns."""
    # Always ignore .git directory
    if '.git' in filepath:
        return True
    
    # Find all gitignore files
    gitignore_files = find_gitignore_files(PROJECT_ROOT)
    
    # Collect all patterns
    all_patterns = []
    for gitignore_file in gitignore_files:
        patterns = parse_gitignore_patterns(gitignore_file, PROJECT_ROOT)
        all_patterns.extend(patterns)
    
    return match_gitignore_patterns(filepath, all_patterns)


def get_file_tree(root_dir, prefix="", is_last=True):
    """Generate a tree representation of the project directory."""
    entries = []
    try:
        items = os.listdir(root_dir)
    except (OSError, PermissionError):
        return entries
    
    # Sort items, directories first
    dirs = []
    files = []
    for item in items:
        full_path = os.path.join(root_dir, item)
        if os.path.isdir(full_path):
            dirs.append(item)
        else:
            files.append(item)
    
    items = sorted(dirs) + sorted(files)
    
    for i, item in enumerate(items):
        full_path = os.path.join(root_dir, item)
        is_last_item = (i == len(items) - 1)
        
        # Check if should be ignored
        if is_ignored(full_path):
            continue
        
        if os.path.isdir(full_path):
            connector = "└── " if is_last_item else "├── "
            entries.append(f"{prefix}{connector}{item}/")
            # Recurse into subdirectory
            extension = "    " if is_last_item else "│   "
            entries.extend(get_file_tree(full_path, prefix + extension, is_last_item))
        else:
            connector = "└── " if is_last_item else "├── "
            entries.append(f"{prefix}{connector}{item}")
    
    return entries


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

    # Generate file tree
    tree_content = get_file_tree(P)
