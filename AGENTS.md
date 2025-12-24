# Repository Guidelines

## Project Structure & Module Organization
This digital garden runs on Jekyll (see `_config.yml`). Publish long-form notes in `_posts/` using `YYYY-MM-DD-title.md`; standalone pages such as `about.md` and `archive.html` live at the project root. The archive page is hand-authored and lists every post without relying on `jekyll-archives`. Layout templates live in `_layouts/`, reusable fragments in `_includes/`, and shared metadata belongs in `_data/` (currently empty). Author CSS in `_assets/stylesheets/application.css`; the compiled output is written to `assets/stylesheets/` and served by the site. `Procfile.dev` and the scripts in `bin/` coordinate local tooling (`bin/dev` for Foreman, `bin/setup` for bootstrapping).

## Build, Test, and Development Commands
- `bin/setup` installs Bundler gems and Bun packages for Tailwind/PostCSS.
- `bin/dev` runs Foreman, launching `bundle exec jekyll serve` and the CSS watcher together.
- `bundle exec jekyll build` performs a production build into `_site/` and surfaces Liquid/YAML errors.
- `bun run build:css` regenerates `assets/stylesheets/application.css` once; add `--watch` while iterating.

## Coding Style & Naming Conventions
Write posts in Markdown with YAML front matter that includes `layout`, `title`, and `created_date`; keep indentation at two spaces. The home page lists the 10 most recent posts in simple title/date rows, while `archive.html` shows the full history using the same format. Use sentence-case headings and relative links so the garden stays portable. Liquid templates in `_layouts/` and `_includes/` follow the same 2-space indentation and prefer descriptive snippet names. CSS is layered via Tailwind utility classes; place custom declarations under logical comments inside `application.css`.

## Testing Guidelines
There is no automated test suite, so rely on build checks. Run `bundle exec jekyll build` (Bundler 2.6.9) before every push to catch runtime or broken-link warnings, and follow with `bundle exec jekyll doctor` when you touch configuration. If you modify styles, run `bun run build:css` to ensure PostCSS succeeds, then spot-check in a local `jekyll serve` session.

## Commit & Pull Request Guidelines
Commit messages follow the repository’s imperative, Title Case style (`Add archive page with flat index layout`). Group related changes per commit and avoid bundling unrelated content edits. Pull requests should describe the intent, list key files touched, and link to any tracking issues. Attach before/after screenshots or recordings whenever visual output changes, and note whether `bundle exec jekyll build` was run.
