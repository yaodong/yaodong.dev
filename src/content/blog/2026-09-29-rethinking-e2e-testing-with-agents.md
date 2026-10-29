---
layout: post
title: Rethinking E2E Testing With Agents
created_date: 2026-09-29T00:00:00.000Z
excerpt: "With AI writing most of my code, the slow part became checking that it does what I meant. I've spent the past few months automating my E2E testing, and building it in a way that lets me check every step myself turned out to be what let me automate more of it."
image: /assets/images/og/2026-09-29-rethinking-e2e-testing-with-agents.png
---

Over the past few months, the bottleneck in my work has moved from writing code to verifying it. AI keeps making it easier to get a working implementation, but confirming that it does what I meant to deliver still takes a lot of my time. So I started automating testing, and the part that caught my attention most was end-to-end (E2E) testing.

## Verifying what changes slowest

AI now writes almost all my code. It proposes most of the approaches too. My job is catching its mistakes and choosing between its options. Trying another implementation has become cheap enough that a module may be rewritten from scratch next month, and tests coupled to its implementation details get replaced along with it. Reviewing those tests closely is worth less to me than it used to be.

User stories change much more slowly. They describe what a user can do and what happens as a result, and they usually stay the same while the implementation underneath gets rewritten. Checking one usually means doing what the user would do, from getting the data into the right state, through the steps, to looking at what the system did at the end. That's what an E2E test does, and it's where more of my attention has gone. When I review an E2E test plan, I look at the happy path and the common error paths, then scan the concrete cases for anything that doesn't make sense for what we're delivering to the user.

Recently I saw a much more extreme take. Ansh Nanda [shared](https://x.com/anshnanda/status/2101627891721371971) the rules at the top of an AGENTS.md file: never write unit tests after writing the code, and "highly prefer E2E tests as the sole testing mechanism." When a system has to be tested in isolation, the rules say to write all the ways it could fail first, then the code. I haven't gone that way. Stable business rules are a natural fit for unit tests. I still want unit tests to cover as much of the code as possible, and integration tests to cover the essential cases without exhaustively testing every combination. AI now does almost all the writing and reviewing of these tests, so they take very little of my attention.

## Why we used to write so few E2E tests

Our team's process has every feature or bug fix tested on a feature branch server after implementation. Before I automated it, preparation alone could take half a day to a day: deciding what to test, building fixtures, getting the seed data into the right state. The database might already have a test customer, but before it can use the new feature, it needs a particular configuration. Understanding that configuration and setting it up is part of the test.

The process doesn't stop at the branch server. After merging, I test again on the shared integration branch, where everyone's changes come together, then again on the release-candidate server. The database on the release-candidate server is read-only, so any state change there has to go through the API as a simulated user action, which adds steps even to setup. Turning all of that into automated tests often took longer than the testing itself, so few of these checks ever became E2E tests.

<figure>
<div class="fig-head"><div class="fig-title">The same testing, three times</div><div class="fig-sub">How each change was tested before automation</div></div>
<div class="fig-draw"><svg id="ms" viewBox="0 0 840 228" role="img" aria-label="Before automation, every change was tested by hand three times: on the feature branch server, again on the integration branch after merging, and again on the release-candidate server, with data set up and results checked at each stage."><style>#ms text{font-family:var(--font-body)}#ms .mono{font-family:var(--font-mono)}</style>
<path d="M150.67 46 L300 46" fill="none" stroke-width="1" stroke-linejoin="round" style="stroke:var(--color-text-muted)"/>
<path d="M296.0 49.5 L300 46 L296.0 42.5" fill="none" stroke-width="1" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(--color-text-muted)"/>
<path d="M453.336 46 L580 46" fill="none" stroke-width="1" stroke-linejoin="round" style="stroke:var(--color-text-muted)"/>
<path d="M576.0 49.5 L580 46 L576.0 42.5" fill="none" stroke-width="1" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(--color-text-muted)"/>
<path d="M30 80 L30 138" fill="none" stroke-width="1" stroke-linejoin="round" style="stroke:var(--color-text-muted)"/>
<path d="M26.5 134.0 L30 138 L33.5 134.0" fill="none" stroke-width="1" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(--color-text-muted)"/>
<path d="M310 80 L310 138" fill="none" stroke-width="1" stroke-linejoin="round" style="stroke:var(--color-text-muted)"/>
<path d="M306.5 134.0 L310 138 L313.5 134.0" fill="none" stroke-width="1" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(--color-text-muted)"/>
<path d="M590 80 L590 138" fill="none" stroke-width="1" stroke-linejoin="round" style="stroke:var(--color-text-muted)"/>
<path d="M586.5 134.0 L590 138 L593.5 134.0" fill="none" stroke-width="1" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(--color-text-muted)"/>
<text x="44" y="22" font-size="12" font-weight="500" class="mono" letter-spacing="0.08em" style="fill:var(--color-text-secondary)">ENVIRONMENTS</text>
<text x="44" y="126" font-size="12" font-weight="500" class="mono" letter-spacing="0.08em" style="fill:var(--color-text-secondary)">ME, BY HAND</text>
<text x="44" y="50.5" font-size="14" font-weight="500" style="fill:var(--color-text)">Feature branch</text>
<text x="44" y="68" font-size="12.5" style="fill:var(--color-text-muted)">one server per ticket</text>
<circle cx="30" cy="46" r="5.5" stroke-width="2" style="fill:var(--color-text-body);stroke:var(--color-bg)"/>
<text x="324" y="50.5" font-size="14" font-weight="500" style="fill:var(--color-text)">Integration branch</text>
<text x="324" y="68" font-size="12.5" style="fill:var(--color-text-muted)">everyone's changes</text>
<circle cx="310" cy="46" r="5.5" stroke-width="2" style="fill:var(--color-text-body);stroke:var(--color-bg)"/>
<text x="604" y="50.5" font-size="14" font-weight="500" style="fill:var(--color-text)">Release candidate</text>
<text x="604" y="68" font-size="12.5" style="fill:var(--color-text-muted)">read-only database</text>
<circle cx="590" cy="46" r="5.5" stroke-width="2" style="fill:var(--color-text-body);stroke:var(--color-bg)"/>
<text x="225.335" y="39" text-anchor="middle" font-size="13" style="fill:var(--color-text-secondary)">merge</text>
<text x="516.668" y="39" text-anchor="middle" font-size="13" style="fill:var(--color-text-secondary)">release</text>
<text x="44" y="154.5" font-size="14" font-weight="500" style="fill:var(--color-text)">Prepare and test</text>
<text x="44" y="172" font-size="12.5" style="fill:var(--color-text-muted)">work out what to test</text>
<text x="44" y="189.5" font-size="12.5" style="fill:var(--color-text-muted)">build fixtures, seed data</text>
<text x="44" y="207" font-size="12.5" style="fill:var(--color-text-muted)">run the steps, check</text>
<circle cx="30" cy="150" r="5" stroke-width="1.5" style="fill:var(--color-bg);stroke:var(--color-text-body)"/>
<text x="324" y="154.5" font-size="14" font-weight="500" style="fill:var(--color-text)">Test again</text>
<text x="324" y="172" font-size="12.5" style="fill:var(--color-text-muted)">set up the data again</text>
<text x="324" y="189.5" font-size="12.5" style="fill:var(--color-text-muted)">run the steps, check</text>
<circle cx="310" cy="150" r="5" stroke-width="1.5" style="fill:var(--color-bg);stroke:var(--color-text-body)"/>
<text x="604" y="154.5" font-size="14" font-weight="500" style="fill:var(--color-text)">Test again</text>
<text x="604" y="172" font-size="12.5" style="fill:var(--color-text-muted)">set up state via the API</text>
<text x="604" y="189.5" font-size="12.5" style="fill:var(--color-text-muted)">run the steps, check</text>
<circle cx="590" cy="150" r="5" stroke-width="1.5" style="fill:var(--color-bg);stroke:var(--color-text-body)"/>
</svg></div>
<figcaption><span>Every environment needed its data set up and its steps checked by hand, and turning that into tests often took longer than the testing itself.</span></figcaption>
</figure>

Keeping E2E tests few is also what the usual advice says. Google's 2015 post [Just Say No to More End-to-End Tests](https://testing.googleblog.com/2015/04/just-say-no-to-more-end-to-end-tests.html), for example, argues that E2E tests give slow feedback, are flaky, and make failures hard to localize, so you should lean on unit tests, with a 70/20/10 split as a starting point. Martin Fowler's explanation of the [test pyramid](https://martinfowler.com/bliki/TestPyramid.html) is more careful about it: broad tests are usually more expensive, slower, and more brittle, but if those drawbacks go away, the balance can change.

As I read them, both arguments come down mostly to cost. In my case, most of that cost was human time: working out what to test, preparing the data, repeating the steps in each environment, checking the results. Slow feedback and hard-to-localize failures haven't gone away. What I could change was how much of my own time each round took, without skipping the part where I check the results myself.

## How I automated my E2E testing

When it comes to delivering software, I really like Simon Willison's post [Your job is to deliver code you have proven to work](https://simonwillison.net/2025/Dec/18/code-proven-to-work/). Its argument is that delivering code means delivering proof that it works. I wanted the same from the agents. A final message saying everything passed wasn't enough. I needed evidence I could check myself. So I built the automation in a way that shows, at every step, what it was trying to do and what happened, which also lets me step in at any point. And since the point of automating was to save my time, checking had to be fast too.

<figure>
<div class="fig-head"><div class="fig-title">Agents do the work, I check the evidence</div><div class="fig-sub">Planning, writing, and running E2E tests for one ticket</div></div>
<div class="fig-draw"><svg id="wf" viewBox="0 0 840 372" role="img" aria-label="How my automated E2E testing works: agents write a plan, implement the tests, and run them; a subagent reviews the plan, and a subagent and agents on other LLMs check the run log; I review the plan, help when a step is stuck, and read the final log, and my corrections go back into the skills."><style>#wf text{font-family:var(--font-body)}#wf .mono{font-family:var(--font-mono)}</style>
<path d="M100.182 46 L243 46" fill="none" stroke-width="1" stroke-linejoin="round" style="stroke:var(--color-text-muted)"/>
<path d="M239.0 49.5 L243 46 L239.0 42.5" fill="none" stroke-width="1" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(--color-text-muted)"/>
<path d="M346.146 46 L448 46" fill="none" stroke-width="1" stroke-linejoin="round" style="stroke:var(--color-text-muted)"/>
<path d="M444.0 49.5 L448 46 L444.0 42.5" fill="none" stroke-width="1" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(--color-text-muted)"/>
<path d="M48 97.5 L48 138" fill="none" stroke-width="1" stroke-linejoin="round" style="stroke:var(--color-text-muted)"/>
<path d="M44.5 134.0 L48 138 L51.5 134.0" fill="none" stroke-width="1" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(--color-text-muted)"/>
<path d="M506.766 46 L663 46 L663 138" fill="none" stroke-width="1" stroke-linejoin="round" style="stroke:var(--color-text-muted)"/>
<path d="M659.5 134.0 L663 138 L666.5 134.0" fill="none" stroke-width="1" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(--color-text-muted)"/>
<path d="M48 184 L48 262" fill="none" stroke-width="1" stroke-linejoin="round" style="stroke:var(--color-text-muted)"/>
<path d="M44.5 258.0 L48 262 L51.5 258.0" fill="none" stroke-width="1" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(--color-text-muted)"/>
<path d="M51.5 188.0 L48 184 L44.5 188.0" fill="none" stroke-width="1" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(--color-text-muted)"/>
<path d="M458 97.5 L458 262" fill="none" stroke-width="1" stroke-linejoin="round" stroke-dasharray="3 3" style="stroke:var(--color-text-muted)"/>
<path d="M454.5 258.0 L458 262 L461.5 258.0" fill="none" stroke-width="1" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(--color-text-muted)"/>
<path d="M461.5 101.5 L458 97.5 L454.5 101.5" fill="none" stroke-width="1" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(--color-text-muted)"/>
<path d="M663 201.5 L663 262" fill="none" stroke-width="1" stroke-linejoin="round" style="stroke:var(--color-text-muted)"/>
<path d="M659.5 258.0 L663 262 L666.5 258.0" fill="none" stroke-width="1" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(--color-text-muted)"/>
<path d="M663 286 L663 356 L12 356 L12 46 L38 46" fill="none" stroke-width="1" stroke-linejoin="round" stroke-dasharray="3 3" style="stroke:var(--color-text-muted)"/>
<path d="M34.0 49.5 L38 46 L34.0 42.5" fill="none" stroke-width="1" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(--color-text-muted)"/>
<text x="62" y="22" font-size="12" font-weight="500" class="mono" letter-spacing="0.08em" style="fill:var(--color-text-secondary)">AGENTS</text>
<text x="62" y="126" font-size="12" font-weight="500" class="mono" letter-spacing="0.08em" style="fill:var(--color-text-secondary)">REVIEW</text>
<text x="62" y="250" font-size="12" font-weight="500" class="mono" letter-spacing="0.08em" style="fill:var(--color-text-secondary)">ME</text>
<text x="62" y="50.5" font-size="14" font-weight="500" style="fill:var(--color-text)">Plan</text>
<text x="62" y="68" font-size="12.5" style="fill:var(--color-text-muted)">scenario, data state</text>
<text x="62" y="85.5" font-size="12.5" style="fill:var(--color-text-muted)">what counts as success</text>
<circle cx="48" cy="46" r="5.5" stroke-width="2" style="fill:var(--color-text-body);stroke:var(--color-bg)"/>
<text x="267" y="50.5" font-size="14" font-weight="500" style="fill:var(--color-text)">Implement</text>
<text x="267" y="68" font-size="12.5" style="fill:var(--color-text-muted)">test cases, reused</text>
<text x="267" y="85.5" font-size="12.5" style="fill:var(--color-text-muted)">on each server</text>
<circle cx="253" cy="46" r="5.5" stroke-width="2" style="fill:var(--color-text-body);stroke:var(--color-bg)"/>
<text x="472" y="50.5" font-size="14" font-weight="500" style="fill:var(--color-text)">Run</text>
<text x="472" y="68" font-size="12.5" style="fill:var(--color-text-muted)">reviewer splits steps</text>
<text x="472" y="85.5" font-size="12.5" style="fill:var(--color-text-muted)">tester runs them</text>
<circle cx="458" cy="46" r="5.5" stroke-width="2" style="fill:var(--color-text-body);stroke:var(--color-bg)"/>
<text x="62" y="154.5" font-size="14" font-weight="500" style="fill:var(--color-text)">Subagent</text>
<text x="62" y="172" font-size="12.5" style="fill:var(--color-text-muted)">reviews the plan</text>
<circle cx="48" cy="150" r="5.5" stroke-width="2" style="fill:var(--color-text-body);stroke:var(--color-bg)"/>
<text x="677" y="154.5" font-size="14" font-weight="500" style="fill:var(--color-text)">Cross-check</text>
<text x="677" y="172" font-size="12.5" style="fill:var(--color-text-muted)">a subagent and agents</text>
<text x="677" y="189.5" font-size="12.5" style="fill:var(--color-text-muted)">on other LLMs</text>
<circle cx="663" cy="150" r="5.5" stroke-width="2" style="fill:var(--color-text-body);stroke:var(--color-bg)"/>
<text x="584.883" y="39" text-anchor="middle" font-size="13" style="fill:var(--color-text-secondary)">run log</text>
<text x="62" y="278.5" font-size="14" font-weight="500" style="fill:var(--color-text)">Review the plan</text>
<text x="62" y="296" font-size="12.5" style="fill:var(--color-text-muted)">before any code</text>
<text x="62" y="313.5" font-size="12.5" style="fill:var(--color-text-muted)">happy and error paths</text>
<circle cx="48" cy="274" r="5" stroke-width="1.5" style="fill:var(--color-bg);stroke:var(--color-text-body)"/>
<text x="472" y="278.5" font-size="14" font-weight="500" style="fill:var(--color-text)">Help when stuck</text>
<text x="472" y="296" font-size="12.5" style="fill:var(--color-text-muted)">the agent asks instead</text>
<text x="472" y="313.5" font-size="12.5" style="fill:var(--color-text-muted)">of inventing workarounds</text>
<circle cx="458" cy="274" r="5" stroke-width="1.5" style="fill:var(--color-bg);stroke:var(--color-text-body)"/>
<text x="677" y="278.5" font-size="14" font-weight="500" style="fill:var(--color-text)">Read the final log</text>
<text x="677" y="296" font-size="12.5" style="fill:var(--color-text-muted)">requests, responses,</text>
<text x="677" y="313.5" font-size="12.5" style="fill:var(--color-text-muted)">assertions</text>
<circle cx="663" cy="274" r="5" stroke-width="1.5" style="fill:var(--color-bg);stroke:var(--color-accent)"/>
<text x="62" y="216.5" font-size="13" style="fill:var(--color-text-secondary)">plan file</text>
<text x="472" y="184.25" font-size="13" style="fill:var(--color-text-secondary)">asks</text>
<text x="677" y="236.25" font-size="13" style="fill:var(--color-text-secondary)">flagged log</text>
<text x="337.5" y="349" text-anchor="middle" font-size="13" style="fill:var(--color-text-secondary)">corrections go back into the skills</text>
</svg></div>
<figcaption><span>I review the plan before any code and read the log of the final run; what I correct goes back into the skills.</span></figcaption>
</figure>

In practice, that proof comes from two things: a plan I review before any test code is written, and a log of every run. Before either reaches me, a subagent has already reviewed it. Both come out of a set of skills I wrote for planning, executing, and reviewing E2E tests, drawing on how I used to test by hand. The process starts by gathering context from the code, Git history, Jira, and our wiki, then checks with me on what I want and clarifies open questions. Then it writes a plan: for each case, what it tests, why, the user's scenario, what data state it needs, and what counts as success. It also lists prerequisite checks, like verifying the seed data or depending on an earlier test, and cleanup so the test doesn't interfere with later ones.

Writing the plan down for review has a side effect: it pins down which path the test must take. Slack's [agentic testing experiments](https://slack.engineering/agentic-testing-where-agents-fit-in-the-e2e-testing-stack/) show why that matters: in most runs, the agents reached the same goal by a different route. That flexibility helps during exploration, but if the bug is on one particular path, a run that reaches the goal by another route hasn't tested it. The plan fixes the path, and execution is checked against it.

Once the plan is approved, the agent writes the test cases, and those same tests later run on my branch, the integration branch, and the release candidate. When they run, each test has a reviewer agent and a test agent: the reviewer breaks the work into small steps with preconditions, actions, assertions, and cleanup, and the test agent carries them out. The main session hands specific tests to subagents with separate contexts. Entry points stay as close to the user as the change allows. For a backend change with an unchanged interface, I generally test the API directly. When user interaction is involved, the agent operates the browser through Chrome DevTools MCP.

To show that the plan was followed, every run keeps a log of the raw API requests, responses, and assertions. At first I added it only for my own convenience, so I could see what happened, ask the agent to explain a step midway, or check it on my own. I didn't expect the same log to work just as well for other agents. Now, before I look at a result, agents running on different LLMs cross-check the evidence, so by the time I read the log, the obvious problems are already flagged.

Being able to step in also changes what the agent should do when it gets stuck. When a step in the plan can't proceed, I want it to stop and ask instead of improvising. Left alone, it has invented strange workarounds for problems a person could solve in seconds: with Chrome MCP already configured, it tried to generate credentials on its own and call the API with curl. With the plan and the logs in place, whoever steps in knows where to resume.

## How the skills keep improving

Three kinds of documents keep changing as I use this setup. The codebase has its own documentation, organized by feature, which gives the agents context about the code. Each skill has its instructions (`SKILL.md`), and reference documents (`references/*.md`) the agent reads only when a task needs them.

The codebase documentation mostly builds up during the work. The agents rely on it for context, so they're the ones who notice when it falls short: it doesn't get them up to speed quickly, something in it is wrong, or it leaves out enough that they end up reading the code. When that happens, they update the documentation as part of the ticket and write it back to the repository.

The rest comes from stepping in. When an agent is missing something I know, or gets a plan or a decision wrong, the fix goes into the skill, so I don't have to make the same correction on the next ticket. Where it goes depends on what it is. A short rule about how to test goes into `SKILL.md`. Missing context, or a fix that takes several steps, goes into the reference documents. For example, an agent once tried to rebuild the database locally because it didn't know it could connect to the one on my feature branch server, which already had the seed data it needed. That went into the reference documents. I found a fitting name for this in Every's guide: [compound engineering](https://every.to/guides/compound-engineering).

<figure>
<div class="fig-head"><div class="fig-title">Corrections go into the skill</div><div class="fig-sub">The documents that change as the agents and I work</div></div>
<div class="fig-draw"><svg id="sk" viewBox="0 0 840 270" role="img" aria-label="How the documents improve as the agents and I work together: agents read the codebase documentation and fill in what's missing; when they get stuck or get something wrong, I step in, and the correction goes into the skill, as reference documents for missing context or multi-step fixes, or as instructions for short rules on how to test; the next ticket reads them."><style>#sk text{font-family:var(--font-body)}#sk .mono{font-family:var(--font-mono)}</style>
<rect x="582" y="116" width="246" height="144" rx="2" style="fill:var(--color-bg-subtle)"/>
<path d="M149.956 46 L300 46" fill="none" stroke-width="1" stroke-linejoin="round" style="stroke:var(--color-text-muted)"/>
<path d="M296.0 49.5 L300 46 L296.0 42.5" fill="none" stroke-width="1" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(--color-text-muted)"/>
<path d="M154.0 42.5 L149.956 46 L154.0 49.5" fill="none" stroke-width="1" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(--color-text-muted)"/>
<path d="M310 80 L310 148" fill="none" stroke-width="1" stroke-linejoin="round" stroke-dasharray="3 3" style="stroke:var(--color-text-muted)"/>
<path d="M306.5 144.0 L310 148 L313.5 144.0" fill="none" stroke-width="1" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(--color-text-muted)"/>
<path d="M313.5 84.0 L310 80 L306.5 84.0" fill="none" stroke-width="1" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(--color-text-muted)"/>
<path d="M430.964 160 L590 160" fill="none" stroke-width="1" stroke-linejoin="round" style="stroke:var(--color-text-muted)"/>
<path d="M586.0 163.5 L590 160 L586.0 156.5" fill="none" stroke-width="1" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(--color-text-muted)"/>
<path d="M310 172 L310 222 L590 222" fill="none" stroke-width="1" stroke-linejoin="round" style="stroke:var(--color-text-muted)"/>
<path d="M586.0 225.5 L590 222 L586.0 218.5" fill="none" stroke-width="1" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(--color-text-muted)"/>
<path d="M720 110 L720 46 L377.414 46" fill="none" stroke-width="1" stroke-linejoin="round" style="stroke:var(--color-text-muted)"/>
<path d="M381.4 42.5 L377.414 46 L381.4 49.5" fill="none" stroke-width="1" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(--color-text-muted)"/>
<text x="44" y="50.5" font-size="14" font-weight="500" style="fill:var(--color-text)">Codebase docs</text>
<text x="44" y="68" font-size="12.5" style="fill:var(--color-text-muted)">organized by feature</text>
<circle cx="30" cy="46" r="5.5" stroke-width="2" style="fill:var(--color-text-body);stroke:var(--color-bg)"/>
<text x="324" y="50.5" font-size="14" font-weight="500" style="fill:var(--color-text)">Agents</text>
<text x="324" y="68" font-size="12.5" style="fill:var(--color-text-muted)">working on a ticket</text>
<circle cx="310" cy="46" r="5.5" stroke-width="2" style="fill:var(--color-text-body);stroke:var(--color-bg)"/>
<text x="224.978" y="39" text-anchor="middle" font-size="13" style="fill:var(--color-text-secondary)">read, update</text>
<text x="324" y="164.5" font-size="14" font-weight="500" style="fill:var(--color-text)">Me, stepping in</text>
<text x="324" y="182" font-size="12.5" style="fill:var(--color-text-muted)">knowledge they lack</text>
<text x="324" y="199.5" font-size="12.5" style="fill:var(--color-text-muted)">judgment corrections</text>
<circle cx="310" cy="160" r="5" stroke-width="1.5" style="fill:var(--color-bg);stroke:var(--color-accent)"/>
<text x="324" y="118.5" font-size="13" style="fill:var(--color-text-secondary)">stuck or wrong</text>
<text x="614" y="136" font-size="12" font-weight="500" class="mono" letter-spacing="0.08em" style="fill:var(--color-text-secondary)">SKILL</text>
<text x="614" y="164.5" font-size="14" font-weight="500" style="fill:var(--color-text)">Reference docs</text>
<text x="614" y="182" font-size="12.5" style="fill:var(--color-text-muted)">read only when needed</text>
<circle cx="600" cy="160" r="5.5" stroke-width="2" style="fill:var(--color-text-body);stroke:var(--color-bg)"/>
<text x="614" y="226.5" font-size="14" font-weight="500" style="fill:var(--color-text)">Instructions</text>
<text x="614" y="244" font-size="12.5" style="fill:var(--color-text-muted)">SKILL.md</text>
<circle cx="600" cy="222" r="5.5" stroke-width="2" style="fill:var(--color-text-body);stroke:var(--color-bg)"/>
<text x="510.482" y="153" text-anchor="middle" font-size="13" style="fill:var(--color-text-secondary)">context, steps</text>
<text x="495" y="215" text-anchor="middle" font-size="13" style="fill:var(--color-text-secondary)">short rule</text>
<text x="543.707" y="39" text-anchor="middle" font-size="13" style="fill:var(--color-text-secondary)">next ticket reads</text>
</svg></div>
<figcaption><span>The agents keep the codebase docs current; when I step in, the fix goes into the skill, so the next ticket starts with it.</span></figcaption>
</figure>

The half day of preparation I described earlier, repeated on three servers, now mostly goes to agents. By my rough estimate, the time I spend on E2E testing has dropped to about a tenth. A single ticket isn't much faster, but several can go through at once, each on its own branch server, while I do other work. What's left for me is reviewing the plan and reading the log of the final run, since the agents check the logs of the runs before it. It's a lot like listening to another engineer explain how they tested something. I'm checking whether the approach is sound and whether the evidence supports the conclusion.

## A few things that make the results easier to trust

Reading the log of the final run only helps if a pass in it means something. For a bug fix, each E2E test case states both what should happen with the fix and how it should fail without it. The test has to fail that way on the integration branch and pass on the fix branch, since a pass alone doesn't show it could see the bug. We used to skip this because it meant preparing everything twice, but now the same test cases carry over.

<figure>
<div class="fig-head"><div class="fig-title">One test case, four runs</div><div class="fig-sub">A bug-fix case, in the order its runs happen</div></div>
<div class="fig-draw"><svg id="rg" viewBox="0 0 840 172" role="img" aria-label="The order of runs for one bug-fix test case: the case states how it should fail without the fix and what should happen with it; it fails as expected on the integration branch before the fix, passes on the fix branch, passes again on the integration branch after merging, and passes on the release candidate."><style>#rg text{font-family:var(--font-body)}#rg .mono{font-family:var(--font-mono)}</style>
<path d="M30 48 L30 100" fill="none" stroke-width="1" stroke-linejoin="round" style="stroke:var(--color-text-muted)"/>
<path d="M26.5 96.0 L30 100 L33.5 96.0" fill="none" stroke-width="1" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(--color-text-muted)"/>
<path d="M125.372 112 L235 112" fill="none" stroke-width="1" stroke-linejoin="round" style="stroke:var(--color-text-muted)"/>
<path d="M231.0 115.5 L235 112 L231.0 108.5" fill="none" stroke-width="1" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(--color-text-muted)"/>
<path d="M334.758 112 L450 112" fill="none" stroke-width="1" stroke-linejoin="round" style="stroke:var(--color-text-muted)"/>
<path d="M446.0 115.5 L450 112 L446.0 108.5" fill="none" stroke-width="1" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(--color-text-muted)"/>
<path d="M555.372 112 L665 112" fill="none" stroke-width="1" stroke-linejoin="round" style="stroke:var(--color-text-muted)"/>
<path d="M661.0 115.5 L665 112 L661.0 108.5" fill="none" stroke-width="1" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(--color-text-muted)"/>
<text x="44" y="18.5" font-size="14" font-weight="500" style="fill:var(--color-text)">The test case</text>
<text x="44" y="36" font-size="12.5" style="fill:var(--color-text-muted)">how it fails without the fix, what happens with it</text>
<circle cx="30" cy="14" r="5.5" stroke-width="2" style="fill:var(--color-text-body);stroke:var(--color-bg)"/>
<text x="44" y="116.5" font-size="14" font-weight="500" style="fill:var(--color-text)">Integration</text>
<text x="44" y="134" font-size="12.5" style="fill:var(--color-text-muted)">before the fix</text>
<text x="44" y="151.5" font-size="12.5" font-weight="500" style="fill:var(--color-text)">fails as expected</text>
<circle cx="30" cy="112" r="5.5" stroke-width="2" style="fill:var(--color-accent);stroke:var(--color-bg)"/>
<text x="259" y="116.5" font-size="14" font-weight="500" style="fill:var(--color-text)">Fix branch</text>
<text x="259" y="134" font-size="12.5" style="fill:var(--color-text-muted)">with the fix</text>
<text x="259" y="151.5" font-size="12.5" font-weight="500" style="fill:var(--color-text)">passes</text>
<circle cx="245" cy="112" r="5.5" stroke-width="2" style="fill:var(--color-text-body);stroke:var(--color-bg)"/>
<text x="474" y="116.5" font-size="14" font-weight="500" style="fill:var(--color-text)">Integration</text>
<text x="474" y="134" font-size="12.5" style="fill:var(--color-text-muted)">after merging</text>
<text x="474" y="151.5" font-size="12.5" font-weight="500" style="fill:var(--color-text)">passes</text>
<circle cx="460" cy="112" r="5.5" stroke-width="2" style="fill:var(--color-text-body);stroke:var(--color-bg)"/>
<text x="689" y="116.5" font-size="14" font-weight="500" style="fill:var(--color-text)">Release candidate</text>
<text x="689" y="134" font-size="12.5" style="fill:var(--color-text-muted)">everything merged</text>
<text x="689" y="151.5" font-size="12.5" font-weight="500" style="fill:var(--color-text)">passes</text>
<circle cx="675" cy="112" r="5.5" stroke-width="2" style="fill:var(--color-text-body);stroke:var(--color-bg)"/>
<text x="180.186" y="105" text-anchor="middle" font-size="13" style="fill:var(--color-text-secondary)">then</text>
<text x="392.379" y="105" text-anchor="middle" font-size="13" style="fill:var(--color-text-secondary)">merge</text>
<text x="610.186" y="105" text-anchor="middle" font-size="13" style="fill:var(--color-text-secondary)">release</text>
</svg></div>
<figcaption><span>The case has to fail on the integration branch and pass on the fix branch, since a pass alone doesn't show it could see the bug.</span></figcaption>
</figure>

For operations that change stored data, the tests look at the database. The API response only tells me what the system says happened. The database shows what did happen, and the two can disagree: the API itself may be wrong, or a cache that wasn't cleared can make the response look right when the data isn't. So each test checks that the database reached the state described in the plan. This reminds me of an example in Anthropic's [guide to agent evals](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents): a flight-booking agent might say "Your flight has been booked," but the outcome is whether a reservation exists in the database.

Also, checking the end state only means something if the data started where the plan expected, so each test looks after the data it touches. Before a case runs, it checks that the data it needs is in the expected state and restores it if an earlier test changed it. Afterward, it cleans up what it created, so one test's leftovers can't make the next one fail.

## Deciding what to keep

Each ticket now produces far more test cases than before, and only some of them end up in the regression suite. To decide which ones, I go by a few rules of thumb:

- Could the problem come back, and how much would it hurt if it did? Code that changes often is more likely to break again, and a rare problem can still be worth a test if the damage would be serious.
- Would a smaller test have caught the original bug? If it came from components working together, a unit test would leave out exactly the part that broke, so it stays E2E. Otherwise a unit or integration test is often enough.
- Is it worth the cost of keeping it around? Data that's hard to set up reliably, interference with other tests, or failures that are hard to track down all count against it.

The tests that do stay run as plain test code, and the agents are only involved while a ticket is being tested. I've only estimated the difference roughly and never measured it, but Slack's [experiments](https://slack.engineering/agentic-testing-where-agents-fit-in-the-e2e-testing-stack/) put numbers on it: an agent-driven run cost roughly $15 to $30 and took 5 to 11 minutes depending on the setup, while the generated scripts ran in about 32 and 45 seconds. Slack's takeaway was to keep deterministic tests in CI and use agents for exploration and debugging.

How many tests to keep is part of an old question: how much testing is enough. I don't aim for a coverage number. Fowler's [Test Coverage](https://martinfowler.com/bliki/TestCoverage.html) treats coverage as a way to find untested code, not as a measure of test quality. What it looks at instead is whether bugs escape to production and whether people can change the code with confidence. Google's [How Much Testing Is Enough?](https://testing.googleblog.com/2021/06/how-much-testing-is-enough.html) answers that it depends on the type of software, its purpose, and its audience. For me, it comes down to whether I'm confident in what we're delivering, and I still get that confidence from knowing the system and from experience, as I did before AI.

## Changes that cross systems

Within a single system, automated E2E testing is now routine for me. One direction I'm interested in next is changes that cross systems. A change can look fine in its own service and still break something a downstream service depends on. An E2E test across systems can catch that, though a contract test between the two services is often enough. Either way, the agents need to know how the systems work together and where each one's responsibilities end, and that knowledge has to stay accurate as the code in every system changes. Within one system, that knowledge lives in the codebase documentation and the skills' reference documents, which build up during the work and get corrected when I step in. For knowledge that spans systems, one idea is to have the agents work out a way to make sure it's correct and keep it current.

I haven't tried any of this across systems yet. So far I've been reading about how other teams handle parts of it:

- Uber's [BITS](https://www.uber.com/us/en/blog/shifting-e2e-testing-left/) indexes the traces of test runs, linking each test to the services and endpoints it touched, and a more recent [Uber post](https://www.uber.com/us/en/blog/automated-dependency-analysis/) infers dependencies between services, and whether each one is hard or soft, from request-level failure data in production. Both show what runs between systems, though not the paths nothing has exercised or why the systems were built to work that way.
- Nubank [replaced its end-to-end test suite](https://building.nu.com/why-we-killed-our-end-to-end-test-suite/) with contract tests built from the schemas its services already declared, after finding that schema violations were the most frequent kind of bug the suite caught. The post notes that contract tests catch structural incompatibilities but aren't good at testing behavior, and Nubank kept acceptance tests for critical business flows.
- Shopify's [Under the River](https://shopify.engineering/under-the-river) describes River, an AI agent that works in the company's Slack. Shopify keeps everything it ships in one repository, which also holds skills, runbooks, and `AGENTS.md` files, and notes that agents can't see across a fragmented one. When someone solves a problem with River, they leave something behind, such as a skill update or an `AGENTS.md` diff.
- Michael Nygard's [Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions), from 2011, is about recording why a system was built the way it is: "One of the hardest things to track during the life of a project is the motivation behind certain decisions." The records live in the project repository, and a reversed decision is kept but marked as superseded.

If I get to it, I'll write about how it goes.
