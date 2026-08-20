# CCAR-F Curriculum — 30 Task Statements, Fully Traceable

How to use: `/teach <id>` → guided walkthrough · `/practice <id>` → independent
task, verified against the acceptance criteria below · `/quiz <scope>` → exam-
style questions · `/progress` → status and next step. Recommended rhythm per
statement: teach → practice (ideally the next day) → quiz.

---

## Part A · Coverage maps

### A1. Task statements → where they're trained
Every one of the exam guide's 30 task statements has its own section in Part B
below (guided + independent exercise + exam angle). Nothing is untested.

### A2. The 6 exam scenarios → task statements exercised
The exam serves 4 of these 6 at random. Coverage:

| Scenario | Task statements that train it |
|---|---|
| S1 Customer Support Resolution Agent | 1.1, 1.4, 1.5, 2.1, 2.2, 5.1, 5.2 |
| S2 Code Generation with Claude Code | 3.1, 3.2, 3.3, 3.4, 3.5, 5.4 |
| S3 Multi-Agent Research System | 1.2, 1.3, 1.6, 2.3, 5.3, 5.6 |
| S4 Developer Productivity with Claude | 1.7, 2.3, 2.4, 2.5, 3.2 |
| S5 Claude Code for CI | 3.6, 4.1, 4.5, 4.6 |
| S6 Structured Data Extraction | 4.2, 4.3, 4.4, 4.5, 5.5 |

### A3. The exam guide's 4 official preparation exercises (§8) → included where

| Official exercise | Covered by task statements |
|---|---|
| Ex 1 · Multi-tool agent with escalation logic | 1.1, 1.4, 1.5, 2.1, 2.2, 5.2 |
| Ex 2 · Claude Code for a team workflow | 3.1, 3.2, 3.3, 3.4, 2.4 |
| Ex 3 · Structured data extraction pipeline | 4.2, 4.3, 4.4, 4.5, 5.5 |
| Ex 4 · Multi-agent research pipeline | 1.2, 1.3, 5.3, 5.6 |

### A4. Claude Code capability checklist (tick every one hands-on)
☐ CLAUDE.md hierarchy (user/project/directory) · ☐ @import · ☐ /memory ·
☐ .claude/rules/ with paths globs · ☐ .claude/commands/ (project + user) ·
☐ .claude/skills/ + frontmatter (context: fork, allowed-tools, argument-hint) ·
☐ MCP: project .mcp.json + ${ENV} expansion · ☐ MCP: user ~/.claude.json ·
☐ MCP resources · ☐ built-in tools (Read/Write/Edit/Bash/Grep/Glob) ·
☐ subagents: Task tool, Explore subagent, Agent SDK subagents (what you may
have seen called "deep agents" — the exam term is coordinator–subagent
orchestration) · ☐ hooks (PreToolUse gate, PostToolUse normalize) ·
☐ plan mode vs direct execution · ☐ sessions: --resume, fork_session ·
☐ /compact · ☐ headless: -p, --output-format json, --json-schema

---

## Part B · Per-statement exercises

Format — **Guided:** what /teach walks you through. **Independent:** what
/practice sets, with acceptance criteria (AC) the tutor verifies. **Angle:**
the exam pattern this trains.

### Domain 1 · Agentic Architecture & Orchestration (27%)

**1.1 Agentic loop & stop_reason**
Guided: build `labs/01-agent-loop.js` (Anthropic SDK) — 3 fake local tools
(get_customer, lookup_order, process_refund), loop while `stop_reason ==
"tool_use"`, append tool_result blocks, exit on `"end_turn"`; log every
iteration. Deliberately break it 3 ways (text parsing, iteration cap, text
presence) and observe.
Independent: fresh script, different domain (IT helpdesk: reset_password,
check_ticket, escalate). AC: loops only on tool_use; exits only on end_turn;
history contains assistant tool_use + user tool_result pairs; learner can name
max_tokens and stop_sequence as the other generation enders.
Angle: stop_reason is the designed termination signal — everything else is a
named anti-pattern.

**1.2 Coordinator–subagent orchestration**
Guided: Agent SDK coordinator + 2 subagents (searcher, synthesizer), hub-and-
spoke: all communication routes through the coordinator; goals-and-quality-
criteria prompt, not step-by-step procedure.
Independent: reproduce the "creative industries" failure (lazy decomposition →
one-slice report), diagnose from coordinator logs, fix decomposition, then add
an iterative refinement loop (coordinator checks synthesis for gaps → re-
delegates targeted queries → re-synthesizes). AC: decomposition covers the
full topic; refinement loop demonstrably fires; learner attributes the failure
to the coordinator, not downstream agents.
Angle: subagents succeeding ≠ system succeeding; root cause is what they were
*assigned*.

**1.3 Subagent invocation, context passing, spawning**
Guided: coordinator's allowedTools includes "Task"; pass prior findings
explicitly in each subagent prompt as structured data separating content from
metadata (claim, excerpt, source URL, date).
Independent: prove context isolation (ask a subagent about parent context it
was never given — it can't answer); then spawn two subagents in parallel via
multiple Task calls in ONE coordinator response and time it vs sequential. AC:
explicit context injection shown; parallel spawn measured faster; metadata
separated from content.
Angle: no automatic inheritance — if the subagent needs it, you passed it.

**1.4 Enforcement & handoff patterns**
Guided: programmatic prerequisite gate — block lookup_order/process_refund in
code until get_customer has returned a verified ID.
Independent: A/B it — replace the gate with a prompt instruction and
adversarially push until it slips; restore the gate. Then build a structured
handoff summary for escalation (customer ID, root cause, amount, recommended
action) for a human who cannot see the transcript. AC: gate blocks in code;
prompt-only version demonstrably failed at least once; handoff object complete.
Angle: money/compliance/"occasionally still happens" → enforcement, not
encouragement.

**1.5 Hooks (PreToolUse / PostToolUse)**
Guided: PreToolUse intercepts process_refund > $500 → blocks and redirects to
escalate_to_human; PostToolUse normalizes messy tool outputs (Unix timestamp,
ISO 8601, numeric status codes) before the model sees them.
Independent: add a brand-new business rule (e.g., no account deletion without
a prior verification tool call) as a hook, without touching any prompt. AC:
hook fires and redirects; normalized data reaches the model; prompts unchanged.
Angle: prompts suggest, hooks enforce.

**1.6 Task decomposition strategies**
Guided: prompt chaining — fixed pipeline of per-file analysis passes then one
cross-file integration pass over victim-app.
Independent: dynamic decomposition — "add tests to this legacy module": map
structure first, identify high-impact areas, produce a prioritized plan that
adapts as dependencies surface. AC: both patterns implemented; learner states
the selection rule (predictable multi-aspect → chaining; open-ended
investigation → dynamic).
Angle: pick the decomposition that matches the workflow's predictability.

**1.7 Sessions: resume, fresh, fork**
Guided: named session, exit, `--resume <name>`; then `fork_session` to branch
two approaches from one shared analysis baseline.
Independent: make heavy file changes after a session, resume, and catch the
agent reasoning over stale tool results; then do it right — fresh session with
an injected structured summary, plus the variant of informing a resumed
session exactly which files changed. AC: stale-context failure reproduced;
correct decision rule articulated and executed.
Angle: heavily changed files + "resume" in an option = the trap answer.

### Domain 2 · Tool Design & MCP Integration (18%)

**2.1 Tool descriptions as the selection mechanism**
Guided: build `labs/mcp-support-server/` with get_customer & lookup_order
carrying terrible one-line descriptions; fire ambiguous requests until
misrouting appears; fix with rich descriptions (input formats, example
queries, edge cases, "use X when… use Y when…").
Independent: given two new overlapping tools (analyze_content vs
analyze_document), eliminate overlap by renaming + rewriting descriptions, and
audit the system prompt for keyword-sensitive wording that could override
them. AC: misrouting reproduced then eliminated; descriptions contain all four
elements; rename justified.
Angle: escalation ladder — descriptions → few-shot → routing layer →
consolidation. The alternatives aren't wrong, they're disproportionate.

**2.2 Structured error responses**
Guided: isError pattern with payload {errorCategory:
transient|validation|business|permission, isRetryable, description,
attempted, partialResults}.
Independent: implement all four categories plus the subtle fifth case — an
empty result from a valid query returned as SUCCESS, not error. Verify the
agent retries transients only, explains business violations customer-
friendly, never retries retriable:false. AC: differential behavior observed
per category; empty ≠ error.
Angle: generic "Operation failed" hides the recovery decision; silent
suppression and workflow termination are both anti-patterns.

**2.3 Tool distribution & tool_choice**
Guided: overload one agent with 15+ tools and watch selection degrade; scope
each subagent to its 4–5 role tools; then the three tool_choice settings —
"auto" (model's decision), "any" (must call some tool → structured-output
guarantee), forced {"type":"tool","name":…} (pins the first call → ordering).
Independent: the 85/15 pattern — give the synthesis agent one narrow
verify_fact tool for simple lookups while complex verification still routes
through the coordinator. AC: least-privilege tool sets; correct tool_choice
value chosen for three described situations.
Angle: least privilege beats over-provisioning; scoped cross-role tools for
high-frequency needs.

**2.4 MCP server configuration & integration**
Guided: team server in project `.mcp.json` with ${GITHUB_TOKEN}-style
expansion (no literal secret ever committed); personal server in
`~/.claude.json`; confirm both discovered simultaneously and that a same-named
local entry overrides the team's.
Independent: (a) enhance an MCP tool's description until Claude Code prefers
it over built-in Grep for the matching job; (b) expose an MCP resource (e.g.,
a schema/doc catalog) so the agent sees available data without exploratory
calls. AC: no secrets in git; both scopes live; resource visible; preference
shift demonstrated.
Angle: "where does the config go" is the whole question; committed literal
token is always wrong; community servers for standard integrations, custom
for team-specific.

**2.5 Built-in tools**
Guided: drill on victim-app — Grep (content: find all callers of a function),
Glob (paths: `**/*.test.tsx`), Edit (targeted change with unique anchor),
Read+Write fallback when Edit's anchor isn't unique.
Independent: trace a function's usage across wrapper modules (identify
exported names first, then search each); narrate incremental exploration
(Grep entry points → Read to follow imports), not read-everything-upfront.
AC: right tool per job with reasons; fallback executed.
Angle: content vs path vs targeted-edit — know each tool's lane.

### Domain 3 · Claude Code Configuration & Workflows (20%)

**3.1 CLAUDE.md hierarchy** *(do this in a separate sandbox repo — see
CLAUDE.md rule 8)*
Guided: create all three levels (user ~/.claude/CLAUDE.md, project, subdir)
with distinctive markers; run /memory at each location to see what loaded;
add an @import (nests up to 5 levels).
Independent: simulate the trap — put "team standards" in your user file,
clone the sandbox fresh as a "new teammate", watch standards vanish, fix by
moving to project CLAUDE.md, verify with /memory in the clone. AC: /memory
evidence at each level; trap reproduced and fixed.
Angle: "new team member not following conventions" is a hierarchy question,
not a prompting one. /memory is the named verification.

**3.2 Custom commands & skills**
Guided: project command `.claude/commands/review.md` (committed → whole team
gets /review on clone); skill `.claude/skills/deploy-check/SKILL.md` with
frontmatter `context: fork`, `allowed-tools`, `argument-hint`; observe fork
isolation keeping verbose output out of the main session.
Independent: create a personal variant skill in `~/.claude/skills/` under a
different name; then for three given items (universal coding standard,
on-demand deploy procedure, test-file convention) choose CLAUDE.md vs skill
vs rule and justify. AC: frontmatter correct and functional; placement
reasoning matches always-loaded / on-demand / conditionally-loaded.
Angle: CLAUDE.md = how things are (always); skills = what to do (on demand);
rules = conventions by path (conditional).

**3.3 Path-specific rules**
Guided: `.claude/rules/testing.md` with `paths: ["**/*.test.tsx"]` and
`api.md` with `paths: ["src/api/**/*"]`; edit matching vs non-matching files
to confirm conditional loading.
Independent: given conventions that must follow test files spread across the
whole tree, implement with glob rules and explain why per-directory CLAUDE.md
files can't do it. AC: rule loads only on match; justification correct.
Angle: scattered-files conventions → glob rules, not directory CLAUDE.md.

**3.4 Plan mode vs direct execution**
Guided: direct execution on a one-file bug fix with a clear stack trace; plan
mode on a multi-file restructuring (explore → propose → approve → execute);
use the Explore subagent and watch verbose discovery stay out of main context.
Independent: given three task descriptions, choose the mode for each and run
one full plan-mode cycle end-to-end. AC: choices match the rule; plan
executed only after approval.
Angle: complexity stated in the requirements → plan mode NOW; "switch later
if hard" is the trap.

**3.5 Iterative refinement techniques**
Guided: fix an inconsistent transformation with 2–3 concrete input/output
examples; test-driven iteration (write the suite, share failures).
Independent: use the interview pattern (Claude asks questions first) on an
unfamiliar feature; then decide for two multi-issue situations whether to
send one detailed message (interacting fixes) or iterate sequentially
(independent fixes). AC: correct pattern applied per situation.
Angle: examples beat prose; interacting issues travel together.

**3.6 CI/CD integration**
Guided: `claude -p "…" --output-format json --json-schema review-schema.json`
in a script; fresh-instance review (never the session that wrote the code).
Independent: re-review flow — include prior findings and instruct "only new
or still-open issues"; provide existing test files so generation doesn't
duplicate coverage; document testing standards in the sandbox CLAUDE.md. AC:
non-interactive run completes; output validates against the schema; no
duplicate findings on re-run.
Angle: -p or the job hangs; CLAUDE_HEADLESS and --batch don't exist; the
generator reviews itself gently.

### Domain 4 · Prompt Engineering & Structured Output (20%)

**4.1 Explicit criteria over vague instructions**
Guided: run a review prompt with "be conservative, high-confidence only" vs
explicit categorical criteria (report bugs/security; skip minor style; flag a
comment only when it contradicts the code); compare false positives.
Independent: define 3 severity levels each with a concrete code example, and
write the strategy for a noisy category (temporarily disable while improving
its prompt — trust preservation). AC: measurable FP reduction; criteria are
categorical, not confidence adjectives.
Angle: "be conservative" is not a criterion.

**4.2 Few-shot prompting**
Guided: 2–4 targeted examples for ambiguous cases that show the REASONING for
choosing one action over plausible alternatives; format-demonstration
examples (location, issue, severity, fix).
Independent: fix an extraction pipeline returning nulls on unusual document
structures by adding few-shot examples across varied formats. AC: examples
target ambiguity (not the easy cases); consistency measurably improves;
learner explains generalization vs pattern-matching.
Angle: few-shot is for ambiguity and format, and it must show reasoning.

**4.3 Structured output via tool_use + JSON schemas**
Guided: extraction tool whose input schema is the target; force with
tool_choice; read the tool_use block. Then the fabrication demo: mark
vendor_tax_id REQUIRED, feed an invoice without one, watch a plausible value
get invented; fix with nullable; add enum + "other"+detail + "unclear".
Independent: design a schema for a new document type right the first time
(nullable where absence is possible, escape hatches present, normalization
rules in the prompt). AC: no fabrication on absent fields; learner recites
what schemas guarantee (well-formed, required present, zero syntax errors) vs
don't (correct values, reconciling sums, honesty about absence).
Angle: schemas guarantee structure, not truth.

**4.4 Validation, retry, feedback loops**
Guided: Zod validation (Pydantic's role in the guide); on failure resend
document + failed extraction + the SPECIFIC error; prove retries cannot fix
information absent from the source.
Independent: add self-check fields (calculated_total vs stated_total,
conflict_detected boolean, detected_pattern for FP analysis); classify five
described failures as retry-fixable or not. AC: retry loop contains all three
elements; classification correct.
Angle: retry fixes format/structure errors, never absence.

**4.5 Batch processing**
Guided: submit a tiny Message Batches API batch (5 requests), custom_id per
request, poll, resubmit only failures (chunking the oversized one). Lock in:
50% cost savings, up to 24h window, no latency SLA, no multi-turn tool
calling inside a request.
Independent: given four workflows (pre-merge check, overnight debt report,
weekly audit, live chat), assign sync vs batch with SLA arithmetic (e.g.,
submission frequency to guarantee a 30h SLA with 24h processing). AC:
assignments and math correct; sample-first refinement mentioned.
Angle: blocking = synchronous, always. Batch = latency-tolerant only.

**4.6 Multi-instance & multi-pass review**
Guided: single-pass review of a 14-file change → observe attention dilution
and contradictions; restructure as per-file passes + one cross-file
integration pass.
Independent: independent-instance review vs self-review comparison on
generated code; add per-finding self-reported confidence for calibrated
routing — and articulate the boundary: confidence attached to findings for
routing (4.6/5.5, calibrated against labeled data) is legitimate; confidence
as an escalation trigger (5.2) is a rejected proxy. AC: multi-pass output
consistent; independent instance catches something self-review missed;
boundary stated.
Angle: bigger context windows don't fix attention; consensus-of-N suppresses
intermittently-caught real bugs.

### Domain 5 · Context Management & Reliability (15%)

**5.1 Conversation context preservation**
Guided: long multi-issue support run → watch amounts/dates blur through
summarization; fix with a case-facts block re-sent at the top of every
prompt; trim the 40-field order lookup to the ~5 relevant fields BEFORE it
enters context; lost-in-the-middle demo (bury a fact mid-input, then move it
to the top with section headers).
Independent: multi-issue session with a persistent structured issue layer
(order IDs, amounts, statuses) separate from summarized history. AC: exact
figures survive to the final turn; trimming happens pre-context.
Angle: precise facts don't survive summarization — extract them.

**5.2 Escalation & ambiguity resolution**
Guided: add explicit escalation criteria + few-shot to the support agent; the
three triggers (explicit human request → escalate IMMEDIATELY, no
investigation; policy gap/ambiguity → hand over, don't improvise; no
meaningful progress).
Independent: six test messages — explicit human demand, frustrated-but-
solvable (acknowledge + offer resolution, escalate only on reiteration),
policy-gap price match, multiple customer matches (ask for another
identifier, never pick heuristically), plus two resolvable cases — verify
correct behavior on each. AC: all six handled per the rules; no sentiment or
self-confidence routing anywhere.
Angle: sentiment and self-reported confidence are rejected proxies — an
option routing on them is the trap.

**5.3 Error propagation across agents**
Guided: simulate a subagent timeout; propagate structured error context
(failure type, attempted query, partial results, alternatives); coordinator
proceeds with partials and annotates coverage gaps in the final report.
Independent: subagents recover transients locally and propagate only what
they can't resolve; distinguish access failures from valid empty results in
the error report. AC: no silent success, no workflow kill, coverage
annotations present.
Angle: structured context up, never generic statuses.

**5.4 Context in large codebase exploration**
Guided: extended exploration session → scratchpad file recording key
findings, referenced for later questions; Explore/subagent isolation of
verbose discovery; /compact, then ask for an exact earlier figure and
observe the precision loss.
Independent: crash recovery — each agent exports structured state to a known
location (manifest); kill the session; on resume the coordinator loads the
manifest and injects it into agent prompts; also summarize phase N before
spawning phase N+1 subagents. AC: manifest written, reloaded, and provably
used after the "crash"; scratchpad demonstrably consulted.
Angle: /compact's trade-off is precision; context degradation shows up as
"typical patterns" replacing specifics.

**5.5 Human review & confidence calibration**
Guided: model outputs field-level confidence; route low-confidence and
ambiguous/contradictory-source extractions to human review.
Independent: design the monitoring layer — stratified random sampling of
HIGH-confidence extractions for ongoing error measurement and novel-pattern
detection; segment accuracy by document type AND field before automating
anything; explain how a 97% aggregate can hide a failing segment. AC:
sampling plan sound; segmentation done; calibration against a labeled
validation set described.
Angle: aggregate metrics mask segment failures; calibrate before you trust.

**5.6 Provenance & multi-source synthesis**
Guided: subagents output claim-source mappings (claim, excerpt, URL/doc,
publication date); synthesis must preserve them; feed two credible sources
with conflicting statistics → annotate BOTH with attribution, never pick one.
Independent: full synthesis run with attribution surviving to the report;
explicit well-established vs contested sections; dates preventing temporal
differences reading as contradictions; native rendering per content type
(tables for financials, prose for news, lists for technical). AC: every claim
in the report traceable to a source; conflict annotated, not resolved
arbitrarily.
Angle: attribution is lost in summarization unless you force the mapping
through.

---

## Part C · Trap index (name these when grading)
1. Loop decided by text / iteration caps / text presence → stop_reason decides.
2. Misrouting fix ladder skipped → descriptions first, then few-shot, routing
   layer, consolidation.
3. Money/compliance/"still happens occasionally" answered with prompt wording
   → hooks/gates.
4. New teammate missing standards → user-level vs project-level CLAUDE.md.
5. Scattered-file conventions in directory CLAUDE.md → .claude/rules/ globs.
6. Committed literal token → ${ENV_VAR} expansion.
7. CI hang → -p; CLAUDE_HEADLESS / --batch don't exist.
8. Stated complexity deferred → plan mode now.
9. Heavy file changes + resume → fresh session + summary.
10. Required field on absent data → fabrication; nullable is the prevention.
11. Retry expected to conjure absent information.
12. Batch API on a blocking workflow.
13. Sentiment / self-reported confidence as router → rejected proxies.
14. Generic errors, empty-as-success, or killing the workflow.
15. Bigger context window as the fix for attention dilution → multi-pass.
16. Self-review in the generating session → independent instance.
