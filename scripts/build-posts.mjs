#!/usr/bin/env node
/*
 * Rebuilds data/posts.json from the one-file-per-article entries in
 * content/articles/.
 *
 * Why this exists: the CMS edits articles as individual entries (a Decap
 * "folder" collection), which is the clear, scannable structure editors
 * expect — each article has its own screen, its own history, and a real
 * "New article" button. But the website itself must NOT depend on listing a
 * directory at runtime: it is a plain static site that has to keep working
 * once it moves off GitHub Pages onto o2switch, with no GitHub API calls and
 * no rate limits. So the folder is the source of truth for editors, and this
 * script flattens it into the single data/posts.json the pages already fetch.
 *
 * Run by .github/workflows/build-articles.yml on every push. Run it by hand
 * with:  node scripts/build-posts.mjs
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'content', 'articles');
const OUT = path.join(ROOT, 'data', 'posts.json');

/* The site renders the date string verbatim, so emit the DD.MM.YYYY the
   design uses. Articles store a real ISO date so they can be sorted. */
function displayDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || ''));
  return m ? `${m[3]}.${m[2]}.${m[1]}` : String(iso || '');
}

/* Order on the site: an explicit "order" number first (1 = first), then
   newest date, then filename — so the result never depends on the order the
   filesystem happens to hand back. */
function compare(a, b) {
  const ao = Number.isFinite(a.order) ? a.order : Infinity;
  const bo = Number.isFinite(b.order) ? b.order : Infinity;
  if (ao !== bo) return ao - bo;
  if (a.date !== b.date) return a.date < b.date ? 1 : -1;
  return a.file < b.file ? -1 : a.file > b.file ? 1 : 0;
}

const FIELDS = ['photo', 'cat_en', 'cat_fr', 'date', 'title_en', 'title_fr', 'body_en', 'body_fr'];

async function main() {
  if (!existsSync(SRC)) {
    console.error(`No ${path.relative(ROOT, SRC)} directory — nothing to build.`);
    process.exit(1);
  }

  const files = (await readdir(SRC)).filter((f) => f.endsWith('.json')).sort();
  const entries = [];

  for (const file of files) {
    const raw = await readFile(path.join(SRC, file), 'utf8');
    let a;
    try {
      a = JSON.parse(raw);
    } catch (err) {
      console.error(`content/articles/${file} is not valid JSON: ${err.message}`);
      process.exit(1);
    }
    if (!a.title_en) {
      console.error(`content/articles/${file} has no title_en — skipping it.`);
      continue;
    }
    entries.push({ ...a, file, order: Number(a.order) });
  }

  entries.sort(compare);

  const items = entries.map((a) => {
    const out = {};
    for (const k of FIELDS) out[k] = k === 'date' ? displayDate(a.date) : a[k] || '';
    return out;
  });

  const json = JSON.stringify({ items }, null, 2) + '\n';
  const prev = existsSync(OUT) ? await readFile(OUT, 'utf8') : '';
  if (prev === json) {
    console.log(`data/posts.json already up to date (${items.length} articles).`);
    return;
  }
  await writeFile(OUT, json, 'utf8');
  console.log(`Wrote data/posts.json — ${items.length} articles.`);
}

main();
