# Repository Guidelines

## Project Structure & Module Organization
This blog runs on [Astro](https://astro.build) (static output). Site configuration lives in `astro.config.mjs` and `src/lib/site.ts` (title, author, navigation, analytics). Publish long-form notes as Markdown in `src/content/blog/` using `YYYY-MM-DD-title.md`; the collection schema is defined in `src/content.config.ts`. Posts are served at `/<slug>/`, where the slug is the filename with the `YYYY-MM-DD-` date prefix stripped. Routing pages live in `src/pages/` — `index.astro` (home), `archive.astro`, `about.md`, `projects.md`, `library.md`, `404.astro`, `[...slug].astro` (renders posts), plus `feed.xml.ts` and `sitemap.xml.ts`. Layout templates live in `src/layouts/` (`BaseLayout`, `PostLayout`, `PageLayout`, `MarkdownPage`) and reusable head/meta logic in `src/components/BaseHead.astro`. Author CSS in `src/styles/application.css` (Tailwind v4 via `@tailwindcss/vite`); it is bundled at build time. Static assets (favicons, images, `robots.txt`, `CNAME`) live in `public/` and are served from the site root.

## Build, Test, and Development Commands
- `bun install` installs dependencies.
- `bun run dev` starts the Astro dev server with hot reload.
- `bun run build` performs a production build into `dist/` and surfaces content/type errors.
- `bun run preview` serves the built `dist/` locally.
- `bun run generate:og <post-path>` renders an OG image into `public/assets/images/og/` (and backfills the post's `image` front matter). `bun run generate:og:all` regenerates all posts.

## Coding Style & Naming Conventions
Write posts in Markdown with YAML front matter that includes `title` and `created_date` (ISO 8601, e.g. `2026-03-29T00:00:00.000Z`); optional fields are `excerpt`, `image`, `updated_date`, and `category`. Posts sort and display by `created_date`, not the filename date. Keep front matter at two spaces of indentation and start the body directly after it — no `# Title` heading (the title comes from front matter). Use sentence-case headings and `---` horizontal rules as section dividers. `.astro` files and CSS also use two-space indentation; place custom CSS declarations under logical comments inside `application.css` alongside the existing design tokens.

## Testing Guidelines
There is no automated test suite, so rely on build checks. Run `bun run build` before every push to catch content, type, and rendering errors; optionally run `bunx astro check`. If you modify styles or layouts, spot-check with `bun run dev` (or `bun run preview` against the build).

## Commit & Pull Request Guidelines
Commit messages follow the repository’s imperative, Title Case style (`Add archive page with flat index layout`). Group related changes per commit and avoid bundling unrelated content edits. Pull requests should describe the intent, list key files touched, and link to any tracking issues. Attach before/after screenshots or recordings whenever visual output changes, and note whether `bun run build` was run.

## Deployment
Pushing to `master` triggers `.github/workflows/deploy.yml`, which builds with Bun + Astro and deploys `dist/` to GitHub Pages. The custom domain `yaodong.dev` is set in the repository's Pages settings and pinned by `public/CNAME`. No manual deploy step is needed.
