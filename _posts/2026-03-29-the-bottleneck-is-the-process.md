---
layout: post
category: journal
title: The Bottleneck Is the Process
created_date: 2026-03-29T14:40:29.000Z
excerpt: "AI made every step faster but left the connections between them untouched. You cannot simply strip the process away, because it carries real weight. The harness has not disappeared. It moved inward to individuals, and across to whoever picks up the new capability."
image: /assets/images/og/2026-03-29-the-bottleneck-is-the-process.png
---


## The paradox

AI made every node in the software pipeline faster. But the pipeline itself did not speed up.

In a controlled experiment by GitHub, developers using Copilot completed a coding task 55 percent faster than those without it.[^1] At the organizational level, Faros AI's study of over 10,000 developers found that teams with high AI adoption completed 21 percent more tasks and merged 98 percent more pull requests, but code review times increased by 91 percent.[^2] And in a randomized controlled trial by METR, sixteen experienced open-source developers completed 246 tasks with AI tools and were 19 percent slower. Before the experiment, they predicted AI would speed them up by 24 percent. Afterward, they still believed it had.[^3]

Something is absorbing the gains. The bottleneck is the process itself: the handoffs, reviews, build cycles, and approval gates that sit between the nodes. But you cannot simply remove them, because they carry real weight. The work is to understand what they carry and where it went.

## Why the harness exists

Every software engineer knows the rhythm. A product manager arrives with wireframes. Engineers ask clarifying questions, push back. The wireframes are revised. A technical design document is drafted, debated, finalized. Only then does anyone write code. And once the code is written, it enters a review queue, passes through QA, and, weeks after the original idea, reaches production.

This process evolved over decades, shaped by a basic reality: building software is expensive, and the people building it can only hold so much in their heads at once. The product manager understands users but not system architecture. The engineer understands architecture but not market context. The process connecting them bridges these gaps.

This is not so different from what AI engineers now call a harness: the scaffolding you place around an imperfectly reliable executor. Guardrails, validation layers, checkpoints. You build it not because the executor is useless, but because it is powerful and fallible at the same time.

Each node in the traditional pipeline is a control point where someone checks that the work so far is sound before it moves forward. Some bridge cognitive gaps: a design review validates feasibility, a code review catches logical errors. Others exist for institutional reasons: compliance, accountability, alignment. AI will reshape each of these differently, because they exist for different reasons.

## The nodes got faster, the seams did not

AI changed what a single person can do. A product manager with access to AI can generate a working prototype rather than drawing static wireframes. An engineer can explore user research, analyze feedback data, produce documentation, all without waiting for a specialist. The boundaries between roles have started to blur.

But the friction is not in the nodes. I run multiple AI agents in parallel using tmux and a set of custom tools. Code generation has scaled dramatically. But my team's process has not changed: the code still goes through Jenkins, the build is slow, and it often fails. Fixing a failing test means editing, committing, rebuilding, and waiting again. If another test breaks, the loop repeats. Code review is still manual. QA is still manual. The bottleneck is not just that I can produce code faster than the pipeline can absorb it. It is that the pipeline contains cycles, and each cycle runs at the old speed.

The process was built for a different tempo. AI changed the nodes but left the interfaces intact.

## What happens when you try to remove them

The natural response is to strip away the process. If the connections between steps are the bottleneck, get rid of them. Less oversight, fewer checkpoints, a leaner pipeline.

The instinct is understandable, but it misreads where the weight lives.

### The output is less reliable than it looks

CodeRabbit's analysis of 470 open-source pull requests found that AI-generated code introduces 1.7 times more issues than human-written code, with security vulnerabilities increasing by roughly 2.7 times.[^4] Most AI-generated code I see has issues of some kind. And as models get smarter, the issues get subtler, harder to catch in review, more likely to reach production unnoticed. Shipping AI-generated code without rigorous validation is not a streamlined workflow. It is negligence with extra steps.

### The work found new owners

On a side project where I had no designer, I used AI to generate UI components. It worked, until I needed consistency across the product. The AI produced screens that each looked good on their own but belonged to different applications. So I built a design system: color tokens, typography scales, spacing rules, reusable components, all documented thoroughly enough that the AI could follow them. This was not a shortcut around design discipline. It was design discipline, carried by someone who was never a designer.

This pattern runs in every direction. A product manager with AI can generate a prototype and discuss it directly with customers, skipping the cycle of handing requirements to a designer, waiting for mockups, and cycling back through feedback. Designers are crossing into engineering: Jenny Wen, who leads design for Claude at Anthropic, describes spending a growing share of her time writing code, polishing implementations, and pairing directly with engineers, work that used to sit entirely on the engineering side.[^5] The roles blur, but the discipline of each role follows whoever picks up the work.

AI does not just blur roles. It moves the cognitive work of each role to whoever picks up the new capability. The harness did not get lighter. It found new owners.

### The work moved inward

The migration runs deeper than role boundaries. Even within a single role, the cognitive work that the process used to carry did not vanish. It moved inward.

In the traditional model, the harness lived between people: the handoff from PM to engineering, the pull request review, the QA gate. Quality was a collective responsibility, distributed across roles and enforced through process.

In the AI-augmented model, much of that work moves inside the individual. The PM who once needed an engineer to assess feasibility now generates a prototype directly, but must judge its soundness alone. The engineer who once relied on a QA team now works with an AI that writes tests, but must decide whether those tests are meaningful.

This is what the METR results show. Those experienced developers were not failing to use AI. They were doing what the new model demands: spending more time evaluating, testing, and reworking AI output than they saved by generating it. They were building the harness inside their own heads.

If this pattern holds, the implication is clear: junior and mid-level engineers use AI to produce more output, and the verification cost flows upward to the senior engineers who can judge whether that output is sound. The harness does not distribute evenly. It concentrates on the people who can bear it.

## The trail went cold

There is a subtler loss. Traditional workflows produced institutional knowledge as a byproduct. Design documents recorded not just what was built, but why. Pull request discussions preserved architectural reasoning. When someone moves from idea to implementation in an afternoon with AI, that process no longer runs. Six months later, someone finds working code with no record of the constraints it was designed around, and no way to tell whether a strange choice was deliberate or an artifact of how the AI generated it.

The old process generated knowledge because it was slow enough to produce it. The new process must generate it on purpose.

## Redesigning the seams

The old interfaces were load-bearing, but they were built for a tempo that no longer exists. Keeping them unchanged wastes AI's capacity. Removing them loses what they carried. The work is to rebuild them for the new pace.

Each person working with AI needs their own harness, and "be more careful" is not one. A real harness has two parts. The first is evaluation: making verification automatic rather than discretionary, through static analysis, sandboxed environments, evaluation suites, and traceability that marks which code came from AI. The difference from the old process is not speed. It is that evaluation exists as tooling, not as a mental note. The second is constraint: giving the AI a framework that makes its output consistent before you need to evaluate it. Architectural standards, naming conventions, interface contracts, design systems. These narrow the space of what the AI can generate, so consistency comes from structure rather than inspection. The constraint framework has to exist before the AI runs, or the output drifts.

Organizations that invest in AI code generation without equally investing in AI code evaluation will produce more output, but will not be able to tell whether that output is sound.

## Conclusion

The harness has always existed. It has changed address. In some cases, it moved inward: individuals now carry verification work that used to be distributed across a process. In other cases, it moved across: people who were never designers or data scientists now carry the disciplinary weight of those roles, because AI gave them the capability without giving them the experience.

Evaluation pipelines, constraint frameworks, and knowledge capture are not overhead from an old way of working. They are the infrastructure of the new one. And because AI can replicate a senior engineer's process but not a senior engineer's judgment, the people who can tell sound output from plausible output matter more now, not less.

The bottlenecks will keep shifting. Identifying where the friction lives and redesigning the process around it is continuous work, because the tempo is still changing.

---

[^1]: GitHub, [Research: Quantifying GitHub Copilot's Impact on Developer Productivity and Happiness](https://github.blog/news-insights/research/research-quantifying-github-copilots-impact-on-developer-productivity-and-happiness/), 2022.
[^2]: Faros AI, [The AI Productivity Paradox](https://www.faros.ai/blog/ai-software-engineering), 2025.
[^3]: METR, [Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/), July 2025.
[^4]: CodeRabbit, [State of AI vs Human Code Generation Report](https://www.coderabbit.ai/blog/state-of-ai-vs-human-code-generation-report), December 2025.
[^5]: Anthropic Engineering, [Harness Design for Long-Running Application Development](https://www.anthropic.com/engineering/harness-design-long-running-apps), 2025.
