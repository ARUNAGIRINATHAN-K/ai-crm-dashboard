# Plan-and-execute pattern

Plan-and-execute separates **planning** (deciding what to do) from **execution** (doing it). First, the agent generates a complete plan — a sequence of steps with dependencies. Then, a separate execution loop carries out each step. If a step fails, the planner re-plans from the current state.

This pattern was formalized in [Plan-and-Solve Prompting](https://arxiv.org/abs/2305.04091) (Wang et al., 2023) and is the default architecture in many production agent systems.

## How it works

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  ┌──────────┐     ┌──────────────────────────────┐   │
│  │ PLANNER  │────▶│ Step 1: Search for X         │   │
│  │ (LLM)    │     │ Step 2: Parse results         │   │
│  │          │     │ Step 3: Analyze data           │   │
│  │          │     │ Step 4: Write report           │   │
│  └──────────┘     └──────────────┬───────────────┘   │
│                                  │                    │
│  ┌──────────────────────────────▼───────────────┐    │
│  │                  EXECUTOR                     │    │
│  │                                               │    │
│  │  Step 1: ✅ Done → result_1                   │    │
│  │  Step 2: ✅ Done → result_2                   │    │
│  │  Step 3: ❌ Failed → error                    │    │
│  │                                               │    │
│  └──────────────────────────────┬───────────────┘    │
│                                  │                    │
│  ┌──────────────────────────────▼───────────────┐    │
│  │               RE-PLANNER                      │    │
│  │  "Step 3 failed because... New plan:          │    │
│  │   Step 3b: Try alternative approach            │    │
│  │   Step 4: Write report (unchanged)"            │    │
│  └──────────────────────────────────────────────┘    │
│                                                      │
└──────────────────────────────────────────────────────┘
```

The key insight is that **planning and execution use different LLM calls** (and potentially different models). The planner can use a stronger model (GPT-4, Claude) for better reasoning, while the executor can use a faster model for routine tool calls.

## Python pseudocode

```python
def plan_and_execute(task: str, tools: list, max_replans: int = 3):
    # Phase 1: Plan
    plan = planner_llm.generate_plan(task)
    # plan = [
    #     {"step": 1, "action": "search", "input": "...", "depends_on": []},
    #     {"step": 2, "action": "parse",  "input": "$1.output", "depends_on": [1]},
    #     {"step": 3, "action": "analyze","input": "$2.output", "depends_on": [2]},
    # ]

    results = {}
    replans = 0

    while plan:
        step = plan.pop(0)

        # Resolve dependencies
        resolved_input = resolve_refs(step["input"], results)

        # Execute
        try:
            result = execute_tool(step["action"], resolved_input)
            results[step["step"]] = result
        except Exception as e:
            if replans >= max_replans:
                return f"Failed after {max_replans} re-plans: {e}"

            # Re-plan from current state
            remaining_steps = plan
            new_plan = planner_llm.replan(
                original_task=task,
                completed=results,
                failed_step=step,
                error=str(e),
                remaining=remaining_steps,
            )
            plan = new_plan
            replans += 1

    # Generate final answer from all results
    return planner_llm.synthesize(task, results)


def resolve_refs(input_str: str, results: dict) -> str:
    """Replace $N.output references with actual results."""
    for step_num, result in results.items():
        input_str = input_str.replace(f"${step_num}.output", str(result))
    return input_str
```

## Real libraries that implement plan-and-execute

| Library | How it implements plan-and-execute | Language |
|---------|----------------------------------|----------|
| **[LangGraph](https://github.com/langchain-ai/langgraph)** | Custom graph with planner node + executor nodes + re-planner node | Python, TS |
| **[CrewAI](https://github.com/crewAIInc/crewAI)** | `Process.sequential` with task dependencies and delegation | Python |
| **[AutoGen](https://github.com/microsoft/autogen)** | `GroupChat` with a planner agent orchestrating executor agents | Python |
| **[Semantic Kernel](https://github.com/microsoft/semantic-kernel)** | `Planner` class generates and executes step-by-step plans | Python, C# |
| **[DSPy](https://github.com/stanfordnlp/dspy)** | Optimized multi-step pipelines with automatic prompt tuning | Python |

## When to use plan-and-execute vs. other patterns

| Factor | Plan-and-execute | ReAct | Reflection |
|--------|-----------------|-------|------------|
| Planning overhead | One LLM call upfront | None (implicit) | None |
| Adaptability | Re-plan on failure | Naturally adaptive | Iterates on output |
| Parallelism | Steps without dependencies can run in parallel | Strictly sequential | Sequential |
| Cost | Lower (fewer LLM calls total) | Higher (LLM call per step) | 2x base cost |
| Best for | Multi-step tasks with clear structure | Exploratory, tool-heavy tasks | Quality-focused tasks |

**Use plan-and-execute when**:
- The task has 5+ steps that can be identified upfront
- Some steps can run in parallel (fan-out)
- You want to use a cheaper model for execution
- The task structure is similar to previous tasks (plan templates)

**Don't use plan-and-execute when**:
- You don't know what steps are needed until you start
- Every step depends on the output of the previous step (use ReAct instead)
- The task is simple enough that planning adds overhead without value

## Common failure modes and fixes

### 1. Over-detailed plans

**Symptom**: The planner generates 20 micro-steps for a simple task.

**Fix**: Instruct the planner to generate 3-7 high-level steps. Each step should be meaningful, not trivial.

```python
PLANNER_PROMPT = """Generate a plan with 3-7 steps.
Each step should represent a meaningful unit of work, not a trivial action.
Bad: "Step 1: Open browser. Step 2: Type URL. Step 3: Press Enter."
Good: "Step 1: Navigate to the pricing page and extract plan details." """
```

### 2. Rigid plans that don't survive execution

**Symptom**: Step 3 assumes step 2 returns data in a specific format, but it doesn't.

**Fix**: Make the re-planner robust. After each step, check whether the remaining plan still makes sense given the actual output. Re-plan early, not just on failure.

### 3. Context loss between planner and executor

**Symptom**: The executor doesn't understand why a step is needed or what exactly to do.

**Fix**: Include context in each step — not just "search for X" but "search for X because we need to find Y for the final report."

### 4. Parallel steps with subtle dependencies

**Symptom**: Steps 2 and 3 are marked as independent, but step 3 actually needs step 2's output.

**Fix**: Have the planner explicitly list dependencies for each step. Only run steps in parallel if their dependency lists don't overlap.

### 5. Re-planning loops

**Symptom**: The re-planner keeps generating plans that fail in the same way.

**Fix**: Pass the history of failed plans to the re-planner. Set a max re-plan count. After N failures, escalate to a human or try a fundamentally different approach.
