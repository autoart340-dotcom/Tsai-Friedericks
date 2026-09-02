---
name: boss
description: Run the full Boss Agent orchestration loop on a substantial task — build an outcome spec, delegate to specialists with explicit briefs, red-team the result, and verify against quality gates before delivering. Use when a task is large or high-stakes enough to warrant planning and independent challenge rather than direct execution, or when the user invokes /boss by name. Do not use for straightforward tasks that should just be done.
---

# Boss orchestration loop

The *principles* governing this repo live in `CLAUDE.md` and are always in effect. This skill is the **procedure** only — the mechanics of running the loop. Do not restate the principles here; read `CLAUDE.md` for them.

## When to run this

Run the full loop when at least two are true:

- The task has multiple substantially different valid approaches
- Getting it wrong is expensive or hard to reverse
- It spans enough surface area that one pass will miss something
- The user's stated wording and probable objective may diverge

If none apply, do the task directly. Invoking this skill on a small task is the failure mode described in `CLAUDE.md` §12.

## Step 1 — Outcome spec

Before delegating anything, write a short internal spec (not shown to the user unless asked):

```
OBJECTIVE:      what the user actually wants to be true when this is done
NOT IN SCOPE:   what they explicitly do not want, or plainly do not care about
CONSTRAINTS:    hard limits — technical, stylistic, time, compatibility
SUCCESS:        the observable test that decides whether this succeeded
RISKS:          the assumptions that would be expensive to get wrong
```

If `OBJECTIVE` and `SUCCESS` cannot be written without guessing between materially different outcomes, ask one concise clarification question before continuing.

## Step 2 — Decide the roster

Pick the smallest set of specialists that can reliably produce an excellent result. Justify each one in a sentence to yourself. If you cannot say what a given agent adds that you would otherwise miss, do not create it.

Typical shapes:

| Task shape | Roster |
| --- | --- |
| Unknown territory | Researcher → Builder → Critic |
| Known problem, real stakes | Builder → Critic |
| Contested design decision | two independent Builders → you adjudicate |
| Correctness-critical change | Builder → Red Team → QA |

Run independent agents in parallel in a single message. Run dependent ones in sequence.

## Step 3 — Brief each agent

Every brief includes all six fields. A brief missing any of them is not ready to send.

```
ROLE:             the specialist identity and its posture
OBJECTIVE:        the single thing this agent is to determine or produce
CONTEXT:          the facts it needs — it starts cold and knows nothing
CONSTRAINTS:      what it must not do, change, or assume
EXPECTED OUTPUT:  the exact shape of the deliverable
SUCCESS CRITERIA: how you will judge whether it did the job
```

Never hand an agent a bare restatement of the user's request. Hand it your spec.

## Step 4 — Independent challenge

For decisions that are expensive to reverse, do not let the reviewing agent inherit the building agent's assumptions. Brief the challenger from the *spec*, not from the solution, and ask it to reach its own conclusion before seeing the proposed one.

When agents disagree, diagnose the disagreement. Do not count votes. The usual causes:

- They were given different context (your fault — fix the brief)
- They optimized different objectives (your fault — the spec was ambiguous)
- One of them is simply wrong (verify against primary sources, then discard it)

## Step 5 — Critique

The Critic's brief must permit rejection. Give it the spec and the work, and ask for a verdict of **ACCEPTED** or **REJECTED** with specific, addressable findings — not a general impression.

Discard critic findings that are stylistic noise. Act on findings that touch the spec's `SUCCESS` or `RISKS` lines.

## Step 6 — Verify

Run the quality gates in `CLAUDE.md` §11. Verification means checking the actual artifact — run the tests, read the diff, open the output — not asking an agent whether it believes its own work is good.

If a critical gate fails, revise and re-verify. Stop iterating when the important requirements are met and further passes are unlikely to change the outcome.

## Step 7 — Deliver

Report the result, the decisions that shaped it, the assumptions you made, and the limitations that remain. Keep the internal agent traffic out of the response unless asked for it.
