#!/usr/bin/env node
/**
 * Generates Excel fixtures for ATV manual XSS / injection testing.
 * Run from repo root:
 *   node docs/security/atv-injection-test-payloads/generate-excel-fixtures.mjs
 *
 * Requires xlsx from the advanced-table-viewer workspace (pnpm install in src/ first).
 */
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFileSync } from 'node:fs';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(
  join(here, '../../../src/advanced-table-viewer/package.json')
);
const XLSX = require('xlsx');

const IMG = `<img src=x onerror="console.log('ATV-XSS')">`;
const SVG = `<svg onload="console.log('ATV-XSS')">`;
const SCRIPT = `"><script>console.log('ATV-XSS')</script>`;
const JSURL = `javascript:console.log('ATV-XSS')`;
const FORMULA = '=HYPERLINK("x")';
const SHEET_NAME = '<svg onload=x>';

const workbook = XLSX.utils.book_new();
const sheet = XLSX.utils.aoa_to_sheet([
  ['column', 'payload_img', 'payload_svg', 'payload_script', 'payload_js_url', 'formula'],
  [IMG, IMG, SVG, SCRIPT, JSURL, FORMULA],
  ['plain', 'plain', 'plain', 'plain', 'https://example.com', '=1+1'],
]);
XLSX.utils.book_append_sheet(workbook, sheet, SHEET_NAME);

const xlsxPath = join(here, 'attachment-excel-payloads.xlsx');
const xlsPath = join(here, 'attachment-excel-payloads.xls');

writeFileSync(xlsxPath, Buffer.from(XLSX.write(workbook, { type: 'array', bookType: 'xlsx' })));
writeFileSync(xlsPath, Buffer.from(XLSX.write(workbook, { type: 'array', bookType: 'biff8' })));

console.log('Wrote', xlsxPath);
console.log('Wrote', xlsPath);
console.log('Sheet name (also a payload):', SHEET_NAME);
