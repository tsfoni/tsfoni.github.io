---
title: "How I combined free-tier SMTPs to send as many emails as I want for free"
date: "2026-09-13"
author: "Harel Tsfoni"
tags:
  - networking
  - smtp
  - infrastructure
  - side-projects
  - systems
summary: "Every cloud provider gives you a generous free email tier—until you hit their strict daily sending ceiling. Here's how I built a transparent SMTP proxy that pools free tiers, handles quotas, and fails over without touching application code."
---

Every developer running side projects, cron jobs, or internal microservices eventually hits the exact same brick wall: **transactional email limits**.

Almost every modern provider (Resend, Brevo, Mailgun, SendGrid) offers a solid free tier. They give you reliable infrastructure, high inbox deliverability, and pre-configured DKIM/SPF signing. But there's always a catch: **a strict daily sending ceiling**. Usually 100, 200, or 300 emails per day.

Once you hit that limit, bad things happen:
- Your application's emails silently get bounced or throttled.
- You get nudged toward hefty $20–$35/month plans that make zero financial sense for small hobby apps or low-margin tools.
- You do what any scrappy developer does: you sign up for two or three separate free accounts across different providers.

And that's when the real nightmare begins.

> **TL;DR:** Most cloud email providers (Resend, Brevo, SendGrid) offer solid free tiers but cap you at 100–300 emails/day. I vibe-coded [SmartRelay](https://github.com/tsfoni/SmartRelay)—a lightweight ~35MB SMTP proxy that pools multiple free accounts, automatically tracks daily quotas, and seamlessly fails over when one runs out. It gives my side projects **800+ free emails/day** for $0 without writing custom routing logic in my apps.

---

## The "duct tape" trap

If you have a couple of background workers, a personal dashboard, and a staging site, trying to juggle multiple SMTP accounts in code gets ugly fast.

Now your application configuration looks like this:

```yaml
SMTP_PROVIDER_1_KEY=...
SMTP_PROVIDER_2_KEY=...
SMTP_PROVIDER_3_KEY=...
```

Suddenly, your application codebase is burdened with:
1. Tracking how many emails it sent today.
2. Checking calendar dates to know when daily limits reset.
3. Catching `5xx` error codes and implementing custom retry/failover logic between providers.

Why are we writing mail router logic inside our application code? 

In web development, we never make our frontend apps deal with multiple backend servers directly—we put **Nginx**, **Caddy**, or **Traefik** in front. The reverse proxy handles SSL, load balances requests, hides upstream complexity, and fails over silently.

So I asked myself: **why can't outbound SMTP work the exact same way?**

What if all my internal apps, scripts, and containers only ever talked to a single local SMTP server on `localhost:587`, and that server handled accounts, daily quotas, credentials, and failovers behind the scenes?

That’s why I built **SmartRelay**.

```text
[ Web Apps / Cron Workers / Outlook ]
                 │
                 │ 1. Connect to localhost:587 (STARTTLS + Local Auth)
                 ▼
          [ SmartRelay Proxy ]
                 │
                 │ 2. Check Daily Quotas in SQLite (WAL)
                 ├──► Provider Alpha (Free: 300/day) ──► (250 OK -> Quota incremented)
                 │         │ (If exhausted or 5xx error)
                 └──► Provider Beta  (Free: 200/day) ──► (Seamless instantaneous failover)
```

### "Why not just use an existing tool?"

Whenever I talk about this, the first reaction is usually: *"Why didn't you just use Postfix, Haraka, Postal, or a SaaS router?"*

The short answer: **none of them just do this, and the overhead is absurd.**

- **Full-blown open-source mail suites (Postal, Mailcow, Stalwart):** They're great projects, but they're built to run an entire email company. Postal alone requires a MySQL database, a Redis instance, RabbitMQ, background worker daemons, and a full web UI. You're easily burning 2GB–4GB of RAM across half a dozen Docker containers just to relay a handful of transactional notifications.
- **Traditional MTAs (Postfix, Exim):** Decades of enterprise baggage. Postfix wasn't built to dynamically track daily calendar quotas across multiple upstream smarthosts and seamlessly switch credentials per-user on transient errors. You end up trapped in a nightmare of `transport_maps`, `sender_dependent_relayhost_maps`, and brittle cron scripts.
- **Node-based mail daemons (Haraka):** Super flexible, but you still have to write custom plugins to manage quota state across multi-process clusters.
- **SaaS routers:** Existing SaaS options want monthly fees, tie you to their proprietary API, or charge per seat—defeating the entire point of combining free tiers.

I didn't want a 5-container cluster with a Redis database and a dashboard. I wanted a **single lightweight process** on `localhost:587` that takes ~35MB of RAM, keeps state in SQLite, and transparently streams raw RFC 5321 bytes directly to whatever free upstream account still has quota left.

---

## 1. The Strict Transparency Trap (Zero Header Mangling)

When you look at traditional mail transfer agents like Postfix or default mail server libraries, they assume they are either the final destination or a traditional intermediate mail hop. 

Whenever they accept a message, they helpfully prepend a `Received: from ...` header to the top of the email, and sometimes add custom proxy tracking headers like `X-Forwarded-For`.

**In a transparent SMTP proxy, doing this is fatal.**

Here is why:

### 1. You break DKIM signatures
DKIM (DomainKeys Identified Mail) signs specific headers and the message body with a cryptographic hash. If your proxy alters byte ordering, injects whitespace, or modifies headers, the signature breaks. Downstream providers (like Gmail and Outlook) will treat the email as tampered with and dump it straight into spam.

### 2. Spam filters scrutinize the `Received:` chain
Spam filters like SpamAssassin and Google's mail filters inspect every hop in the `Received:` chain. If an internal proxy leaks private IP addresses (`192.168.1.50` or `172.17.0.2`), upstream smarthosts will instantly flag the message as suspicious or reject it outright.

### The Fix: A Pure Byte-Pipe
SmartRelay acts as a **pure byte-pipe**. 

When an internal client executes the SMTP `DATA` phase, SmartRelay captures the raw RFC 822 payload stream completely unadulterated. It preserves the exact `MAIL FROM`, `RCPT TO`, and email body, streaming them byte-for-byte directly to the selected upstream smarthost using standard RFC 5321 transparency. 

Upstream providers have zero idea a local proxy even exists.

---

## 2. The Multi-User Global Quota Puzzle

Another practical issue was handling multi-user quotas:

Say you have two internal services: `worker-service` and `auth-service`. Each service has its own login credentials generated under the same upstream provider account (Provider Alpha), which allows 500 total emails per day.

If you couple credentials directly with the provider pool definition:
* `worker-service` gets an entry with limit: 500
* `auth-service` gets an entry with limit: 500

Combined, they could fire off 800 emails. Both think they have headroom, but as soon as the total passes 500, Provider Alpha cuts off the account, and everything starts failing.

### The Decoupled Model
To fix this, SmartRelay completely decouples **Upstream Providers & Quotas** from **User Credentials**:

```yaml
# 1. Central Upstream Providers & Global Quotas
providers:
  provider_alpha:
    host: "smtp.provider-alpha.com"
    port: 587
    tls_mode: "starttls"
    daily_limit: 500      # Global account ceiling across ALL users

  provider_beta:
    host: "smtp.provider-beta.com"
    port: 587
    tls_mode: "starttls"
    daily_limit: 300

# 2. Inbound Users with their own specific upstream credentials
users:
  - username: "app-prod@mycompany.com"
    password: "local_app_password"
    pool:
      - provider: "provider_alpha"
        username: "alpha_prod_key"
        password: "alpha_prod_secret"
      - provider: "provider_beta"
        username: "beta_prod_key"
        password: "beta_prod_secret"

  - username: "app-staging@mycompany.com"
    password: "local_staging_password"
    pool:
      - provider: "provider_alpha"
        username: "alpha_staging_key"
        password: "alpha_staging_secret"
```

Now, whether `app-prod` or `app-staging` sends an email, the message increments the single shared counter for `provider_alpha`. 

When their combined volume reaches 500, `provider_alpha` is marked full for **everyone**, and both applications seamlessly fail over to `provider_beta` on the next send.

---

## 3. What happens when all free tiers run out?

What if your apps have a crazy traffic spike and *every single provider* in your pool exhausts its daily quota?

Silently swallowing the email is unacceptable. Throwing a fatal `550` permanent error is just as bad, because it causes application queues to delete the message.

SmartRelay returns an official SMTP temporary rejection code:

```text
452 4.4.5 Daily quota exhausted across all available providers
```

Because `452` is a standard RFC `4xx` transient failure code, well-behaved SMTP clients (Postfix, Celery, Laravel Queues, BullMQ, Sidekiq) recognize it as a temporary pause. 

They **keep the email queued and automatically retry later**. When midnight strikes and quotas reset, the queued backlog flows through smoothly without a single lost message.

---

## The Result & Code

SmartRelay packages into a single, lightweight container that consumes around **35MB of RAM**:

```bash
docker compose up -d
```

My apps point to `localhost:587`. When I want to add a new free account or swap providers, I update a single YAML file on the server without touching a single line of application code.

Combining three modest free tiers gives me **800–1,200 free transactional emails per day**, complete with automatic failover and zero maintenance.

The code is up on GitHub: **[tsfoni/SmartRelay](https://github.com/tsfoni/SmartRelay)**. Anyone is free to use it, but fair warning: it is very much **vibe-coded** and something I use locally. It solves my problem, does what it needs to do, and keeps my projects sending mail for $0. If you're building on a budget, give the pattern a try.
