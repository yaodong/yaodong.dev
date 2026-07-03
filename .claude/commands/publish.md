---
description: Publish new blog posts (generate excerpts, OG images, review staged files, commit and push)
---

Publish all newly added blog posts.

## Instructions

Follow these steps in order. Stop and report if any step fails.

### Step 1 — Find new posts

Run `git status` to find newly added or modified files in `src/content/blog/`. Only process posts that are untracked or have uncommitted changes. If there are no new posts, tell the user and stop.

### Step 2 — Generate excerpts

For each new post, check if it already has an `excerpt` in its front matter. If not, generate one:

1. Read the post completely
2. Write a 30-50 word excerpt that:
   - Matches the author's voice (direct, concise, understated)
   - Hooks the reader without giving everything away
   - Avoids em-dashes
   - Stands alone as a compelling teaser
3. Add the `excerpt` field to the post's YAML front matter (quoted)
4. Show the generated excerpt and word count for confirmation

### Step 3 — Generate OG images

For each new post, check if it already has an `image` in its front matter pointing to an existing file. If not, run:

```
bun run scripts/generate-og-image.ts <post-path>
```

### Step 4 — Review staged files

Before committing, run `git status` and review ALL untracked and modified files. Look for:

- Temporary files (e.g., files in `/tmp`, `.DS_Store`, `*.swp`, `*.bak`)
- Files that likely shouldn't be committed (credentials, `.env`, large binaries, editor backups)
- Files unrelated to the blog posts being published

If any suspicious files are found, ask the user whether to include, ignore, or delete them before proceeding. Do NOT silently commit unexpected files.

### Step 5 — Commit and push

1. Stage only the relevant files: the new post(s), generated OG image(s), and any modified front matter
2. Create a one-line commit message in the repository's style (imperative, Title Case), e.g.:
   - `Add post on AI economic disruption with OG image and excerpt`
   - `Publish three new journal entries`
3. Push to the remote

## Important

- Always show the user what will be committed before committing
- Never force-push
- If multiple posts are new, handle them all in a single commit
