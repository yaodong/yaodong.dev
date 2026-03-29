---
layout: post
category: journal
title: The Migration of the Harness
created_date: 2026-03-29T14:40:29.000Z
excerpt: >-
  The software process exists because building software is expensive and no one
  sees the whole picture. AI changed that calculus at every node but left the
  interfaces between them untouched. The harness has changed address.
image: /assets/images/og/2026-03-29-the-migration-of-harness.png
---

## A familiar scene

Every software engineer knows this rhythm. A product manager arrives with wireframes. Meetings are scheduled. Engineers ask clarifying questions, poke holes, push back. The wireframes are revised. More meetings. Eventually, a technical design document is drafted, debated, and finalized. Only then does anyone write code. And once the code is written, it enters a review queue, passes through QA, and, weeks after the original idea, reaches production.

This process is not accidental. It evolved over decades, shaped by a basic reality: building software is expensive, and the people building it can only hold so much in their heads at once. The product manager understands users but not system architecture. The engineer understands architecture but not market context. The process connecting them exists to bridge these gaps, to compensate for the fact that no single person can see the whole picture.

AI engineers have a name for this kind of structure: a harness.

## Why we built the harness

A harness, in the AI sense, is the scaffolding you place around an imperfectly reliable executor. Guardrails, validation layers, checkpoints. You build it not because the executor is useless, but because it is powerful and fallible at the same time.

The traditional software process works the same way. Each node in the pipeline is a control point, a place where someone checks that the work so far is sound before it moves forward.

It is worth asking what these control points actually do, because they do not all do the same thing. Some bridge cognitive gaps: a design review lets an engineer validate whether a PM's assumptions about feasibility hold up, a code review catches logical errors a solo developer might miss. But others exist for reasons that have nothing to do with anyone's understanding of the system. A compliance sign-off exists because accountability must be traceable. A change approval board exists because certain roles must formally attest that a decision was made correctly. And still others serve a function that is harder to name but easy to recognize: creating alignment, distributing ownership, manufacturing the legitimacy a decision needs in order to hold.

These are cognitive, institutional, and social functions. They respond to different constraints, and they will not all move the same way.

## The interfaces are breaking

AI has changed what a single person can do. A product manager with access to AI can generate a working prototype rather than drawing static wireframes. An engineer can explore user research, analyze feedback data, produce documentation, all without waiting for a specialist in each area. The boundaries between roles, once sharp, have started to blur.

Controlled studies show productivity gains of 26 to 55 percent for scoped, well-defined tasks.[^1][^2] At the organizational level, Faros AI's study of over 10,000 developers found that teams with high AI adoption completed 21 percent more tasks and merged 98 percent more pull requests, but code review times increased by 91 percent.[^3] Individual output increased. The system's capacity to absorb it did not.

Every node in the pipeline got enhanced, but the connections between them did not change. The PM can produce a prototype faster, but the engineer is still waiting on product decisions that arrive at the old pace. The engineer can write code faster, but their output enters a review process designed for a fraction of this volume. Every enhanced node faces friction in both directions: from its perspective, upstream cannot feed it fast enough, and downstream cannot absorb what it produces.

The old process was not just slow. It was a set of collaborative interfaces built for a specific working tempo. AI changed the nodes but left the interfaces intact. The nodes are faster. The seams are the same.

## Why you cannot simply remove them

The natural response is to strip away the process. If the interfaces are the bottleneck, get rid of them. Less oversight, fewer checkpoints, a leaner pipeline.

This is wrong, for two reasons.

### The output is worse than it looks

AI output is less reliable than it appears. In a sample of 470 open-source GitHub pull requests, CodeRabbit found that AI-generated code introduces 1.7 times more issues than human-written code, with a disproportionate share being critical or major defects.[^4] Logic and correctness issues rise by 75 percent. Security vulnerabilities increase by roughly 2.7 times. Performance problems, particularly excessive I/O operations, appear nearly eight times more frequently. Shipping AI-generated code without rigorous validation is not a streamlined workflow. It is negligence with extra steps.

### The work did not disappear

The cognitive work that those interfaces carried did not vanish when individuals became more capable. It migrated.

In the traditional model, the harness lived between people. It was embedded in organizational structure: the handoff from PM to engineering, the pull request review, the QA gate, the release approval. Quality was a collective responsibility, distributed across roles and enforced through process.

In the AI-augmented model, much of that cognitive work moves inside the individual. The PM who once needed an engineer to assess feasibility now generates a prototype directly, but must judge its soundness alone. The engineer who once relied on a QA team to catch regressions now works with an AI that writes tests, but must determine whether those tests are meaningful.

The cognitive harness has changed address.

And this migration is not uniform. A randomized controlled trial by METR illustrates where the cost lands.[^5] Sixteen experienced open-source developers, averaging five years of experience on their projects, completed 246 tasks. With AI tools, they were 19 percent slower. Before the experiment, they predicted AI would speed them up by 24 percent. Afterward, they still believed it had. These developers were not failing to use AI. They were doing exactly what the new model demands: spending more time evaluating, testing, and reworking AI output than they saved by generating it. They were building the harness. It just cost more than working without AI.

If this pattern holds beyond the study, the implication for organizations is pointed: junior and mid-level engineers use AI to produce more output, and the verification cost flows upward to the senior engineers who can actually judge whether that output is sound. The harness does not distribute evenly. It concentrates on the people who can bear it.

So the process cannot simply be removed. The cognitive verification it carried has migrated inward. The institutional and social functions (compliance, audit, stakeholder alignment) have not moved at all, and in regulated industries they may need to expand to account for AI-specific risks. The total weight of the harness has not decreased. It has redistributed.

## Redesigning the seams

This is the hard part. The old interfaces were load-bearing, but they were also shaped for a tempo that no longer exists. Keeping them unchanged wastes AI's capacity. Removing them loses what they carried. The only option is to rebuild them for the new pace.

Two things need to change: how individuals work, and how organizations preserve what the old process used to generate for free.

### The individual harness is a workbench, not a mindset

Each person working with AI needs their own harness. But "be more careful" is not a harness. The METR results suggest what happens without concrete structure: if experienced developers already spend more time verifying AI output than they save generating it, less experienced developers without structured verification are likely to skip that step entirely, especially once the first few AI outputs look good and checking starts to feel unnecessary. A functional personal harness prevents this by making verification automatic rather than discretionary. Static analysis catches the patterns AI tends to produce. Sandboxed environments let generated code run before it touches anything real. Evaluation suites provide objective feedback on whether the output actually works. Traceability marks which code came from AI so reviewers know where to focus.

What does this look like in practice? An engineer prompts AI to generate three candidate implementations for a new API endpoint. Before examining any closely, they run each through a standard evaluation: type checks, linting, integration tests, a load test against staging. Two candidates fail the load test. The third passes but triggers a warning on exception handling. The engineer reviews the flagged area, adjusts it, runs the evaluation again. Then they write a short decision record: three approaches tried, two eliminated on performance grounds, one selected with a specific modification, and why. Total time: an afternoon. The old process would have spent that afternoon in a design meeting debating which approach to try first.

The key difference is not speed. It is that the engineer ran AI output through a structured evaluation pipeline, one that exists as tooling, not as a mental note.

This is a new competency, and it has two components: the tooling itself, and the judgment to configure and interpret it. Organizations building AI code generation capabilities without building AI code evaluation capabilities in parallel will produce more output, but will not be able to tell whether that output is sound.

### Institutional knowledge needs new vessels

Traditional workflows produced institutional knowledge as a byproduct. Design documents recorded not just what was built, but why. Pull request discussions preserved architectural reasoning. Meeting notes captured tradeoffs considered and rejected.

When an individual, working with AI, moves from idea to implementation in an afternoon, the old process that would have generated these artifacts no longer runs. There is no design meeting to produce a design document, no pull request discussion to record architectural reasoning. The solution works, but the reasoning lives only in the person's head, or stays buried in a conversation log no one else will read. Six months later, someone will find working code with no record of the constraints it was designed around. They will see a rate limiter set to an oddly specific threshold, or a data pipeline that skips what looks like a useful enrichment step, and they will not know whether these were deliberate design choices or artifacts of how the AI generated the code. The old process would have left a trail: a comment in the PR, a sentence in the design doc, a Slack thread someone could search. The new process left working code and silence.

Architecture Decision Records, lightweight documents that capture a single decision, its context, and its rationale, fit naturally into a fast workflow because they are small. Some teams are experimenting with AI-assisted decision logs: after a session, the engineer asks the AI to summarize the key decisions and alternatives, then saves the summary as an artifact. Others are adding a "decision rationale" field in their ticketing systems.

These approaches share a principle: knowledge capture should be a lightweight byproduct of the work, not a separate phase. The old process generated knowledge artifacts because it was slow enough to produce them. The new process must generate them deliberately, because the speed no longer leaves room for them to emerge on their own.

## Conclusion

The AI industry is building harnesses for AI: guardrails, evaluation layers, validation pipelines. This is necessary work. But software engineering has always had a harness. It was called process: the design review, the code review, the QA gate, the release approval. That harness was built for a specific working tempo, and AI has changed the tempo.

The Faros data shows that individual output has scaled but review capacity has not. The CodeRabbit data shows that AI-generated code requires more verification, not less. The METR results show that even experienced developers spend more time on verification than they save on generation. In each case, the bottleneck is the same: not the AI, not the people, but the process that connects them.

The harness has always existed. It has changed address. The process connecting enhanced individuals is now the constraint that needs engineering attention.

---

[^1]: GitHub, [Research: Quantifying GitHub Copilot's Impact on Developer Productivity and Happiness](https://github.blog/news-insights/research/research-quantifying-github-copilots-impact-on-developer-productivity-and-happiness/), 2022.
[^2]: Microsoft Research, [The Effects of Generative AI on High Skilled Work: Evidence from Three Field Experiments with Software Developers](https://www.microsoft.com/en-us/research/publication/the-effects-of-generative-ai-on-high-skilled-work-evidence-from-three-field-experiments-with-software-developers/), 2024.
[^3]: Faros AI, [The AI Productivity Paradox](https://www.faros.ai/blog/ai-software-engineering), 2025.
[^4]: CodeRabbit, [State of AI vs Human Code Generation Report](https://www.coderabbit.ai/blog/state-of-ai-vs-human-code-generation-report), December 2025.
[^5]: METR, [Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/), July 2025.
