# ATV injection test payloads (T2 / manual QA)

Harmless payloads for **Advanced Table Viewer** and **Native Table Enhancer**. A test **passes** when:

1. The string `ATV-XSS` **never** appears in the browser console (open DevTools before loading the page).
2. Payloads show as **plain text** in cells, headers, filters, totals, full-screen, and CSV export.
3. No unexpected `<script>`, `<img onerror>`, or `<svg onload>` nodes appear in the DOM (Elements panel).

Automated coverage lives under `src/advanced-table-viewer/**/**/*.test.ts(x)` (search for `ATV-XSS`). This folder is for **manual** Confluence testing and recording pass/fail in the Jira ticket.

## Payload strings (copy/paste)

| ID | Value |
|----|--------|
| **img** | `<img src=x onerror="console.log('ATV-XSS')">` |
| **svg** | `<svg onload="console.log('ATV-XSS')">` |
| **script** | `"><script>console.log('ATV-XSS')</script>` |
| **javascript URL** | `javascript:console.log('ATV-XSS')` |

Same values are in `payload-strings.json`.

---

## Files in this folder

| File | Use |
|------|-----|
| `macro-body-and-attachment.csv` | Macro **body** (CSV), **attachment**, or **URL** (CSV connector) |
| `url-or-profile-json.json` | **URL** or **data profile** (JSON connector); rows path `$.rows` or `$.store.book` |
| `json-nested-proto-object.json` | JSON **`__proto__` object** row (parser should omit nested field, not pollute `Object.prototype`) |
| `attachment-excel-payloads.xlsx` / `.xls` | **Excel** attachment or URL (run generator if missing) |
| `native-table-enhancer-macro-body.html` | **Native Table Enhancer** — paste into macro body (storage format may require editor/source mode) |
| `generate-excel-fixtures.mjs` | Regenerates Excel binaries |

Generate Excel fixtures (after `cd src && pnpm install`):

```bash
node docs/security/atv-injection-test-payloads/generate-excel-fixtures.mjs
```

---

## How to wire each data source

### 1. Macro body (CSV)

1. Create a test page; insert **Advanced Table Viewer**.
2. Data source: **From this page** / body / **CSV** (wording per config UI).
3. Paste the contents of `macro-body-and-attachment.csv` into the macro body table area, **or** attach the file and point the macro at body CSV if your flow uses an on-page table.

### 2. Attachment (CSV / Excel / JSON)

1. Upload `macro-body-and-attachment.csv`, `url-or-profile-json.json`, or the Excel files to the page.
2. Configure ATV: **Attachment** → pick file → connector **CSV**, **Excel** (select sheet `<svg onload=x>`), or **JSON** with rows path `$.rows`.

### 3. URL

1. Host the same files on HTTPS you control (or a test static bucket).
2. ATV: **URL** → same connector types as attachment.
3. Optional: **Data profile** pointing at the same URL (credentials must not be required for the test host).

### 4. JSON rows path

Use `url-or-profile-json.json` (or body JSON if supported).

| Rows path | Expected |
|-----------|----------|
| `$.rows` | Loads; cells contain literal payload text |
| `$.store.book` | Loads second array in file |
| `$..[?(@.constructor)]` | **Rejected** — “Path not found…” (no table from eval) |
| `$.store.book[?(@.price>1)]` | **Rejected** (filter / eval) |

Also test `json-nested-proto-object.json` with path `$` — column `name` only; no prototype pollution.

### 5. Jira (JQL)

Create **test issues** (or use a dev project) where **Summary** or **custom text fields** contain the **img** / **svg** / **script** payloads. Configure ATV **Jira** source with JQL that returns those issues.

Extra checks for **issue key** / browse links:

- Set a payload as **issue key** display value only if your test data allows synthetic rows; otherwise use a normal key and put payloads in **Summary** cells.
- Try a browse URL field or formula that resolves to `javascript:console.log('ATV-XSS')` if your Jira test setup supports it.
- Confirm link uses `rel="noopener noreferrer"` or opens via safe API (see `JiraTableCell`).

### 6. Native Table Enhancer (bodied)

1. Insert **Native Table Enhancer** on a test page.
2. Put table content from `native-table-enhancer-macro-body.html` in the macro body (Confluence editor may normalize HTML — verify rendered source still contains payload **text** in cells).
3. Repeat surface checks (grid, full-screen, export if available).

---

## Surfaces to exercise (each data source)

For each source above, check:

- [ ] Table **cells**
- [ ] **Column headers** (rename column display names to **img** / **svg** / **script** in Manage Columns)
- [ ] **Filter** dropdown labels / values (if payload appears in data)
- [ ] **Totals / grouping** (if enabled)
- [ ] **Full-screen** mode
- [ ] **CSV export** (open file; payloads must stay literal text)
- [ ] **Config dialog preview** (if preview loads live data)

Record results in Jira as: `source × surface → pass | fail`.

---

## Vitest (CI)

```bash
cd src && pnpm --filter at-table-viewer test
```

Key suites: `TableViewer.xss.test.tsx`, `json-parser.test.ts`, `excel-parser.test.ts`, `JiraTableCell.test.tsx`, `adfTableFragmentToCsv.test.ts`.

---

## Related

- `docs/THREAT-MODEL.md` — row **T2**
- Ticket acceptance criteria — link follow-up tickets for unfixed issues
