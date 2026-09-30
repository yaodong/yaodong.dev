---
description: Write a pitch (a social post introducing a blog post) in the author's voice and save it to pitches/
argument-hint: [post path, slug, or part of the title]
---

Write a pitch for the blog post: $ARGUMENTS

A pitch is the long social post the author shares to introduce a blog post. It is saved in `pitches/` under the same filename as the post and is never published on the site.

## Step 1: Find the post

- If `$ARGUMENTS` is a path, use it.
- If it is a slug or part of a title, match it against the filenames and titles in `src/content/blog/`. If more than one post matches, ask which one.
- If it is empty, use the post with the latest `created_date` in its front matter (not the filename date).

Read the whole post, front matter included.

If `pitches/<post-filename>.md` already exists, say so and show it before writing a new one.

## Step 2: Read the author's voice

Read the three or four most recent files in `pitches/` (by the date prefix in the filename). Use them for register only: first person, plain, understated, an engineer talking to other engineers. Don't copy their phrases, openings, or closing lines. Older pitches (2024 and 2025) use emoji lists, em-dashes, and sign-offs like "Happy debugging!"; the author has moved away from those.

## Step 3: Write two drafts

First, find the post's thesis: the one claim the post argues. Every draft keeps it as the spine, even when it opens on a side story. If the post makes a decision or a trade-off (what was chosen, why, and what it costs), that belongs to the spine too; a pitch that leaves it out has dropped the argument.

Then find the most concrete, surprising material in the post: an incident, a number, a result that goes against expectation. Strong pitches open on that. Write two complete drafts, each opening a different way:

- **A story**: a specific episode from the post, told with its details (a patient who spent thirty minutes choosing where to eat lunch; three failed attempts at an incremental refactor before trying what the AI suggested).
- **A finding**: a number or result that surprises (developers who were slower with AI but believed it had sped them up).
- **A problem**: the concrete requirement or failure the post starts from, stated with tension (every chunk has to arrive, in order, even when the connection drops).
- **A stance or habit**: a view or practice of the author's, when the post is built around one.

Avoid openings that are a preamble, a truism, or background ("The software development process evolved over decades", "An AI agent's context window has a limit", "In mid-2025 I tried…", "I've been doing X and it changed more than I expected"). If the post's most memorable material is a story, don't hold it back for the end of the pitch; either open on it or give it to the other draft.

Each draft:

- Is usually 130 to 270 words, in 3 to 7 short paragraphs. Use the length the argument needs; never pad. Scale to the post: a short post gets a short pitch, since retelling most of it leaves nothing to click for.
- Gets to the point quickly. An opening story is told in a paragraph, not two, before the pitch says why it matters.
- Gives the post's actual argument, compressed. A reader who never clicks should still come away with the idea; the post adds the depth, evidence, and details.
- Follows one line of argument. Pick the points that carry the thesis and leave the rest to the post; don't end with a paragraph that lists the remaining lessons.
- Makes one point per paragraph. A paragraph that summarizes several sections of the post, or strings together a list of options or practices, is a table of contents; cut it down to the one item that carries the argument.
- Is written fresh for the pitch, not stitched from the post's sentences. Borrow at most one memorable line from the post, and only if it earns its place.
- Introduces everything it refers to. No callbacks to a story, term, or detail the pitch hasn't told, and no term of art from the post ("harness") without saying what it means.
- Ends on a sentence that lands: the idea, its consequence, or a concrete detail that closes the loop. Don't end on a table-of-contents line ("I wrote up the X, the Y, and what I learned:") or a summary that repeats what the pitch already said.
- Is written in the first person, direct and understated, with concrete details over general claims.
- Uses only facts, numbers, and names that appear in the post, hedged the way the post hedges them ("roughly a tenth" stays roughly; "some models claim millions" doesn't become "heading toward millions"). Don't generalize one example into a broad claim.
- Avoids the tells of generated prose: "not X, it's Y" pivots, lists of three for rhythm, runs of short fragments ("Let it fail. Learn. Recalibrate."), stacked rhetorical questions, and intensifiers like "genuinely" and "actually".
- Has no hashtags, no emoji, no em-dashes, no "I just wrote" or "New post:" openings, and no sign-offs like "Happy debugging!".
- Leaves out the URL; it is added when saving.

Before showing the drafts, check each one against the post, sentence by sentence: every claim, number, and name is there, and nothing is overstated. Keep the post's qualifiers ("in my experience", "on complex tasks", "one way to picture it"); a framing or model the post offers tentatively stays tentative, and a line the post uses about one thing isn't moved onto another. Fix what doesn't match.

Show both drafts with their word counts and name the opening each one uses. Let the author pick one, combine them, or ask for changes.

## Step 4: Save

After the author chooses, write the final text to `pitches/<post-filename>.md` (for example `pitches/2026-09-29-rethinking-e2e-testing-with-agents.md`), followed by a blank line and the full URL:

```
https://yaodong.dev/<slug>/
```

The slug is the post's filename without the `YYYY-MM-DD-` prefix and the `.md` extension. If a pitch file already exists, show what will change and ask before overwriting it. Don't commit unless asked.
