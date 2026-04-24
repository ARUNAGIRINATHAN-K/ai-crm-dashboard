# Agentic patterns

This directory contains in-depth explanations of common design patterns used in agentic workflows. Each pattern answers: _when should I use this, how does it work, and what can go wrong?_

## Patterns

| Pattern | What it does | When to use |
|---------|-------------|-------------|
| [ReAct](react-pattern.md) | Interleaves reasoning and tool use in a loop | Single-agent tasks needing real-time tool interaction |
| [Plan-and-execute](plan-and-execute.md) | Plans all steps upfront, then executes them | Complex tasks with clear decomposition |
| [Reflection loop](reflection-loop.md) | Agent critiques and improves its own output | Tasks where output quality matters more than speed |
| [Multi-agent](multi-agent.md) | Multiple specialized agents collaborate | Problems requiring diverse expertise or parallel work |

## How to pick a pattern

```
Start here: How complex is the task?
│
├── Simple (1-3 steps, one tool)
│   └── Direct prompting — no pattern needed
│
├── Medium (3-10 steps, multiple tools)
│   ├── Steps depend on tool outputs? → ReAct
│   └── Steps can be planned upfront? → Plan-and-execute
│
├── Complex (10+ steps, multi-faceted)
│   ├── Single domain, needs iteration? → Reflection loop
│   └── Multiple domains, needs diverse expertise? → Multi-agent
│
└── Uncertain (don't know which approach will work)
    └── Start with ReAct, add reflection if quality is low,
        split into multi-agent if scope is too broad
```

## Combining patterns

These patterns aren't mutually exclusive. Production systems often combine them:

- **ReAct + Reflection**: Run a ReAct loop, then reflect on the final output and iterate
- **Plan-and-execute + ReAct**: Plan the overall steps, then use ReAct for each individual step
- **Multi-agent + Reflection**: Each agent uses reflection internally, a meta-agent reviews the combined output
- **Plan-and-execute + Multi-agent**: Plan the overall approach, assign steps to different specialized agents
