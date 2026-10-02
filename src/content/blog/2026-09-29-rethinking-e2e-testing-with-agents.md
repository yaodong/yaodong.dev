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
<svg viewBox="0 0 800 322" role="img" aria-label="Before automation, every change was tested by hand three times: on the feature branch server, again on the integration branch after merging, and again on the release-candidate server, with data set up and results checked at each stage." style="width:100%;height:auto;font-family:var(--font-mono)">
<defs><marker id="ms-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M1,1 L9,5 L1,9" style="fill:none;stroke:var(--color-text-muted);stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round"/></marker></defs>
<text x="44" y="52" text-anchor="start" style="fill:var(--color-text-muted);font-size:11px;font-weight:700">ENVIRONMENTS</text>
<text x="44" y="188" text-anchor="start" style="fill:var(--color-text-muted);font-size:11px;font-weight:700">ME</text>
<rect x="44" y="70" width="200" height="58" rx="8" style="fill:var(--color-bg-subtle)"/>
<text x="144" y="94" text-anchor="middle" style="fill:var(--color-text);font-size:15px;font-weight:700">feature branch</text>
<text x="144" y="113" text-anchor="middle" style="fill:var(--color-text-muted);font-size:10.5px;font-weight:400">one server per ticket</text>
<rect x="300" y="70" width="200" height="58" rx="8" style="fill:var(--color-bg-subtle)"/>
<text x="400" y="94" text-anchor="middle" style="fill:var(--color-text);font-size:15px;font-weight:700">integration branch</text>
<text x="400" y="113" text-anchor="middle" style="fill:var(--color-text-muted);font-size:10.5px;font-weight:400">everyone's changes</text>
<rect x="556" y="70" width="200" height="58" rx="8" style="fill:var(--color-bg-subtle)"/>
<text x="656" y="94" text-anchor="middle" style="fill:var(--color-text);font-size:15px;font-weight:700">release candidate</text>
<text x="656" y="113" text-anchor="middle" style="fill:var(--color-text-muted);font-size:10.5px;font-weight:400">read-only database</text>
<line x1="247" y1="99" x2="297" y2="99" style="stroke:var(--color-text-muted);stroke-width:1.4" marker-end="url(#ms-a)"/>
<text x="272" y="91" text-anchor="middle" style="fill:var(--color-text-muted);font-size:11.5px;font-weight:400">merge</text>
<line x1="503" y1="99" x2="553" y2="99" style="stroke:var(--color-text-muted);stroke-width:1.4" marker-end="url(#ms-a)"/>
<text x="528" y="91" text-anchor="middle" style="fill:var(--color-text-muted);font-size:11.5px;font-weight:400">release</text>
<rect x="44" y="206" width="200" height="92" rx="8" style="fill:var(--color-bg);stroke:var(--color-text);stroke-width:1.4"/>
<text x="144" y="230" text-anchor="middle" style="fill:var(--color-text);font-size:13.5px;font-weight:700">prepare and test</text>
<text x="58" y="251" text-anchor="start" style="fill:var(--color-text-muted);font-size:10.5px;font-weight:400">• work out what to test</text>
<text x="58" y="267" text-anchor="start" style="fill:var(--color-text-muted);font-size:10.5px;font-weight:400">• build fixtures, seed data</text>
<text x="58" y="283" text-anchor="start" style="fill:var(--color-text-muted);font-size:10.5px;font-weight:400">• run the steps, check</text>
<line x1="144" y1="132" x2="144" y2="202" style="stroke:var(--color-text-muted);stroke-width:1.4" marker-end="url(#ms-a)"/>
<rect x="300" y="206" width="200" height="92" rx="8" style="fill:var(--color-bg);stroke:var(--color-text);stroke-width:1.4"/>
<text x="400" y="230" text-anchor="middle" style="fill:var(--color-text);font-size:13.5px;font-weight:700">test again</text>
<text x="314" y="251" text-anchor="start" style="fill:var(--color-text-muted);font-size:10.5px;font-weight:400">• set up the data again</text>
<text x="314" y="267" text-anchor="start" style="fill:var(--color-text-muted);font-size:10.5px;font-weight:400">• run the steps, check</text>
<line x1="400" y1="132" x2="400" y2="202" style="stroke:var(--color-text-muted);stroke-width:1.4" marker-end="url(#ms-a)"/>
<rect x="556" y="206" width="200" height="92" rx="8" style="fill:var(--color-bg);stroke:var(--color-text);stroke-width:1.4"/>
<text x="656" y="230" text-anchor="middle" style="fill:var(--color-text);font-size:13.5px;font-weight:700">test again</text>
<text x="570" y="251" text-anchor="start" style="fill:var(--color-text-muted);font-size:10.5px;font-weight:400">• set up state via the API</text>
<text x="570" y="267" text-anchor="start" style="fill:var(--color-text-muted);font-size:10.5px;font-weight:400">• run the steps, check</text>
<line x1="656" y1="132" x2="656" y2="202" style="stroke:var(--color-text-muted);stroke-width:1.4" marker-end="url(#ms-a)"/>
</svg>
</figure>

Keeping E2E tests few is also what the usual advice says. Google's 2015 post [Just Say No to More End-to-End Tests](https://testing.googleblog.com/2015/04/just-say-no-to-more-end-to-end-tests.html), for example, argues that E2E tests give slow feedback, are flaky, and make failures hard to localize, so you should lean on unit tests, with a 70/20/10 split as a starting point. Martin Fowler's explanation of the [test pyramid](https://martinfowler.com/bliki/TestPyramid.html) is more careful about it: broad tests are usually more expensive, slower, and more brittle, but if those drawbacks go away, the balance can change.

As I read them, both arguments come down mostly to cost. In my case, most of that cost was human time: working out what to test, preparing the data, repeating the steps in each environment, checking the results. Slow feedback and hard-to-localize failures haven't gone away. What I could change was how much of my own time each round took, without skipping the part where I check the results myself.

## How I automated my E2E testing

When it comes to delivering software, I really like Simon Willison's post [Your job is to deliver code you have proven to work](https://simonwillison.net/2025/Dec/18/code-proven-to-work/). Its argument is that delivering code means delivering proof that it works. I wanted the same from the agents. A final message saying everything passed wasn't enough. I needed evidence I could check myself. So I built the automation in a way that shows, at every step, what it was trying to do and what happened, which also lets me step in at any point. And since the point of automating was to save my time, checking had to be fast too.

<figure>
<svg viewBox="0 0 840 520" role="img" aria-label="How my automated E2E testing works: agents write a plan, implement the tests, and run them; a subagent reviews the plan and the tests, and agents on other LLMs cross-check the run log; I review the plan, help when a step is stuck, and read the final log, and my corrections go back into the skills." style="width:100%;height:auto;font-family:var(--font-mono)">
<defs><marker id="wf-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M1,1 L9,5 L1,9" style="fill:none;stroke:var(--color-text-muted);stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round"/></marker></defs>
<text x="44" y="52" text-anchor="start" style="fill:var(--color-text-muted);font-size:11px;font-weight:700">AGENTS</text>
<text x="44" y="192" text-anchor="start" style="fill:var(--color-text-muted);font-size:11px;font-weight:700">REVIEW</text>
<text x="44" y="342" text-anchor="start" style="fill:var(--color-text-muted);font-size:11px;font-weight:700">ME</text>
<rect x="44" y="70" width="176" height="76" rx="8" style="fill:var(--color-bg-subtle)"/>
<text x="132" y="94" text-anchor="middle" style="fill:var(--color-text);font-size:15px;font-weight:700">plan</text>
<text x="58" y="115" text-anchor="start" style="fill:var(--color-text-muted);font-size:10.5px;font-weight:400">• scenario, data state</text>
<text x="58" y="131" text-anchor="start" style="fill:var(--color-text-muted);font-size:10.5px;font-weight:400">• what counts as success</text>
<rect x="244" y="70" width="176" height="76" rx="8" style="fill:var(--color-bg-subtle)"/>
<text x="332" y="94" text-anchor="middle" style="fill:var(--color-text);font-size:15px;font-weight:700">implement</text>
<text x="258" y="115" text-anchor="start" style="fill:var(--color-text-muted);font-size:10.5px;font-weight:400">• test cases</text>
<text x="258" y="131" text-anchor="start" style="fill:var(--color-text-muted);font-size:10.5px;font-weight:400">• reused on each server</text>
<rect x="444" y="70" width="176" height="76" rx="8" style="fill:var(--color-bg-subtle)"/>
<text x="532" y="94" text-anchor="middle" style="fill:var(--color-text);font-size:15px;font-weight:700">run</text>
<text x="458" y="115" text-anchor="start" style="fill:var(--color-text-muted);font-size:10.5px;font-weight:400">• reviewer splits steps</text>
<text x="458" y="131" text-anchor="start" style="fill:var(--color-text-muted);font-size:10.5px;font-weight:400">• tester runs them</text>
<line x1="223" y1="108" x2="241" y2="108" style="stroke:var(--color-text-muted);stroke-width:1.4" marker-end="url(#wf-a)"/>
<line x1="423" y1="108" x2="441" y2="108" style="stroke:var(--color-text-muted);stroke-width:1.4" marker-end="url(#wf-a)"/>
<rect x="44" y="210" width="176" height="60" rx="8" style="fill:var(--color-bg-subtle)"/>
<text x="132" y="234" text-anchor="middle" style="fill:var(--color-text);font-size:15px;font-weight:700">subagent</text>
<text x="132" y="253" text-anchor="middle" style="fill:var(--color-text-muted);font-size:10.5px;font-weight:400">reviews the plan</text>
<rect x="244" y="210" width="176" height="60" rx="8" style="fill:var(--color-bg-subtle)"/>
<text x="332" y="234" text-anchor="middle" style="fill:var(--color-text);font-size:15px;font-weight:700">subagent</text>
<text x="332" y="253" text-anchor="middle" style="fill:var(--color-text-muted);font-size:10.5px;font-weight:400">reviews the tests</text>
<rect x="644" y="210" width="176" height="60" rx="8" style="fill:var(--color-bg-subtle)"/>
<text x="732" y="234" text-anchor="middle" style="fill:var(--color-text);font-size:15px;font-weight:700">cross-check</text>
<text x="732" y="253" text-anchor="middle" style="fill:var(--color-text-muted);font-size:10.5px;font-weight:400">other LLMs</text>
<line x1="132" y1="150" x2="132" y2="206" style="stroke:var(--color-text-muted);stroke-width:1.4" marker-end="url(#wf-a)"/>
<line x1="332" y1="150" x2="332" y2="206" style="stroke:var(--color-text-muted);stroke-width:1.4" marker-end="url(#wf-a)"/>
<path d="M623,108.0 H732.0 V206" style="fill:none;stroke:var(--color-text-muted);stroke-width:1.4" marker-end="url(#wf-a)"/>
<text x="676" y="100" text-anchor="middle" style="fill:var(--color-text-muted);font-size:11.5px;font-weight:400">run log</text>
<rect x="44" y="360" width="176" height="76" rx="8" style="fill:var(--color-bg);stroke:var(--color-text);stroke-width:1.4"/>
<text x="132" y="384" text-anchor="middle" style="fill:var(--color-text);font-size:13.5px;font-weight:700">review the plan</text>
<text x="58" y="405" text-anchor="start" style="fill:var(--color-text-muted);font-size:10.5px;font-weight:400">• before any code</text>
<text x="58" y="421" text-anchor="start" style="fill:var(--color-text-muted);font-size:10.5px;font-weight:400">• happy + error paths</text>
<rect x="444" y="360" width="176" height="76" rx="8" style="fill:var(--color-bg);stroke:var(--color-text);stroke-width:1.4"/>
<text x="532" y="384" text-anchor="middle" style="fill:var(--color-text);font-size:13.5px;font-weight:700">help when stuck</text>
<text x="458" y="405" text-anchor="start" style="fill:var(--color-text-muted);font-size:10.5px;font-weight:400">• agent asks</text>
<text x="458" y="421" text-anchor="start" style="fill:var(--color-text-muted);font-size:10.5px;font-weight:400">• instead of workarounds</text>
<rect x="644" y="360" width="176" height="76" rx="8" style="fill:var(--color-bg);stroke:var(--color-text);stroke-width:1.4"/>
<text x="732" y="384" text-anchor="middle" style="fill:var(--color-text);font-size:13.5px;font-weight:700">read the final log</text>
<text x="658" y="405" text-anchor="start" style="fill:var(--color-text-muted);font-size:10.5px;font-weight:400">• requests, responses</text>
<text x="658" y="421" text-anchor="start" style="fill:var(--color-text-muted);font-size:10.5px;font-weight:400">• a colleague explaining</text>
<line x1="132" y1="274" x2="132" y2="356" style="stroke:var(--color-text-muted);stroke-width:1.4" marker-start="url(#wf-a)" marker-end="url(#wf-a)"/>
<text x="140" y="319" text-anchor="start" style="fill:var(--color-text-muted);font-size:11.5px;font-weight:400">plan file</text>
<line x1="532" y1="150" x2="532" y2="356" style="stroke:var(--color-text-muted);stroke-width:1.4;stroke-dasharray:4 5" marker-start="url(#wf-a)" marker-end="url(#wf-a)"/>
<text x="540" y="257" text-anchor="start" style="fill:var(--color-text-muted);font-size:11.5px;font-weight:400">asks</text>
<line x1="732" y1="274" x2="732" y2="356" style="stroke:var(--color-text-muted);stroke-width:1.4" marker-end="url(#wf-a)"/>
<text x="740" y="319" text-anchor="start" style="fill:var(--color-text-muted);font-size:11.5px;font-weight:400">flagged log</text>
<path d="M732.0,440 V480 H16 V108.0 H41" style="fill:none;stroke:var(--color-text-muted);stroke-width:1.4;stroke-dasharray:4 5" marker-end="url(#wf-a)"/>
<text x="432" y="500" text-anchor="middle" style="fill:var(--color-text-muted);font-size:12px;font-weight:400">corrections go back into the skills and their references</text>
</svg>
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
<svg viewBox="0 0 840 380" role="img" aria-label="How the documents improve as the agents and I work together: agents read the codebase documentation and fill in what's missing; when they get stuck or get something wrong, I step in, and the correction goes into the skill, as reference documents for missing context or multi-step fixes, or as instructions for short rules on how to test; the next ticket reads them." style="width:100%;height:auto;font-family:var(--font-mono)">
<defs><marker id="sk-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M1,1 L9,5 L1,9" style="fill:none;stroke:var(--color-text-muted);stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round"/></marker></defs>
<rect x="44" y="60" width="180" height="76" rx="8" style="fill:var(--color-bg-subtle)"/>
<text x="134" y="84" text-anchor="middle" style="fill:var(--color-text);font-size:15px;font-weight:700">codebase docs</text>
<text x="134" y="103" text-anchor="middle" style="fill:var(--color-text-muted);font-size:10.5px;font-weight:400">organized by feature</text>
<rect x="334" y="60" width="180" height="76" rx="8" style="fill:var(--color-bg-subtle)"/>
<text x="424" y="84" text-anchor="middle" style="fill:var(--color-text);font-size:15px;font-weight:700">agents</text>
<text x="424" y="103" text-anchor="middle" style="fill:var(--color-text-muted);font-size:10.5px;font-weight:400">working on a ticket</text>
<line x1="227" y1="98" x2="331" y2="98" style="stroke:var(--color-text-muted);stroke-width:1.4" marker-start="url(#sk-a)" marker-end="url(#sk-a)"/>
<text x="279" y="90" text-anchor="middle" style="fill:var(--color-text-muted);font-size:11.5px;font-weight:400">read, update</text>
<rect x="334" y="220" width="180" height="110" rx="8" style="fill:var(--color-bg);stroke:var(--color-text);stroke-width:1.4"/>
<text x="424" y="244" text-anchor="middle" style="fill:var(--color-text);font-size:13.5px;font-weight:700">me, stepping in</text>
<text x="348" y="265" text-anchor="start" style="fill:var(--color-text-muted);font-size:10.5px;font-weight:400">• knowledge they lack</text>
<text x="348" y="281" text-anchor="start" style="fill:var(--color-text-muted);font-size:10.5px;font-weight:400">• judgment corrections</text>
<line x1="424" y1="140" x2="424" y2="216" style="stroke:var(--color-text-muted);stroke-width:1.4;stroke-dasharray:4 5" marker-start="url(#sk-a)" marker-end="url(#sk-a)"/>
<text x="432" y="182" text-anchor="start" style="fill:var(--color-text-muted);font-size:11.5px;font-weight:400">stuck or wrong</text>
<text x="624" y="202" text-anchor="start" style="fill:var(--color-text-muted);font-size:11px;font-weight:700">SKILL</text>
<rect x="624" y="220" width="180" height="60" rx="8" style="fill:var(--color-bg-subtle)"/>
<text x="714" y="244" text-anchor="middle" style="fill:var(--color-text);font-size:15px;font-weight:700">reference docs</text>
<text x="714" y="263" text-anchor="middle" style="fill:var(--color-text-muted);font-size:10.5px;font-weight:400">read only when needed</text>
<rect x="624" y="292" width="180" height="44" rx="8" style="fill:var(--color-bg-subtle)"/>
<text x="714" y="319.25" text-anchor="middle" style="fill:var(--color-text);font-size:15px;font-weight:700">instructions</text>
<line x1="517" y1="250" x2="621" y2="250" style="stroke:var(--color-text-muted);stroke-width:1.4" marker-end="url(#sk-a)"/>
<text x="569" y="242" text-anchor="middle" style="fill:var(--color-text-muted);font-size:11.5px;font-weight:400">context, steps</text>
<line x1="517" y1="314" x2="621" y2="314" style="stroke:var(--color-text-muted);stroke-width:1.4" marker-end="url(#sk-a)"/>
<text x="569" y="306" text-anchor="middle" style="fill:var(--color-text-muted);font-size:11.5px;font-weight:400">short rule</text>
<path d="M714.0,216 V98.0 H517" style="fill:none;stroke:var(--color-text-muted);stroke-width:1.4;stroke-dasharray:4 5" marker-end="url(#sk-a)"/>
<text x="634" y="90" text-anchor="middle" style="fill:var(--color-text-muted);font-size:11.5px;font-weight:400">next ticket reads</text>
</svg>
</figure>

The half day of preparation I described earlier, repeated on three servers, now mostly goes to agents. By my rough estimate, the time I spend on E2E testing has dropped to about a tenth. A single ticket isn't much faster, but several can go through at once, each on its own branch server, while I do other work. What's left for me is reviewing the plan and reading the log of the final run, since the agents check the logs of the runs before it. It's a lot like listening to another engineer explain how they tested something. I'm checking whether the approach is sound and whether the evidence supports the conclusion.

## A few things that make the results easier to trust

Reading the log of the final run only helps if a pass in it means something. For a bug fix, each E2E test case states both what should happen with the fix and how it should fail without it. The test has to fail that way on the integration branch and pass on the fix branch, since a pass alone doesn't show it could see the bug. We used to skip this because it meant preparing everything twice, but now the same test cases carry over.

<figure>
<svg viewBox="0 0 920 236" role="img" aria-label="The order of runs for one bug-fix test case: the case states how it should fail without the fix and what should happen with it; it fails as expected on the integration branch before the fix, passes on the fix branch, passes again on the integration branch after merging, and passes on the release candidate." style="width:100%;height:auto;font-family:var(--font-mono)">
<defs><marker id="rg-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M1,1 L9,5 L1,9" style="fill:none;stroke:var(--color-text-muted);stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round"/></marker></defs>
<rect x="44" y="24" width="388" height="76" rx="8" style="fill:var(--color-bg-subtle)"/>
<text x="238" y="48" text-anchor="middle" style="fill:var(--color-text);font-size:15px;font-weight:700">the test case</text>
<text x="238" y="67" text-anchor="middle" style="fill:var(--color-text-muted);font-size:10.5px;font-weight:400">how it fails without the fix</text>
<text x="238" y="83" text-anchor="middle" style="fill:var(--color-text-muted);font-size:10.5px;font-weight:400">what happens with the fix</text>
<line x1="127" y1="104" x2="127" y2="136" style="stroke:var(--color-text-muted);stroke-width:1.4" marker-end="url(#rg-a)"/>
<rect x="44" y="140" width="166" height="80" rx="8" style="fill:var(--color-bg-subtle)"/>
<text x="127" y="164" text-anchor="middle" style="fill:var(--color-text);font-size:15px;font-weight:700">integration</text>
<text x="127" y="183" text-anchor="middle" style="fill:var(--color-text-muted);font-size:10.5px;font-weight:400">before the fix</text>
<text x="127" y="203" text-anchor="middle" style="fill:var(--color-text);font-size:11.0px;font-weight:700">fails as expected</text>
<rect x="266" y="140" width="166" height="80" rx="8" style="fill:var(--color-bg-subtle)"/>
<text x="349" y="164" text-anchor="middle" style="fill:var(--color-text);font-size:15px;font-weight:700">fix branch</text>
<text x="349" y="183" text-anchor="middle" style="fill:var(--color-text-muted);font-size:10.5px;font-weight:400">with the fix</text>
<text x="349" y="203" text-anchor="middle" style="fill:var(--color-text);font-size:11.0px;font-weight:700">passes</text>
<rect x="488" y="140" width="166" height="80" rx="8" style="fill:var(--color-bg-subtle)"/>
<text x="571" y="164" text-anchor="middle" style="fill:var(--color-text);font-size:15px;font-weight:700">integration</text>
<text x="571" y="183" text-anchor="middle" style="fill:var(--color-text-muted);font-size:10.5px;font-weight:400">after merging</text>
<text x="571" y="203" text-anchor="middle" style="fill:var(--color-text);font-size:11.0px;font-weight:700">passes</text>
<rect x="710" y="140" width="166" height="80" rx="8" style="fill:var(--color-bg-subtle)"/>
<text x="793" y="164" text-anchor="middle" style="fill:var(--color-text);font-size:15px;font-weight:700">release candidate</text>
<text x="793" y="183" text-anchor="middle" style="fill:var(--color-text-muted);font-size:10.5px;font-weight:400">everything merged</text>
<text x="793" y="203" text-anchor="middle" style="fill:var(--color-text);font-size:11.0px;font-weight:700">passes</text>
<line x1="213" y1="180" x2="263" y2="180" style="stroke:var(--color-text-muted);stroke-width:1.4" marker-end="url(#rg-a)"/>
<text x="238" y="172" text-anchor="middle" style="fill:var(--color-text-muted);font-size:11.5px;font-weight:400">then</text>
<line x1="435" y1="180" x2="485" y2="180" style="stroke:var(--color-text-muted);stroke-width:1.4" marker-end="url(#rg-a)"/>
<text x="460" y="172" text-anchor="middle" style="fill:var(--color-text-muted);font-size:11.5px;font-weight:400">merge</text>
<line x1="657" y1="180" x2="707" y2="180" style="stroke:var(--color-text-muted);stroke-width:1.4" marker-end="url(#rg-a)"/>
<text x="682" y="172" text-anchor="middle" style="fill:var(--color-text-muted);font-size:11.5px;font-weight:400">release</text>
</svg>
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
