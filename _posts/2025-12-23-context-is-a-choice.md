---
layout: post
title: Context Is a Choice
created_date: 2025-12-23
---

In the 1990s, neuroscientist Antonio Damasio encountered a strange patient. His name was Elliot, and he'd had surgery to remove a brain tumor, which also damaged a small region of his prefrontal cortex. After the surgery, his IQ tested normal. Logical reasoning, normal. Memory, normal. Every cognitive measure came back fine. But he could no longer function in daily life.

He couldn't make decisions. Not because he couldn't analyze. Quite the opposite: he analyzed too well. Choosing what to eat for lunch, he could spend half an hour weighing the pros and cons of each restaurant. Choosing whether to sign with a blue pen or a black pen, he could fall into endless comparison. His boss fired him. His wife left him.

Damasio studied him for a long time and eventually concluded: the brain region that had been damaged was responsible for connecting emotions to decision-making. Without the "bias" of emotion to help him filter, all options appeared equally important to him. When all options are equally important, no option is important.

We typically think of "limitations" as bad. More information is better, more choices are better, more processing power is better. Elliot's case points to the opposite conclusion: constraints are not obstacles to decision-making. They are prerequisites for it.

The human emotional system is fundamentally a filtering mechanism. When you face a choice, it integrates your past experience, current bodily state, and social signals into a "feeling": "this option makes me uncomfortable." You don't need to trace all the reasons behind that feeling; the emotion directly gives you a leaning. This is a bias, but without this bias, you'd be stuck in place like Elliot.

What does this have to do with AI? On the surface, Elliot's problem is "lack of emotion," while an AI agent's problem is "context management." One is neuroscience, the other is engineering practice. But look deeper, and they're different manifestations of the same problem: how does limited processing capacity face unlimited information?

Elliot's processing capacity was fine, but he lost the mechanism that told him "pay attention here, ignore that." An AI agent's processing capacity is also fine, but its context window has a limit, so it must decide what to put in and what to leave out. Humans use emotion to filter. What does AI use?

There's an empirically validated phenomenon in AI: longer context doesn't necessarily mean better performance. Research shows that models tend to "get lost in the middle," paying more attention to information at the beginning and end, while the middle gets overlooked. Stuffing in more information might actually dilute what's truly important.

I've seen this happen. An agent tasked with debugging a production issue gets fed the full conversation history, system logs, stack traces, and documentation. Somewhere in the middle sits the crucial clue: a config change made two days ago. The agent fixates on the recent error messages, proposes increasingly elaborate fixes, and never notices the buried line that explains everything. More context, worse performance.

This isn't exactly Elliot's problem, but it has a similar structure: when all information is laid out in front of you without a mechanism to distinguish important from unimportant, system performance degrades.

The AI field has developed a series of techniques to address this problem. They look varied, but they're all essentially doing the same thing: deciding what the LLM should "see," which is just another way of saying: deciding what to filter out. Each is a different answer to Elliot's question: when you can't attend to everything, what do you attend to?

The most fundamental choice is where to draw the context boundary.

Consider two ways to give an agent a capability. You can stuff the instructions into its context (tool schemas, invocation methods, caveats) and let it do the work itself. Or you can dispatch a sub-agent, let it finish independently, and receive only the result. The first approach keeps information flowing freely but bloats the context. The second keeps the workspace clean but loses detail in the handoff. One is "I learn it myself," the other is "I get help." The difference is the context boundary: shared or isolated.

Protocols like MCP and A2A sit at a different layer. They define how information *can* flow: what tools exist, how to pass parameters, how agents discover each other. But they don't decide what gets filtered. Think of protocols as pipes: they determine where information can go, but architecture decides what actually gets let through.

And even the best architecture runs into limits. When space runs out, you compress. One approach simply chops off old content. Fast, but crude: important early information might vanish. Another uses a model to summarize, compressing long history into short conclusions. Better, but summaries are lossy. Details the summarizer deemed unimportant might be exactly what subsequent decisions need.

And there's another constraint entirely: cost. Context isn't free. Longer context means more computation, higher latency, more expensive API bills. In production environments, whether a task runs for minutes or seconds might determine whether the solution is viable at all.

So context management isn't just about "how to make an agent smarter." It's also about "how to complete the task within budget." You might have the ability to stuff all relevant information into the context, but you can't afford to. Constraints come not just from technical limits, but from economic reality.

Looking at all these techniques together, they answer the same question: what should the LLM "see" in this round of inference? System prompts provide preloaded background. Few-shot examples offer reference cases. RAG retrieval pulls external knowledge on demand. Tool schemas describe capabilities. User messages supply real-time input.

Everything is part of context; every decision is a context management decision. These are all engineering solutions to what was, for Elliot, a neurological problem: the need to filter.

Some people have started using the term "context engineering" to describe this. It's not a new name for prompt engineering, but a larger framework: how to organize information so that limited working memory can handle tasks that exceed its capacity.

This isn't a new problem. It's an old one in new clothes. Humans have been solving it for a long time.

Organizational structure itself is a context management system: who needs to know what, how information flows, where it gets aggregated, where it gets expanded. Specialization lets different people handle different information. Hierarchy lets details get processed at lower levels while conclusions pass upward. Documentation systems externalize information to be loaded when needed.

But humans also have more fundamental mechanisms that AI currently has no equivalent for.

The first is **gradual forgetting**. Human memory isn't binary. It blurs. You remember having dinner with someone three years ago. Not what you ate, not what you talked about, but the impression: "that was a pleasant evening." This low-resolution memory still guides decisions. When that person asks you to dinner again, you say yes without reconstructing the details. AI context works differently: inside the window, information is fully preserved; outside, it completely vanishes. There's no graceful degradation, no residue of importance without specifics.

The second is **importance tagging**. You remember what surprised you, what frightened you, what delighted you. Emotion acts as a highlighter, marking certain experiences for easier retrieval. This isn't a separate system bolted on; it's woven into how memory forms in the first place. AI has no such intrinsic judgment. It relies on proxies: position (recent is more important), explicit rules (what the user marked as important), or architectural tricks (put crucial information at the beginning). These work, but they're external. The system itself doesn't "feel" that something matters.

So should we just copy these mechanisms? Not necessarily.

Human memory evolved for human tasks: survival, reproduction, maintaining social relationships. These are fuzzy, long-term, multi-objective. You don't need to remember exactly what your friend said last month; you need to remember whether they're trustworthy. The blur isn't a bug—it's compression optimized for the kinds of judgments humans actually make.

AI agent tasks are different. Write this report. Fix this bug. Answer this question. These are explicit, shorter-term, more singular. For tasks like these, fuzziness is a liability. You don't want an agent that "vaguely remembers" your requirements. You want one that either knows them precisely or knows it doesn't know.

There's also the question of accountability. When a human makes a decision based on gut feeling, we accept that as legitimate. When an AI does, we want to see the reasoning. "I had a bad feeling about that option" isn't an acceptable explanation from a system. The very opacity that makes human intuition useful makes it problematic for AI.

But here's the thing: AI tasks are changing. From single-turn Q&A to long-form dialogue. From executing instructions to autonomous planning. From working alone to multi-agent collaboration. Tasks are becoming fuzzier, longer-term, more like the ones human memory evolved for. Context management approaches designed for simple tasks might fail on these new task types.

And complexity brings a new risk: after context has been processed multiple times, is it still reliable?

Compression loses detail, and summarization introduces bias. When passing between agents, each party only transmits what they consider important. As the chain lengthens, the information the final agent bases its decisions on might have significantly diverged from the original facts.

Humans have this problem too. It's called information distortion in organizations. What happens on the front lines, after passing through several layers of reporting to reach decision-makers, might already be deformed. Each layer compresses, filters, and reinterprets through its own frame.

Humans have developed countermeasures. Redundant channels let the same information pass through multiple lines for cross-verification. Skip-level mechanisms allow information to bypass the hierarchy and go directly upward. Field visits put decision-makers on the front lines, encountering unfiltered reality. Anonymous feedback gives an outlet to things people otherwise wouldn't dare say.

What these mechanisms share is giving filtered-out information a path to bypass the filter.

Do AI systems need corresponding designs? If a sub-agent's summary misses key information, how does the main agent know? If context has been distorted through multiple rounds of compression, how does the system detect it? There are no good answers yet. This is a dimension that context engineering hasn't seriously addressed.

But let's step back. Damasio's research tells us that constraints are not obstacles to decision-making. They are prerequisites. Elliot lost the mechanism that helped him filter, gained the capacity for "purely rational" analysis, and the result was paralysis.

Something is happening in AI: context windows are expanding rapidly. From 4K tokens in 2022 to 128K or more in 2025, heading toward millions. If this trend continues, context capacity might soon cease to be a hard constraint.

This sounds like progress. But constraints don't disappear—they shift. Capacity gives way to attention: you can fit everything, but you can't look at everything. Attention gives way to economics: you could look at everything, but you can't afford to. And economics gives way to cognition: even if you could afford to look at everything, you still wouldn't know what to focus on.

Humans use emotion, intuition, and the residue of experience to provide that final constraint. AI currently has no equivalent. Its filtering criteria come from outside: position, rules, user instructions. When capacity is no longer the bottleneck, this absence will become more apparent.

What AI needs isn't a bigger window. It's something like what Elliot lost: an intrinsic mechanism that doesn't depend on external rules, that lets the system itself know what to pay attention to and what can be ignored.

Elliot didn't need a bigger brain. He needed a voice that could tell him "something's off about this option."
