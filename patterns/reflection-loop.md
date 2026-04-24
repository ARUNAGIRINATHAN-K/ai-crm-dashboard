# Reflection loop pattern

The reflection loop is an iterative pattern where an agent generates an output, then **critiques its own output**, and then **revises** the output based on the critique. This cycle repeats until the output meets a quality threshold or a maximum iteration count is reached.

This pattern is inspired by [Reflexion (Shinn et al., 2023)](https://arxiv.org/abs/2303.11366) and is one of the simplest ways to improve agent output quality without changing the underlying model.

## How it works

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│   ┌──────────────┐                                   │
│   │   GENERATE   │  Produce initial output            │
│   │              │  (draft, code, analysis, etc.)     │
│   └──────┬───────┘                                   │
│          │                                           │
│   ┌──────▼───────┐                                   │
│   │   CRITIQUE   │  Evaluate the output against       │
│   │              │  criteria: correctness, quality,   │
│   │              │  completeness, style               │
│   └──────┬───────┘                                   │
│          │                                           │
│          ├──── Good enough? ──── Yes ──▶ Return      │
│          │                                           │
│          No                                          │
│          │                                           │
│   ┌──────▼───────┐                                   │
│   │    REVISE    │  Improve the output based on       │
│   │              │  the specific critique              │
│   └──────┬───────┘                                   │
│          │                                           │
│          └──── Loop back to CRITIQUE ────────────────┘
│                                                      │
└──────────────────────────────────────────────────────┘
```

The power of reflection comes from separation of concerns. The generator focuses on producing output; the critic focuses on finding flaws. This division often catches errors that a single pass would miss.

## Python pseudocode

```python
def reflection_agent(
    task: str,
    max_iterations: int = 3,
    quality_threshold: float = 0.8,
):
    # Step 1: Generate initial output
    output = generator_llm.generate(task)

    for iteration in range(max_iterations):
        # Step 2: Critique
        critique = critic_llm.evaluate(
            task=task,
            output=output,
            criteria=[
                "correctness",
                "completeness",
                "clarity",
                "follows instructions",
            ],
        )
        # critique = {
        #     "score": 0.6,
        #     "issues": ["Missing error handling", "Unclear variable names"],
        #     "suggestions": ["Add try/except around API calls", "Rename x to user_count"],
        # }

        if critique["score"] >= quality_threshold:
            return output

        # Step 3: Revise based on critique
        output = generator_llm.revise(
            task=task,
            current_output=output,
            critique=critique,
        )

    return output  # Return best effort after max iterations


# Variation: Use different models for generator and critic
GENERATOR_PROMPT = """Generate a {task_type} for the following task:
{task}

Focus on producing a complete, working solution."""

CRITIC_PROMPT = """Review the following {task_type} for these criteria:
1. Correctness: Does it work?
2. Completeness: Does it handle edge cases?
3. Clarity: Is it easy to understand?
4. Style: Does it follow best practices?

Output a score (0-1) and a list of specific, actionable issues.
Do NOT suggest cosmetic changes — focus on functional problems."""
```

## Advanced variation: Reflection with tool use

Combine reflection with actual execution for a stronger feedback signal:

```python
def reflection_with_execution(task: str, sandbox):
    code = generator_llm.generate_code(task)

    for iteration in range(3):
        # Run the code and get real feedback
        result = sandbox.execute(code)

        if result.success and passes_tests(result):
            return code

        # Critique based on actual errors, not LLM judgment
        critique = critic_llm.analyze_failure(
            code=code,
            error=result.stderr,
            test_results=result.test_output,
        )

        code = generator_llm.revise(code, critique)

    return code
```

This is strictly better than LLM-only reflection because the critique is grounded in real execution results, not the LLM's (potentially wrong) judgment.

## Real libraries that implement reflection

| Library | How it implements reflection | Language |
|---------|----------------------------|----------|
| **[LangGraph](https://github.com/langchain-ai/langgraph)** | Custom graph with generate → critique → revise cycle nodes | Python, TS |
| **[Reflexion](https://github.com/noahshinn/reflexion)** | Reference implementation of the Reflexion paper | Python |
| **[DSPy](https://github.com/stanfordnlp/dspy)** | `Retry` and `Assert` modules for self-correcting pipelines | Python |
| **[AutoGen](https://github.com/microsoft/autogen)** | Critic agent reviews and requests revisions from generator agent | Python |
| **[CrewAI](https://github.com/crewAIInc/crewAI)** | `max_iter` parameter on tasks for automatic retry with feedback | Python |

## When to use reflection vs. other patterns

| Factor | Reflection | ReAct | Plan-and-execute |
|--------|-----------|-------|-----------------|
| Goal | Improve output quality | Navigate uncertainty | Decompose complex tasks |
| Cost | 2-4x base cost | 3-10x base cost | 1.5-3x base cost |
| Latency | 2-4x base latency | Variable | Variable |
| Best for | Writing, code gen, analysis | Research, Q&A, debugging | Multi-step pipelines |

**Use reflection when**:
- Output quality is more important than speed
- The task has objectively evaluable criteria (tests pass, facts are correct)
- A single generation pass consistently produces "almost right" output
- You can define what "good" looks like (criteria for the critic)

**Don't use reflection when**:
- Speed matters more than quality (real-time chat)
- The task is simple enough to get right on the first try
- You can't define clear quality criteria
- You're already at the model's capability ceiling (reflection won't help if the model fundamentally can't do the task)

## Common failure modes and fixes

### 1. Critique is too vague

**Symptom**: Critic says "could be improved" without specifics.

**Fix**: Constrain the critic to output structured feedback — specific issues and specific suggestions. Use a schema.

```python
critique_schema = {
    "score": "float 0-1",
    "issues": ["list of specific problems"],
    "suggestions": ["list of actionable fixes"],
}
```

### 2. Oscillating revisions

**Symptom**: Revision 1 fixes issue A but introduces issue B. Revision 2 fixes B but re-introduces A.

**Fix**: Include the history of all previous critiques in the revision prompt. The agent needs to know what it already tried and why.

### 3. Critic agrees with everything

**Symptom**: Critic gives a high score to obviously flawed output.

**Fix**: Use a different (ideally stronger) model for the critic, or provide few-shot examples of good and bad critiques. Ground the critique in execution results when possible.

### 4. Diminishing returns

**Symptom**: After 2 iterations, quality plateaus. Further iterations are wasted compute.

**Fix**: Track the quality score over iterations. If the score doesn't improve by at least 0.05 between iterations, stop early.

### 5. Losing context across iterations

**Symptom**: Later revisions lose good elements from earlier versions.

**Fix**: Instruct the reviser to preserve what works and only change what the critic flagged. Consider diff-based revision (change only the problematic sections, not the whole output).
