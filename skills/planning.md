# Planning

Planning is the agent's ability to decompose complex tasks into steps, decide what to do next, and adapt when things go wrong. This is arguably the hardest skill to get right — a perception tool either works or it doesn't, but planning failures are subtle and cascading.

## What "planning" means in an agentic context

Planning is not prompt engineering. It's the structured process by which an agent:

1. **Understands the goal** — What does the user actually want?
2. **Decomposes the goal** — What sub-tasks are required?
3. **Orders the sub-tasks** — What depends on what?
4. **Selects tools** — Which skills and tools should handle each sub-task?
5. **Adapts on failure** — When a step fails, how should the plan change?

The simplest "plan" is a single LLM call with a system prompt. The most sophisticated planners use tree search, self-reflection, and multi-agent debate. The right approach depends on task complexity.

## Planning strategies compared

| Strategy | Complexity | Latency | Best for |
|----------|-----------|---------|----------|
| Direct prompting | Low | 1 LLM call | Simple, single-step tasks |
| ReAct | Medium | 3-10 LLM calls | Tasks needing interleaved reasoning and tool use |
| Plan-and-execute | Medium | 2+ LLM calls | Multi-step tasks with clear decomposition |
| Tree of Thoughts | High | 10-50+ LLM calls | Tasks where the first approach might be wrong |
| Reflection/Reflexion | Medium-high | 2x base calls | Tasks where output quality matters more than speed |
| Multi-agent debate | High | N × base calls | Tasks benefiting from diverse perspectives |

See the [`patterns/`](../patterns/) directory for in-depth explanations of each strategy.

## Tools and libraries

### Orchestration frameworks with planning

**[LangGraph](https://github.com/langchain-ai/langgraph)** — Orchestrates multi-step agent workflows as stateful, cyclical graphs. Tags: `planning` `orchestration` `python` `typescript` `langgraph`

**[AutoGen](https://github.com/microsoft/autogen)** — Coordinates multi-agent conversations for collaborative task decomposition. Tags: `planning` `orchestration` `python` `autogen`

**[CrewAI](https://github.com/crewAIInc/crewAI)** — Assigns roles to agents and orchestrates their collaboration on complex tasks. Tags: `planning` `orchestration` `python` `crewai`

**[Pydantic AI](https://github.com/pydantic/pydantic-ai)** — Structures agent outputs and tool calls with type-safe validation. Tags: `planning` `execution` `python`

### Reasoning and search

**[DSPy](https://github.com/stanfordnlp/dspy)** — Optimizes LLM prompts and chains programmatically instead of manually. Tags: `planning` `python`

**[LATS](https://github.com/lapisrocks/LanguageAgentTreeSearch)** — Combines Monte Carlo tree search with LLM reasoning for complex planning. Tags: `planning` `python`

**[Tree of Thoughts](https://github.com/princeton-nlp/tree-of-thought-llm)** — Explores multiple reasoning paths in parallel before committing. Tags: `planning` `python`

**[Reflexion](https://github.com/noahshinn/reflexion)** — Lets agents learn from mistakes via verbal self-reflection loops. Tags: `planning` `python`

### Task-specific planners

**[OpenHands](https://github.com/All-Hands-AI/OpenHands)** — Plans and executes multi-step software engineering tasks autonomously (formerly OpenDevin). Tags: `planning` `execution` `python`

**[Semantic Kernel](https://github.com/microsoft/semantic-kernel)** — Integrates LLM function calling with enterprise plugins and planners. Tags: `planning` `execution` `python` `typescript`

## When to use what — decision guide

```
Start here: How complex is the task?
│
├── Single step, one tool call?
│   └── Direct prompting (no planner needed)
│
├── 2-5 steps, tools needed, might need to retry?
│   └── ReAct pattern (see patterns/react-pattern.md)
│
├── 5+ steps, can be planned upfront?
│   └── Plan-and-execute (see patterns/plan-and-execute.md)
│
├── Uncertain approach, might need to backtrack?
│   └── Tree of Thoughts or LATS
│
├── Output quality is critical, speed is not?
│   └── Reflection loop (see patterns/reflection-loop.md)
│
└── Multiple perspectives needed?
    └── Multi-agent debate (see patterns/multi-agent.md)
```

## Common pitfalls

1. **Over-planning.** Not every task needs a complex planner. If the user asks "what time is it in Tokyo?", a ReAct loop is overhead. Match planner complexity to task complexity.

2. **Plans that never re-plan.** A plan made before execution starts is a guess. Good planners adapt step-by-step based on actual tool outputs, not just the initial decomposition.

3. **Infinite loops.** ReAct and reflection patterns can loop forever if there's no exit condition. Always set a maximum iteration count and a fallback behavior.

4. **Ignoring cost.** Tree of Thoughts with 5 branches × 10 depth = 50 LLM calls. That's $0.50-$5.00+ per task depending on the model. Make sure the quality improvement justifies the cost.
