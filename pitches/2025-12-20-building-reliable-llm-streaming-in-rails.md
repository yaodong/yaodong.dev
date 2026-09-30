When adding an AI feature in Ruby on Rails, the first technical challenge is streaming the LLM response.

I started with Turbo Streams. It's the obvious choice for a small project. But for long-running AI calls, the default "fire-and-forget" model fell apart quickly. Connections dropped. Chunks arrived out of order. Users stared at incomplete answers.

So I stepped back and defined what a good streaming architecture actually needs:

1️⃣ Resumability: If a connection flickers, can the client pick up where it left off?
2️⃣ Ordering: Are race conditions shuffling paragraphs randomly?
3️⃣ Non-blocking: Are 60-second LLM calls tying up web server threads, or living in background jobs where they belong?
4️⃣ Reliability: Does every chunk arrive?

After trying a few approaches, I landed on Redis Streams + Server-Sent Events (SSE).

Why this combination works:

LLM calls stay in background jobs, so the web server remains responsive. Redis persists chunks sequentially, which solves ordering. And SSE's “Last-Event-ID” header gives you resumability for free: reconnecting clients automatically retrieve missed chunks.

It's not trivial to set up, and it's probably overkill for a simple chatbot. But for anything production-grade, the debugging experience alone is worth it. Everything is local and inspectable. No third-party dependencies until you genuinely need to scale.

https://yaodong.dev/building-reliable-llm-streaming-in-rails/
