# ReAct pattern (Reasoning + Acting)

ReAct is the most fundamental agentic pattern. The agent alternates between **thinking** (reasoning about what to do next) and **acting** (calling a tool), using the observation from each action to inform the next thought. It was introduced in the paper [ReAct: Synergizing Reasoning and Acting in Language Models](https://arxiv.org/abs/2210.03629) (Yao et al., 2022).

## How it works

The ReAct loop has three phases that repeat until the task is complete:

```
┌──────────────────────────────────────────────────┐
│                                                  │
│   ┌──────────┐                                   │
│   │ THOUGHT  │  "I need to find the population   │
│   │          │   of Tokyo. Let me search."        │
│   └────┬─────┘                                   │
│        │                                         │
│   ┌────▼─────┐                                   │
│   │  ACTION  │  search("Tokyo population 2024")  │
│   │          │                                    │
│   └────┬─────┘                                   │
│        │                                         │
│   ┌────▼──────────┐                              │
│   │  OBSERVATION  │  "Tokyo metro: 13.96M..."    │
│   │               │                              │
│   └────┬──────────┘                              │
│        │                                         │
│        └──── Loop back to THOUGHT ───────────────┘
```

1. **Thought**: The LLM reasons about the current state and decides what to do next. This is generated as text (often in a structured format).
2. **Action**: The LLM calls a tool — search, calculate, read a file, run code, etc.
3. **Observation**: The tool returns a result. This result is appended to the conversation, and the LLM generates the next thought.

The loop terminates when the LLM decides it has enough information to answer, or when a maximum iteration count is reached.

## Python pseudocode

```python
def react_agent(question: str, tools: list, max_steps: int = 10):
    messages = [
        {"role": "system", "content": REACT_SYSTEM_PROMPT},
        {"role": "user", "content": question},
    ]

    for step in range(max_steps):
        # THOUGHT + ACTION: LLM decides what to do
        response = llm.chat(messages, tools=tools)

        if response.is_final_answer:
            return response.content

        # ACTION: Execute the tool call
        tool_name = response.tool_call.name
        tool_args = response.tool_call.arguments
        observation = execute_tool(tool_name, tool_args)

        # OBSERVATION: Append result and continue
        messages.append({"role": "assistant", "content": response.content})
        messages.append({"role": "tool", "content": observation})

    return "Max steps reached without a final answer"


REACT_SYSTEM_PROMPT = """You are a helpful agent. For each step:
1. Think about what you need to do next
2. Call a tool if needed
3. Use the tool's result to inform your next step
4. When you have the final answer, respond directly

Always explain your reasoning before taking an action."""
```

## Real libraries that implement ReAct

| Library | How it implements ReAct | Language |
|---------|----------------------|----------|
| **[LangGraph](https://github.com/langchain-ai/langgraph)** | `create_react_agent()` — built-in ReAct graph with tool nodes | Python, TS |
| **[Pydantic AI](https://github.com/pydantic/pydantic-ai)** | Default agent loop uses ReAct under the hood | Python |
| **[LangChain](https://github.com/langchain-ai/langchain)** | `AgentExecutor` with ReAct prompt template | Python, TS |
| **[Semantic Kernel](https://github.com/microsoft/semantic-kernel)** | `AutoFunctionCallingFilter` for tool use loops | Python, C# |
| **[AutoGen](https://github.com/microsoft/autogen)** | `AssistantAgent` with tool registration | Python |

## When to use ReAct vs. plan-and-execute

| Factor | ReAct | Plan-and-execute |
|--------|-------|-----------------|
| Task structure | Unclear, exploratory | Clear, decomposable |
| Tool dependency | Each step depends on previous result | Steps can be planned upfront |
| Latency | Higher (sequential LLM calls) | Lower (plan once, execute fast) |
| Error recovery | Natural — just reason about the error | Requires explicit re-planning |
| Best for | Q&A, research, debugging | Multi-file code changes, data pipelines |

**Use ReAct when** you don't know upfront what tools you'll need or in what order. The agent discovers the path as it goes.

**Use plan-and-execute when** the task has a clear structure that can be decomposed before execution begins.

## Common failure modes and fixes

### 1. Infinite loops

**Symptom**: The agent repeats the same tool call over and over.

**Cause**: The observation doesn't provide enough new information to change the agent's reasoning.

**Fix**: Track previous actions and observations. If the same action is repeated, force the agent to try a different approach or terminate.

```python
if (tool_name, tool_args) in previous_actions:
    messages.append({
        "role": "system",
        "content": "You already tried this action. Try a different approach."
    })
```

### 2. Premature termination

**Symptom**: The agent gives a final answer after just one tool call, even when the answer is incomplete.

**Cause**: The LLM is biased toward giving answers quickly, or the system prompt doesn't emphasize thoroughness.

**Fix**: Add explicit instructions to verify the answer before finalizing. Include a "confidence check" step.

### 3. Tool selection errors

**Symptom**: The agent calls the wrong tool for the task (e.g., using a calculator when it should search).

**Cause**: Tool descriptions are ambiguous, or there are too many tools (>15) for the LLM to differentiate.

**Fix**: Write clear, non-overlapping tool descriptions. If you have many tools, use a two-stage approach: first select the relevant tool category, then select the specific tool.

### 4. Observation overflow

**Symptom**: Tool returns too much text, filling the context window and causing the agent to lose track.

**Cause**: Tool returns full web pages, large files, or verbose API responses.

**Fix**: Truncate or summarize tool observations before appending them. A search result doesn't need the full page — a 500-character snippet is usually enough.

```python
observation = execute_tool(tool_name, tool_args)
if len(observation) > 2000:
    observation = llm.summarize(observation, max_tokens=500)
```

### 5. Reasoning quality degradation

**Symptom**: The agent's reasoning gets worse as the conversation gets longer.

**Cause**: The context window fills up with previous thoughts, actions, and observations. The signal-to-noise ratio drops.

**Fix**: Periodically summarize the conversation history, keeping only the most relevant information. Or use a sliding window that keeps the last N steps plus a compressed summary of earlier steps.
