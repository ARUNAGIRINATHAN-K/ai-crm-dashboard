# Agent skills library

This directory contains detailed write-ups for each skill category that agents use to perceive, remember, plan, execute, and communicate.

## Categories

| Skill | What it covers | File |
|-------|---------------|------|
| **Perception** | Web browsing, vision, document parsing, OCR | [perception.md](perception.md) |
| **Memory** | Short-term context, long-term storage, vector stores | [memory.md](memory.md) |
| **Planning** | Task decomposition, reasoning strategies, reflection | [planning.md](planning.md) |
| **Execution** | Code running, tool use, API calling, sandboxes | [execution.md](execution.md) |
| **Communication** | Email, Slack, notifications, human-in-the-loop | [communication.md](communication.md) |

## How skills relate to each other

```
         ┌──────────────┐
         │  Perception  │  ← Agents observe the world
         └──────┬───────┘
                │
         ┌──────▼───────┐
         │    Memory     │  ← Agents store what they learned
         └──────┬───────┘
                │
         ┌──────▼───────┐
         │   Planning    │  ← Agents decide what to do next
         └──────┬───────┘
                │
         ┌──────▼───────┐
         │  Execution    │  ← Agents take action
         └──────┬───────┘
                │
         ┌──────▼───────┐
         │Communication  │  ← Agents report results
         └──────────────┘
```

In practice, these aren't strictly sequential. A planning step might trigger new perception (searching for more data), and execution might update memory. The categories are a useful mental model, not a rigid pipeline.

## Entry format

Every entry in this directory follows the same template:

```markdown
**[Project Name](url)** — One sentence describing what it enables an agent to do. Tags: `category` `language` `framework`
```

See [CONTRIBUTING.md](../CONTRIBUTING.md) for the full tag taxonomy and submission guidelines.
