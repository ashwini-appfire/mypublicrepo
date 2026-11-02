# Jira source — manual payload notes

Use a **dev Jira** project. Create issues (or edit summaries) so text fields contain the standard payloads from `payload-strings.json`.

## Suggested JQL

```text
project = YOURKEY AND summary ~ "ATV-XSS-TEST"
```

Create issues with summaries:

1. `<img src=x onerror="console.log('ATV-XSS')">`
2. `<svg onload="console.log('ATV-XSS')">`
3. `"><script>console.log('ATV-XSS')</script>`

Configure ATV **Jira** connector with that JQL and map columns that surface **Summary** (and Key if you test link rendering).

## Issue key / browse URL checks

| Check | How |
|-------|-----|
| Normal key link | Open issue from table; tab should not run `ATV-XSS` |
| `javascript:` in URL-like cell | If Jira returns a custom field with `javascript:console.log('ATV-XSS')`, cell should show literal text or a safe link — not execute script |
| `rel="noopener noreferrer"` | Inspect issue key anchor in DevTools → Elements |

Vitest coverage: `src/advanced-table-viewer/common/components/jira/JiraTableCell.test.tsx`.
