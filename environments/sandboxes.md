# Hosted sandboxes

Hosted sandboxes are managed services that run untrusted agent-generated code in isolated environments. You don't manage the infrastructure — you make an API call, code runs in a sandbox, and you get the result back.

## Why hosted sandboxes

Running agent-generated code safely requires isolation. Building that isolation yourself means managing VMs, container runtimes, networking, and security updates. Hosted sandboxes abstract all of that behind an API.

The tradeoff is cost and control. You pay per execution, and you're limited to what the sandbox provider supports. For most agent use cases, this tradeoff is worth it.

## Comparison

| Service | Isolation | Cold start | Max execution | SDK languages | Persistent storage | GPU | Pricing model |
|---------|-----------|------------|--------------|---------------|-------------------|-----|--------------|
| **E2B** | microVM (Firecracker) | ~300ms | Configurable | Python, TS, Go | Yes (filesystem) | No | Per-second |
| **Modal** | Container + gVisor | ~500ms | Configurable | Python | Yes (volumes) | Yes | Per-second |
| **Daytona** | Container / VM | ~2s | Persistent | Python, TS, Go | Yes | No | Open source / hosted |
| **CodeSandbox SDK** | microVM | ~1s | Persistent | Python, TS | Yes | No | Per-sandbox |

## Detailed entries

**[E2B](https://github.com/e2b-dev/e2b)** — Runs agent-generated code in secure cloud sandboxes with sub-second start. Cold start: ~300ms. Isolation: VM (Firecracker). SDK: Python, TypeScript, Go. Tags: `execution` `sandbox` `python` `typescript` `e2b`

E2B is purpose-built for AI agents. Each sandbox is a full-blown Firecracker microVM with its own filesystem, networking, and process isolation. You can create custom sandbox templates with pre-installed dependencies, which drastically reduces setup time for repeated use.

```python
from e2b_code_interpreter import Sandbox

sandbox = Sandbox()
result = sandbox.run_code("import pandas as pd; print(pd.__version__)")
print(result.text)
sandbox.kill()
```

**[Modal](https://github.com/modal-labs/modal-client)** — Runs functions in cloud containers with GPU support and auto-scaling. Cold start: ~500ms. Isolation: container + gVisor. SDK: Python. Tags: `execution` `sandbox` `python` `modal`

Modal is a broader compute platform, but its fast container startup and GPU support make it excellent for agents that need to run ML models, process images, or do heavy computation. The `@modal.function` decorator makes it trivial to offload specific agent steps.

```python
import modal

app = modal.App("agent-sandbox")

@app.function()
def run_agent_code(code: str):
    exec(code)  # Isolated in Modal's container, not on your machine
```

**[Daytona](https://github.com/daytonaio/daytona)** — Creates standardized development environments for agents to work in. Cold start: ~2s. Isolation: container or VM. SDK: Python, TypeScript, Go. Tags: `execution` `sandbox` `python` `typescript` `daytona`

Daytona is designed for persistent development environments rather than ephemeral code execution. It's a good fit when the agent needs a long-running workspace — e.g., a coding agent that needs to clone a repo, make changes, and run tests over several minutes.

**[CodeSandbox SDK](https://github.com/codesandbox/codesandbox-sdk)** — Provides instant, forkable cloud environments for running agent code. Cold start: ~1s. Isolation: microVM. SDK: Python, TypeScript. Tags: `execution` `sandbox` `python` `typescript`

CodeSandbox gives each execution a full microVM with snapshotting and forking. This is useful for agents that need to try multiple approaches — fork the sandbox, try approach A in one fork and approach B in another, then keep the one that works.

## When to use what

| Scenario | Recommended |
|----------|-------------|
| Run agent-generated Python snippets | E2B |
| Agent needs GPU for ML inference | Modal |
| Agent needs a persistent dev environment | Daytona |
| Agent needs to try multiple approaches in parallel | CodeSandbox SDK (forking) |
| Agent runs many short functions, need auto-scaling | Modal |
| Cost-sensitive, high volume | Self-host with Firecracker (see below) |

## Self-hosting alternatives

If you can't use hosted sandboxes (compliance, cost, latency), consider running your own isolation layer:

**[Firecracker](https://github.com/firecracker-microvm/firecracker)** — The same microVM technology behind E2B and AWS Lambda. ~125ms cold start, minimal memory overhead. Requires Linux and KVM.

**[gVisor](https://github.com/google/gvisor)** — Google's user-space kernel that intercepts syscalls. Lighter than a full VM, compatible with OCI containers. Used by GKE Sandbox and Cloud Run.

**[Kata Containers](https://github.com/kata-containers/kata-containers)** — Runs standard OCI containers inside lightweight VMs. Combines container UX with VM-level isolation.
