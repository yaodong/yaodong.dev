---
layout: post
title: Push It Until It Breaks
created_date: 2026-03-01T00:00:00.000Z
excerpt: "I find the boundaries of AI tools by deliberately overusing them, pushing past what I think they can handle, watching where they fail, and recalibrating. Models and tools keep changing, so the cycle starts over often. This post is about running that cycle on production systems."
image: /assets/images/og/2026-03-01-push-it-until-it-breaks.png
---

A year ago I was accepting tab completions. Now AI is in every stage of my development workflow, from problem definition to deployment. The shift didn't happen in a weekend. It happened through a repeating cycle: push the tool too far, watch it fail, recalibrate. Then something changes, a new model, a better tool, a different workflow, a new category of problem, and I push again.

I work on production systems. The kind with years of accumulated decisions, implicit constraints, and code that nobody fully understands anymore. This is not a story about building something new in three days. It's about what happens when you bring AI into a codebase that fights back.

## The overuse cycle

You can't find the boundary of a tool without crossing it. My method, if you can call it that, is deliberate overuse. Every time I get access to a new model or a meaningful upgrade, I push it past what I think it can handle. I let it take on tasks I'm not sure it's ready for. It fails. I learn something specific about where it breaks. I recalibrate to a level I can deliver at. Then something changes, a new model, a better tool, a different approach, a new category of problem, and I push again.

In mid-2025, I tried delegating legacy refactoring to AI. It would confidently rename internal methods, then call the old names elsewhere in the codebase. It would invent helper functions that didn't exist. On complex tasks, the time I spent fixing AI's mistakes ate into the time I was supposed to be saving, so I dialed it back. When Opus 4.5 dropped in late November 2025, I tried the same category of task again. The model handled the renames correctly, and it caught something an IDE wouldn't: mock annotations in pytest that still referenced the old names as strings. Three months later, Opus 4.6 pushed it further. It could read through legacy code and answer detailed questions about behavior that used to require digging through years of commits. Each cycle teaches me something the previous one couldn't, because the tool is genuinely different from the one I calibrated against last time.

## Make your codebase legible

That cycle taught me something else: more often than not, the failures weren't about model capability. They were about what I was feeding the model.

The single most important thing I've learned is that the real work of AI-assisted development is making your codebase legible to the AI. People have started calling this context engineering. For me, it came down to something concrete: the quality of AI output had less to do with how I asked and more to do with what I gave the model to work with. Documentation, code structure, architectural constraints, type systems, tool definitions, conversation history. All of it matters more than the prompt.

In practice, this means clear module boundaries so the AI knows where one concern ends and another begins. It means typed interfaces so it can reason about contracts without reading every implementation. Documentation maintained as infrastructure, not an afterthought. Architectural constraints enforced mechanically by linters and CI, not by convention that the AI can't see.

I've started evaluating every task through this lens. When I look at a piece of work, I'm asking: what context does this need, where does it live, and how hard is it to gather? A new feature is usually straightforward because the context has natural boundaries: a PRD, a design spec, an API doc. But troubleshooting a subtle bug in a business workflow is a completely different situation. The context is implicit, scattered across code paths, old Slack threads, and the heads of people who built the system. You can't hand that to AI. Not yet, anyway. You have to drive the conversation yourself, digging until you understand what's actually going on.

## Build context before writing code

So the question becomes: how do you actually build that context in practice?

Before touching any code, I create a document in the module's docs folder, pull in whatever context exists (the PRD, design mockups, relevant discussions), and have AI generate a first draft of its understanding of the existing codebase. This document becomes the foundation for everything that follows.

I don't dump everything into this document at once. I expose context to the AI progressively. First, I give it the broad shape of the problem and let it explore the code on its own, then show me what it understands. If the understanding is off, I correct it before adding more detail. If it's on track, I feed in the next layer: specific technical constraints, relevant code paths, edge cases. Each round, I'm checking whether the AI's mental model matches reality before going deeper. Dumping all context upfront sounds efficient but it isn't. The AI loses the thread, and I lose my ability to catch misunderstandings early.

## Distill noisy conversations into clean documents

That progressive approach works well for building up understanding. But some problems don't build up cleanly; they meander.

As AI and I investigate a problem together, the conversation accumulates noise: wrong hypotheses, dead ends, tangential explorations. At a certain point, I have AI write down its current understanding as a clean document. Then I start a new conversation from that document alone. The new session inherits the conclusions without the noise.

I did this when refactoring a file processing feature built on a decade of legacy code. The processing pipeline was long and tangled, and the first conversation with AI was mostly us feeling our way through it: wrong assumptions, backtracking, gradually piecing together how the pieces fit. After a few rounds of distillation, what started as a messy investigation became a document covering the feature from its overall architecture down to every edge case. I checked it into the codebase. It was the first time that subsystem had any real documentation.

## Don't let AI write code without a plan

Whether I'm building context from scratch or distilling it from a messy investigation, the output is the same: a shared understanding of the problem. But understanding the problem isn't the same as agreeing on a solution.

I don't let AI write code until I've reviewed and approved a plan. I learned this the hard way: AI charging ahead and producing code that worked in isolation but broke the surrounding system. The most expensive failure mode isn't bad syntax. It's an implementation that looks correct but misunderstands the system it lives in. A good plan prevents that.

My process is progressive review. AI generates a design document, which can be long. I don't read it end to end. I ask for a summary of the overall approach first. If the direction is wrong, I correct it before going deeper. If it's sound, I drill into specific technical decisions: how does it handle concurrency? What's the migration path? What happens at the boundary with the existing auth system?

This is where experience pays off most. AI gets the broad architecture right more often than not. But it regularly misses things that require knowledge it can't access: our team has a limited engineering budget for this quarter, so the migration approach needs to be simpler. Or it uses the wrong pattern for parallel execution in AWS Step Functions, something that compiles fine but won't behave correctly given our existing infrastructure.

After the iterative discussion, I read the full design. By then most of it is already familiar, and the final pass goes quickly.

## Ask what it would do without your constraints

After arriving at a design within the constraints of our existing system, I ask AI to throw away those constraints and tell me what it would do from scratch.

Most of the time I stick with the constrained version. But not always.

We were designing a concurrency control mechanism. The existing approach worked but didn't make sense: it called AWS APIs to list running executions on the fly, which was fragile and slow. When I asked for the unconstrained version, AI proposed a lock in DynamoDB, similar to how Terraform handles state locking. I recognized the pattern as battle-tested. It pushed us slightly beyond our original scope, but the benefits were strong enough to justify the extra work. We went with the unconstrained design.

The trick is that you're triangulating. The constrained design shows you what's practical. The unconstrained design shows you what's structurally clean. Sometimes the distance between the two is smaller than you assumed.

## Your experience is also a trained model

That kind of triangulation also works on your own instincts, though it's harder to see in the moment.

I was refactoring our product's AI chat system. Business logic had grown into the core conversation flow over time. Every topic needed its own parameter checks and combinations, creating hard dependencies across features. The core should have been business-logic-agnostic. It wasn't.

AI recommended a clean separation: extract the business logic, rewrite the core as a generic pipeline. I thought that was too aggressive. My instinct was to take an incremental path. Unify the scattered parameters first, then gradually decouple.

I attempted the incremental approach three times. Each time the coupling went deeper than I expected. The legacy code was too tangled for partial fixes. On the fourth attempt, I gave up on incrementalism and did what AI had originally suggested: a full rewrite of the core flow.

It worked.

AI didn't carry my preference for gradual change. It just read the code structure and gave the structurally correct answer. That made me realize something: my engineering experience is also a trained model. Years of working on production systems have trained me toward incrementalism, risk aversion, certain architectural instincts. Those instincts are usually right. But they have blind spots, just like any model trained on a particular dataset. AI, trained on a different set of patterns, sometimes sees the structure more clearly precisely because it doesn't carry my biases. I'm now more willing to take AI's architectural suggestions seriously when they contradict my gut, and to ask myself whether my gut is seeing the current situation or just replaying a past one.

## Use models against each other

If my own instincts have blind spots, it follows that any single model does too. So I use more than one.

I use Claude Opus and OpenAI's Codex on the same codebase and have them review each other. The natural checkpoint is the git commit: whenever changes are coherent enough to commit, I run the other model over the diff.

Cross-model review catches real problems. In a side project, I removed a Rails credentials file and Claude helpfully cleaned up the corresponding .gitignore entry. Codex flagged that change: if someone on the team later used Rails credentials without realizing the ignore rule was gone, they could accidentally commit secrets to the repo. It was the kind of thing a second pair of eyes catches, not because one model is smarter, but because they have slightly different perspectives, like engineers with different backgrounds on the same team.

Different models also have different architectural tendencies. One will over-split code into too many small abstractions. Another will over-engineer the overall structure. These tendencies shift with each model upgrade, which means the specific blind spots I'm compensating for keep changing too.

After months of doing this, I have a sense of what cross-model review is good at: factual errors, knowledge gaps, inconsistencies. It's less useful when two models genuinely disagree on an architectural question. That usually means I haven't given them enough shared context to converge; the divergence is a signal about the context, not about which model is right. And when one model gets stuck on a problem, can't fix a failing test no matter how many attempts, switching to the other often breaks through.

There's a deeper limitation. AI models are too easy to convince. If I explain my reasoning with any confidence, both models will agree. This means cross-review catches what I don't know, but it probably won't push back on what I'm wrong about. For that, you need a human colleague, or at minimum the discipline to ask AI to argue against your position before you ask it to confirm.

## Control, don't vibe

None of this has made engineering easier. It's made it different.

The developers I know who get good results are doing the opposite of vibing. They're controlling: reviewing plans, enforcing constraints, catching the things AI misses. The engineering skill hasn't disappeared. It's been redirected, from writing code to evaluating code, from implementing designs to judging designs, from solving problems to framing problems correctly. When AI handles execution, I have time to engage with context I never had bandwidth for before: why did the customer raise this issue, how did the PM arrive at this solution, is there a simpler framing everyone missed.

I've gone back and forth on how much to invest in specific AI workflows. Most of what I learned six months ago is already outdated. But the time I spent making our codebase more legible, better typed, better documented? That compounds regardless of which model I use next. The specific tools don't matter. What matters is whether you can look at a problem, break it into pieces that a machine can handle, and tell whether the output is actually correct.

That skill isn't going anywhere. Everything else is moving fast enough that I'm staying in the overuse cycle. Push, break, learn, push again.
