---
description: Generate a social media post from a blog post
argument-hint: <file-path>
---

Generate a social media post for the blog post at: $ARGUMENTS

## Purpose

Create a concise, engaging social media post that promotes the blog post. Suitable for platforms like Bluesky, Mastodon, or X (Twitter).

## Instructions

1. Read the specified blog post file completely
2. Identify the core insight or most interesting angle
3. Write a social media post that:
   - Is under 280 characters (strict limit)
   - Leads with the hook, not the topic
   - Sounds like a person sharing something interesting, not a marketing announcement
   - Avoids hashtags unless the user requests them
   - Does not include a link (the user will add it themselves)
4. Provide 2-3 variations with different angles

## Style Guidelines

- Direct and conversational, matching the author's voice
- No emojis unless the user requests them
- No "I just wrote..." or "New blog post:" openings
- Prefer a specific detail or surprising takeaway over a generic summary
- Short sentences. Punch over polish.

## Examples

For a post about debugging CSS:
- "A missing CSS file led me down three rabbit holes. Each fix revealed another problem hiding underneath."
- "Spent two hours debugging a layout issue. The fix was one line. The lesson was not."

For a post about AI agents:
- "Most AI agent frameworks add complexity without adding capability. Sometimes a loop and a prompt is all you need."

## Output

Show all variations with character counts. Let the user pick or ask for adjustments.
