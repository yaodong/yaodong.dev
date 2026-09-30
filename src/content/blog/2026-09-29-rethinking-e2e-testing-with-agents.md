---
layout: post
title: Rethinking E2E Testing With Agents
created_date: 2026-09-29T00:00:00.000Z
excerpt: "With AI writing most of my code, the slow part became checking that it does what I meant. I've spent the past few months automating my E2E testing, and building it around my own review turned out to be what let me automate more of it."
image: /assets/images/og/2026-09-29-rethinking-e2e-testing-with-agents.png
---

Over the past few months, the bottleneck in my work has moved from writing code to verifying it. AI keeps making it easier to get a working implementation, but confirming that it does what I meant to deliver still takes a lot of my time. So I started automating testing, and the part that caught my attention most was end-to-end (E2E) testing.

Here's what I've found so far:

- With AI writing the code, what I need to verify has moved from code to behavior, and behavior is what E2E tests check.
- What kept our E2E tests few was mostly the human time they took, and most of that time can now go to agents.
- Building the automation around my own review let me automate more of it.
- Only some of the tests written for a ticket are worth keeping in the regression suite.

## Verifying what changes slowest

If verification is the bottleneck, the first question is where my verification effort should go.

AI now writes almost all my code. It proposes most of the approaches too; my job is catching its mistakes and choosing between its options. Trying another implementation has become cheap enough that a module may be rewritten from scratch next month, and tests coupled to its implementation details get replaced along with it. Time spent reviewing those tests buys less and less.

What changes slowest are the user stories. They describe what a user can do and what happens as a result, and they usually stay the same while the implementation underneath gets rewritten. Checking one usually means doing what the user would do: getting the data into the right state, going through the steps, and looking at what the system did at the end. That's what an E2E test does, and it's where more of my attention has gone. When I review an E2E test plan, I look at the happy path and the common error paths, then scan the concrete cases for anything unreasonable, asking myself what I'm actually delivering to the user.

Looking for tests that outlast the current code isn't new. Spotify's [2018 post on testing microservices](https://engineering.atspotify.com/2018/1/testing-of-microservices) describes how tests coupled to implementation details made internal changes hard, so they drew the boundary at the service, starting it with its database, feeding it realistic inputs, and checking its external behavior. I've been drawing the boundary further out, around the whole flow a user goes through.

Some people have taken this further. Ansh Nanda [posted](https://x.com/anshnanda/status/2103157336164683847) about removing all unit tests, since "the real regressions can be caught by a few high value E2E tests." I haven't gone that way. Stable business rules are a natural fit for unit tests. I still want unit tests to cover as much of the code as possible, and integration tests to cover the essential cases without exhaustively testing every combination. AI now does almost all the writing and reviewing of these tests, so they take very little of my attention.

## Why we used to write so few E2E tests

Our team's process has every feature or bug fix tested on a feature branch server after implementation. Before I automated my part of it, preparation alone could take half a day to a day: deciding what to test, building fixtures, getting the seed data into the right state. The database might already have a test customer, but before it can use the new feature, it needs a particular configuration. Understanding that configuration and setting it up is part of the test.

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

Google's 2015 post [Just Say No to More End-to-End Tests](https://testing.googleblog.com/2015/04/just-say-no-to-more-end-to-end-tests.html) argues against adding more: E2E tests give slow feedback, are flaky, and make failures hard to localize, so lean on unit tests, with a 70/20/10 split as a starting point. Martin Fowler's explanation of the [test pyramid](https://martinfowler.com/bliki/TestPyramid.html) is more conditional: broad tests are usually more expensive, slower, and more brittle, and if those drawbacks go away, the balance can change.

As I read them, both arguments come down mostly to cost. In my case, most of that cost was human time: working out what to test, preparing the data, repeating the steps in each environment, checking the results. Slow feedback and hard-to-localize failures haven't gone away. What I could change was how much of my own time each round took, without skipping the part where I check the results myself.

## How I automated my E2E testing

I built it around my own review. I didn't expect that to increase how much I could automate, but it did.

If the goal was saving my time, checking the agent's work had to get faster too. A final message saying everything passed wasn't enough. Simon Willison argues in [Your job is to deliver code you have proven to work](https://simonwillison.net/2025/Dec/18/code-proven-to-work/) that delivering code means delivering proof that it works; I wanted the same from the agents. For me to check quickly and step in at any point, every step had to show what it was trying to do and what actually happened. What I built for my own review turned out to be what the automation leans on most.

<figure>
<svg viewBox="0 0 840 410" role="img" aria-label="How my automated E2E testing works: agents write a plan, implement the tests, run them, and cross-check the logs; I review the plan, help when a step is stuck, and read the final log, and my corrections go back into the skills." style="width:100%;height:auto;font-family:var(--font-mono)">
<defs><marker id="wf-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M1,1 L9,5 L1,9" style="fill:none;stroke:var(--color-text-muted);stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round"/></marker></defs>
<text x="44" y="52" text-anchor="start" style="fill:var(--color-text-muted);font-size:11px;font-weight:700">AGENTS</text>
<text x="44" y="232" text-anchor="start" style="fill:var(--color-text-muted);font-size:11px;font-weight:700">ME</text>
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
<rect x="644" y="70" width="176" height="76" rx="8" style="fill:var(--color-bg-subtle)"/>
<text x="732" y="94" text-anchor="middle" style="fill:var(--color-text);font-size:15px;font-weight:700">cross-check</text>
<text x="658" y="115" text-anchor="start" style="fill:var(--color-text-muted);font-size:10.5px;font-weight:400">• other LLMs</text>
<text x="658" y="131" text-anchor="start" style="fill:var(--color-text-muted);font-size:10.5px;font-weight:400">• check the evidence</text>
<line x1="223" y1="108" x2="241" y2="108" style="stroke:var(--color-text-muted);stroke-width:1.4" marker-end="url(#wf-a)"/>
<line x1="423" y1="108" x2="441" y2="108" style="stroke:var(--color-text-muted);stroke-width:1.4" marker-end="url(#wf-a)"/>
<line x1="623" y1="108" x2="641" y2="108" style="stroke:var(--color-text-muted);stroke-width:1.4" marker-end="url(#wf-a)"/>
<rect x="44" y="250" width="176" height="76" rx="8" style="fill:var(--color-bg);stroke:var(--color-text);stroke-width:1.4"/>
<text x="132" y="274" text-anchor="middle" style="fill:var(--color-text);font-size:13.5px;font-weight:700">review the plan</text>
<text x="58" y="295" text-anchor="start" style="fill:var(--color-text-muted);font-size:10.5px;font-weight:400">• before any code</text>
<text x="58" y="311" text-anchor="start" style="fill:var(--color-text-muted);font-size:10.5px;font-weight:400">• happy + error paths</text>
<rect x="444" y="250" width="176" height="76" rx="8" style="fill:var(--color-bg);stroke:var(--color-text);stroke-width:1.4"/>
<text x="532" y="274" text-anchor="middle" style="fill:var(--color-text);font-size:13.5px;font-weight:700">help when stuck</text>
<text x="458" y="295" text-anchor="start" style="fill:var(--color-text-muted);font-size:10.5px;font-weight:400">• agent asks</text>
<text x="458" y="311" text-anchor="start" style="fill:var(--color-text-muted);font-size:10.5px;font-weight:400">• instead of workarounds</text>
<rect x="644" y="250" width="176" height="76" rx="8" style="fill:var(--color-bg);stroke:var(--color-text);stroke-width:1.4"/>
<text x="732" y="274" text-anchor="middle" style="fill:var(--color-text);font-size:13.5px;font-weight:700">read the final log</text>
<text x="658" y="295" text-anchor="start" style="fill:var(--color-text-muted);font-size:10.5px;font-weight:400">• requests, responses</text>
<text x="658" y="311" text-anchor="start" style="fill:var(--color-text-muted);font-size:10.5px;font-weight:400">• a colleague explaining</text>
<line x1="132" y1="150" x2="132" y2="246" style="stroke:var(--color-text-muted);stroke-width:1.4" marker-start="url(#wf-a)" marker-end="url(#wf-a)"/>
<text x="140" y="202" text-anchor="start" style="fill:var(--color-text-muted);font-size:11.5px;font-weight:400">plan file</text>
<line x1="532" y1="150" x2="532" y2="246" style="stroke:var(--color-text-muted);stroke-width:1.4;stroke-dasharray:4 5" marker-start="url(#wf-a)" marker-end="url(#wf-a)"/>
<text x="540" y="202" text-anchor="start" style="fill:var(--color-text-muted);font-size:11.5px;font-weight:400">asks</text>
<line x1="732" y1="150" x2="732" y2="246" style="stroke:var(--color-text-muted);stroke-width:1.4" marker-end="url(#wf-a)"/>
<text x="740" y="202" text-anchor="start" style="fill:var(--color-text-muted);font-size:11.5px;font-weight:400">run log</text>
<path d="M732.0,330 V370 H16 V108.0 H41" style="fill:none;stroke:var(--color-text-muted);stroke-width:1.4;stroke-dasharray:4 5" marker-end="url(#wf-a)"/>
<text x="432" y="390" text-anchor="middle" style="fill:var(--color-text-muted);font-size:12px;font-weight:400">corrections go back into the skills and their references</text>
</svg>
</figure>

I wrote a set of skills for planning, executing, and reviewing E2E tests, drawing on how I used to test by hand. The process starts by gathering context from the code, Git history, Jira, and our wiki, then checks with me on what I want and clarifies open questions. Then it writes a plan: for each case, what it tests, why, the user's scenario, what data state it needs, and what counts as success. It also lists prerequisite checks, like verifying the seed data or depending on an earlier test, and cleanup so the test doesn't interfere with later ones.

I review the plan before any test code is written. Writing it down for review has a side effect: it pins down which path the test must take. Slack's [agentic testing experiments](https://slack.engineering/agentic-testing-where-agents-fit-in-the-e2e-testing-stack/) found that in most runs, agents took a different route to reach the same goal. That flexibility helps during exploration, but if the bug is on one particular path, a run that reaches the goal by another route hasn't tested it. The plan fixes the path, and execution is checked against it.

Once the plan is approved, the agent writes the test cases, and those same tests later run on my branch, the integration branch, and the release candidate. When they run, each test has a reviewer agent and a test agent: the reviewer breaks the work into small steps with preconditions, actions, assertions, and cleanup, and the test agent carries them out. The main session hands specific tests to subagents with separate contexts. Entry points stay as close to the user as the change allows. For a backend change with an unchanged interface, I generally test the API directly; when user interaction is involved, the agent operates the browser through Chrome DevTools MCP.

To show that the plan was followed, every run keeps a log of the raw API requests, responses, and assertions. I added it for myself: to see what happened, to ask the agent to explain a step midway, or to check it on my own. The surprise was that the same material worked just as well for other agents. Now, before I look at a result, agents running on different LLMs cross-check the evidence, so by the time I read the log, the obvious problems are already flagged.

Being able to step in also changes what the agent should do when it gets stuck. When a step in the plan can't proceed, it should stop and ask rather than improvise. Left alone, it has invented strange workarounds for problems a person could solve in seconds: with Chrome MCP already configured, it tried to generate credentials on its own and call the API with curl. With the plan and the logs in place, whoever steps in knows where to resume.

## Keeping the automation improving

The skills, and the documents behind them, keep changing as I use them. The documents mostly grow out of the work: when a module's documentation isn't detailed enough for the ticket I'm working on, the agents fill it in as part of that work and write it back to the repository.

The rest comes from stepping in. When I find the agents missing something I know, it goes into the skills' reference documents. For example, an agent once tried to rebuild the database locally because it didn't know it could connect to the one on my feature branch server, which already had the seed data it needed.

Some corrections are about judgment rather than knowledge. Anthropic describes a similar case in its [application-development harness report](https://www.anthropic.com/engineering/harness-design-long-running-apps): its evaluator sometimes found a real problem and then decided it wasn't important enough to fail the work, so the author read the logs, found where the evaluator's judgment disagreed with theirs, and adjusted its instructions. I do the same with my skills. When an agent gets a plan or a judgment wrong, the fix goes into the skill, so I don't have to make the same correction on the next ticket. Every calls this [compound engineering](https://every.to/guides/compound-engineering): each piece of work should make the next one easier.

Put together, this changed where my time goes. The half day of preparation I described earlier, repeated on three servers, now mostly goes to agents. By my rough estimate, the time I personally spend on E2E testing has dropped to about a tenth. A single ticket isn't much faster, but several can go through this at once, each on its own branch server, while I do other work. Agents check the logs during intermediate iterations. What's left for me is reviewing the plan and reading the log of the final run, which is a lot like listening to another engineer explain how they tested something: is the approach sound, and does the evidence support the conclusion?

## A few things that make the results easier to trust

For a bug fix, each E2E test case states both what should happen with the fix and how it should fail without it. The test has to fail that way on the integration branch and pass on the fix branch, since a pass alone doesn't show it could see the bug. We used to skip this because it meant preparing everything twice, but now the same test cases carry over. Uber's [BITS](https://www.uber.com/us/en/blog/shifting-e2e-testing-left/) runs a similar baseline on main, though to tell new regressions from existing failures.

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

For operations that change stored data, the tests check that the database reached the state described in the plan, rather than trusting the API response. Checking only the response assumes the API itself is correct, and other things can make it look right when the data isn't, such as a cache that wasn't cleared. Anthropic's [guide to agent evals](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents) makes the same point with a flight-booking agent that says "Your flight has been booked," where what counts is whether a reservation actually exists in the database.

Each test looks after the data it touches. Before a case runs, it checks that the data it needs is in the expected state and restores it if an earlier test changed it. Afterward, it cleans up what it created, so one test's leftovers can't make the next one fail.

With all of this, each ticket produces far more verification than before, and I have to decide how much of it to keep.

## Deciding what to keep

Only some of the test cases written for a ticket end up in the regression suite. To decide which ones, I go by a few rules of thumb:

- Could the problem come back, and how much would it hurt if it did? Code that changes often is more likely to break again, and a rare problem can still be worth a test if the damage would be serious.
- Would a smaller test have caught the original bug? If it came from components working together, a unit test would leave out exactly the part that broke, so it stays E2E. Otherwise a unit or integration test is often enough.
- Then there's the cost of keeping it around. Data that's hard to set up reliably, interference with other tests, or failures that are hard to track down all count against it.

The tests that do stay run as plain test code, and the agents are only involved while a ticket is being tested. Slack reached a similar split in its experiments. An agent-driven run cost roughly $15 to $30 and took 5 to 11 minutes depending on the setup, while the generated scripts ran in about 32 and 45 seconds. Its conclusion is that deterministic tests belong in CI, with agents used for exploration and debugging.

All of this comes back to the old question of how much testing is enough. I don't aim for a coverage number. Fowler's [Test Coverage](https://martinfowler.com/bliki/TestCoverage.html) treats coverage as a way to find untested code rather than a measure of test quality, and looks instead at whether bugs escape to production and whether people can change the code with confidence. Google's [How Much Testing Is Enough?](https://testing.googleblog.com/2021/06/how-much-testing-is-enough.html) says the answer depends on the type of software, its purpose, and its audience. For me, it comes down to whether I'm confident in what we're delivering, and that still depends on knowing the system and on experience, as it did before AI.

## Next: testing across systems

Within a single system, automated E2E testing is now routine for me, so the next thing I want to work on is changes that cross systems. A change can look fine in its own service and still break something a downstream service depends on. To catch that, the agents need to know how the systems work together and where each one's responsibilities end, and that knowledge has to stay accurate as the code in every system changes. Within one system, it grows with the work and I correct it when I step in. For knowledge that spans systems, my plan is to have the agents work out a way to make sure it's correct and keep it current.

I'm only getting started, but I've been reading about how other teams handle parts of this:

- Spotify tests each service at its own boundary and aims for few or no tests that pass or fail based on another system's correctness, which it calls fragile.
- Uber's BITS indexes the traces of test runs, linking each test to the services and endpoints it touched, and a more recent [Uber post](https://www.uber.com/us/en/blog/automated-dependency-analysis/) infers dependencies between services, and whether each one is hard or soft, from request-level failure data in production. Both show what actually runs between systems, though not the paths nothing has exercised or why the systems were built to work that way.
- [Pact](https://docs.pact.io/getting_started/how_pact_works) has the tests of the service making the calls record example requests and the responses they expect. The service receiving those calls replays them against its real code, so a broken agreement shows up as a failing test.
- Qodo's [cross-repository review](https://docs.qodo.ai/governance/cross-repo-code-review) discovers relationships between repositories and keeps them current as later pull requests come in. Its documentation notes that obsolete relationships aren't removed automatically.

---

Putting it all together, I used to write few E2E tests because each one took half a day to prepare and had to be repeated in three environments. Most of that work now goes to agents, so more of my testing happens at the level of what the user actually does, and the lower-level tests are mostly AI's job. What I didn't expect is that keeping myself in the loop is what let me automate more of it. Deciding how much testing is enough still comes down to experience, same as before. I haven't tried any of this across systems yet. That's next, and I'll write about how it goes.
