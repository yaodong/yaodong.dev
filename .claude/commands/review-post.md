---
description: Analyze a blog post and suggest improvements without making changes
argument-hint: <file-path>
---

Review the blog post at: $ARGUMENTS

## Purpose

Analyze the post and identify potential issues. Output suggestions only. Do NOT make any edits. Let the user decide what to fix and how.

## Instructions

1. Read the specified blog post file
2. Analyze for the issues listed below
3. Output a structured report
4. Wait for user to decide next steps

## What to Check

### Narrative Flow

- Does the opening establish context and hook the reader?
- Are there smooth transitions between sections?
- Does it read like a story or like a list of notes?
- Is there a clear arc (problem → exploration → solution → reflection)?

### Note-like Expressions

- Fragment sentences that read like bullet points ("The insight: ...", "Dead simple.")
- Excessive short sentences in a row
- Lists formatted as prose (Pros/Cons patterns)
- Missing subjects ("Added logging everywhere. Watched it happen.")

### Punctuation Patterns

- Em-dash overuse (prefer colons, commas, parentheses, or separate sentences)
- Inconsistent punctuation style

### Structure

- Are headings clear and purposeful?
- Is the pacing appropriate (not too rushed, not too slow)?
- Are code examples introduced with context?

### Clarity

- Ambiguous pronouns
- Sentences that require re-reading
- Jargon that needs explanation

## Output Format

### Summary

One paragraph overview of the post's current state.

### Issues Found

Group by category. For each issue:
- **Location**: Line number or quote
- **Issue**: What's wrong
- **Suggestion**: How it could be improved

### Recommended Next Steps

Suggest which slash commands to run based on the issues found:
- `/add-narrative` - if narrative flow needs work
- `/fix-note-style` - if note-like expressions are prevalent
- `/rephrase` - if writing is repetitive
- `/improve-structure` - if structure needs work
- `/finalize` - for final spelling/grammar/em-dash check

Do NOT provide a revised version. The user will decide what to change.
