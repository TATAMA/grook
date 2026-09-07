# 如何填入正確資料（可重複使用）

Grook 是 **LINE Messaging API webhook**（Node）。在新機器、樹莓派、或重裝時照本文件填值。

**真實金鑰只放 `.env` 或主機私密變數。不要貼聊天、不要 commit、不要寫進程式。**

對照檔：根目錄 `.env.example`（只有 `replace_me` 與安全預設）。

本文件**不是** OpenClaw，也**不能**和 Grok Bot 雲主機自動同步。Grok Bot 是另一套產品；這份 repo 要自己 clone、自己填 `.env`、自己跑 process。

## 現在實際會做什麼

群組裡有人 **@Grook**（或 `LINE_BOT_DISPLAY_NAME`）才回，1:1 不回。

| 你打的內容 | Grook 做什麼 | 推進 X 時間窗？ |
| --- | --- | --- |
| `@Grook`（沒有下面關鍵字） | mock 時間軸／跟隨通知整理（**不是**真實 X，`X_PROVIDER=api` 未接） | 會 |
| `@Grook` 且含 `迷因`／`敘事`／`meme`／`narrative` | 迷因敘事報告（見 `docs/meme-narrative.md`） | 不會 |

LINE Notify 已停用。舊 Google Apps Script **不是**這份 Grook。一個 channel **只能一個** Webhook URL。

## 0. 每次重做

在**repo 根目錄**（有 `package.json` 的那層，不要多包一層 `cd grook`）：

```bash
copy .env.example .env          # macOS / Linux：cp .env.example .env
# 打開 .env，只填 §1 的 LINE 三欄；其餘先維持 example
npm install
npm test
npm run typecheck
npm run build
npm run dev                     # 正式：先 build 再 npm start
```

檢查：

- [ ] `git check-ignore -v .env` 有命中
- [ ] `LINE_CHANNEL_SECRET`、`LINE_CHANNEL_ACCESS_TOKEN` 不是 `replace_me`
- [ ] `LINE_BOT_DISPLAY_NAME` 與群組 @ 名稱相同
- [ ] `X_PROVIDER=mock`、`MEME_PROVIDER=mock`（未另開 X API／未要 live 迷因時）
- [ ] LINE Developers Webhook = `https://<公開 HTTPS 主機>/webhook`

## 1. LINE（接真 bot 必填）

[LINE Developers Console](https://developers.line.biz/console/) → Messaging API channel。

| 變數 | 從哪裡複製 | 填法 |
| --- | --- | --- |
| `LINE_CHANNEL_SECRET` | Channel basic → **Channel secret** | 整段貼上，不要引號、不要空白 |
| `LINE_CHANNEL_ACCESS_TOKEN` | Messaging API → **Channel access token** | 長期 token；重發後要改 `.env` 並重啟 process |
| `LINE_BOT_DISPLAY_NAME` | [OA Manager](https://manager.line.biz/) → 設定 → 個人檔案 → **名稱** | 與群組 @ 選單上的名字一致（例如 `Grook`） |

觸發：用 LINE **@ 選單選 bot**，不要只打純文字。

### Webhook（本機或 Pi）

現況是 **本機／Pi 跑 Node + Cloudflare Tunnel**（也可用 ngrok）。不要假設有固定 Railway 網域。

1. `npm run dev`（預設 `http://127.0.0.1:3000`）
2. 另開 tunnel，把 3000 曝成 HTTPS。cloudflared 例：

   ```text
   cloudflared tunnel --url http://127.0.0.1:3000
   ```

   終端會印 `https://….trycloudflare.com`（每次重開會變）。
3. LINE Console 填：`https://<該主機>/webhook`（路徑固定 `/webhook`）
4. **Verify** → 開啟 **Use webhook**
5. Messaging API 允許 bot **加入群組**；把官方帳號加進要測的群

臨時 trycloudflare 網址會過期。要 24 小時再改用**具名 Cloudflare Tunnel** 或 VPS／Railway 固定網域。

本機健康檢查：

```powershell
Invoke-WebRequest http://127.0.0.1:3000/health -UseBasicParsing
# 應為 {"ok":true,"name":"grook"}
```

## 2. X（先不要填真的）

**目前不接官方 X API。** 不要把 Bearer／User Token 當必填。

| 變數 | 現在填 | 說明 |
| --- | --- | --- |
| `X_PROVIDER` | `mock` | `api` 仍是 TODO，設了會在抓時間軸時丟錯 |
| `X_OWNER_HANDLE` | `replace_me` 即可 | 僅影響 mock 報表上的字樣 |
| `X_BEARER_TOKEN` | `replace_me` 即可 | **不夠**讀 home timeline；未實作前填了也不會打 X |

不要用爬蟲或網頁 cookie。

## 3. 迷因敘事

| 變數 | 值 | 說明 |
| --- | --- | --- |
| `MEME_PROVIDER` | `mock` | 假候選，測分流與報告格式（建議） |
| `MEME_PROVIDER` | `live` | DexScreener **公開** HTTPS，免 X credits；敘事仍嚴篩，常為 0 候選 |

群組測試：`@Grook 迷因`

Grok Bot 上若另有**排程**迷因日報，與 LINE 這條按需路徑分開，不要把兩邊 webhook 填成同一個 channel。

## 4. 執行與資料

| 變數 | 預設 | 說明 |
| --- | --- | --- |
| `PORT` | `3000` | 雲端若注入 `PORT`，用平台的值 |
| `DATA_DIR` | `./data` | `last-mention.json`（X 時間窗）。重裝會重置時間窗；雲端請掛持久化磁碟 |

`data/` 已 gitignore。

## 5. 換到另一台機器（含 Grok Bot 雲主機）

Grok Bot 雲電腦**不會**自動帶入這份 `.env`。在那台上：

1. clone `https://github.com/TATAMA/grook.git`（或同步**不含** `.env` 的程式）
2. `copy .env.example .env`，再填 §1（LINE 三欄從 Console **重新複製**，不要從舊聊天紀錄貼）
3. `X_PROVIDER=mock`、`MEME_PROVIDER=mock`
4. `npm install` → `npm run dev` → Cloudflare Tunnel → LINE 改 Webhook → Verify
5. 測 `@Grook` 與 `@Grook 迷因`

不要把本機 `.env`、`google_webhook_url`、`grook-local-sync/` 拷進 git。

## 6. 不要放進 git

- `.env`、任何真實 token
- `data/`
- `google_webhook_url`、Apps Script `/exec` 真 URL
- `grook-local-sync/`、`*.tgz`
- log、未宣告要公開的圖片

```bash
git status
git check-ignore -v .env data/last-mention.json
```

`.env` 若出現在 `git status`，**不要 add**。

## 7. 最短路徑（現況）

1. clone → `copy .env.example .env`
2. 只填 LINE 三欄（§1）
3. 維持 `X_PROVIDER=mock`、`MEME_PROVIDER=mock`
4. `npm install && npm run dev`
5. Cloudflare Tunnel → Console `/webhook` → Verify
6. 群組 @ 選單選 Grook → 應回 mock 時間軸
7. `@Grook 迷因` → 應回迷因報告格式
