Troubleshooting technical problems can be tricky. I've found that often, the stranger the issue, the simpler the solution. I recently faced such a puzzle with Rails in production.

The problem? The application.css file was missing. As every software engineer has experienced, it works on my local machine! I could use the `assets:precompile` command or Docker build in a production or development environment — it didn't matter. The file was always there.

But on GitHub Actions, it was a different story. No matter what I tried, application.css wouldn't appear in public/assets. I even checked our production containers — the same issue. The file was in `app/assets/builds` but not in public/assets.

I was stuck. Then, I found a helpful post on the fly.io community. It suggested ensuring that Git does not ignore the app/assets/builds. This solution got me curious. I dug into the sprockets-rails code. Here's what I learned:

- Sprockets initializes with Rails::Railtie hooks.
- Rails builds the CSS with a JavaScript bundler.
- Sprockets then precompile all assets.

But here's the kicker: Sprockets cache directory lists during initialization!

If assets/builds aren't there initially, Sprockets ignores them later. That's why the CSS file was in assets/builds but not processed. The directory existed on my local machine. I had run the Rails server before, but GitHub Actions used fresh checkouts, so the directory was missing.

It was a good reminder that understanding the underlying process often leads to simple solutions, even for the most puzzling problems.

Happy debugging!

https://yaodong.dev/fixing-missing-css-in-rails-production/
