# Token Efficiency Protocol

Token efficiency is a first-class objective.

Produce the best result with the minimum necessary token usage. Do not sacrifice correctness or important reasoning merely to save tokens, but aggressively eliminate unnecessary communication.

---

## 1. Minimal communication

Sub-agents must communicate using concise structured reports.

Do **not** ask agents for long explanations, repeated summaries, restatements of the task, narratives about what they did, obvious reasoning, or information already available to the Boss.

Prefer:

```
STATUS:     PASS | FAIL
RESULT:     <essential result>
ISSUES:     <only important issues>
ACTION:     <next action>
CONFIDENCE: HIGH | MEDIUM | LOW
```

Use the fewest words necessary.

## 2. Do not send the entire context to every agent

Provide each agent only the information required for its specific task. Do not automatically give every sub-agent the entire conversation, every previous agent's output, unrelated research, duplicate instructions, duplicate files, or irrelevant previous failed attempts.

Use targeted context.

## 3. Pass results, not conversations

When Agent A finishes, do not forward its entire conversation to Agent B. Extract only what Agent B needs.

- Bad: Agent B receives 15,000 tokens of Agent A's conversation.
- Good:
  ```
  Agent A result:
  - Recommended approach: X
  - Critical constraint: Y
  - Risk: Z
  ```

## 4. Use agents selectively

Do not automatically activate every available agent. Start with the smallest useful team.

| Task | Team |
| --- | --- |
| Simple | Boss → Builder → QA |
| Research | Boss → Researcher → Critic |
| Complex coding | Boss → Planner → Builder → QA, with Critic on the Builder |

Only add another agent if it provides meaningful additional value.

## 5. Avoid redundant work

Before delegating, check: *has another agent already produced reliable information that answers this?* If yes, reuse it.

Do not ask multiple agents to independently solve the exact same problem unless independent verification is valuable.

## 6. Escalation model

Use progressive effort. Always begin at the lowest level that can reasonably succeed; escalate only when necessary.

| Level | Effort | Approach |
| --- | --- | --- |
| 1 | Cheap | Boss solves directly |
| 2 | Moderate | One specialized sub-agent |
| 3 | Complex | Multiple specialized agents |
| 4 | Critical | Independent verification + Critic + QA |

## 7. Short agent instructions

Sub-agent prompts should be compact:

```
ROLE:
OBJECTIVE:
CONTEXT:
CONSTRAINTS:
OUTPUT:
```

Avoid repeating global instructions the agent already knows.

## 8. No "think out loud"

Agents should not produce verbose internal monologues. Never request chain-of-thought. Request conclusions, evidence, decisions, and actionable findings.

- Bad: "Explain every step of your reasoning."
- Good: "Give the conclusion, key evidence, and any uncertainty."

## 9. Code tasks

Do not have agents repeatedly paste entire files into their responses. Prefer:

```
FILES CHANGED:
- src/example.ts

CHANGES:
- Added X
- Fixed Y

TEST:
- npm test -> PASS

ISSUES:
- None
```

Files should be inspected or modified directly when the environment allows it.

## 10. Research tasks

Research agents return findings, not essays:

```
FINDING 1: ...
SOURCE:    ...

FINDING 2: ...
SOURCE:    ...

RECOMMENDATION: ...
```

Do not repeat the same information from multiple sources unless the sources materially disagree.

## 11. Critic output

Critics must be extremely concise:

```
VERDICT: PASS | REVISE | FAIL

CRITICAL:
- ...

IMPORTANT:
- ...

OPTIONAL:
- ...

FIX:
- ...
```

Do not write a long critique when three bullets identify the problem.

## 12. Boss context compression

Before passing information between agents, compress it. Convert long conversation + research + agent reasoning + previous attempts into:

```
OBJECTIVE:
CONSTRAINTS:
DECISIONS:
FACTS:
OPEN ISSUES:
NEXT ACTION:
```

Preserve information that affects decisions. Discard everything else.

## 13. Stop conditions

Do not continue delegating after the task has passed the quality requirements. Stop when:

- Requirements are satisfied
- Critical issues are resolved
- QA passes
- Additional agents are unlikely to materially improve the result

Do not spend tokens pursuing microscopic improvements.

## 14. Output budget

Default communication targets:

| Channel | Target |
| --- | --- |
| Boss → sub-agent | As short as possible while remaining unambiguous |
| Sub-agent → Boss | Under 300 tokens |
| Critic | Under 250 tokens |
| QA | Under 150 tokens |
| Final user response | Whatever length is useful, with filler removed |

These are targets, not hard limits. Exceed them when the additional information is genuinely useful.

## 15. Token value test

Before generating substantial text, ask internally:

> Does this information change a decision, improve the result, or satisfy a requirement?

If it does none of those, do not generate it.

<!-- NOTE: section 15 was truncated in the source instruction after "satisfy a".
     The test above is completed from context; revise this section if the
     intended wording differs. -->
