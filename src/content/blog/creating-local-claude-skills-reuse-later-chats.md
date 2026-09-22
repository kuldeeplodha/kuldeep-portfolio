---
title: Creating Local Claude Skills and Reusing Them in Later Chats
slug: creating-local-claude-skills-reuse-later-chats
date: 2026-09-22
excerpt: A hands-on tutorial for Claude Code Agent Skills—SKILL.md, personal vs project folders, slash invocation, and how skills persist across sessions without re-pasting the same instructions.
tags: [claude, claude-code, skills, ai, productivity, tutorial]
readingTimeMinutes: 11
roles: [software, ai]
---

# Creating Local Claude Skills and Reusing Them in Later Chats

You finally wrote the perfect checklist: how your team runs migrations, reviews PRs, or summarizes a diff before commit. You paste it into Claude Code every Monday. A week later you paste it again in a new session—and again after `/clear`. **Agent Skills** fix that pattern: you store the procedure once in a `SKILL.md` file on disk, and Claude Code loads it when you invoke `/skill-name` or when your task matches the skill's `description`.

This tutorial follows the official Claude Code skills documentation as of September 2026 ([Extend Claude with skills](https://code.claude.com/docs/en/skills)). UI details change; paths and mechanics below are what the docs specify today.

![Agent Skills architecture showing how skills integrate with agent configuration and the execution environment](/blog-assets/creating-local-claude-skills-reuse-later-chats/anthropic-agent-skills-architecture.png)

*Source: [Agent Skills overview](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview) (Anthropic).*

## What is a Claude Code skill?

A **skill** is a folder with a `SKILL.md` file: YAML **frontmatter** (metadata Claude reads at discovery time) plus **markdown instructions** (the body loads when the skill runs, not on every turn). That lazy loading matters for long runbooks—you are not paying context for a deploy guide until someone actually deploys.

![Anthropic illustration of a skill directory containing a SKILL.md file with instructions, scripts, and resources](/blog-assets/creating-local-claude-skills-reuse-later-chats/anthropic-engineering-skill-directory.png)

*Source: [Equipping agents for the real world with Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills) (Anthropic Engineering, Oct 2025).*

Skills extend the open [Agent Skills](https://agentskills.io) standard; Claude Code adds invocation control, subagents, and dynamic context injection on top.

Custom slash commands from `.claude/commands/foo.md` still work, but new work should prefer `.claude/skills/foo/SKILL.md` so you can bundle reference files, control auto-invocation, and share the folder via git.

## Where skills live (personal vs project)

Where you save the folder decides **which sessions see the skill** and **how reuse works later**.

| Location | Path | Loads in |
| --- | --- | --- |
| Personal | `~/.claude/skills/<name>/SKILL.md` | All projects on **this machine** |
| Project | `.claude/skills/<name>/SKILL.md` | Sessions in **this repository** (commit for teammates) |
| Enterprise | Managed settings directory | Org-deployed machines |

Personal skills are ideal for habits you want in every repo—commit-message style, your local lint wrapper, a personal security checklist. Project skills are ideal for **team procedures** tied to one codebase: release steps, schema migration order, or "how we run integration tests here."

![Diagram: personal ~/.claude/skills vs project .claude/skills (not a product screenshot)](/blog-assets/creating-local-claude-skills-reuse-later-chats/folder-structure.svg)

The **directory name** becomes the slash command: `summarize-changes` → `/summarize-changes`. In listings, the optional frontmatter `name` field can change the display label; the command still comes from the folder name for personal and project skills.

## Step 1 — Create your first personal skill

The official docs walk through a **summarize uncommitted changes** skill. We'll use the same shape so you can compare line-by-line with Anthropic's page.

### Create the directory

```bash
mkdir -p ~/.claude/skills/summarize-changes
```

### Write SKILL.md

Every skill file starts with frontmatter between `---` lines. The opening `---` must be the **first line** of the file; otherwise Claude Code treats the whole file as skill content and ignores your metadata.

![Anthropic example of a simple SKILL.md file showing YAML frontmatter and markdown instructions](/blog-assets/creating-local-claude-skills-reuse-later-chats/anthropic-engineering-skill-md-simple.jpg)

*Source: [Equipping agents for the real world with Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills) — figure “A simple SKILL.md file” ([CDN](https://www-cdn.anthropic.com/images/4zrzovbb/website/6f22d8913dbc6228e7f11a41e0b3c124d817b6d2-1650x929.jpg)).*

Save `~/.claude/skills/summarize-changes/SKILL.md`:

```yaml
---
description: Summarizes uncommitted changes and flags anything risky. Use when
  the user asks what changed, wants a commit message, or asks to review their
  diff.
---

## Current changes

!`git diff HEAD`

## Instructions

Summarize the changes above in two or three bullet points, then list any risks
you notice such as missing error handling, hardcoded values, or tests that need
updating. If the diff is empty, say there are no uncommitted changes.
```

Two mechanics worth noting:

1. **`description`** — Claude uses this to decide whether to load the skill automatically when your message matches the intent.
2. **`!`command``** — *Dynamic context injection*: Claude Code runs the shell command and replaces that line with output **before** Claude reads the skill, so the summary is grounded in your real diff ([skills docs — Getting started](https://code.claude.com/docs/en/skills)).

As skills grow, you can bundle extra markdown or scripts beside `SKILL.md` and reference them by filename—Claude loads those files only when needed ([progressive disclosure](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)).

![Illustration of a skill folder with SKILL.md referencing additional bundled files such as reference.md](/blog-assets/creating-local-claude-skills-reuse-later-chats/anthropic-engineering-skill-bundled-files.jpg)

*Source: [Equipping agents for the real world with Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills) (Anthropic Engineering).*

### Test in Claude Code

In a git repo, make a small edit, start Claude Code (`claude`), then either:

- Ask naturally: *What did I change?* (auto-invocation via `description`), or
- Type: `/summarize-changes`

You should get bullets plus a short risk list. No re-pasting the checklist.

## Step 2 — Control who invokes the skill

By default, **you and Claude** can both trigger a skill. For workflows with side effects, restrict auto-invocation.

```yaml
---
description: Deploy the app to staging after explicit user request.
disable-model-invocation: true
---

Run the staging deploy only when the user invoked this skill with /deploy-staging.
Confirm the target environment before executing any script.
```

With `disable-model-invocation: true`, only your `/deploy-staging` (or similar) runs the skill—Claude will not "helpfully" deploy because the diff looks ready. The docs list this field in the frontmatter reference table ([frontmatter fields](https://code.claude.com/docs/en/skills)).

Use the inverse pattern when you want a reference skill Claude should **not** expose as a user slash command—consult the docs for `user-invocable` / skill visibility options as your version supports them.

## Step 3 — Reuse across later chats and sessions

**Reuse** is the whole point: skills are files, not chat history.

### Personal skills (`~/.claude/skills/`)

Once `SKILL.md` exists on disk, **every new Claude Code session** on that machine can load it. You do not re-import or re-upload the text. Close the terminal, open a new project tomorrow, run `claude`, and `/summarize-changes` still works.

Claude Code also **watches** skill directories during a session—edits to `SKILL.md` can be picked up without restarting (see "Edit a skill during a session" in the official docs).

### Project skills (`.claude/skills/` in the repo)

Commit the skill folder to git. Teammates get the same `/skill-name` after pull. **Cloud sessions** that clone your repository load project skills from the repo; personal `~/.claude/` paths on your laptop do not travel with them.

Anthropic's docs describe skills loading into the context window only when triggered—metadata first, then the skill body, then optional bundled files. That model is why reuse across sessions works: the files on disk (or in git) are the source of truth, not a single chat transcript.

![Skills loading into the context window with progressive loading of metadata and skill content](/blog-assets/creating-local-claude-skills-reuse-later-chats/anthropic-agent-skills-context-window.png)

*Source: [Agent Skills overview](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview) (Anthropic).*

![Table of progressive disclosure levels: SKILL.md metadata always loaded, body when triggered, bundled files as needed](/blog-assets/creating-local-claude-skills-reuse-later-chats/anthropic-engineering-progressive-disclosure-tokens-table.jpg)

*Source: [Equipping agents for the real world with Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills) — progressive disclosure token levels ([CDN](https://www-cdn.anthropic.com/images/4zrzovbb/website/a3bca2763d7892982a59c28aa4df7993aaae55ae-2292x673.jpg)).*

### Cowork, cloud, and claude.ai sync

Sessions that run in **Cowork** or **cloud** do not read your local `~/.claude/skills/` tree. Those environments use skills enabled for your **claude.ai account** (synced into `~/.claude/skills/synced/` on signed-in terminal sessions) plus **project** skills in the cloned repo ([Skills in Cowork and cloud sessions](https://code.claude.com/docs/en/skills)).

Practical takeaway:

- **Local-only habit** → `~/.claude/skills/` (fastest for solo dev on one machine).
- **Team + cloud CI agents** → `.claude/skills/` in the repo (and/or enable the skill on claude.ai if you need it in Cowork).
- If a routine says "skill not found," the skill probably lives only on your laptop—move it to the repo or enable it on your account.

Desktop **scheduled tasks** run locally and **do** load `~/.claude/skills/`, which is why the docs distinguish them from cloud routines.

## Step 4 — Share a skill with your team (project skill)

For a deploy checklist tied to one service:

```bash
mkdir -p .claude/skills/release-checklist
```

Add `.claude/skills/release-checklist/SKILL.md` with your steps, optional `reference.md` in the same folder, and frontmatter. Commit and push. Anyone who clones the repo gets the skill in sessions rooted in that project.

Monorepo nuance: Claude Code walks **parent directories** up to the repo root for `.claude/skills/`. Nested skills under a subdirectory may load only after Claude works in that path—use `/add-dir` if you need them earlier ([monorepos and subdirectories](https://code.claude.com/docs/en/skills)).

## Step 5 — Name collisions and precedence

If `deploy` exists in both `~/.claude/skills/` and the project's `.claude/skills/`, **`/deploy` runs the personal skill** (enterprise > personal > project). Rename folders or namespace by purpose (`deploy-staging` vs `deploy-prod`) to avoid surprises.

Plugin skills use namespaced commands like `/plugin-name:skill-name` and can coexist with local skills of similar names.

## Optional: supporting files and CLAUDE.md

Keep **facts** (stack, conventions) in `CLAUDE.md`. Keep **procedures** (multi-step, rarely needed) in skills. Bundle scripts or long references beside `SKILL.md`; reference them with `${CLAUDE_SKILL_DIR}` in the markdown so paths stay portable ([dynamic paths in skills](https://code.claude.com/docs/en/skills)).

## Checklist before you rely on a skill in production

1. **Frontmatter** — `description` is specific enough for auto-invocation; side-effect skills use `disable-model-invocation: true`.
2. **First line** — `---` starts the file.
3. **Location** — personal vs project matches where you need reuse (local only vs git vs cloud).
4. **Test** — invoke with `/name` and with a natural-language prompt that should match `description`.
5. **Version control** — project skills are reviewed like code; personal skills are yours to back up.

## Further reading

- [Extend Claude with skills](https://code.claude.com/docs/en/skills) — authoritative paths, frontmatter table, bundled skills, synced claude.ai skills.
- [Building AI Agents with Claude](/blog/building-ai-agents-with-claude) — when agent loops and tools matter more than repeatable slash workflows.
- [MCP Explained for AI Agents](/blog/mcp-explained-ai-agents-tools) — connecting Claude to external systems; skills complement MCP but do not replace it.

---

## Image credits

| Asset | Source |
| --- | --- |
| `anthropic-agent-skills-architecture.png` | [platform.claude.com/docs/images/agent-skills-architecture.png](https://platform.claude.com/docs/images/agent-skills-architecture.png) — Agent Skills docs |
| `anthropic-agent-skills-context-window.png` | [platform.claude.com/docs/images/agent-skills-context-window.png](https://platform.claude.com/docs/images/agent-skills-context-window.png) — Agent Skills docs |
| `anthropic-engineering-skill-directory.png` | [Anthropic Engineering blog](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills) (Sanity CDN) |
| `anthropic-engineering-skill-md-simple.jpg` | [Engineering blog](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills) — [6f22d891…929.jpg](https://www-cdn.anthropic.com/images/4zrzovbb/website/6f22d8913dbc6228e7f11a41e0b3c124d817b6d2-1650x929.jpg) |
| `anthropic-engineering-skill-bundled-files.jpg` | Same engineering post |
| `anthropic-engineering-progressive-disclosure-tokens-table.jpg` | Same engineering post — [a3bca276…673.jpg](https://www-cdn.anthropic.com/images/4zrzovbb/website/a3bca2763d7892982a59c28aa4df7993aaae55ae-2292x673.jpg) |
| `folder-structure.svg` | Editorial diagram (this repo) for Claude Code personal vs project paths; not a product screenshot |

All Anthropic imagery is used with attribution for a tutorial about Anthropic products. Claude Code-specific UI may differ; see [code.claude.com/docs/en/skills](https://code.claude.com/docs/en/skills) for terminal workflows.
