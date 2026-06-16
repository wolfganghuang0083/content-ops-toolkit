export const meta = {
  name: 'content-ops-run-chain',
  description: '讀專案設定 → 冷啟動跑 content-strategy-starter 產種子地圖 → 回傳 manifest(後續 pipeline/發佈/排程/內鏈由主流程依 SOP 接手，因需 WP 憑證)',
  phases: [{ title: 'LoadConfig' }, { title: 'Strategy' }],
}

// 用 scriptPath 呼叫時 args 可能被字串化 → 先 parse
let A = args
if (typeof A === 'string') { try { A = JSON.parse(A) } catch (e) { A = {} } }
A = A || {}
const PROJECT = A.project || ''
const COLD_START = A.coldStart !== false   // 預設冷啟動(產策略)；既有站可傳 coldStart:false
if (!PROJECT && !A.config) { log('⚠️ 需要 args.project（讀 ~/.config/content-ops/<project>.json）或 args.config'); return { error: 'no project/config' } }

phase('LoadConfig')
const CONF_SCHEMA = {
  type: 'object',
  properties: {
    ok: { type: 'boolean' },
    config: { type: 'object', properties: {
      project: { type: 'string' }, site_url: { type: 'string' }, cms_base: { type: 'string' },
      market: { type: 'string' }, content_map_sheet_id: { type: 'string' },
      automation: { type: 'string' }, facts_path: { type: 'string' }, brief: { type: 'string' },
    } },
    note: { type: 'string' },
  },
  required: ['ok'],
}
const loaded = A.config
  ? { ok: true, config: A.config }
  : await agent(
      `用 Read 工具讀檔：~/.config/content-ops/${PROJECT}.json（由註冊精靈 setup.html 產生的專案設定）。` +
      `把內容 parse 成物件回傳 config。讀不到就 ok:false 並在 note 說明（提示使用者先跑註冊精靈）。`,
      { label: `load:${PROJECT}`, phase: 'LoadConfig', schema: CONF_SCHEMA }
    )
if (!loaded || !loaded.ok || !loaded.config) { log('讀設定失敗：' + (loaded && loaded.note || '')); return loaded || { error: 'load failed' } }
const cfg = loaded.config
log(`設定載入：${cfg.project} | ${cfg.site_url} | automation=${cfg.automation}`)

let strategyPath = null
if (COLD_START && cfg.brief) {
  phase('Strategy')
  const out = `/tmp/strategy_${cfg.project}.md`
  log('冷啟動：跑 content-strategy-starter 產種子內容地圖…')
  await workflow({ scriptPath: '~/.claude/skills/content-strategy-starter/scripts/generate_strategy.js' },
    { business: cfg.brief, market: cfg.market || '台灣繁體中文', personas: 5, scenariosEach: 5, outPath: out })
  strategyPath = out
}

return {
  ok: true,
  project: cfg.project,
  config: cfg,
  strategyPath,
  next: [
    strategyPath ? `① 已產種子地圖 → ${strategyPath}；把「🌱 種子內容地圖」貼進 content-map-builder 排優先序` : '① 既有站：用 content-map-builder + prioritize.py(GSC) 排地圖',
    '② 逐個「待寫」主題跑 content-pipeline（撰稿+對抗式查核+配圖→草稿）',
    `③ 發佈閘門(automation=${cfg.automation})：${cfg.automation === 'auto-publish' ? '三條件達標(查核OK+內鏈200+stray_md=0&faq_block)才自動發佈，否則退草稿' : '一律建草稿，待使用者核可'}`,
    '④ content-schedule 依重要性排程（--sheet-id ' + (cfg.content_map_sheet_id || '<地圖SheetID>') + '）',
    '⑤ 叢集上線後 internal-linking 織主題網',
  ],
}
