# Working notes — Ophiro Agency landing page simplification

Context for resuming this work in a future session.

## Branch
`claude/ophiro-simplify-add-calculator-fyfx73`

## Goal
User feels the single-page site (`index.html` + `styles.css` + `script.js`) is
too complicated and is having sections trimmed, plus wants an ROI calculator.

## Done and pushed (commit 5634455)
- Removed the "An illustrative customer journey" section (`journey-section`,
  eyebrow "An illustrative customer journey" / h2 "From active search to a
  sales-ready conversation.").
- Removed the "Designed for better decisions" section (`outcomes-section`,
  eyebrow "Designed for better decisions" / h2 "Improve the quality, speed
  and visibility of direct acquisition.").
- Added a new ROI calculator section (`#calculator`, between the
  qualification/fit section and FAQ), linked in desktop nav + mobile menu as
  "ROI calculator". Fixed assumptions: £100 cost per lead (CPL), £300 cost
  per qualified lead (CPQL). Inputs: monthly ad spend (default £5,000),
  average customer revenue. Outputs (live via `script.js`): leads generated
  (spend ÷ CPL), qualified leads (spend ÷ CPQL), estimated revenue
  (qualified leads × avg customer revenue), return on ad spend
  (revenue ÷ spend). Assumes each qualified lead has the potential to
  convert into a customer — stated explicitly as an assumption in a
  disclaimer note under the calculator, matching the site's existing
  "outcomes vary, no guarantees" tone.
- Removed now-unused CSS for the two deleted sections and added matching
  `.calculator-*` CSS (desktop + mobile breakpoints).
- Verified with a headless Playwright screenshot (desktop 1280px and
  mobile viewports) that the calculator renders correctly and the maths
  checks out (e.g. £5,000 spend / £2,500 avg revenue → 50 leads, 16.7
  qualified leads, £41,667 revenue, 8.3x ROAS).

## Requested next (not yet applied — was interrupted mid-edit)
User asked to also remove two more sections:
1. **`process-section`** (`id="process"`) — eyebrow "From first
   conversation to optimisation" / h2 "A structured route to a connected
   system." Currently at index.html around line 264-278 (line numbers will
   shift after edits). Contains the 5-step `.process-list`
   (Understand/Architect/Connect/Validate/Improve).
2. **`difference-section`** (`id="difference"`) — eyebrow "The difference is
   the scope" / h2 "Campaigns connected to the infrastructure around them."
   Currently at index.html around line 222-245. Contains the
   `.comparison-wrap` / `.comparison-table` (PPC freelancer / generalist
   agency / lead seller / Ophiro comparison) and `.table-note`.

### Cleanup required when removing these
Both sections are linked from navigation, so removing the sections alone
would leave broken anchors:
- Desktop nav (`.desktop-nav`, ~line 22-28): `<a href="#process">How it
  works</a>` and `<a href="#difference">Why Ophiro</a>`.
- Mobile menu (`.mobile-menu`, ~line 35-42): same two links.
- Footer links (`.footer-links`, ~line 380): `<a href="#process">Process</a>`
  (note: footer does not link to `#difference`).

Plan: delete the two `<section>` blocks, remove the four now-dead nav/footer
anchors above, and remove the associated now-unused CSS in `styles.css`
(`.difference-section`, `.comparison-wrap`, `.comparison-table` and its
descendants, `.table-note`, `.process-list`, `.process-item` and
descendants), including any references to these classes inside the
`@media` breakpoints (search for `.comparison-wrap`, `.process-list`,
`.process-item` in the max-width:1020px and max-width:760px blocks).

Not yet committed or pushed — resume by re-reading current `index.html`
(section markers may have shifted from the line numbers above) before
editing.

## Notes
- No PR has been opened for this branch; only push when asked, and don't
  create a PR unless explicitly requested.
- Delete this file (or trim it) once the branch's work is finished and
  merged — it's a scratch working note, not permanent project docs.
