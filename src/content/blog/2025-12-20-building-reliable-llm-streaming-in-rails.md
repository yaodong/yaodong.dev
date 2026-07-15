---
layout: post
title: Building Reliable LLM Streaming in Rails
created_date: 2025-12-20T00:00:00.000Z
image: /assets/images/og/2025-12-20-building-reliable-llm-streaming-in-rails.png
excerpt: "My first attempt used Turbo Streams for LLM responses, and timing issues followed. Chunks went missing during page navigation, and connection hiccups left responses truncated. The problem traced back to ActionCable's fire-and-forget model, so I rebuilt the streaming on a different architecture."
---

When I started building an AI chatbot, my first instinct was to reach for Turbo Streams and Active Job. Users would send a message, a background job would call the LLM API, and Turbo Streams would broadcast each chunk to the browser. It felt like the right approach: clean separation of concerns, proper use of job infrastructure for long-running tasks.

It worked, mostly. Then the timing issues appeared.

When the user submitted a message and the page navigated, the Turbo Stream connection was interrupted. By the time the new page reconnected, the stream had already started broadcasting into the void. Responses would be missing their beginning, or wouldn't appear at all. Even without navigation, connection hiccups left responses truncated mid-sentence.

Refreshing fixed it—the database had the complete response—but that's not the experience I wanted. The problem wasn't my code; it was the architecture. ActionCable's fire-and-forget model had no way to recover from a missed broadcast: no replay, no resumption.

I stepped back and asked: what does a *good* streaming mechanism actually need?

## The Requirements

Thinking through my debugging session, I identified seven properties that matter:

**Resumability.** When a client disconnects and reconnects, it should pick up where it left off. SSE handles this with `Last-Event-ID`.

**Reliable delivery.** Fire-and-forget doesn't cut it. Every chunk must arrive, or the response ends up incomplete.

**Message ordering.** Chunks must arrive in sequence. Race conditions that shuffle your paragraphs are not acceptable.

**Non-blocking.** LLM calls take 30-120 seconds. Tying up a Puma thread for that long is a recipe for exhausted capacity. This belongs in background jobs.

**Debuggability.** When something goes wrong, you need to see what happened. Redis Streams let you `XRANGE` and inspect entries. SSE is just HTTP, so you can curl it.

**Error handling.** LLM APIs time out, hit rate limits, and fail. Your job infrastructure should handle retries, not your web server.

**Timeout management.** Connections shouldn't hang forever.

## Why Turbo Streams Falls Short

I wanted Turbo Streams to work. It's built into Rails, familiar, and the developer experience is great for most real-time features. I've used it successfully for notifications, presence indicators, live updates. The pattern felt natural.

But those use cases are different. A missed notification is annoying. A missed chunk in an LLM response is broken.

**At-most-once delivery.** ActionCable broadcasts are fire-and-forget. A brief network interruption means chunks during that window are gone. The client reconnects automatically, but there's no replay mechanism. The response continues from wherever the LLM happens to be, leaving a gap.

**No resumability.** SSE has `Last-Event-ID`, where reconnecting clients tell the server "I got up to event X, continue from there." ActionCable has no equivalent. The protocol doesn't track delivery.

**Race conditions.** The sequence goes: broadcast user's message, enqueue job, job starts streaming assistant's reply. But "broadcast" and "enqueue" are both async. Sometimes the job's first broadcast arrives before the user's own message appears on screen. The UI shows the assistant responding to nothing.

These aren't edge cases. They're inherent to ActionCable's design. It was built for ephemeral updates where occasional loss is acceptable, not for long-running streams where every byte matters.

## The Options

Once I accepted that Turbo Streams wasn't the right tool, I surveyed the alternatives. Four approaches seemed worth considering.

### Direct SSE

The simplest approach, and where I started exploring. Your controller calls the LLM API directly and streams chunks to the browser via Server-Sent Events.

```
Browser <-- SSE --> Controller <-- stream --> LLM API
```

The simplicity is appealing—no extra infrastructure, easy to debug—but it holds a Puma thread for the entire LLM call, potentially 30-120 seconds. With 32 threads, a handful of concurrent requests can exhaust capacity. Error handling inside a web request also gets awkward.

I built a quick prototype. It worked beautifully for a single user. But I kept thinking about those Puma threads. In production, with multiple concurrent users, this would become a bottleneck fast.

### ActionCable + Background Job

This is what I'd tried first, the Rails-native approach. A background job calls the LLM API and broadcasts chunks via Turbo Streams over WebSocket.

```
Browser <-- WebSocket --> ActionCable <-- broadcast --< Background Job <-- stream --> LLM API
```

It's built into Rails, and the LLM call happens in job infrastructure with retry handling. ActionCable uses evented I/O, so WebSocket connections don't hold Puma threads. But the downsides are the ones I'd already hit: fire-and-forget delivery, no resumability, race conditions.

I'd already learned this the hard way.

### Redis Streams + SSE

What if I could get the benefits of both approaches? Keep the LLM call in job infrastructure, but use SSE for delivery to get `Last-Event-ID` resumability.

The idea is to decouple the LLM call from browser delivery entirely. A background job writes chunks to Redis Streams; a separate SSE controller reads and delivers.

```
Browser <-- SSE --> SSE Controller <-- XREAD --> Redis Stream <-- XADD --< Background Job <-- stream --> LLM API
```

This gives you the best of both worlds: LLM calls live in job infrastructure, chunks persist in Redis for resumability, and `Last-Event-ID` just works. The downside is more moving parts: you need Redis, and the SSE controller still holds a Puma thread during delivery.

### External Service (Pusher, Ably)

The fourth option is to offload connection management entirely to a third-party service.

```
Browser <-- WebSocket --> Pusher <-- HTTP POST --< Background Job <-- stream --> LLM API
```

The appeal is obvious: your Puma threads stay free, your servers remain stateless, and you get built-in reconnection and message replay. The cost is an external dependency and vendor lock-in.

## Why I Chose Redis Streams + SSE

I stared at my four options. Direct SSE was too resource-intensive. ActionCable had the problems I'd already hit. Pusher was overkill for a personal project.

Redis Streams + SSE hit the sweet spot for my small app. The LLM calls move to job infrastructure, so retries, rate limits, and timeouts are all handled by Sidekiq or Solid Queue instead of my web server. Chunks persist in Redis, which means when a client disconnects and reconnects with `Last-Event-ID`, it picks up right where it left off. And when something goes wrong, I can `XRANGE` the stream or curl the SSE endpoint directly—no black boxes. Best of all, it's self-contained, with no external services to manage.

### The Tradeoff

There's a catch. The SSE controller still holds a Puma thread while delivering. This is unavoidable with SSE; someone has to keep that HTTP connection open.

But I realized it's not as bad as the direct SSE approach. The thread is blocked on Redis `XREAD`, waiting for chunks to arrive. It's I/O wait, not CPU work. And delivery is usually faster than generation, so the SSE controller catches up to the job, then waits.

For a small app, this is fine. With 32 Puma threads, you'd need 32 simultaneous streams to exhaust capacity. If you're hitting that, you've outgrown "small app" territory and should look at Pusher.

### How It Works

Here's the full flow:

```
1. User submits message
   Browser -- POST --> CompletionsController

2. Controller enqueues job with unique stream key
   Chat::ConverseJob.perform_later(stream_key: "abc123")

3. Controller returns stream key
   Browser <-- { stream_key: "abc123" }

4. Browser opens SSE connection
   Browser -- GET --> /chat/streams/abc123

5. Job streams from LLM API to Redis
   LLM API -- chunks --> Job -- XADD --> Redis Stream

6. SSE controller reads and delivers
   Redis Stream -- XREAD --> StreamsController -- SSE --> Browser
```

Decoupling is what makes this work. The job doesn't know about browser connections. It just writes to Redis. The SSE controller doesn't know about LLM APIs. It just reads from Redis. If the browser disconnects and reconnects, the SSE controller picks up from `Last-Event-ID`, and the job never even notices. Each piece becomes simpler and more testable.

## Implementation

Here are the key pieces.

### Message Submission

```ruby
class Chat::CompletionsController < ApplicationController
  def create
    @dialog = current_user.dialogs.find_or_create_by(id: params[:dialog_id])
    @dialog.messages.create!(role: "user", content: params[:content])

    assistant_message = @dialog.messages.create!(role: "assistant", content: "")
    stream_key = SecureRandom.uuid

    Chat::ConverseJob.perform_later(
      message_id: assistant_message.id,
      stream_key: stream_key
    )

    render json: { stream_key: stream_key, dialog_id: @dialog.id }
  end
end
```

The controller returns immediately with a stream key. No waiting for the LLM. The browser uses this key to open an SSE connection.

### Background Job

The job does the actual work, calling the LLM API and writing chunks to Redis:

```ruby
class Chat::ConverseJob < ApplicationJob
  def perform(message_id:, stream_key:)
    message = Chat::Message.find(message_id)
    content = ""

    RedisStreams.with do |redis|
      redis.xadd(stream_key, { event: "start", message_id: message_id })

      begin
        client.stream(messages: build_messages(message.dialog)) do |chunk|
          content += chunk
          redis.xadd(stream_key, { event: "chunk", content: chunk })
        end

        message.update!(content: content)
        redis.xadd(stream_key, { event: "complete", message_id: message_id })
      rescue => e
        redis.xadd(stream_key, { event: "error", error: e.message })
        raise
      ensure
        redis.expire(stream_key, 1.hour.to_i)
      end
    end
  end
end
```

I use structured events (`start`, `chunk`, `complete`, `error`) to give the frontend clear lifecycle signals. The `ensure` block expires the stream key after an hour, so they don't pile up in Redis.

### SSE Controller

This is where the resumability magic happens:

```ruby
class Chat::StreamsController < ApplicationController
  include ActionController::Live

  def show
    response.headers["Content-Type"] = "text/event-stream"
    response.headers["Cache-Control"] = "no-cache"

    stream_key = params[:id]
    last_id = request.headers["Last-Event-ID"] || "0"

    deadline = 2.minutes.from_now

    while Time.current < deadline
      entries = RedisStreams.with do |redis|
        redis.xread(stream_key, last_id, block: 30_000, count: 100)
      end

      break if entries.nil?

      entries[stream_key]&.each do |id, fields|
        last_id = id
        response.stream.write("id: #{id}\n")
        response.stream.write("event: #{fields['event']}\n")
        response.stream.write("data: #{fields.except('event').to_json}\n\n")

        break if fields["event"].in?(%w[complete error])
      end

      break if entries[stream_key]&.any? { |_, f| f["event"].in?(%w[complete error]) }
    end
  rescue ActionController::Live::ClientDisconnected
    # Client gone, nothing to do
  ensure
    response.stream.close
  end
end
```

Notice `last_id = request.headers["Last-Event-ID"] || "0"`. When a connection drops and the browser reconnects, it sends this header automatically. The controller picks up from that ID, and no chunks are lost. SSE gives you this for free.

The 2-minute deadline prevents connections from hanging forever if something goes wrong.

### Redis Configuration

A simple connection pool:

```ruby
# config/initializers/redis_streams.rb
module RedisStreams
  POOL_SIZE = ENV.fetch("REDIS_STREAMS_POOL_SIZE", 10).to_i
  REDIS_URL = ENV.fetch("REDIS_STREAMS_URL", "redis://localhost:6379/1")

  @pool = ConnectionPool.new(size: POOL_SIZE, timeout: 5) do
    Redis.new(url: REDIS_URL)
  end

  def self.with(&block)
    @pool.with(&block)
  end
end
```

I use a separate Redis database (`:6379/1`) to keep stream keys from colliding with cache keys. It also makes it easier to flush streams during development without clearing your cache.

### Frontend

The JavaScript is straightforward. EventSource does most of the work:

```javascript
import { Controller } from "@hotwired/stimulus"
import { marked } from "marked"
import DOMPurify from "dompurify"

export default class extends Controller {
  static targets = ["messages", "input"]

  async submit(event) {
    event.preventDefault()

    const response = await fetch("/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: this.inputTarget.value })
    })

    const { stream_key } = await response.json()
    this.connectToStream(stream_key)
  }

  connectToStream(streamKey) {
    this.content = ""
    this.eventSource = new EventSource(`/chat/streams/${streamKey}`)

    this.eventSource.addEventListener("chunk", (event) => {
      const data = JSON.parse(event.data)
      this.content += data.content
      this.renderMarkdown()
    })

    this.eventSource.addEventListener("complete", () => {
      this.eventSource.close()
    })

    this.eventSource.addEventListener("error", () => {
      this.eventSource.close()
    })
  }

  renderMarkdown() {
    const html = DOMPurify.sanitize(marked.parse(this.content))
    this.messageElement.innerHTML = html
  }
}
```

You might notice I re-parse the entire markdown on every chunk. This sounds inefficient, but `marked` is fast enough that it doesn't matter. I tried implementing incremental parsing and gave up. The complexity wasn't worth the minimal performance gain.

DOMPurify sanitizes the HTML before injection. LLMs can be tricked into generating malicious content, so this isn't optional.

## Alternative: Pusher

If I were building this for a larger audience, I'd seriously consider Pusher or a similar service.

Your job makes quick HTTP POSTs to Pusher as chunks arrive. Pusher delivers via their WebSocket infrastructure:

```
Browser <-- WebSocket --> Pusher's servers <-- HTTP POST --< Your Background Job <-- stream --> LLM API
```

Puma threads only handle the initial request. Connection management, reconnection, buffering: all Pusher's problem.

The advantages are real: zero thread occupation, built-in reliability, effortless scaling, less code to maintain. The tradeoffs are cost and external dependency.

For my small personal app, I prefer keeping things self-contained. But if I were building a product for others, the operational simplicity of Pusher would be worth the monthly bill.

## Takeaways

I fought race conditions for a while before I understood the problem. ActionCable is great at what it was designed for—presence indicators, notifications, live updates where occasional loss is acceptable. LLM streaming is a different beast. Every chunk matters, and connections will drop.

Redis Streams + SSE turned out to be the sweet spot for my use case. The LLM call lives in job infrastructure where it belongs. Chunks persist in Redis for resumability. I can debug with `XRANGE` and `curl`. It's self-contained.

The thread occupation is a real tradeoff, but an acceptable one for a small app. If you're building something larger, look at Pusher.

The broader lesson: sometimes the Rails way isn't the right way. Know your tools' limitations, and be willing to reach for something else when the requirements don't fit.
