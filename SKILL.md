---
name: content-ops
description: 內容運營「總指揮中心」——把 content-strategy-starter → content-map-builder → content-pipeline → content-schedule → internal-linking 串成一條龍，讀同一份「專案設定」自動跑完整個內容行銷流程。當使用者要「幫某客戶/某站從頭跑一輪內容自動化」「一鍵開動整條內容鏈」「批次冷啟動 N 篇」「跑下一批內容」時使用。設定用註冊精靈(setup.html)產生；機密走環境變數。
---

# content-ops（內容運營總指揮）

把五個子 skill 串成一條龍，依**一份專案設定**自動跑：
**🧬 strategy-starter → 🗺️ map-builder → ✍️ pipeline → 📅 schedule → 🔗 internal-linking**。

> 你只要：①跑一次註冊精靈填好專案設定 ②說「用 content-ops 幫 `<客戶>` 跑一輪」。其餘自動。

## 先決：專案設定 + 機密
- **專案設定（非機密）** `~/.config/content-ops/<project>.json`，由 **setup.html 註冊精靈**產生。欄位：
  `project / site_url / cms_base / market / content_map_sheet_id(可空) / automation("auto-publish"|"review") / brief / facts_path`
- **機密走環境變數**（精靈只給 .env 範本，本機填、不外送）：`WP_USER`、`WP_APP_PW`、（用 Google Sheet 才要）`GOOGLE_TOKEN`。
- 第一次：`cp content-pipeline/templates/FACTS.template.md` 成 `FACTS.md` 填好（防編造命脈）。

## 一條龍流程（讀設定後自動執行）
讀 `<project>.json`，依序：

1. **🧬 策略起點**（新站/冷啟動才需要）：用 `content-strategy-starter/generate_strategy.js`（`args.business=brief, market, outPath`）→ 產 persona×場景×標題＋**種子內容地圖**。
2. **🗺️ 排成地圖**：把種子地圖（或既有站）交 `content-map-builder`；有 GSC 匯出就 `prioritize.py` 排「先收割」順序，寫進內容地圖（Sheet 或 Markdown）。
3. **✍️ 逐篇產稿**：對每個「待寫」主題跑 `content-pipeline`（SERP→撰稿+FAQ+**對抗式事實查核**→配圖→建草稿），扣 `facts_path` 的 FACTS 防編造。
4. **🚦 發佈閘門（依 automation 設定）**：
   - `review`：一律建**草稿**，回報你後台預覽、你按發佈。
   - `auto-publish`：**三條件全過才自動 `--status publish`**：(a) 對抗式查核結論＝「可直接發佈」且無紅線；(b) 內部連結全 HTTP 200；(c) publish 驗證 `stray_md=0 & faq_block=True`。**任一不過 → 退草稿並回報**（絕不硬發）。
5. **📅 排程**：未即時發的，用 `content-schedule`（`--sheet-id`，依重要性評分排進空槽、回寫地圖）。
6. **🔗 內鏈**：該叢集都上線後，用 `internal-linking`（只連已上線頁、冪等）把叢集織成主題網。
7. **回寫 + 回報**：更新地圖狀態/post id；回報這輪做了幾篇、發了幾篇、退草稿幾篇與原因。

## 自動跑前段（strategy→草稿批次）
```
Workflow({ scriptPath: '~/.claude/skills/content-ops-toolkit/scripts/run_chain.js',
           args: { project: '<客戶名>' } })   // 讀 ~/.config/content-ops/<客戶名>.json
```
跑完得到「草稿/題庫清單 manifest」；發佈與排程因需 WP 憑證，由 Claude 主流程接著跑各 CLI（見上 4–6 步）。

## 鐵則
- **設定單一來源**：所有站台值讀 `<project>.json`，不散落各處；機密只在環境變數。
- **發佈有閘門**：`auto-publish` 也必須三條件達標；不達標退草稿，不硬發。防編造／FACTS 永遠優先。
- **冪等可重跑**：地圖狀態驅動——已產出的不重做、已上線的內鏈不重插。
- **新客戶建議先 `review` 跑 2–3 篇**確認語氣與事實正確，再切 `auto-publish`。
- 子 skill 各自的鐵則仍適用（FACTS 查核、只連已上線頁、單一行事曆不撞槽…）。

## 工具鏈與安裝
教學頁＋註冊精靈：https://wolfganghuang0083.github.io/content-ops-toolkit/
五個子 skill ＋ 本指揮中心一次裝齊（見教學頁的 clone 指令）。
