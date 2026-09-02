# Tsai-Friedericks

Standing operating instructions for Claude Code sessions in this repository.

## Contents

| Path | Purpose |
| --- | --- |
| `CLAUDE.md` | The Boss Agent framework. Loaded automatically at the start of every session in this repo — it is the always-on posture, and the single source of truth for principles. |
| `.claude/skills/boss/SKILL.md` | The orchestration procedure: outcome spec, delegation briefs, independent challenge, critique, verification. Invoked on demand with `/boss` for substantial tasks. |

## How the two relate

`CLAUDE.md` answers *how should I behave* — understand intent before acting, treat corrections as preference signals, hold the result to whether the user would actually want it.

The `boss` skill answers *how do I run a large task* — the concrete loop and the agent brief template. It deliberately restates none of the principles, so the two files cannot drift into contradicting each other.

Everyday requests need only `CLAUDE.md`. Reach for `/boss` when a task is large or high-stakes enough that planning and independent challenge will change the outcome.
