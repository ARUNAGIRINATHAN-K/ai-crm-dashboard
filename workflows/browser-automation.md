# Browser automation workflow

A browser automation agent navigates web pages, fills out forms, clicks buttons, extracts data, and completes multi-step web workflows — all driven by natural language instructions rather than hardcoded selectors. This is the most fragile agentic workflow because web UIs change constantly, but also one of the most valuable because it automates work that has no API alternative.

## Pipeline structure

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Parse       │     │  Navigate    │     │  Observe     │
│  instruction │────▶│  to page     │────▶│  page state  │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                     ┌──────────────┐     ┌──────▼───────┐
                     │  Report      │◀────│  Take        │
                     │  result      │     │  action      │
                     └──────────────┘     └──────┬───────┘
                                                  │
                                           ┌──────▼───────┐
                                           │  Check if    │
                                           │  goal met    │
                                           └──────┬───────┘
                                                  │
                                          No ─────┘───── Yes
                                          │               │
                                    back to observe    done
```

The observe → act → check loop is a classic ReAct pattern applied to browser interaction. The agent looks at the page, decides what to do, does it, and then checks whether the task is complete.

## Approaches to browser perception

| Approach | How it works | Pros | Cons |
|----------|-------------|------|------|
| **DOM parsing** | Extract HTML, identify elements by selector | Fast, precise, deterministic | Breaks when HTML structure changes |
| **Vision (screenshot)** | Send a screenshot to a vision model | Works on any page, resilient to HTML changes | Slower, less precise for small elements |
| **Accessibility tree** | Use the browser's accessibility API | Semantic understanding of UI elements | Not all sites have good a11y markup |
| **Hybrid** | DOM for structure + vision for ambiguous elements | Best accuracy | Highest latency and cost |

## Tools involved

| Step | Tools | Why |
|------|-------|-----|
| Browser control | Playwright, Puppeteer | Reliable cross-browser automation |
| Agent-driven browsing | Browser Use, Skyvern | LLM-native browser control |
| Element querying | AgentQL | Natural language element selection |
| Perception | Vision models, DOM extraction | Understanding page state |
| Orchestration | LangGraph | Managing the observe-act loop |

## Real projects implementing this workflow

**[Browser Use](https://github.com/browser-use/browser-use)** — Gives LLM agents full browser control for web interaction and data extraction. Tags: `execution` `perception` `python`

**[Playwright](https://github.com/microsoft/playwright)** — Automates Chromium, Firefox, and WebKit browsers with a single API. Tags: `execution` `perception` `python` `typescript`

**[Skyvern](https://github.com/Skyvern-AI/skyvern)** — Automates browser workflows using vision models instead of DOM selectors. Tags: `execution` `perception` `python`

**[AgentQL](https://github.com/tinyfish-io/agentql)** — Queries web page elements using natural language instead of CSS selectors. Tags: `perception` `python`

**[LaVague](https://github.com/lavague-ai/LaVague)** — Translates natural language instructions into browser automation actions. Tags: `execution` `perception` `python`

**[WebArena](https://github.com/web-arena-x/webarena)** — Provides a realistic benchmark environment for testing web agent capabilities. Tags: `execution` `python`

## Pseudocode

```python
def browser_agent(instruction: str, url: str, max_steps: int = 15):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    page.goto(url)

    for step in range(max_steps):
        # Step 1: Observe
        screenshot = page.screenshot()
        dom = page.content()
        page_state = llm.describe_page(screenshot, dom)

        # Step 2: Decide action
        action = llm.decide_action(
            instruction=instruction,
            page_state=page_state,
            history=action_history,
        )
        # action = {"type": "click", "target": "#submit-btn"}
        # action = {"type": "type", "target": "#email", "text": "..."}
        # action = {"type": "done", "result": "..."}

        if action["type"] == "done":
            return action["result"]

        # Step 3: Execute action
        if action["type"] == "click":
            page.click(action["target"])
        elif action["type"] == "type":
            page.fill(action["target"], action["text"])
        elif action["type"] == "navigate":
            page.goto(action["url"])

        # Wait for page to settle
        page.wait_for_load_state("networkidle")

    return "Max steps reached without completing task"
```

## Failure modes

| Failure | Cause | Fix |
|---------|-------|-----|
| Element not found | HTML structure changed, selector is stale | Use vision or accessibility tree instead of CSS selectors |
| CAPTCHA | Site detects automation | Use residential proxies, slow down interactions, or escalate to human |
| Login walls | Session expired or not logged in | Pre-authenticate and pass session cookies |
| Infinite navigation loop | Agent keeps clicking the same buttons | Track visited URLs and actions, detect cycles |
| Pop-ups and overlays | Cookie banners, modals blocking interaction | Detect and dismiss overlays before acting on main content |

## Production considerations

- **Speed**: Browser automation is slow (500ms-2s per action). Multi-step workflows can take 30 seconds to several minutes. Don't use for real-time interactions.
- **Reliability**: Web UIs change without warning. Vision-based approaches (Skyvern, Browser Use) are more resilient than selector-based ones but slower.
- **Cost**: Each step requires at least one LLM call (often with a screenshot). A 10-step workflow costs $0.10-$0.50 in LLM API calls.
- **Legal**: Automated browsing may violate terms of service. Check the site's robots.txt and ToS before deploying.
- **Parallelism**: Run multiple browser instances for batch operations, but respect rate limits to avoid being blocked.
