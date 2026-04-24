# Multi-agent collaboration pattern

In the multi-agent pattern, multiple specialized agents collaborate to solve a problem that's too broad or complex for a single agent. Each agent has a focused role, its own system prompt, and potentially its own set of tools. A coordinator (human, LLM, or rule-based router) manages communication between agents.

This pattern is inspired by organizational design: just as a company has specialists (researcher, developer, reviewer), a multi-agent system assigns roles to maximize the quality of each sub-task.

## How it works

```
                    ┌──────────────┐
                    │ COORDINATOR  │
                    │ (router /    │
                    │  orchestrator)│
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
       ┌──────▼─────┐ ┌───▼──────┐ ┌──▼──────────┐
       │ RESEARCHER │ │ CODER    │ │ REVIEWER     │
       │            │ │          │ │              │
       │ Tools:     │ │ Tools:   │ │ Tools:       │
       │ - search   │ │ - editor │ │ - linter     │
       │ - reader   │ │ - runner │ │ - test runner│
       │ - memory   │ │ - git    │ │ - formatter  │
       └────────────┘ └──────────┘ └──────────────┘
```

### Communication topologies

| Topology | How agents communicate | Best for |
|----------|----------------------|----------|
| **Star (centralized)** | All agents talk through a coordinator | Clear hierarchy, simple routing |
| **Chain (sequential)** | Agent A → Agent B → Agent C | Pipeline workflows (research → write → review) |
| **Mesh (peer-to-peer)** | Any agent can message any other agent | Debate, brainstorming, collaborative problem-solving |
| **Hierarchical** | Manager agents delegate to worker agents | Complex orgs with multiple teams |

## Python pseudocode

```python
def multi_agent_system(task: str, max_rounds: int = 10):
    # Define agents with different roles and tools
    researcher = Agent(
        role="researcher",
        system_prompt="You research topics thoroughly using search tools.",
        tools=[search, read_url, memory_store],
    )
    coder = Agent(
        role="coder",
        system_prompt="You write clean, tested code based on requirements.",
        tools=[code_editor, sandbox, git],
    )
    reviewer = Agent(
        role="reviewer",
        system_prompt="You review code for bugs, style, and correctness.",
        tools=[linter, test_runner],
    )
    coordinator = Agent(
        role="coordinator",
        system_prompt="You break down tasks and assign them to the right agent.",
        tools=[],
    )

    # Coordinator creates a plan and assigns work
    assignments = coordinator.plan(task)
    # assignments = [
    #     {"agent": "researcher", "task": "Find best practices for X"},
    #     {"agent": "coder", "task": "Implement X based on research"},
    #     {"agent": "reviewer", "task": "Review the implementation"},
    # ]

    context = {}
    for assignment in assignments:
        agent = get_agent(assignment["agent"])
        result = agent.execute(
            task=assignment["task"],
            context=context,  # Previous agents' results
        )
        context[assignment["agent"]] = result

    return context


# Variation: Debate topology
def multi_agent_debate(question: str, num_rounds: int = 3):
    agents = [
        Agent(role="advocate", system_prompt="Argue FOR the position."),
        Agent(role="critic", system_prompt="Argue AGAINST the position."),
        Agent(role="synthesizer", system_prompt="Find the truth between positions."),
    ]

    debate_history = []
    for round in range(num_rounds):
        for agent in agents:
            response = agent.respond(question, debate_history)
            debate_history.append({"agent": agent.role, "content": response})

    # Final synthesis
    return agents[2].synthesize(debate_history)
```

## Real libraries that implement multi-agent

| Library | How it implements multi-agent | Language |
|---------|------------------------------|----------|
| **[CrewAI](https://github.com/crewAIInc/crewAI)** | Role-based agents with sequential or hierarchical process | Python |
| **[AutoGen](https://github.com/microsoft/autogen)** | `GroupChat` with multiple `AssistantAgent` instances | Python |
| **[LangGraph](https://github.com/langchain-ai/langgraph)** | Multi-agent graphs with supervisor or swarm patterns | Python, TS |
| **[Agency Swarm](https://github.com/VRSEN/agency-swarm)** | OpenAI Assistants–based multi-agent orchestration | Python |
| **[Swarm](https://github.com/openai/swarm)** | Lightweight multi-agent handoff framework from OpenAI | Python |
| **[MetaGPT](https://github.com/geekan/MetaGPT)** | Software company simulation with PM, architect, and engineer roles | Python |

## When to use multi-agent vs. other patterns

| Factor | Multi-agent | Single agent (ReAct) | Plan-and-execute |
|--------|------------|---------------------|-----------------|
| Task breadth | Wide (needs diverse expertise) | Narrow to medium | Medium to wide |
| Cost | Highest (N agents × M steps) | Medium | Lower |
| Complexity | High (communication overhead) | Low | Medium |
| Parallelism | Natural (agents work in parallel) | None | Some (independent steps) |
| Debugging | Hard (trace across agents) | Easy (single trace) | Medium |
| Best for | Complex projects, diverse tasks | Focused tasks | Structured pipelines |

**Use multi-agent when**:
- The task genuinely requires different expertise (research + coding + review)
- Parallel execution would significantly reduce total time
- You want separation of concerns (each agent has focused, testable behavior)
- Different sub-tasks need different tools or different models

**Don't use multi-agent when**:
- A single agent with the right tools can handle it (most tasks)
- The communication overhead outweighs the benefit
- Debugging and observability are critical (multi-agent is harder to trace)
- Budget is limited (N agents means N× the cost)

## Common failure modes and fixes

### 1. Agent role confusion

**Symptom**: Agents step on each other's toes — the researcher writes code, the coder does research.

**Fix**: Make role boundaries explicit in system prompts. List what each agent should and should NOT do. Restrict tool access per agent.

```python
researcher = Agent(
    system_prompt="""You are a researcher. You ONLY search and summarize.
    You do NOT write code, make decisions, or produce final outputs.
    If a task requires coding, say 'This task should be assigned to the coder.'""",
    tools=[search, read_url],  # No code tools
)
```

### 2. Communication overload

**Symptom**: Agents produce long messages that other agents struggle to process.

**Fix**: Enforce output structure and length limits. Use schemas for inter-agent messages.

### 3. Coordinator bottleneck

**Symptom**: The coordinator makes bad routing decisions, sending tasks to the wrong agent.

**Fix**: Use rule-based routing for clear cases, LLM routing only for ambiguous cases. Include examples of correct routing in the coordinator's prompt.

### 4. Infinite delegation loops

**Symptom**: Agent A delegates to Agent B, who delegates back to Agent A.

**Fix**: Track delegation chains. If an agent receives a task it already delegated, force it to handle it directly.

### 5. Context loss between agents

**Symptom**: Agent B doesn't have the context it needs from Agent A's work.

**Fix**: Use a shared context object or memory store that all agents can read and write. Alternatively, include relevant summaries when passing tasks between agents.

## Design guidelines

1. **Start with one agent.** Only add agents when you've identified a clear bottleneck or role boundary. Most tasks don't need multi-agent.

2. **Minimize communication surface.** Each inter-agent message is a potential failure point. Prefer sequential handoffs over mesh topologies.

3. **Give each agent the minimum tools it needs.** A reviewer with write access defeats the purpose of having a reviewer.

4. **Make agents independently testable.** Each agent should work correctly in isolation before you wire them together.

5. **Add observability from day one.** Log every message, every tool call, every handoff. Multi-agent debugging without logs is miserable.
