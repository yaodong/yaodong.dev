Kamal is a tool developed by 37signals. It automates Docker deployments with zero downtime and uses Traefik as a reverse proxy. This setup routes traffic and manages containers automatically, simplifying application scaling in Docker environments.

By default, Kamal sets Traefik to listen on port 80. Enabling HTTPS requires extra steps for SSL/TLS termination. Most users choose Let's Encrypt for this. However, using custom certificates can be tricky, including self-signed or Cloudflare origin server certificates.

I wanted to use Cloudflare for my SSL/TLS setup, but I couldn't find many examples of how to do it. After learning about Traefik, I successfully implemented this approach and documented the process. This guide can help others who want to use a similar setup.

Happy deploying!

https://yaodong.dev/how-to-configure-kamal-deployment-with-cloudflare-origin-certificates-and-traefik/
