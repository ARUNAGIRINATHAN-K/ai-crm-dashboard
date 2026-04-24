# Real-world workflows

This directory contains detailed write-ups of production agentic workflows — end-to-end pipelines that chain multiple [skills](../skills/README.md) together to accomplish real tasks.

## Workflows

| Workflow | Skills used | File |
|----------|------------|------|
| **Research agent** | Perception → Memory → Planning → Communication | [research-agent.md](research-agent.md) |
| **Code generation** | Planning → Execution → Reflection | [code-generation.md](code-generation.md) |
| **Data pipeline** | Perception → Execution → Communication | [data-pipeline.md](data-pipeline.md) |
| **Browser automation** | Perception → Planning → Execution | [browser-automation.md](browser-automation.md) |

## What makes a workflow different from a skill

A skill is a single capability: "parse a PDF", "search a vector store", "send a Slack message". A workflow chains multiple skills into a pipeline that accomplishes a higher-level goal: "research a topic, synthesize findings, and email a report."

The workflow files in this directory describe:

1. **The pipeline structure** — What steps run, in what order, with what branching
2. **Tools involved** — Which specific libraries and services handle each step
3. **Failure modes** — What can go wrong and how to handle it
4. **Production considerations** — Latency, cost, reliability, and observability

## Entry format

```markdown
**[Project Name](url)** — One sentence describing what it enables. Tags: `tag1` `tag2`
```

See [CONTRIBUTING.md](../CONTRIBUTING.md) for the full tag taxonomy.
