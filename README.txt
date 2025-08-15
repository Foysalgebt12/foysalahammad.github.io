# Foysal site (GitHub Pages ready)

## Import full Google Scholar list into `assets/pubs.json`
1. Go to Google Scholar → Profile → **Export** → **BibTeX** (select all items).
2. Save as `foysal.bib` locally.
3. Run the converter:
   ```bash
   python3 assets/bibtex_to_pubs.py foysall.bib assets/pubs.json
   ```
4. Commit the updated `assets/pubs.json` — the Publications page updates automatically.

> Tip: You can re-run the converter any time you add more publications to Scholar.

## Blog & RSS
- Posts live in `assets/posts.json` and HTML files in `/blog/` (one HTML per post).
- The Blog index fetches `posts.json` and renders cards.
- The RSS feed is at `/rss.xml`.

## Deploy on GitHub Pages
- Push all files to your repo root.
- Settings → Pages → Deploy from branch (main) at / (root).
- Your site will be live shortly.

Last updated: 2025-08-15
