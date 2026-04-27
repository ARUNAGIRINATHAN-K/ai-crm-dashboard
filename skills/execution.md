# Execution

Execution is the agent's ability to take action — running code, calling APIs, interacting with external services, and modifying state in the real world. This is where agents move from "thinking" to "doing", and it's also where the highest risk lives.

## What "execution" means in an agentic context

An agent without execution capability is just a chatbot that thinks out loud. Execution is what transforms reasoning into results: writing code and running it, calling an API to book a meeting, sending an email, or updating a database.

The key challenge is _safe_ execution. When an agent generates and runs code, that code might:

- Have bugs that crash the process
- Consume unbounded resources (infinite loops, memory leaks)
- Access files or network resources it shouldn't
- Make irreversible changes (deleting data, sending emails)

This is why execution and [environments](../environments/README.md) go hand-in-hand. Every execution tool implicitly assumes some isolation boundary.

## Execution approaches compared

| Approach | Safety | Latency | Flexibility | Best for |
|----------|--------|---------|-------------|----------|
| Function calling (tool use) | High | Low | Limited to defined tools | Structured API calls with known schemas |
| Code generation + sandbox | Medium | Medium | Very high | Dynamic tasks, data analysis, file manipulation |
| Local code execution | Low | Very low | Very high | Trusted environments, development |
| Browser automation | Medium | High | High | Web interactions, form filling, scraping |
| Managed tool platform | High | Medium | High | Production agents needing many integrations |

## Tools and libraries

### Sandboxed code execution

**[E2B](https://github.com/e2b-dev/e2b)** — Runs agent-generated code in secure cloud sandboxes with sub-second start. Cold start: ~300ms. Isolation: VM (Firecracker). SDK: Python, TypeScript, Go. Tags: `execution` `sandbox` `python` `typescript` `e2b`

**[Open Interpreter](https://github.com/OpenInterpreter/open-interpreter)** — Executes code locally through a natural language interface. Isolation: process-level. SDK: Python. Tags: `execution` `python`

**[Modal](https://github.com/modal-labs/modal-client)** — Runs functions in cloud containers with GPU support and auto-scaling. Cold start: ~500ms. Isolation: container + gVisor. SDK: Python. Tags: `execution` `sandbox` `python` `modal`

### Tool platforms and integrations

**[Composio](https://github.com/ComposioHQ/composio)** — Connects agents to 250+ external tools and APIs with managed auth. Tags: `execution` `python` `typescript` `composio`

**[MCP (Model Context Protocol)](https://github.com/modelcontextprotocol/servers)** — Standardizes how agents discover and call external tools via a protocol. Tags: `execution` `python` `typescript`

**[Toolhouse](https://github.com/toolhouseai/toolhouse-sdk-python)** — Provides a hosted tool execution layer for function calling agents. Tags: `execution` `python`

### Framework-specific tool kits

**[CrewAI Tools](https://github.com/crewAIInc/crewAI-tools)** — Bundles pre-built tools for search, scraping, and file operations in agent pipelines. Tags: `execution` `python` `crewai`

**[LangChain Tools](https://github.com/langchain-ai/langchain)** — Provides 100+ integrations for search, math, databases, and APIs. Tags: `execution` `python` `langchain`

**[Semantic Kernel](https://github.com/microsoft/semantic-kernel)** — Integrates LLM function calling with enterprise plugins and planners. Tags: `execution` `planning` `python` `typescript`

### Browser automation

**[Browser Use](https://github.com/browser-use/browser-use)** — Gives LLM agents full browser control for web interaction and data extraction. Tags: `execution` `perception` `python`

**[Playwright](https://github.com/microsoft/playwright)** — Automates Chromium, Firefox, and WebKit browsers with a single API. Tags: `execution` `perception` `python` `typescript`

**[Skyvern](https://github.com/Skyvern-AI/skyvern)** — Automates browser workflows using vision models instead of DOM selectors. Tags: `execution` `perception` `python`

## When to use what — decision guide

```
Start here: What does your agent need to do?
│
├── Call a known API with a defined schema?
│   └── Function calling (native LLM tool use)
│
├── Generate and run arbitrary code?
│   ├── Trusted environment, low latency? → Open Interpreter
│   ├── Untrusted code, need isolation? → E2B or Modal
│   └── Need GPU for ML workloads? → Modal
│
├── Connect to 3rd-party SaaS tools?
│   ├── Need many integrations (10+)? → Composio
│   ├── Want a standard protocol? → MCP
│   └── Using a specific framework? → CrewAI Tools or LangChain Tools
│
└── Interact with web pages?
    ├── Need to fill forms, click buttons? → Browser Use or Playwright
    └── Visual approach (no selectors)? → Skyvern
```

## Common pitfalls

1. **No timeout on execution.** Agent-generated code can hang forever. Always set execution timeouts — 30 seconds for simple tasks, 5 minutes max for complex ones.

2. **Trusting code output without validation.** Just because code ran without errors doesn't mean the output is correct. Validate results before the agent acts on them.

3. **Leaking credentials.** When agents call APIs, they need credentials. Never pass credentials through the LLM prompt. Use environment variables, secret managers, or managed auth platforms like Composio.

4. **No resource limits.** An agent in a loop can make thousands of API calls in minutes. Set rate limits on tool execution and hard caps on total actions per invocation.
