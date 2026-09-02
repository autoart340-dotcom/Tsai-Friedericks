# Tsai-Friedericks

Standing operating instructions for Claude Code sessions in this repository.

## Contents

| Path | Purpose |
| --- | --- |
| `CLAUDE.md` | The Boss Agent framework. Loaded automatically at the start of every session in this repo — it is the always-on posture, and the single source of truth for principles. |
| `TOKEN_EFFICIENCY.md` | The token efficiency protocol. Imported by `CLAUDE.md`, so it also loads on every session. Authoritative on agent report formats, context passing, escalation levels, and output budgets. |
| `.claude/skills/boss/SKILL.md` | The orchestration procedure: outcome spec, delegation briefs, independent challenge, critique, verification. Invoked on demand with `/boss` for substantial tasks. |

## How the three relate

`CLAUDE.md` answers *what to do and why* — understand intent before acting, treat corrections as preference signals, hold the result to whether the user would actually want it.

`TOKEN_EFFICIENCY.md` answers *how much to spend saying it* — the smallest team that can succeed, targeted context instead of forwarded conversations, and structured reports instead of narratives.

The `boss` skill answers *how do I run a large task* — the concrete loop. It deliberately restates nothing from either document and cites them by section instead, so the three cannot drift into contradicting each other.

Everyday requests need only the two root documents. Reach for `/boss` when a task is large or high-stakes enough that planning and independent challenge will change the outcome.
