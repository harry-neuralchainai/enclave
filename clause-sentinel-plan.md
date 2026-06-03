# Clause Sentinel — Plan

> Open-source legal-AI showcase built on **Onyx** (the open-source enterprise RAG platform, github.com/onyx-dot-app/onyx). Portfolio piece for a consulting company specializing in private/self-hosted AI deployments.

This document is self-contained — a fresh Claude session should be able to read this and resume the build with no prior context.

---

## 1. Vision

Build and open-source a **polished legal-AI app**, feature by feature, modeled on the workflow + UI of **LegalOn** (https://www.legalontech.com/). The goal is to **demonstrate consulting capability**, not to ship a full SaaS product.

Each version is a **standalone GitHub release + website blog post**. v0.1 alone is already a credible showcase.

### Audiences
| Audience | Pitch |
|---|---|
| **Small business** (founder, ops, finance) | "Review the NDA and vendor contracts you sign without paying a lawyer for first-pass." |
| **Law firms / in-house legal** | "First-pass contract review your associates would do — with pin-cites, fully self-hosted, no data to OpenAI." |

Same product, two UI modes (a "Founder mode" / "Lawyer mode" toggle).

### Positioning
> *"The open-source alternative to commercial contract-review tools. Self-hosted. Pin-cited. Built on Onyx."*

Comparative reference to LegalOn / Spellbook / Harvey / Hebbia is **fine in blog posts**, **not in the product itself**.

---

## 2. Product name

Working name: **Clause Sentinel**

Alternatives if branding pushes back:
- Counsel.dev
- PaperTrail
- OpenReview

---

## 3. Why this product (not the alternatives)

We considered three legal-AI showcase ideas:

| Idea | Verdict |
|---|---|
| **DealRoom AI** — Hebbia/Harvey-style M&A diligence matrix | Best long-term showcase, but too large for v1. **Becomes v0.5+** of Clause Sentinel naturally. |
| **PrivateBrief** — litigation research + brief drafting | Law-firm-only, no SMB story. Skip. |
| **Clause Sentinel** — contract risk review | ✅ Smallest scope, broadest audience, natural upgrade path to DealRoom AI. |

Clause Sentinel is the **lead-in**; DealRoom AI is the natural v2 once the foundation ships.

---

## 4. UI inspiration: LegalOn

**Confirmed as the primary inspiration** because it has the **broadest surface area** (Review + Playbooks + Assistant + Vault + Matter). Every other product (Spellbook, Harvey, Hebbia) is a subset, so cloning LegalOn naturally absorbs their patterns as sub-features.

The **playbook-driven review** is also the most "obviously legal" feature — chat-with-docs alone looks like every other RAG demo on Twitter.

### LegalOn workflow we're copying
1. Upload `.docx` or PDF → AI scans first- or third-party contract
2. Issues flagged **Low / Medium / High** severity, ordered "critical issues first"
3. For each issue, **playbook-driven redlines** that user can Accept / Skip
4. Edit in Word or web; export `.docx` with track changes

### LegalOn modules we're NOT copying early
- Matter management / CLM workflow → commodity Ironclad territory, not visually striking
- Translate → out of scope

---

## 5. Phased roadmap

Each version = a GitHub release + website blog post.

### v0.1 — **Clause Review** (≈ 2 weeks)
**Smallest visually striking thing. Ships first.**

- Upload `.docx` (PDF support stretch goal)
- Right-side sidebar with severity-ranked **clause cards** (red/amber/green chips)
- Click card → preferred / fallback / current three-block diff
- "Apply suggestion" rewrites the clause in-doc
- One hardcoded **NDA playbook** shipped in repo (YAML)
- All in Onyx web (no Word add-in yet)

### v0.2 — **Citation Popovers + Source Viewer** (1–2 weeks)
- Every AI claim gets a `[n]` chip
- Hover → floating card with filename + page + ±2 lines context
- Click → right-pane PDF viewer scrolled and highlighted
- Reuses Onyx's existing citation pipeline — mostly UI work

### v0.3 — **Playbook Builder** (≈ 3 weeks)
- Editable table UI: rows = clauses, columns = `Preferred Position / Fallback / Walk-Away / Risk Tolerance / Sample Language`
- Plain-text cells, no code
- Excel import/export
- Serializes to YAML on disk (PR-friendly format)
- Plugs into v0.1 reviewer

### v0.4 — **Redline + Track Changes Export** (2–3 weeks)
- Render `ins`/`del` spans in browser, color-coded counterparty vs. yours
- Export `.docx` with proper OOXML revision marks
- **Redline Summary** modal — two-column diff ("Your changes" vs. "Counterparty's changes"), copy-to-clipboard for email

This is the moment it feels like a real legal product.

### v0.5 — **Matrix Grid** (3–4 weeks)
- Hebbia-style: rows = docs from an Onyx project, columns = user prompts, cells = AI answer + citation chip
- Save matrix as template
- Ship templates: **NDA Audit**, **Supplier DD**, **Lease DD**
- Reuses Onyx's chat/agent backbone per-cell
- **This is where Clause Sentinel naturally upgrades into "DealRoom AI"** for M&A buyers

### v0.6 — **Word Add-in** (4–6 weeks, conditional)
- Office.js task pane wrapping v0.1–v0.4 against the same API
- Ship only if earlier versions are landing enterprise meetings — Word add-in is a force multiplier for sales calls

### v0.7+ — opportunistic
- Assistant chat panel (cross-doc Q&A)
- Matter intake forms
- Multi-doc Reports

---

## 6. UI patterns to copy (concrete enough to build)

### Right-side document sidebar (LegalOn / Spellbook / Harvey)
Three vertical sections, anchored sidebar, document scrolls:
- **Top:** issue list with severity chips (red/amber/green pills)
- **Middle:** selected issue detail — preferred position, suggested redline, rationale
- **Bottom:** chat composer

### Severity-ranked clause card
- Clause name
- Severity pill (red/amber/green)
- 1-line summary
- Expand → "Preferred / Fallback / Current" three-block diff
- Accept / Skip buttons

### Citation popover (the universal trust signal)
Small floating card:
- Source filename
- Page number
- ±2 lines of context
- "Open in viewer" link

### Playbook table editor
- Rows = clauses (Indemnification, Limitation of Liability, …)
- Columns = `Preferred Position / Fallback / Walk-Away / Risk Tolerance / Sample Language`
- Plain text cells
- Excel import button

### Inline redline
- `ins`/`del` HTML spans, color-coded counterparty vs. yours
- Export round-trips through `.docx` revision marks (OOXML `w:ins` / `w:del`)

### Matrix grid (Hebbia-style)
- Sticky-header table
- First column = document name with tiny thumbnail
- Other columns = user prompts
- Cell = short answer + `[1]` footnote chip
- Hover chip → right-side PDF viewer scrolled to highlighted span

---

## 7. Tech stack

| Layer | Choice | Reason |
|---|---|---|
| **RAG / search backbone** | Onyx (self-hosted) | The whole point of the showcase |
| **Vector DB** | Vespa (Onyx default) | Hybrid BM25 + vector, ACL-aware |
| **LLM** | Configurable — default to **Claude (Anthropic)** for cloud, **Ollama Llama 3.1** for local | BYO-LLM toggle is part of the showcase |
| **Frontend** | Next.js (matches Onyx's stack) | Reuse Onyx web patterns |
| **PDF / DOCX parsing** | `python-docx`, `pdfplumber` (or Onyx's existing parsers) | Already in Onyx |
| **Redline export** | `python-docx` with revision marks (OOXML `w:ins` / `w:del`) | Standard track-changes round-trip |
| **Deploy** | Docker Compose (v0.1–v0.4), Terraform/Helm later | Cut scope; one-line `make demo` |

---

## 8. Demo data + evaluation

### Demo corpus
- **SEC EDGAR Exhibit 10** material contracts — public, real, voluminous
- Ship ~10 pre-loaded sample NDAs/MSAs in the repo so visitors can click "Try with sample"

### Evaluation benchmark
- **CUAD** (Contract Understanding Atticus Dataset) — 13K expert annotations across 41 clause types on 510 contracts
- Publish CUAD clause-extraction score in the README
- Reusable eval harness across all future versions

### Risk playbook (v0.1 shipped)
- ~20 "red flag" rules as a YAML file in the repo
- Examples:
  - Indemnity cap < 12 months fees
  - Auto-renewal without notice period
  - Governing law = counterparty's home state
  - Unlimited liability for indirect damages
  - Missing data deletion clause
- Easy for community to contribute new rules via PR — drives stars

---

## 9. Two demo flows on the website

Show both audiences in one demo, side by side:

### Flow A — "Founder mode"
> Drop a SaaS vendor MSA. Get back:
> *"⚠️ Auto-renews for 24 months with 90-day notice required.*
> *⚠️ Unlimited liability for your indirect damages.*
> *⚠️ No data deletion clause."*
>
> Plain English, no jargon.

### Flow B — "Lawyer mode"
Same contract, technical view: clause-by-clause deviation report vs. a market-standard playbook, pin-cited to specific paragraphs, exportable as a redline memo.

**One product, two UI modes.** Toggle in the corner.

---

## 10. IP / legal posture

### Safe to copy (idea/expression dichotomy + functionality is not copyrightable)
- General layout patterns (right sidebar, severity chips, three-pane Assistant, doc×prompt grid)
- Workflow steps and feature names that are descriptive/generic: "Review", "Playbook", "Redline", "Benchmarks", "Vault", "Reports", "Matrix"
- Industry terminology: preferred position, fallback position, walk-away, indemnification, LoL cap, MFN, etc.
- Public clause information and any sample language we write ourselves

### Not safe
- LegalOn / Spellbook / Harvey **logos, wordmarks, brand colors, custom icon sets**
- Verbatim marketing copy or screenshots from their sites
- Their attorney-drafted playbook content (write our own — generate with an LLM or crowdsource)
- Product names ("OpenLegalOn" / "OpenSpellbook" — no)
- Distinctive icon glyphs — use Lucide / Heroicons

### Standard OSS-clone posture
Cal.com vs Calendly, Plausible vs Google Analytics, Supabase vs Firebase. Clone the **workflow vocabulary**; build our own visual identity; write our own playbook content; never use their assets.

---

## 11. README + website framing

### GitHub README
Open with **two screencast GIFs side by side**:
- Founder dropping an NDA on a laptop
- Lawyer reviewing an MSA in technical mode

Subtext: *"Built on Onyx. Runs entirely on your machine. Open source."*

Required README sections:
- Hero GIF
- 30-second pitch
- `make demo` (one-command spin-up with sample contracts, no API key required — defaults to local Ollama)
- CUAD benchmark table
- Architecture diagram (Onyx + Clause Sentinel layer)
- Deployment: Docker Compose now, Terraform/Helm later
- **`/docs/COMPLIANCE.md`** mapping features to ABA Formal Opinion 512 obligations
- Apache 2.0 license

### Website page
Three concrete numbers on the landing page:
1. **CUAD benchmark score**
2. **Deploy time** ("under 60 minutes to your AWS account" — later versions)
3. **Cost comparison** vs. commercial alternatives

Tagline:
> *"Clause Sentinel reviews contracts on your laptop — not OpenAI's servers. Open source. Powered by Onyx. The first in a series of private legal-AI tools."*

The phrase **"first in a series"** sets up DealRoom AI as the announced next chapter.

---

## 12. Onyx capabilities we're showcasing

| Onyx feature | Why legal buyers care |
|---|---|
| Permission-aware indexing (ACL synced into Vespa) | Matter-level ethical walls survive into RAG — the gap vanilla RAG breaks |
| Hybrid BM25 + vector ranking | Exact-phrase matching for citations and defined terms ("Material Adverse Effect", "410 U.S. 113") |
| Citation / source attribution | Every claim has a pin-cite — ABA Op. 512 supervision obligation, anti-*Mata v. Avianca* |
| LLM-native knowledge graph | Visual entity view across a deal corpus (v0.5+) |
| 50+ connectors (SharePoint, Box, Google Drive, S3) | Ingests existing DMS; pitch iManage/NetDocuments as roadmap |
| LiteLLM-based BYO model | In-tenant Azure OpenAI / Bedrock / local Ollama — solves Outside Counsel Guidelines |
| Self-host Docker Compose / Helm | AWS GovCloud, Azure Gov, fully on-prem |

---

## 13. Open questions / decisions for the new session

When the new project session starts, decide:

1. **Final product name** — Clause Sentinel vs. alternatives
2. **Visual identity** — pick a color palette, logo direction, typography (avoid copying LegalOn's blues / Spellbook's purples)
3. **Repo location** — GitHub org/user
4. **Build approach** — fork Onyx and layer on top, or build as a separate app that talks to a vanilla Onyx instance via its API? (Recommendation: **separate app talking to Onyx API** — keeps the showcase clean, doesn't entangle with Onyx maintenance)
5. **Stack for the Clause Sentinel frontend** — fresh Next.js app or embed in Onyx web?
6. **Hosting for the demo site** — Vercel / Cloudflare for marketing site, and a public hosted demo? Or self-hosted-only with a screencast?

---

## 14. First concrete deliverables for v0.1

When build begins, the v0.1 ship list is:

- [ ] Repo scaffolded (Next.js frontend, Python backend, Docker Compose for Onyx)
- [ ] `make demo` works with one command
- [ ] Upload `.docx` endpoint working
- [ ] One NDA playbook (~10–15 rules) in `playbooks/nda.yaml`
- [ ] Right-side sidebar UI with severity chips
- [ ] Clause card component with three-block diff
- [ ] "Apply suggestion" rewrites the clause in-doc
- [ ] CUAD eval harness skeleton
- [ ] README with hero GIF and 30-second pitch
- [ ] `COMPLIANCE.md` draft mapping to ABA Op. 512
- [ ] One website blog post announcing the project + v0.1

---

## 15. Reference links

### Onyx
- Repo: https://github.com/onyx-dot-app/onyx
- Docs: https://docs.onyx.app/
- This Onyx checkout: `/Users/ishwinder/apps/onyx/`

### Competitive landscape (for inspiration, not assets)
- LegalOn (primary): https://www.legalontech.com/ — `/product/review`, `/product/playbooks`, `/word`, `/post/ai-revise-in-microsoft-word`
- Spellbook: https://spellbook.com/ — `/help/articles/12743669-introducing-spellbook-s-new-ui`
- Robin AI: https://www.robinai.com/ — Reports product
- Harvey: https://www.harvey.ai/ — `/platform/vault`, `/blog/the-brief-november-2025`
- Hebbia Matrix: https://www.hebbia.com/ — `/blog/introducing-matrix-the-interface-to-agi`
- Ironclad: https://ironcladapp.com/
- Lexion: https://www.lexion.ai/

### Datasets
- CUAD: https://github.com/TheAtticusProject/cuad
- LEDGAR: https://aclanthology.org/2020.lrec-1.155.pdf
- SEC EDGAR: https://www.sec.gov/edgar
- LegalBench: https://hazyresearch.stanford.edu/legalbench/
- LexGLUE: https://github.com/coastalcph/lex-glue

### Regulatory / ethical references
- ABA Formal Opinion 512 (generative AI for lawyers, July 2024)
- *Mata v. Avianca*, S.D.N.Y. (the hallucination-sanctions canonical case)

---

## 16. Long-term arc

```
v0.1 Clause Review (NDA, single doc)
  → v0.2 Citation popovers
    → v0.3 Playbook Builder
      → v0.4 Redline + .docx export
        → v0.5 Matrix Grid  ──→ becomes "DealRoom AI" for M&A buyers
          → v0.6 Word add-in
            → v0.7+ Assistant chat, multi-doc Reports, …
```

The full long-term destination — a private, self-hosted M&A diligence platform competitive with Harvey/Hebbia — is reachable from this starting point without ever having to throw away early work. **Each step compounds.**
