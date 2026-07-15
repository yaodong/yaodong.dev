---
layout: post
category: journal
title: Building Understanding From the Ground Up
created_date: 2026-07-10T00:00:00.000Z
excerpt: >-
  AI can propose a solution, write the code, and turn a complex workflow into a
  series of yes-or-no answers. Checking its work still takes judgment, and I've
  been thinking about where that judgment comes from.
image: /assets/images/og/2026-07-10-understanding-from-the-ground-up.png
---

Recently I spent an entire day reviewing a pull request written by an AI agent. The diff was only a few dozen lines, but most of it was handling the corner cases of ingesting customer data. On top of that, the model hadn't bothered to name things clearly, so the code was hard to follow. Near the end of the day I found the one corner case it had missed, hidden among all the ones it caught, and had the model fix it. If I had merged that code without understanding it, I don't know how long the debugging would have taken once the bug surfaced in production.

That day stayed with me. AI is now good enough that its mistakes don't show up at a glance, so catching them depends on understanding the code yourself. The model can help, but in my experience it can't hand the understanding over; I end up having to build it myself.

## Reading good code slipped away

Since AI agents took over most of the typing, the share of code I write myself has shrunk to almost nothing. My time goes to exploring designs with the model, reviewing the solutions it proposes, and finding its mistakes, which usually come from missing context, misreading the requirements, or quietly assuming that time, compute, migration cost, and human attention are free.

Armin Ronacher wrote about where this is heading in [The Coming Loop](https://lucumr.pocoo.org/2026/6/23/the-coming-loop/). Present-day models produce code that is too defensive, too complex, and too local in its reasoning. They add fallbacks instead of invariants, and extra machinery instead of clear design. Meanwhile, loops of agents read logs, propose root causes, write patches, and sometimes land them with no human in the process at all. His worry is that we may no longer understand our systems the way we used to, and will depend on the machine to fill the gap. He calls it *cognitive dependency*.

Reading his post, I recognized myself in it. When AI writes weak code, I can only tell it's weak because of years of experience before AI, which taught me what good code should look like. Reading good code was part of that. What hit harder was realizing I couldn't remember the last time I had sat down and read some just because it was good.

## Can't I just use the model's understanding?

Some loss of understanding is normal and fine. You specialize, and the parts you don't own become boxes you use without opening. That works because the boxes have earned it. The database, the runtime, the operating system have each been broken and fixed many times, by many people, so you inherit their reliability without re-earning it. Even then [they leak](https://www.joelonsoftware.com/2002/11/11/the-law-of-leaky-abstractions/), which is why someone still has to know which parts everything else rests on. The model's answer is a box with none of this behind it. Nothing has established that it's right for the case in front of you, so you can't build on it the way you build on the database, not until you've checked it yourself, and checking it means understanding it first.

I want to be careful here. Whether language models really reason is [an open debate](https://aiguide.substack.com/p/the-llm-reasoning-debate-heats-up), and I might be wrong. My view is that a model imitates the shape of reasoning rather than doing the reasoning. Some evidence points this way. Anthropic [slipped hints into prompts](https://www.anthropic.com/research/reasoning-models-dont-say-think) and often caught its own models using them to reach an answer, then writing out a chain of thought that did not mention them. The chain of thought looked like an explanation, but the actual path to the answer ran through the hint. In my own experience, when I ask it to replace a word across a piece of writing, it won't rewrite the passage itself. It runs a throwaway Python script to swap the exact string, in case a rewrite quietly changes something else. It routes around its own rewriting where exactness matters, which tells me something about how much to build on it.

Whatever the models are doing, I'm more confident about the human side, because I've seen it fail up close. A while back I spent an evening with a new graduate student who wanted to join a friend's project. He walked me through a system he'd built, and whenever I asked why it worked one way and not another, he would put the question to the AI that had built it with him, and read the answer back to me. The answers were fluent. But the longer we talked, the clearer it became that he couldn't tell which parts mattered and which were filler, or why one trade-off might beat another. After a while my questions were going to the model and coming back through him, with little of his own in between. He's just starting out, so I don't hold it against him. And I catch the smaller version of it in myself, reading back an answer I haven't fully made my own. In those moments neither of us is doing the reasoning. The model produced something reasoning-shaped, and I relayed it.

## Confirmation is not learning

There's a mechanical explanation for why relaying answers doesn't turn into understanding. One useful way to picture the brain is as a [prediction machine](https://slatestarcodex.com/2017/09/05/book-review-surfing-uncertainty/) that updates when a prediction collides with reality, and stays put when reality simply agrees. It's the same trap Matuschak points at in [Why books don't work](https://andymatuschak.org/books), where reading an explanation can feel like understanding until a real question makes the gap visible. Nodding along to a correct answer produces no collision. If my only role is to confirm what the AI produced, I'm never wrong in a way I can feel, and [nothing sticks](https://nmn.gl/blog/ai-illiterate-programmers).

Borrowing someone else's method has the same problem. You can install their skill file and follow their workflow, but you never built the abstraction behind it, so you can't adapt when the situation changes.

Underneath both is a difference in how understanding forms. Mine came from my own work, including the mistakes. The model's came from patterns in other people's records. The answers can look similar, but only one of these I can extend on my own.

When the model hands me an answer, knowing how it works isn't the hard part; I can always ask for that. What I still have to work out myself is why it should work that way for this particular problem.

## The dependency isn't what worries me

To be clear, I'm not arguing against depending on AI. I depend on it every day, by choice. Giving up AI for software work isn't a realistic option for me at this point, and I don't worry much about losing access either. Open models keep improving, and most software doesn't need the smartest model in existence. Long term, I'm an optimist.

The reassurance I keep hearing is that humans will still make the judgment calls. But that judgment has to rest on something. If I don't understand the system, my approval isn't a judgment; it's a sign-off. As agent loops take over the analysis, the iterations, and the final checks, the human review becomes the slowest step in the pipeline. When the agent reports that everything is done, verifying that claim takes real understanding of the system, plus time that may not be given. My concern is that control erodes gradually, each time an agent reports done and nobody checks.

The model has no reason to keep the system understandable; we're the ones who need it that way. Our working memory is small, so we built habits to keep code readable. The old refactoring move is to [reshape the code first, so the actual change becomes easy](https://martinfowler.com/articles/preparatory-refactoring-example.html). A model's context is often large enough to make the hard change all at once, so left to itself it has little reason to bother.

## Understanding takes practice now

Understanding used to come for free, as a byproduct of the work itself. Now that the machine does the work, keeping that understanding has become deliberate practice, and deliberate practice is tiring. It costs you on top of everything else, while you're already running to keep up with an industry that moves at agent speed.

Part of that happens inside the work I already do. When AI creates a pull request, I follow the code outward, to what it depends on and what depends on it. I work out why it was written the way it was, what problem it solved, and which of its constraints are already gone. Some of it is even my own, from a few months back and forgotten well enough to feel like someone else's. Most of that isn't required to finish the task. I do it to reach the point where I could explain the change to someone else.

Reviewing what the AI built runs the same way. Every model carries its own biases, so I don't let one check its own work. I hand the design to a second model, or at least a fresh conversation that hasn't inherited the build's assumptions, and ask where it's weakest, what it leaves out, and where it breaks first if it fails. Which gaps matter, and why, is still mine to work out.

The rest runs on curiosity. I pick a few topics and read around them, the books and the articles and the code, whether or not they relate to my work. Lately I've been reading about how different web frameworks handle per-request context, or how SQLite can use S3 as its storage. Here too I lean on AI, as a teacher. I have it explain the topic, then push back on its answers and follow the threads that still don't make sense.

Then I make myself write a few paragraphs or some code and see if it stands. Writing is slow, so I often talk it through and let the machine transcribe, then have it read back what I made and find the holes. Whether I can put the idea in my own words turns out to be a decent test; when I can't, I've usually skipped a step.

Almost all of this goes through AI, and I let it. But I still work a problem before I ask, and sit with things the machine could have closed in seconds, because the parts I struggle through are the parts I end up understanding.

For now, a day spent reading a few dozen lines of diff still feels like time well spent.
