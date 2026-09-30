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

Prose that reads like unfinished notes rather than written-out thoughts. Look for fragments, missing subjects, and bullet-point rhythm disguised as sentences.

### Punctuation Patterns

- Em-dash overuse (prefer colons, commas, parentheses, or separate sentences)
- Inconsistent punctuation style

### Structure

- Are headings clear and purposeful?
- Is the pacing appropriate (not too rushed, not too slow)?
- Are code examples introduced with context?

### Rhetorical Packaging

Sentences that don't carry new information but perform a "this matters" posture. The surrounding prose already does the work; these just wrap it in rhetoric. They tend to cluster at paragraph boundaries. The fix is usually to cut them entirely.

### Soft Claims

Sentences that carry real information but state it too vaguely. The test: if a reader would ask "how so?" or "like what?", the sentence needs a concrete detail or example instead of an assertion.

### Clarity

- Ambiguous pronouns
- Sentences that require re-reading
- Jargon that needs explanation
- Voice/person consistency (e.g. unexpected shifts between "I" and "you")

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
