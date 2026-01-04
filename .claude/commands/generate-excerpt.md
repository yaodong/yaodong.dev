---
description: Generate a 30-50 word excerpt for a blog post
argument-hint: <file-path>
---

Generate an excerpt for the blog post at: $ARGUMENTS

## Purpose

Create a compelling excerpt (30-50 words) that captures the essence of the post while matching the author's writing style. The excerpt will be displayed on the home page to entice readers.

## Instructions

1. Read the specified blog post file completely
2. Analyze the writing style (tone, sentence structure, vocabulary)
3. Identify the core idea or hook of the post
4. Write an excerpt that:
   - Is 30-50 words (strictly enforced)
   - Matches the author's voice and style
   - Hooks the reader without giving everything away
   - Avoids em-dashes (use periods, commas, or colons instead)
   - Stands alone as a compelling teaser
5. Update the post's front matter with the excerpt

## Writing Style Guidelines

The author's style is direct, concise, and understated:
- Prefers short, punchy sentences
- Uses concrete examples over abstractions
- Avoids hyperbole and excessive enthusiasm
- Often opens with a specific story or case study
- Connects technical concepts to broader insights

## Front Matter Update

Add or update the `excerpt` field in the YAML front matter. Always quote the excerpt value to handle colons and special characters:

```yaml
excerpt: "Your generated excerpt here."
```

## Example

For a post about debugging:
- ❌ "An amazing deep-dive into the fascinating world of debugging—covering everything you need to know!"
- ✅ "A missing CSS file led me down three separate rabbit holes. Each fix revealed another problem hiding underneath. Here's what I learned about assumptions."

## Output

After updating the front matter, show the generated excerpt and word count for confirmation.

