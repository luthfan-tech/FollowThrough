# FollowThrough ⚡

> **“Meetings create decisions. FollowThrough makes sure they get executed.”**

**FollowThrough** is an autonomous, human-in-the-loop Agentic AI execution platform built for the **Agentic AI Hackathon** (Problem Statement: *Meeting-to-execution agent*).

Unlike conventional meeting tools that merely generate passive summaries, bulleted lists, or raw chat transcripts, FollowThrough is an **execution agent**. It attributes speakers, extracts ratified decisions and actionable deliverables, cross-checks persistent organizational memory with its **Conflict Radar** to prevent contradictions and teammate overload, enforces a mandatory human confirmation gate, dispatches verified tasks into tracking systems, schedules proactive reminders, and generates personalized weekly digests.

---

## 🎯 What Problem It Solves & Who It Helps

### The Problem: The Consensus-to-Execution Chasm
Modern high-velocity engineering, product, and leadership teams spend hours in syncs, architecture reviews, and sprint planning. However:
1. **Consensus Evaporates**: Decisions ratified in meetings are buried in 10-page text documents or lost in Slack channels.
2. **Prior Architectural Commitments Are Forgotten**: A team standardizes on an identity provider or backward compatibility policy in March, only to accidentally reverse it in a June sprint because nobody remembered the prior Architecture Decision Record (ADR).
3. **Tasks Lack Clear Accountability**: Action items are recorded without specific directly-responsible individuals (DRIs) or realistic deadlines.
4. **Autonomous AI Agents Cause Chaos**: Black-box agents that write directly to Jira, Linear, or GitHub without human sign-off create duplicate work, notify wrong stakeholders, and trigger operational regressions.

### Who It Helps
- **Engineering Leads & Technical Program Managers**: Guarantees architectural decisions (ADRs) are systematically remembered and enforced across meetings.
- **Product Managers & Sprint Planners**: Catches deadline collisions, unassigned deliverables, and developer capacity overload before sprint commit.
- **Cross-Functional Team Members**: Delivers tailored weekly execution digests so individuals see only the tasks, deadlines, and policy changes that directly affect them.

---

## ⚖️ What the AI Does vs. What Ordinary Application Logic Does

To ensure transparency, reliability, and security, FollowThrough strictly demarcates between non-deterministic probabilistic intelligence and deterministic governance logic:

| Functional Layer | What the AI Does (LLM Inference) | What Ordinary Application Logic Does (Deterministic Code) |
| :--- | :--- | :--- |
| **Ingestion & Normalization** | Semantic understanding of informal conversational idioms. | Regex tokenization of timestamps (`[01:23]`), speaker prefix matching, and whitespace sanitization. |
| **Speaker Attribution** | Identifies speaking turns and infers technical roles from conversational context. | Speaker pattern parsing (`Name: statement`), confidence scoring, and strict unresolved fallback handling. |
| **Artifact Extraction** | Contextual extraction of ratified decisions, action items, risks, and open questions into strict JSON schemas. | Deduplication, ID generation, entity relationship binding, and dynamic regex fallback parsing if AI APIs are unavailable. |
| **Memory & Conflict Radar** | Contextual semantic contradiction analysis between new proposals and past decisions. | BM25/keyword indexing, tokenization, stop-word filtering, numerical deadline comparison (<24h velocity traps), duplicate task lookup, and DRI overload aggregation. |
| **Execution Scoring** | Generates contextual qualitative risk commentary and actionable recommendations. | Strict 0–100 mathematical scoring formula based on Decision Clarity (25), Ownership DRI (25), Deadline Precision (25), and Risk Deductions. |
| **Governance & Dispatch** | Formulates suggested task descriptions and weekly executive pulse summaries. | **Mandatory Human-in-the-Loop Confirmation Gate**, approval state persistence, automatic invalidation of approval when content is edited, idempotent reminder scheduling, and REST API dispatch. |

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Ingestion["1. Ingestion & Diarization"]
        A[Raw Transcript / File Ingestion] --> B[Speaker Attribution & Role Inference]
    end

    subgraph Extraction["2. Structured Agent Extraction"]
        B --> C[Decisions & Action Items Extraction]
        C --> D[Confidence & Context Scoring]
    end

    subgraph MemoryConflict["3. Memory & Conflict Radar"]
        D --> E[(Persistent Organizational Memory)]
        E <--> F[Memory Retrieval Engine]
        F --> G[Conflict Radar Contradiction Check]
        G --> H{Conflict Types}
        H -->|Contradiction| H1[Violates Prior ADR/Policy]
        H -->|Milestone Breach| H2[Unilateral Date Slip]
        H -->|Missing Owner| H3[High Priority with No DRI]
        H -->|Velocity Trap| H4[Unrealistic <24h Deadline]
        H -->|Duplicate Task| H5[Redundant Deliverable]
        H -->|Overload| H6[Assignee Capacity Collision]
    end

    subgraph Scoring["4. Execution Scoring"]
        G --> I[Execution Score Engine 0-100]
        I --> J[Clarity + Ownership + Deadlines - Risk Penalty]
    end

    subgraph ConfirmationGate["5. Human-in-the-Loop Gate"]
        J --> K[Interactive Review Screen]
        K -- "Approve / Edit / Defer" --> L[User Confirms Execution]
    end

    subgraph Dispatch["6. Autonomous Execution"]
        L --> M[(Commit to Decision Memory)]
        L --> N[Dispatch to Task Board / Webhook]
        L --> O[Schedule Proactive Reminders]
        L --> P[Generate Personalized Weekly Digests]
    end
```

---

## 🛡️ Enterprise Security & Execution Guarantees

FollowThrough enforces zero-trust execution principles:
1. **Rejected Actions Never Execute**: Action items rejected during review are marked `REJECTED` and strictly excluded from task boards and export payloads.
2. **Approval Bound to Exact Content**: If a user edits an approved action item's title, owner, or deadline, approval is immediately invalidated (`approved: false`, `status: PROPOSED`), requiring re-review before execution.
3. **Idempotent Operations**: Retries and repeated confirmation clicks deduplicate by unique IDs, preventing duplicate external tasks or reminder spam.
4. **Prompt Injection Defense**: All user transcripts are wrapped in `<untrusted_meeting_transcript>` boundaries with strict system prompt overrides instructing the model to treat meeting text as raw data, never as execution instructions.
5. **No Fabricated Owners or Deadlines**: If an action item lacks a clear owner or deadline in the transcript, it remains `Unassigned` and deadline `null`—the agent never hallucinates fake assignees or arbitrary dates.
6. **Honest Error Handling**: If an LLM API key fails, expires, or hits quota, the system logs an honest `WARNING` event explaining the error and switches to the deterministic parser fallback rather than faking live LLM success.
7. **OWASP Secret Safety**: All API keys reside exclusively in server-side environment variables (`process.env.GEMINI_API_KEY` / `OPENAI_API_KEY`) and are never exposed in browser bundles or client responses.

---

## 📋 Implemented Features vs. Known Limitations

### Implemented Features
- **Transcript Ingestion**: Multi-speaker text paste or `.txt`/`.md` document upload with automatic turnaround parsing.
- **Speaker Attribution**: Regex and turn-prefix extraction mapping speakers to organizational roles.
- **Dual Extraction Engine**: Live Google Gemini / OpenAI GPT-4o JSON structured output, with dynamic deterministic fallback.
- **Persistent Decision Memory**: ACID JSON-backed store (`data/database.json`) retaining ratified ADRs across sessions and server restarts.
- **Conflict Radar**: 6-vector analysis identifying policy contradictions, milestone slippage, missing DRIs, unrealistic turnaround times (<24h), duplicate tasks, and assignee overload.
- **Execution Score (0–100)**: Quantitative scoring of decision clarity, DRI coverage, deadline precision, and conflict risks.
- **Human-in-the-Loop Confirmation Gate**: Sticky approval board requiring manual toggling and confirmation before committing actions.
- **Confirmed Task Board**: Filterable Kanban and list views with status lifecycle transitions (`PROPOSED` → `APPROVED` → `IN_PROGRESS` → `COMPLETED` → `OVERDUE`).
- **Proactive Deadline Reminders**: Automatic 24-hour pre-deadline alert calculations with REST API endpoints (`/api/reminders`).
- **Per-Person Weekly Digests**: Tailored briefings aggregating due tasks, overdue blockers, relevant policy decisions, and conflict warnings with one-click Markdown copy for Slack/Email.
- **Responsive Theme**: Clean Paper White (`#FFFFFF`) with Dark Azure (`#00638E`) and Deep Azure (`#004A6B`) typography.

### Known Limitations
- **External Webhook Dispatch**: FollowThrough generates verified REST/Webhook JSON schemas for Linear and Notion. Direct cloud writes require connecting your team's webhook or OAuth token.
- **Audio File Transcription**: FollowThrough processes text transcripts from Zoom, Meet, Teams, Whisper, or Otter. Direct raw audio ingestion requires pre-processing via Whisper or transcription services.
- **Multi-Tenant Authorization**: Designed for single-team/workspace deployment. Multi-tenant enterprise SSO (SAML/Okta) is slated for enterprise release.

---

## 🚀 Setup & Credentials

### Prerequisites
- Node.js 18+ (tested on Node v20 & v22 LTS)
- npm or yarn

### 1. Clone & Install
```bash
git clone https://github.com/luthfan-tech/FollowThrough.git
cd FollowThrough
npm install
```

### 2. Configure Environment (Optional)
To use live Google Gemini or OpenAI models, create a `.env.local` file in the project root:
```env
GEMINI_API_KEY=your_gemini_api_key_here
# Optional OpenAI fallback:
OPENAI_API_KEY=your_openai_api_key_here
```
*(Note: If no API keys are provided, FollowThrough automatically runs on its built-in deterministic heuristic agent, allowing 100% offline hackathon judging without rate limits or external dependencies).*

### 3. Build & Run
```bash
# Build production bundle
npm run build

# Start production server
npm run start
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## ⏱️ Reproducible 3-Minute Demo Walkthrough

### Step 1: Ingest First Meeting (1:00)
1. Navigate to **[http://localhost:3000/meetings/new](http://localhost:3000/meetings/new)**.
2. Enter Title: `Mobile Infrastructure Sync`.
3. Paste the following transcript:
   ```text
   Elena: We agreed to standardize on Tailwind CSS as our official frontend standard.
   Marcus: I will document the design tokens and component migration by Friday.
   Dev Priya: Alex, can you review the authentication flow?
   Alex: I will review the authentication flow by next Wednesday.
   ```
4. Click **Run FollowThrough Agent Pipeline**.
5. Observe the autonomous activity timeline trace, the attributed speakers (Elena, Marcus, Dev Priya, Alex), the extracted decisions, and the staged action items.
6. Click **Confirm & Execute Approved Actions** to commit the decision to persistent memory.

### Step 2: Test Conflict Radar Contradiction (1:00)
1. Navigate to **[http://localhost:3000/meetings/new](http://localhost:3000/meetings/new)**.
2. Enter Title: `Frontend Architecture Refactor`.
3. Paste a transcript that contradicts the prior agreement:
   ```text
   Carlos: We agreed to drop Tailwind CSS and replace with Bootstrap across all services.
   Jordan: Someone needs to handle the rewrite overnight.
   ```
4. Click **Run FollowThrough Agent Pipeline**.
5. Watch the **Conflict Radar** fire:
   - **`[HIGH] CONTRADICTION`**: Explains that dropping Tailwind CSS reverses the ratified decision from `Mobile Infrastructure Sync`.
   - **`[MEDIUM] MISSING_OWNER`**: Flags that the rewrite task was assigned vaguely to "someone" with no DRI.
6. Toggle the contradictory decision to **Rejected** and confirm the safe items.

### Step 3: Verify Task Board & Weekly Digest (1:00)
1. Navigate to **[Task Board](http://localhost:3000/tasks)**: Notice verified tasks in their respective Kanban columns. Test editing a task title and observe that the approval status automatically resets to `PROPOSED` for safety.
2. Navigate to **[Weekly Digest](http://localhost:3000/digest)**: Select `Marcus` or `Alex` to inspect personalized briefings. Click **Copy for Slack / Email** to copy the formatted Markdown briefing.

---

## 🤝 Human Contribution & Antigravity Assistance

- **Human Architect**:
  - Conceived the core problem statement: eliminating consensus evaporation and enforcing post-meeting execution.
  - Defined the 6-class conflict taxonomy and the Human-in-the-Loop Confirmation Gate specification.
  - Curated the visual design language: Paper White palette, Dark Azure branding, and clothesline card architecture.
  - Provided ongoing domain guidance on enterprise engineering review workflows.

- **Antigravity AI Assistant**:
  - Implemented the full-stack Next.js 14 App Router codebase, typed API route handlers, and SQLite/JSON persistence layer.
  - Developed the speaker attribution regex engine and the dual-mode extraction pipeline (Gemini + Deterministic fallback).
  - Built the multi-factor execution scoring engine and the Conflict Radar semantic matcher.
  - Hardened enterprise security: implemented untrusted transcript framing, content-bound approval invalidation, and Windows file-lock synchronization.
