---
title: Production RAG: Retrieval Quality, Evaluation, and Cost Control
slug: production-rag-retrieval-evaluation-and-cost-control
date: 2026-09-22
excerpt: How to ship retrieval-augmented generation that stays accurate, measurable, and affordable after the demo — retrieval metrics, eval datasets, and cost levers that matter in production.
tags: [ai, rag, llm, evaluation, architecture, mlops]
readingTimeMinutes: 10
roles: [software, ai]
---

# Production RAG: Retrieval Quality, Evaluation, and Cost Control

A support bot answers confidently from three PDFs you indexed last Tuesday. In staging, it feels magic. In production, users ask about edge cases buried on page 47, phrasing questions nothing like your docs, and pasting half a ticket thread into the chat box. Retrieval returns the wrong chunks; the model still answers; trust erodes faster than your embedding bill grows.

**Retrieval-augmented generation (RAG)** is not “embed documents and call an LLM.” In production it is a system: chunking, indexing, query transformation, retrieval, optional reranking, context packing, generation, guardrails, and feedback loops. This article focuses on what separates a notebook prototype from something you can operate — **retrieval quality**, **evaluation**, and **cost control** — without duplicating the agent-loop material in [**Building AI Agents with Claude**](/blog/building-ai-agents-with-claude) or the full agent eval playbook in [**Building Reliable AI Agents**](/blog/building-reliable-ai-agents). If your product is tool-heavy and multi-step, read those; if your product is primarily “answer from our knowledge base,” start here.

## Why retrieval fails before the model does

Most RAG incidents are retrieval failures wearing a generation costume:

| Symptom | Often actually |
|---------|----------------|
| “It made things up” | Retrieved context was empty or irrelevant; model filled gaps |
| “It ignored our policy” | Policy chunk never ranked in top-k |
| “It worked yesterday” | Corpus drift, index rebuild, or embedding model change |
| “Slow and expensive” | Over-retrieval (high k, huge context) on every query |

Treat **retrieval and generation as separate subsystems** with separate metrics. Tune retrieval until recall@k and ranking quality stabilize on a labeled set *before* you obsess over prompt adjectives.

## The production RAG pipeline (mental model)

```
User query
    → (optional) query rewrite / routing
    → embed query
    → retrieve top-k chunks (vector ± keyword)
    → (optional) rerank / dedupe
    → pack context within token budget
    → LLM generate (with citations policy)
    → (optional) faithfulness check / abstain
    → log traces + cost
```

ASCII is intentional — portfolio markdown is sanitized; diagrams belong in code fences or image assets, not inline SVG.

Each stage has failure modes and cost. **Skipping measurement at retrieve-and-rank** is the most common reason teams burn budget on larger models instead of fixing k=20 habits.

## Retrieval quality: metrics that matter

Offline, on a **versioned gold set** (query → relevant chunk IDs, labeled by humans who know the corpus):

| Metric | What it tells you |
|--------|-------------------|
| **Recall@k** | Did the right evidence appear in the top k chunks? |
| **Precision@k** | How much noise did you feed the generator? |
| **MRR / nDCG** | Ranking quality when multiple chunks are partially relevant |

Report **per stratum**, not one global average: single-fact lookups, multi-hop questions, comparative queries, and ambiguous phrasing behave differently. A healthy average can hide collapsed multi-hop recall — the queries that matter for enterprise trust.

**Hard negatives** (chunks that look similar but are wrong) belong in the gold set. ANN indexes trade latency for completeness; offline metrics without hard negatives overstate production recall.

### Chunking and indexing (brief)

No universal chunk size. Smaller chunks improve precision; larger chunks preserve local context. Overlap reduces boundary cuts but increases index size. **Evaluate chunking changes** on the same gold set — do not ship a new splitter because it “felt better” in one example.

Refresh a slice of the gold set quarterly from **production queries** (with consent and redaction). Query distribution drifts; your 2025 test set lies to you in 2026.

### Hybrid retrieval and reranking

Pure vector search misses exact identifiers — SKUs, error codes, legal section numbers. **Hybrid retrieval** (dense + sparse/BM25) is standard in production for mixed query types. Fuse with reciprocal rank fusion or weighted merge, then **rerank** only the top N candidates (often 20–50, not hundreds) through a cross-encoder or lightweight reranker API.

Reranking improves precision@packed-context but adds latency and cost. Cap candidates entering rerank; dedupe near-duplicate chunks first. Measure **NDCG at the depth you actually pack into the prompt**, not at k=100 you never use.

## Generation quality: faithfulness and citations

Once retrieval is “good enough,” measure generation:

- **Faithfulness / groundedness** — Are claims supported by retrieved text?
- **Answer relevance** — Does the response address the question?
- **Citation accuracy** — If you require cites, do they point to the chunks actually used?
- **Abstention** — When evidence is missing, does the system refuse instead of invent?

LLM-as-judge can scale these checks, but **calibrate judges against human labels** on a fixed subset. Pin judge and embedding model versions where providers allow; alarm on score shifts when they do not.

For agentic systems that retrieve *and* call tools, combine RAG evals with tool traces — see [**MCP Explained**](/blog/mcp-explained-ai-agents-tools) for tool plumbing, not RAG-specific ranking.

## Evaluation workflow: dev, CI, production

A practical three-layer approach (aligned with common LLM eval practice):

1. **Development** — Fixed gold set; compare chunker, embedder, k, reranker, and prompt changes. **Do not regenerate labels between A/B runs.**
2. **CI gating** — On any change to retrieval or prompts, run offline suite; fail on stratum-level regression beyond tolerance. Attach scorecard to the PR.
3. **Production monitoring** — Sample live queries: faithfulness proxies, citation rate, reformulation rate, latency, tokens, cost. Treat sustained acceptance drops as incidents.

Unit tests still matter for **your code** (parsers, auth, rate limits). They do not validate retrieval ranking. Complement them with integration tests (fixed retrieval fixtures) and offline evals.

### Minimal gold-set example (illustrative)

| id | query | must_retrieve_chunk_ids | rubric |
|----|-------|-------------------------|--------|
| r01 | "What is the refund window for EU customers?" | `policy-eu-refund-§2` | Answer cites §2; no numeric refund unless in chunk |
| r02 | "Compare plan A vs plan B storage limits" | `plan-a-storage`, `plan-b-storage` | Both plans mentioned; no invented limits |
| r03 | (paraphrase of r01) | `policy-eu-refund-§2` | Recall robust to wording |

Version the file (`gold-v3.jsonl`) like application code.

## Cost control: budgets, not vibes

Production RAG spends tokens on: query embedding, **retrieved context (often dominant)**, reranker calls, and generation output. A common failure mode is **over-retrieval as insurance** — k=12 when k=6 suffices on 95% of queries — then paying long-context input prices on every request.

Define three budgets up front:

1. **Cost per successful answer** (or per task completion)
2. **Latency SLO** (P95 end-to-end and per stage)
3. **Quality floor** (offline recall@k, faithfulness rate)

### Levers (priority order)

1. **Retrieve less, better** — Improve ranking so fewer chunks reach the generator without hurting recall@k.
2. **Cap context** — Hard token budget for packed context; truncate with explicit “excerpt” boundaries.
3. **Route queries** — FAQ / keyword hit → cheap path; complex → full RAG. Do not run maximal pipeline on “hello.”
4. **Model tiering** — Smaller model for routing or summarization; larger only for synthesis when needed.
5. **Cache** — Embedding cache for repeated queries; answer cache for true FAQs (with TTL and invalidation on corpus change).
6. **Rerank selectively** — Cap candidates entering cross-encoder rerank; dedupe near-duplicate chunks first.

Track **cost per validated answer** (human or automated rubric pass), not raw tokens alone — cheap wrong answers are not savings.

## Security and abuse

RAG introduces risks beyond generic LLM chat:

- **Prompt injection via documents** — Untrusted PDFs/web pages in the corpus can instruct the model to ignore policy. Treat retrieved text as **untrusted data** in the prompt template.
- **Data leakage** — Retrieval across tenants or ACLs must be enforced **before** chunks enter context, not by hoping the model refuses.
- **PII in logs** — Traces often store queries and chunks; redact and retention-limit.

Human approval gates matter less for read-only internal Q&A than for agents that send email or mutate state — but **write paths powered by RAG** still need policy engines.

## Observability

Log structured fields per request:

- `request_id`, `corpus_version`, `index_build_id`
- `embed_model`, `retrieve_k`, `rerank_k`, `chunks_selected`
- `recall@k` (offline only), `faithfulness_score` (if computed)
- `tokens_in_context`, `tokens_out`, `latency_ms` per stage, `cost_usd_estimate`
- `abstained` (bool), `user_feedback` (if collected)

Dashboards: P95 latency, cost per query, citation rate, abstention spike, embedding/LLM error rate.

## Operational runbook (checklist)

Before calling RAG “production”:

- [ ] Gold set versioned; CI fails on stratum regressions
- [ ] `corpus_version` / `index_build_id` logged on every answer
- [ ] Rollback path for index rebuilds and embedding model changes
- [ ] Canary or shadow traffic for new retriever configs
- [ ] ACL enforced at retrieval, not in the prompt
- [ ] Cost and P95 alarms with on-call runbook
- [ ] Human review queue for low-confidence or high-risk query classes

Incidents often trace to **silent index drift** (documents updated, index not rebuilt) or **prompt edits** that shrink citation instructions. Change-control both like application code.

## When RAG is enough (and when it is not)

**RAG fits** when answers should stay grounded in a corpus that changes, you need citations, and tasks are mostly informational.

**Consider agents or workflows** when the task requires multi-step tool use, transactional side effects, or dynamic planning — see [**AI Agents Are Not Just Loops**](/blog/ai-agents-workflows-and-multi-agent-systems).

Many products need **both**: RAG for knowledge, tools for actions, evals for the whole path.

## Key takeaways

1. Measure retrieval separately from generation; fix recall@k before bigger models.
2. Maintain a versioned gold set with strata and hard negatives; gate CI on regressions.
3. Pair offline evals with production monitoring and corpus drift refresh.
4. Control cost with retrieval quality, context caps, routing, and caching — not hope.
5. Treat retrieved content as untrusted; enforce ACLs at retrieval time.

## References

- Evidently AI — [RAG evaluation guide](https://www.evidentlyai.com/llm-guide/rag-evaluation)
- Explore Agentic — [Enterprise RAG evaluation (retrieval metrics, gold sets, CI)](https://www.exploreagentic.ai/insights/enterprise-rag-evaluation/)
- GenAI Consulting — [Cost-and-latency budget for production RAG](https://genaiconsulting.services/blog/building-a-cost-and-latency-budget-for-production-rag-systems)
