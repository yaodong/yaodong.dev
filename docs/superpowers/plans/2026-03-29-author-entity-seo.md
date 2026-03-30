# Author Entity SEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Strengthen the author-entity association for every blog post by centralizing author identity metadata, linking posts visibly back to the About page, and verifying the generated SEO output.

**Architecture:** Keep the implementation small and single-author focused. `_config.yml` becomes the single source of truth for author identity and social links, `about.md` reuses those shared values in its `Person` JSON-LD block, and `_layouts/post.html` adds a visible byline that points readers and crawlers to the canonical author page.

**Tech Stack:** Jekyll, Liquid templates, Markdown, `jekyll-seo-tag`, `bundle exec jekyll build`, `rg`

**Note:** Commit steps are intentionally omitted because no git commit has been requested in this workflow.

---

## File Map

- Modify: `_config.yml`
  Purpose: Replace the bare `author` string with a structured author object and add site-level social profile links.
- Modify: `about.md`
  Purpose: Reuse shared author metadata in the existing `Person` JSON-LD block so the canonical identity page stays aligned with the site config.
- Modify: `_layouts/post.html`
  Purpose: Add a visible author byline next to the post metadata and link it to the canonical About page.

## Task 1: Centralize the Author Identity in `_config.yml`

**Files:**
- Modify: `_config.yml`

- [ ] **Step 1: Build the current site and prove the author metadata is malformed for Twitter creator tags**

Run:

```bash
bundle exec jekyll build
rg -n 'twitter:creator' _site/the-migration-of-harness/index.html _site/about/index.html
```

Expected:

```text
_site/the-migration-of-harness/index.html:44:<meta name="twitter:creator" content="@Yaodong Zhao" />
_site/about/index.html:41:<meta name="twitter:creator" content="@Yaodong Zhao" />
```

This confirms the current bare `author` string is being interpreted as a Twitter handle, which is the wrong signal.

- [ ] **Step 2: Replace the bare `author` string with a structured author object and social links**

Update the top section of `_config.yml` to:

```yml
# Site settings
title: "yaodong.dev"
description: "Personal blog of Yaodong Zhao"
url: "https://yaodong.dev"
baseurl: ""
author:
  name: "Yaodong Zhao"
  url: "https://yaodong.dev/about/"
  twitter: "YaodongDev"
social:
  name: "Yaodong Zhao"
  links:
    - "https://www.linkedin.com/in/yaodong/"
    - "https://github.com/yaodong"
    - "https://x.com/YaodongDev"
default_image: "/assets/images/og-image.png"

# Social links for jekyll-seo-tag
twitter:
  username: YaodongDev
```

- [ ] **Step 3: Rebuild and confirm the generated Twitter creator tag now uses the author handle**

Run:

```bash
bundle exec jekyll build
rg -n 'twitter:creator' _site/the-migration-of-harness/index.html _site/about/index.html
```

Expected:

```text
_site/the-migration-of-harness/index.html:...<meta name="twitter:creator" content="@YaodongDev" />
_site/about/index.html:...<meta name="twitter:creator" content="@YaodongDev" />
```

## Task 2: Make the About Page Reuse the Shared Author Identity

**Files:**
- Modify: `about.md`

- [ ] **Step 1: Build the current site and show the About page still points the `Person` JSON-LD at the site root**

Run:

```bash
bundle exec jekyll build
rg -n '"@type": "Person"|"url": "https://yaodong.dev"|"sameAs"' _site/about/index.html
```

Expected:

```text
..."@type": "Person"...
..."url": "https://yaodong.dev"...
..."sameAs": [...]
```

This confirms the current About-page identity block is hard-coded and still uses the home page URL instead of the canonical author page URL.

- [ ] **Step 2: Update the About page JSON-LD to pull values from `_config.yml`**

Replace the existing JSON-LD script block in `about.md` with:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": {{ site.author.name | jsonify }},
  "url": {{ site.author.url | jsonify }},
  "sameAs": {{ site.social.links | jsonify }},
  "jobTitle": "Software Engineer"
}
</script>
```

- [ ] **Step 3: Rebuild and confirm the About page now exposes the canonical author URL and shared social links**

Run:

```bash
bundle exec jekyll build
rg -n '"@type": "Person"|"url": "https://yaodong.dev/about/"|https://www.linkedin.com/in/yaodong/|https://github.com/yaodong|https://x.com/YaodongDev' _site/about/index.html
```

Expected:

```text
..."@type": "Person"...
..."url": "https://yaodong.dev/about/"...
...https://www.linkedin.com/in/yaodong/...
...https://github.com/yaodong...
...https://x.com/YaodongDev...
```

## Task 3: Add a Visible Author Byline to Every Post Page

**Files:**
- Modify: `_layouts/post.html`

- [ ] **Step 1: Build the current site and confirm the representative post has no visible author byline**

Run:

```bash
bundle exec jekyll build
rg -n 'By Yaodong Zhao|<a href="https://yaodong.dev/about/" class="hover:text-\[var\(--color-accent\)\]">' _site/the-migration-of-harness/index.html
```

Expected: `rg` exits with status `1` because the article currently shows dates only and does not visibly link back to the author page.

- [ ] **Step 2: Update the post layout to render an author byline in the existing metadata row**

In `_layouts/post.html`, add author assignments after the `<h1>` and expand the `.meta` block to include the byline:

```liquid
---
layout: default
---

<article class="content-card">
  <header class="mb-8">
    <a href="{{ '/' | relative_url }}" class="back-link mb-6 inline-block">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 12H5"/>
        <path d="M12 19l-7-7 7-7"/>
      </svg>
      <span>Back</span>
    </a>

    <h1 class="mb-4">{{ page.title }}</h1>

    {% assign author_name = page.author.name | default: page.author | default: site.author.name %}
    {% assign author_url = page.author.url | default: site.author.url %}

    <div class="meta flex flex-wrap items-center gap-3">
      <time datetime="{{ page.created_date | date: '%Y-%m-%d' }}">
        {{ page.created_date | date: "%b %d, %Y" }}
      </time>
      {% if author_name %}
      <span class="text-[var(--color-border)]">·</span>
      {% if author_url %}
      <a href="{{ author_url }}" class="hover:text-[var(--color-accent)]">
        By {{ author_name }}
      </a>
      {% else %}
      <span>By {{ author_name }}</span>
      {% endif %}
      {% endif %}
      {% if page.updated_date %}
      <span class="text-[var(--color-border)]">·</span>
      <time datetime="{{ page.updated_date | date: '%Y-%m-%d' }}">
        Updated {{ page.updated_date | date: "%b %d, %Y" }}
      </time>
      {% endif %}
    </div>
  </header>

  {% if page.tags.size > 0 %}
  <div class="flex flex-wrap gap-2 mb-8">
    {% for tag in page.tags %}
    <a href="{{ '/tags/' | append: tag | append: '/' | relative_url }}" class="tag">
      {{ tag }}
    </a>
    {% endfor %}
  </div>
  {% endif %}

  <div class="prose prose-lg max-w-none">
    {{ content }}
  </div>
</article>

{% if site.related_posts.size > 0 %}
<section class="mt-8 content-card">
  <h3 class="text-lg mb-6">Related Posts</h3>
  <ul class="space-y-1">
    {% for related_post in site.related_posts limit:4 %}
    <li class="post-item">
      <a href="{{ related_post.url | relative_url }}">
        {{ related_post.title }}
      </a>
      <time datetime="{{ related_post.created_date | date: '%Y-%m-%d' }}">
        {{ related_post.created_date | date: "%b %d, %Y" }}
      </time>
    </li>
    {% endfor %}
  </ul>
</section>
{% endif %}
```

- [ ] **Step 3: Rebuild and confirm the representative post now shows a visible byline linked to the About page**

Run:

```bash
bundle exec jekyll build
rg -n 'By Yaodong Zhao|<a href="https://yaodong.dev/about/" class="hover:text-\[var\(--color-accent\)\]">' _site/the-migration-of-harness/index.html
```

Expected:

```text
...By Yaodong Zhao...
...<a href="https://yaodong.dev/about/" class="hover:text-[var(--color-accent)]">...
```

## Task 4: Verify the End-to-End Author Entity Signals in the Built Site

**Files:**
- Modify: none

- [ ] **Step 1: Build the site after all changes**

Run:

```bash
bundle exec jekyll build
```

Expected:

```text
Configuration file: /Users/yaodong/Developer/yaodong.dev/_config.yml
...
done in ... seconds.
Auto-regeneration: disabled. Use --watch to enable.
```

- [ ] **Step 2: Inspect the representative post and About page for the combined author signals**

Run:

```bash
rg -n 'twitter:creator|By Yaodong Zhao|<a href="https://yaodong.dev/about/" class="hover:text-\[var\(--color-accent\)\]">|"@type": "Person"|"url": "https://yaodong.dev/about/"|https://www.linkedin.com/in/yaodong/|https://github.com/yaodong|https://x.com/YaodongDev' _site/the-migration-of-harness/index.html _site/about/index.html
```

Expected:

```text
_site/the-migration-of-harness/index.html:...<meta name="twitter:creator" content="@YaodongDev" />
_site/the-migration-of-harness/index.html:...By Yaodong Zhao...
_site/the-migration-of-harness/index.html:...<a href="https://yaodong.dev/about/" class="hover:text-[var(--color-accent)]">...
_site/about/index.html:..."@type": "Person"...
_site/about/index.html:..."url": "https://yaodong.dev/about/"...
_site/about/index.html:...https://www.linkedin.com/in/yaodong/...
_site/about/index.html:...https://github.com/yaodong...
_site/about/index.html:...https://x.com/YaodongDev...
```

- [ ] **Step 3: Inspect the post JSON-LD and record whether `jekyll-seo-tag` now includes only the author name or includes the author URL as well**

Run:

```bash
rg -n '"@type":"BlogPosting"|"author":\{"@type":"Person"' _site/the-migration-of-harness/index.html
```

Expected: a single `BlogPosting` JSON-LD block with an author object. If the block still exposes only `"name":"Yaodong Zhao"`, the first pass is still valid and no further code changes are required in this plan. Record the result for follow-up, but stop here.
