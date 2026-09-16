---
title: MCP Explained: How AI Agents Connect to Real-World Tools
slug: mcp-explained-ai-agents-tools
date: 2026-09-17
excerpt: Model Context Protocol is not the model and not the agent — it is the standard interface between AI applications and the tools they need.
tags: [mcp, ai, agents, tools, architecture, developer-tools]
readingTimeMinutes: 15
roles: [software, ai, system]
---
# MCP Explained: How AI Agents Connect to Real-World Tools

Your agent needs GitHub issues, a Postgres read replica, Slack drafts, and an internal HR API. Without a standard, you write four custom adapters: auth flows, schema quirks, retry logic, and prompt-friendly descriptions — duplicated in every app. When the next team ships another agent, they rebuild the same glue.

**Model Context Protocol (MCP)** addresses the integration layer. It is important to state plainly: **MCP is not the language model. It is not the agent.** It is an open protocol for how an AI *application* connects to external systems — tools, resources, and prompts — through MCP servers, consumed by MCP clients inside the host app ([MCP introduction](https://modelcontextprotocol.io/introduction)).

This article explains the architecture, primitives, security implications, and how MCP fits next to an agent loop like the one in [**Building AI Agents with Claude**](/blog/building-ai-agents-with-claude).

![MCP architecture showing AI application connecting through MCP client to multiple MCP servers exposing tools and resources](/blog-assets/03-mcp/hero.svg)

## The integration problem

Before MCP, each AI product invented its own:

- Tool registration format
- Auth handoff (OAuth, API keys, SSO)
- Discovery ("what can this integration do?")
- Transport (stdio subprocess vs HTTP)

That fragmentation does not scale. MCP's analogy is deliberate: like USB-C standardizes physical ports, MCP standardizes how hosts attach to capability providers ([What is MCP?](https://modelcontextprotocol.io/introduction)).

Your agent runtime still decides *when* to call tools. MCP defines *how* those capabilities are exposed and invoked.

The N×M integration problem is real: N AI applications × M backends = N×M adapters unless you standardize. MCP lets M teams ship servers once; N hosts consume them through the same client protocol. That is the same economic argument as REST/OpenAPI for web APIs — applied to agent tooling.

## What MCP is

MCP is an **open-source standard** with:

- A **specification** (implementation requirements for clients and servers)
- **SDKs** in multiple languages
- **Reference servers** and dev tools (e.g. MCP Inspector)

It focuses on **context exchange** — not on how your app prompts the model or manages agent state ([Architecture overview](https://modelcontextprotocol.io/docs/concepts/architecture)).

## MCP architecture

Participants:

| Role | Responsibility |
|------|----------------|
| **MCP Host** | AI application (IDE, chat client, your agent service) |
| **MCP Client** | One client per server connection; maintains session |
| **MCP Server** | Exposes tools, resources, prompts to clients |

```
┌─────────────────────────────────────────────────────────────┐
│ MCP Host (your agent application)                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ MCP Client 1│  │ MCP Client 2│  │ MCP Client 3│         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
└─────────┼────────────────┼────────────────┼─────────────────┘
          │ stdio          │ stdio          │ HTTP
          ▼                ▼                ▼
   ┌────────────┐   ┌────────────┐   ┌────────────┐
   │ Filesystem │   │ Postgres   │   │ Remote SaaS│
   │ MCP Server │   │ MCP Server │   │ MCP Server │
   └────────────┘   └────────────┘   └────────────┘
```

**Local servers** often use **stdio** transport (subprocess on same machine). **Remote servers** use **Streamable HTTP** with standard auth (bearer tokens, OAuth) ([Architecture — transport layer](https://modelcontextprotocol.io/docs/concepts/architecture)).

**Data layer** messages are JSON-RPC 2.0: discovery, tool invocation, resource reads, notifications, progress for long operations. **Transport layer** handles framing and auth — stdio for minimal local latency; HTTP for remote SaaS integrations where the server runs on the vendor's infrastructure.

Choosing transport affects threat model: a local filesystem MCP server on stdio inherits the host process's OS permissions — run with minimal privileges, consider separate user namespaces for untrusted servers.

## MCP client

The client:

1. Establishes transport to a server
2. Performs capability discovery (`server/discover` and related JSON-RPC messages)
3. Invokes tools, reads resources, fetches prompt templates on behalf of the host

The host maps MCP tools into whatever format the LLM expects (e.g. Anthropic `tools` array). That mapping layer is **your** agent-computer interface — MCP does not replace thoughtful tool descriptions.

## MCP server

An MCP server is a program that implements the protocol and wraps a backend:

- GitHub API → `search_issues`, `get_pull_request`
- Database → `run_readonly_query` (never expose raw SQL execution without guardrails)
- Internal microservice → domain-specific tools with audit logs

Servers can be local (developer laptop) or remote (vendor-hosted). "Local" vs "remote" refers to **where the server runs and which transport is used**, not whether the data is on-prem ([Architecture — participants](https://modelcontextprotocol.io/docs/concepts/architecture)).

## Tools

**Tools** are actions the model can request — analogous to function calling. The server defines name, description, and input schema; the client forwards calls; the server executes and returns results.

Design tools for agents, not for humans clicking buttons:

- Narrow, composable operations
- Clear error payloads
- Read vs write separation

See tool design patterns in [**Building AI Agents with Claude**](/blog/building-ai-agents-with-claude).

## Resources

**Resources** expose **read-only context** — files, database rows, documentation URIs — without necessarily invoking a side effect. Useful for grounding: the host or agent fetches resource content into context before or during a turn.

Distinguish resources (context) from tools (actions). Mixing everything as a "tool" encourages unnecessary side effects.

## Prompts

**Prompts** are reusable **templates** servers can advertise — e.g. a standardized "summarize this repo" prompt with parameters. Hosts may surface these to users or internal workflows.

## Tool discovery

At connection time, clients discover server capabilities: protocol version, available tools, resources, prompts. Dynamic discovery means adding a server to the host can extend the agent without redeploying monolithic tool code.

```
Host starts → Client connects to server → Discovery response
       → Host registers tools in LLM-facing registry
       → Agent loop selects among unified tool surface
```

![Tool discovery flow from MCP client listing server capabilities to agent tool selection](/blog-assets/03-mcp/tool-discovery.svg)

Your policy engine should still **filter** discovered tools per user/session — discovery ≠ authorization.

## MCP + agents

Typical flow:

1. Host connects MCP clients to configured servers
2. Aggregates discovered tools into one registry (with namespacing to avoid collisions)
3. Agent loop calls Claude (or another model) with merged tool definitions
4. On `tool_use`, host routes execution to the correct MCP client/server
5. Results return to the model; loop continues

MCP does not define multi-agent orchestration — see [**AI Agents Are Not Just Loops**](/blog/ai-agents-workflows-and-multi-agent-systems) for workflow vs agent patterns. MCP is the **plumbing** under the agent.

## Security

**Authentication:** Remote HTTP servers should use OAuth or bearer tokens per MCP guidance — not long-lived secrets in prompts. Rotate credentials; scope tokens per tenant.

**Authorization:** Map OS user / app identity to which MCP servers and tools are visible. A read-only analyst should not inherit deploy tools because the server exposes them.

**Least privilege:** Servers should expose minimal tools. Prefer `list_open_incidents` over `run_arbitrary_sql`.

**Prompt injection:** Resource content (tickets, web pages) may contain adversarial instructions. Treat MCP outputs as **untrusted data** in the system prompt.

**Supply chain:** Third-party MCP servers run code with access to your environment — vet servers like any dependency; use network isolation for local stdio servers where possible.

**Prompt injection via resources:** A malicious PDF in a "resources" feed could instruct the model to exfiltrate data through a subsequent tool call. Mitigations: content sanitization summaries, tool policy that blocks exfil patterns, separate "untrusted context" channels in the prompt template.

**Audit logging:** Log every MCP tool invocation with `request_id`, `server_id`, `tool_name`, `user_id`, `status`, and redacted args. Retention policies should align with compliance requirements — not infinite storage of customer content.

## Permissions

Implement a **policy layer between discovery and execution**:

| Tool risk | Example | Policy |
|-----------|---------|--------|
| Read | `get_issue` | Allow for role |
| Write | `create_comment` | Allow + audit log |
| Destructive | `delete_repository` | Deny or human approval |

Graduated human approval: reads auto; external sends require review; production mutations require explicit sign-off. No universal policy fits all orgs.

## Human approval

For high-impact MCP tool calls, pause the agent loop:

1. Model requests tool
2. Policy marks `requires_approval`
3. Human UI shows args (redacted secrets)
4. On approve, client executes via MCP; on deny, return structured rejection to model

The model never holds credentials; humans never approve blind — show structured args.

## Practical architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ Agent API    │────▶│ MCP tool     │────▶│ MCP clients  │
│ + auth       │     │ router +     │     │ (per server) │
│              │     │ policy       │     └──────┬───────┘
└──────────────┘     └──────────────┘            │
       │                                         ▼
       ▼                                  MCP servers
┌──────────────┐                          (GitHub, DB, …)
│ Traces +     │
│ audit log    │
└──────────────┘
```

Layer stack (conceptual):

```
┌─────────────────────────────────────┐
│  Your app: agent loop, prompts,     │
│  approvals, observability           │
├─────────────────────────────────────┤
│  MCP data layer: JSON-RPC, tools,   │
│  resources, prompts, discovery      │
├─────────────────────────────────────┤
│  Transport: stdio | Streamable HTTP │
└─────────────────────────────────────┘
```

![Layered MCP stack with transport layer and data layer separating client-server communication](/blog-assets/03-mcp/layers.svg)

For production reliability patterns (retries, idempotency, evals), see [**Building Reliable AI Agents**](/blog/building-reliable-ai-agents).

**Rollout tip (hypothetical):** start with read-only MCP servers (docs, issue search) before enabling write tools. Measure tool error rates and model misuse patterns on reads alone. Add write tools behind approval gates one at a time — each new tool is a new authorization surface.

Namespace tools when aggregating multiple servers (`github_search_issues`, `jira_search_issues`) so the model and your policy engine can target them unambiguously.

**Testing MCP integrations:** use the MCP Inspector and reference servers during development. Contract-test your server's tool schemas separately from agent evals — a broken schema fails every agent turn. Version server capabilities; when you deprecate a tool, keep it returning a structured `DEPRECATED` error for one release cycle so hosts can migrate prompts.

## Key takeaways

1. MCP standardizes tool/context integration — it is not the model or the agent.
2. Host + clients + servers: one client connection per server.
3. Tools act; resources provide context; prompts template interactions.
4. Discovery enables plug-in extensibility; policy must still enforce authz.
5. Security, human approval, and audit logging belong in the host — MCP exposes capability, not governance.

## References

- Model Context Protocol — [Introduction](https://modelcontextprotocol.io/introduction)
- Model Context Protocol — [Architecture overview](https://modelcontextprotocol.io/docs/concepts/architecture)
- Anthropic Engineering — [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) (MCP as integration approach)
