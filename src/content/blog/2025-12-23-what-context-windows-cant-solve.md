---
layout: post
title: What Context Windows Can't Solve
created_date: 2025-12-23T00:00:00.000Z
image: /assets/images/og/2025-12-23-what-context-windows-cant-solve.png
excerpt: "A patient named Elliot lost the ability to make decisions after brain surgery. Not because he couldn't think, but because he analyzed too well. Without emotions to filter options, all choices seemed equally important. Damasio's insight applies to AI: constraints aren't obstacles to decision-making; they're prerequisites for it."
---

In the 1990s, neuroscientist Antonio Damasio encountered a strange patient. His name was Elliot, and he'd had surgery to remove a brain tumor, which also damaged a small region of his prefrontal cortex. After the surgery, his IQ tested normal. Logical reasoning, normal. Memory, normal. Every cognitive measure came back fine. But he could no longer function in daily life.

He couldn't make decisions. Not because he couldn't analyze. Quite the opposite: he analyzed too well. Choosing what to eat for lunch, he could spend half an hour weighing the pros and cons of each restaurant. Choosing whether to sign with a blue pen or a black pen, he could fall into endless comparison. His boss fired him. His wife left him.

Damasio studied him for a long time and eventually concluded: the brain region that had been damaged was responsible for connecting emotions to decision-making. Without the "bias" of emotion to help him filter, all options appeared equally important to him. When all options are equally important, no option is important.

We typically think of "limitations" as bad. More information is better, more choices are better, more processing power is better. Elliot's case points to the opposite conclusion: constraints are not obstacles to decision-making. They are prerequisites for it.

The human emotional system is fundamentally a filtering mechanism. When you face a choice, it integrates your past experience, current bodily state, and social signals into a "feeling": "this option makes me uncomfortable." You don't need to trace all the reasons behind that feeling; the emotion directly gives you a leaning. This is a bias, but without this bias, you'd be stuck in place like Elliot.

What does this have to do with AI? On the surface, Elliot's problem is "lack of emotion," while an AI agent's problem is "context management." One is neuroscience, the other is engineering practice. But look deeper, and they're different manifestations of the same problem: how does limited processing capacity face unlimited information?

Elliot's processing capacity was fine, but he lost the mechanism that told him "pay attention here, ignore that." An AI agent's processing capacity is also fine, but its context window has a limit, so it must decide what to put in and what to leave out. Humans use emotion to filter. What does AI use?

There's an empirically validated phenomenon in AI: longer context doesn't necessarily mean better performance. Research shows that when context gets longer, models tend to "get lost in the middle," paying more attention to information at the beginning and end of the context, while information in the middle gets overlooked. Stuffing in more information might actually dilute what's truly important.

This isn't exactly Elliot's problem, but it has a similar structure: when all information is laid out in front of you without a mechanism to distinguish important from unimportant, system performance degrades.

The AI field has developed a series of techniques to address this problem. They look varied, but they're all essentially doing the same thing: deciding what the LLM should "see," which is just another way of saying: deciding what to filter out.

Skills and SubAgents are two different ways of organizing capability.

Skills internalize capability: if you want an agent to write a PPT, you stuff the tool instructions, invocation methods, and caveats into its context. It reads the instructions and does it itself. Everything happens in the same context. Information flows freely, but the context gets increasingly bloated.

SubAgents externalize capability: you dispatch a specialized agent to write the PPT, it finishes and hands back the result. The two agents each have independent contexts. The main agent's workspace stays clean, but information is lost in the handoff. You only get what the other party chooses to tell you. One is "I learn it myself," the other is "I get help." The fundamental difference is the context boundary: shared or isolated.

MCP and A2A are at another layer: they're communication protocols. MCP (Model Context Protocol) specifies how an agent discovers and invokes external tools: what tools are available, how to pass parameters, how to get results. A2A (Agent2Agent) specifies how agents talk to each other: how to discover each other, how to negotiate tasks, how to exchange information.

They define how information flows, not how information gets filtered. An MCP tool can be stuffed directly into the main agent's context, or you can have another agent invoke it and report back the result. Protocols are pipes; architecture is where context organization gets decided.

Context compression is about making tradeoffs when space runs out.

One approach simply chops off old content, keeping only the most recent information. It's fast but crude, potentially discarding important early information. The other uses a model to generate summaries, compressing long history into short conclusions. This preserves the "essence" of the information, but the summary itself is a lossy transformation. Details the summarizer deemed unimportant might be exactly what subsequent decisions need.

There's a factor that often gets overlooked in technical discussions: cost. Context isn't free. Longer context means more computation, higher latency, more expensive API bills. In production environments, whether a task runs for minutes or seconds might determine whether the solution is viable at all.

So context management isn't just about "how to make an agent smarter." It's also about "how to complete the task within budget." You might have the ability to stuff all relevant information into the context, but you can't afford to. Constraints come not just from technical limits, but from economic reality.

Looking at all these techniques together, they're all answering the same question: what should the LLM "see" in this round of inference? The system prompt is preloaded background, few-shot examples are reference cases, RAG retrieval pulls external knowledge on demand, tool schemas describe capabilities, and user messages provide real-time input.

Everything is part of context; every decision is a context management decision.

Some people have started using the term "context engineering" to describe this. It's not a new name for prompt engineering, but a larger framework: how to organize information so that limited working memory can handle tasks that exceed its capacity.

Humans have been solving this problem for a long time.

Organizational structure itself is a context management system: who needs to know what, how information flows, where it gets aggregated, where it gets expanded. Specialization lets different people handle different information. Hierarchy lets details get processed at lower levels while conclusions pass upward. Documentation systems externalize information to be loaded when needed.

But humans also have more fundamental mechanisms that AI currently has no equivalent for.

**Gradual forgetting:** Human memory isn't "have" or "don't have." It gradually blurs. You remember having dinner with someone three years ago. The details are gone, but the impression "that was a pleasant conversation" remains. This low-resolution memory can still guide decisions. AI context is binary: in the window it's fully preserved, outside it completely vanishes.

**Importance tagging:** You more easily remember things that surprised you, made you nervous, or made you happy. Emotion acts as a tag for importance. AI has no such intrinsic importance judgment. It can only rely on position (more recent is more important) or external rules (what the user says is important is more important) to decide what to keep.

**Reconstruction rather than retrieval:** Human recall isn't reading a file from storage. It's reconstructing from fragments each time. This means the same experience can present different facets when recalled in different contexts. There's risk of distortion, but also the ability to adapt to current needs.

Can these mechanisms be directly transplanted to AI? Not necessarily.

Human memory mechanisms are optimized for human tasks. What are human "tasks"? Survival, reproduction, maintaining social relationships: fuzzy, long-term, multi-objective. Gradual forgetting, emotional tagging, reconstructive memory are adaptive within this framework.

AI agent tasks are usually more explicit, shorter-term, more singular: write this report, fix this bug, answer this question. For these kinds of tasks, the "fuzziness" of human memory mechanisms might actually be a burden. You don't want an agent that "vaguely remembers" what your requirements were.

But there's a trend: AI tasks are changing. From single-turn Q&A to long-form dialogue, from executing instructions to autonomous planning, from working alone to multi-agent collaboration. Tasks are becoming fuzzier, longer-term, more complex. This means context management approaches designed for simple tasks might fail on new task types.

There's a related problem: after context has been processed multiple times, is it still reliable?

Compression loses detail. Summarization introduces bias. When passing across agents, each party only transmits what they consider important. As the chain lengthens, the information the final agent bases its decisions on might have significantly diverged from the original facts.

Humans have this problem too. It's called information distortion in organizations. What happens on the front lines, after passing through several layers of reporting to reach decision-makers, might already be deformed. Each layer compresses, filters, and reinterprets through its own frame.

Humans have developed some countermeasures: redundant channels, where the same thing passes through multiple lines for cross-verification; skip-level mechanisms, allowing information to bypass certain levels and go directly upward; field visits, where decision-makers occasionally go down to the front lines to directly encounter unfiltered information; anonymous feedback, giving an outlet to things people otherwise wouldn't dare say.

What these mechanisms share is giving information that was filtered out a path to bypass the filter.

Do AI systems need corresponding designs? If a SubAgent's summary misses key information, how does the main agent know? If context has been distorted through multiple rounds of compression, how does the system detect it? There are no good answers yet. This is a dimension that context engineering hasn't seriously addressed.

Now back to the opening question. Damasio's research tells us that constraints are not obstacles to decision-making. They are prerequisites. Elliot lost the mechanism that helped him filter, gained the ability for "pure rational" analysis, and the result was paralysis.

Something is happening in AI: context windows are rapidly expanding. A few years ago they were 4K tokens; now 128K is standard, and some models claim to support millions or even tens of millions. If this trend continues, context capacity might soon cease to be a hard constraint.

Is this good? Not necessarily.

Once the capacity constraint disappears, the problem doesn't disappear. It just takes a different form. If you have infinite context but no mechanism to tell you what's important and what can be ignored, you'll fall into Elliot's predicament: when all information is equally important, no information is important. What you need isn't a bigger window, but a set of filtering criteria.

Constraints can be about capacity (can't fit it in), attention (can't look at it all), economics (can't afford it), or cognition (don't know what to focus on). Remove one constraint, and another becomes prominent. Humans use emotion, intuition, and "feelings" distilled from experience to provide cognitive constraints. AI currently has no equivalent. Its filtering criteria come from outside: position, rules, user instructions. When capacity is no longer the bottleneck, this absence will become more apparent.

So, the final question: when context capacity is no longer the bottleneck, what will become the new one?

Perhaps the answer is: an intrinsic importance-judging mechanism, one that doesn't depend on external rules, that lets the system itself know what to pay attention to and what can be ignored. Elliot didn't need a bigger brain. He needed a voice that could tell him "something's off about this option."
