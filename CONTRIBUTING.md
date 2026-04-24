# Contributing to Awesome Agentic Workflows

Welcome, and thanks for wanting to improve this list. Curation standards matter because a sloppy awesome list is just a bookmark dump — it wastes the reader's time instead of saving it. Every entry here should pass a simple test: _does this help a developer build a better agentic system, and is it clearly better or different from what's already listed?_

## Entry template

Copy and paste this template into the appropriate section of the relevant `.md` file:

```markdown
**[Project Name](https://github.com/org/repo)** — One sentence describing what this enables an agent to do. Tags: `category` `language` `framework`
```

**Rules for the description:**

- Must be a single sentence, under 20 words
- Must answer: "What does this enable an agent to do that it couldn't before?"
- Must not be copied from the project's own README or tagline
- Must not use hype words: "revolutionary", "powerful", "cutting-edge", "game-changing"

**Example — good:**

```markdown
**[Mem0](https://github.com/mem0ai/mem0)** — Adds persistent, personalized memory to LLM agents across sessions. Tags: `memory` `python`
```

**Example — bad:**

```markdown
**[Mem0](https://github.com/mem0ai/mem0)** — The memory layer for AI apps. Tags: `memory` `python`
```

The bad example is a tagline, not a functional description.

## Tag taxonomy

Every entry must include at least one category tag and one language tag. Framework and environment tags are optional but encouraged.

### Category tags

| Tag | Use when the tool primarily... |
|-----|-------------------------------|
| `perception` | Lets agents see, read, scrape, or parse external content |
| `memory` | Stores, retrieves, or manages agent context and knowledge |
| `planning` | Helps agents decompose tasks, reason, or decide next steps |
| `execution` | Runs code, calls APIs, or takes real-world actions |
| `communication` | Sends messages, notifications, or reports to humans |
| `orchestration` | Wires multiple skills or agents into a workflow |
| `sandbox` | Provides an isolated runtime for untrusted agent code |
| `pipeline` | Chains multiple data processing steps together |

### Language tags

`python` `typescript` `rust` `go`

### Framework tags

`langchain` `langgraph` `autogen` `crewai` `haystack` `llamaindex` `composio`

### Environment tags

`e2b` `modal` `docker` `firecracker` `daytona`

## Acceptance criteria

### An entry WILL be accepted if

- [ ] It has a working URL (no 404s, no "coming soon" pages)
- [ ] It has an OSS license (MIT, Apache 2.0, BSD, MPL, or similar)
- [ ] It has had a commit in the last 12 months
- [ ] It has a clear README explaining installation and usage
- [ ] The description is written by the contributor, not copy-pasted from the project
- [ ] It solves a specific problem in the skills, workflows, or environments domain
- [ ] It is not a duplicate of an existing entry

### An entry WILL NOT be accepted if

- It is a general LLM wrapper not specific to agentic workflows (e.g., a simple ChatGPT API wrapper)
- It duplicates an existing entry without meaningfully differentiating
- It is the contributor's own project submitted without disclosure (disclosure is allowed and encouraged — undisclosed self-promotion is not)
- It has no license or an unclear license
- It has not been updated in 12+ months
- It is behind a paywall with no open-source component
- The description uses marketing language instead of functional language

## How to submit a PR

1. Fork this repository
2. Add your entry to the appropriate section of the appropriate `.md` file
3. Ensure your entry follows the exact template above
4. Fill out the PR template completely
5. Submit the PR

## PR checklist

Before submitting, confirm each item:

- [ ] I have read this CONTRIBUTING.md in full
- [ ] The entry has a working URL (I tested it today)
- [ ] The entry has an OSS license
- [ ] The project's last commit was within 12 months
- [ ] I wrote the description myself (not copied from the project)
- [ ] I have added the correct category, language, and optional framework/env tags
- [ ] This is not a duplicate of an existing entry
- [ ] If this is my own project, I have disclosed that in the PR description

## Where to add entries

| Entry type | File |
|-----------|------|
| Perception tools | `skills/perception.md` and `README.md` → Perception |
| Memory systems | `skills/memory.md` and `README.md` → Memory |
| Planning frameworks | `skills/planning.md` and `README.md` → Planning |
| Execution tools | `skills/execution.md` and `README.md` → Execution |
| Communication tools | `skills/communication.md` and `README.md` → Communication |
| Research workflows | `workflows/research-agent.md` |
| Code generation | `workflows/code-generation.md` |
| Data pipelines | `workflows/data-pipeline.md` |
| Browser automation | `workflows/browser-automation.md` |
| Sandboxes and runtimes | `environments/sandboxes.md` |
| Container patterns | `environments/containers.md` |
| Serverless runtimes | `environments/serverless.md` |
| Agentic patterns | `patterns/` directory |

## Maintainer review SLA

We commit to reviewing every PR within **7 days**. If your PR hasn't received a response after 7 days, ping `@maintainers` in the PR thread.

## Questions?

Open a [Discussion](../../discussions) if you're unsure whether a tool belongs, which category to use, or how to write the description. We'd rather help you get it right than reject a PR.
