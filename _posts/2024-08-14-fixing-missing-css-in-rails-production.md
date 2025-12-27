---
layout: post
title: Fixing Missing Assets Files in Rails Production
created_date: 2024-08-14T00:00:00.000Z
updated_date: 2024-08-14T00:00:00.000Z
image: /assets/images/og/2024-08-14-fixing-missing-css-in-rails-production.png
excerpt: "A missing CSS file led me down three separate rabbit holes. A missing directory, a debug flag, a MIME type mismatch. Each fix revealed another problem hiding underneath. Here's what I learned about the Rails asset pipeline."
---

Recently, I ran into a frustrating issue where `application.css` couldn't ebe found in my Rails app.
I thought it would be a quick fix for a precompile configuration error.
Instead, it turned into a wild goose chase. This chase involved three separate problems.
Here's the story of how I figured it out and what I learned along the way.

## Problem 1: The missing builds folder

In production, Rails kept complaining that it couldn't find the `application.css` file.
It was weird. The rails `assets:precompile` command worked fine on my local machine.
This was true for both the `RAILS_ENV=development` and `RAILS_ENV=production` options.
But when I ran the same process in GitHub Actions, `application.css` was nowhere to be found in the precompiled assets.

I tried building the `Dockerfile` locally to see if I could reproduce the issue, but no dice. It was specific to the GitHub Actions environment.
I poked around in the running containers on production.
There, I found that application.css was hanging out in the `app/assets/builds` directory.
However, it was missing in `public/assets`.

After banging my head against the wall for a while, I stumbled upon a post on fly.io community [^1].
The post suggested two things:

1. Make sure the `app/assets/builds` directory exists.
2. Include this directory in the git repo, even if it's empty.

Intrigued by this solution, I dug into the `sprockets-rails` code, which revealed the following order of operations:

1. Sprockets initializes using the `Rails::Railtie` hooks [^2].
2. Rails uses a JavaScript bundler to build the application CSS, outputting to the assets/build directory.
3. Sprockets precompiles all assets, outputting to the public/assets directory.

The less-known but critical detail was that Sprockets caches a list of directories during initialization.
If the `assets/builds` directory doesn't exist in the code, Sprockets skips over it in the later stages.
This cache strategy explained why the `application.css` file was visible in `assets/builds`, but Sprockets wasn't processing it.

My local environment had the `assets/builds` directory because I had run the rails server at least once.
However, the GitHub Actions checkouts were fresh, so the directory was missing.

The fix? Add the empty assets/builds directory to the git repo.

## Problem 2: debug mode causes skipped manifest resolver

With the first issue sorted, the assets were precompiling correctly, but production still complained they were missing.
More digging revealed that `config.assets.debug = true` was the culprit.

This debug flag has a sneaky side effect in production: it removes the manifest resolver, which means Sprockets can't recognize manifest.json files.

Here's the relevant code [^3]:

```ruby
if config.assets.resolve_with.nil?
    config.assets.resolve_with = []
    config.assets.resolve_with << :manifest if config.assets.digest && !config.assets.debug
    config.assets.resolve_with << :environment if config.assets.compile
end
```

The solution was to remove the config in the production environment configuration.

## Problem 3: MIME type mismatch

I thought I was in the clear. `application.css` was present in both `manifest.json` and on the CDN.
However, the website still showed me a blank screen.  
After determining that it's not a CORS problem and checking different browsers, Safari finally gave me a clue: a MIME-type error.

I was using `s3cmd` to upload files to a CDN bucket. When I wrote the github workflow, I referenced a discussion on GitHub.
The discussion suggested using the `--no-mime-magic` and `--guess-mime-type` options with `s3cmd`.
However, this advice was addressing a problem where certain versions of `python-magic` were producing incorrect MIME types.
After testing it on my local machine, I confirmed the latest version of `python-magic` has fixed this issue.
The solution was to adjust the `s3cmd` options. I removed the `--no-mime-magic` flag but kept the `--guess-mime-type` flag.
This adjustment allowed `s3cmd` to correctly detect and set MIME types.

## Conclusion

Finally, after all that, the website could load CSS and JS files without throwing a fit.
While I ran into a few other minor hiccups along the way, these three problems were real time sinks.
This whole ordeal taught me a few valuable lessons:

- **Know your tools**: It's crucial to understand each piece of the asset pipeline puzzle and how they fit together.
- **Configuration matters**: Be mindful of how configuration flags impact your app, especially when switching between environments.
- **Don't trust everything you read**. While online solutions are helpful, understand the context before blindly applying them.
- **Persistence pays off**: Complex issues often require methodical troubleshooting and a healthy dose of stubbornness.

So, the next time you're pulling your hair out over a seemingly simple asset issue, remember this:
It might not be just one problem. Often, it's a perfect storm of minor issues conspiring against you.
Happy debugging!

## Footnotes

[^1]: [assets:precompile not compiling CSS assets](https://community.fly.io/t/assets-precompile-not-compiling-css-assets/18398)
[^2]: [A Brief Introduction to Rails Initializers: Why, What, and How](https://www.writesoftwarewell.com/introduction-to-rails-initializers/)
[^3]: [sprockets-rails/lib/sprockets/railtie.rb:233](https://github.com/rails/sprockets-rails/blob/2c04236faaacd021b7810289cbac93e962ff14da/lib/sprockets/railtie.rb#L233C91-L233C96)
