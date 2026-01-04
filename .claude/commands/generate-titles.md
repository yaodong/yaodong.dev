---
description: Generate 5 title options for a blog post
argument-hint: <file-path>
---

Generate title options for the blog post at: $ARGUMENTS

## Purpose

Read and understand the post, then propose 5 distinct title options for the user to choose from. Each title should capture a different angle or emphasis of the content.

## Instructions

1. Read the specified blog post file completely
2. Identify the core themes, insights, and hooks
3. Generate 5 title options with different approaches:
   - **Option 1**: Direct and descriptive (states what the post is about)
   - **Option 2**: Problem-focused (highlights the challenge or question)
   - **Option 3**: Insight-focused (leads with the key takeaway)
   - **Option 4**: Story-focused (hints at the narrative or journey)
   - **Option 5**: Provocative or curious (creates intrigue)
4. Present all options using the AskUserQuestion tool so the user can choose

## Title Guidelines

Match the author's style:
- Direct and concise (avoid clickbait)
- No excessive punctuation or all-caps
- Avoid hyperbole ("The Ultimate Guide", "Everything You Need")
- Prefer concrete over abstract
- Keep titles under 10 words when possible

## Output

Use AskUserQuestion to present the 5 titles as options. Include a brief note explaining the angle of each title.

After the user selects, update the post's front matter with the chosen title.
