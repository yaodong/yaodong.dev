---
layout: post
category: journal
title: What I Learned Building AI Agents in 2025
created_date: 2025-12-30T00:00:00.000Z
image: /assets/images/og/2025-12-30-what-i-learned-ai-agent-in-2025.png
excerpt: "I spent the year copying elegant agent architectures and watching them fail. The same lesson kept coming back, that agent architecture gets forced into existence by the problems you hit rather than designed in advance. This post retraces how I got from there to a setup that works."
---

I spent this year building AI agents and kept learning the same lesson the hard way: agent architecture is forced into existence by problems, not designed in advance. This post is how I got there. It's not a tutorial. It's a memo to myself, written so I don't repeat the same mistakes next year.

## 1. The Core Shift in Thinking

My initial approach was to find well-written articles on agent architecture, thinking I could just copy them and everything would be perfect. So I built a series of elegant-looking designs — upgraded system prompts, context isolation, added memory. Token costs doubled, accuracy dropped, failures multiplied, and the worst failures were impossible to trace back to any single change.

What went wrong? Traditional software is deterministic: given the same input, it produces the same output, so you can reason about architecture before you build. An AI agent is non-deterministic. Its behavior depends on the model's interpretation of context, which shifts with every change you make. Layering sophisticated architecture onto a non-deterministic system means stacking uncertainty on top of uncertainty. You can't design around behavior you haven't observed yet.

Those "brilliant" articles with perfect architectures are correct, but they're the destination, not the starting point. Without going through the struggle in between, copying them directly means you probably can't even get the first component working.

## 2. When to Use Agents, When Not To

When you first get agents working, there's a temptation to use them for everything. I fell into this trap. Not every problem needs an agent.

**If a single API call can solve it, don't use an agent.** I learned this when I wanted to summarize a paragraph into one sentence and deployed a Plan-and-Execute pattern. What could have been done with one call got split into planning first, then executing. The task didn't get more complex; the pipeline did.

**Use workflows for deterministic processes, not conversational agents.** A chain like "transcribe subtitles → identify edit points → generate plan → control audio/video" has defined inputs, fixed intermediate steps, one-shot output, and no user intervention. This kind of task belongs in workflow tools like N8N or Dify.

**Two signals that you actually need a conversational agent:**

1. The process requires human involvement. Some tasks aren't right-or-wrong questions; they're aesthetic questions. AI can rarely generate satisfying results in one shot. People need to guide and iterate.
2. There are too many options for a UI to handle. If you insist on using buttons for every modification request, the interface becomes an airplane cockpit.

## 3. Building the First Version

**Get it running first, make it elegant later.** I started one project by choosing a full-featured agent framework and spending days designing node graphs before writing a single prompt. When I finally ran it, the baseline performance was so poor that all that architecture was beside the point. Now I use the simplest form of whatever I pick. Get the baseline running. Know where the floor is. Then decide whether to add anything.

**Start prompts loose, then tighten.** I wasted time early on looking for "god-tier prompts" to copy. A first prompt shouldn't be a complex instruction manual. Write it without constraints and see what the model naturally does, then keep adding constraints one at a time — formatting, reasoning paths, few-shot examples. As long as the agent follows each new instruction, keep layering.

**Add tools when prompts aren't enough.** Sometimes poor performance isn't a prompt problem — the model simply lacks the capability. If I want it to reference trending designs but it can't access the data, no amount of prompt tweaking will help. It needs a tool.

Once tools are in place, something clicks. The model starts deciding which tools to use on its own, chaining search into code generation without being told to. It feels like emergence. The temptation is to keep adding more.

But when tools multiply, so do problems. Each tool's description, conversation history, code, and images all compete for attention. The model starts picking the wrong tool, or ignoring relevant context buried three screens up.

This was where I stopped adding capabilities and started controlling what the model could see.

## 4. Context Engineering

Different tasks need different types of information, and mixing them causes interference. Take a video agent: design tasks care about user intent, style, and mood; coding tasks care about interface structure, output format, and correctness. Feed both to the same context, and design information muddies code accuracy while code information slows down design decisions.

**Separating planner from executor.** A top-level planner dispatches tasks to specialized sub-agents. The design agent only sees design information. The code agent only sees code information.

**Slimming down the planner's context.** Sub-agents are easy to isolate, but the planner seemingly needs to see everything to make assignments, so its context keeps growing. My approach: don't feed all context to the planner. First determine what the user wants, then dynamically load only the necessary rules and tools. Specific techniques include RAG (retrieving relevant documents based on user input) and code filtering (using grep or scripts to surface relevant content).

There's a trap here: you can't use another LLM call to cheaply decide what context to load, because that model still needs enough context to make a good decision. Embedding-based retrieval helps, but for nuanced routing decisions, you often end up feeding in nearly as much as you were trying to save.

**Progressive disclosure** is a more structured approach. Load in layers:
- First layer: load only skill names and descriptions, so the agent knows what it can do
- Second layer: read specific execution guides only when tasks match
- Third layer: read forms, templates, and scripts on demand during execution

The skill library can grow without proportional cost increases.

## 5. Memory Systems

With sub-agents in place, I hit the question of how the planner hands code to the executor. Direct copy-paste consumes massive output tokens, and models aren't good at mechanical copying — they tend to introduce bugs.

**File-based "pointers" instead of passing content.** The planner writes code to a file and tells the executor to read and modify the file at that path. Output tokens drop dramatically, and error rates decrease.

**Short-term vs. long-term memory.** I first realized I needed both when a multi-step editing task failed after the conversation reset. The agent had no idea what it had already done. Short-term memory lives within the current context window and vanishes when the conversation ends. Long-term memory persists across turns — to-do lists, current progress, what's been completed. Without it, any interrupted multi-step task starts over from scratch.

**Intermediate state.** In multi-turn conversations, should tool call details carry over to the next turn? My default: don't pass them. Only pass user input and agent output. When this causes a failure, resist the urge to dump all state back in. Instead, find the one key piece of information that was lost and save it explicitly (e.g., a file path the executor needed but the planner didn't pass along).

## 6. Debugging

With sub-agents, context isolation, and memory in place, debugging becomes extremely hard. A failure means staring at a chain of decisions made by multiple models, each with its own context. Where did it go wrong?

The only answer I've found is a robust logging system that stores process, not results: which tools were called, in what order, how many tokens each step consumed, and which loaded context went unused.

One failure had me stuck for hours until I checked the logs and saw the planner had routed a design task to the code agent. The code agent tried to interpret mood keywords as variable names. With the logs, I could see the routing decision, the context each agent received, and exactly where the chain broke. Without them, I would have blamed the prompt.

## 7. From Breadth to Depth: Introducing Skills

By this point, the system could handle breadth — it could generate code, search for references, manage files. But when I asked it to produce a financial report end-to-end, the output came back different every time.

Conversational agents are inherently loose. They arrange their own workflows, and each run might differ. Some tasks, though, need a strict methodology with fixed steps.

**Skills solve this.** A skill is packaged, composable, executable "procedural knowledge" for an agent, with three characteristics:

1. **Procedural:** It encodes "how to do it" — for a financial report: fetch data, validate, aggregate, then generate.
2. **Composable:** Skills stack like building blocks. One task can load multiple skills simultaneously.
3. **Executable:** The model handles planning and decisions; scripts handle deterministic execution (calculations, transformations, file generation).

The agent still serves as the entry point, handling intent recognition and conversation. The skill ensures the report always comes back with the same columns in the same order.

---

Those articles I tried to copy at the start? They make sense now. Not because I finally understood them, but because I built the problems they were solving.
