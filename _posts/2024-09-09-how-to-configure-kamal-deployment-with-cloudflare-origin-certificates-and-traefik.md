---
layout: post
title: How to Configure Your Kamal Deployment with Cloudflare Origin Certificates and Traefik
excerpt: Learn how to secure your Kamal deployments using Cloudflare Origin Certificates and Traefik.
created_date: 2024-09-09
updated_date: 2024-09-09
---

Kamal, developed by 37signals, is a flexible tool for automating Docker deployments and streamlining the process. One of its key features is ensuring zero-downtime deployments. To achieve this, Kamal uses Traefik as a reverse proxy to route traffic to the correct container. Traefik is a popular reverse proxy that can automatically discover new containers and create routing rules for them. This makes it easy to manage and scale applications in a dynamic environment like Docker.

By default, Kamal configures Traefik to listen on port 80 only. To enable HTTPS, you need to configure Traefik to handle SSL/TLS termination or use a separate load balancer in front of it. While these are common setups, they can be tricky to implement if you're not familiar with Traefik's configuration, especially when using custom certificates such as self-signed ones or Cloudflare origin server certificates.

While the configuration is not complicated, it's beneficial to understand how Traefik works before we guide you through the process of setting it up with a custom certificate.

## How Traefik Works

- **entrypoints**: Traefik manages incoming requests through defined _entrypoints_, which are specific ports or protocols.
- **routes**: Once traffic hits an entrypoint, Traefik uses _routes_ to decide where the request should go. Routes match incoming requests based on rules like domain name, URL patterns, or headers.
- **services**: After a route is matched, Traefik forwards the request to the appropriate _service_, which represents the actual backend application.

We're keeping things simple here, so we skipped advanced features like providers and middlewares. Don't worry – you don't need them for this setup.

## Define an HTTPS Entrypoint

The first step is to define an entrypoint for HTTPS traffic. This can be achieved by adding the following configuration to Kamal:

```yaml
traefik:
  options:
    publish:
      - "443:443"
  args:
    entryPoints.web.address: ":80"
    entryPoints.websecure.address: ":443"
    entrypoints.websecure.http.tls: true
```

This configuration tells Traefik to recognize that port 443 is designated for handling HTTPS requests. However, it will use an automatically generated default certificate to handle HTTPS requests. Next, we need to configure Traefik to use our custom certificate.

## Prepare Certificate Files

Before updating the Traefik configuration:

1. Download the certificate and private key from the Cloudflare dashboard, under the "Origin Server" section. The certificate file should be in PEM format.
2. Upload the certificate and private key to the server where Traefik is running.
3. Mount the certificate files into the Traefik container.

Update the deploy configuration as follows:

```yaml
traefik:
  options:
    publish:
      - "443:443"
    volume:
      - "/var/local/certs:/var/local/certs:ro"
  args:
    entryPoints.web.address: ":80"
    entryPoints.websecure.address: ":443"
    entrypoints.websecure.http.tls: true
```

## Configure Traefik to Use the Custom Certificate

Traefik's configuration is split into static and dynamic types:

- **Static configuration** sets up core components like entry points, providers, and logging, and is loaded when Traefik starts. It remains unchanged until restart.
- **Dynamic configuration** handles routing rules, services, and middlewares, managing how traffic is processed. It can be updated in real-time without restarting Traefik, as it's fetched from sources like Docker, Kubernetes, or files. We will use a file in this case.

Create a dynamic configuration file (`dynamic.yml`) with the following content:

```yaml
tls:
  certificates:
    - certFile: /var/local/certs/example.com.pem
      keyFile: /var/local/certs/example.com.key
```

In the configuration file, simply list the certificate and key files. There's no need to specify which domain names correspond to which certificates. Traefik automatically matches certificates to domain names using the SNI (Server Name Indication) header from incoming requests.

Then, use labels to tell Traefik to use the configuration in `dynamic.yml`. The updated Traefik configuration should look like this:

```yaml
traefik:
  options:
    publish:
      - "443:443"
    volume:
      - "/var/local/traefik:/var/local/traefik:ro"
      - "/var/local/certs:/var/local/certs:ro"
  args:
    entryPoints.web.address: ":80"
    entryPoints.websecure.address: ":443"
    entrypoints.websecure.http.tls: true
    providers.file.filename: "/var/local/traefik/dynamic.yml"
```

After making these configuration changes, you must re-create the Traefik container for the new settings to take effect. Execute the following command:

```bash
kamal traefik reboot
```

This command will reboot stop container, remove container, start new container with new configuration.

## Configure Routing Rules

Now that Traefik knows how to handle HTTPS requests and select the correct SSL certificate, we need to add a routing rule to the web server:

```yaml
servers:
  web:
    hosts:
      - 127.0.0.1
    labels:
      traefik.http.routers.app_secure.entrypoints: websecure
      traefik.http.routers.app_secure.rule: Host(`example.com`)
```

After making these configuration changes, you need to apply them for the new settings to take effect. Execute the following commands:

```bash
kamal deploy
```

## Ready to Go

With these steps completed, Traefik can now handle HTTPS requests, use the Origin Server Certificate, and route requests to the web server. You can set the SSL setting in Cloudflare to Full or Full (strict).

Happy deploying!
