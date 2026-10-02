I've come across several systems rewritten in Rust lately, Bun and Campfire among them. In both, the rewrite was judged by tests that only look at the system from the outside: Bun's TypeScript test suite, and a harness that compares Campfire's pages with the Rails app.

Something similar has been happening in my own work, on a smaller scale. With AI writing most of my code, a module may be rewritten next month, and the tests tied to its internals go with it. What stays put are the user stories, what a user can do and what happens as a result, so that's where I've been putting my review time. In practice that means E2E tests, which we used to write few of because preparing a single round could take half a day or more.

Over the past few months I've been handing that work to agents, and building it in a way that lets me check every step myself. That turned out to be what let me automate more of it.

https://yaodong.dev/rethinking-e2e-testing-with-agents/
