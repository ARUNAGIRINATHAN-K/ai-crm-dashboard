# Data pipeline workflow

A data pipeline agent automates the process of ingesting data from various sources, transforming it, and loading it into a destination — with the LLM handling the decision-making that traditionally required a human data engineer. This includes schema inference, data quality checks, anomaly detection, and error recovery.

## Pipeline structure

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Ingest      │     │  Profile &   │     │  Transform   │
│  raw data    │────▶│  validate    │────▶│  & clean     │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
┌──────────────┐     ┌──────────────┐     ┌──────▼───────┐
│  Report &    │     │  Load to     │◀────│  Quality     │
│  alert       │◀────│  destination │     │  check       │
└──────────────┘     └──────────────┘     └──────────────┘
```

The agent's role in this workflow is not to replace traditional ETL tools but to augment them — handling edge cases, inferring schemas, writing transformation logic, and flagging anomalies that rule-based systems miss.

## Tools involved

| Step | Tools | Why |
|------|-------|-----|
| Ingestion | Unstructured, Firecrawl | Parse diverse input formats |
| Profiling | pandas, Great Expectations | Understand data shape and quality |
| Transformation | LLM + pandas/polars | Generate transformation code dynamically |
| Orchestration | Prefect, Dagster, Hamilton | Manage DAG execution, retries, caching |
| Quality checks | Great Expectations, Soda | Validate output data meets expectations |
| Alerting | Slack Bolt, Novu | Notify on failures or anomalies |

## Real projects implementing this workflow

**[Hamilton](https://github.com/DAGWorks-Inc/hamilton)** — Defines data transformations as Python functions wired into a DAG. Tags: `pipeline` `python`

**[Prefect](https://github.com/PrefectHQ/prefect)** — Orchestrates data workflows with retries, caching, and observability. Tags: `pipeline` `python`

**[Dagster](https://github.com/dagster-io/dagster)** — Manages data assets and pipelines with built-in lineage tracking. Tags: `pipeline` `python`

**[Great Expectations](https://github.com/great-expectations/great_expectations)** — Validates, profiles, and documents data to catch quality issues. Tags: `pipeline` `python`

**[DLT (data load tool)](https://github.com/dlt-hub/dlt)** — Creates declarative data loading pipelines with automatic schema management. Tags: `pipeline` `python`

**[Polars](https://github.com/pola-rs/polars)** — Processes dataframes faster than pandas with a Rust-based engine. Tags: `pipeline` `python` `rust`

## Pseudocode

```python
def data_pipeline_agent(source: str, destination: str, instructions: str):
    # Step 1: Ingest
    raw_data = ingest(source)  # CSV, API, web page, PDF

    # Step 2: Profile
    profile = profile_data(raw_data)  # row count, dtypes, nulls, distributions
    issues = llm.analyze_profile(profile, instructions)

    # Step 3: Transform
    if issues:
        transform_code = llm.generate_transform(raw_data.schema, issues, instructions)
        cleaned_data = execute_in_sandbox(transform_code, raw_data)
    else:
        cleaned_data = raw_data

    # Step 4: Quality check
    expectations = llm.generate_expectations(instructions, cleaned_data.schema)
    qc_result = great_expectations.validate(cleaned_data, expectations)

    if not qc_result.passed:
        # Try to fix, or alert human
        notify_slack(f"Quality check failed: {qc_result.failures}")
        return

    # Step 5: Load
    load_to_destination(cleaned_data, destination)

    # Step 6: Report
    notify_slack(f"Pipeline complete: {len(cleaned_data)} rows loaded to {destination}")
```

## Failure modes

| Failure | Cause | Fix |
|---------|-------|-----|
| Schema drift | Source schema changed since last run | Profile data before transforming, detect new/missing columns |
| Silent data loss | Transformation drops rows without logging | Add row count assertions before and after transforms |
| Type coercion errors | Agent writes `int(x)` on a column with nulls | Include null handling in transform instructions |
| Destination rejection | Destination schema doesn't match output | Validate output schema against destination before loading |

## Production considerations

- **Idempotency**: Ensure the pipeline can be re-run safely. Use upserts instead of inserts, or partition by date.
- **Observability**: Log row counts, schema snapshots, and transformation code at every step. When the pipeline fails next month, you'll need to debug it.
- **Cost**: The agent primarily generates transformation code, not processes data. LLM cost is low ($0.10-$0.50 per run), but compute cost for processing depends on data volume.
- **Testing**: Run the pipeline on a sample of data first. Don't let the agent process 10M rows with untested transformation code.
