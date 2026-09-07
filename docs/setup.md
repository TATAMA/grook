# 如何填入正確資料（可重複使用）

本文件說明 Grook 在**新機器、雲端、或重裝**時，要填哪些值、從哪裡拿、什麼可以先不填。  
**真實金鑰只放本機／平台的私密環境變數，不要貼到聊天、不要 commit。**

對照檔：根目錄 `.env.example`（只有 `replace_me` 與安全預設）。

## 0. 每次重做的固定步驟

```bash
cd grook
copy .env.example .env          # macOS / Linux：cp .env.example .env
# 用編輯器打開 .env，依下面各節填值
npm install
npm test
npm run typecheck
npm run build
npm run dev                     # 正式環境：npm start（先 build）
```

檢查清單：

- [ ] `.env` 存在且已被 gitignore（`git check-ignore -v .env` 應命中）
- [ ] 沒有把 `.env`、`data/`、同步包、webhook 真 URL 加進 git
- [ ] `LINE_CHANNEL_*` 不是 `replace_me`（要接真 LINE 時）
- [ ] `X_PROVIDER=mock`、`MEME_PROVIDER=mock`（尚未接官方 X API 時）
- [ ] LINE Developers 的 Webhook 是 `https://<公開網域>/webhook`

## 1. LINE（接真 bot 必填）

到 [LINE Developers Console](https://developers.line.biz/console/) → 你的 **Messaging API** channel。

| 變數 | 從哪裡複製 | 填法 |
| --- | --- | --- |
| `LINE_CHANNEL_SECRET` | Channel basic → **Channel secret** | 貼一整段，不要加引號、不要空格 |
| `LINE_CHANNEL_ACCESS_TOKEN` | Messaging API → **Channel access token** | 長期 token；過期就在 Console 重新發行並改 `.env` |
| `LINE_BOT_DISPLAY_NAME` | [LINE Official Account Manager](https://manager.line.biz/) → 設定 → 個人檔案 → **名稱** | 必須和群組裡 @ 出來的名字一致（例如 `Grook`） |

群組觸發：用 LINE 的 **@ 選單選 bot**，不要只打純文字。v1 只回 **群組／多人聊天**，不回 1:1。

Webhook：

1. 本機：`npm run dev` 後用 ngrok 或 cloudflared 把 `http://127.0.0.1:3000` 曝成 HTTPS。
2. Console 填 `https://<公開主機>/webhook`（路徑固定 `/webhook`）。
3. 按 **Verify**，開啟 **Use webhook**。
4. LINE **一個 channel 只能一個 webhook**。填 Grook 就不會打到 Google Apps Script。

驗證本機：

```bash
# 應回 {"ok":true,"name":"grook"}
# Windows PowerShell：
Invoke-WebRequest http://127.0.0.1:3000/health -UseBasicParsing
```

## 2. X 時間軸（目前可先不填真值）

| 變數 | 現階段 | 以後接官方 API 時 |
| --- | --- | --- |
| `X_PROVIDER` | 固定 `mock` | 改 `api`（程式仍是 TODO，改了會在抓料時失敗） |
| `X_OWNER_HANDLE` | 可留 `replace_me` | 你的 X 帳號（可含或不含 `@`） |
| `X_BEARER_TOKEN` | 可留 `replace_me` | **不夠**讀 home timeline；還需要 User Access Token（另開需求再加變數） |

不要用爬蟲或網頁 cookie 當資料來源。

## 3. 迷因敘事（按需）

群組 **@Grook** 且訊息含 `迷因`／`敘事`／`meme`／`narrative` 時走迷因報告（見 `docs/meme-narrative.md`）。

| 變數 | 值 | 說明 |
| --- | --- | --- |
| `MEME_PROVIDER` | `mock`（建議） | 假候選，測分流與報告格式 |
| `MEME_PROVIDER` | `live` | DexScreener **公開** HTTPS；敘事仍嚴篩，常為 0 候選 |

迷因指令**不會**更新「上次成功 @」的 X 時間窗。

## 4. 執行與資料目錄

| 變數 | 預設 | 說明 |
| --- | --- | --- |
| `PORT` | `3000` | 雲端主機若指定 `PORT` 環境變數，沿用平台給的值 |
| `DATA_DIR` | `./data` | 寫入 `last-mention.json`；雲端請掛**持久化磁碟** |

`data/` 已 gitignore。

## 5. 雲端（Railway 等）重複同一套

1. 連這個 GitHub repo。
2. Variables 逐一對照 `.env.example` 的**鍵名**，值用真實的（與本機 `.env` 相同來源）。
3. Build：`npm install && npm run build`；Start：`npm start`。
4. Healthcheck：`GET /health`。
5. LINE Webhook：`https://<平台網域>/webhook`。

不要把本機 `.env` 檔上傳到 repo。

## 6. 不要放進 git 的東西

- `.env`、任何真實 token
- `data/`
- `google_webhook_url`、Apps Script `/exec` 真 URL
- `grook-local-sync/`、`*.tgz`（主機同步包）
- log、個人圖片（除非你明確要當公開資產）

改完 `.env` 後可用：

```bash
git status
git check-ignore -v .env data/last-mention.json
```

`.env` 應顯示被 ignore。若出現在 `git status` 裡，**不要 add**。

## 7. 換機器時的最短路徑

1. clone repo → `copy .env.example .env`
2. 只填三個 LINE 欄位（§1）
3. `X_PROVIDER=mock`、`MEME_PROVIDER=mock`
4. `npm install` → `npm run dev` → 公開 HTTPS → Verify → 群組 @Grook
5. 測迷因：`@Grook 迷因`
