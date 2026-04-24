# Communication

Communication is the agent's ability to send messages, notifications, and reports to humans. This is the last mile of agentic workflows — an agent that researches, plans, and executes but can't report its results is useless in production.

## What "communication" means in an agentic context

Communication isn't just "send an email". In an agentic workflow, communication covers:

1. **Reporting results** — Sending a summary of what the agent did and found
2. **Requesting approval** — Human-in-the-loop checkpoints before high-risk actions
3. **Alerting on failures** — Notifying humans when the agent is stuck or encounters errors
4. **Streaming progress** — Real-time updates during long-running workflows
5. **Multi-channel delivery** — Different stakeholders prefer different channels (email, Slack, SMS)

The challenge is matching the communication channel to the urgency and audience. A weekly research digest belongs in email. A production alert belongs in PagerDuty or SMS. A status update belongs in Slack.

## Communication channels compared

| Channel | Latency | Best for | Interruption level |
|---------|---------|----------|-------------------|
| Email | Minutes-hours | Detailed reports, digests, approvals | Low |
| Slack/Discord | Seconds | Team updates, interactive approvals | Medium |
| SMS | Seconds | Urgent alerts, OTP | High |
| Push notification | Seconds | Mobile alerts, status updates | Medium-high |
| Webhook | Milliseconds | System-to-system, triggering downstream actions | None (automated) |
| In-app | Seconds | Contextual updates within a product | Low-medium |

## Tools and libraries

### Multi-channel notification

**[Novu](https://github.com/novuhq/novu)** — Routes agent notifications across email, SMS, push, and chat from a single API. Tags: `communication` `typescript` `python`

**[Apprise](https://github.com/caronc/apprise)** — Sends notifications to 100+ services from a single Python interface. Tags: `communication` `python`

**[Ntfy](https://github.com/binwiederhier/ntfy)** — Pushes real-time notifications to phones and desktops via a simple HTTP API. Tags: `communication` `go`

### Email

**[Resend](https://github.com/resend/resend-node)** — Sends transactional emails from agents with a developer-first API. Tags: `communication` `typescript`

**[FastAPI-Mail](https://github.com/sabuhish/fastapi-mail)** — Adds email sending capability to FastAPI-based agent services. Tags: `communication` `python`

**[Mailtrap](https://github.com/railsware/mailtrap-python)** — Tests and sends emails with delivery tracking for agent workflows. Tags: `communication` `python`

### Chat platforms

**[Slack Bolt](https://github.com/slackapi/bolt-python)** — Enables agents to send, receive, and react to Slack messages. Tags: `communication` `python`

**[Discord.py](https://github.com/Rapptz/discord.py)** — Lets agents interact with Discord channels for team-facing communication. Tags: `communication` `python`

### SMS and voice

**[Twilio Python](https://github.com/twilio/twilio-python)** — Sends SMS and voice calls from agent workflows. Tags: `communication` `python`

### Human-in-the-loop

Most orchestration frameworks (LangGraph, CrewAI, AutoGen) have built-in human-in-the-loop support. The pattern is always the same: pause the workflow, send a message via a communication channel, wait for a human response, then resume.

```python
# LangGraph example: interrupt for human approval
from langgraph.checkpoint import MemorySaver

def should_approve(state):
    if state["risk_level"] == "high":
        # Agent pauses here, sends Slack message, waits
        return "request_approval"
    return "continue"
```

## When to use what — decision guide

```
Start here: What do you need to communicate?
│
├── Detailed report or digest?
│   └── Email (Resend or FastAPI-Mail)
│
├── Quick team update or interactive approval?
│   ├── Engineering team? → Slack (Bolt)
│   └── Community? → Discord (discord.py)
│
├── Urgent alert requiring immediate attention?
│   └── SMS (Twilio) or push notification (Ntfy)
│
├── Need to reach users across multiple channels?
│   └── Novu (single API, multi-channel routing)
│
└── System-to-system notification?
    └── Webhook (no library needed, just HTTP POST)
```

## Common pitfalls

1. **Notification fatigue.** An agent that sends a Slack message for every step will get muted. Batch updates and send summaries, not play-by-plays.

2. **No human-in-the-loop for high-risk actions.** Before an agent sends an email to a customer, deletes data, or spends money, require explicit approval. The cost of a 30-second delay is nothing compared to the cost of an incorrect automated action.

3. **Hardcoding channels.** Today the team uses Slack; tomorrow it's Teams. Abstract the notification channel behind an interface so you can swap without rewriting the agent logic.

4. **Missing error context.** When an agent alerts on a failure, include the full context: what it was trying to do, what went wrong, and what state it's in. "An error occurred" is useless. "Step 3/5 failed: API returned 429 rate limit, 2 retries exhausted, pausing workflow" is actionable.
