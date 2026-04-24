# Serverless runtimes for agent steps

Serverless platforms let you run individual agent steps as functions without managing servers. Each step scales independently, you pay only for execution time, and the platform handles provisioning, scaling, and fault tolerance.

## Why serverless for agents

Not every agent step needs a persistent server. A research agent that calls a search API, processes results, and writes a summary can run each step as a serverless function. Benefits:

- **No idle cost**: Functions scale to zero when not in use
- **Auto-scaling**: Handles bursts of agent tasks without capacity planning
- **Built-in retries**: Most platforms have retry and dead-letter queue support
- **Managed runtimes**: No OS patching, no Docker image management

The tradeoff is cold start latency, execution time limits, and less control over the environment.

## Comparison

| Platform | Isolation | Cold start | Max execution | Max memory | SDK languages | Notes |
|----------|-----------|------------|--------------|------------|---------------|-------|
| **AWS Lambda** | Firecracker microVM | 200ms-1s | 15 minutes | 10 GB | Python, TS, Go, Rust, Java | Largest ecosystem, most integrations |
| **Google Cloud Run** | gVisor | 500ms-2s | 60 minutes | 32 GB | All (container-based) | Longer timeout, full container flexibility |
| **Cloudflare Workers** | V8 isolate | ~0ms | 30s (free) / 5min (paid) | 128 MB | TS, Rust (WASM) | Ultra-fast, but limited runtime APIs |
| **Azure Functions** | Hyper-V | 500ms-2s | 10 minutes (Consumption) | 1.5 GB | Python, TS, C#, Java | Deep Azure ecosystem integration |
| **Vercel Functions** | Container | 250ms-1s | 5 minutes (Pro) | 3 GB | TS, Python, Go, Ruby | Optimized for web-facing agent endpoints |

## Detailed entries

**[AWS Lambda](https://github.com/aws/aws-lambda-python-runtime-interface-client)** — Runs agent steps as serverless functions with Firecracker isolation. Cold start: 200ms-1s. Isolation: microVM. SDK: Python, TS, Go, Rust. Tags: `execution` `sandbox` `python` `typescript`

Lambda is the most mature serverless platform. For agents, it works well for individual steps (search, parse, summarize) that complete in under 15 minutes. Use Step Functions to chain multiple Lambda steps into a workflow with retries and branching.

**[Google Cloud Run](https://github.com/GoogleCloudPlatform/cloud-run-samples)** — Runs containerized agent steps with request-based auto-scaling. Cold start: 500ms-2s. Isolation: gVisor. SDK: All. Tags: `execution` `sandbox` `python`

Cloud Run's 60-minute timeout and container-based model make it the best serverless option for longer-running agent tasks. Package your agent step as a Docker container, deploy it, and Cloud Run handles scaling and routing.

**[Cloudflare Workers](https://github.com/cloudflare/workers-sdk)** — Executes lightweight agent logic at the edge with zero cold start. Cold start: ~0ms. Isolation: V8 isolate. SDK: TypeScript, Rust (WASM). Tags: `execution` `typescript`

Workers have no cold start, making them ideal for latency-sensitive agent endpoints (e.g., webhook handlers, routing logic, lightweight transformations). However, the 128MB memory limit and restricted runtime APIs make them unsuitable for heavy computation.

**[Modal](https://github.com/modal-labs/modal-client)** — Runs serverless functions with GPU access and fast cold starts. Cold start: ~500ms. Isolation: container + gVisor. SDK: Python. Tags: `execution` `sandbox` `python` `modal`

Modal bridges the gap between traditional serverless and container platforms. It supports GPU workloads (useful for agents running local ML models), has faster cold starts than Lambda for custom environments, and handles dependency management automatically.

## Patterns for agent workflows

### Pattern 1: Fan-out / fan-in

Run multiple agent steps in parallel using serverless functions, then aggregate results.

```python
# AWS Lambda + Step Functions (conceptual)
# Fan-out: search 5 sources simultaneously
# Fan-in: merge and rank all results

workflow = {
    "fan_out": {
        "type": "parallel",
        "branches": [
            {"function": "search_source_1"},
            {"function": "search_source_2"},
            {"function": "search_source_3"},
        ]
    },
    "fan_in": {
        "function": "merge_and_rank",
        "input": "$fan_out.results"
    }
}
```

### Pattern 2: Event-driven agent triggers

Use serverless functions as event handlers that trigger agent workflows.

```python
# Trigger a research agent when a new GitHub issue is labeled "needs-research"
@app.on_event("github.issues.labeled")
def handle_label(event):
    if event.label == "needs-research":
        research_agent.run(
            question=event.issue.title,
            context=event.issue.body,
            callback=post_comment_to_issue
        )
```

### Pattern 3: Serverless tool execution

Run each agent tool as a separate serverless function. The orchestrator calls tools via HTTP, and each tool scales independently.

```
┌──────────────┐
│  Agent       │
│  orchestrator│
└──────┬───────┘
       │ HTTP calls
       ├──▶ /tools/search      (Lambda)
       ├──▶ /tools/parse-pdf   (Cloud Run, needs more memory)
       ├──▶ /tools/run-code    (E2B, needs isolation)
       └──▶ /tools/send-email  (Lambda)
```

## When to use serverless vs. other options

| Scenario | Use serverless? | Why / why not |
|----------|----------------|---------------|
| Short agent steps (<15 min) | Yes | Perfect fit for Lambda |
| Long-running agents (>15 min) | Cloud Run only | Lambda's 15-min limit is too short |
| Agent-generated code execution | No (use E2B/Modal) | Serverless platforms aren't designed for arbitrary code |
| High-frequency agent calls | Yes, with provisioned concurrency | Avoid cold starts with pre-warmed instances |
| Cost-sensitive, bursty traffic | Yes | Pay only for what you use |
| Need GPU | Modal only | Traditional serverless doesn't support GPU |
