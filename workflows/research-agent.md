# Research agent workflow

A research agent autonomously gathers information from multiple sources, synthesizes findings, and produces a structured report. This is one of the most common agentic workflows because it combines perception (web search, document reading), memory (tracking what's been found), planning (deciding what to search next), and communication (writing the final report).

## Pipeline structure

```
┌─────────────┐     ┌──────────────┐     ┌────────────────┐
│  Define      │     │  Search &    │     │  Synthesize    │
│  research    │────▶│  extract     │────▶│  & verify      │
│  question    │     │  sources     │     │  findings      │
└─────────────┘     └──────┬───────┘     └───────┬────────┘
                           │                      │
                    ┌──────▼───────┐     ┌───────▼────────┐
                    │  Store in    │     │  Generate      │
                    │  memory      │     │  report        │
                    └──────────────┘     └────────────────┘
                           ▲                      │
                           │    Need more data?   │
                           └──────────────────────┘
```

The critical loop is between synthesis and search. A good research agent recognizes gaps in its findings and issues follow-up searches rather than generating a report from incomplete data.

## Tools involved

| Step | Tools | Why |
|------|-------|-----|
| Web search | Tavily, Jina Reader | Optimized for LLM-friendly search results |
| Document parsing | Docling, Marker | Handle PDFs and academic papers |
| Memory | Chroma, LanceDB | Track sources and avoid re-reading |
| Planning | LangGraph, DSPy | Decide when to search more vs. synthesize |
| Report generation | LLM (direct) | Structured output with citations |
| Delivery | Resend, Slack Bolt | Send the finished report |

## Real projects implementing this workflow

**[GPT Researcher](https://github.com/assafelovic/gpt-researcher)** — Conducts multi-source web research and produces cited reports autonomously. Tags: `pipeline` `perception` `python`

**[STORM](https://github.com/stanford-oval/storm)** — Generates Wikipedia-style articles by researching and synthesizing multiple sources. Tags: `pipeline` `planning` `python`

**[Tavily](https://github.com/tavily-ai/tavily-python)** — Provides search API optimized for LLM agents needing real-time web data. Tags: `perception` `python`

**[Langchain RAG templates](https://github.com/langchain-ai/langchain)** — Offers pre-built retrieval-augmented generation pipelines for research workflows. Tags: `pipeline` `python` `langchain`

**[Khoj](https://github.com/khoj-ai/khoj)** — Acts as a personal AI research assistant that searches your notes and the web. Tags: `pipeline` `perception` `python`

## Pseudocode

```python
def research_agent(question: str, max_iterations: int = 5):
    memory = VectorStore()
    sources = []

    # Step 1: Generate initial search queries
    queries = llm.generate_queries(question, count=3)

    for iteration in range(max_iterations):
        # Step 2: Search and extract
        for query in queries:
            results = tavily.search(query)
            for result in results:
                content = jina_reader.extract(result.url)
                memory.add(content, metadata={"url": result.url})
                sources.append(result.url)

        # Step 3: Synthesize current findings
        relevant = memory.search(question, top_k=10)
        draft = llm.synthesize(question, relevant)

        # Step 4: Check for gaps
        gaps = llm.identify_gaps(question, draft)
        if not gaps:
            break

        # Step 5: Generate follow-up queries
        queries = llm.generate_queries_from_gaps(gaps)

    # Step 6: Generate final report with citations
    report = llm.generate_report(question, draft, sources)
    return report
```

## Failure modes

| Failure | Cause | Fix |
|---------|-------|-----|
| Superficial report | Agent stops after first search | Set minimum source count before synthesis |
| Circular searching | Agent re-searches the same queries | Track searched queries in memory, deduplicate |
| Hallucinated citations | LLM invents URLs that don't exist | Validate every citation URL before including it |
| Stale information | Sources are outdated | Filter search results by date, prefer recent |
| Infinite loop | Gap detection always finds gaps | Set max_iterations and accept "good enough" |

## Production considerations

- **Cost**: A thorough research session makes 10-30 LLM calls and 20-50 search API calls. Budget $0.50-$5.00 per report depending on depth.
- **Latency**: End-to-end, expect 30 seconds to 5 minutes. Not suitable for real-time use — best as a background job with notification on completion.
- **Observability**: Log every search query, every source URL, and every synthesis step. When the report is wrong, you need to trace which source led to the error.
