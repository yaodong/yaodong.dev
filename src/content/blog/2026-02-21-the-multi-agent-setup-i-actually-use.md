---
layout: post
title: The Multi-Agent Setup I Actually Use
created_date: 2026-02-21T00:00:00.000Z
image: /assets/images/og/2026-02-21-the-multi-agent-setup-i-actually-use.png
excerpt: "One agent stretched across everything kept bleeding context between tasks. So I split it into three, an orchestrator, a coder, and a thinker, each in its own container, coordinated through Discord. Parallel work became possible for the first time."
---

I kept running into the same problem. I'd be deep in a coding conversation, then need to switch to writing, and the agent would carry forward context that didn't belong. Or I'd want two things happening at once and couldn't, because everything ran through the same thread.

What I actually wanted was one agent per domain. Not one assistant stretched across everything, but dedicated agents: one that lives in my codebase, one that goes deep on ideas, one that coordinates across the rest. Context isolation between them, too. Different topics, even within the same domain, shouldn't bleed into each other.

The solution I landed on was Discord. Its server, channel, and thread structure map naturally onto this: multiple agents, each in its own domain, with layered context isolation built into how the platform works.

Last week I was in my `#brainstorming` channel, thinking out loud with Helm, my primary agent, about a project idea. We got interested. I opened a thread, went deeper, and decided it was worth building. Helm wrote a handoff document summarizing what we'd discussed, created a `#project-hobby` channel, and ran `gh repo create` to set up the GitHub repo. Then she pinged Builder.

Builder is my coding agent. She received the handoff document, fired up Claude Code, and started building. Partway through she hit a database problem and reported it to Helm. Helm spun up a PostgreSQL Docker container, resolved the environment issue, and handed control back. Builder kept going. When she had a working first version, Helm came in to review. Helm found a bug: users couldn't log out. Builder opened a PR. Helm reviewed it, left a comment, approved it, and merged.

While all of that was happening, I'd noticed something interesting about the problem we were solving, an insight that felt worth writing about. I went to my `#write-room` channel and started thinking out loud. Explorer joined automatically. I laid out the core idea; she pushed back. Was I describing the tool, or the behavior change it enabled? That reframing opened up a better angle. She pulled in two related pieces I hadn't seen, and we went back and forth on framing until something clicked. By the end of it, Explorer had shaped the conversation into a short piece and published it to my social accounts via Typefully.

Both were happening at the same time. I wasn't waiting for either.

<figure>
<div class="fig-head"><div class="fig-title">Two channels at once</div><div class="fig-sub">The same stretch of time, left to right</div></div>
<div class="fig-draw"><svg id="pw" viewBox="0 0 840 282" role="img" aria-label="Two channels moving at the same time: in #project-hobby, Helm hands off to Builder, fixes the database when Builder gets stuck, then reviews and merges; in #write-room, Explorer pushes back, pulls in related pieces, and publishes a short piece, while I think out loud with Explorer in #write-room."><style>#pw text{font-family:var(--font-body)}#pw .mono{font-family:var(--font-mono)}</style>
<path d="M87.124 46 L185 46" fill="none" stroke-width="1" stroke-linejoin="round" style="stroke:var(--color-text-muted)"/>
<path d="M181.0 49.5 L185 46 L181.0 42.5" fill="none" stroke-width="1" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(--color-text-muted)"/>
<path d="M265.326 46 L350 46" fill="none" stroke-width="1" stroke-linejoin="round" style="stroke:var(--color-text-muted)"/>
<path d="M346.0 49.5 L350 46 L346.0 42.5" fill="none" stroke-width="1" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(--color-text-muted)"/>
<path d="M417.124 46 L515 46" fill="none" stroke-width="1" stroke-linejoin="round" style="stroke:var(--color-text-muted)"/>
<path d="M511.0 49.5 L515 46 L511.0 42.5" fill="none" stroke-width="1" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(--color-text-muted)"/>
<path d="M595.326 46 L680 46" fill="none" stroke-width="1" stroke-linejoin="round" style="stroke:var(--color-text-muted)"/>
<path d="M676.0 49.5 L680 46 L676.0 42.5" fill="none" stroke-width="1" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(--color-text-muted)"/>
<path d="M107.788 146 L185 146" fill="none" stroke-width="1" stroke-linejoin="round" style="stroke:var(--color-text-muted)"/>
<path d="M181.0 149.5 L185 146 L181.0 142.5" fill="none" stroke-width="1" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(--color-text-muted)"/>
<path d="M272.788 146 L350 146" fill="none" stroke-width="1" stroke-linejoin="round" style="stroke:var(--color-text-muted)"/>
<path d="M346.0 149.5 L350 146 L346.0 142.5" fill="none" stroke-width="1" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(--color-text-muted)"/>
<path d="M437.788 146 L515 146" fill="none" stroke-width="1" stroke-linejoin="round" style="stroke:var(--color-text-muted)"/>
<path d="M511.0 149.5 L515 146 L511.0 142.5" fill="none" stroke-width="1" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(--color-text-muted)"/>
<path d="M602.788 146 L680 146" fill="none" stroke-width="1" stroke-linejoin="round" style="stroke:var(--color-text-muted)"/>
<path d="M676.0 149.5 L680 146 L676.0 142.5" fill="none" stroke-width="1" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(--color-text-muted)"/>
<path d="M254.382 246 L824 246" fill="none" stroke-width="1" stroke-linejoin="round" stroke-dasharray="3 3" style="stroke:var(--color-text-muted)"/>
<path d="M820.0 249.5 L824 246 L820.0 242.5" fill="none" stroke-width="1" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(--color-text-muted)"/>
<text x="44" y="22" font-size="12" font-weight="500" class="mono" letter-spacing="0.08em" style="fill:var(--color-text-secondary)">#PROJECT-HOBBY</text>
<text x="44" y="50.5" font-size="14" font-weight="500" style="fill:var(--color-text)">Helm</text>
<text x="44" y="68" font-size="12.5" style="fill:var(--color-text-muted)">handoff doc</text>
<text x="44" y="85.5" font-size="12.5" style="fill:var(--color-text-muted)">channel, repo</text>
<circle cx="30" cy="46" r="5.5" stroke-width="2" style="fill:var(--color-text-body);stroke:var(--color-bg)"/>
<text x="209" y="50.5" font-size="14" font-weight="500" style="fill:var(--color-text)">Builder</text>
<text x="209" y="68" font-size="12.5" style="fill:var(--color-text-muted)">starts building</text>
<circle cx="195" cy="46" r="5.5" stroke-width="2" style="fill:var(--color-text-body);stroke:var(--color-bg)"/>
<text x="374" y="50.5" font-size="14" font-weight="500" style="fill:var(--color-text)">Helm</text>
<text x="374" y="68" font-size="12.5" style="fill:var(--color-text-muted)">Postgres container</text>
<circle cx="360" cy="46" r="5.5" stroke-width="2" style="fill:var(--color-text-body);stroke:var(--color-bg)"/>
<text x="539" y="50.5" font-size="14" font-weight="500" style="fill:var(--color-text)">Builder</text>
<text x="539" y="68" font-size="12.5" style="fill:var(--color-text-muted)">first version</text>
<circle cx="525" cy="46" r="5.5" stroke-width="2" style="fill:var(--color-text-body);stroke:var(--color-bg)"/>
<text x="704" y="50.5" font-size="14" font-weight="500" style="fill:var(--color-text)">Helm</text>
<text x="704" y="68" font-size="12.5" style="fill:var(--color-text-muted)">finds a bug</text>
<text x="704" y="85.5" font-size="12.5" style="fill:var(--color-text-muted)">merges the PR</text>
<circle cx="690" cy="46" r="5.5" stroke-width="2" style="fill:var(--color-text-body);stroke:var(--color-bg)"/>
<text x="44" y="122" font-size="12" font-weight="500" class="mono" letter-spacing="0.08em" style="fill:var(--color-text-secondary)">#WRITE-ROOM</text>
<text x="44" y="150.5" font-size="14" font-weight="500" style="fill:var(--color-text)">Explorer</text>
<text x="44" y="168" font-size="12.5" style="fill:var(--color-text-muted)">joins</text>
<circle cx="30" cy="146" r="5.5" stroke-width="2" style="fill:var(--color-text-body);stroke:var(--color-bg)"/>
<text x="209" y="150.5" font-size="14" font-weight="500" style="fill:var(--color-text)">Explorer</text>
<text x="209" y="168" font-size="12.5" style="fill:var(--color-text-muted)">pushes back</text>
<text x="209" y="185.5" font-size="12.5" style="fill:var(--color-text-muted)">new angle</text>
<circle cx="195" cy="146" r="5.5" stroke-width="2" style="fill:var(--color-text-body);stroke:var(--color-bg)"/>
<text x="374" y="150.5" font-size="14" font-weight="500" style="fill:var(--color-text)">Explorer</text>
<text x="374" y="168" font-size="12.5" style="fill:var(--color-text-muted)">two related pieces</text>
<circle cx="360" cy="146" r="5.5" stroke-width="2" style="fill:var(--color-text-body);stroke:var(--color-bg)"/>
<text x="539" y="150.5" font-size="14" font-weight="500" style="fill:var(--color-text)">Explorer</text>
<text x="539" y="168" font-size="12.5" style="fill:var(--color-text-muted)">shapes a piece</text>
<circle cx="525" cy="146" r="5.5" stroke-width="2" style="fill:var(--color-text-body);stroke:var(--color-bg)"/>
<text x="704" y="150.5" font-size="14" font-weight="500" style="fill:var(--color-text)">Explorer</text>
<text x="704" y="168" font-size="12.5" style="fill:var(--color-text-muted)">publishes to</text>
<text x="704" y="185.5" font-size="12.5" style="fill:var(--color-text-muted)">Typefully</text>
<circle cx="690" cy="146" r="5.5" stroke-width="2" style="fill:var(--color-text-body);stroke:var(--color-bg)"/>
<text x="44" y="222" font-size="12" font-weight="500" class="mono" letter-spacing="0.08em" style="fill:var(--color-text-secondary)">ME</text>
<text x="44" y="250.5" font-size="14" font-weight="500" style="fill:var(--color-text)">Thinking out loud with Explorer</text>
<text x="44" y="268" font-size="12.5" style="fill:var(--color-text-muted)">in #write-room</text>
<circle cx="30" cy="246" r="5" stroke-width="1.5" style="fill:var(--color-bg);stroke:var(--color-accent)"/>
<text x="539.191" y="239" text-anchor="middle" font-size="13" style="fill:var(--color-text-secondary)">meanwhile</text>
</svg></div>
<figcaption><span>Helm and Builder moved the project forward while I was thinking out loud with Explorer.</span></figcaption>
</figure>

That's the system in motion. Here's what's behind it: three agents, two Docker containers, one Discord server.

**Helm** lives on the host machine and acts as the orchestrator. She has `requireMention: false`, which means she sees every message in every channel. Not to respond to everything, but to stay aware. She's the one who coordinates across the system: writing handoff documents, calling other agents, doing reviews, tracking what's in flight.

**Builder** runs in her own Docker container. She's a coding agent with her own Linux environment, can install whatever tools she needs, and has Claude Code available. She only responds when explicitly @mentioned, either by me or by Helm. If her container crashes, nothing else goes down.

**Explorer** also runs in Docker. Her personality is curiosity. She asks questions, pushes back, proposes angles I hadn't considered. A conversation with her doesn't feel like querying a tool; it feels like thinking out loud with someone who's genuinely interested. She has a Typefully integration so when something is worth sharing, she can publish directly to my social accounts without leaving the conversation.

OpenClaw's memory system is built on plain Markdown files: `SOUL.md` for personality, `USER.md` for preferences, `MEMORY.md` for long-term knowledge, and daily logs that accumulate. All of this loads into every session, growing more specific over time. Explorer and Builder started with minimal configuration; after a few weeks of regular use, their responses reflect the conversations we've had.

This is also what makes OpenClaw feel different from using the same model in a chat interface. The underlying model is the same, but an agent with accumulated memory and a defined identity remembers what I care about, what I've tried, what didn't work. I've found myself preferring to work in OpenClaw over a standard chat app, even for things that don't require any of the multi-agent machinery.

The Docker choice is the key architectural decision, and it's worth understanding why. There are lighter alternatives: OpenClaw supports bindings, which let a single agent behave differently in different channels, with different personas, tools, and models. For many setups, that's enough. But bindings are still one process. If it goes down, everything goes down. And because it's a shared environment, any tool you give one "agent" is technically available to all of them.

That trade-off didn't work for me. Builder needs a rich development environment (runtimes, package managers, CLI tools) that Explorer and Helm have no use for. Giving all agents access to that environment isn't just unnecessary, it's messy. Docker gives each agent its own world: its own process, its own Linux environment, its own home folder mounted from the host. I can destroy and recreate Builder's container entirely and she comes back exactly as she left off.

There's another dimension to this isolation that I didn't anticipate when I started: version independence. OpenClaw moves fast. Breaking changes happen, and I've had agents fail to start after an upgrade more than once. Because each container manages its own OpenClaw installation, I can upgrade one agent without touching the others. If Builder breaks after an update, Helm is still running on a stable version. More importantly, I can ask Helm to go fix Builder: shell into the container, diagnose the issue, and restore her. That's only possible because they don't share a runtime.

<figure>
<div class="fig-head"><div class="fig-title">Three agents, one Discord server</div><div class="fig-sub">Where each agent runs, and which messages it sees</div></div>
<div class="fig-draw"><svg id="ar" viewBox="0 0 840 274" role="img" aria-label="Three agents behind one Discord server: Helm runs on the host and sees every message; Builder runs in her own Docker container and responds when mentioned; Explorer runs in another container and lives in #write-room. Agents can call each other directly, and Helm can fix Builder's container."><style>#ar text{font-family:var(--font-body)}#ar .mono{font-family:var(--font-mono)}</style>
<rect x="12" y="100" width="264" height="162" rx="2" style="fill:var(--color-bg-subtle)"/>
<rect x="288" y="100" width="264" height="162" rx="2" style="fill:var(--color-bg-subtle)"/>
<rect x="564" y="100" width="264" height="162" rx="2" style="fill:var(--color-bg-subtle)"/>
<path d="M312,30 C312,64 36,54 36,90 L36,128" fill="none" stroke-width="1" stroke-linejoin="round" style="stroke:var(--color-text-muted)"/>
<path d="M32.5 124.0 L36 128 L39.5 124.0" fill="none" stroke-width="1" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(--color-text-muted)"/>
<path d="M312,30 C312,64 588,54 588,90 L588,128" fill="none" stroke-width="1" stroke-linejoin="round" style="stroke:var(--color-text-muted)"/>
<path d="M584.5 124.0 L588 128 L591.5 124.0" fill="none" stroke-width="1" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(--color-text-muted)"/>
<path d="M312 52 L312 128" fill="none" stroke-width="1" stroke-linejoin="round" style="stroke:var(--color-text-muted)"/>
<path d="M308.5 124.0 L312 128 L315.5 124.0" fill="none" stroke-width="1" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(--color-text-muted)"/>
<path d="M106.326 140 L302 140" fill="none" stroke-width="1" stroke-linejoin="round" stroke-dasharray="3 3" style="stroke:var(--color-text-muted)"/>
<path d="M298.0 143.5 L302 140 L298.0 136.5" fill="none" stroke-width="1" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(--color-text-muted)"/>
<path d="M110.3 136.5 L106.326 140 L110.3 143.5" fill="none" stroke-width="1" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(--color-text-muted)"/>
<path d="M369.124 140 L578 140" fill="none" stroke-width="1" stroke-linejoin="round" stroke-dasharray="3 3" style="stroke:var(--color-text-muted)"/>
<path d="M574.0 143.5 L578 140 L574.0 136.5" fill="none" stroke-width="1" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(--color-text-muted)"/>
<path d="M373.1 136.5 L369.124 140 L373.1 143.5" fill="none" stroke-width="1" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(--color-text-muted)"/>
<path d="M312 152 L312 232 L252 232" fill="none" stroke-width="1" stroke-linejoin="round" stroke-dasharray="3 3" style="stroke:var(--color-text-muted)"/>
<path d="M256.0 228.5 L252 232 L256.0 235.5" fill="none" stroke-width="1" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(--color-text-muted)"/>
<text x="50" y="248" font-size="12" font-weight="500" class="mono" letter-spacing="0.08em" style="fill:var(--color-text-secondary)">DOCKER CONTAINER</text>
<text x="326" y="248" font-size="12" font-weight="500" class="mono" letter-spacing="0.08em" style="fill:var(--color-text-secondary)">HOST MACHINE</text>
<text x="602" y="248" font-size="12" font-weight="500" class="mono" letter-spacing="0.08em" style="fill:var(--color-text-secondary)">DOCKER CONTAINER</text>
<text x="326" y="22.5" font-size="14" font-weight="500" style="fill:var(--color-text)">Discord</text>
<text x="326" y="40" font-size="12.5" style="fill:var(--color-text-muted)">channels and threads</text>
<circle cx="312" cy="18" r="5.5" stroke-width="2" style="fill:var(--color-text-body);stroke:var(--color-bg)"/>
<text x="50" y="118" font-size="13" style="fill:var(--color-text-secondary)">@mention</text>
<text x="326" y="118" font-size="13" style="fill:var(--color-text-secondary)">every message</text>
<text x="602" y="118" font-size="13" style="fill:var(--color-text-secondary)">#write-room</text>
<text x="50" y="144.5" font-size="14" font-weight="500" style="fill:var(--color-text)">Builder</text>
<text x="50" y="162" font-size="12.5" style="fill:var(--color-text-muted)">coding agent</text>
<text x="50" y="179.5" font-size="12.5" style="fill:var(--color-text-muted)">requireMention: true</text>
<circle cx="36" cy="140" r="5.5" stroke-width="2" style="fill:var(--color-text-body);stroke:var(--color-bg)"/>
<text x="326" y="144.5" font-size="14" font-weight="500" style="fill:var(--color-text)">Helm</text>
<text x="326" y="162" font-size="12.5" style="fill:var(--color-text-muted)">orchestrator</text>
<text x="326" y="179.5" font-size="12.5" style="fill:var(--color-text-muted)">requireMention: false</text>
<circle cx="312" cy="140" r="5.5" stroke-width="2" style="fill:var(--color-accent);stroke:var(--color-bg)"/>
<text x="602" y="144.5" font-size="14" font-weight="500" style="fill:var(--color-text)">Explorer</text>
<text x="602" y="162" font-size="12.5" style="fill:var(--color-text-muted)">goes deep on ideas</text>
<circle cx="588" cy="140" r="5.5" stroke-width="2" style="fill:var(--color-text-body);stroke:var(--color-bg)"/>
<text x="50" y="206" font-size="13" style="fill:var(--color-text-muted)">own Linux, tools, OpenClaw</text>
<text x="326" y="206" font-size="13" style="fill:var(--color-text-muted)">own OpenClaw</text>
<text x="602" y="206" font-size="13" style="fill:var(--color-text-muted)">own Linux, tools, OpenClaw</text>
<text x="204.163" y="133" text-anchor="middle" font-size="13" style="fill:var(--color-text-secondary)">direct</text>
<text x="473.562" y="133" text-anchor="middle" font-size="13" style="fill:var(--color-text-secondary)">direct</text>
<text x="282" y="225" text-anchor="middle" font-size="13" style="fill:var(--color-text-secondary)">fixes</text>
</svg></div>
<figcaption><span>Helm sees every message and Builder answers when mentioned; agents can also reach each other directly, and Helm can fix Builder's container.</span></figcaption>
</figure>

The agents are the moving parts. The Discord server is what makes them usable.

Each channel is a domain. `#brainstorming` is for thinking out loud. `#write-room` is where Explorer lives. For engineering work, I create a dedicated channel per project, named `#project-xxx`, rather than lumping everything into a generic `#dev`. Builder passively follows these project channels; Helm only comes in when called. The thing I didn't expect to matter so much is the channel topic. That topic is effectively a prompt. The topic for `#write-room` describes Explorer's style and approach. The topic for a project channel carries the codebase context Builder should assume, so the channel itself carries the instruction. I don't have to repeat it every time I show up.

When a conversation starts to go deep, I open a thread. This turned out to be the most useful structural decision. Each thread is its own isolated session. No context bleed between topics, no pollution back to the main channel. I can go deep on a problem, close the thread, and the channel is exactly as I left it. Threads auto-archive when they go quiet, so the visual space stays clean. They also inherit their configuration from the parent channel (mention policies, allowed agents, skills), so they work consistently without any extra setup.

In practice, three kinds of channels emerged. Brainstorming channels are where unstructured ideas land. I open a thread for each new topic to keep conversations isolated. Project channels are for long-running work: when something from a brainstorming thread grows into a real project, it gets its own channel where Helm can push it forward. Automated channels handle recurring tasks, like a `#digest` channel where content summaries arrive daily, or a `#heartbeat` channel for monitoring.

<figure>
<div class="fig-head"><div class="fig-title">Channels for domains, threads for topics</div><div class="fig-sub">Each channel's topic is read as its prompt</div></div>
<div class="fig-draw"><svg id="ch" viewBox="0 0 840 234" role="img" aria-label="How the Discord server is organized: brainstorming, project, and automated channels, each with a topic that works as its prompt. A thread is its own session and inherits the channel's settings, and a brainstorming thread can grow into its own project channel."><style>#ch text{font-family:var(--font-body)}#ch .mono{font-family:var(--font-mono)}</style>
<path d="M30 97.5 L30 168" fill="none" stroke-width="1" stroke-linejoin="round" style="stroke:var(--color-text-muted)"/>
<path d="M26.5 164.0 L30 168 L33.5 164.0" fill="none" stroke-width="1" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(--color-text-muted)"/>
<path d="M130.692 180 L310 180 L310 97.5" fill="none" stroke-width="1" stroke-linejoin="round" style="stroke:var(--color-text-muted)"/>
<path d="M313.5 101.5 L310 97.5 L306.5 101.5" fill="none" stroke-width="1" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(--color-text-muted)"/>
<text x="44" y="22" font-size="12" font-weight="500" class="mono" letter-spacing="0.08em" style="fill:var(--color-text-secondary)">CHANNELS</text>
<text x="44" y="50.5" font-size="14" font-weight="500" style="fill:var(--color-text)">#brainstorming</text>
<text x="44" y="68" font-size="12.5" style="fill:var(--color-text-muted)">unstructured ideas</text>
<text x="44" y="85.5" font-size="12.5" style="fill:var(--color-text-muted)">a thread per topic</text>
<circle cx="30" cy="46" r="5.5" stroke-width="2" style="fill:var(--color-text-body);stroke:var(--color-bg)"/>
<text x="324" y="50.5" font-size="14" font-weight="500" style="fill:var(--color-text)">#project-hobby</text>
<text x="324" y="68" font-size="12.5" style="fill:var(--color-text-muted)">one per project</text>
<text x="324" y="85.5" font-size="12.5" style="fill:var(--color-text-muted)">Builder follows</text>
<circle cx="310" cy="46" r="5.5" stroke-width="2" style="fill:var(--color-text-body);stroke:var(--color-bg)"/>
<text x="604" y="50.5" font-size="14" font-weight="500" style="fill:var(--color-text)">#digest, #heartbeat</text>
<text x="604" y="68" font-size="12.5" style="fill:var(--color-text-muted)">recurring tasks</text>
<circle cx="590" cy="46" r="5.5" stroke-width="2" style="fill:var(--color-text-body);stroke:var(--color-bg)"/>
<text x="44" y="156" font-size="12" font-weight="500" class="mono" letter-spacing="0.08em" style="fill:var(--color-text-secondary)">THREADS</text>
<text x="44" y="184.5" font-size="14" font-weight="500" style="fill:var(--color-text)">Project idea</text>
<text x="44" y="202" font-size="12.5" style="fill:var(--color-text-muted)">own session</text>
<text x="44" y="219.5" font-size="12.5" style="fill:var(--color-text-muted)">inherits settings</text>
<circle cx="30" cy="180" r="5.5" stroke-width="2" style="fill:var(--color-accent);stroke:var(--color-bg)"/>
<text x="44" y="126.25" font-size="13" style="fill:var(--color-text-secondary)">go deep</text>
<text x="220.346" y="173" text-anchor="middle" font-size="13" style="fill:var(--color-text-secondary)">grows into a project</text>
</svg></div>
<figcaption><span>A thread is its own session and inherits its channel's settings; a brainstorming thread can grow into its own project channel.</span></figcaption>
</figure>

One detail that required some thought: `requireMention` is configured per channel, not globally. Helm passively monitors everything by default. But in project channels, Builder is the default observer. She sees everything in her own space, while other agents, including Helm, only engage when explicitly called. I had to list each channel explicitly in the config (it's a whitelist), but Helm manages that since she has visibility across the whole server.

OpenClaw also isolates context per user, which means multiple agents can coexist on the same server without bleeding into each other's sessions. When agents need to coordinate without going through Discord, they can call each other directly over the shared Docker network.

What changed for me isn't speed. It's that parallel work became possible at all.

Parallel work sounds simple, but it has a precondition: the tasks have to be genuinely independent. With a single agent, they aren't. They share context, and mixing them creates confusion. With isolated agents on isolated channels, they are. While Builder is building, I can be thinking with Explorer. While Explorer is drafting, I can be reviewing with Helm. The waiting time between responses, which used to feel like dead time, becomes the space where everything else moves forward.

The other thing that changes is my own mental load. With a single agent, I had to track things myself: what was in progress, where a conversation left off, what context to bring back in. With multiple agents and dedicated channels, I don't have to. The context is just there. I can drop into `#project-hobby` a day later and Builder already knows where things stand. I can pick up a thread with Explorer without re-explaining the idea we were developing. The state lives in the system, not in my head.

The work is still the same: engineering projects, ideas worth writing about, research that feeds both. What changed is how I move between them. Not by switching modes in my head, but by switching channels. The context for each domain is already there, tended by an agent that knows it well.

*Disclaimer: Illustrations are recreated from real sessions for privacy. The agent described in this piece reviewed it for technical accuracy — which felt appropriate.*
