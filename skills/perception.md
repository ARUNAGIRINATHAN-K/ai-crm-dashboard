# Perception

Perception is the agent's ability to observe the external world — reading web pages, parsing documents, understanding images, and extracting structured data from unstructured sources. Without perception, an agent is limited to what's already in its context window.

## What "perception" means in an agentic context

In traditional software, "input" is deterministic: an API returns JSON, a database returns rows. For agents, perception is messy. A web page might have cookie banners, dynamic JavaScript, and layout shifts. A PDF might have multi-column layouts, embedded tables, and scanned images. Perception tools abstract this complexity so the agent receives clean, structured content it can reason over.

The core challenge is converting the noisy real world into tokens an LLM can actually use.

## The speed vs. accuracy tradeoff

Every perception tool sits on a spectrum:

| Approach | Speed | Accuracy | Best for |
|----------|-------|----------|----------|
| Raw HTTP fetch + regex | Very fast | Low | Simple, well-structured pages |
| Headless browser + extraction | Medium | Medium-high | JavaScript-heavy sites, SPAs |
| Vision model (screenshot → text) | Slow | High | Complex layouts, visual elements |
| Specialized parser (PDF, DOCX) | Medium | High | Known document formats |

The right choice depends on latency budget and content complexity. For a research agent processing hundreds of pages, raw HTTP with markdown conversion is often enough. For a browser automation agent filling out forms, you need a full headless browser.

## Tools and libraries

### Web browsing and scraping

**[Firecrawl](https://github.com/firecrawl/firecrawl)** — Crawls websites and returns clean markdown ready for LLM consumption. Tags: `perception` `python` `typescript`

**[Crawl4AI](https://github.com/unclecode/crawl4ai)** — Extracts structured data from web pages using LLM-friendly output formats. Tags: `perception` `python`

**[Jina Reader](https://github.com/jina-ai/reader)** — Converts any URL to LLM-ready text via a simple API prefix. Tags: `perception` `typescript`

**[Browser Use](https://github.com/browser-use/browser-use)** — Gives LLM agents full browser control for web interaction and data extraction. Tags: `perception` `execution` `python`

**[Stagehand](https://github.com/browserbase/stagehand)** — An AI web browsing framework that uses Playwright with LLM-native commands like `page.act()`. Tags: `perception` `execution` `typescript`

**[ScrapeGraphAI](https://github.com/ScrapeGraphAI/Scrapegraph-ai)** — A web scraping python library that uses LLMs to create scraping pipelines. Tags: `perception` `pipeline` `python`

**[Tavily](https://github.com/tavily-ai/tavily-python)** — Provides search API optimized for LLM agents needing real-time web data. Tags: `perception` `python`

### Document parsing

**[Docling](https://github.com/docling-project/docling)** — Parses PDFs, DOCX, and slides into structured text with layout understanding. Tags: `perception` `python`

**[Marker](https://github.com/datalab-to/marker)** — Converts PDF to markdown with high accuracy for tables, equations, and figures. Tags: `perception` `python`

**[Unstructured](https://github.com/Unstructured-IO/unstructured)** — Ingests and preprocesses documents across 25+ file types for downstream LLM use. Tags: `perception` `python` `pipeline`

**[LlamaParse](https://github.com/run-llama/llama_cloud_services)** — A GenAI-native document parser specifically designed to extract complex tables and layouts. Tags: `perception` `python`

**[PyMuPDF](https://github.com/pymupdf/PyMuPDF)** — Extracts text, images, and metadata from PDFs with fast C-based bindings. Tags: `perception` `python`

### OCR and vision

**[Surya](https://github.com/datalab-to/surya)** — Runs OCR and layout detection on documents in 90+ languages. Tags: `perception` `python`

**[PaddleOCR](https://github.com/PaddlePaddle/PaddleOCR)** — Recognizes text in images across 80+ languages with lightweight models. Tags: `perception` `python`

**[DocTR](https://github.com/mindee/doctr)** — Detects and recognizes text in document images using deep learning. Tags: `perception` `python`

## When to use what — decision guide

```
Start here: What is your input source?
│
├── Web page?
│   ├── Static content, no JS? → Jina Reader or Firecrawl
│   ├── JS-heavy SPA? → Crawl4AI or Browser Use
│   └── Need to interact (click, type)? → Browser Use or Playwright
│
├── PDF document?
│   ├── Text-based PDF? → Marker or PyMuPDF
│   ├── Scanned / image PDF? → Surya or PaddleOCR → then Marker
│   └── Mixed (tables + text + images)? → Docling or Unstructured
│
├── Office docs (DOCX, PPTX)?
│   └── Docling or Unstructured
│
└── Need real-time search results?
    └── Tavily
```

## Common pitfalls

1. **Overusing headless browsers.** If you just need the text content of a blog post, a headless browser is 10x slower than an HTTP fetch. Reserve it for pages that actually require JavaScript execution.

2. **Ignoring rate limits.** Most scraping tools don't handle rate limiting out of the box. Wrap your perception layer with backoff and retry logic, or your agent will get blocked mid-research.

3. **Trusting OCR output blindly.** OCR accuracy drops on low-resolution images, handwriting, and unusual fonts. Always validate critical data extracted via OCR before your agent acts on it.

4. **Forgetting pagination.** Many tools extract only the first page of results or the visible viewport. For research agents, implement explicit pagination handling.
