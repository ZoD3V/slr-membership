# Backend Issue Rules & Verification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create `RULES.md` and update `CLAUDE.md` to formalise rules for checking backend issues, verifying APIs, recording test accounts, and maintaining test safety.

**Architecture:** Reference-based integration: `CLAUDE.md` delegates rules enforcement to `RULES.md`.

**Tech Stack:** Plain Markdown parsing.

## Global Constraints
- Absolute paths only.
- Strict 4-space formatting where code is mentioned.

---

### Task 1: Create RULES.md

**Files:**
- Create: `/Users/zero/Projects/slr-membership/RULES.md`

- [ ] **Step 1: Write RULES.md file with the standard validation, signup, login verification rules, and test account logging instructions.**
- [ ] **Step 2: Verify the file exists.**

Run: `ls /Users/zero/Projects/slr-membership/RULES.md`
Expected: `/Users/zero/Projects/slr-membership/RULES.md`

---

### Task 2: Update CLAUDE.md

**Files:**
- Modify: `/Users/zero/Projects/slr-membership/CLAUDE.md`

- [ ] **Step 1: Edit CLAUDE.md to add a delegating section under Engineering Context referencing RULES.md and API verification guidelines.**
- [ ] **Step 2: Verify the changes are correctly formatted.**

Run: `git diff /Users/zero/Projects/slr-membership/CLAUDE.md`
Expected: Diff displays references to RULES.md.
