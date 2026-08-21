# CCAR-F Prerequisites & Skills Matrix

Companion to CURRICULUM.md. Three jobs: (1) what you need BEFORE starting this
course, (2) the complete inventory of skills and concepts the exam tests —
granular, and tagged by whether they're portable across the AI field or
Claude-specific, (3) the complete Claude Code capability inventory, both for
using it and for building on it.

**Tags used throughout:**
- **[G]** General AI/LLM field — the concept transfers to OpenAI, Google, Mistral, etc. (names may differ)
- **[C]** Claude/Anthropic-specific — this exact mechanism, name, flag, or file location
- **[S]** Open standard — MCP: originated by Anthropic, now adopted across the industry; the protocol is portable, the config file locations are [C]

---

## Part 1 · Prerequisites to start this course

### 1A. Environment (do-now checklist)

| Item | Why | Verify |
|---|---|---|
| Node.js 18+ & npm | All labs are Node scripts | `node --version` |
| Git + a GitHub account | Repo, team sharing, the "teammate clones" exercises | `git --version` |
| VS Code (or any editor) + terminal comfort | Where you'll live | — |
| Claude Code installed & authenticated | The tutor and half the syllabus | `claude --version` |
| Anthropic API key + small budget (~$5–20) | SDK labs call the API directly | env var set |
| This repo set up (kit merged at root, PROGRESS.md created) | The course itself | `/` shows /teach |

### 1B. Baseline knowledge — general software skills (none of this is AI-specific)

You don't need mastery, but you should not be meeting these for the first time
mid-lab:

- **JavaScript/Node basics [G]:** functions, objects/arrays, `async/await` and
  promises (the single most-used language feature in the labs), `import`/
  `require`, `JSON.parse`/`JSON.stringify`, running `node script.js`, reading
  a stack trace.
- **npm [G]:** what `package.json` and `package-lock.json` are, `npm install`,
  why `node_modules` is regenerable and never committed.
- **Git/GitHub [G]:** init, clone, commit, push, branch; `.gitignore`; the
  team implication of "committed to the repo" (this literally powers the
  project-vs-user scoping questions).
- **Command line [G]:** navigating, running commands with flags, environment
  variables, stdin/stdout, exit codes.
- **Formats [G]:** fluent JSON; YAML (for frontmatter); Markdown; **glob
  patterns** (`**/*.test.tsx` — directly examined); reading a JSON Schema
  (`required`, `enum`, nullable/optional fields).
- **HTTP/REST basics [G]:** request/response, headers, status codes, what an
  API endpoint is.
- **Testing literacy [G]:** what a unit test is and what "the test failed"
  output looks like (used in TS 3.5, 3.6).

Not needed: Python (the guide mentions Pydantic; we use Zod — identical
concept [G]), TypeScript proficiency, React proficiency, Docker, any cloud.

### 1C. What the official guide assumes vs what this course provides

The guide's ideal candidate has **6+ months hands-on with Claude APIs, Agent
SDK, Claude Code, and MCP**. This course is engineered to *manufacture* that
experience in compressed form — every one of those four technologies is
something you build with, not just read about. If you're starting from zero on
them, that's fine: it just means leaning on TEACH mode longer before
attempting PRACTICE mode, and expecting the full ~10 sessions rather than
skimming.

---

## Part 2 · Concept map — what's general AI vs what's Claude

High level first, then granular. "TS" = task statement(s) where you train it.

### Pillar 1 — LLM fundamentals [G]
| Concept | Tag | Granular items | TS |
|---|---|---|---|
| Tokens & context window | G | token budgets; outputs and tool results consume context; context exhaustion | 5.1, 5.4 |
| Message roles | G | system / user / assistant; full history resent every call (statelessness) | 1.1 |
| Non-determinism | G | same prompt ≠ same output; "prompt instructions have a non-zero failure rate" — the root of the enforcement pillar | 1.4 |
| Hallucination / fabrication | G | models fill required gaps with plausible values; design (not pleading) prevents it | 4.3 |
| Generation stop conditions | G concept, C names | natural end vs token limit vs stop string → Claude names: `end_turn`, `max_tokens`, `stop_sequence` | 1.1 |

### Pillar 2 — Tool calling & the agent loop
| Concept | Tag | Granular items | TS |
|---|---|---|---|
| Function/tool calling | G | declare tools with schemas; model requests a call; you execute and return results (OpenAI = "function calling") | 1.1 |
| The agent loop | G | request → inspect why it stopped → execute tools → append results → repeat | 1.1 |
| `stop_reason` handling | C | `"tool_use"` = keep going, `"end_turn"` = done; anti-patterns: text parsing, iteration caps, text presence | 1.1 |
| `tool_choice` | G concept, C values | `"auto"` / `"any"` / forced `{"type":"tool","name":…}` — freedom / must-call-something / ordering | 2.3, 4.3 |
| Tool interface design | G | descriptions as the routing signal; input formats, examples, boundaries; naming to avoid overlap; split vs consolidate | 2.1 |
| Tool distribution | G | least privilege; too many tools degrades selection; scoped cross-role tools | 2.3 |

### Pillar 3 — Prompt engineering [G]
| Concept | Granular items | TS |
|---|---|---|
| Explicit criteria | categorical rules beat "be conservative"; severity rubrics with code examples; false-positive/trust dynamics | 4.1 |
| Few-shot prompting | 2–4 targeted examples for AMBIGUOUS cases; show the reasoning; format demonstration; generalization | 4.2 |
| Iterative refinement | concrete I/O examples; test-driven iteration; interview pattern; interacting-vs-independent fixes | 3.5 |
| Prompt chaining | fixed sequential passes (per-file → integration) vs dynamic decomposition | 1.6 |

### Pillar 4 — Structured output
| Concept | Tag | Granular items | TS |
|---|---|---|---|
| Schema-enforced output | G concept, C mechanism | Claude's way: a tool whose input schema IS your target; read the tool_use block | 4.3 |
| Schema design for honesty | G | nullable for maybe-absent; enum + "other"+detail; "unclear" escape hatch; required+absent=fabricated | 4.3 |
| Syntactic vs semantic validity | G | schemas guarantee structure, not truth; sums may not reconcile; self-check fields (calculated vs stated, conflict_detected) | 4.3, 4.4 |
| Validation-retry loops | G | resend doc + failed output + SPECIFIC error; retries never fix absent information | 4.4 |

### Pillar 5 — Multi-agent orchestration
| Concept | Tag | Granular items | TS |
|---|---|---|---|
| Coordinator–subagent (hub-and-spoke) | G | coordinator decomposes, delegates, aggregates; all comms route through it; decomposition-too-narrow failure | 1.2 |
| Context isolation | G | subagents inherit nothing; explicit context passing; content vs metadata separation | 1.3 |
| Parallel execution | G concept, C mechanism | multiple Task calls in ONE response = parallel [C] | 1.3 |
| Iterative refinement loop | G | gap check → targeted re-delegation → re-synthesis | 1.2 |
| Multi-instance review | G | independent reviewer beats self-review (generator keeps its own reasoning context); multi-pass vs attention dilution | 4.6 |

### Pillar 6 — Context management [G concepts, C commands]
| Concept | Tag | Granular items | TS |
|---|---|---|---|
| Summarization loss | G | precise facts (amounts, dates, IDs) die in summaries → persistent case-facts block | 5.1 |
| Lost in the middle | G | beginning/end reliable, middle drops → key findings first, section headers | 5.1 |
| Pre-context trimming | G | 40-field tool output → 5 relevant fields BEFORE it enters history | 5.1 |
| Scratchpads & state persistence | G | findings file consulted later; crash-recovery manifests reloaded on resume | 5.4 |
| Compaction | C | `/compact` — trade-off is PRECISION (misquoted refund amount) | 5.4 |

### Pillar 7 — Reliability, errors, humans [G]
| Concept | Granular items | TS |
|---|---|---|
| Deterministic vs probabilistic enforcement | prompts suggest, code enforces; gates for money/compliance | 1.4, 1.5 |
| Structured error taxonomy | transient/validation/business/permission; isRetryable; attempted + partial results; empty ≠ error | 2.2, 5.3 |
| Error propagation | local recovery for transients; structured context upward; never silent-success, never kill-the-workflow; coverage annotations | 5.3 |
| Escalation design | three triggers (explicit request → immediate; policy gap; no progress); rejected proxies: sentiment, self-reported confidence | 5.2 |
| Human-in-the-loop & calibration | field-level confidence calibrated on labeled sets; stratified sampling of HIGH-confidence output; segment accuracy before automating | 5.5 |
| Provenance | claim-source mappings survive synthesis; conflicts annotated with attribution, never arbitrated; dates prevent fake contradictions | 5.6 |

### Pillar 8 — MCP [S]
| Concept | Tag | Granular items | TS |
|---|---|---|---|
| The protocol | S | servers expose tools + resources to any MCP-capable client — portable across vendors | 2.4 |
| MCP tools | S | actions; rich descriptions drive adoption vs built-ins | 2.1, 2.4 |
| MCP resources | S | content catalogs (schemas, doc trees) — visibility without exploratory calls | 2.4 |
| Error signalling | S | `isError` flag + structured payload | 2.2 |
| Config scoping | C | project `.mcp.json` (committed, `${ENV}` expansion) vs user `~/.claude.json`; local overrides team | 2.4 |

### Pillar 9 — Batch processing
| Concept | Tag | Granular items | TS |
|---|---|---|---|
| Async batch concept | G | latency-tolerant workloads traded for cost | 4.5 |
| Message Batches API | C | 50% savings · up to 24h · no latency SLA · no multi-turn tool calling · `custom_id` correlation · resubmit-failures-only · blocking = synchronous, always | 4.5 |

### Buzzword decoder (terms you'll hear vs what the exam calls them)

| Term in the wild | What people mean | Exam-guide term | Tag |
|---|---|---|---|
| "agent" / "agentic" | LLM in a loop with tools acting toward a goal | agentic loop | G |
| "subagents" | agents spawned by an orchestrating agent | coordinator–subagent pattern, Task tool | G / C |
| **"deep agents"** | community term (not official Claude vocabulary): agents with planning + subagents + persistent memory/filesystem | covered as: coordinator–subagent orchestration + scratchpad files + session state (TS 1.2, 5.4, 1.7) | G |
| "agent skills" / "skills" | reusable procedure packages Claude Code loads on demand | Claude Code Skills — `SKILL.md` + frontmatter | C |
| "guardrails" | hard constraints on agent behavior | hooks, programmatic prerequisites | G concept / C mechanism |
| "HITL" | human-in-the-loop | human review workflows, escalation | G |
| "headless" | running without interactive UI | `-p` / `--print` non-interactive mode | C |
| "function calling" | OpenAI's name for tool use | tool use, `tool_use` | G |
| "JSON mode / structured outputs" | vendor features forcing JSON | tool_use with JSON schemas | G concept / C mechanism |

---

## Part 3 · Complete Claude Code capability inventory [C]

### 3A. Using Claude Code (your development tool)

**Run & drive** — install/auth; launch in a folder (project context = where you
launch); model selection; `/help`; interactive vs plan mode toggle; approving/
rejecting proposed actions.

**Context configuration** — CLAUDE.md hierarchy: user `~/.claude/CLAUDE.md`
(never shared) → project root (committed, the team's) → subdirectory (lazy,
scoped); additive combination; `@path` imports (≤5 levels); **`/memory`** to
verify what loaded; `.claude/rules/*.md` with YAML `paths:` globs for
conditional loading.

**Extending** — slash commands: `.claude/commands/` (project) vs
`~/.claude/commands/` (personal), `$ARGUMENTS`, frontmatter (`description`,
`argument-hint`); Skills: `.claude/skills/<name>/SKILL.md`, frontmatter
`context: fork` (isolated execution), `allowed-tools` (restriction),
`argument-hint`; personal skill variants; the placement rule — CLAUDE.md =
always / skills = on demand / rules = by path.

**Working patterns** — plan mode vs direct execution (stated complexity → plan
now); Explore subagent (verbose discovery out of main context); built-in tools
and their lanes (Read, Write, Edit + fallback, Bash, Grep=content,
Glob=paths); `/compact` and its precision trade-off; sessions: named
`--resume`, `fork_session` branches, fresh-session-plus-summary decision.

**Consuming MCP** — project `.mcp.json` with `${ENV}` expansion; personal
`~/.claude.json`; simultaneous discovery; same-name precedence (local wins);
description quality steering MCP-vs-built-in choice.

### 3B. Building ON the platform (embedding Claude in systems)

**Headless / CI** — `-p` (`--print`); `--output-format json`; `--json-schema`;
CLAUDE.md as CI context (standards, fixtures, criteria); fresh-instance
review; re-review with prior findings ("only new or still-open"); providing
existing tests to prevent duplicates.

**Claude Agent SDK apps** (`@anthropic-ai/claude-agent-sdk`) — managed loop
(vs manual); AgentDefinition (description, system prompt, tool restrictions);
`allowedTools` incl. `"Task"` for spawning; built-in tool suite; hooks:
PreToolUse (gate/block/redirect) and PostToolUse (normalize results);
parallel Task calls; session resume/fork.

**Raw API apps** (`@anthropic-ai/sdk`) — manual agent loop on `stop_reason`;
tool definitions & results; `tool_choice` three modes; structured extraction
via tool schemas; Message Batches API lifecycle (submit → poll → correlate by
`custom_id` → resubmit failures).

**MCP authoring** (`@modelcontextprotocol/sdk`) — servers exposing tools with
rich descriptions; structured errors (`isError` + category/retryable payload);
resources as catalogs; description engineering for correct adoption.

*(3A ≈ exam Domain 3 + parts of 2; 3B ≈ Domains 1, 2, 4 + TS 3.6. The Part A4
checklist in CURRICULUM.md tracks your hands-on coverage of every item.)*

---

## Part 4 · Explicitly NOT required (don't study these)

From the guide's out-of-scope list — appearing to "know AI" doesn't help here:
fine-tuning/training, API auth/billing/account management, MCP server
*hosting* (containers, networking), model internals/weights, Constitutional
AI/RLHF, embeddings & vector databases, computer use, vision/image analysis,
streaming/SSE, rate limits & pricing math, OAuth/key rotation, cloud provider
config, benchmarking, prompt-caching internals, tokenization algorithms.
Also not needed despite being popular: LangChain/LlamaIndex, RAG pipelines,
Python.

---

## Part 5 · Readiness self-check

You're ready to START the course if you can honestly say:
1. I can write and run a Node script using async/await and read its errors.
2. I can commit and push to GitHub and explain what `.gitignore` does.
3. I can read a JSON object and a JSON Schema without squinting.
4. I know what an HTTP API endpoint is.
5. My environment checklist (1A) is all green.

You're ready to BOOK the exam when `/progress` confirms: all 30 statements
Practiced, every Part A4 capability ticked, every domain quizzing ≥85%, and a
full `/quiz mock` clears the estimated 720 pass mark.
