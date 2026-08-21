# CCAR-F Hands-On Study Plan
### Claude Certified Architect – Foundations · Practice-first preparation

**Method:** You build every concept before you study it. Each lab produces something running on your machine; the "exam angle" notes then attach the exam's judgment patterns to what you just watched happen. Finish with a strict self-test protocol.

**Time budget:** ~10 working sessions of 1.5–2 hours (roughly 2 weeks at 1 session/day). Session time is weighted like the blueprint: Domain 1 gets nearly twice the time of Domain 5.

---

## 0 · Know exactly what you're facing

Memorize these logistics (they frame everything):

| Fact | Value |
|---|---|
| Items / time | 60 questions, 120 minutes (2 min/question) |
| Format | Multiple-choice **and multiple-response** (each item states how many to pick) |
| Structure | 4 scenarios, drawn at random from a bank of **6** |
| Passing | Scaled 720 on 100–1,000 |
| Validity | 12 months; free non-proctored renewal if on time |
| Fee / retakes | $125; waiting periods 14 → 30 → 90 days; max 4 attempts per rolling 12 months |

**Blueprint weights (drive your revision time):**

| # | Domain | Weight |
|---|---|---|
| 1 | Agentic Architecture & Orchestration | **27%** |
| 2 | Tool Design & MCP Integration | 18% |
| 3 | Claude Code Configuration & Workflows | 20% |
| 4 | Prompt Engineering & Structured Output | 20% |
| 5 | Context Management & Reliability | 15% |

**Explicitly out of scope — do not spend time on:** fine-tuning, auth/billing, MCP server hosting/infra, model internals, Constitutional AI/RLHF, embeddings/vector DBs, computer use, vision, streaming, rate limits/pricing math, OAuth/key rotation, cloud provider config, benchmarking, prompt-caching internals, tokenization.

**The meta-pattern for the whole exam** (from someone who sat it): *distractors are rarely wrong — they are disproportionate.* Almost every question is decided by one of five judgment templates:

1. **Root cause first, lowest effort first** (fix the description before adding a routing layer)
2. **Deterministic when errors have consequences** (money/compliance → hooks and gates, not prompt instructions)
3. **Guarantees have edges — know where each stops** (schemas guarantee structure, not truth)
4. **Never suppress errors, never kill the workflow** (structured error context; no silent success, no total termination)
5. **Good vs best: size the fix to the problem**

Keep these on a sticky note through every lab below.

---

## Phase 1 · Environment setup (Session 0, ~45 min)

You need: Node.js 18+, npm, git, an Anthropic API key, and Claude Code.

```bash
# 1. Verify prerequisites
node --version        # 18+

# 2. Install Claude Code
npm install -g @anthropic-ai/claude-code
claude --version
claude                # run once in any folder to authenticate

# 3. Create your lab repo — everything lives here
mkdir ccarf-lab && cd ccarf-lab
git init
npm init -y
npm install @anthropic-ai/sdk @anthropic-ai/claude-agent-sdk @modelcontextprotocol/sdk zod

# 4. API key for SDK exercises
export ANTHROPIC_API_KEY=sk-ant-...
```

Add a small "practice" app so Claude Code has something real to work on. Ask Claude Code itself to scaffold it:

```
claude "Create a small Express API in src/ with three routes (customers, orders,
refunds) backed by an in-memory store, plus two React-style component files in
src/components/ and matching *.test.tsx files spread through the tree. Keep it
under 300 lines total."
```

**Cost control:** use `claude-haiku-4-5` for all SDK loop experiments — you're studying mechanics, not output quality.

**Verification habit:** the exam guide (July 2026) is your syllabus, but confirm any CLI flag or config path against `claude --help`, `/help`, and the docs before trusting your memory: https://docs.claude.com/en/docs/claude-code/overview and https://docs.claude.com/en/api/overview

---

## Phase 2 · Domain 1: Agentic Architecture & Orchestration (27% — Sessions 1–3)

### Lab 1.1 — Build the agent loop by hand (Anthropic SDK)

Create `labs/01-agent-loop.js`. Define three **fake local tools** — `get_customer`, `lookup_order`, `process_refund` — as plain JS functions returning canned JSON. Then implement the loop yourself:

1. Send messages + tool definitions to the Messages API.
2. Inspect `response.stop_reason`.
3. If `"tool_use"`: execute each requested tool, append the assistant message **and** a user message containing `tool_result` blocks to history, loop again.
4. If `"end_turn"`: surface the final text. Done.

Log `stop_reason` on every iteration and watch the history grow. Then **deliberately break it** three ways and observe why each is an anti-pattern: (a) stop when reply text contains "resolved", (b) hard cap of 5 iterations as the *primary* stop, (c) stop as soon as any text content appears.

> **Exam angle:** `stop_reason` is the designed termination signal. Any answer that decides the loop from reply text, iteration caps, or text presence is wrong. Also know the other generation-enders: `max_tokens` and `stop_sequence`.

### Lab 1.2 — tool_choice, three ways

Same script, three runs against a vague prompt ("hi, I have a question"):

- `tool_choice: {"type": "auto"}` → model may just answer in text
- `tool_choice: {"type": "any"}` → model **must** call some tool
- `tool_choice: {"type": "tool", "name": "get_customer"}` → pins the **first** call to one named tool

> **Exam angle:** `"any"` = guarantee of structured output when the document/request type is unknown. Forced selection = enforcing order (e.g., `extract_metadata` before enrichment). `"auto"` = the model's decision.

### Lab 1.3 — Agent SDK: the loop disappears, hooks appear

Rewrite the same agent with `@anthropic-ai/claude-agent-sdk`. Notice what you no longer write: the loop, termination, tool plumbing — the SDK manages it and ships built-in tools (Bash, Grep, Glob…). Build the comparison table from memory afterwards: package name, abstraction level, execution model, loop logic, built-in tools for **Anthropic SDK vs Claude Agent SDK**.

Now add two hooks:

- **PreToolUse** — intercept `process_refund`; if `amount > 500`, **block** the call and redirect to `escalate_to_human`. Not "discourage in the prompt" — block in code.
- **PostToolUse** — your fake tools return a mess on purpose (one Unix timestamp, one ISO 8601, one numeric status code). Normalize them all before the model sees the results.

Prove the point: remove the PreToolUse hook, add a system-prompt instruction "never refund above $500" instead, and adversarially push the agent until it slips. Prompts have a non-zero failure rate; hooks are code.

> **Exam angle:** money, compliance, or "occasionally still happens" in the question stem → the answer is **enforcement, not encouragement** (hooks/prerequisite gates over prompt wording). This decides Sample Question 1 in the guide.

### Lab 1.4 — Coordinator + subagents

Build a mini research system: a coordinator with two subagents (searcher, synthesizer).

- Coordinator's `allowedTools` must include `"Task"` — that's the spawning mechanism.
- Spawn subagents **in parallel** by emitting multiple Task calls in a single coordinator response; time it against sequential spawning.
- Subagents get **isolated context** — they inherit nothing. Pass prior findings explicitly in the subagent prompt, as structured data separating content from metadata (claim, excerpt, source URL, publication date).
- Break it on purpose: give the coordinator "impact of AI on creative industries" and a lazy decomposition prompt. If the report only covers one slice, you've reproduced the guide's Sample Q7 — the root cause is **coordinator decomposition too narrow**, not the downstream agents.

> **Exam angles:** hub-and-spoke: all communication routes through the coordinator. Coordinator prompts state *goals and quality criteria*, not step-by-step procedures. Iterative refinement = coordinator inspects synthesis for gaps → re-delegates targeted queries → re-synthesizes.

### Lab 1.5 — Sessions: resume, fresh, fork

- Run a named investigation, exit, `claude --resume <name>` — it picks up exactly where it stopped.
- Modify several analyzed files heavily, resume again, and watch it reason over stale tool results. **This is the trap:** heavily changed files → start a *fresh session with a structured summary* instead (or at minimum tell the resumed session exactly which files changed).
- Use `fork_session` to branch two approaches (e.g., two testing strategies) from one shared analysis baseline.

> **Exam angle:** "files changed heavily since the session ran" + "resume" in an option = trap answer.

### Lab 1.6 — Task decomposition patterns

Two quick contrasting runs: (a) **prompt chaining** — fixed sequential pipeline for a predictable review (per-file pass, then cross-file integration pass); (b) **dynamic decomposition** — "add tests to this legacy code": map structure first, find high-impact areas, plan adapts as dependencies surface. Know which fits which stem.

---

## Phase 3 · Domain 2: Tool Design & MCP Integration (18% — Sessions 4–5)

### Lab 2.1 — Descriptions ARE the selection mechanism

Write a tiny MCP server (`labs/mcp-support-server/`) with `@modelcontextprotocol/sdk`, exposing `get_customer` and `lookup_order` with deliberately terrible one-line descriptions ("Retrieves customer information" / "Retrieves order details"). Connect it to Claude Code and fire ambiguous requests ("check my order #12345") until you see misrouting.

Then fix it **the cheap way**: expand each description with input formats, example queries, edge cases, and explicit "use X when… use Y when…" boundaries. Re-test.

> **Exam angle (this is Sample Q2, an official sample):** the escalation ladder for misrouting is **descriptions first** → few-shot → routing layer → consolidation. The other options aren't wrong — they're *disproportionate*. Also know: overlapping names cause misrouting (rename `analyze_content` → `extract_web_results`); keyword-sensitive system-prompt wording can override good descriptions; split generic tools into purpose-specific ones with clear contracts.

### Lab 2.2 — Structured error responses

Give your MCP tools real failure modes and return **structured** errors via the `isError` pattern with a JSON payload:

```json
{ "errorCategory": "transient | validation | business | permission",
  "isRetryable": true,
  "description": "human-readable, customer-friendly for business errors",
  "attempted": "...", "partialResults": [...] }
```

Verify the agent behaves differently per category: retries transients, explains business violations, never retries `retriable: false`. Also implement the subtle one: **an empty result set from a valid query is success, not an error** — report it as such.

> **Exam angle:** generic "Operation failed" hides the recovery decision from the agent. Silent suppression (empty-as-success for real failures) and killing the whole workflow on one failure are both named anti-patterns.

### Lab 2.3 — Config scoping + tool distribution

- Team servers → **project** `.mcp.json` at repo root, committed, with `${GITHUB_TOKEN}`-style env expansion so no literal secret ever hits git.
- Personal/experimental servers → **user** `~/.claude.json`, never in version control. Configure one of each and confirm both are discovered simultaneously; note that a same-named local entry overrides the team's.
- Tool distribution: give an agent 15+ tools and watch selection degrade; then scope each subagent to its 4–5 role tools. For the high-frequency cross-role need, add one **scoped** tool (the guide's Sample Q9: synthesis agent gets a narrow `verify_fact` for the 85% simple case; the 15% complex case still routes through the coordinator).

> **Exam angles:** "where does the config go" is often the entire question — and a committed literal token is *always* a wrong option. Too many tools degrades reliability; least privilege wins. Prefer community MCP servers for standard integrations (Jira), custom only for team-specific workflows. MCP **resources** expose content catalogs (schemas, doc hierarchies) so the agent doesn't burn exploratory tool calls.

### Lab 2.4 — Built-in tools drill

In your lab repo, do each deliberately with Claude Code and name the tool it should pick: find all callers of a function (**Grep** — content), find `**/*.test.tsx` (**Glob** — paths), targeted change with unique anchor text (**Edit**), and when Edit fails on non-unique text → **Read + Write** fallback. Codebase understanding is incremental: Grep entry points → Read to follow imports — not "read everything upfront."

---

## Phase 4 · Domain 3: Claude Code Configuration & Workflows (20% — Sessions 6–7)

*The deck calls this "the most learnable marks on the paper." It's pure setup — do all of it.*

### Lab 3.1 — The CLAUDE.md hierarchy

Create all three levels and prove how they combine (they're **additive**):

| File | Scope | Travels via git? |
|---|---|---|
| `~/.claude/CLAUDE.md` | User — yours alone | **Never** |
| `<repo>/CLAUDE.md` | Project — whole team | Yes, committed |
| `<repo>/<subdir>/CLAUDE.md` | Directory — lazy-loaded, that folder only | Yes |

Put a distinctive instruction at each level, open sessions in different directories, and run **`/memory`** each time to see exactly which files loaded — that's the verification tool the exam expects you to name. Then simulate the trap: put "team standards" in your user file, clone the repo fresh (as a "new teammate"), and watch them vanish. Fix = move to project CLAUDE.md.

Add an `@path` import (`@./docs/standards.md`) — modular config, relative or absolute, nests up to five levels.

> **Exam angle:** "a new team member isn't following our conventions" is a **hierarchy** question, not a prompting question.

### Lab 3.2 — Rules, commands, skills

- **`.claude/rules/`** — create `testing.md` with YAML frontmatter `paths: ["**/*.test.tsx"]` and `api.md` with `paths: ["src/api/**/*"]`. Edit matching vs non-matching files; confirm conditional loading. This is the answer whenever conventions apply to files *spread across* the tree (directory CLAUDE.md files can't follow them — Sample Q6).
- **`.claude/commands/review.md`** — a project slash command; committed → every developer gets `/review` on clone (Sample Q4). Personal commands live in `~/.claude/commands/`.
- **`.claude/skills/deploy-check/SKILL.md`** — body = the procedure; frontmatter = `context: fork` (runs isolated so verbose output doesn't pollute the main session), `allowed-tools` (restrict to safe operations), `argument-hint` (prompts for missing params). Personal variants go in `~/.claude/skills/` under a different name.
- Know the placement logic: **CLAUDE.md** = always-loaded universal context ("how things are"); **skills** = on-demand procedures ("what to do"); **rules** = conditionally-loaded conventions by path.

### Lab 3.3 — Plan mode vs direct execution

Run both on purpose-built tasks: a one-file bug fix with a clear stack trace (**direct execution** — plan mode is overhead), then "restructure this app toward services / migrate a library across many files" (**plan mode**: explore, propose, no edits until approved). Use the **Explore subagent** during discovery and note the verbose output staying out of your main context.

> **Exam angle:** complexity *stated in the requirements* means plan mode **now** — "switch if it gets hard later" is the trap (Sample Q5). Combining is fine: plan for investigation, direct for the planned implementation.

### Lab 3.4 — CI/CD

```bash
claude -p "Review the diff for security issues only" \
  --output-format json --json-schema review-schema.json
```

- **`-p` / `--print`** is the only way to run non-interactively; without it the job hangs waiting for input. `CLAUDE_HEADLESS=true` and `--batch` **do not exist** — the exam loves plausible-sounding flags (Sample Q10).
- `--output-format json` + `--json-schema` → machine-parseable findings you could post as PR comments.
- **Fresh instance for review:** the session that wrote the code is anchored to its own reasoning and reviews itself gently — reviews come from an independent instance.
- Re-reviews after new commits: feed the prior findings in and ask only for **new or still-open** issues (avoids duplicate comments). Provide existing test files so test generation doesn't duplicate coverage; put testing standards/fixtures in CLAUDE.md so CI-invoked Claude has project context.

### Lab 3.5 — Iterative refinement patterns

Quick reps of each, so you recognize them in stems: 2–3 concrete input/output examples when prose is interpreted inconsistently; test-driven iteration (write the suite first, share failures); the **interview pattern** (Claude asks questions first in unfamiliar domains); and the rule for multiple issues — **one detailed message when fixes interact, sequential when independent**.

---

## Phase 5 · Domain 4: Prompt Engineering & Structured Output (20% — Session 8)

### Lab 4.1 — Extraction pipeline (the heart of Scenario 6)

Build `labs/04-extract.js` against 5 messy fake invoices (make some fields absent, one ambiguous, one with a category outside your list):

1. Define an extraction **tool** whose input schema is your target JSON Schema; force it with `tool_choice`. Read the structured data from the `tool_use` block.
2. First run: mark `vendor_tax_id` **required**. Feed an invoice without one. Watch the model fabricate a plausible value — a required field on absent information leaves it no honest answer.
3. Fix at the schema level: make it **nullable**. Add enum categories with **`"other"` + a free-text detail field**, and an **`"unclear"`** value as the honest escape hatch. Add self-check fields: `calculated_total` alongside `stated_total`, plus a `conflict_detected` boolean.
4. Validate with Zod (Pydantic's role in the guide). On failure, **retry with error feedback**: resend document + failed extraction + the specific validation error. Then prove the limit: no retry can ever fix *information that isn't in the source*.
5. Add 2–4 few-shot examples showing extraction across varied formats and ambiguous cases *with the reasoning for the choice*.

> **Exam angle (the deck's biggest theme):** **schemas guarantee structure, not truth.** Guaranteed: well-formed, required fields present, zero syntax errors. Not guaranteed: correct values, sums that reconcile, honesty about absence. Well-formed ≠ semantically correct. Nullable-by-design is the *prevention*; checksums and prompts are downstream patches (Sample-style Domain 4 question in the deck).

### Lab 4.2 — Precision and false positives

Write a code-review prompt two ways: vague ("be conservative, only high-confidence findings") vs **explicit categorical criteria** ("flag a comment only when its claimed behavior contradicts the code; report bugs and security; skip minor style"). Compare false positives. Know the trust dynamic: one noisy category poisons confidence in the accurate ones — temporarily disable it while you fix its prompt. Define severity levels with a concrete code example per level.

### Lab 4.3 — Batch API + multi-pass review

- Submit a tiny batch (5 requests) via the Message Batches API: `custom_id` per request, poll for completion, resubmit only failures (chunk the oversized one). Facts to lock in: **50% cost savings, up to 24-hour window, no latency SLA, no multi-turn tool calling inside a request.** Decision rule: overnight/weekly = batch; **blocking pre-merge = synchronous, always** (Sample Q11). Refine prompts on a sample set *before* batching the full volume.
- Multi-pass review: run one 14-file review in a single pass, then restructured as per-file passes + one cross-file integration pass. The single pass shows attention dilution and contradictions; a bigger context window does **not** fix attention quality; consensus-of-3 *suppresses* intermittently-caught real bugs (Sample Q12). Independent instance > self-review, because the generator carries its own reasoning context.

---

## Phase 6 · Domain 5: Context Management & Reliability (15% — Session 9)

### Lab 5.1 — Context under pressure

- Run a long multi-issue support conversation through your Lab 1 agent and watch precise facts (amounts, dates, order numbers) blur through summarization. Fix: extract them into a **case-facts block** re-sent at the top of every prompt, outside summarized history.
- Your fake `lookup_order` returns 40 fields; **trim to the ~5 relevant fields before they enter context**, not after.
- **Lost in the middle:** bury a key fact mid-way through a long aggregated input and quiz the model; then move it to the top with explicit section headers. Critical content goes at the beginning or end.
- In a long Claude Code session, run **`/compact`**, then ask for an exact figure from earlier. The trade-off is **precision** — "after compacting, the agent misquotes the refund amount" is the canonical stem. Long sessions get a **scratchpad file** of key findings; subagents/Explore isolate verbose discovery; crash recovery = structured state exports (manifest) the coordinator reloads.

### Lab 5.2 — Escalation calibration

Add explicit escalation criteria **with few-shot examples** to your support agent's system prompt, then test the three triggers: (1) customer explicitly asks for a human → **escalate immediately, no investigation first**, however solvable it looks (if they're merely frustrated but the issue is in-capability: acknowledge, offer to resolve, escalate only if they reiterate); (2) **policy gap/ambiguity** (competitor price-match when policy only covers own-site) → hand over, don't improvise; (3) no meaningful progress. Multiple customer matches → ask for another identifier, never pick heuristically. Handoffs carry a structured summary (customer ID, root cause, amount, recommended action) because the human can't see the transcript.

> **Exam angle:** **sentiment analysis and self-reported confidence scores are rejected proxies** — if an option routes on a confidence score the model gave itself, it's the trap (Sample Q3).

### Lab 5.3 — Error propagation + provenance

- Simulate a subagent timeout in your Lab 1.4 system. Propagate **structured error context** (failure type, attempted query, partial results, alternatives) to the coordinator; let it proceed with partial results and annotate coverage gaps in the final report (Sample Q8). Subagents recover transients locally; only unresolvable errors go up.
- Provenance: subagents output **claim-source mappings** (claim, excerpt, URL/doc, **publication date**) that synthesis must preserve. Feed two credible sources with conflicting statistics → the answer is *annotate both with attribution*, never pick one. Dates prevent temporal differences masquerading as contradictions. Reports separate well-established from contested findings; render content natively (tables for financials, prose for news) rather than flattening.
- Human review routing: field-level confidence scores calibrated on a labeled set; **stratified random sampling** of high-confidence extractions catches novel errors; segment accuracy by document type and field before automating — 97% aggregate can hide a failing segment.

---

## Phase 7 · Scenario coverage check

The exam serves 4 of these 6. Your labs cover all of them — verify each box before moving to testing:

| Scenario | Covered by |
|---|---|
| 1 · Customer Support Resolution Agent | Labs 1.1–1.3, 2.1–2.2, 5.1–5.2 |
| 2 · Code Generation with Claude Code | Labs 3.1–3.3, 3.5, 5.1 |
| 3 · Multi-Agent Research System | Labs 1.4, 2.3, 5.3 |
| 4 · Developer Productivity (Agent SDK + built-ins) | Labs 2.3–2.4, 1.5, 3.2 |
| 5 · Claude Code for CI | Labs 3.4, 4.2, 4.3 |
| 6 · Structured Data Extraction | Labs 4.1, 4.3, 5.3 |

For each scenario, re-read its paragraph in the exam guide (§5) and say out loud which domains it draws from and which three traps you'd expect inside it.

---

## Phase 8 · Self-test protocol (Sessions 10+)

**Gate 1 — the 12 sample questions, cold.** A few days after finishing the labs, answer all 12 in the guide (§9) without notes. Standard: 12/12, *and* for each you must articulate why every distractor is disproportionate — not just pick the letter. Any miss → redo that lab, not just the reading.

**Gate 2 — flash-fact sheet.** From memory, reproduce: the SDK comparison table; the three `tool_choice` values and their use cases; the `stop_reason` values; the full config-location table (CLAUDE.md ×3, `.claude/rules/`, `.claude/commands/`, `.claude/skills/`, `.mcp.json`, `~/.claude.json` — plus "shared via git?" for each); the CI flags (`-p`, `--output-format json`, `--json-schema`); batch API's four facts; the three escalation triggers and two rejected proxies; the skill frontmatter keys (`context: fork`, `allowed-tools`, `argument-hint`).

**Gate 3 — mock exam.** Take Anthropic's **official practice exam** on the Anthropic Academy — it's your readiness check, not your starting point. Sit it in exam conditions: 120 minutes, no notes. Score your domain breakdown against the blueprint and spend remaining sessions only on domains under ~80%.

**Gate 4 — get drilled.** Have Claude quiz you: ask for blueprint-weighted, scenario-based multiple-choice questions in the exam's style (realistic production stem, four "all plausible, one proportionate" options), answered one at a time with grading, rationale, and a running per-domain score. Request multi-response items too, since the real exam includes them. Keep going until you're consistently above ~85% per domain.

**Exam-day mechanics:** 2 minutes per question — read the stem for the trigger word first ("occasionally still happens" → enforcement; "spread throughout the codebase" → glob rules; "blocking pre-merge" → synchronous; "new teammate" → hierarchy; "confidence score" → trap). Government ID matching your registration exactly; reschedule ≥24h ahead or forfeit the fee.

---

## Appendix · One-line trap index

- Loop decided by text/iteration caps/text presence → wrong; `stop_reason` decides.
- Misrouting fix ladder: descriptions → few-shot → routing layer → consolidation.
- Money/compliance/"still happens occasionally" → hook or gate, never prompt-only.
- New teammate missing standards → user-level vs project-level CLAUDE.md.
- Conventions on scattered files → `.claude/rules/` glob frontmatter, not directory CLAUDE.md.
- Committed literal token → always wrong; `${ENV_VAR}` expansion.
- CI hang → `-p`; `CLAUDE_HEADLESS` and `--batch` don't exist.
- Stated complexity → plan mode now, not "switch later".
- Heavily changed files → fresh session + summary; resume is the trap.
- Well-formed JSON ≠ semantically correct; required + absent = fabricated → nullable.
- Retries can't conjure information absent from the source.
- Blocking workflow on Batch API → wrong; batch = overnight/weekly only.
- Self-reported confidence or sentiment as router → trap.
- Generic errors, silent empty-as-success, or killing the whole workflow → all anti-patterns.
- Bigger context window as the fix for attention dilution → wrong; multi-pass.
- Self-review in the generating session → wrong; independent instance.