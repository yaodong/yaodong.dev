# Stream Posts Rules for yaodong.dev

## Overview
Stream posts are short-form content entries similar to microblogging that appear in the `/stream/` section of the website. They're implemented as markdown files with minimal front matter.

## File Structure

### Location
Stream posts are stored in the `_stream/` directory at the root of the project.

### Naming Convention
Stream post files follow this naming pattern:
```
YYYY-MM-DD-post-slug.md
```
- `YYYY-MM-DD`: The date of the post (e.g., 2024-10-22)
- `post-slug`: A kebab-case description of the post content (e.g., `paywallscreens`)

### File Content Structure
Each stream post has two parts:
1. **Front Matter**: YAML metadata at the top of the file between triple dashes (`---`)
2. **Content**: Markdown content that appears after the front matter

```markdown
---
date: YYYY-MM-DD HH:MM:SS TIMEZONE
---

Your content goes here in Markdown format. 
Links, formatting, and other Markdown features are supported.
```

### Front Matter Requirements
- `date`: Required. Format must be `YYYY-MM-DD HH:MM:SS TIMEZONE` (e.g., `2024-10-22 15:00:00 -0500`)

## URL Structure
Stream posts will be accessible at: `/stream/post-slug/`
The date prefix in the filename is not used in the URL but is used for chronological sorting.

## Display
Stream posts are displayed chronologically in reverse order (newest first) on the `/stream/` page.

## Creating a New Stream Post
To create a new stream post:

1. Create a file in the `_stream/` directory with the naming convention `YYYY-MM-DD-post-slug.md`
2. Add front matter with the date
3. Write the content in Markdown format

Example command to generate a stream post with the current date:
```
Create a stream post titled "my-new-post" with the current date
```

This should generate:
- A file named `YYYY-MM-DD-my-new-post.md` in the `_stream/` directory
- Front matter with today's date
- A template for the post content 