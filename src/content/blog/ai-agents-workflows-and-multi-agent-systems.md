---
title: AI Agents Are Not Just Loops: Understanding Workflows, Agents and Multi-Agent Systems
slug: ai-agents-workflows-and-multi-agent-systems
date: 2026-09-17
excerpt: When to use a workflow, a single agent, or a multi-agent system — and why the agent loop alone is an incomplete mental model.
tags: [ai, agents, architecture, llm, system-design]
readingTimeMinutes: 11
roles: [software, ai, system]
---
# AI Agents Are Not Just Loops: Understanding Workflows, Agents and Multi-Agent Systems

A stakeholder says: *"We need an AI agent for this."* You ask what it should do. The answer is a fixed checklist: ingest a CSV, validate columns, run three known SQL queries, email a PDF. That is not an agent problem. It is orchestration. Yet teams reach for autonomous loops because "agent" is the buzzword of the quarter — and pay in latency, cost, and debuggability.

This article unpacks the architecture space beyond the simple loop: workflows, single agents, and multi-agent systems — and gives a practical framework for choosing among them. If you have not yet built a minimal agent loop, start with [**Building AI Agents with Claude**](/blog/building-ai-agents-with-claude).

![Spectrum diagram showing workflow, single agent, and multi-agent patterns on a complexity axis](/blog-assets/ai-agents-workflows-and-multi-agent-systems/hero.svg)

## Why the "agent loop" definition is incomplete

Calling everything with an LLM an "agent" hides important design choices. Anthropic's engineering guidance draws a sharp line:

- **Workflows** — LLMs and tools orchestrated through **predefined code paths** you control.
- **Agents** — LLMs **dynamically direct** their own processes and tool usage.

The loop (`plan → tool → observe → repeat`) describes *how an agent runs*, not *whether you need one*. Production systems often combine patterns: a router workflow that dispatches to a single agent; an orchestrator that spawns workers; an evaluator-optimizer loop inside a fixed pipeline.

Treating "agent" as a synonym for "uses Claude" leads to over-engineering simple tasks and under-engineering safety on open-ended ones.

## Workflow

A **workflow** is your code deciding the sequence. The LLM is a step — sometimes several steps — but control flow is explicit: `if`, `switch`, DAGs, queues.

**When it shines:** predictable steps, clear success criteria, need for auditability and repeatable behavior.

**Trade-off:** less flexibility when inputs vary wildly; you maintain the graph as requirements change.

Workflows are also easier to **test**. You can assert "step 2 always runs after step 1 passes schema validation" without simulating model stochasticity. For regulated domains — finance, healthcare, infrastructure — auditors often want a deterministic graph they can review, not a black-box loop.

Common implementations: Airflow/Prefect DAGs with LLM nodes, Step Functions state machines, or plain Python functions orchestrating API calls. The LLM is a replaceable component; the graph is the contract.

## Prompt chaining

Decompose a task into a **sequence of LLM calls**, each consuming the previous output. Add programmatic gates between steps (schema validation, regex checks, human review).

```
Input → [LLM: outline] → gate → [LLM: draft] → gate → [LLM: polish] → Output
```

**Use when:** subtasks are stable and sequential; you want higher accuracy per step at the cost of latency.

**Example (hypothetical):** generate release notes from merged PR titles, verify JSON schema, then format for Slack — three calls, two gates, zero autonomous tool selection.

**Gate design matters.** A gate can be as simple as `json.loads` validation or as complex as a classifier that rejects outputs containing PII patterns. Failed gates should return structured feedback to the previous step ("outline missing section 3") rather than restarting from scratch — saves tokens and latency.

## Routing

Classify input and send it to a **specialized branch** — different prompts, models, or tools.

```
                    ┌──▶ Refund workflow (Haiku + policy tools)
User message ──▶ Router ──┼──▶ Technical workflow (Sonnet + runbook RAG)
                    └──▶ Escalate to human
```

**Use when:** categories are distinct and classification is reliable (LLM or classical model).

Anthropic notes routing billing questions to smaller models and edge cases to larger ones as a cost/latency optimization ([Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)).

## Parallelization

Run **independent subtasks concurrently** and merge results.

**Sectioning** — split work: one call summarizes logs, another checks config drift, a third drafts remediation.

**Voting** — multiple calls on the same input; aggregate by majority or rubric (useful for safety screening or high-stakes classification).

**Use when:** subtasks do not depend on each other's mid-flight output, or you need diverse perspectives.

## Orchestrator-worker

A **central LLM** breaks down a task, delegates to **worker** LLMs (or tools), synthesizes results. Subtasks are **not fixed upfront** — the orchestrator decides based on input.

![Orchestrator-worker pattern with central coordinator delegating to specialized worker agents](/blog-assets/ai-agents-workflows-and-multi-agent-systems/orchestrator-workers.svg)

```
User task → Orchestrator → Worker A (search codebase)
                        → Worker B (edit file X)
                        → Worker C (run tests)
          → Orchestrator synthesizes → Response
```

**Use when:** complexity is unpredictable (e.g. "fix this bug" — which files matter depends on the bug).

**Risks:** higher cost, orchestrator mistakes propagate, needs strong tracing. Workers should have narrow tool scopes (least privilege per worker).

**Observability:** tag every worker invocation with a shared `task_id` and `orchestrator_turn`. When synthesis fails, you need to know which worker returned bad data. Without correlated traces, multi-step systems become undebuggable.

Consider a hypothetical code-migration agent: the orchestrator might delegate "find usages of deprecated API" to a search worker and "generate patch" to an edit worker. If the search worker hallucinates file paths, the edit worker operates on fiction — gates on worker output (file exists, parseable diff) catch this before merge.

## Evaluator-optimizer

One LLM **generates**; another **critiques** against criteria; loop until pass or max iterations.

**Use when:** you have clear evaluation rubrics and iterative refinement measurably helps — translation, long-form docs, complex search summaries.

**Not a fit when:** evaluation is subjective and expensive; a single well-prompted call is enough.

## Single agents

A **single agent** is one LLM in a tool loop until done or stopped — the pattern in [**Building AI Agents with Claude**](/blog/building-ai-agents-with-claude).

**Use when:**

- Steps cannot be enumerated in advance
- Tool selection must adapt to intermediate results
- You accept higher latency/cost for flexibility
- Guardrails (max turns, approvals, sandbox) are in place

**Do not use when:** a workflow or chain would be shorter, cheaper, and easier to test.

## Multi-agent systems

**Multiple agents** with distinct roles, prompts, and tool sets — coordinated by an orchestrator, message bus, or shared state.

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Researcher  │────▶│ Implementer │────▶│ Reviewer    │
│ agent       │     │ agent       │     │ agent       │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       └───────────────────┴───────────────────┘
                    Shared trace / board
```

**Use when:** separation of concerns reduces prompt confusion (research vs code vs security review); different agents need different tools or models.

**Costs:** coordination overhead, duplicated context, harder debugging without shared trace IDs. Prefer **one agent with good tools** until proven insufficient.

**Coordination patterns:**

- **Supervisor** — one agent assigns tasks, reviews output (similar to orchestrator-worker but agent-native)
- **Handoff** — sequential specialists pass structured artifacts ("research packet" → "draft" → "legal review")
- **Shared blackboard** — agents read/write a common state store (careful with race conditions and secret leakage)

Multi-agent hype often outpaces need. A single agent with ten well-designed tools usually beats three agents re-explaining the same context. Split when prompts fight each other (security reviewer vs creative writer) or tool sets must be isolated.

For tool connectivity across agents, [**MCP Explained**](/blog/mcp-explained-ai-agents-tools) standardizes how applications attach servers without N custom integrations.

## Trade-offs

| Pattern | Flexibility | Predictability | Cost | Debuggability |
|---------|-------------|----------------|------|---------------|
| Prompt chain | Low | High | Medium | High |
| Routing | Medium | High | Low–Medium | High |
| Parallelization | Medium | Medium | Medium–High | Medium |
| Orchestrator-worker | High | Medium | High | Medium |
| Evaluator-optimizer | Medium | Medium | High | Medium |
| Single agent | High | Low–Medium | Medium–High | Low–Medium |
| Multi-agent | Highest | Lowest | Highest | Lowest |

**Security note:** every pattern still needs auth, tool policy, and human gates for destructive actions. More agents means more surfaces to permission and audit.

## When not to use agents

- Fixed pipelines with known steps → workflow
- Strict regulatory audit trails requiring deterministic paths → workflow + gates
- Sub-200ms latency requirements → avoid multi-turn loops
- No budget for evals and tracing → fix observability first ([**Building Reliable AI Agents**](/blog/building-reliable-ai-agents))

Anthropic's consistent advice: **find the simplest solution; add complexity only when measurement justifies it.**

## Architecture decision framework

Use this **heuristic**, not a universal law — your domain constraints may override any branch.

```
                         START: New LLM feature
                                  │
                                  ▼
                    ┌─────────────────────────────┐
                    │ Are steps known and fixed?  │
                    └─────────────┬───────────────┘
                          yes     │     no
                           ▼      │      ▼
                    ┌──────────┐  │  ┌──────────────────────────┐
                    │ WORKFLOW │  │  │ Need dynamic tool choice │
                    │ (chain,  │  │  │ per input?               │
                    │ route,   │  │  └────────────┬─────────────┘
                    │ parallel)│  │        yes    │    no
                    └──────────┘  │         ▼     │     ▼
                                  │  ┌──────────┐ │ ┌─────────────┐
                                  │  │ SINGLE   │ │ Revisit:    │
                                  │  │ AGENT    │ │ maybe RAG + │
                                  │  └────┬─────┘ │ one LLM call│
                                  │       │       │ └─────────────┘
                                  │       ▼
                                  │  ┌────────────────────────────┐
                                  │  │ Single agent insufficient  │
                                  │  │ (roles/tools conflict)?    │
                                  │  └────────────┬───────────────┘
                                  │        yes    │    no
                                  │         ▼     │     ▼
                                  │  ┌──────────┐ │ Stay single │
                                  │  │ MULTI-   │ │ agent; tune │
                                  │  │ AGENT    │ │ tools/prompt│
                                  │  └──────────┘ └─────────────┘
```

![Decision tree for choosing between workflow, single agent, and multi-agent approaches](/blog-assets/ai-agents-workflows-and-multi-agent-systems/decision-tree.svg)

**Before shipping:** define success metrics, failure modes, stopping conditions, and who approves irreversible tool calls.

**Combining patterns is normal.** A production system might route incoming requests (workflow), run a single agent for ambiguous cases (agent), and wrap generation in evaluator-optimizer for customer-facing text (workflow). The decision framework helps you name what you built — and avoid calling the entire stack "one agent" in incident postmortems.

Instrument every pattern with the same observability fields: `request_id`, tool name, latency, token usage, and human intervention flags. Pattern choice changes cost and risk; it does not change the need for traces.

## Key takeaways

1. The agent loop is a runtime pattern, not an architecture strategy.
2. Workflows trade flexibility for predictability — often the right default.
3. Orchestrator-worker and evaluator-optimizer are workflows with LLM-planned steps, not full autonomy.
4. Multi-agent adds coordination cost; default to one well-tooled agent.
5. Measure before adding complexity; security and observability apply to every pattern.

## References

- Anthropic Engineering — [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)
- Anthropic — [Tool use](https://docs.anthropic.com/en/docs/build-with-claude/tool-use)
