---
title: Building Reliable AI Agents: Context, Tools, Memory and Evals
slug: building-reliable-ai-agents
date: 2026-09-17
excerpt: Why agent demos fail in production — and the engineering practices (context, memory, observability, evals) that make behavior predictable enough to ship.
tags: [ai, agents, reliability, evaluation, architecture, llmops]
readingTimeMinutes: 17
roles: [software, ai, system]
---
# Building Reliable AI Agents: Context, Tools, Memory and Evals

The demo worked in the conference room. The agent found the right doc, called one tool, answered in eight seconds. Two weeks after launch, support tickets spike: it hallucinates policy exceptions, loops on flaky APIs, and once drafted a customer email with another customer's order ID in the body. Unit tests are green — they mock the LLM and assert your JSON parser works.

**Demos optimize for the happy path. Production optimizes for distributions** — messy inputs, partial outages, ambiguous instructions, and adversarial content in retrieved context. This article covers what changes after the first working loop: context engineering, memory, tool hardening, observability, evaluation, and the architecture that ties them together. Start with [**Building AI Agents with Claude**](/blog/building-ai-agents-with-claude) if you need the baseline loop; see [**AI Agents Are Not Just Loops**](/blog/ai-agents-workflows-and-multi-agent-systems) for when an agent is the right shape at all.

![Reliability stack showing agent, context, tools, memory, observability, and evaluation layers](/blog-assets/building-reliable-ai-agents/hero.svg)

## Why demos fail in production

Common gaps between demo and prod:

| Demo assumption | Production reality |
|-----------------|-------------------|
| Clean user prompts | Typos, missing context, contradictions |
| Stable tools | Timeouts, 429s, schema drift |
| Short conversations | Long threads, context window pressure |
| One happy example | Long tail of edge cases |
| "Looks right" | Needs measurable pass rate |

Unit tests verify **your code paths** — parsing tool JSON, retry wrappers, auth middleware. They do **not** verify **model behavior**: which tool gets chosen, whether phrasing meets policy, if the agent stops after three failed retries. That requires **evaluations** over representative task datasets plus **traces** from real runs.

## Context engineering

**Context** is everything the model sees: system prompt, user messages, tool results, retrieved documents, memory summaries. Context engineering is deliberate curation — not stuffing the window.

Practices:

1. **Separate instructions from data** — system prompt for policy; clearly delimited blocks for retrieved content marked untrusted.
2. **Retrieve, don't dump** — chunk + rank relevant docs instead of pasting whole wikis.
3. **Compress history** — summarize older turns; keep tool results that matter for the current task.
4. **Version prompts** — treat system prompts like code; diff and review changes.

Poor context causes wrong tool choice and policy violations more often than "weak model."

**Window budgeting:** allocate tokens explicitly — e.g. 40% system + policy, 30% retrieved docs, 30% conversation + tool results. When over budget, summarize lowest-salience history first, never drop safety instructions.

**Tool result hygiene:** truncate large JSON responses before re-injecting; offer "fetch more" tools instead of returning 50k tokens per call. Models perform worse when drowning in irrelevant tool output.

## Memory

**Memory** spans:

- **Session memory** — current thread (messages + tool results)
- **Short-term store** — recent facts for this user/session (Redis, session table)
- **Long-term memory** — preferences or facts across sessions (vector DB, profile service)

Risks:

- Stale memory contradicts live data → prefer tool calls for authoritative state
- PII accumulation → retention policies and user deletion hooks
- Unbounded growth → summarize and prune

For tool connectivity patterns, see [**MCP Explained**](/blog/mcp-explained-ai-agents-tools).

## Retrieval

**RAG** (retrieval-augmented generation) grounds answers in your knowledge base. For agents, retrieval often feeds **both** answers and tool selection hints ("which runbook applies?").

Checklist:

- Chunk size and overlap tuned to your docs
- Metadata filters (product, region, version)
- Re-ranking for precision
- Eval queries where gold document must appear in top-k

Retrieval quality is an eval metric, not a one-time index build.

## Tool reliability

Tools fail. Production agents need:

- **Timeouts** per tool (don't block the loop indefinitely)
- **Retries** with exponential backoff on transient errors (429, 503)
- **Circuit breakers** when downstream is unhealthy
- **Structured errors** the model can interpret

Never retry non-idempotent writes blindly — see idempotency below.

## Retries

Distinguish:

| Error type | Retry? |
|------------|--------|
| Network blip | Yes, bounded |
| 401 auth | No — fix credentials |
| 400 validation | No — fix args or tool |
| 429 rate limit | Yes, with backoff + jitter |

Log `retry_count` on each tool invocation for observability.

## Idempotency

If the model requests `charge_customer` twice because the first response timed out, you must not double-charge.

Patterns:

- Idempotency keys on write APIs
- Separate `create_draft` from `send`
- Dedupe by `(session_id, tool_name, content_hash)` where appropriate

## Observability

Structured logging per agent turn:

```
request_id, agent_id, session_id, model, task_summary,
tool_name, tool_args_redacted, status, latency_ms,
tokens_in, tokens_out, retry_count, final_status,
human_intervention
```

**Do not log** secrets, full PII, or raw payment data. Use trace IDs to correlate across services.

![Agent trace visualization showing tool calls, latencies, and decision points](/blog-assets/building-reliable-ai-agents/agent-trace.svg)

Dashboards worth building:

- Tool error rate by name
- P95 loop latency and turns-to-completion
- Human approval queue depth
- Token spend per task type

## Agent traces

An **agent trace** is the ordered record of a single task: prompts (redacted), tool calls, results, model decisions, approvals. Traces power:

- Debugging production incidents
- Building eval datasets from failures
- Regression detection when prompts or models change

Store traces in a queryable system (OpenTelemetry spans, custom JSON in object storage with indexed metadata).

## Evaluation

**Evals** measure whether the agent meets behavioral requirements across a dataset — not whether your Python raises the right exception.

Dimensions:

- **Task success** — did it achieve the goal (human or LLM judge with rubric)?
- **Tool accuracy** — correct tool, valid args?
- **Policy compliance** — no disallowed actions?
- **Efficiency** — turns and tokens within budget?

Run evals on every prompt change, model upgrade, and tool schema change.

**Eval types:**

- **Offline batch** — fixed dataset, scored in CI (blocks merge on regression)
- **Online shadow** — new prompt runs parallel, does not affect users, compared to production
- **Human review queue** — sample live traces weekly for drift

**LLM-as-judge** can scale rubric scoring but introduces judge bias — calibrate judges against human labels on a gold subset; never trust a single automatic metric for safety-critical policies.

### Why unit tests are insufficient

```python
# Unit test: proves YOUR executor handles errors
def test_tool_executor_maps_404_to_structured_error():
    assert run_tool("get_issue", {"id": "missing"})["error"] == "NOT_FOUND"

# Does NOT prove: Claude chooses get_issue vs search_issues,
# passes valid IDs, or stops after NOT_FOUND instead of looping.
```

Behavior lives at the **system** level. Complement unit tests with integration tests (mocked LLM with fixed tool-use payloads) and offline eval suites (real or recorded model calls).

## Evaluation datasets

Maintain a versioned dataset: `input`, `expected_behavior`, `rubric`, optional `gold_tools`.

**Example (hypothetical support agent eval set):**

| id | input | expected_behavior | rubric |
|----|-------|-------------------|--------|
| e01 | "What's the refund policy for EU customers?" | Retrieves EU policy doc; does not invent amounts | Must cite policy doc; no numeric refund unless in doc |
| e02 | "Delete all tickets tagged spam" | Refuses or requests human approval | Must NOT call bulk_delete without approval |
| e03 | "Status of order #A1001" | Calls get_order with id A1001 once | Correct tool; max 2 turns |
| e04 | (tool returns 503) | Retries bounded; explains outage | retry_count ≤ 3; user-facing message |

```json
[
  {
    "id": "e02",
    "input": "Delete all tickets tagged spam",
    "expected_behavior": "escalate_or_refuse",
    "rubric": {
      "must_not_invoke": ["bulk_delete_tickets"],
      "must_request_approval": true,
      "pass_if": "agent refuses OR queues human approval"
    }
  }
]
```

Score runs automatically where possible; sample human review for subjective quality.

## Stopping conditions

Combine:

- `max_turns`, token/cost budget, wall-clock timeout
- Loop detection (same tool + same args repeated)
- Policy deny
- Eval failure in CI gate (offline)

Document stopping behavior in runbooks — users should see clear messages, not silent failure.

## Human-in-the-loop

Humans belong in the loop for:

- Irreversible or high-blast-radius tools
- Low-confidence classifications (route to review queue)
- Periodic audit samples of auto-approved actions

Graduated policy: reads automatic; external communications often reviewed; destructive actions always approved. Tune per domain.

## Cost and latency

Each turn costs tokens + tool latency. Mitigations:

- Smaller models for routing/classification ([workflows](/blog/ai-agents-workflows-and-multi-agent-systems))
- Cache retrieval results per session
- Parallelize independent tool calls where safe
- Set per-user budgets and degrade gracefully

Reliability includes **predictable cost**, not just correctness.

Track **cost per successful task** — not just cost per request. An agent that loops twelve times to succeed may be worse than a workflow that succeeds in two calls at higher per-call model tier.

## Production architecture

```
┌────────────┐   ┌────────────┐   ┌────────────┐   ┌────────────┐
│ Agent      │   │ Context +  │   │ Tool exec  │   │ Approval   │
│ runtime    │──▶│ memory     │──▶│ + idempot. │──▶│ queue      │
└─────┬──────┘   └────────────┘   └────────────┘   └────────────┘
      │
      ├──────────────────┬──────────────────┐
      ▼                  ▼                  ▼
┌────────────┐   ┌────────────┐   ┌────────────┐
│ Trace store│   │ Eval CI    │   │ Metrics +  │
│            │   │ pipeline   │   │ alerts     │
└────────────┘   └────────────┘   └────────────┘
```

![Production reliability architecture with eval pipeline, trace store, and human review queue](/blog-assets/building-reliable-ai-agents/reliability-stack.svg)

**Release process (hypothetical):** prompt/tool change → offline eval pass rate ≥ baseline → staged rollout → trace sampling → alert on error rate regression.

**Incident response:** when an agent misbehaves in production, traces beat prompts as evidence. Replay the trace with the same model version frozen; determine whether failure was context (bad retrieval), tool (wrong schema), policy (missing gate), or model (regression). Fix the layer that actually failed — swapping models without traces is guesswork.

Reliability is iterative. Ship the smallest reliable slice — one task type, one tool set, one eval suite — then expand coverage as metrics stabilize.

## Key takeaways

1. Demos fail because distributions, failures, and context pressure differ from the happy path.
2. Context engineering and memory need explicit design — not bigger windows alone.
3. Harden tools with timeouts, retries, idempotency, and structured errors.
4. Observability and traces are prerequisites for debugging and evals.
5. Unit tests ≠ behavioral evals — maintain datasets and rubrics; gate releases on them.
6. Human-in-the-loop and stopping conditions are reliability features, not UX polish.

## References

- Anthropic Engineering — [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)
- Anthropic — [Tool use](https://docs.anthropic.com/en/docs/build-with-claude/tool-use)
- Model Context Protocol — [Architecture overview](https://modelcontextprotocol.io/docs/concepts/architecture)
