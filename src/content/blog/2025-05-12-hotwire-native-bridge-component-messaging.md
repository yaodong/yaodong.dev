---
layout: post
title: Understanding Bridge Component Messaging in Hotwire Native
created_date: 2025-05-12T00:00:00.000Z
image: /assets/images/og/2025-05-12-hotwire-native-bridge-component-messaging.png
excerpt: "Bridge components in Hotwire Native intentionally hide navigation from native code. This felt limiting at first. Then I understood: by restricting native-side navigation, Hotwire ensures web and native stay synchronized through URLs. The constraint is the feature."
---

In Hotwire Native, a Bridge Component simultaneously exists in JavaScript and native code. The interaction begins from JavaScript by calling `send(event, data, callback)`. The native side receives a structured `Message` object, processes it, and replies by calling `reply(...)`.

![Hotwire Native Bridge Component Messaging](/assets/images/hotwire-native-bridge-component-messaging.png)

## Why the Bridge Component Hides Navigation

When I first built a native bridge component, I quickly noticed it offered no direct access to navigation. Initially, this felt inconvenient, but I soon understood it was intentional. By restricting native-side navigation, Hotwire Native ensures synchronization between web and native components through URLs.

This design choice encourages developers to follow a clear workflow. The web initiates each interaction by sending a named event with a concise JSON payload. The native side responds strictly by replying to that specific event or sending a clearly defined new event. Navigation is always handled via URLs and Path Configuration, preserving consistency across platforms.

If native navigation were allowed within bridge components, each platform (web, iOS, Android) would require additional synchronization logic. This would complicate scalability, break deep-linking, and eliminate the ability to deploy new features solely through web updates. Thankfully, Hotwire Native's Bridge Component prevents these issues from occurring.

When you do need native-side navigation in a bridge component, a practical workaround is to expose the shared Navigator instance from your SceneDelegate. For example, add a public accessor:

```swift
class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    private let navigator = Navigator()
    func scene(_ scene: UIScene, ... ) {
        window?.rootViewController = UINavigationController(rootViewController: navigator.rootViewController)
        navigator.start()
    }

    // Expose the navigator to other parts of the app
    func currentNavigator() -> Navigator { navigator }
}
```

Then in your component:

```swift
override func onReceive(message: Message) {
    guard let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
          let delegate = scene.delegate as? SceneDelegate else { return }

    let navigator = delegate.currentNavigator()
    if let data: NavigateData = message.data(),
       let url = URL(string: data.url) {
        navigator.visit(url)
        reply(to: message, name: "didNavigate")
    }
}
```

This approach gives you full access to navigation from any bridge component.

## Message Handling and Safe Concurrency

After working with bridge components for a while, I began wondering if things would be simpler if the native side could initiate messages independently, without waiting for the web. At first glance, this seemed appealing. But the more I explored the design, the clearer it became why Hotwire deliberately avoids this approach. By requiring every native response to tie back to a specific message from the web, Hotwire maintains a clear and predictable communication flow.

Each message sent via the Hotwire Native bridge includes a unique message ID and a message type, such as `"connect"` or `"click"`. When JavaScript calls `this.send("connect", {...})`, it wraps the data as JSON, assigns an auto-generated ID, and sends it to the native side through `WKScriptMessageHandler`. Swift then handles it as a structured `Message` object within `onReceive(message:)`.

This message ID is essential because it precisely identifies each interaction. When JavaScript includes a callback, Hotwire temporarily stores it using the message ID. If Swift replies using `reply(to: eventName)`, the response matches the latest event of the same name. While this works well in simple cases, it can cause issues if multiple identical events fire simultaneously.

To solve this, Hotwire provides another method, `reply(with: message)`. By explicitly referencing the original `Message` object, the native side guarantees the correct JavaScript callback receives the response. This completely avoids the common problem of identical components triggering incorrect callbacks.

This clear messaging approach ensures safe concurrent interactions. Even when multiple events fire simultaneously, responses remain accurate, isolated, and clearly tied to their originating messages. It’s a simple yet robust system that holds up under pressure.

## A Clear Messaging Contract Through a Single JSON Channel

From the web application's perspective, each bridge component behaves like a straightforward function call. You send it some data, it triggers native UI elements such as toolbar buttons, action sheets, or bottom sheets, and eventually calls your callback. The native side replies to confirm these actions have completed, allowing Turbo to continue its original flow as if the user had directly interacted with the web interface.

Importantly, the native side cannot independently initiate new messages or conversations. Every native message must be a reply to a previously sent web message, identified either explicitly by referencing the original `Message` object (`reply(with: message)`), or implicitly by using the event name (`reply(to: eventName)`). 

This constraint ensures that communication remains explicit, predictable, and easy to debug. By limiting all interactions to a single JSON channel and enforcing this clear messaging contract, Hotwire Native prevents hidden complexity and keeps interactions stable and transparent over time.

## Intentional Design Encourages Best Practices

What I appreciate most about Hotwire Native’s Bridge Component is how it gently nudges us toward good habits. Instead of letting us take shortcuts like directly controlling native navigation or creating arbitrary message types, it encourages clear communication and predictable interactions. These thoughtful constraints ultimately make our apps simpler to build, easier to debug, and more maintainable over time.
