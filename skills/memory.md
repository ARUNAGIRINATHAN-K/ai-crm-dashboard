# Memory

Memory is the agent's ability to store, retrieve, and reason over information across time. Without memory, every agent invocation starts from scratch — it can't learn from past interactions, recall user preferences, or build on previous research.

## Types of agent memory

| Type | Lifespan | Stored where | Example |
|------|----------|-------------|---------|
| **Working memory** | Single turn | LLM context window | Current conversation messages, tool results |
| **Short-term memory** | Single session | In-process buffer | Summary of the last 10 conversation turns |
| **Long-term memory** | Persistent | External database | User preferences, past interactions, learned facts |
| **Episodic memory** | Persistent | External database | Specific past events: "last Tuesday the deploy failed" |
| **Semantic memory** | Persistent | Vector store | General knowledge: "the API rate limit is 100 req/min" |

Most agents need at minimum working memory (the context window) and some form of long-term retrieval. The question is how to structure and access it.

## The retrieval problem

Storing memories is easy. Retrieving the _right_ memory at the _right_ time is the hard part. Key challenges:

1. **Relevance decay.** A fact from 3 months ago might be outdated. Memory systems need recency weighting or expiration.
2. **Semantic vs. keyword match.** "How to deploy to prod" and "production deployment steps" mean the same thing, but keyword search misses this. Vector search handles it.
3. **Context window limits.** Even with 128k context windows, stuffing everything in is expensive and slow. Selective retrieval matters.

## Tools and libraries

### Vector stores

**[Chroma](https://github.com/chroma-core/chroma)** — Embeds and retrieves documents as a lightweight vector store for agents. Tags: `memory` `python` `typescript`

**[Weaviate](https://github.com/weaviate/weaviate)** — Stores and searches vector embeddings with hybrid keyword+semantic retrieval. Tags: `memory` `go` `python`

**[Qdrant](https://github.com/qdrant/qdrant)** — Provides high-performance vector similarity search with filtering. Tags: `memory` `rust` `python`

**[Milvus](https://github.com/milvus-io/milvus)** — Scales vector search to billions of embeddings for large agent knowledge bases. Tags: `memory` `go` `python`

**[LanceDB](https://github.com/lancedb/lancedb)** — Runs serverless vector search embedded directly in the agent process. Tags: `memory` `rust` `python` `typescript`

**[pgvector](https://github.com/pgvector/pgvector)** — Adds vector similarity search to PostgreSQL for teams already using Postgres. Tags: `memory` `python`

### Agent memory layers

**[Mem0](https://github.com/mem0ai/mem0)** — Adds persistent, personalized memory to LLM agents across sessions. Tags: `memory` `python`

**[Zep](https://github.com/getzep/zep)** — Enriches agent memory with automatic summarization and entity extraction. Tags: `memory` `python` `typescript`

**[Motorhead](https://github.com/getmetal/motorhead)** — Manages conversation context windows with automatic summarization. Tags: `memory` `rust` `python`

**[Letta](https://github.com/letta-ai/letta)** — Provides an OS-like memory management system for LLMs to manage long-term state. Tags: `memory` `python`

**[LangMem](https://github.com/langchain-ai/langmem)** — Provides long-term memory primitives for LangGraph agents. Tags: `memory` `python` `langgraph`

## When to use what — decision guide

```
Start here: What kind of memory does your agent need?
│
├── Remember user preferences across sessions?
│   └── Mem0 or Zep (built-in personalization)
│
├── Search over a large document corpus?
│   ├── < 1M vectors, single process? → Chroma or LanceDB
│   ├── Need hybrid search (keyword + semantic)? → Weaviate
│   ├── Need filtering on metadata? → Qdrant
│   └── > 100M vectors, production scale? → Milvus
│
├── Already using PostgreSQL?
│   └── pgvector (no new infrastructure)
│
└── Need conversation summarization?
    └── Zep or Motorhead
```

## Common patterns

### Sliding window + summary

Keep the last N messages verbatim in context. Summarize older messages into a compressed representation. This balances recency (recent messages are exact) with history (older context is preserved in compressed form).

```python
def build_context(messages, window_size=10):
    recent = messages[-window_size:]
    older = messages[:-window_size]
    summary = llm.summarize(older) if older else ""
    return [{"role": "system", "content": summary}] + recent
```

### RAG (retrieval-augmented generation)

Before generating a response, search a vector store for relevant past knowledge. Inject the top-k results into the prompt. This is the standard pattern for giving agents access to large knowledge bases without stuffing everything into the context window.

```python
def answer_with_memory(query, vector_store, llm):
    relevant_docs = vector_store.search(query, top_k=5)
    context = "\n".join(doc.text for doc in relevant_docs)
    return llm.generate(f"Context:\n{context}\n\nQuestion: {query}")
```

## Common pitfalls

1. **Embedding model mismatch.** If you embed documents with `text-embedding-ada-002` but search with `text-embedding-3-small`, similarity scores are meaningless. Always use the same model for indexing and querying.

2. **No metadata filtering.** Vector search alone returns the most _semantically similar_ results, which might be from the wrong user, wrong project, or wrong time period. Always store and filter on metadata.

3. **Forgetting to update.** Long-term memory that's never pruned or updated becomes a liability. Outdated facts in memory can cause agents to act on stale information.
