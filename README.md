# content-ops-toolkit

Umbrella for a 5-skill content-marketing automation chain + the **conductor** (`content-ops`) + a **registration wizard**.

📖 **Guide:** https://wolfganghuang0083.github.io/content-ops-toolkit/
🧙 **Setup wizard:** https://wolfganghuang0083.github.io/content-ops-toolkit/setup.html

## The chain
🧬 [content-strategy-starter](https://github.com/wolfganghuang0083/content-strategy-starter) →
🗺️ [content-map-builder](https://github.com/wolfganghuang0083/content-map-builder) →
✍️ [content-pipeline](https://github.com/wolfganghuang0083/content-pipeline) →
📅 [content-schedule](https://github.com/wolfganghuang0083/content-schedule) →
🔗 [internal-linking](https://github.com/wolfganghuang0083/internal-linking)

## This repo adds
- **`SKILL.md`** — `content-ops`, the conductor: reads one per-project config and runs the whole chain (with an auto-publish gate: fact-check OK + internal links 200 + format validation).
- **`setup.html`** — registration wizard: fill once → outputs `project.json` (non-secrets) + `.env` template (secrets stay local, nothing uploaded).
- **`scripts/run_chain.js`** — kicks off cold-start (config → strategy → seed map → manifest).
- **`index.html`** — the hand-holding guide (GitHub Pages).

## Install (all 6 incl. conductor)
```bash
for s in content-strategy-starter content-map-builder content-pipeline content-schedule internal-linking content-ops-toolkit; do
  git clone https://github.com/wolfganghuang0083/$s.git ~/.claude/skills/$s
done
```
Then run the wizard, save the config, and tell Claude: *「用 content-ops 幫 <client> 跑一輪內容自動化」*.

## License
MIT.
