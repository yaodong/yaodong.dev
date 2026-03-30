---
layout: post
category: journal
title: The Migration of the Harness
created_date: 2026-03-29T14:40:29.000Z
excerpt: >-
  The software process exists because building software is expensive and no one
  sees the whole picture. AI changed that calculus at every node but left the
  interfaces between them untouched. The harness has changed address, and in
  some cases, it has found entirely new owners.
image: /assets/images/og/2026-03-29-the-migration-of-harness.png
---

## A familiar scene

Every software engineer knows this rhythm. A product manager arrives with wireframes. Meetings are scheduled. Engineers ask clarifying questions, poke holes, push back. The wireframes are revised. More meetings. Eventually, a technical design document is drafted, debated, and finalized. Only then does anyone write code. And once the code is written, it enters a review queue, passes through QA, and, weeks after the original idea, reaches production.

This process is not accidental. It evolved over decades, shaped by a basic reality: building software is expensive, and the people building it can only hold so much in their heads at once. The product manager understands users but not system architecture. The engineer understands architecture but not market context. The process connecting them exists to bridge these gaps, to compensate for the fact that no single person can see the whole picture.

AI engineers have a name for this kind of structure: a harness.

## Why we built the harness

A harness, in the AI sense, is the scaffolding you place around an imperfectly reliable executor. Guardrails, validation layers, checkpoints. You build it not because the executor is useless, but because it is powerful and fallible at the same time.

The traditional software process works the same way. Each node in the pipeline is a control point, a place where someone checks that the work so far is sound before it moves forward.

It is worth asking what these control points actually do. Some bridge cognitive gaps: a design review validates feasibility, a code review catches logical errors. Others exist for institutional or social reasons: compliance, accountability, alignment, legitimacy. These functions respond to different constraints, and they will not all move the same way.

## The interfaces are breaking

AI has changed what a single person can do. A product manager with access to AI can generate a working prototype rather than drawing static wireframes. An engineer can explore user research, analyze feedback data, produce documentation, all without waiting for a specialist in each area. The boundaries between roles, once sharp, have started to blur.

In a controlled experiment by GitHub, developers using Copilot completed a coding task 55 percent faster than those without it.[^1] At the organizational level, Faros AI's study of over 10,000 developers found that teams with high AI adoption completed 21 percent more tasks and merged 98 percent more pull requests, but code review times increased by 91 percent.[^2]

Every node got faster, but the connections between them may not change at the same pace. And the friction is not linear. I run multiple AI agents in parallel using tmux and a set of custom tools. Code generation has scaled dramatically. But my team's process has not changed: the code still goes through Jenkins, the build is slow, and it often fails. Fixing a failing test means editing, committing, rebuilding, and waiting again. If another test breaks, the loop repeats. Code review is still manual. QA is still manual. The bottleneck is not just that the downstream pipe is narrower than the upstream flow. It is that the pipe contains cycles, and each cycle runs at the old speed.

The process feels slow now because it was built for a different tempo. AI changed the nodes but left the interfaces intact.

## Why you cannot simply remove them

The natural response is to strip away the process. If the interfaces are the bottleneck, get rid of them. Less oversight, fewer checkpoints, a leaner pipeline.

This is wrong, and the reasons are worth examining.

### The output is worse than it looks

AI output is less reliable than it appears. CodeRabbit's analysis of 470 open-source pull requests found that AI-generated code introduces 1.7 times more issues than human-written code, with security vulnerabilities increasing by roughly 2.7 times.[^3] Shipping AI-generated code without rigorous validation is not a streamlined workflow. It is negligence with extra steps. In my own experience, most AI-generated code has issues of some kind. And as models get smarter, the issues get subtler, harder to catch in review, and more likely to reach production unnoticed.

### The work did not disappear

The cognitive work that those interfaces carried did not vanish when individuals became more capable. It migrated.

In the traditional model, the harness lived between people. It was embedded in organizational structure: the handoff from PM to engineering, the pull request review, the QA gate, the release approval. Quality was a collective responsibility, distributed across roles and enforced through process.

In the AI-augmented model, much of that cognitive work moves inside the individual. The PM who once needed an engineer to assess feasibility now generates a prototype directly, but must judge its soundness alone. The engineer who once relied on a QA team to catch regressions now works with an AI that writes tests, but must determine whether those tests are meaningful.

This migration is not uniform. A randomized controlled trial by METR illustrates where the cost lands.[^4] Sixteen experienced open-source developers, averaging five years of experience on their projects, completed 246 tasks. With AI tools, they were 19 percent slower. Before the experiment, they predicted AI would speed them up by 24 percent. Afterward, they still believed it had. These developers were not failing to use AI. They were doing exactly what the new model demands: spending more time evaluating, testing, and reworking AI output than they saved by generating it. They were building the harness. It just cost more than working without AI.

If this pattern holds beyond the study, the implication for organizations is pointed: junior and mid-level engineers use AI to produce more output, and the verification cost flows upward to the senior engineers who can actually judge whether that output is sound. The harness does not distribute evenly. It concentrates on the people who can bear it.

### The work found new owners

There is a third kind of migration. AI does not only push the same work deeper into the same roles. It moves work across role boundaries entirely.

On a side project where I had no designer, I used AI to generate UI components. It worked, until I needed consistency across the product. The AI produced screens that each looked good on their own but belonged to different applications. So I built a design system: color tokens, typography scales, spacing rules, reusable components, all documented thoroughly enough that the AI could follow them. This was not a shortcut around design discipline. It was design discipline, carried by someone who was never a designer.

The same pattern appears elsewhere, and it runs in both directions. A product manager with AI can generate a prototype and discuss it directly with customers, collapsing the cycle of handing requirements to a designer, waiting for mockups, and cycling back through feedback. Meanwhile, designers are crossing into engineering: Jenny Wen, who leads design for Claude at Anthropic, describes spending a growing share of her time writing code, polishing implementations, and pairing directly with engineers, work that used to be entirely on the engineering side. Mocking and prototyping, once 60 to 70 percent of her day, has shrunk to 30 to 40 percent. The rest is implementation and collaboration. The boundaries dissolve in every direction, but the discipline of each role transfers with them.

So the process cannot simply be removed. The cognitive verification it carried has migrated inward. Work that once required specialists has migrated across role boundaries, carrying its discipline with it. The total weight of the harness has not decreased. It has redistributed, and in some cases, it has found entirely new owners.

## Redesigning the seams

This is the hard part. The old interfaces were load-bearing, but they were also shaped for a tempo that no longer exists. Keeping them unchanged wastes AI's capacity. Removing them loses what they carried. The only option is to rebuild them for the new pace.

Things need to change: how individuals work, and how organizations preserve what the old process used to generate for free.

### Evaluation: catching what slipped through

Each person working with AI needs their own harness. But "be more careful" is not a harness. The METR results suggest what happens without concrete structure: less experienced developers without structured verification are likely to skip that step entirely, especially once the first few AI outputs look good and checking starts to feel unnecessary. A functional personal harness prevents this by making verification automatic rather than discretionary: static analysis, sandboxed environments, evaluation suites, traceability that marks which code came from AI so reviewers know where to focus.

In practice, I often have AI generate three different approaches to the same problem, run each through the evaluation pipeline (type checks, linting, integration tests, a load test), eliminate the ones that fail, review and adjust the survivor, and write a short decision record explaining the choice. The key difference from the old process is not speed. It is that the evaluation exists as tooling, not as a mental note.

This is a new competency: the tooling itself, and the judgment to configure and interpret it. Organizations building AI code generation capabilities without building AI code evaluation capabilities in parallel will produce more output, but will not be able to tell whether that output is sound.

### Constraint: shaping the output before it arrives

Evaluation is only half of the personal harness. The other half is constraint: giving the AI a framework that makes its output consistent before you need to evaluate it. The design system I described earlier is one example. Architectural standards, naming conventions, and interface contracts serve the same function in code. They constrain the AI's output space so that what it generates is consistent by construction rather than by inspection.

Jenny Wen, who leads design for Claude at Anthropic, describes the same problem from the other side: she spends time pointing engineers to the design system because AI-generated code does not always pick it up on its own. The constraint framework has to exist before the AI runs, or the output drifts. The most effective personal harness is not just a filter after the fact. It is a set of rails laid before the work begins.

### Institutional knowledge needs new vessels

Traditional workflows produced institutional knowledge as a byproduct. Design documents recorded not just what was built, but why. Pull request discussions preserved architectural reasoning. Meeting notes captured tradeoffs considered and rejected.

When an individual, working with AI, moves from idea to implementation in an afternoon, the old process that would have generated these artifacts no longer runs. There is no design meeting to produce a design document, no pull request discussion to record architectural reasoning. The solution works, but the reasoning lives only in the person's head, or stays buried in a conversation log no one else will read. Six months later, someone will find working code with no record of the constraints it was designed around. They will see a rate limiter set to an oddly specific threshold, or a data pipeline that skips what looks like a useful enrichment step, and they will not know whether these were deliberate design choices or artifacts of how the AI generated the code. The old process would have left a trail: a comment in the PR, a sentence in the design doc, a Slack thread someone could search. The new process left working code and silence.

Architecture Decision Records, lightweight documents that capture a single decision, its context, and its rationale, fit naturally into a fast workflow because they are small. Some teams are experimenting with AI-assisted decision logs: after a session, the engineer asks the AI to summarize the key decisions and alternatives, then saves the summary as an artifact. Others are adding a "decision rationale" field in their ticketing systems.

These approaches share a principle: knowledge capture should be a lightweight byproduct of the work, not a separate phase. The old process generated knowledge artifacts because it was slow enough to produce them. The new process must generate them deliberately, because the speed no longer leaves room for them to emerge on their own.

## Conclusion

The AI industry is building harnesses for AI: guardrails, evaluation layers, validation pipelines.[^5] This is necessary work. But software engineering has always had a harness. It was called process: the design review, the code review, the QA gate, the release approval. That harness was built for a specific working tempo, and AI has changed the tempo.

The data points in different directions, but they converge on one thing: the bottleneck is not the AI, not the people, but the process that connects them.

The harness has always existed. It has changed address. In some cases, it moved inward: the same people now carry verification work that used to be distributed across a process. In other cases, it moved across: people who were never designers, never data scientists, never specialists of any kind now carry the disciplinary harness of those roles, because AI gave them access to capabilities that were previously gated by specialization. Both migrations are real. The first is a cost to manage. The second is a capability to develop. The process connecting enhanced individuals is now the constraint that needs engineering attention, not because the harness should be lighter, but because it needs to fit its new owners.

---

[^1]: GitHub, [Research: Quantifying GitHub Copilot's Impact on Developer Productivity and Happiness](https://github.blog/news-insights/research/research-quantifying-github-copilots-impact-on-developer-productivity-and-happiness/), 2022.
[^2]: Faros AI, [The AI Productivity Paradox](https://www.faros.ai/blog/ai-software-engineering), 2025.
[^3]: CodeRabbit, [State of AI vs Human Code Generation Report](https://www.coderabbit.ai/blog/state-of-ai-vs-human-code-generation-report), December 2025.
[^4]: METR, [Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/), July 2025.
[^5]: Anthropic Engineering, [Harness Design for Long-Running Application Development](https://www.anthropic.com/engineering/harness-design-long-running-apps), 2025.
