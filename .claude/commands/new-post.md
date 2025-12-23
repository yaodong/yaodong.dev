---
description: Create a new blog post
argument-hint: <title>
---

Create a new blog post with the title: $ARGUMENTS

## Instructions

1. Generate a URL-friendly slug from the title (lowercase, hyphens instead of spaces, no special characters)
2. Use today's date in YYYY-MM-DD format
3. Create the file at `_posts/YYYY-MM-DD-slug.md`

## Post Template

Use this frontmatter format:

```yaml
---
layout: post
category: journal
title: <Title>
created_date: YYYY-MM-DD
---
```

After the frontmatter, add a blank line and leave the content empty for the user to fill in.

## Example

For title "My New Post" on 2025-12-20, create:
- File: `_posts/2025-12-20-my-new-post.md`
- Frontmatter with title "My New Post" and created_date "2025-12-20"
