#!/usr/bin/env node
/*
 * Rebuilds the data/*.json files the website fetches, from the one-file-per-
 * item entries in content/.
 *
 * Why this exists: the CMS edits each partner, sector, service, team member
 * and article as its OWN entry, so clicking "Partners" lists the actual
 * partners and clicking one opens just that partner. Decap can only do that
 * with a "folder" collection — one file per item.
 *
 * The website, though, is a plain static site that has to keep working once
 * it moves off GitHub Pages onto o2switch, with no GitHub API calls and no
 * rate limits. A static page cannot list a directory, so it reads one JSON
 * file per section instead. This script is the bridge between the two:
 * content/ is what editors touch, data/ is what the browser fetches.
 *
 * NOTHING under data/ should be edited by hand — the next publish overwrites
 * it. Run by .github/workflows/build-articles.yml on every push; by hand:
 *
 *     node scripts/build-content.mjs            # write
 *     node scripts/build-content.mjs --check    # verify only, no write
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');

/* The site renders the article date verbatim, so emit the DD.MM.YYYY the
   design uses. Articles store a real ISO date so they can be sorted. The
   regex tolerates a full timestamp too, in case Decap ever writes one. */
function displayDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || ''));
  return m ? `${m[3]}.${m[2]}.${m[1]}` : String(iso || '');
}

/* One entry per section. `fields` is the exact shape (and order) the website
   expects to find in each item — anything else in the source file is dropped,
   so a stray CMS field can never leak into the site's data. */
const SECTIONS = [
  {
    src: 'content/map', out: 'data/map.json', label: 'map regions',
    fields: [['region', ''], ['projects', 0]],
  },
  {
    src: 'content/sectors', out: 'data/sectors.json', label: 'sectors',
    fields: [['en', ''], ['fr', ''], ['img', '']],
  },
  {
    src: 'content/services', out: 'data/services.json', label: 'services',
    fields: [['img', ''], ['title_en', ''], ['desc_en', ''], ['body_en', ''], ['focus_en', []],
             ['title_fr', ''], ['desc_fr', ''], ['body_fr', ''], ['focus_fr', []]],
  },
  {
    src: 'content/partners', out: 'data/partners.json', label: 'partners',
    fields: [['name', ''], ['logo', '']],
  },
  {
    src: 'content/team-homepage', out: 'data/team_home.json', label: 'team (homepage strip)',
    fields: [['name', ''], ['photo', ''], ['role_en', ''], ['role_fr', '']],
  },
  {
    src: 'content/team-roster', out: 'data/team.json', label: 'team (full roster)',
    fields: [['name', ''], ['photo', ''], ['group_en', ''], ['group_fr', ''], ['role_en', ''], ['role_fr', '']],
  },
  {
    src: 'content/articles', out: 'data/posts.json', label: 'articles',
    fields: [['photo', ''], ['cat_en', ''], ['cat_fr', ''], ['date', ''],
             ['title_en', ''], ['title_fr', ''], ['body_en', ''], ['body_fr', '']],
    transform: (item) => ({ ...item, date: displayDate(item.date) }),
  },
];

/* Order on the site: the explicit "order" number first (1 shows first), then
   newest date where there is one, then filename — so the result never
   depends on the order the filesystem happens to hand back. */
function compare(a, b) {
  const ao = Number.isFinite(a._order) ? a._order : Infinity;
  const bo = Number.isFinite(b._order) ? b._order : Infinity;
  if (ao !== bo) return ao - bo;
  const ad = String(a.date || ''), bd = String(b.date || '');
  if (ad !== bd) return ad < bd ? 1 : -1;
  return a._file < b._file ? -1 : a._file > b._file ? 1 : 0;
}

let failed = false, changed = 0;

for (const s of SECTIONS) {
  const dir = path.join(ROOT, s.src);
  if (!existsSync(dir)) {
    console.error(`!! missing ${s.src} — cannot build ${s.out}`);
    failed = true;
    continue;
  }

  const files = (await readdir(dir)).filter((f) => f.endsWith('.json')).sort();
  const entries = [];

  for (const file of files) {
    let a;
    try {
      a = JSON.parse(await readFile(path.join(dir, file), 'utf8'));
    } catch (err) {
      console.error(`!! ${s.src}/${file} is not valid JSON: ${err.message}`);
      failed = true;
      continue;
    }
    entries.push({ ...a, _file: file, _order: Number(a.order) });
  }

  if (failed) continue;
  entries.sort(compare);

  const items = entries.map((a) => {
    let item = {};
    for (const [k, dflt] of s.fields) item[k] = a[k] === undefined || a[k] === null ? dflt : a[k];
    return s.transform ? s.transform(item) : item;
  });

  const json = JSON.stringify({ items }, null, 2) + '\n';
  const outPath = path.join(ROOT, s.out);
  const prev = existsSync(outPath) ? await readFile(outPath, 'utf8') : '';

  if (prev === json) {
    console.log(`   ok  ${s.out.padEnd(22)} ${String(items.length).padStart(2)} ${s.label}`);
  } else if (CHECK) {
    console.error(`!! ${s.out} is out of date — run: node scripts/build-content.mjs`);
    failed = true;
  } else {
    await writeFile(outPath, json, 'utf8');
    console.log(`  new  ${s.out.padEnd(22)} ${String(items.length).padStart(2)} ${s.label}`);
    changed++;
  }
}

if (failed) process.exit(1);
console.log(changed ? `\n${changed} file(s) rewritten.` : '\nEverything already up to date.');
