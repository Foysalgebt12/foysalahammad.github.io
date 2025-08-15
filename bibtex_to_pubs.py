#!/usr/bin/env python3

import re, json, sys, pathlib

def parse_bibtex(text):
    entries = []
    current = {}
    in_entry = False
    for line in text.splitlines():
        if line.strip().startswith('@'):
            if current:
                entries.append(current); current = {}
            in_entry = True
            continue
        if in_entry:
            if line.strip().startswith('}'):
                if current:
                    entries.append(current); current = {}
                in_entry = False
                continue
            m = re.match(r'\s*([a-zA-Z]+)\s*=\s*[{\"](.+?)[}\"]\s*,?\s*$', line)
            if m:
                k, v = m.group(1).lower(), m.group(2).strip()
                current[k] = v
    return entries

def to_pubs(entries):
    pubs = []
    for e in entries:
        title = e.get('title','').strip('{}')
        year = int(re.findall(r'\d{4}', e.get('year','0'))[0]) if e.get('year') else 0
        venue = e.get('journal') or e.get('booktitle') or ''
        doi = e.get('doi') or ''
        keywords = [s.strip() for s in (e.get('keywords','').split(',')) if s.strip()] if e.get('keywords') else []
        pubs.append({'year': year, 'title': title, 'venue': venue, 'doi': f'https://doi.org/{doi}' if doi and not doi.startswith('http') else doi, 'topics': keywords})
    pubs = [p for p in pubs if p['title']]
    pubs.sort(key=lambda x: (-x['year'], x['title'].lower()))
    return pubs

def main():
    if len(sys.argv) < 3:
        print("Usage: bibtex_to_pubs.py input.bib output.json")
        sys.exit(1)
    inp, outp = sys.argv[1], sys.argv[2]
    text = pathlib.Path(inp).read_text(encoding='utf-8')
    entries = parse_bibtex(text)
    pubs = to_pubs(entries)
    pathlib.Path(outp).write_text(json.dumps(pubs, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f"Wrote {len(pubs)} publications to {outp}")

if __name__ == "__main__":
    main()
