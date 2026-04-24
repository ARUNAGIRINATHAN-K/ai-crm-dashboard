# Secure execution environments

This directory covers where agent-generated code runs safely — sandboxes, VMs, containers, and serverless runtimes that isolate untrusted code from your production infrastructure.

## Why environments matter

When an agent generates and runs code, you're executing untrusted input. This is fundamentally the same security problem as running user-uploaded scripts, and it needs the same level of isolation. The question is always: _what's the blast radius if this code does something malicious or buggy?_

| Isolation level | Blast radius | Speed | Example |
|----------------|-------------|-------|---------|
| Same process | Full system access | Instant | `exec()` in Python — never do this in production |
| Separate process | User-level access | Fast | subprocess with resource limits |
| Container | Namespace-isolated | ~500ms cold start | Docker, Podman |
| microVM | Hardware-level isolation | ~125-300ms cold start | Firecracker, E2B |
| V8 isolate | Memory-isolated | ~0ms cold start | Cloudflare Workers |

The right choice depends on your threat model. If the agent only generates pandas code, a container might be enough. If the agent writes arbitrary Python, you want a microVM.

## Sections

| Topic | File |
|-------|------|
| **Hosted sandboxes** | [sandboxes.md](sandboxes.md) |
| **Container patterns** | [containers.md](containers.md) |
| **Serverless runtimes** | [serverless.md](serverless.md) |

## Decision guide

```
Start here: Who generates the code?
│
├── Your agent (untrusted code)
│   ├── Need <1s cold start? → E2B (Firecracker microVM)
│   ├── Need GPU? → Modal
│   ├── Need full dev environment? → Daytona
│   └── Self-hosting required? → Firecracker or Kata Containers
│
├── Your code (trusted, calling agent APIs)
│   ├── Short-lived functions (<15 min)? → Lambda or Cloud Run
│   ├── Need persistent containers? → Docker / Podman
│   └── Ultra-low latency, simple logic? → Cloudflare Workers
│
└── Mixed (trusted orchestrator + untrusted agent code)
    └── Run orchestrator on your infra, sandbox agent code in E2B or Modal
```
