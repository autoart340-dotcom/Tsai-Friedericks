---
name: boss
description: Run the full Boss Agent orchestration loop on a substantial task — build an outcome spec, delegate to specialists with compact briefs, red-team the result, and verify against quality gates before delivering. Use when a task is large or high-stakes enough to warrant planning and independent challenge rather than direct execution, or when the user invokes /boss by name. Do not use for straightforward tasks that should just be done.
---

# Boss orchestration loop

This skill is the **procedure** only.

- Principles — `CLAUDE.md`
- Communication limits, report formats, escalation levels, output budgets — `TOKEN_EFFICIENCY.md`

Neither is restated here. Read them for those.

## When to run this

Run the full loop when at least two are true:

- The task has multiple substantially different valid approaches
- Getting it wrong is expensive or hard to reverse
- It spans enough surface area that one pass will miss something
- The user's stated wording and probable objective may diverge

If none apply, solve it directly at escalation level 1. Invoking this skill on a small task is the failure mode described in `CLAUDE.md` §12.

## Step 1 — Outcome spec

Before delegating anything, write a short internal spec (not shown to the user unless asked):

```
OBJECTIVE:    what the user actually wants to be true when this is done
NOT IN SCOPE: what they explicitly do not want, or plainly do not care about
CONSTRAINTS:  hard limits — technical, stylistic, time, compatibility
SUCCESS:      the observable test that decides whether this succeeded
RISKS:        the assumptions that would be expensive to get wrong
```

If `OBJECTIVE` and `SUCCESS` cannot be written without guessing between materially different outcomes, ask one concise clarification question before continuing.

This spec is also the compression artifact required by `TOKEN_EFFICIENCY.md` §12 — pass slices of it to agents rather than conversation history.

## Step 2 — Decide the roster

Pick the escalation level per `TOKEN_EFFICIENCY.md` §6, and the team per §4. Justify each agent in a sentence to yourself: if you cannot say what it adds that you would otherwise miss, do not create it.

Run independent agents in parallel in a single message. Run dependent ones in sequence.

## Step 3 — Brief each agent

Use the compact brief from `TOKEN_EFFICIENCY.md` §7:

```
ROLE:
OBJECTIVE:
CONTEXT:
CONSTRAINTS:
OUTPUT:
```

`CONTEXT` gets the relevant slice of the Step 1 spec — the agent starts cold, but does not need the conversation. `OUTPUT` states the deliverable's exact shape; when the bar for acceptance is not obvious from that shape, state it there in one line. Never hand an agent a bare restatement of the user's request.

## Step 4 — Independent challenge

For decisions that are expensive to reverse, do not let the reviewing agent inherit the building agent's assumptions. Brief the challenger from the *spec*, not from the solution, and have it reach its own conclusion before seeing the proposed one.

When agents disagree, diagnose the disagreement — do not count votes. Usual causes:

- They were given different context (your fault — fix the brief)
- They optimized different objectives (your fault — the spec was ambiguous)
- One of them is simply wrong (verify against primary sources, then discard it)

Skip this step below escalation level 4 unless the decision genuinely warrants it.

## Step 5 — Critique

Brief the Critic with the spec and the work, and require the verdict format in `TOKEN_EFFICIENCY.md` §11. The brief must permit `FAIL`.

Act on findings that touch the spec's `SUCCESS` or `RISKS` lines. Discard stylistic noise.

## Step 6 — Verify

Run the quality gates in `CLAUDE.md` §11. Verification means checking the actual artifact — run the tests, read the diff, open the output — not asking an agent whether it believes its own work is good.

If a critical gate fails, revise and re-verify. Stop per `TOKEN_EFFICIENCY.md` §13.

## Step 7 — Deliver

Report the result, the decisions that shaped it, the assumptions made, and the limitations that remain. Keep internal agent traffic out of the response unless asked for it.
