I've been running a multi-agent setup on Discord, and it's changed how I manage my day-to-day more than I expected.

The core idea: instead of one AI assistant stretched across everything, split the work into dedicated agents, each with its own domain, its own context, and its own environment. One orchestrates. One codes. One thinks with me about ideas. They don't share context, and that's the point.

The surprising part was where I ended up running them: Discord. Channels map naturally to domains. Threads give you context isolation for free. The channel topic acts as a persistent prompt, so the instruction lives in the space, not in my head. I didn't have to build any of this structure. It was already there.

Docker containers keep the agents genuinely separated. Different environments, independent upgrades, separate failure domains. One can crash without taking the others down. That isolation is what makes the whole thing reliable enough to actually depend on.

What changed for me isn't speed. It's that parallel work became possible at all. While one agent is building, I can be developing an idea with another. The dead time between responses used to feel like waiting. Now it's where everything else moves forward.

The other shift I didn't expect: my mental load dropped. I used to track where every conversation left off, what context to bring back in, what was still in progress. Now the state lives in the system. I can come back to a channel a day later and pick up exactly where things were.

I wrote up the full architecture, the trade-offs, and what I learned along the way:

https://yaodong.dev/the-multi-agent-setup-i-actually-use/
